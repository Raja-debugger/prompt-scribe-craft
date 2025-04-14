
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, X, Copy, Headphones } from "lucide-react";
import { toast } from "sonner";
import { geminiAPI } from "@/utils/geminiAPI";

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

  return (
    <Card className="w-full max-w-2xl bg-white dark:bg-gray-900 shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-xl text-primary">Article Summary</CardTitle>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="pt-2 pb-0">
        {isGenerating ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground text-center">Generating summary with Gemini AI...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-2">
              Summary of "{articleTitle}":
            </p>
            <div className="relative">
              <Textarea 
                value={summary} 
                readOnly 
                className="h-[180px] resize-none text-foreground text-base font-normal leading-relaxed"
              />
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={copyToClipboard} disabled={isGenerating || !summary}>
          <Copy className="mr-2 h-4 w-4" />
          Copy
        </Button>
        {onVoiceOver && (
          <Button 
            onClick={handleVoiceOver} 
            disabled={isGenerating || !summary}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
          >
            <Headphones className="mr-2 h-4 w-4" />
            Voice Over
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default TextSummarizer;
