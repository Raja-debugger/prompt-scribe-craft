
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
import { MessageSquare, Send, Bot, X, Sparkles, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { geminiAPI } from "@/utils/geminiAPI";

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
  const [chatHistory, setChatHistory] = useState<Array<{role: string, content: string}>>([]);

  // Welcome message
  const welcomeMessage: Message = {
    id: "welcome",
    role: "assistant",
    content: "👋 Hello! I'm your Gemini AI assistant. I can help you with content creation, research, questions, and more. What would you like to know?",
    timestamp: new Date()
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

    // Update chat history
    const updatedHistory = [
      ...chatHistory,
      { role: "user", content: inputValue }
    ];
    setChatHistory(updatedHistory);

    try {
      // Add placeholder message for the assistant
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: "", // This will be filled by the typing effect
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Call the Gemini API
      const response = await geminiAPI.chatWithGemini({ 
        message: inputValue,
        history: updatedHistory
      });
      
      // Update chat history with assistant's response
      setChatHistory([
        ...updatedHistory,
        { role: "assistant", content: response }
      ]);
      
      setFullResponse(response);
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
                  <SheetTitle className="text-left">Gemini AI</SheetTitle>
                  <SheetDescription className="text-left text-xs">Ask me anything</SheetDescription>
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
                placeholder="Ask Gemini AI anything..."
                className="min-h-12 resize-none"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                size="icon"
                className={cn(
                  "shrink-0 transition-all bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700",
                  !inputValue.trim() ? "opacity-60" : ""
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
                  setInputValue("What can you help me with?");
                  setTimeout(() => inputRef.current?.focus(), 10);
                }}>
                  Capabilities
                </Button>
                <Button variant="ghost" size="sm" className="h-auto py-1 px-2 text-xs" onClick={() => {
                  setInputValue("Give me content ideas for my blog");
                  setTimeout(() => inputRef.current?.focus(), 10);
                }}>
                  Content Ideas
                </Button>
                <Button variant="ghost" size="sm" className="h-auto py-1 px-2 text-xs" onClick={() => {
                  setInputValue("How can I improve my article's SEO?");
                  setTimeout(() => inputRef.current?.focus(), 10);
                }}>
                  SEO Tips
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
