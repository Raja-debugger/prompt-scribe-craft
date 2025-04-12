
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { MessageSquare, Send, X, Minimize, Maximize, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Avatar } from "@/components/ui/avatar";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// Sample knowledge base for frequently asked questions
const knowledgeBase = {
  "article generation": "This AI-powered article generation tool creates well-researched content based on data from Wikipedia and other sources. It supports features like SEO analysis, readability scoring, and automated formatting.",
  
  "video generation": "The video generation feature creates short videos summarizing your articles. The system processes your content, extracts key points, and generates professional videos with visuals that match your topic.",
  
  "seo": "The SEO tools analyze your content for keyword density, readability, and optimization opportunities. The system suggests improvements for title tags, meta descriptions, and content structure to enhance search visibility.",
  
  "readability": "Readability scores measure how easy your content is to read. Our system uses the Flesch-Kincaid formula to evaluate sentence length, word complexity, and overall structure, helping you adjust your content for your target audience.",
  
  "hashtags": "Our hashtag generation feature analyzes your content and suggests relevant hashtags for social media promotion. These are optimized for discovery and engagement on platforms like Twitter, Instagram, and LinkedIn.",
  
  "captions": "The AI automatically creates engaging social media captions based on your article content. These captions are designed to drive clicks, shares, and engagement when you share your content online.",
  
  "content creation": "Our AI content creation process combines research, structuring, and optimization. The system gathers information, organizes it into a coherent structure, adds proper formatting, and optimizes for readability and engagement.",
  
  "how to use": "To generate content, enter a topic in the main search field and click 'Generate Article'. The AI will research your topic and create a structured article. You can then use the tools to format, optimize, or generate supplementary content like videos or social posts.",
  
  "features": "This platform offers comprehensive content creation features including article generation, SEO optimization, readability analysis, social media caption creation, hashtag generation, and video production - all powered by AI.",
  
  "saving work": "All your generated content is automatically saved in your browser's local storage. You can access your drafts and published articles from the 'Saved Articles' section in the navigation menu.",
  
  "image": "The platform suggests relevant images for your articles based on the content. You can select images to include in your article or download them for use in other platforms.",
  
  "pricing": "Please refer to our pricing page for the latest subscription information. We offer various plans to accommodate different content creation needs and volumes.",
  
  "account": "You can manage your account settings, subscription, and payment information from the Account section accessible via the user menu in the top right corner.",
  
  "export": "Content can be exported in multiple formats including markdown, HTML, or plain text. You can also directly copy the content to your clipboard using the copy button."
};

const AIChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your AI assistant. I can help with article generation, video creation, SEO optimization, and more. What can I assist you with today?",
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  const simulateTyping = (content: string, callback: (content: string) => void) => {
    let index = 0;
    const fullContent = content;
    setIsTyping(true);
    
    // Clear any existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    const typeNextChar = () => {
      if (index < fullContent.length) {
        index += Math.floor(Math.random() * 3) + 1; // Type 1-3 characters at a time
        const partialContent = fullContent.slice(0, index);
        callback(partialContent);
        
        // Random typing speed between 10-30ms
        const typingSpeed = Math.floor(Math.random() * 20) + 10;
        typingTimeoutRef.current = setTimeout(typeNextChar, typingSpeed);
      } else {
        setIsTyping(false);
      }
    };
    
    typeNextChar();
  };

  const findRelevantAnswer = (query: string): string => {
    query = query.toLowerCase();
    
    // Check for direct matches in knowledge base
    for (const [keyword, answer] of Object.entries(knowledgeBase)) {
      if (query.includes(keyword)) {
        return answer;
      }
    }
    
    // Handle greetings
    if (query.match(/^(hi|hello|hey|greetings)/)) {
      return "Hello! How can I assist you with your content creation today?";
    }
    
    // Handle thank you
    if (query.match(/(thank|thanks|appreciate|grateful)/)) {
      return "You're welcome! Is there anything else I can help you with?";
    }
    
    // Handle questions about capabilities
    if (query.match(/(what can you do|capabilities|functions|able to do|features)/)) {
      return "I can help with article generation, SEO optimization, readability analysis, social media caption creation, hashtag generation, and video production. What specific feature would you like to learn more about?";
    }
    
    // Handle video generation specific questions
    if (query.match(/(video generation|create video|make video|video production)/)) {
      return "Our video generation feature creates high-quality videos summarizing your articles. The system automatically extracts key points from your content and transforms them into engaging videos with professional visuals and transitions. You can customize the duration and then download the final video for use on social media, websites, or presentations.";
    }
    
    // Handle quality or how it works questions
    if (query.match(/(how does it work|quality|accuracy|source|data source)/)) {
      return "Our system uses reliable data sources like Wikipedia for research, combined with advanced AI models to structure and polish content. The quality is high, though we always recommend a human review before publishing. The system continuously improves as it learns from user feedback and new data.";
    }
    
    // Default response for unknown queries
    return "I don't have specific information about that, but I'd be happy to help with article generation, SEO optimization, social media content, or video creation. Could you provide more details about what you're looking for?";
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
      // Create a placeholder for the assistant's response
      const tempId = Date.now().toString();
      const assistantPlaceholder: Message = {
        role: "assistant",
        content: "",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, assistantPlaceholder]);
      
      // Find relevant answer from our knowledge base
      const responseContent = findRelevantAnswer(userMessage.content);
      
      // Simulate thinking time
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Simulate typing effect
      simulateTyping(responseContent, (partialContent) => {
        setMessages((prev) => 
          prev.map((msg, idx) => 
            idx === prev.length - 1 ? { ...msg, content: partialContent } : msg
          )
        );
      });
      
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

  // Animation variants
  const chatButtonVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    },
    hover: { 
      scale: 1.05,
      boxShadow: "0 5px 15px rgba(0, 0, 0, 0.1)",
      transition: { type: "spring", stiffness: 400, damping: 10 }
    },
    tap: { scale: 0.95 }
  };
  
  const chatWindowVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        type: "spring",
        duration: 0.5,
        stiffness: 100
      }
    },
    exit: { 
      opacity: 0, 
      y: 20, 
      scale: 0.95,
      transition: { duration: 0.2 } 
    }
  };

  return (
    <>
      {!isOpen && (
        <motion.div
          variants={chatButtonVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
          whileTap="tap"
          className="fixed bottom-6 right-6 z-50"
        >
          <Button
            onClick={toggleChatbot}
            className="rounded-full h-14 w-14 shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            <MessageSquare size={24} className="text-white" />
          </Button>
        </motion.div>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chatWindow"
            variants={chatWindowVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed bottom-6 right-6 z-50"
          >
            <Card
              className={`w-80 sm:w-96 shadow-xl border transition-all duration-300 ease-in-out ${
                isMinimized ? "h-16" : "h-[500px] max-h-[80vh]"
              }`}
            >
              <CardHeader className="p-4 flex flex-row items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
                <CardTitle className="text-sm font-medium">AI Assistant</CardTitle>
                <div className="flex space-x-2">
                  {isMinimized ? (
                    <Button variant="ghost" size="icon" onClick={toggleMinimize} className="h-6 w-6 text-white hover:text-white/90 hover:bg-white/10">
                      <Maximize size={14} />
                    </Button>
                  ) : (
                    <Button variant="ghost" size="icon" onClick={toggleMinimize} className="h-6 w-6 text-white hover:text-white/90 hover:bg-white/10">
                      <Minimize size={14} />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={toggleChatbot} className="h-6 w-6 text-white hover:text-white/90 hover:bg-white/10">
                    <X size={14} />
                  </Button>
                </div>
              </CardHeader>

              {!isMinimized && (
                <>
                  <CardContent className="flex-1 overflow-auto p-4 h-[calc(500px-130px)]">
                    <div className="space-y-4">
                      <AnimatePresence initial={false}>
                        {messages.map((msg, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className={`flex ${
                              msg.role === "user" ? "justify-end" : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-[85%] rounded-lg p-3 ${
                                msg.role === "user"
                                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
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
                              <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                              {index === messages.length - 1 && msg.role === "assistant" && isTyping && (
                                <div className="mt-1 flex space-x-1">
                                  <div className="h-1.5 w-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
                                  <div className="h-1.5 w-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                                  <div className="h-1.5 w-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      <div ref={messagesEndRef} />
                    </div>
                  </CardContent>

                  <CardFooter className="p-4 pt-2">
                    <form onSubmit={handleSubmit} className="flex w-full space-x-2">
                      <Textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Ask me anything about content creation..."
                        className="min-h-[40px] max-h-[120px] resize-none"
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
                        disabled={isLoading || !message.trim() || isTyping}
                        className={`shrink-0 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 ${isLoading ? 'opacity-70' : ''}`}
                      >
                        {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                      </Button>
                    </form>
                  </CardFooter>
                </>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatbot;
