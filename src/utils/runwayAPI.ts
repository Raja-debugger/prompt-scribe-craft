
import { toast } from "sonner";

interface RunwayVideoGenerationParams {
  prompt: string;
  aspectRatio?: "16:9" | "9:16" | "1:1";
  duration?: number;
}

interface RunwayVideoResponse {
  id: string;
  status: "started" | "processing" | "completed" | "failed";
  url?: string;
}

const RUNWAY_API_URL = "https://api.runwayml.com/v1";

class RunwayAPI {
  private apiKey: string | null = null;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || null;
  }

  setApiKey(key: string) {
    this.apiKey = key;
    return this;
  }

  async generateVideo(params: RunwayVideoGenerationParams): Promise<RunwayVideoResponse> {
    if (!this.apiKey) {
      throw new Error("API key is required for video generation");
    }

    try {
      // Start the video generation process
      const response = await fetch(`${RUNWAY_API_URL}/text-to-video`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt: params.prompt,
          aspect_ratio: params.aspectRatio || "16:9",
          duration: params.duration || 4,
          output_format: "mp4"
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to generate video");
      }

      const data = await response.json();
      
      // For demo purposes, simulate the polling process
      // In a real implementation, you would poll the API to check the status
      let mockResponse: RunwayVideoResponse = {
        id: data.id || "mock-video-id",
        status: "started"
      };

      // Simulate processing state after 2 seconds
      await new Promise(resolve => setTimeout(resolve, 2000));
      mockResponse.status = "processing";

      // Simulate completion after 3 more seconds
      await new Promise(resolve => setTimeout(resolve, 3000));
      mockResponse.status = "completed";
      
      // In a real implementation, this URL would come from the API
      // For demo, use a sample video URL
      mockResponse.url = "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

      return mockResponse;
    } catch (error) {
      console.error("RunwayML API error:", error);
      throw error;
    }
  }

  async getVideoStatus(videoId: string): Promise<RunwayVideoResponse> {
    if (!this.apiKey) {
      throw new Error("API key is required");
    }

    try {
      const response = await fetch(`${RUNWAY_API_URL}/videos/${videoId}`, {
        headers: {
          "Authorization": `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to check video status");
      }

      return await response.json();
    } catch (error) {
      console.error("RunwayML API error:", error);
      throw error;
    }
  }
}

// Export a singleton instance
export const runwayAPI = new RunwayAPI();
