import os
import json
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv
import google.generativeai as genai
from google.generativeai.types import GenerationConfig

# Load environment variables from .env file
load_dotenv()

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

app = FastAPI()

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

# --- Gemini API Configuration ---

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable not set")

genai.configure(api_key=GEMINI_API_KEY)

# --- API Endpoints ---

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.post("/generate-campaign-assets", response_model=CampaignAssets)
async def generate_campaign_assets(request: GenerateCampaignAssetsRequest):
    system_prompt = "You are a world-class marketing and branding agency. Based on the following campaign description, generate a complete set of marketing assets. The assets must be sophisticated, modern, and high-end. Focus on clarity, a strong value proposition, and compelling language."

    brand_guidelines = []
    if request.brand_kit.name:
        brand_guidelines.append(f'Name must be "{request.brand_kit.name}"')
    if request.brand_kit.primary_color:
        brand_guidelines.append(f'Primary Color must be "{request.brand_kit.primary_color}"')
    if request.brand_kit.secondary_color:
        brand_guidelines.append(f'Secondary Color must be "{request.brand_kit.secondary_color}"')
    if request.brand_kit.text_color:
        brand_guidelines.append(f'Text Color must be "{request.brand_kit.text_color}"')
    
    if brand_guidelines:
        system_prompt += f" Strictly adhere to these brand guidelines: {'. '.join(brand_guidelines)}. If a value is not provided in the guidelines, generate a suitable one."

    final_prompt = f'{system_prompt}\n\nCampaign Description: "{request.prompt}"'

    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = await model.generate_content_async(
            final_prompt,
            generation_config=GenerationConfig(response_mime_type="application/json")
        )
        
        # The response text is a JSON string, so we parse it.
        response_json = json.loads(response.text)
        return CampaignAssets.parse_obj(response_json)

    except Exception as e:
        print(f"Failed to generate campaign assets: {e}")
        print(f"Raw response text: {getattr(e, 'text', 'N/A')}")
        raise HTTPException(status_code=500, detail="Could not parse the generated campaign assets.")


@app.post("/generate-image-asset")
async def generate_image_asset(request: GenerateImageAssetRequest):
    try:
        model = genai.GenerativeModel('gemini-1.5-flash-image')
        response = await model.generate_content_async(request.prompt)
        
        for part in response.candidates[0].content.parts:
            if part.inline_data:
                return {"image_data": part.inline_data.data}
        
        raise HTTPException(status_code=500, detail="Could not generate image from prompt.")

    except Exception as e:
        print(f"Failed to generate image asset: {e}")
        raise HTTPException(status_code=500, detail="Could not generate image from prompt.")


@app.post("/generate-landing-page-variant", response_model=LandingPageContent)
async def generate_landing_page_variant(base_assets: CampaignAssets):
    prompt = f"""You are a world-class A/B testing expert. Given the following landing page for the brand \"{base_assets.brand.name}\", create a compelling variation for an A/B test.
    The new variant should explore a different psychological angle for the headline, subheadline, and call to action. For example, if the original is benefit-driven, try making the variant scarcity-driven or focused on social proof.
    The tone should remain sophisticated and high-end.
    Do not change the number of sections or their icons.
    Original Landing Page Content: {base_assets.landing_page.json()}
    
    Generate new 'headline', 'subheadline', 'ctaButton', and 'sections' with updated 'title' and 'content' but the same 'icon' keywords from the original."""

    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = await model.generate_content_async(
            prompt,
            generation_config=GenerationConfig(response_mime_type="application/json")
        )
        response_json = json.loads(response.text)
        return LandingPageContent.parse_obj(response_json)
    except Exception as e:
        print(f"Failed to generate landing page variant: {e}")
        raise HTTPException(status_code=500, detail="Could not parse the generated landing page variant.")