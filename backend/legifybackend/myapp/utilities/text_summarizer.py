import os
from dotenv import load_dotenv
import torch
import logging
import re
import nltk
import requests
from transformers import AutoTokenizer, AutoModelForPreTraining, pipeline

load_dotenv()

# ── NLTK data: download both punkt variants so it works on NLTK 3.7 and 3.8+ ──
for _resource in ("punkt", "punkt_tab"):
    try:
        nltk.data.find(f"tokenizers/{_resource}")
    except LookupError:
        nltk.download(_resource, quiet=True)

from nltk.tokenize import sent_tokenize  # import AFTER downloads

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("legal_bert_simplifier")

# ── Gemini config ────────────────────────────────────────────────────────────
_GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

_GEMINI_URL = (
    f"https://generativelanguage.googleapis.com/v1beta/models/"
    f"gemini-2.5-flash-lite:generateContent?key={_GEMINI_API_KEY}"
)


# ── Singleton model (loaded once per process) ────────────────────────────────
_simplifier_instance = None


def _get_simplifier():
    global _simplifier_instance
    if _simplifier_instance is None:
        _simplifier_instance = LegalBertSimplifier()
    return _simplifier_instance


class LegalBertSimplifier:
    def __init__(self, device=None, max_length=512):
        if device is None:
            self.device = "cuda" if torch.cuda.is_available() else "cpu"
        else:
            self.device = device

        logger.info(f"Using device: {self.device}")

        try:
            logger.info("Loading InLegalBERT model...")
            self.tokenizer = AutoTokenizer.from_pretrained("law-ai/InLegalBERT")
            self.model = AutoModelForPreTraining.from_pretrained("law-ai/InLegalBERT")
            self.model.to(self.device)

            self.fill_mask = pipeline(
                "fill-mask",
                model=self.model,
                tokenizer=self.tokenizer,
                device=0 if self.device == "cuda" else -1,
            )

            self.legal_terms = self._load_legal_terms()
            logger.info("Model loaded successfully")

        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
            raise Exception(f"Failed to load model: {str(e)}")

        self.max_length = max_length

    def _load_legal_terms(self):
        return {
            "hereinafter": "from now on",
            "aforementioned": "mentioned earlier",
            "pursuant to": "according to",
            "in accordance with": "following",
            "notwithstanding": "despite",
            "whereby": "by which",
            "herein": "in this document",
            "therein": "in that",
            "heretofore": "until now",
            "party of the first part": "first party",
            "party of the second part": "second party",
            "shall": "will",
            "such": "this",
            "said": "the",
            "deemed to be": "considered as",
        }

    def simplify_text(self, text, level=2):
        if not text:
            return ""

        # sent_tokenize is now safe — punkt/punkt_tab both downloaded at module load
        try:
            sentences = sent_tokenize(text)
        except Exception:
            # Ultimate fallback: split on period
            sentences = [s.strip() for s in text.split(".") if s.strip()]

        simplified_sentences = []

        for sentence in sentences:
            simplified = sentence

            if level >= 1:
                simplified = self._replace_legal_terms(simplified)
            if level >= 2:
                simplified = self._simplify_structure(simplified)
            if level >= 3:
                simplified = self._model_based_simplification(simplified)

            simplified_sentences.append(simplified)

        result = " ".join(simplified_sentences)
        result = self.clean_text(result)
        return result

    def _replace_legal_terms(self, text):
        for term, replacement in self.legal_terms.items():
            pattern = r"\b" + re.escape(term) + r"\b"
            text = re.sub(pattern, replacement, text, flags=re.IGNORECASE)
        return text

    def _simplify_structure(self, text):
        text = re.sub(r"\([^)]{20,}\)", "", text)
        text = text.replace(";", ".")
        text = text.replace("if and only if", "only if")
        text = text.replace("WHEREAS,", ".")
        text = text.replace("whereas,", ".")
        text = text.replace("for the purpose of", "to")
        return text

    def _model_based_simplification(self, text):
        words = text.split()
        simplified_words = []

        for word in words:
            if len(word) <= 7 or not word.isalpha() or word.lower() in self.legal_terms:
                simplified_words.append(word)
                continue

            try:
                masked_text = text.replace(word, self.tokenizer.mask_token, 1)
                predictions = self.fill_mask(masked_text)
                simpler_alternatives = [
                    pred["token_str"]
                    for pred in predictions
                    if len(pred["token_str"]) < len(word) and pred["score"] > 0.05
                ]
                if simpler_alternatives:
                    simplified_words.append(simpler_alternatives[0])
                else:
                    simplified_words.append(word)
            except Exception:
                simplified_words.append(word)

        return " ".join(simplified_words)

    def clean_text(self, text):
        text = re.sub(r"\s+", " ", text)
        text = re.sub(r"\s([,.;:?!])", r"\1", text)
        text = re.sub(r"([,.;:?!])([^\s])", r"\1 \2", text)
        text = re.sub(r"\.{2,}", ".", text)
        text = re.sub(r"\.\s+([a-z])", lambda m: f". {m.group(1).upper()}", text)
        return text.strip()


