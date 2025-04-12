
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Send, Bot, X, HelpCircle, Sparkles, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const ImprovedAIChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentTypingText, setCurrentTypingText] = useState("");
  const [fullResponse, setFullResponse] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  // System prompt for MindCMS specific assistant
  const systemPrompt = `You are an AI assistant for MindCMS, an AI-powered content management system designed to streamline content creation, SEO optimization, publication, and social media management. 
  
Features include:
- Content generation from topics
- SEO optimization with meta tags, readability scores, keyword suggestions
- Image optimization with ALT tags and compression
- Voice over generation
- Social media post creation and scheduling
- Analytics and performance tracking

Help users understand how to use MindCMS, provide tips on content creation, SEO, and marketing strategies. Be detailed, professional and helpful.`;

  // Welcome message
  const welcomeMessage: Message = {
    id: "welcome",
    role: "assistant",
    content: "👋 Hello! I'm your MindCMS AI assistant. I can help you with content creation, SEO optimization, publishing workflows, and more. Ask me anything about MindCMS!",
    timestamp: new Date()
  };

  // Sample responses for quick replies
  const sampleResponses = {
    contentCreation: `MindCMS uses advanced AI models to generate comprehensive articles from just a topic. Here's how it works:

1. Input your topic and optional category in the main editor
2. Our AI analyzes the topic and generates:
   - Complete article (1000+ words)
   - Properly formatted headers and subheaders
   - SEO-optimized titles and keywords
   - Meta descriptions
   
The AI can also generate voice overs to accompany your content!`,

    seoOptimization: `MindCMS automates SEO optimization with these features:

1. Keyword research and suggestions
2. Meta tag generation (title, description, keywords)
3. Readability score analysis
4. Keyword density optimization
5. Image optimization with ALT tags
6. Mobile-friendly content formatting
7. Internal linking suggestions

All SEO elements can be reviewed and adjusted before publishing.`,

    analytics: `MindCMS provides comprehensive analytics to track content performance:

1. Page views, bounce rates, and time on page
2. Keyword ranking tracking
3. Backlink analysis
4. Social media engagement metrics
5. Conversion tracking
6. Content heatmaps
7. A/B testing results

You can view custom reports and export data for further analysis.`,

    workflow: `MindCMS streamlines your content workflow:

1. Content ideation with AI topic suggestions
2. One-click content generation
3. Built-in editing tools
4. Automated SEO optimization
5. Content scheduling
6. Multi-platform publishing
7. Social media integration
8. Performance tracking

This end-to-end system reduces content production time by up to 80%.`
  };

  // Set initial welcome message
  useEffect(() => {
    setMessages([welcomeMessage]);
  }, []);

  // Auto scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentTypingText]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Typing effect for assistant messages
  useEffect(() => {
    if (isTyping && fullResponse) {
      let index = 0;
      const typingInterval = setInterval(() => {
        if (index <= fullResponse.length) {
          setCurrentTypingText(fullResponse.slice(0, index));
          index++;
        } else {
          clearInterval(typingInterval);
          setIsTyping(false);
          
          // Update the last message with full response
          setMessages(prevMessages => {
            const updatedMessages = [...prevMessages];
            const lastMessageIndex = updatedMessages.length - 1;
            if (lastMessageIndex >= 0 && updatedMessages[lastMessageIndex].role === "assistant") {
              updatedMessages[lastMessageIndex].content = fullResponse;
            }
            return updatedMessages;
          });
        }
      }, 15); // Speed of typing effect

      return () => clearInterval(typingInterval);
    }
  }, [isTyping, fullResponse]);

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Mock AI response - in a real implementation, this would call your backend API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Generate a response based on the user's input
      let responseContent = "";
      const userQuery = inputValue.toLowerCase();
      
      if (userQuery.includes("content") && (userQuery.includes("create") || userQuery.includes("generation") || userQuery.includes("write"))) {
        responseContent = sampleResponses.contentCreation;
      } else if (userQuery.includes("seo") || userQuery.includes("optimization") || userQuery.includes("search engine")) {
        responseContent = sampleResponses.seoOptimization;
      } else if (userQuery.includes("analytics") || userQuery.includes("stats") || userQuery.includes("performance") || userQuery.includes("tracking")) {
        responseContent = sampleResponses.analytics;
      } else if (userQuery.includes("workflow") || userQuery.includes("process") || userQuery.includes("publish")) {
        responseContent = sampleResponses.workflow;
      } else {
        // Generate a generic response
        responseContent = `Thank you for your question about "${inputValue.trim()}". 

MindCMS can help you with this by leveraging our advanced AI content tools that simplify content creation, optimization, and distribution. You can:

1. Use the main editor to generate content related to your topic
2. Review and edit the AI-generated content to match your style
3. Let our system optimize it for SEO automatically
4. Add AI-generated voice overs for multimedia content
5. Schedule it for publication across your channels

Would you like me to explain any specific aspect of MindCMS in more detail?`;
      }

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: "", // This will be filled by the typing effect
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setFullResponse(responseContent);
      setIsTyping(true);
      
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key to send message
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat toggle button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="fixed bottom-4 right-4 z-50"
      >
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full w-14 h-14 shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      </motion.div>

      {/* Chat interface */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="w-full sm:max-w-md p-0 flex flex-col h-[100dvh]">
          <SheetHeader className="px-4 py-3 border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-2 bg-primary/10">
                  <AvatarImage src="/ai-assistant.png" />
                  <AvatarFallback>
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <SheetTitle className="text-left">MindCMS Assistant</SheetTitle>
                  <SheetDescription className="text-left text-xs">Powered by AI</SheetDescription>
                </div>
              </div>
              <SheetClose asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <X className="h-4 w-4" />
                </Button>
              </SheetClose>
            </div>
          </SheetHeader>
          
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              <AnimatePresence initial={false}>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className={cn(
                      "flex gap-3 max-w-[90%]",
                      message.role === "user" ? "ml-auto flex-row-reverse" : ""
                    )}
                  >
                    <Avatar className={cn(
                      "h-8 w-8 mt-0.5",
                      message.role === "assistant" ? "bg-primary/10" : "bg-muted"
                    )}>
                      {message.role === "assistant" ? (
                        <>
                          <AvatarImage src="/ai-assistant.png" />
                          <AvatarFallback><Bot className="h-4 w-4" /></AvatarFallback>
                        </>
                      ) : (
                        <>
                          <AvatarImage src="/user-avatar.png" />
                          <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                        </>
                      )}
                    </Avatar>
                    <div
                      className={cn(
                        "rounded-lg p-3",
                        message.role === "assistant" 
                          ? "bg-muted text-foreground"
                          : "bg-primary text-primary-foreground"
                      )}
                    >
                      {message.role === "assistant" && isTyping && message.id === messages[messages.length - 1].id ? (
                        <div className="prose prose-sm dark:prose-invert">
                          {currentTypingText || (
                            <div className="flex space-x-1 items-center h-6">
                              <div className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: "0ms" }} />
                              <div className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: "150ms" }} />
                              <div className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: "300ms" }} />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="prose prose-sm dark:prose-invert whitespace-pre-line">
                          {message.content}
                        </div>
                      )}
                      <div className="text-xs mt-1 opacity-60">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything about MindCMS..."
                className="min-h-12 resize-none"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                size="icon"
                className={cn(
                  "shrink-0 transition-all",
                  !inputValue.trim() ? "opacity-60" : "bg-primary"
                )}
              >
                {isLoading ? (
                  <Sparkles className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="mt-2">
              <div className="flex gap-2 text-xs justify-center text-muted-foreground">
                <Button variant="ghost" size="sm" className="h-auto py-1 px-2 text-xs" onClick={() => {
                  setInputValue("How does content creation work in MindCMS?");
                  setTimeout(() => inputRef.current?.focus(), 10);
                }}>
                  Content Creation
                </Button>
                <Button variant="ghost" size="sm" className="h-auto py-1 px-2 text-xs" onClick={() => {
                  setInputValue("Tell me about SEO optimization features");
                  setTimeout(() => inputRef.current?.focus(), 10);
                }}>
                  SEO Features
                </Button>
                <Button variant="ghost" size="sm" className="h-auto py-1 px-2 text-xs" onClick={() => {
                  setInputValue("What analytics does MindCMS provide?");
                  setTimeout(() => inputRef.current?.focus(), 10);
                }}>
                  Analytics
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default ImprovedAIChatbot;
