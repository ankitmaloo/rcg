"""
FastAPI Backend for Rapid Campaign Generator
Handles API endpoints with threading and streaming support
"""

import os
import json
import asyncio
from typing import List, Optional
from concurrent.futures import ThreadPoolExecutor
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from contextlib import asynccontextmanager

from ai_assist import ai_assistant

# --- Thread Pool Configuration ---
# Configure thread pool with minimum 4 threads for parallel processing
MAX_WORKERS = max(4, os.cpu_count() or 4)
thread_pool = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifespan - startup and shutdown"""
    global thread_pool
    # Startup: Initialize thread pool
    thread_pool = ThreadPoolExecutor(max_workers=MAX_WORKERS)
    print(f"✓ Thread pool initialized with {MAX_WORKERS} workers")
    yield
    # Shutdown: Cleanup thread pool
    if thread_pool:
        thread_pool.shutdown(wait=True)
        print("✓ Thread pool shut down")


# --- Pydantic Models ---

class BrandKit(BaseModel):
    name: Optional[str] = None
    primary_color: Optional[str] = Field(None, alias='primaryColor')
    secondary_color: Optional[str] = Field(None, alias='secondaryColor')
    text_color: Optional[str] = Field(None, alias='textColor')


class LandingPageSection(BaseModel):
    title: str
    content: str
    icon: str


class LandingPageContent(BaseModel):
    headline: str
    subheadline: str
    cta_button: str = Field(..., alias='ctaButton')
    sections: List[LandingPageSection]


class Brand(BaseModel):
    name: str
    primary_color: str = Field(..., alias='primaryColor')
    secondary_color: str = Field(..., alias='secondaryColor')
    text_color: str = Field(..., alias='textColor')


class AdCopy(BaseModel):
    facebook: str
    instagram: str
    linkedin: str


class AssetPrompt(BaseModel):
    platform: str
    prompt: str


class SEO(BaseModel):
    title: str
    description: str
    keywords: str


class Tracking(BaseModel):
    google_tag_manager_id: str = Field(..., alias='googleTagManagerId')
    facebook_pixel_id: str = Field(..., alias='facebookPixelId')


class CampaignAssets(BaseModel):
    brand: Brand
    landing_page: LandingPageContent = Field(..., alias='landingPage')
    ad_copy: AdCopy = Field(..., alias='adCopy')
    asset_prompts: List[AssetPrompt] = Field(..., alias='assetPrompts')
    seo: SEO
    tracking: Tracking


class GenerateCampaignAssetsRequest(BaseModel):
    prompt: str
    brand_kit: BrandKit = Field(..., alias='brandKit')


class GenerateImageAssetRequest(BaseModel):
    prompt: str


# --- FastAPI App ---

app = FastAPI(lifespan=lifespan, title="Rapid Campaign Generator API")

# CORS configuration
origins = [
    "http://localhost",
    "http://localhost:8000",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Helper Functions ---

async def run_in_thread(func, *args, **kwargs):
    """Run a blocking function in the thread pool"""
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(thread_pool, func, *args, **kwargs)


# --- API Endpoints ---

@app.get("/")
def read_root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Rapid Campaign Generator API",
        "threads": MAX_WORKERS
    }


@app.post("/generate-campaign-assets", response_model=CampaignAssets)
async def generate_campaign_assets(request: GenerateCampaignAssetsRequest):
    """
    Generate complete campaign assets (non-streaming)

    Args:
        request: Campaign generation request with prompt and brand kit

    Returns:
        Complete campaign assets including landing page, ad copy, SEO, etc.
    """
    try:
        brand_kit_dict = request.brand_kit.dict(by_alias=True)
        result = await ai_assistant.generate_campaign_assets(
            prompt=request.prompt,
            brand_kit=brand_kit_dict
        )
        return CampaignAssets.parse_obj(result)
    except Exception as e:
        print(f"Error in generate_campaign_assets: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate campaign assets: {str(e)}"
        )


@app.post("/generate-campaign-assets-stream")
async def generate_campaign_assets_stream(request: GenerateCampaignAssetsRequest):
    """
    Generate complete campaign assets with streaming support

    Args:
        request: Campaign generation request with prompt and brand kit

    Returns:
        Streaming response with JSON chunks
    """
    async def stream_generator():
        try:
            brand_kit_dict = request.brand_kit.dict(by_alias=True)
            async for chunk in ai_assistant.generate_campaign_assets_stream(
                prompt=request.prompt,
                brand_kit=brand_kit_dict
            ):
                yield f"data: {json.dumps({'chunk': chunk})}\n\n"
        except Exception as e:
            error_msg = json.dumps({'error': str(e)})
            yield f"data: {error_msg}\n\n"

    return StreamingResponse(
        stream_generator(),
        media_type="text/event-stream"
    )


@app.post("/generate-image-asset")
async def generate_image_asset(request: GenerateImageAssetRequest):
    """
    Generate image asset from prompt (non-streaming)

    Args:
        request: Image generation request with prompt

    Returns:
        Base64-encoded image data
    """
    try:
        image_data = await ai_assistant.generate_image_asset(prompt=request.prompt)
        return {"image_data": image_data}
    except Exception as e:
        print(f"Error in generate_image_asset: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate image asset: {str(e)}"
        )


@app.post("/generate-image-asset-stream")
async def generate_image_asset_stream(request: GenerateImageAssetRequest):
    """
    Generate image asset with streaming support

    Args:
        request: Image generation request with prompt

    Returns:
        Streaming response with image data chunks
    """
    async def stream_generator():
        try:
            async for chunk in ai_assistant.generate_image_asset_stream(
                prompt=request.prompt
            ):
                yield f"data: {json.dumps({'chunk': chunk})}\n\n"
        except Exception as e:
            error_msg = json.dumps({'error': str(e)})
            yield f"data: {error_msg}\n\n"

    return StreamingResponse(
        stream_generator(),
        media_type="text/event-stream"
    )


@app.post("/generate-landing-page-variant", response_model=LandingPageContent)
async def generate_landing_page_variant(base_assets: CampaignAssets):
    """
    Generate A/B test variant of landing page (non-streaming)

    Args:
        base_assets: Complete campaign assets with original landing page

    Returns:
        Variant landing page content
    """
    try:
        landing_page_dict = base_assets.landing_page.dict(by_alias=True)
        result = await ai_assistant.generate_landing_page_variant(
            brand_name=base_assets.brand.name,
            landing_page_content=landing_page_dict
        )
        return LandingPageContent.parse_obj(result)
    except Exception as e:
        print(f"Error in generate_landing_page_variant: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate landing page variant: {str(e)}"
        )


@app.post("/generate-landing-page-variant-stream")
async def generate_landing_page_variant_stream(base_assets: CampaignAssets):
    """
    Generate A/B test variant with streaming support

    Args:
        base_assets: Complete campaign assets with original landing page

    Returns:
        Streaming response with variant JSON chunks
    """
    async def stream_generator():
        try:
            landing_page_dict = base_assets.landing_page.dict(by_alias=True)
            async for chunk in ai_assistant.generate_landing_page_variant_stream(
                brand_name=base_assets.brand.name,
                landing_page_content=landing_page_dict
            ):
                yield f"data: {json.dumps({'chunk': chunk})}\n\n"
        except Exception as e:
            error_msg = json.dumps({'error': str(e)})
            yield f"data: {error_msg}\n\n"

    return StreamingResponse(
        stream_generator(),
        media_type="text/event-stream"
    )


# --- Health Check Endpoints ---

@app.get("/health")
def health_check():
    """Detailed health check with thread pool status"""
    return {
        "status": "healthy",
        "thread_pool": {
            "max_workers": MAX_WORKERS,
            "active": thread_pool is not None
        }
    }
