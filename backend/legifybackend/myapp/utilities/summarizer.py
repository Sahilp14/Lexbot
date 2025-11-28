import torch
from transformers import AutoTokenizer, AutoModel
import numpy as np
import re
from nltk.tokenize import sent_tokenize
from sklearn.metrics.pairwise import cosine_similarity
import spacy
from collections import Counter

def summarize_legal_document(document_text, ratio=0.15, model_name='nlpaueb/legal-bert-base-uncased'):
    """
    Robust legal document summarization using BERT with enhanced context preservation
    and keyword highlighting.
    
    Args:
        document_text (str): The text of the legal document to summarize
        ratio (float): The ratio of sentences to include in the summary (default: 0.3)
        model_name (str): The BERT model to use (default: 'nlpaueb/legal-bert-base-uncased')
        
    Returns:
        dict: Contains the summary text, highlighted version, and key legal elements
    """
    # Load pre-trained Legal BERT model and tokenizer
    try:
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        model = AutoModel.from_pretrained(model_name)
        model.eval()
    except Exception as e:
        print(f"Error loading model: {e}. Falling back to standard BERT.")
        tokenizer = AutoTokenizer.from_pretrained('bert-base-uncased')
        model = AutoModel.from_pretrained('bert-base-uncased')
        model.eval()
    
    # Load spaCy for named entity recognition
    try:
        nlp = spacy.load("en_core_web_sm")
    except:
        print("Please install spaCy and download the English model with:")
        print("pip install spacy")
        print("python -m spacy download en_core_web_sm")
        raise
    
    # Clean and preprocess text
    document_text = preprocess_legal_text(document_text)
    
    # Split text into sentences
    sentences = sent_tokenize(document_text)
    
    # Skip empty documents or those with too few sentences
    if len(sentences) < 2:
        return {"summary": document_text, "highlighted_summary": document_text, "key_elements": {}}
    
    # Number of sentences to include in summary - enforce stricter limits
    num_sentences = max(2, min(int(len(sentences) * ratio), int(len(sentences) * 0.5)))
    
    # Extract legal entities and important terms
    doc = nlp(document_text)
    legal_entities = extract_legal_entities(doc)
    
    # Get embeddings for each sentence
    sentence_embeddings = []
    
    for sentence in sentences:
        # Tokenize sentence and convert to tensor
        inputs = tokenizer(sentence, return_tensors='pt', padding=True, truncation=True, max_length=512)
        
        with torch.no_grad():
            outputs = model(**inputs)
            
        # Use the [CLS] token embedding as the sentence embedding
        embedding = outputs.last_hidden_state[:, 0, :].numpy()
        sentence_embeddings.append(embedding[0])
    
    # Calculate document embedding (average of all sentence embeddings)
    document_embedding = np.mean(sentence_embeddings, axis=0)
    
    # Calculate sentence scores based on multiple factors
    sentence_scores = calculate_sentence_scores(
        sentences, 
        sentence_embeddings, 
        document_embedding, 
        legal_entities
    )
    
    # Select top sentences based on scores
    ranked_indices = np.argsort(sentence_scores)[::-1]
    top_indices = sorted(ranked_indices[:num_sentences])
    
    # Create summary by joining selected sentences
    summary_sentences = [sentences[i] for i in top_indices]
    
    # Post-process summary to make it more concise
    summary_sentences = post_process_summary(summary_sentences, legal_entities)
    summary = ' '.join(summary_sentences)
    
    # Create highlighted version
    highlighted_summary = highlight_legal_elements(summary, legal_entities)
    
    # Structure return value
    result = {
        "summary": summary,
        "highlighted_summary": highlighted_summary,
        "key_elements": legal_entities
    }
    
    return result['summary']

def preprocess_legal_text(text):
    """Clean and preprocess legal text."""
    # Remove excessive whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    
    # Ensure proper spacing after periods
    text = re.sub(r'\.(?=[A-Z])', '. ', text)
    
    # Fix common OCR errors in legal documents
    text = text.replace('l.', 'i.')
    text = re.sub(r'(\d),(\d)', r'\1.\2', text)  # Fix comma used as decimal
    
    return text

