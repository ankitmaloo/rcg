"""
Simple FastAPI Backend for Rapid Campaign Generator
Separate endpoints for each asset type
"""

from typing import Union,Annotated, List
from pydantic import BaseModel, Field
from fastapi import FastAPI,HTTPException, Security, status, File, UploadFile, Body, Query, Form, Request
from fastapi.security import APIKeyHeader
from fastapi.responses import JSONResponse, StreamingResponse, RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from ai_assist import ai_assistant
import json

# --- Pydantic Models ---

class GenerateRequest(BaseModel):
    prompt: str
    brand_name: str = "Default Brand"

# --- FastAPI App ---

app = FastAPI(title="Rapid Campaign Generator API")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- API Endpoints ---

@app.get("/")
def read_root():
    """Health check endpoint"""
    return {"status": "healthy", "service": "Rapid Campaign Generator API"}

@app.post("/generate-landing-page")
async def generate_landing_page(request: GenerateRequest):
    """Generate landing page HTML"""
    try:
        async def generate_stream():
            full_text = ""
            async for chunk_data in ai_assistant.generate_landing_page(request.prompt, request.brand_name):
                full_text += chunk_data["html"]
                # Yield each chunk as JSON line
                yield json.dumps(chunk_data) + "\n"
        
        return StreamingResponse(generate_stream(), media_type="application/json")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate landing page: {str(e)}")
    
@app.post("/generate-instagram-ad")
async def generate_instagram_ad(request: GenerateRequest):
    """Generate Instagram image ad"""
    try:
        result = await ai_assistant.generate_instagram_ad(request.prompt, request.brand_name)
        return {"image": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate Instagram ad: {str(e)}")

@app.post("/generate-copy-variants")
async def generate_copy_variants(request: GenerateRequest):
    """Generate copy variants"""
    try:
        result = await ai_assistant.generate_copy_variants(request.prompt, request.brand_name)
        return {"copy": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate copy variants: {str(e)}")

@app.post("/generate-video")
async def generate_video(request: GenerateRequest):
    """Generate video (placeholder)"""
    return {"status": "building"}
