import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { CampaignAssets, BrandKit, LandingPageContent } from '../types';

const landingPageSectionSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: 'Title for the section.' },
        content: { type: Type.STRING, description: 'A paragraph of content for the section.' },
        icon: { type: Type.STRING, description: 'A relevant keyword for a solid-style icon from heroicons.com (e.g., "rocket", "shield-check", "star"). The full list is available on their website.' }
    },
    required: ['title', 'content', 'icon']
};

const landingPageSchema = {
    type: Type.OBJECT,
    properties: {
    headline: { type: Type.STRING, description: 'A powerful, attention-grabbing headline for the landing page.' },
    subheadline: { type: Type.STRING, description: 'A supportive subheadline that adds context to the headline.' },
    ctaButton: { type: Type.STRING, description: 'Compelling call-to-action text for the main button (e.g., "Get Started Now").' },
    sections: {
        type: Type.ARRAY,
        description: 'Three sections detailing features or benefits.',
        items: landingPageSectionSchema
    }
    },
    required: ['headline', 'subheadline', 'ctaButton', 'sections']
};

const campaignSchema = {
  type: Type.OBJECT,
  properties: {
    brand: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: 'A catchy brand name derived from the user prompt.' },
        primaryColor: { type: Type.STRING, description: 'A hex code for the primary brand color (e.g., #4F46E5).' },
        secondaryColor: { type: Type.STRING, description: 'A hex code for the secondary accent color (e.g., #FBBF24).' },
        textColor: { type: Type.STRING, description: 'A hex code for primary text color that has good contrast with the background, e.g., #FFFFFF or #111827.'}
      },
      required: ['name', 'primaryColor', 'secondaryColor', 'textColor']
    },
    landingPage: landingPageSchema,
    adCopy: {
      type: Type.OBJECT,
      properties: {
        facebook: { type: Type.STRING, description: 'Engaging ad copy for a Facebook post.' },
        instagram: { type: Type.STRING, description: 'Catchy and visual-focused ad copy for an Instagram post, including hashtags.' },
        linkedin: { type: Type.STRING, description: 'Professional and value-oriented ad copy for a LinkedIn post.' }
      },
      required: ['facebook', 'instagram', 'linkedin']
    },
    assetPrompts: {
      type: Type.ARRAY,
      description: 'Prompts for generating visual assets for the campaign.',
      items: {
        type: Type.OBJECT,
        properties: {
          platform: { type: Type.STRING, description: 'The intended use for the asset (e.g., "Landing Page Hero Image", "Facebook Ad").' },
          prompt: { type: Type.STRING, description: 'A detailed, descriptive prompt for an AI image generation model like Imagen, creating a photorealistic image.' }
        },
        required: ['platform', 'prompt']
      }
    },
    seo: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: 'SEO title tag content, under 60 characters.' },
        description: { type: Type.STRING, description: 'Meta description content, under 160 characters.' },
        keywords: { type: Type.STRING, description: 'A comma-separated list of relevant SEO keywords.' }
      },
       required: ['title', 'description', 'keywords']
    },
    tracking: {
      type: Type.OBJECT,
      properties: {
        googleTagManagerId: { type: Type.STRING, description: 'A placeholder Google Tag Manager ID in the format GTM-XXXXXXX.' },
        facebookPixelId: { type: Type.STRING, description: 'A placeholder Facebook Pixel ID, as a long number (e.g., 123456789012345).' }
      },
      required: ['googleTagManagerId', 'facebookPixelId']
    }
  },
  required: ['brand', 'landingPage', 'adCopy', 'assetPrompts', 'seo', 'tracking']
};


export async function generateCampaignAssets(prompt: string, brandKit: BrandKit): Promise<CampaignAssets> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  let systemPrompt = `You are a world-class marketing and branding agency. Based on the following campaign description, generate a complete set of marketing assets. The assets must be sophisticated, modern, and high-end. Focus on clarity, a strong value proposition, and compelling language.`;

  const brandGuidelines = Object.entries(brandKit)
    .filter(([, value]) => value)
    .map(([key, value]) => {
        if (!value) return '';
        const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        return `${formattedKey} must be "${value}"`;
    }).join('. ');

  if (brandGuidelines) {
      systemPrompt += ` Strictly adhere to these brand guidelines: ${brandGuidelines}. If a value is not provided in the guidelines, generate a suitable one.`;
  }

  const finalPrompt = `${systemPrompt}\n\nCampaign Description: "${prompt}"`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: finalPrompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: campaignSchema,
    },
  });

  const jsonString = response.text.trim();
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed.brand || !parsed.landingPage) {
        throw new Error("Invalid structure in generated JSON");
    }
    return parsed as CampaignAssets;
  } catch(e) {
    console.error("Failed to parse Gemini response:", e);
    console.error("Raw response string:", jsonString);
    throw new Error("Could not parse the generated campaign assets.");
  }
}

export async function generateImageAsset(prompt: string): Promise<string> {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            return part.inlineData.data;
        }
    }
    throw new Error("Could not generate image from prompt.");
}

export async function generateLandingPageVariant(baseAssets: CampaignAssets): Promise<LandingPageContent> {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const { landingPage, brand } = baseAssets;

    const prompt = `You are a world-class A/B testing expert. Given the following landing page for the brand "${brand.name}", create a compelling variation for an A/B test.
    The new variant should explore a different psychological angle for the headline, subheadline, and call to action. For example, if the original is benefit-driven, try making the variant scarcity-driven or focused on social proof.
    The tone should remain sophisticated and high-end.
    Do not change the number of sections or their icons.
    Original Landing Page Content: ${JSON.stringify(landingPage)}
    
    Generate new 'headline', 'subheadline', 'ctaButton', and 'sections' with updated 'title' and 'content' but the same 'icon' keywords from the original.`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: landingPageSchema,
        },
    });

    const jsonString = response.text.trim();
    try {
        const parsed = JSON.parse(jsonString);
        if (!parsed.headline || !parsed.sections) {
            throw new Error("Invalid structure in generated JSON for variant");
        }
        return parsed as LandingPageContent;
    } catch(e) {
        console.error("Failed to parse Gemini response for variant:", e);
        console.error("Raw response string:", jsonString);
        throw new Error("Could not parse the generated landing page variant.");
    }
}