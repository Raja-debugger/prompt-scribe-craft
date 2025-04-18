import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, X, Copy, Headphones } from "lucide-react";
import { toast } from "sonner";
import { geminiAPI } from "@/utils/geminiAPI";
import { motion } from "framer-motion";

interface TextSummarizerProps {
  articleContent: string;
  articleTitle: string;
  onClose: () => void;
  onVoiceOver?: (summary: string) => void;
}

const TextSummarizer: React.FC<TextSummarizerProps> = ({
  articleContent,
  articleTitle,
  onClose,
  onVoiceOver,
}) => {
  const [summary, setSummary] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  useEffect(() => {
    if (articleContent) {
      generateSummary();
    }
  }, [articleContent]);

  const generateSummary = async () => {
    setIsGenerating(true);
    try {
      // Clean the article content by removing markdown formatting and other noise
      const cleanContent = articleContent
        .replace(/^# \*\*.*?\*\*\n\n/, '')  // Remove title
        .replace(/##\s+\*\*.*?\*\*\n\n/g, '') // Remove section headers
        .replace(/\*\*/g, '')   // Remove bold markers
        .replace(/\n\n---\n\*Source.*/, ''); // Remove source attribution
      
      // Use the Gemini API to summarize the article
      const summaryText = await geminiAPI.summarizeText({ text: cleanContent });
      
      // Store the summarized text and title in localStorage for later use
      localStorage.setItem("summarized_text", summaryText);
      localStorage.setItem("summarized_title", articleTitle);
      
      setSummary(summaryText);
    } catch (error) {
      console.error("Error generating summary:", error);
      toast.error("Failed to generate summary");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(summary);
    toast.success("Summary copied to clipboard");
  };

  const handleVoiceOver = () => {
    if (onVoiceOver && summary) {
      onVoiceOver(summary);
    }
  };

  const speakSummary = () => {
    if (summary) {
      const utterance = new SpeechSynthesisUtterance(summary);
      utterance.rate = 1; // Normal speed
      utterance.pitch = 1; // Normal pitch
      speechSynthesis.speak(utterance);
      toast.success("Speaking summary...");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-2xl"
    >
      <div className="bg-gradient-to-r from-[rgba(150,93,233,1)] to-[rgba(99,88,238,1)] p-1 rounded-xl">
        <Card className="w-full bg-white dark:bg-gray-900 border-none overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg font-medium">Article Summary</CardTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          
          <CardContent className="pt-4 pb-0">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary mb-3" />
                <p className="text-sm text-muted-foreground text-center">Generating summary...</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground mb-2">
                  Summary of "{articleTitle}":
                </p>
                <div className="relative">
                  <Textarea 
                    value={summary} 
                    readOnly 
                    className="h-[150px] resize-none text-sm font-normal leading-relaxed border rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500"
                    style={{ 
                      fontFamily: "'Poppins', sans-serif",
                      padding: "10px"
                    }}
                  />
                </div>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-end gap-2 pt-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={copyToClipboard} 
              disabled={isGenerating || !summary}
              className="text-xs hover:bg-purple-50 transition-colors duration-300"
            >
              <Copy className="mr-1 h-3 w-3" />
              Copy
            </Button>
            <Button 
              variant="outline"
              size="sm"
              onClick={speakSummary} 
              disabled={isGenerating || !summary}
              className="text-xs hover:bg-purple-50 transition-colors duration-300"
            >
              <Headphones className="mr-1 h-3 w-3" />
              Speak
            </Button>
            {onVoiceOver && (
              <Button 
                onClick={handleVoiceOver} 
                size="sm"
                disabled={isGenerating || !summary}
                className="bg-gradient-to-r from-[rgba(150,93,233,1)] to-[rgba(99,88,238,1)] hover:from-[rgba(99,88,238,1)] hover:to-[rgba(150,93,233,1)] text-white text-xs transition-all duration-300 transform hover:scale-105"
              >
                <Headphones className="mr-1 h-3 w-3" />
                Voice Over
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </motion.div>
  );
};

export default TextSummarizer;
