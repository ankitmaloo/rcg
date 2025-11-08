import type { CampaignAssets, BrandKit, LandingPageContent } from '../types';

const API_BASE_URL = 'http://localhost:8000';

/**
 * Generate campaign assets (non-streaming)
 */
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

/**
 * Generate campaign assets with streaming support
 * Each chunk is delivered as it's generated for real-time updates
 */
export async function generateCampaignAssetsStream(
  prompt: string,
  brandKit: BrandKit,
  onChunk: (chunk: string) => void,
  onComplete: (data: CampaignAssets) => void,
  onError: (error: Error) => void
): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/generate-campaign-assets-stream`, {
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

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is not readable');
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');

      // Keep the last incomplete line in the buffer
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = JSON.parse(line.slice(6));

          if (data.error) {
            throw new Error(data.error);
          }

          if (data.chunk) {
            fullText += data.chunk;
            onChunk(data.chunk);
          }
        }
      }
    }

    // Parse the complete response
    if (fullText) {
      const result = JSON.parse(fullText);
      onComplete(result);
    }
  } catch (error) {
    onError(error instanceof Error ? error : new Error('Unknown error occurred'));
  }
}

/**
 * Generate image asset (non-streaming)
 */
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

/**
 * Generate image asset with streaming support
 */
export async function generateImageAssetStream(
  prompt: string,
  onChunk: (chunk: string) => void,
  onComplete: (imageData: string) => void,
  onError: (error: Error) => void
): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/generate-image-asset-stream`, {
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

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is not readable');
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let fullData = '';

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');

      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = JSON.parse(line.slice(6));

          if (data.error) {
            throw new Error(data.error);
          }

          if (data.chunk) {
            fullData += data.chunk;
            onChunk(data.chunk);
          }
        }
      }
    }

    if (fullData) {
      onComplete(fullData);
    }
  } catch (error) {
    onError(error instanceof Error ? error : new Error('Unknown error occurred'));
  }
}

/**
 * Generate landing page variant (non-streaming)
 */
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

/**
 * Generate landing page variant with streaming support
 */
export async function generateLandingPageVariantStream(
  baseAssets: CampaignAssets,
  onChunk: (chunk: string) => void,
  onComplete: (data: LandingPageContent) => void,
  onError: (error: Error) => void
): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/generate-landing-page-variant-stream`, {
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

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is not readable');
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');

      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = JSON.parse(line.slice(6));

          if (data.error) {
            throw new Error(data.error);
          }

          if (data.chunk) {
            fullText += data.chunk;
            onChunk(data.chunk);
          }
        }
      }
    }

    if (fullText) {
      const result = JSON.parse(fullText);
      onComplete(result);
    }
  } catch (error) {
    onError(error instanceof Error ? error : new Error('Unknown error occurred'));
  }
}
