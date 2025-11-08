"""
AI Assistant Module for Campaign Generation
Handles all AI-related operations using Google Gemini API
"""

import os
import json
from typing import Dict, Any, AsyncGenerator
from dotenv import load_dotenv
import google.generativeai as genai
from google.generativeai.types import GenerationConfig

# Load environment variables
load_dotenv()

# Configure Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable not set")

genai.configure(api_key=GEMINI_API_KEY)


class AIAssistant:
    """Main AI Assistant class handling all Gemini API interactions"""

    def __init__(self):
        self.campaign_model = genai.GenerativeModel('gemini-1.5-flash')
        self.image_model = genai.GenerativeModel('gemini-1.5-flash-image')

    async def generate_campaign_assets(
        self,
        prompt: str,
        brand_kit: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Generate complete campaign assets based on user prompt and brand kit

        Args:
            prompt: Campaign description from user
            brand_kit: Dictionary containing brand guidelines (name, colors)

        Returns:
            Dictionary containing complete campaign assets
        """
        system_prompt = self._build_campaign_prompt(brand_kit)
        final_prompt = f'{system_prompt}\n\nCampaign Description: "{prompt}"'

        try:
            response = await self.campaign_model.generate_content_async(
                final_prompt,
                generation_config=GenerationConfig(response_mime_type="application/json")
            )
            return json.loads(response.text)
        except Exception as e:
            print(f"Error generating campaign assets: {e}")
            raise

    async def generate_campaign_assets_stream(
        self,
        prompt: str,
        brand_kit: Dict[str, Any]
    ) -> AsyncGenerator[str, None]:
        """
        Generate complete campaign assets with streaming support

        Args:
            prompt: Campaign description from user
            brand_kit: Dictionary containing brand guidelines (name, colors)

        Yields:
            JSON chunks as they are generated
        """
        system_prompt = self._build_campaign_prompt(brand_kit)
        final_prompt = f'{system_prompt}\n\nCampaign Description: "{prompt}"'

        try:
            response = await self.campaign_model.generate_content_async(
                final_prompt,
                generation_config=GenerationConfig(response_mime_type="application/json"),
                stream=True
            )

            async for chunk in response:
                if chunk.text:
                    yield chunk.text
        except Exception as e:
            print(f"Error in streaming campaign assets: {e}")
            raise

    async def generate_image_asset(self, prompt: str) -> str:
        """
        Generate image asset from text prompt

        Args:
            prompt: Image generation prompt

        Returns:
            Base64-encoded image data
        """
        try:
            response = await self.image_model.generate_content_async(prompt)

            for part in response.candidates[0].content.parts:
                if part.inline_data:
                    return part.inline_data.data

            raise ValueError("No image data found in response")
        except Exception as e:
            print(f"Error generating image asset: {e}")
            raise

    async def generate_image_asset_stream(self, prompt: str) -> AsyncGenerator[str, None]:
        """
        Generate image asset with streaming support

        Args:
            prompt: Image generation prompt

        Yields:
            Base64-encoded image data chunks
        """
        try:
            response = await self.image_model.generate_content_async(prompt, stream=True)

            async for chunk in response:
                for part in chunk.candidates[0].content.parts:
                    if part.inline_data:
                        yield part.inline_data.data
        except Exception as e:
            print(f"Error in streaming image asset: {e}")
            raise

    async def generate_landing_page_variant(
        self,
        brand_name: str,
        landing_page_content: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Generate A/B test variant of landing page

        Args:
            brand_name: Name of the brand
            landing_page_content: Original landing page content

        Returns:
            Dictionary containing variant landing page content
        """
        prompt = self._build_variant_prompt(brand_name, landing_page_content)

        try:
            response = await self.campaign_model.generate_content_async(
                prompt,
                generation_config=GenerationConfig(response_mime_type="application/json")
            )
            return json.loads(response.text)
        except Exception as e:
            print(f"Error generating landing page variant: {e}")
            raise

    async def generate_landing_page_variant_stream(
        self,
        brand_name: str,
        landing_page_content: Dict[str, Any]
    ) -> AsyncGenerator[str, None]:
        """
        Generate A/B test variant with streaming support

        Args:
            brand_name: Name of the brand
            landing_page_content: Original landing page content

        Yields:
            JSON chunks of variant landing page content
        """
        prompt = self._build_variant_prompt(brand_name, landing_page_content)

        try:
            response = await self.campaign_model.generate_content_async(
                prompt,
                generation_config=GenerationConfig(response_mime_type="application/json"),
                stream=True
            )

            async for chunk in response:
                if chunk.text:
                    yield chunk.text
        except Exception as e:
            print(f"Error in streaming landing page variant: {e}")
            raise

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
