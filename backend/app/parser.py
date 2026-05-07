"""File parsing utilities for various document formats"""

import io
from typing import Optional

def parse_file(content: bytes, file_ext: str) -> str:
    """Parse file content based on extension"""
    
    if file_ext == '.txt' or file_ext == '.md':
        return parse_text(content)
    elif file_ext == '.pdf':
        return parse_pdf(content)
    elif file_ext == '.docx':
        return parse_docx(content)
    else:
        raise ValueError(f"Unsupported file extension: {file_ext}")

def parse_text(content: bytes) -> str:
    """Parse plain text or markdown files"""
    try:
        return content.decode('utf-8')
    except UnicodeDecodeError:
        return content.decode('latin-1')

def parse_pdf(content: bytes) -> str:
    """Parse PDF files using PyPDF2"""
    try:
        from PyPDF2 import PdfReader
        pdf_file = io.BytesIO(content)
        reader = PdfReader(pdf_file)
        
        text = ""
        for page in reader.pages:
            extracted = page.extract_text()
            if extracted:
                text += extracted + chr(10)
        
        return text.strip()
    except Exception as e:
        raise ValueError(f"Could not parse PDF: {str(e)}")

def parse_docx(content: bytes) -> str:
    """Parse Word documents using python-docx"""
    try:
        from docx import Document
        doc_file = io.BytesIO(content)
        doc = Document(doc_file)
        
        text = ""
        for para in doc.paragraphs:
            text += para.text + chr(10)
        
        return text.strip()
    except Exception as e:
        raise ValueError(f"Could not parse DOCX: {str(e)}")