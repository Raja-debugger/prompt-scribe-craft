
import { toast } from "sonner";

interface SummarizeParams {
  text: string;
}

interface ChatParams {
  message: string;
  history?: Array<{role: string, content: string}>;
}

class GeminiAPI {
  // Using a default API key for demo purposes
  private apiKey: string | null = "demo-api-key-for-testing-purposes-only";

  setApiKey(key: string) {
    this.apiKey = key;
    localStorage.setItem("gemini_api_key", key);
  }

  getApiKey(): string | null {
    if (!this.apiKey) {
      this.apiKey = localStorage.getItem("gemini_api_key") || "demo-api-key-for-testing-purposes-only";
    }
    return this.apiKey;
  }

  async summarizeText(params: SummarizeParams): Promise<string> {
    try {
      console.log("Starting text summarization with Gemini AI");
      
      // Get API key without prompting the user
      const apiKey = this.getApiKey();
      
      // For this demo, we'll simulate the API call
      toast.info("Summarizing your article", {
        description: "This may take a few seconds...",
        duration: 3000
      });
      
      // Simulate API processing time
      await new Promise(resolve => setTimeout(resolve, 2000));

      // This is where you would make the actual Gemini API call
      // Improved summarization logic to capture key points
      const text = params.text;
      
      // Extract key information from the text
      const paragraphs = text.split("\n\n");
      
      // Generate a comprehensive summary with key points
      let summary = "";
      let keyPoints: string[] = [];
      
      // Process each paragraph for key information
      paragraphs
        .filter(p => p.trim().length > 0 && !p.startsWith('#'))
        .forEach(p => {
          // Look for paragraphs with important indicators
          const isImportant = /(\d+%|key|important|significant|main|critical|essential|conclusion)/i.test(p);
          
          const sentences = p.split(/[.!?]+/).filter(s => s.trim().length > 0);
          
          if (isImportant && sentences.length > 0) {
            // For important paragraphs, take more sentences
            const sentencesToTake = Math.min(sentences.length, 3);
            for (let i = 0; i < sentencesToTake; i++) {
              keyPoints.push(sentences[i] + ".");
            }
          } else if (sentences.length > 0) {
            // For regular paragraphs, take the first sentence
            keyPoints.push(sentences[0] + ".");
          }
        });
      
      // Ensure we don't have too many points (limit to 10 key points)
      keyPoints = keyPoints.slice(0, 10);
      
      // Format the summary with an introduction
      if (keyPoints.length > 0) {
        // Extract title from the original text if possible
        const titleMatch = text.match(/^# \*\*(.*?)\*\*/);
        const title = titleMatch ? titleMatch[1] : "Article";
        
        summary = `Here's a summary of the article on ${title}:\n\n`;
        
        // Add key points in a clean format
        summary += keyPoints.map(point => point).join(" ");
      } else {
        summary = "Unable to generate summary. The content may be too short or in an unsupported format.";
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
      
      // Get API key without prompting the user
      const apiKey = this.getApiKey();
      
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
