"""
Simple AI Assistant Module for Campaign Generation
Separate methods for each asset type
"""

import os
import json
from typing import Dict, Any
from dotenv import load_dotenv
import base64
from google import genai
from google.genai import types
import mimetypes
import asyncio

# Load environment variables
load_dotenv()

# Configure Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable not set")

class AIAssistant:
    """Simple AI Assistant class"""

    def __init__(self):
        self.client = genai.Client(api_key=GEMINI_API_KEY)
        self.model = "gemini-2.5-flash"
        self.image_model = "gemini-2.5-flash-image"

    async def generate_landing_page(self, prompt: str, brand_name: str) -> str:
        """Generate landing page HTML"""
        full_prompt = f"Create a complete HTML landing page for {brand_name}. Campaign: {prompt}. Return only the HTML code."

        contents = [types.Content(role="user", parts=[types.Part.from_text(text=full_prompt)])]
        config = types.GenerateContentConfig(response_modalities=["TEXT"])

        full_text = ""
        for chunk in self.client.models.generate_content_stream(model=self.model, contents=contents, config=config):
            if chunk.text:
                full_text += chunk.text
                yield {"html": chunk.text}


        #return full_text.strip()

    async def generate_instagram_ad(self, prompt: str, brand_name: str) -> str:
        """Generate Instagram image ad (base64)"""
        full_prompt = f"Create an Instagram ad image for {brand_name}. Campaign: {prompt}."

        contents = [types.Content(role="user", parts=[types.Part.from_text(text=full_prompt)])]
        config = types.GenerateContentConfig(
            response_modalities=["IMAGE"],
            image_config=types.ImageConfig(image_size="1K")
        )

        for chunk in self.client.models.generate_content_stream(model=self.image_model, contents=contents, config=config):
            if (chunk.candidates and chunk.candidates[0].content and chunk.candidates[0].content.parts):
                part = chunk.candidates[0].content.parts[0]
                if part.inline_data and part.inline_data.data:
                    return base64.b64encode(part.inline_data.data).decode('utf-8')

        return ""

    async def generate_copy_variants(self, prompt: str, brand_name: str) -> str:
        """Generate copy variants"""
        full_prompt = f"Create 3 different ad copy variants for {brand_name}. Campaign: {prompt}. Return as plain text, one per line."

        contents = [types.Content(role="user", parts=[types.Part.from_text(text=full_prompt)])]
        config = types.GenerateContentConfig(response_modalities=["TEXT"])

        full_text = ""
        for chunk in self.client.models.generate_content_stream(model=self.model, contents=contents, config=config):
            if chunk.text:
                full_text += chunk.text

        return full_text.strip()



# Singleton instance
ai_assistant = AIAssistant()


def talk_to_gemini(text):
    client = genai.Client(
        api_key=GEMINI_API_KEY,
    )
    model = "gemini-2.5-flash"
    contents = [
        types.Content(
            role="user",
            parts=[
                types.Part.from_text(text=text),
            ],
        ),
    ]
    generate_content_config = types.GenerateContentConfig(
        thinking_config = types.ThinkingConfig(
            thinking_budget=-1,
        )
    )

    for chunk in client.models.generate_content_stream(model=model,contents=contents,config=generate_content_config,):
        yield chunk.text
