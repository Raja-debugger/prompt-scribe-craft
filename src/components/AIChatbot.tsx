
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { MessageSquare, Send, X, Minimize, Maximize } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Avatar } from "@/components/ui/avatar";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const AIChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi there! I'm your AI assistant. Ask me anything about this project or any concept related to article generation.",
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      role: "user",
      content: message,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);
    
    try {
      // Simulate AI response (in production this would call an actual AI API)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      let responseContent = "";
      
      // Simple pattern matching for demo purposes
      const lowerCaseMessage = message.toLowerCase();
      
      if (lowerCaseMessage.includes("article generation")) {
        responseContent = "This project is an AI-powered article generation tool that can create content based on research from Wikipedia. It also includes features like SEO analysis, image suggestions, and social media captions.";
      } else if (lowerCaseMessage.includes("video") || lowerCaseMessage.includes("lumen5")) {
        responseContent = "The video generation feature uses Lumen5 API to create short 20-25 second videos summarizing the generated articles. You can access this feature from the article options.";
      } else if (lowerCaseMessage.includes("how to")) {
        responseContent = "To generate an article, simply enter a topic in the input field and click the Generate Article button. The AI will research the topic and create a well-structured article for you.";
      } else if (lowerCaseMessage.includes("feature") || lowerCaseMessage.includes("can you do")) {
        responseContent = "I can help with article generation, SEO optimization, social media caption creation, hashtag generation, readability analysis, and now video generation. Is there a specific feature you'd like to know more about?";
      } else {
        responseContent = "I'm an AI assistant designed to help with this article generation project. I can answer questions about how to use the features, explain concepts, or provide guidance on content creation. What specific information are you looking for?";
      }
      
      const assistantMessage: Message = {
        role: "assistant",
        content: responseContent,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      toast.error("Failed to get response. Please try again.");
      console.error("Error getting AI response:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {!isOpen && (
        <Button
          onClick={toggleChatbot}
          className="fixed bottom-6 right-6 rounded-full h-14 w-14 shadow-lg bg-primary hover:bg-primary/90 z-50"
        >
          <MessageSquare size={24} />
        </Button>
      )}

      {isOpen && (
        <Card
          className={`fixed bottom-6 right-6 w-80 sm:w-96 shadow-xl border z-50 transition-all duration-300 ease-in-out ${
            isMinimized ? "h-16" : "h-[500px] max-h-[80vh]"
          }`}
        >
          <CardHeader className="p-4 flex flex-row items-center justify-between bg-primary text-primary-foreground rounded-t-lg">
            <CardTitle className="text-sm font-medium">AI Assistant</CardTitle>
            <div className="flex space-x-2">
              {isMinimized ? (
                <Button variant="ghost" size="icon" onClick={toggleMinimize} className="h-6 w-6 text-primary-foreground hover:text-primary-foreground/90 hover:bg-primary/90">
                  <Maximize size={14} />
                </Button>
              ) : (
                <Button variant="ghost" size="icon" onClick={toggleMinimize} className="h-6 w-6 text-primary-foreground hover:text-primary-foreground/90 hover:bg-primary/90">
                  <Minimize size={14} />
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={toggleChatbot} className="h-6 w-6 text-primary-foreground hover:text-primary-foreground/90 hover:bg-primary/90">
                <X size={14} />
              </Button>
            </div>
          </CardHeader>

          {!isMinimized && (
            <>
              <CardContent className="flex-1 overflow-auto p-4 h-[calc(500px-130px)]">
                <div className="space-y-4">
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          {msg.role === "assistant" && (
                            <Avatar className="h-6 w-6">
                              <div className="bg-primary text-primary-foreground rounded-full flex items-center justify-center h-full w-full text-xs">AI</div>
                            </Avatar>
                          )}
                          <span className="text-xs opacity-70">
                            {formatTime(msg.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </CardContent>

              <CardFooter className="p-4 pt-2">
                <form onSubmit={handleSubmit} className="flex w-full space-x-2">
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="min-h-[40px] max-h-[120px]"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                  />
                  <Button 
                    type="submit" 
                    size="icon" 
                    disabled={isLoading || !message.trim()}
                    className={`shrink-0 ${isLoading ? 'opacity-70' : ''}`}
                  >
                    <Send size={18} />
                  </Button>
                </form>
              </CardFooter>
            </>
          )}
        </Card>
      )}
    </>
  );
};

export default AIChatbot;
