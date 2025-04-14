
import { toast } from "sonner";

interface SummarizeParams {
  text: string;
}

interface ChatParams {
  message: string;
  history?: Array<{role: string, content: string}>;
}

class GeminiAPI {
  private apiKey: string | null = null;

  setApiKey(key: string) {
    this.apiKey = key;
    localStorage.setItem("gemini_api_key", key);
  }

  getApiKey(): string | null {
    if (!this.apiKey) {
      this.apiKey = localStorage.getItem("gemini_api_key");
    }
    return this.apiKey;
  }

  async summarizeText(params: SummarizeParams): Promise<string> {
    try {
      console.log("Starting text summarization with Gemini API");
      
      const apiKey = this.getApiKey();
      if (!apiKey) {
        const promptedKey = prompt("Please enter your Gemini API key to use the summarization feature:");
        if (!promptedKey) {
          throw new Error("API key is required for summarization");
        }
        this.setApiKey(promptedKey);
      }
      
      // For this demo, we'll simulate the API call
      toast.info("Summarizing your article", {
        description: "This may take a few seconds...",
        duration: 3000
      });
      
      // Simulate API processing time
      await new Promise(resolve => setTimeout(resolve, 2000));

      // This is where you would make the actual Gemini API call
      // For now, we'll create a simple summarization logic
      const text = params.text;
      
      // Create a concise summary - extract only first sentence from each paragraph
      // and limit to 8 lines maximum
      const paragraphs = text.split("\n\n");
      const firstSentences = paragraphs
        .filter(p => p.trim().length > 0 && !p.startsWith('#'))
        .map(p => {
          const sentences = p.split(/[.!?]+/);
          return sentences[0] ? sentences[0] + "." : "";
        })
        .filter(s => s.length > 0);
      
      // Limit to 8 sentences max
      let summary = firstSentences.slice(0, 8).join(" ");
      
      // Make sure it's not too long overall
      if (summary.length > 600) {
        summary = summary.substring(0, 600) + "...";
      }
      
      console.log("Text summarization completed successfully");
      toast.success("Summarization completed");
      
      return summary;
    } catch (error) {
      console.error("Gemini API error:", error);
      toast.error("Failed to summarize text");
      throw error;
    }
  }

  async chatWithGemini(params: ChatParams): Promise<string> {
    try {
      console.log("Starting chat with Gemini API");
      
      const apiKey = this.getApiKey();
      if (!apiKey) {
        const promptedKey = prompt("Please enter your Gemini API key to use the chat feature:");
        if (!promptedKey) {
          throw new Error("API key is required for chat");
        }
        this.setApiKey(promptedKey);
      }
      
      // For this demo, we'll simulate the API call
      // Simulate API processing time
      await new Promise(resolve => setTimeout(resolve, 1000));

      // This is where you would make the actual Gemini API call with chat history
      const userMessage = params.message;
      
      // Create a simulated response based on the user query
      let response = "";
      
      if (userMessage.toLowerCase().includes("hello") || userMessage.toLowerCase().includes("hi")) {
        response = "Hello! I'm your Gemini AI assistant. How can I help you today?";
      } else if (userMessage.toLowerCase().includes("weather")) {
        response = "I don't have real-time weather data, but I can help you with content creation, summarization, and answering questions about various topics.";
      } else if (userMessage.toLowerCase().includes("help")) {
        response = "I can help with article writing, research, answering questions, summarizing content, and providing information on various topics. What specific assistance do you need?";
      } else if (userMessage.toLowerCase().includes("thank")) {
        response = "You're welcome! Feel free to ask if you need any more assistance.";
      } else {
        // Generate a more elaborate response for other queries
        response = `Based on your question about "${userMessage}", I can provide you with detailed information and insights. This would be a comprehensive answer drawing from my knowledge base, providing relevant facts, context, and explanations to help you understand the topic better. In a real implementation, this would be powered by the actual Gemini API, which can generate detailed, nuanced responses to a wide range of queries.`;
      }
      
      console.log("Chat response generated successfully");
      return response;
    } catch (error) {
      console.error("Gemini API chat error:", error);
      throw error;
    }
  }
}

// Export a singleton instance
export const geminiAPI = new GeminiAPI();
