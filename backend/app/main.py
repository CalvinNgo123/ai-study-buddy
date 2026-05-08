from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional
import httpx
import os
import json
import re
import traceback

from .parser import parse_file
from .prometheus_metrics import setup_metrics

app = FastAPI(title="Study Guide Generator", version="1.0.0")

# CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup Prometheus metrics
setup_metrics(app)

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://ollama:11434")
MODEL = os.getenv("OLLAMA_MODEL", "llama3.2")

class Flashcard(BaseModel):
    id: int
    front: str
    back: str
    category: Optional[str] = None

class QuizQuestion(BaseModel):
    id: int
    question: str
    options: List[str]
    correct_answer: int  # Index of correct option
    explanation: Optional[str] = None

class StudyGuide(BaseModel):
    flashcards: List[Flashcard]
    quiz: List[QuizQuestion]
    summary: str

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}

@app.post("/upload", response_model=StudyGuide)
async def upload_file(file: UploadFile = File(...)):
    """Upload a file and generate study materials"""

    # Validate file type
    allowed_extensions = {'.txt', '.pdf', '.docx', '.md'}
    file_ext = os.path.splitext(file.filename)[1].lower()

    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. Allowed: {', '.join(allowed_extensions)}"
        )

    try:
        # Read and parse file
        content = await file.read()
        text = parse_file(content, file_ext)

        if not text or len(text.strip()) < 50:
            raise HTTPException(
                status_code=400,
                detail="File content too short or could not be extracted. Please provide more text."
            )

        # Generate study materials using Ollama
        study_guide = await generate_study_guide(text)
        return study_guide

    except HTTPException:
        raise
    except Exception as e:
        print(f"ERROR in upload_file: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")

@app.post("/generate-from-text", response_model=StudyGuide)
async def generate_from_text(text_input: dict):
    """Generate study materials from pasted text"""
    text = text_input.get("text", "")

    if not text or len(text.strip()) < 50:
        raise HTTPException(
            status_code=400,
            detail="Text too short. Please provide at least 50 characters."
        )

    try:
        study_guide = await generate_study_guide(text)
        return study_guide
    except HTTPException:
        raise
    except Exception as e:
        print(f"ERROR in generate_from_text: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Generation error: {str(e)}")

async def generate_study_guide(text: str) -> StudyGuide:
    """Call Ollama to generate flashcards and quiz questions"""

    print(f"DEBUG: generate_study_guide called with text length: {len(text)}")

    # Truncate very long text
    max_length = 8000
    if len(text) > max_length:
        text = text[:max_length] + "..."

    prompt = f"""You are an expert study guide creator. Analyze the following text and create:
1. 5-10 flashcards (key concepts and definitions)
2. 5 quiz questions with 4 multiple choice options each
3. A brief summary

Format your response EXACTLY as JSON with this structure:
{{
  "flashcards": [
    {{"id": 1, "front": "term or question", "back": "definition or answer", "category": "optional category"}}
  ],
  "quiz": [
    {{
      "id": 1,
      "question": "question text",
      "options": ["option A", "option B", "option C", "option D"],
      "correct_answer": 0,
      "explanation": "why this is correct"
    }}
  ],
  "summary": "brief summary of the content"
}}

Rules:
- Make flashcards concise and clear
- Ensure quiz questions test understanding, not just memorization
- Only return valid JSON, no markdown formatting
- correct_answer must be 0-3 (index of correct option)

Text to analyze:
{text}
"""

    print(f"DEBUG: Sending prompt to Ollama, text length: {len(text)}")

    async with httpx.AsyncClient(timeout=300.0) as client:
        try:
            response = await client.post(
                f"{OLLAMA_URL}/api/generate",
                json={
                    "model": MODEL,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.7,
                        "num_predict": 2000
                    }
                }
            )

            print(f"DEBUG: Ollama response status: {response.status_code}")

            if response.status_code != 200:
                error_detail = f"Ollama error: {response.status_code} - {response.text[:500]}"
                print(f"ERROR: {error_detail}")
                raise HTTPException(status_code=502, detail=error_detail)

            result = response.json()
            generated_text = result.get("response", "")

            print(f"DEBUG: Generated text length: {len(generated_text)}")
            print(f"DEBUG: Generated text preview: {generated_text[:200]}...")

            # Extract JSON from response
            study_data = extract_json(generated_text)

            # Validate and structure the data
            flashcards = [
                Flashcard(**fc) for fc in study_data.get('flashcards', [])
            ]
            quiz = [
                QuizQuestion(**q) for q in study_data.get('quiz', [])
            ]

            return StudyGuide(
                flashcards=flashcards,
                quiz=quiz,
                summary=study_data.get("summary", "Study guide generated successfully.")
            )

        except httpx.ConnectError:
            raise HTTPException(
                status_code=503,
                detail="Cannot connect to Ollama. Is it running?"
            )
        except Exception as e:
            print(f"ERROR in generate_study_guide: {str(e)}")
            print(traceback.format_exc())
            raise

def extract_json(text: str) -> dict:
    """Extract JSON from text that might contain markdown or extra content"""

    print(f"DEBUG: extract_json called with text length: {len(text)}")

    # Try to find JSON between code blocks
    code_pattern = "`" + "`" + "`" + r"(?:json)?\s*(\{.*\})\s*" + "`" + "`" + "`"
    json_match = re.search(code_pattern, text, re.DOTALL)
    if json_match:
        text = json_match.group(1)
        print("DEBUG: Found JSON in code block")

    # Try to find raw JSON object
    if not text.strip().startswith("{"):
        json_match = re.search(r"(\{.*\})", text, re.DOTALL)
        if json_match:
            text = json_match.group(1)
            print("DEBUG: Found raw JSON object")

    try:
        result = json.loads(text)
        print("DEBUG: Successfully parsed JSON")
        return result
    except json.JSONDecodeError as e:
        print(f"DEBUG: JSON parse failed: {e}")
        # Fallback: create minimal structure
        return {
            "flashcards": [
                {"id": 1, "front": "Content", "back": "Could not parse AI response. Please try again.", "category": "Error"}
            ],
            "quiz": [],
            "summary": "Error parsing response"
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)