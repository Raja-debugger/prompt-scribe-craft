
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
// Using a dedicated API key for the application
const RUNWAY_API_KEY = "rw_8kfhdGTj66JvZGyhsAVMpV7wZIFBJZgLsN4KnPb3sMOkw";

class RunwayAPI {
  async generateVideo(params: RunwayVideoGenerationParams): Promise<RunwayVideoResponse> {
    try {
      console.log("Starting video generation with prompt:", params.prompt);
      
      // In a real implementation, this would make an actual API call
      // For this demo, we'll simulate the API response
      const mockVideoId = `video-${Date.now()}`;
      
      // Notify the user that generation has started
      toast.info("Video generation has started", {
        description: "This process typically takes 1-2 minutes.",
        duration: 3000
      });
      
      // Simulate the video generation process with realistic timing
      const mockResponse: RunwayVideoResponse = {
        id: mockVideoId,
        status: "started"
      };

      // Simulate processing state after 2 seconds
      await new Promise(resolve => setTimeout(resolve, 2000));
      mockResponse.status = "processing";
      
      // Simulate completion after 3 more seconds
      await new Promise(resolve => setTimeout(resolve, 3000));
      mockResponse.status = "completed";
      
      // In a real implementation, this URL would come from the API
      // For demo, use sample videos based on topics
      const sampleVideos = [
        "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
        "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
        "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4"
      ];
      
      // Choose a video based on the hash of the prompt to get consistent results for the same topic
      const promptHash = params.prompt.split("").reduce((hash, char) => char.charCodeAt(0) + hash, 0);
      mockResponse.url = sampleVideos[promptHash % sampleVideos.length];
      
      console.log("Video generation completed:", mockResponse);
      return mockResponse;
    } catch (error) {
      console.error("RunwayML API error:", error);
      throw error;
    }
  }

  async getVideoStatus(videoId: string): Promise<RunwayVideoResponse> {
    try {
      console.log("Checking status for video:", videoId);
      
      // In a real implementation, this would make an actual API call
      // For this demo, we'll simulate the API response
      const mockResponse: RunwayVideoResponse = {
        id: videoId,
        status: "completed",
        url: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
      };
      
      return mockResponse;
    } catch (error) {
      console.error("RunwayML API error:", error);
      throw error;
    }
  }
}

// Export a singleton instance
export const runwayAPI = new RunwayAPI();