def extract_legal_entities(doc):
    """Extract legal entities and important terms from document."""
    entities = {
        "parties": [],
        "dates": [],
        "monetary_values": [],
        "legal_terms": [],
        "obligations": [],
        "places": []
    }
    
    # Legal terms dictionary - expand as needed
    legal_terms = [
        "agreement", "contract", "clause", "party", "parties", "liability", 
        "indemnity", "warranty", "termination", "jurisdiction", "governing law",
        "confidentiality", "obligation", "breach", "remedy", "arbitration",
        "force majeure", "consideration", "renewal", "amendment", "assignment"
    ]
    
    # Extract named entities
    for ent in doc.ents:
        if ent.label_ == "PERSON" or ent.label_ == "ORG":
            entities["parties"].append(ent.text)
        elif ent.label_ == "DATE":
            entities["dates"].append(ent.text)
        elif ent.label_ == "MONEY":
            entities["monetary_values"].append(ent.text)
        elif ent.label_ == "GPE" or ent.label_ == "LOC":
            entities["places"].append(ent.text)
    
    # Extract legal terms
    for term in legal_terms:
        term_pattern = re.compile(r'\b' + term + r'\b', re.IGNORECASE)
        if term_pattern.search(doc.text):
            entities["legal_terms"].append(term)
    
    # Extract obligation statements
    obligation_patterns = [
        r'\bshall\b', r'\bmust\b', r'\brequired to\b', r'\bobligated to\b',
        r'\bagrees to\b', r'\bundertakes to\b'
    ]
    
    for sentence in doc.sents:
        for pattern in obligation_patterns:
            if re.search(pattern, sentence.text, re.IGNORECASE):
                entities["obligations"].append(sentence.text.strip())
                break
    
    # Remove duplicates and limit to top items
    for key in entities:
        entities[key] = list(set(entities[key]))[:10]  # Limit to top 10 unique items
    
    return entities

def calculate_sentence_scores(sentences, sentence_embeddings, document_embedding, legal_entities):
    """Calculate sentence scores based on multiple factors with improved conciseness."""
    scores = np.zeros(len(sentences))
    
    # Factor 1: Information density - favor sentences with high legal content
    all_entities = []
    for category in legal_entities.values():
        all_entities.extend(category)
    
    for i, sentence in enumerate(sentences):
        # Count unique legal entities in sentence
        entity_count = sum(1 for entity in all_entities if entity.lower() in sentence.lower())
        word_count = len(sentence.split())
        
        # Calculate information density (entities per word)
        if word_count > 0:
            density = entity_count / word_count
            scores[i] += density * 0.35  # Weight: 35%
    
    # Factor 2: Critical legal content - heavily prioritize sentences with obligations/key terms
    obligation_markers = ['shall', 'must', 'required', 'obligated', 'agrees to', 'undertakes']
    key_legal_phrases = ['governed by', 'warranty', 'liability', 'termination', 'remedies', 
                         'indemnification', 'confidentiality', 'jurisdiction', 'arbitration']
    
    for i, sentence in enumerate(sentences):
        contains_obligation = any(marker in sentence.lower() for marker in obligation_markers)
        contains_key_phrase = any(phrase in sentence.lower() for phrase in key_legal_phrases)
        
        if contains_obligation:
            scores[i] += 0.30  # Heavy weight for obligations
        if contains_key_phrase:
            scores[i] += 0.15  # Weight for other key legal terms
    
    # Factor 3: Semantic centrality - how well sentence represents overall document
    for i, embedding in enumerate(sentence_embeddings):
        similarity = cosine_similarity([embedding], [document_embedding])[0][0]
        scores[i] += similarity * 0.15  # Weight: 15%
    
    # Factor 4: Eliminate redundancy by penalizing similar sentences
    for i in range(len(sentences)):
        for j in range(i+1, len(sentences)):
            similarity = cosine_similarity([sentence_embeddings[i]], [sentence_embeddings[j]])[0][0]
            if similarity > 0.8:  # If sentences are very similar
                # Penalize the shorter one (likely less informative)
                if len(sentences[i]) < len(sentences[j]):
                    scores[i] -= 0.5
                else:
                    scores[j] -= 0.5
    
    # Factor 5: Penalty for extremely long sentences (often boilerplate)
    for i, sentence in enumerate(sentences):
        word_count = len(sentence.split())
        if word_count > 50:  # Very long sentences get penalized
            scores[i] -= (word_count - 50) / 50  # Progressive penalty
    
    return scores