# ── Public API ────────────────────────────────────────────────────────────────


def summarize_text(text, level=2):
    """
    Simplify/summarise *text* at the given *level* (1-3).

    Strategy:
      1. Run InLegalBERT-based simplification (rule + structural).
      2. Send the simplified text to Gemini for a concise human-readable summary.
      3. On any Gemini failure, return the InLegalBERT-simplified text instead
         of raising / returning empty string.

    Returns a non-empty string on success.  Raises on total failure so the
    caller can decide what to show the user.
    """
    if not text or not text.strip():
        return "No text available to summarise."

    # ── Step 1: InLegalBERT simplification ───────────────────────────────────
    bert_simplified = text  # safe default
    try:
        simplifier = _get_simplifier()
        print(text)
        print(f"\n--- Simplification Level {level} ---")
        bert_simplified = simplifier.simplify_text(text, level=level)
        print(bert_simplified)
        print("-" * 50)
    except Exception as bert_err:
        logger.warning(f"InLegalBERT simplification failed: {bert_err}")
        # Continue — we can still try Gemini on the original text

    # ── Step 2: Gemini summary ────────────────────────────────────────────────
    line_counts = {1: "40-50", 2: "20-30", 3: "15-20"}
    count = line_counts.get(level, "20-30")
    prompt = (
        f"Summarise and simplify the following text into {count} concise, "
        "plain-English lines.  Output ONLY the summary — no preamble, no "
        "markdown bold/italic markers:\n\n" + bert_simplified
    )

    try:
        headers = {"Content-Type": "application/json"}
        data = {"contents": [{"parts": [{"text": prompt}]}]}
        response = requests.post(_GEMINI_URL, headers=headers, json=data, timeout=60)

        if response.status_code == 200:
            response_data = response.json()
            logger.debug(f"Gemini response keys: {list(response_data.keys())}")

            candidates = response_data.get("candidates", [])
            if candidates:
                candidate = candidates[0]
                parts = candidate.get("content", {}).get("parts", [])
                if parts:
                    gemini_text = parts[0].get("text", "").strip()
                    if gemini_text:
                        # Strip markdown bold/italic markers
                        gemini_text = gemini_text.replace("**", "").replace("*", "")
                        return gemini_text

            logger.warning(
                "Gemini returned no usable candidates; falling back to BERT result."
            )
        else:
            logger.warning(f"Gemini HTTP {response.status_code}: {response.text[:200]}")

    except requests.exceptions.Timeout:
        logger.warning("Gemini request timed out; falling back to BERT result.")
    except Exception as gemini_err:
        logger.warning(
            f"Gemini call failed: {gemini_err}; falling back to BERT result."
        )

    # ── Step 3: Fallback — return InLegalBERT result ─────────────────────────
    return bert_simplified if bert_simplified.strip() else text
