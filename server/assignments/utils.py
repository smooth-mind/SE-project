import base64
from docx import Document

def read_file_b64(file_field) -> str:
    with file_field.open('rb') as f:
        return base64.b64encode(f.read()).decode('utf-8')

def docx_to_text(file_field):
    doc = Document(file_field)
    return "\n".join(p.text for p in doc.paragraphs)