def post_process_summary(sentences, legal_entities):
    """Apply post-processing to make summary more concise while preserving legal meaning."""
    processed_sentences = []
    
    for sentence in sentences:
        # Skip sentences that are too similar to ones we've already included
        if any(calculate_text_similarity(sentence, ps) > 0.7 for ps in processed_sentences):
            continue
            
        # Shorten common legal preambles
        if "THIS AGREEMENT" in sentence and len(sentence) > 200:
            # Extract just the party information
            parties_match = re.search(r'between ([^,]+).+and ([^,\.]+)', sentence)
            if parties_match:
                party1, party2 = parties_match.groups()
                date_match = re.search(r'(\d+(?:st|nd|rd|th)? day of [A-Za-z]+, \d{4})', sentence)
                date_str = date_match.group(1) if date_match else ""
                sentence = f"Agreement dated {date_str} between {party1} and {party2}."
        
        # Condense standard clauses to their essentials
        sentence = re.sub(r'shall be governed by the laws of ([^,\.]+)', r'governed by \1 law', sentence)
        sentence = re.sub(r'shall commence on ([^,\.]+) and shall continue for ([^,\.]+)', 
                          r'term: \1 to \2', sentence)
        
        processed_sentences.append(sentence)
    
    return processed_sentences

def highlight_legal_elements(text, legal_entities):
    """Add HTML highlighting to important legal elements in the text."""
    highlighted_text = text
    
    # Flatten the entities for highlighting
    all_entities = []
    for category, items in legal_entities.items():
        for item in items:
            all_entities.append((item, category))
    
    # Sort by length (descending) to avoid highlighting issues
    all_entities.sort(key=lambda x: len(x[0]), reverse=True)
    
    # Define highlight colors for different entity types
    highlight_colors = {
        "parties": "#FFD700",  # Gold
        "dates": "#98FB98",    # Pale green
        "monetary_values": "#87CEFA",  # Light blue
        "legal_terms": "#FFA07A",  # Light salmon
        "obligations": "#D8BFD8",  # Thistle
        "places": "#F0E68C"    # Khaki
    }
    
    # Apply highlights
    for entity, category in all_entities:
        if entity in highlighted_text:
            color = highlight_colors.get(category, "#FFFF00")  # Default: yellow
            highlighted_text = highlighted_text.replace(
                entity, 
                f'<span style="background-color: {color};">{entity}</span>'
            )
    
    return highlighted_text

def calculate_text_similarity(text1, text2):
    """Calculate similarity between two text strings using TF-IDF."""
    # Simple word overlap calculation
    words1 = set(text1.lower().split())
    words2 = set(text2.lower().split())
    
    if not words1 or not words2:
        return 0.0
        
    overlap = len(words1.intersection(words2))
    union = len(words1.union(words2))
    
    return overlap / union if union > 0 else 0.0

def get_summary_metrics(original_text, summary):
    """Calculate metrics about the summary."""
    original_word_count = len(original_text.split())
    summary_word_count = len(summary.split())
    compression_ratio = summary_word_count / original_word_count if original_word_count > 0 else 1
    
    return {
        "original_length": original_word_count,
        "summary_length": summary_word_count,
        "compression_ratio": compression_ratio,
        "compression_percentage": (1 - compression_ratio) * 100
    }

# # Example usage
# if __name__ == "__main__":
#     sample_text = """
#     THIS AGREEMENT is made on the 15th day of March, 2023, between ACME CORPORATION ("Seller"), 
#     a corporation organized under the laws of Delaware with its principal place of business at 
#     123 Main Street, Anytown, USA, and XYZ ENTERPRISES ("Buyer"), a limited liability company 
#     organized under the laws of California. WHEREAS, Seller is engaged in the business of manufacturing 
#     widgets and Buyer wishes to purchase widgets from Seller. NOW, THEREFORE, in consideration of the 
#     mutual covenants contained herein, the parties agree as follows: 1. SALE OF GOODS. Seller shall sell 
#     and deliver to Buyer, and Buyer shall purchase from Seller, widgets (the "Goods") in the quantities 
#     ordered by Buyer from time to time. 2. PRICE AND PAYMENT. The price for each widget shall be $50.00 USD. 
#     Payment shall be made within 30 days of delivery. 3. TERM. This Agreement shall commence on April 1, 2023 
#     and shall continue for a period of two (2) years. 4. GOVERNING LAW. This Agreement shall be governed by 
#     the laws of the State of New York. 5. DISPUTE RESOLUTION. Any dispute arising under this Agreement shall 
#     be resolved through binding arbitration in accordance with the rules of the American Arbitration Association.
#     """
    
#     result = summarize_legal_document(sample_text, ratio=0.3)
#     print("SUMMARY:")
#     print(result["summary"])
#     print("\nKEY ELEMENTS:")
#     for category, items in result["key_elements"].items():
#         if items:
#             print(f"{category.upper()}: {', '.join(items)}")
    
#     metrics = get_summary_metrics(sample_text, result["summary"])
#     print(f"\nSummary reduced document by {metrics['compression_percentage']:.1f}%")