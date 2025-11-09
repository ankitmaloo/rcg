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
from openai import OpenAI

# Load environment variables
load_dotenv()

# Configure Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable not set")

# Configure OpenRouter API
OPENROUTER_API_KEY = os.getenv("OPENROUTER_KEY")
if not OPENROUTER_API_KEY:
    raise ValueError("OPENROUTER_API_KEY environment variable not set")

class AIAssistant:
    """Simple AI Assistant class"""

    def __init__(self):
        self.client = genai.Client(api_key=GEMINI_API_KEY)
        self.model = "gemini-2.5-flash"
        self.image_model = "gemini-2.5-flash-image"
        self.openrouter_client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=OPENROUTER_API_KEY,
        )

    async def generate_landing_page(self, prompt: str, brand_name: str) -> str:
        """Generate landing page HTML"""
        full_prompt = f"Create an advertising landing page for {brand_name}. Campaign: {prompt}. Return only the HTML code. RULES: 1/ The page should be highly optimized for conversion. this page would be used in ad campaigns, so shoudl be aesthetically pleasing, and focused for conversion. Design like a high end and very expensive agency would design the page. Make sure brand name and brand assets are used in the landing page."

        completion = self.openrouter_client.chat.completions.create(
            extra_headers={
                "HTTP-Referer": "http://localhost",
                "X-Title": "RC Generator",
            },
            model="openrouter/polaris-alpha",
            messages=[
                {
                    "role": "user",
                    "content": full_prompt
                }
            ],
            stream=True
        )

        for chunk in completion:
            if chunk.choices[0].delta.content:
                yield {"html": chunk.choices[0].delta.content}

    async def generate_instagram_ad(self, prompt: str, brand_name: str):
        """Generate Instagram image ad (base64 chunks)"""
        full_prompt = f"Create a highly conversion optimized Instagram ad image for {brand_name}. Campaign is this: {prompt}. Make sure you use the brand name/theme and assets "

        contents = [types.Content(role="user", parts=[types.Part.from_text(text=full_prompt)])]
        config = types.GenerateContentConfig(
            response_modalities=["IMAGE", "TEXT"],
            image_config=types.ImageConfig(image_size="1K")
        )

        for chunk in self.client.models.generate_content_stream(model=self.image_model, contents=contents, config=config):
            if (chunk.candidates and chunk.candidates[0].content and chunk.candidates[0].content.parts):
                part = chunk.candidates[0].content.parts[0]
                if part.inline_data and part.inline_data.data:
                    # Send base64 encoded chunk to UI
                    base64_chunk = base64.b64encode(part.inline_data.data).decode('utf-8')
                    yield {"image": base64_chunk}
                elif chunk.text:
                    print(chunk.text)  # Print any text chunks

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

    async def generate_landing_page_ab_test(self, html_content: str, brand_name: str) -> str:
        """Generate A/B test variant of landing page HTML"""
        full_prompt = f"Take this existing landing page HTML for {brand_name} and create a minor A/B test variant. Make small, strategic changes that could improve conversion rates - like changing button text, adjusting headlines, modifying call-to-action placement, or tweaking the value proposition messaging. Keep the overall structure and design similar but make meaningful optimization changes. Return only the modified HTML code.\n\nOriginal HTML:\n{html_content}"

        contents = [types.Content(role="user", parts=[types.Part.from_text(text=full_prompt)])]
        config = types.GenerateContentConfig(response_modalities=["TEXT"])

        full_text = ""
        for chunk in self.client.models.generate_content_stream(model=self.model, contents=contents, config=config):
            if chunk.text:
                full_text += chunk.text
                yield {"html": chunk.text}

        #return full_text.strip()



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
