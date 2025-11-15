import type { CampaignAssets, BrandKit, AssetSelection } from '../types';
import { generateCampaignVideo } from './videoService';

const API_BASE_URL = 'http://localhost:8000';

// Type for tracking partial results during streaming
export type PartialAssets = {
  landingPageHtml?: { html: string };
  instagramAdImage?: string;
  copyVariants?: string[];
  videoUrl?: string;
};
/**
 * Generate selected campaign assets in parallel
 */
export async function generateCampaignAssets(prompt: string, brandKit: BrandKit, assetSelection: AssetSelection, onProgress?: (partial: PartialAssets) => void): Promise<CampaignAssets> {
  const brandName = brandKit.name || 'Default Brand';

  // Start video generation in parallel if selected
  const videoPromise = assetSelection.video ? generateCampaignVideo(brandKit).catch((error) => {
    console.error('Video generation failed:', error);
    return undefined; // Return undefined if video fails, don't break the whole process
  }) : Promise.resolve(undefined);

  // Prepare fetch promises for selected assets
  const fetchPromises: Promise<Response>[] = [];
  const assetTypes: string[] = [];

  if (assetSelection.landingPage) {
    fetchPromises.push(fetch(`${API_BASE_URL}/generate-landing-page`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, brand_name: brandName, brandkit:brandKit }),
    }));
    assetTypes.push('landingPage');
  }

  if (assetSelection.ad) {
    fetchPromises.push(fetch(`${API_BASE_URL}/generate-instagram-ad`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, brand_name: brandName, model: "models/gemini-2.5-flash-image", brandkit:brandKit }),
    }));
    assetTypes.push('instagram');
  }

  if (assetSelection.copies) {
    fetchPromises.push(fetch(`${API_BASE_URL}/generate-copy-variants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: `Generate five copy variants for: ${prompt}`, brand_name: brandName, model: "models/gemini-2.5-flash" , brandkit:brandKit}),
    }));
    assetTypes.push('copy');
  }

  // Make parallel requests for selected assets
  const responses = await Promise.all(fetchPromises);

  // Check responses - only throw for critical landing page failure if selected
  const landingPageIndex = assetTypes.indexOf('landingPage');
  if (assetSelection.landingPage && landingPageIndex !== -1 && !responses[landingPageIndex].ok) {
    throw new Error('Failed to generate landing page');
  }

  // Stream responses for selected assets
  const results: { [key: string]: any } = {};

  for (let i = 0; i < responses.length; i++) {
    const response = responses[i];
    const assetType = assetTypes[i];

    if (assetType === 'landingPage') {
      results.landingPage = await streamResponse(response, (partial) => onProgress?.({ landingPageHtml: { html: partial.html } }));
    } else if (assetType === 'instagram') {
      results.instagram = response.ok ? await streamResponse(response, (partial) => onProgress?.({ instagramAdImage: partial.image })) : { image: '' };
    } else if (assetType === 'copy') {
      results.copy = response.ok ? await streamResponse(response, (partial) => onProgress?.({ copyVariants: partial.copy })) : { copy: [] };
    }
  }

  // Wait for video generation to complete if selected
  const videoUrl = await videoPromise;

  return {
    landingPageHtml: results.landingPage?.html || undefined,
    instagramAdImage: results.instagram?.image || undefined,
    copyVariants: results.copy?.copy || undefined,
    videoUrl,
  };
}

async function streamResponse(
  response: Response, 
  onUpdate?: (partial: any) => void
): Promise<any> {
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let accumulatedResult: any = null;

  // Initialize based on expected response type
  if (response.url.includes('/generate-landing-page')) {
    accumulatedResult = { html: '' };
  } else if (response.url.includes('/generate-instagram-ad')) {
    accumulatedResult = { image: '' };
  } else if (response.url.includes('/generate-copy-variants')) {
    accumulatedResult = { copy: [] };
  } else if (response.url.includes('/generate-video')) {
    accumulatedResult = { status: '' };
  }

  if (reader) {
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        
        // Split by newlines and process complete JSON objects
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep the last incomplete line in buffer
        
        for (const line of lines) {
          if (line.trim()) {
            try {
              const jsonChunk = JSON.parse(line.trim());
              
              // Accumulate based on response type
              if (jsonChunk.html !== undefined) {
                accumulatedResult.html += jsonChunk.html;
              }
              if (jsonChunk.image !== undefined) {
                accumulatedResult.image += jsonChunk.image; // Accumulate base64 chunks
              }
              if (jsonChunk.copy !== undefined) {
                if (Array.isArray(jsonChunk.copy)) {
                  accumulatedResult.copy = [...new Set([...accumulatedResult.copy, ...jsonChunk.copy])];
                } else if (typeof jsonChunk.copy === 'string') {
                  accumulatedResult.copy.push(jsonChunk.copy);
                }
              }
              if (jsonChunk.status !== undefined) {
                accumulatedResult.status = jsonChunk.status;
              }
              
              // Notify update - format for partial assets
              const partialUpdate: PartialAssets = {};
              if (jsonChunk.html !== undefined) {
                partialUpdate.landingPageHtml = { html: accumulatedResult.html };
              }
              if (jsonChunk.image !== undefined) {
                partialUpdate.instagramAdImage = accumulatedResult.image;
              }
              if (jsonChunk.copy !== undefined) {
                partialUpdate.copyVariants = accumulatedResult.copy;
              }
              if (jsonChunk.status !== undefined) {
                partialUpdate.videoUrl = accumulatedResult.status;
              }
              onUpdate?.(partialUpdate);
            } catch (e) {
              // Skip malformed JSON lines
              console.warn('Malformed JSON line:', line);
            }
          }
        }
      }
      
      // Process any remaining data in buffer
      if (buffer.trim()) {
        try {
          const finalJson = JSON.parse(buffer.trim());
          
          // Final accumulation
          if (finalJson.html !== undefined) {
            accumulatedResult.html += finalJson.html;
          }
          if (finalJson.image !== undefined) {
            accumulatedResult.image += finalJson.image;
          }
          if (finalJson.copy !== undefined) {
            if (Array.isArray(finalJson.copy)) {
              accumulatedResult.copy = [...new Set([...accumulatedResult.copy, ...finalJson.copy])];
            } else if (typeof finalJson.copy === 'string') {
              accumulatedResult.copy.push(finalJson.copy);
            }
          }
          if (finalJson.status !== undefined) {
            accumulatedResult.status = finalJson.status;
          }
          
          // Final update
          onUpdate?.({...accumulatedResult});
        } catch (e) {
          console.warn('Malformed final JSON:', buffer);
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  return accumulatedResult;
}

/**
 * Generate A/B test variant of landing page
 */
export async function generateLandingPageABTest(html: string, brandName: string): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/generate-landing-page-ab-test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ html, brand_name: brandName }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate A/B test variant');
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let accumulatedHtml = '';

  if (reader) {
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Split by newlines and process complete JSON objects
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep the last incomplete line in buffer

        for (const line of lines) {
          if (line.trim()) {
            try {
              const jsonChunk = JSON.parse(line.trim());
              if (jsonChunk.html !== undefined) {
                accumulatedHtml += jsonChunk.html;
              }
            } catch (e) {
              // Skip malformed JSON lines
              console.warn('Malformed JSON line:', line);
            }
          }
        }
      }

      // Process any remaining data in buffer
      if (buffer.trim()) {
        try {
          const finalJson = JSON.parse(buffer.trim());
          if (finalJson.html !== undefined) {
            accumulatedHtml += finalJson.html;
          }
        } catch (e) {
          console.warn('Malformed final JSON:', buffer);
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  return accumulatedHtml;
}

/**
 * Save a landing page and get a public URL
 */
export async function saveLandingPage(
  htmlContent: string,
  brandKit?: BrandKit,
  abVariantHtml?: string,
  seoMetadata?: any,
  customSlug?: string
): Promise<{
  success: boolean;
  id: string;
  slug: string;
  url: string;
  brand_name: string;
  created_at: string;
  has_ab_variant: boolean;
}> {
  const response = await fetch(`${API_BASE_URL}/api/save-landing-page`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      html_content: htmlContent,
      brand_kit: brandKit,
      ab_variant_html: abVariantHtml,
      seo_metadata: seoMetadata,
      custom_slug: customSlug,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to save landing page');
  }

  return await response.json();
}

/**
 * List all saved landing pages
 */
export async function listLandingPages(limit: number = 100): Promise<{
  pages: Array<{
    id: string;
    slug: string;
    brand_name: string;
    created_at: string;
    views_count: number;
    has_ab_variant: boolean;
  }>;
  count: number;
}> {
  const response = await fetch(`${API_BASE_URL}/api/landing-pages?limit=${limit}`);

  if (!response.ok) {
    throw new Error('Failed to fetch landing pages');
  }

  return await response.json();
}

/**
 * Get a specific landing page by ID
 */
export async function getLandingPageById(pageId: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/landing-pages/${pageId}`);

  if (!response.ok) {
    throw new Error('Failed to fetch landing page');
  }

  return await response.json();
}

/**
 * Delete a landing page
 */
export async function deleteLandingPage(pageId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/landing-pages/${pageId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete landing page');
  }
}
