import type { CampaignAssets, BrandKit, LandingPageContent } from '../types';

const API_BASE_URL = 'http://localhost:8000';

export async function generateCampaignAssets(prompt: string, brandKit: BrandKit): Promise<CampaignAssets> {
  const response = await fetch(`${API_BASE_URL}/generate-campaign-assets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt, brandKit }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to generate campaign assets');
  }

  return response.json();
}

export async function generateImageAsset(prompt: string): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/generate-image-asset`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to generate image asset');
    }

    const data = await response.json();
    return data.image_data;
}

export async function generateLandingPageVariant(baseAssets: CampaignAssets): Promise<LandingPageContent> {
    const response = await fetch(`${API_BASE_URL}/generate-landing-page-variant`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(baseAssets),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to generate landing page variant');
    }

    return response.json();
}
