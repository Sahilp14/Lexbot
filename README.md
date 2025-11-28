# LegiFy: AI-Powered Legal Document Summarization

## Overview
This project leverages advanced AI models to **summarize, simplify, and analyze legal documents** efficiently. It integrates **Named Entity Recognition (NER)**, **extractive summarization**, and **abstractive summarization** to ensure high-quality legal text processing.

## Features

### 1️⃣ **Named Entity Recognition (NER) with LegalBERT**
- Fine-tuned **LegalBERT** model for **legal-specific NER**.
- Identifies legal entities such as **sections, acts, case references, and NGO policies**.
- Helps in extracting key information from **government legal documents and NGO policy papers**.

### 2️⃣ **Extractive Summarization with BERTSUM**
- Utilizes **BERTSUM** to extract the most relevant sentences.
- Works best for lengthy legal documents **without altering meaning**.
- Enables quick understanding of **critical legal arguments and rulings**.

### 4️⃣ **Custom Dataset & Fine-Tuning**
- Utilizes **Yashaswat/Indian-Legal-Text-ABS** with structured annotations.
- Covers sections such as:
  - **Legal Sections:** (e.g., Article 21, IPC Section 420)
  - **Acts & Statutes:** (e.g., Environmental Protection Act, 1986)
  - **NGO-Related Laws:** (e.g., Foreign Contribution Regulation Act (FCRA))
  - **Case References:** (e.g., Vishaka v. State of Rajasthan, 1997)

### 5️⃣ **Evaluation Metrics for Summarization**
- Uses **ROUGE (Recall-Oriented Understudy for Gisting Evaluation)** for measuring textual overlap.
- Supports **BLEU (Bilingual Evaluation Understudy)** for fluency and accuracy.
- Additional metrics: **BERTScore** for semantic accuracy.

### 6️⃣ **Real-Time Legal Querying**
- Users can ask **context-based questions** related to the document.
- AI-powered Q&A system extracts precise answers.

### 7️⃣ **Multilingual Support**
- Extending summarization to **regional Indian languages**.
- Ensuring accessibility for **non-English legal documents**.

## Installation & Usage
```bash
# Clone the repository
git clone https://github.com/your-repo/legal-summarizer.git
cd legal-summarizer

# Install dependencies
pip install -r requirements.txt

# Run the model
python summarize.py --input legal_document.pdf --output summary.txt
```

## Future Enhancements
- **Integration with Spacy for advanced legal NLP.**
- **Support for summarizing legal contracts & compliance documents.**
- **Interactive dashboard for legal analysis & visualization.**

