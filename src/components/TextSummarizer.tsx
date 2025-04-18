
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, X, Copy, Headphones } from "lucide-react";
import { toast } from "sonner";
import { geminiAPI } from "@/utils/geminiAPI";
import { motion } from "framer-motion";
import { YoutubeEmbed } from "./YoutubeEmbed";

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
  const [captions, setCaptions] = useState<string[]>([]);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

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

      // Generate captions and hashtags
      generateCaptionsAndHashtags(summaryText, articleTitle);
    } catch (error) {
      console.error("Error generating summary:", error);
      toast.error("Failed to generate summary");
    } finally {
      setIsGenerating(false);
    }
  };

  const generateCaptionsAndHashtags = (summaryText: string, title: string) => {
    // Generate sample captions for social media
    const sampleCaptions = [
      `Just read this fascinating article about ${title}. Here's what I learned... 🧠`,
      `Did you know these facts about ${title}? Check out my latest read! 📚`,
      `Sharing some insights on ${title} that might change your perspective. 💡`,
      `This article on ${title} blew my mind! Here's a quick summary... 🤯`
    ];
    
    // Generate trending hashtags based on title and content
    const words = `${title} ${summaryText}`.toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .split(/\s+/)
      .filter(word => word.length > 4)
      .slice(0, 10);
    
    const uniqueWords = [...new Set(words)];
    const generatedHashtags = uniqueWords.map(word => `#${word}`);
    
    // Add some trending general hashtags
    const trendingHashtags = ['#trending', '#mustread', '#knowledge', '#learning', '#todayilearned', '#factoftheday'];
    
    setCaptions(sampleCaptions);
    setHashtags([...generatedHashtags.slice(0, 5), ...trendingHashtags.slice(0, 3)]);
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
      if (isSpeaking) {
        speechSynthesis.cancel();
        setIsSpeaking(false);
        toast.info("Speech stopped");
      } else {
        const utterance = new SpeechSynthesisUtterance(summary);
        utterance.rate = 1; // Normal speed
        utterance.pitch = 1; // Normal pitch
        utterance.onend = () => setIsSpeaking(false);
        
        speechSynthesis.speak(utterance);
        setIsSpeaking(true);
        toast.success("Speaking summary...");
      }
    }
  };

  return (
    <div className="bg-gradient-to-r from-[rgba(150,93,233,1)] to-[rgba(99,88,238,1)] p-4 min-h-screen font-['Poppins',sans-serif]">
      <div className="container mx-auto flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-2xl"
        >
          <div className="bg-white rounded-xl shadow-lg p-5 mb-5">
            <h1 className="text-2xl font-medium mb-4 text-center">Text-to-Speech Converter</h1>
            
            <div className="space-y-4">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary mb-3" />
                  <p className="text-sm text-center">Generating summary...</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <h2 className="text-sm font-medium">Summary of "{articleTitle}":</h2>
                    <Textarea 
                      value={summary} 
                      readOnly 
                      className="h-[200px] resize-none text-sm leading-relaxed border rounded-lg shadow-sm"
                      style={{ fontFamily: "'Poppins', sans-serif" }}
                    />
                  </div>
                  
                  <div className="flex gap-2 justify-end">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={copyToClipboard} 
                      disabled={!summary}
                      className="text-xs hover:bg-purple-50"
                    >
                      <Copy className="mr-1 h-3 w-3" />
                      Copy
                    </Button>
                    <Button 
                      onClick={speakSummary} 
                      disabled={!summary}
                      className="bg-gradient-to-r from-[rgba(150,93,233,1)] to-[rgba(99,88,238,1)] hover:from-[rgba(99,88,238,1)] hover:to-[rgba(150,93,233,1)] text-white text-sm transition-all"
                    >
                      <Headphones className="mr-1 h-4 w-4" />
                      {isSpeaking ? "Stop" : "Speak"}
                    </Button>
                  </div>
                  
                  {/* Captions and Hashtags Section */}
                  {captions.length > 0 && (
                    <div className="mt-5 border-t pt-4">
                      <h3 className="text-sm font-medium mb-2">Suggested Captions:</h3>
                      <div className="space-y-2 mb-4">
                        {captions.map((caption, index) => (
                          <div key={index} className="p-2 bg-purple-50 rounded-md text-xs relative group">
                            {caption}
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(caption);
                                toast.success("Caption copied!");
                              }}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Copy className="h-3 w-3 text-purple-500" />
                            </button>
                          </div>
                        ))}
                      </div>
                      
                      <h3 className="text-sm font-medium mb-2">Trending Hashtags:</h3>
                      <div className="flex flex-wrap gap-2">
                        {hashtags.map((hashtag, index) => (
                          <div 
                            key={index} 
                            className="px-2 py-1 bg-indigo-50 rounded-md text-xs cursor-pointer hover:bg-indigo-100 transition-colors"
                            onClick={() => {
                              navigator.clipboard.writeText(hashtag);
                              toast.success("Hashtag copied!");
                            }}
                          >
                            {hashtag}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
              
              <div className="flex justify-between mt-4">
                <Button variant="outline" onClick={onClose} className="text-xs">
                  <X className="mr-1 h-3 w-3" />
                  Close
                </Button>
                {onVoiceOver && (
                  <Button 
                    onClick={handleVoiceOver} 
                    disabled={isGenerating || !summary}
                    className="bg-gradient-to-r from-[rgba(150,93,233,1)] to-[rgba(99,88,238,1)] hover:from-[rgba(99,88,238,1)] hover:to-[rgba(150,93,233,1)] text-white text-xs"
                  >
                    <Headphones className="mr-1 h-3 w-3" />
                    Voice Over
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          {/* YouTube Video Embed */}
          {articleTitle && (
            <div className="mt-6">
              <YoutubeEmbed searchTerm={articleTitle} />
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default TextSummarizer;
