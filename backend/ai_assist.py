"""
AI Assistant Module for Campaign Generation
Handles all AI-related operations using Google Gemini API and OpenAI via OpenRouter
"""

import os
import json
from typing import Dict, Any, AsyncGenerator, List
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
    raise ValueError("OPENROUTER_KEY environment variable not set")

#genai.configure(api_key=GEMINI_API_KEY)


def save_binary_file(file_name: str, data: bytes):
    """Helper to persist binary data returned by Gemini image generation"""
    with open(file_name, "wb") as f:
        f.write(data)
    print(f"File saved to: {file_name}")


class AIAssistant:
    """Main AI Assistant class handling all Gemini API interactions"""

    def __init__(self):
        # Initialize a Google Gemini client instance following the latest SDK pattern
        self.client = genai.Client(api_key=GEMINI_API_KEY)
        self.campaign_model = "gemini-2.5-flash"
        self.image_model = "gemini-2.5-flash-image"

        # Initialize OpenAI client for OpenRouter
        self.openai_client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=OPENROUTER_API_KEY,
        )

    async def generate_campaign_assets(
        self,
        prompt: str,
        brand_kit: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate complete campaign assets based on user prompt and brand kit (non-streaming)."""
        system_prompt = self._build_campaign_prompt(brand_kit)
        final_prompt = f"{system_prompt}\n\nCampaign Description: \"{prompt}\""

        contents = [
            types.Content(
                role="user",
                parts=[types.Part.from_text(text=final_prompt)],
            )
        ]

        config = types.GenerateContentConfig(response_modalities=["TEXT"])

        full_text = ""
        for chunk in self.client.models.generate_content_stream(
            model=self.campaign_model,
            contents=contents,
            config=config,
        ):
            if chunk.text:
                full_text += chunk.text

        try:
            return json.loads(full_text)
        except json.JSONDecodeError as e:
            print(f"Failed to decode JSON from Gemini response: {e}\nRaw: {full_text}")
            raise

    async def generate_campaign_assets_stream(
        self,
        prompt: str,
        brand_kit: Dict[str, Any]
    ) -> AsyncGenerator[str, None]:
        """Generate campaign assets and yield JSON chunks as they stream from Gemini."""
        system_prompt = self._build_campaign_prompt(brand_kit)
        final_prompt = f"{system_prompt}\n\nCampaign Description: \"{prompt}\""

        contents = [
            types.Content(
                role="user",
                parts=[types.Part.from_text(text=final_prompt)],
            )
        ]

        config = types.GenerateContentConfig(response_modalities=["TEXT"])

        for chunk in self.client.models.generate_content_stream(
            model=self.campaign_model,
            contents=contents,
            config=config,
        ):
            if chunk.text:
                yield chunk.text

    async def generate_image_asset(self, prompt: str, file_prefix: str = "image") -> None:
        """Asynchronously generate an image and save it to disk using a thread executor."""
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, self._generate_image_asset_sync, prompt, file_prefix)

    def _generate_image_asset_sync(self, prompt: str, file_prefix: str = "image") -> None:
        """Blocking helper that implements the actual Gemini call (extracted from original implementation)."""
        contents = [
            types.Content(
                role="user",
                parts=[types.Part.from_text(text=prompt)],
            )
        ]
        generate_content_config = types.GenerateContentConfig(
            response_modalities=["IMAGE", "TEXT"],
            image_config=types.ImageConfig(image_size="1K"),
        )

        file_index = 0
        for chunk in self.client.models.generate_content_stream(
            model=self.image_model,
            contents=contents,
            config=generate_content_config,
        ):
            if (
                chunk.candidates is None
                or chunk.candidates[0].content is None
                or chunk.candidates[0].content.parts is None
            ):
                continue

            part = chunk.candidates[0].content.parts[0]
            if part.inline_data and part.inline_data.data:
                file_name = f"{file_prefix}_{file_index}"
                file_index += 1
                data_buffer = part.inline_data.data
                file_extension = mimetypes.guess_extension(part.inline_data.mime_type)
                save_binary_file(f"{file_name}{file_extension}", data_buffer)
            else:
                print(chunk.text)

    async def generate_image_asset_stream(self, prompt: str) -> AsyncGenerator[str, None]:
        """Stream image data (base64) or text chunks from Gemini."""
        contents = [types.Content(role="user", parts=[types.Part.from_text(text=prompt)])]
        config = types.GenerateContentConfig(
            response_modalities=["IMAGE", "TEXT"],
            image_config=types.ImageConfig(image_size="1K"),
        )

        for chunk in self.client.models.generate_content_stream(
            model=self.image_model,
            contents=contents,
            config=config,
        ):
            if (
                chunk.candidates is None
                or chunk.candidates[0].content is None
                or chunk.candidates[0].content.parts is None
            ):
                continue

            part = chunk.candidates[0].content.parts[0]
            if part.inline_data and part.inline_data.data:
                yield part.inline_data.data  # binary chunk (base64)
            else:
                yield chunk.text

    async def generate_landing_page_variant(
        self,
        brand_name: str,
        landing_page_content: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate an A/B test variant of the landing page (non-streaming)."""
        prompt = self._build_variant_prompt(brand_name, landing_page_content)

        contents = [
            types.Content(role="user", parts=[types.Part.from_text(text=prompt)])
        ]
        config = types.GenerateContentConfig(response_modalities=["TEXT"])

        full_text = ""
        for chunk in self.client.models.generate_content_stream(
            model=self.campaign_model,
            contents=contents,
            config=config,
        ):
            if chunk.text:
                full_text += chunk.text
        try:
            return json.loads(full_text)
        except json.JSONDecodeError as e:
            print(f"Failed to decode JSON for landing page variant: {e}\nRaw: {full_text}")
            raise

    async def generate_landing_page_variant_stream(
        self,
        brand_name: str,
        landing_page_content: Dict[str, Any]
    ) -> AsyncGenerator[str, None]:
        """Stream A/B test variant chunks as they arrive from Gemini."""
        prompt = self._build_variant_prompt(brand_name, landing_page_content)
        contents = [types.Content(role="user", parts=[types.Part.from_text(text=prompt)])]
        config = types.GenerateContentConfig(response_modalities=["TEXT"])

        for chunk in self.client.models.generate_content_stream(
            model=self.campaign_model,
            contents=contents,
            config=config,
        ):
            if chunk.text:
                yield chunk.text

    async def generate_lp_variant_openrouter(
        self,
        brand_name: str,
        landing_page_content: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate an A/B test variant of the landing page using OpenRouter API (non-streaming)."""
        prompt = self._build_variant_prompt(brand_name, landing_page_content)
        messages = [{"role": "user", "content": prompt}]

        completion = self.openai_client.chat.completions.create(
            extra_headers={
                "HTTP-Referer": "<YOUR_SITE_URL>",  # Optional. Site URL for rankings on openrouter.ai.
                "X-Title": "<YOUR_SITE_NAME>",  # Optional. Site title for rankings on openrouter.ai.
            },
            extra_body={},
            model="openrouter/polaris-alpha",
            messages=messages,
        )
        full_text = completion.choices[0].message.content
        try:
            return json.loads(full_text)
        except json.JSONDecodeError as e:
            print(f"Failed to decode JSON for landing page variant: {e}\nRaw: {full_text}")
            raise

    async def generate_lp_variant_openrouter_stream(
        self,
        brand_name: str,
        landing_page_content: Dict[str, Any]
    ) -> AsyncGenerator[str, None]:
        """Generate an A/B test variant of the landing page using openrouter api"""
        prompt = self._build_variant_prompt(brand_name, landing_page_content)
        messages = [{"role": "user", "content": prompt}]

        loop = asyncio.get_event_loop()
        for chunk in await loop.run_in_executor(None, self._openai_stream, messages):
            yield chunk

    def _openai_stream(self, messages: List[Dict[str, Any]]):
        """Helper method to perform OpenAI streaming in a thread."""
        for chunk in self.openai_client.chat.completions.create(
            extra_headers={
                "HTTP-Referer": "<YOUR_SITE_URL>",  # Optional. Site URL for rankings on openrouter.ai.
                "X-Title": "<YOUR_SITE_NAME>",  # Optional. Site title for rankings on openrouter.ai.
            },
            extra_body={},
            model="openrouter/polaris-alpha",
            messages=messages,
            stream=True,
        ):
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content

    def _build_campaign_prompt(self, brand_kit: Dict[str, Any]) -> str:
        """Build the system prompt for campaign generation"""
        system_prompt = (
            "You are a world-class marketing and branding agency. "
            "Based on the following campaign description, generate a complete set of marketing assets. "
            "The assets must be sophisticated, modern, and high-end. "
            "Focus on clarity, a strong value proposition, and compelling language."
        )

        brand_guidelines = []
        if brand_kit.get('name'):
            brand_guidelines.append(f'Name must be "{brand_kit["name"]}"')
        if brand_kit.get('primary_color') or brand_kit.get('primaryColor'):
            color = brand_kit.get('primary_color') or brand_kit.get('primaryColor')
            brand_guidelines.append(f'Primary Color must be "{color}"')
        if brand_kit.get('secondary_color') or brand_kit.get('secondaryColor'):
            color = brand_kit.get('secondary_color') or brand_kit.get('secondaryColor')
            brand_guidelines.append(f'Secondary Color must be "{color}"')
        if brand_kit.get('text_color') or brand_kit.get('textColor'):
            color = brand_kit.get('text_color') or brand_kit.get('textColor')
            brand_guidelines.append(f'Text Color must be "{color}"')

        if brand_guidelines:
            system_prompt += (
                f" Strictly adhere to these brand guidelines: {'. '.join(brand_guidelines)}. "
                f"If a value is not provided in the guidelines, generate a suitable one."
            )

        return system_prompt

    def _build_variant_prompt(
        self,
        brand_name: str,
        landing_page_content: Dict[str, Any]
    ) -> str:
        """Build the prompt for landing page variant generation"""
        return f"""You are a world-class A/B testing expert. Given the following landing page for the brand "{brand_name}", create a compelling variation for an A/B test.
    The new variant should explore a different psychological angle for the headline, subheadline, and call to action. For example, if the original is benefit-driven, try making the variant scarcity-driven or focused on social proof.
    The tone should remain sophisticated and high-end.
    Do not change the number of sections or their icons.
    Original Landing Page Content: {json.dumps(landing_page_content)}

    Generate new 'headline', 'subheadline', 'ctaButton', and 'sections' with updated 'title' and 'content' but the same 'icon' keywords from the original."""


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
