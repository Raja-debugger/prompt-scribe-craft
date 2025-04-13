
import { toast } from "sonner";

interface RunwayVoiceGenerationParams {
  text: string;
  voice?: string;
}

interface RunwayVoiceResponse {
  id: string;
  status: "started" | "processing" | "completed" | "failed";
  url?: string;
}

// Using a dedicated API key for the application
const RUNWAY_API_KEY = "rw_8kfhdGTj66JvZGyhsAVMpV7wZIFBJZgLsN4KnPb3sMOkw";

class RunwayAPI {
  async generateVoiceOver(params: RunwayVoiceGenerationParams): Promise<RunwayVoiceResponse> {
    try {
      console.log("Starting voice over generation with text:", params.text);
      
      // In a real implementation, this would make an actual API call
      // For this demo, we'll simulate the API response
      const mockVoiceId = `voice-${Date.now()}`;
      
      // Notify the user that generation has started
      toast.info("Voice over generation has started", {
        description: "This process typically takes a few seconds.",
        duration: 3000
      });
      
      // Simulate the voice over generation process with realistic timing
      const mockResponse: RunwayVoiceResponse = {
        id: mockVoiceId,
        status: "started"
      };

      // Simulate processing state after 1 second
      await new Promise(resolve => setTimeout(resolve, 1000));
      mockResponse.status = "processing";
      
      // Simulate completion after 2 more seconds
      await new Promise(resolve => setTimeout(resolve, 2000));
      mockResponse.status = "completed";
      
      // In a real implementation, this URL would come from the API
      // For demo, use sample audio files based on text
      const sampleAudios = [
        "https://audio-samples.github.io/samples/mp3/blizzard_biased/sample-1.mp3",
        "https://audio-samples.github.io/samples/mp3/blizzard_biased/sample-2.mp3",
        "https://audio-samples.github.io/samples/mp3/blizzard_biased/sample-3.mp3"
      ];
      
      // Choose an audio based on the hash of the text to get consistent results for the same topic
      const textHash = params.text.split("").reduce((hash, char) => char.charCodeAt(0) + hash, 0);
      mockResponse.url = sampleAudios[textHash % sampleAudios.length];
      
      console.log("Voice over generation completed with URL:", mockResponse.url);
      toast.success("Voice over generated successfully");
      
      return mockResponse;
    } catch (error) {
      console.error("RunwayML API error:", error);
      toast.error("Failed to generate voice over");
      throw error;
    }
  }

  async getVoiceStatus(voiceId: string): Promise<RunwayVoiceResponse> {
    try {
      console.log("Checking status for voice over:", voiceId);
      
      // In a real implementation, this would make an actual API call
      // For this demo, we'll simulate the API response
      const mockResponse: RunwayVoiceResponse = {
        id: voiceId,
        status: "completed",
        url: "https://audio-samples.github.io/samples/mp3/blizzard_biased/sample-1.mp3"
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
