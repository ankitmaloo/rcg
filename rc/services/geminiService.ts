import type { CampaignAssets, BrandKit } from '../types';

const API_BASE_URL = 'http://localhost:8000';

// Type for tracking partial results during streaming
export type PartialAssets = {
  landingPageHtml?: string;
  instagramAdImage?: string;
  copyVariants?: string[];
  videoStatus?: string;
};
/**
 * Generate all campaign assets in parallel
 */
export async function generateCampaignAssets(prompt: string, brandKit: BrandKit, onProgress?: (partial: PartialAssets) => void): Promise<CampaignAssets> {
  const brandName = brandKit.name || 'Default Brand';

  // Make parallel requests
  const [landingPageRes, /*instagramRes, copyRes, videoRes*/] = await Promise.all([
    fetch(`${API_BASE_URL}/generate-landing-page`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, brand_name: brandName }),
    }),
    /*
    fetch(`${API_BASE_URL}/generate-instagram-ad`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, brand_name: brandName }),
    }),
    fetch(`${API_BASE_URL}/generate-copy-variants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, brand_name: brandName }),
    }),
    fetch(`${API_BASE_URL}/generate-video`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, brand_name: brandName }),
    }),*/
  ]);

  // Check responses
  if (!landingPageRes.ok /*|| !instagramRes.ok || !copyRes.ok || !videoRes.ok */) {
    throw new Error('Failed to generate campaign assets');
  }

  const [landingPage,/* instagram, copy, video*/] = await Promise.all([
        streamResponse(landingPageRes, (partial) => onProgress?.({ landingPageHtml: partial })),
    /*streamResponse(instagramRes),
    streamResponse(copyRes),
    streamResponse(videoRes),*/
  ]);

  return {
    landingPageHtml: landingPage.html,
    /*instagramAdImage: instagram.image,
    copyVariants: copy.copy,
    videoStatus: video.status,*/
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
                accumulatedResult.image = jsonChunk.image; // Instagram probably sends full image
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
              
              // Notify update
              onUpdate?.({...accumulatedResult});
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
            accumulatedResult.image = finalJson.image;
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
