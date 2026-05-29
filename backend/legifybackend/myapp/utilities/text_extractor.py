import os
import base64
import requests
from pathlib import Path
import PyPDF2
import docx
import pandas as pd
import json
import pytesseract
from PIL import Image
from django.core.exceptions import ValidationError

# Ensure Tesseract path is configured as a fallback
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

def extract_text_via_gemini(file_path, mime_type):
    """Extract text from a file using the Gemini multimodal API as a fallback OCR engine."""
    try:
        # Load API KEY from env, or fall back to views.py key
        api_key = os.getenv("GEMINI_API_KEY")
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={api_key}"
        
        with open(file_path, "rb") as f:
            base64_data = base64.b64encode(f.read()).decode("utf-8")
            
        payload = {
            "contents": [
                {
                    "parts": [
                        {
                            "inlineData": {
                                "mimeType": mime_type,
                                "data": base64_data
                            }
                        },
                        {
                            "text": "Extract all readable text from this document as accurately as possible. Output ONLY the extracted text. Do not summarize, do not translate, do not add introductory phrases, notes, markdown comments, or explanations."
                        }
                    ]
                }
            ]
        }
        
        headers = {"Content-Type": "application/json"}
        response = requests.post(url, headers=headers, json=payload, timeout=60)
        
        if response.status_code != 200:
            raise Exception(f"Gemini API returned status code {response.status_code}: {response.text}")
            
        data = response.json()
        if "candidates" in data and len(data["candidates"]) > 0:
            candidate = data["candidates"][0]
            if "content" in candidate and "parts" in candidate["content"] and len(candidate["content"]["parts"]) > 0:
                text = candidate["content"]["parts"][0]["text"]
                return text.strip()
                
        raise Exception(f"Unexpected response structure: {data}")
    except Exception as e:
        print(f"Error in Gemini OCR extraction: {e}")
        raise e

def extract_text_from_txt(file_path):
    """Extract text from a .txt file with robust encoding fallback."""
    encodings = ['utf-8', 'latin-1', 'windows-1252', 'utf-16']
    for encoding in encodings:
        try:
            with open(file_path, 'r', encoding=encoding) as file:
                return file.read()
        except UnicodeDecodeError:
            continue
    raise ValidationError("Could not decode text file with standard encodings.")

def extract_text_from_pdf(file_path):
    """Extract text from a .pdf file, with fallback to Gemini OCR if scanned."""
    try:
        with open(file_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            text = ''
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + '\n'
            
            # Simple check: if text is empty or very short, it is likely a scanned PDF
            clean_text = ''.join(c for c in text if c.isalnum())
            if len(clean_text) < 150:
                print("PDF text extraction resulted in very little content. Falling back to Gemini OCR.")
                try:
                    ocr_text = extract_text_via_gemini(file_path, "application/pdf")
                    if ocr_text:
                        return ocr_text
                except Exception as ocr_err:
                    print(f"Gemini OCR fallback failed for PDF: {ocr_err}")
            
            return text
    except Exception as e:
        print(f"Error in PyPDF2 extraction: {e}. Trying Gemini OCR.")
        try:
            return extract_text_via_gemini(file_path, "application/pdf")
        except Exception as ocr_err:
            raise ValidationError(f"Failed to extract text from PDF: {str(e)} | OCR error: {str(ocr_err)}")

def extract_text_from_docx(file_path):
    """Extract text from a .docx file."""
    try:
        doc = docx.Document(file_path)
        return '\n'.join([para.text for para in doc.paragraphs])
    except Exception as e:
        raise ValidationError(f"Failed to read DOCX file: {str(e)}")

def extract_text_from_csv(file_path):
    """Extract text from a .csv file."""
    df = pd.read_csv(file_path)
    return df.to_string()

def extract_text_from_xlsx(file_path):
    """Extract text from a .xlsx file."""
    df = pd.read_excel(file_path)
    return df.to_string()

def extract_text_from_json(file_path):
    """Extract text from a .json file."""
    with open(file_path, 'r', encoding='utf-8') as file:
        data = json.load(file)
        return json.dumps(data, indent=4)

def extract_text_from_image(file_path):
    """Extract text from an image using Gemini OCR or local pytesseract as fallback."""
    extension = Path(file_path).suffix.lower()
    mime_type = "image/png"
    if extension in ['.jpg', '.jpeg']:
        mime_type = "image/jpeg"
    elif extension == '.webp':
        mime_type = "image/webp"
    
    try:
        ocr_text = extract_text_via_gemini(file_path, mime_type)
        if ocr_text:
            return ocr_text
    except Exception as gemini_err:
        print(f"Gemini OCR failed for image: {gemini_err}. Trying local pytesseract.")
    
    # Fallback to local pytesseract
    try:
        image = Image.open(file_path)
        return pytesseract.image_to_string(image)
    except Exception as tess_err:
        raise ValidationError(f"Gemini OCR and pytesseract both failed to extract text from image: {str(tess_err)}")

def extract_text(file_path):
    """Extract text based on file extension."""
    extension = Path(file_path).suffix.lower()

    if extension == '.txt':
        return extract_text_from_txt(file_path)
    elif extension == '.pdf':
        return extract_text_from_pdf(file_path)
    elif extension in ['.docx', '.doc']:
        return extract_text_from_docx(file_path)
    elif extension == '.csv':
        return extract_text_from_csv(file_path)
    elif extension == '.xlsx':
        return extract_text_from_xlsx(file_path)
    elif extension == '.json':
        return extract_text_from_json(file_path)
    elif extension in ['.png', '.jpg', '.jpeg', '.bmp', '.tiff', '.webp']:
        return extract_text_from_image(file_path)
    else:
        raise ValidationError(f"Unsupported file type: {extension}")