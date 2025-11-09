import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: (process.env as any).GEMINI_API_KEY,
});

export async function generateCampaignVideo(brandKit: { name?: string }): Promise<string> {
  const brandName = brandKit.name || 'Rapid Campaign Generator';

  const prompt = `Create a cinematic advertisement for ${brandName}, an AI-powered rapid campaign generator that helps businesses create professional marketing campaigns instantly. Show dynamic visuals of a creative professional using the app on a laptop, with screens displaying campaign assets being generated in real-time - landing pages materializing, social media ads appearing, copy variants flowing, and videos rendering. Include sleek UI animations, glowing effects, and a sense of speed and innovation. End with the ${brandName} logo and tagline "Generate Campaigns at Lightning Speed". Style: Modern, professional, high-tech, cinematic lighting, fast-paced editing.`;

  try {
    const operation = await ai.models.generateVideos({
      model: "veo-3.1-generate-preview",
      prompt: prompt,
    });

    // Poll the operation status until the video is ready.
    while (!operation.done) {
      console.log("Waiting for video generation to complete...")
      await new Promise((resolve) => setTimeout(resolve, 10000));
      const updatedOperation = await ai.operations.getVideosOperation({
        operation: operation,
      });
      operation.done = updatedOperation.done;
      operation.response = updatedOperation.response;
    }

    // Get the video file URI
    const videoFile = operation.response.generatedVideos[0].video;
    const videoUri = videoFile.uri;

    console.log(`Generated video available at: ${videoUri}`);

    return videoUri;
  } catch (error) {
    console.error('Video generation failed:', error);
    throw new Error('Failed to generate campaign video');
  }
}
