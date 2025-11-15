"""
Simple FastAPI Backend for Rapid Campaign Generator
Separate endpoints for each asset type
"""

from typing import Union,Annotated, List, Optional, Dict
from pydantic import BaseModel, Field
from fastapi import FastAPI,HTTPException, Security, status, File, UploadFile, Body, Query, Form, Request
from fastapi.security import APIKeyHeader
from fastapi.responses import JSONResponse, StreamingResponse, RedirectResponse, HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from ai_assist import ai_assistant
from storage import LandingPageStorage
import json
import asyncio
from concurrent.futures import ThreadPoolExecutor

# --- Pydantic Models ---

class GenerateRequest(BaseModel):
    prompt: str
    brand_name: str = "Default Brand"

class SaveLandingPageRequest(BaseModel):
    html_content: str
    brand_kit: Optional[Dict] = None
    ab_variant_html: Optional[str] = None
    seo_metadata: Optional[Dict] = None
    custom_slug: Optional[str] = None

# --- FastAPI App ---

app = FastAPI(title="Rapid Campaign Generator API")

# Initialize storage
storage = LandingPageStorage()

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
    """Generate landing page HTML - runs in thread pool for true parallelism"""
    try:
        async def generate_stream():
            full_text = ""
            # Run the generator in a thread pool to prevent blocking the event loop
            async for chunk_data in asyncio_aiter(
                ai_assistant.generate_landing_page(request.prompt, request.brand_name)
            ):
                full_text += chunk_data["html"]
                # Yield each chunk as JSON line
                yield json.dumps(chunk_data) + "\n"

        return StreamingResponse(generate_stream(), media_type="application/json")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate landing page: {str(e)}")

async def asyncio_aiter(sync_iter):
    """Wrap a sync iterator to run in thread pool"""
    loop = asyncio.get_event_loop()
    iterator = iter(sync_iter)

    while True:
        try:
            # Run next() in a thread pool to avoid blocking
            value = await loop.run_in_executor(None, next, iterator)
            yield value
        except StopIteration:
            break
    
@app.post("/generate-instagram-ad")
async def generate_instagram_ad(request: GenerateRequest):
    """Generate Instagram image ad - runs in thread pool for true parallelism"""
    try:
        async def generate_stream():
            async for chunk_data in asyncio_aiter(
                ai_assistant.generate_instagram_ad(request.prompt, request.brand_name)
            ):
                yield json.dumps(chunk_data) + "\n"

        return StreamingResponse(generate_stream(), media_type="application/json")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate Instagram ad: {str(e)}")

@app.post("/generate-copy-variants")
async def generate_copy_variants(request: GenerateRequest):
    """Generate copy variants - runs in thread pool for true parallelism"""
    try:
        # Run blocking AI call in thread pool
        result = await asyncio.to_thread(
            ai_assistant.generate_copy_variants, request.prompt, request.brand_name
        )
        return {"copy": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate copy variants: {str(e)}")

@app.post("/generate-video")
async def generate_video(request: GenerateRequest):
    """Generate video (placeholder)"""
    return {"status": "building"}

@app.post("/generate-landing-page-ab-test")
async def generate_landing_page_ab_test(request: dict):
    """Generate A/B test variant of landing page HTML - runs in thread pool"""
    try:
        html_content = request.get("html", "")
        brand_name = request.get("brand_name", "Default Brand")

        async def generate_stream():
            full_text = ""
            async for chunk_data in asyncio_aiter(
                ai_assistant.generate_landing_page_ab_test(html_content, brand_name)
            ):
                full_text += chunk_data["html"]
                # Yield each chunk as JSON line
                yield json.dumps(chunk_data) + "\n"

        return StreamingResponse(generate_stream(), media_type="application/json")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate A/B test variant: {str(e)}")

# --- Landing Page Storage Endpoints ---

@app.post("/api/save-landing-page")
async def save_landing_page(request: SaveLandingPageRequest):
    """Save a landing page and get a public URL - file I/O in thread pool"""
    try:
        # Run file I/O in thread pool to avoid blocking
        result = await asyncio.to_thread(
            storage.save_landing_page,
            html_content=request.html_content,
            brand_kit=request.brand_kit,
            ab_variant_html=request.ab_variant_html,
            seo_metadata=request.seo_metadata,
            custom_slug=request.custom_slug
        )
        return {
            "success": True,
            "id": result["id"],
            "slug": result["slug"],
            "url": f"/p/{result['slug']}",
            "brand_name": result["brand_name"],
            "created_at": result["created_at"],
            "has_ab_variant": result["has_ab_variant"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save landing page: {str(e)}")

@app.get("/p/{slug}", response_class=HTMLResponse)
async def serve_landing_page(slug: str):
    """Serve a public landing page by slug - file I/O in thread pool"""
    # Run file I/O in thread pool
    page = await asyncio.to_thread(storage.get_by_slug, slug)
    if not page:
        raise HTTPException(status_code=404, detail="Landing page not found")

    # Serve A/B variant randomly if it exists
    if page.get("ab_variant_html"):
        import random
        if random.random() < 0.5:
            return HTMLResponse(content=page["ab_variant_html"])

    return HTMLResponse(content=page["html_content"])

@app.get("/api/landing-pages")
async def list_landing_pages(limit: int = Query(100, ge=1, le=1000)):
    """List all saved landing pages (metadata only) - file I/O in thread pool"""
    try:
        pages = await asyncio.to_thread(storage.list_all, limit=limit)
        return {"pages": pages, "count": len(pages)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list landing pages: {str(e)}")

@app.get("/api/landing-pages/{page_id}")
async def get_landing_page(page_id: str):
    """Get a specific landing page by ID (includes full HTML) - file I/O in thread pool"""
    page = await asyncio.to_thread(storage.get_by_id, page_id)
    if not page:
        raise HTTPException(status_code=404, detail="Landing page not found")
    return page

@app.delete("/api/landing-pages/{page_id}")
async def delete_landing_page(page_id: str):
    """Delete a landing page by ID - file I/O in thread pool"""
    success = await asyncio.to_thread(storage.delete, page_id)
    if not success:
        raise HTTPException(status_code=404, detail="Landing page not found")
    return {"success": True, "message": "Landing page deleted"}

@app.patch("/api/landing-pages/{page_id}/slug")
async def update_landing_page_slug(page_id: str, new_slug: str = Body(..., embed=True)):
    """Update the slug of a landing page - file I/O in thread pool"""
    success = await asyncio.to_thread(storage.update_slug, page_id, new_slug)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to update slug (may already exist or page not found)")
    return {"success": True, "new_slug": new_slug}
