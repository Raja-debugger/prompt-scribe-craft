
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { geminiAPI } from "@/utils/geminiAPI";
import { toast } from "sonner";
import { SummaryGenerator } from "./summarizer/SummaryGenerator";
import { CaptionGenerator } from "./summarizer/CaptionGenerator";
import { SummarySocialShare } from "./summarizer/SummarySocialShare";
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
        .replace(/^# \*\*.*?\*\*\n\n/, '')
        .replace(/##\s+\*\*.*?\*\*\n\n/g, '')
        .replace(/\*\*/g, '')
        .replace(/\n\n---\n\*Source.*/, '');
      
      const summaryText = await geminiAPI.summarizeText({ text: cleanContent });
      
      localStorage.setItem("summarized_text", summaryText);
      localStorage.setItem("summarized_title", articleTitle);
      
      setSummary(summaryText);
      generateCaptionsAndHashtags(summaryText, articleTitle);
    } catch (error) {
      console.error("Error generating summary:", error);
      toast.error("Failed to generate summary");
    } finally {
      setIsGenerating(false);
    }
  };

  const generateCaptionsAndHashtags = (summaryText: string, title: string) => {
    const sampleCaptions = [
      `Just read this fascinating article about ${title}. Here's what I learned... 🧠`,
      `Did you know these facts about ${title}? Check out my latest read! 📚`,
      `Sharing some insights on ${title} that might change your perspective. 💡`,
      `This article on ${title} blew my mind! Here's a quick summary... 🤯`
    ];
    
    const words = `${title} ${summaryText}`.toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .split(/\s+/)
      .filter(word => word.length > 4)
      .slice(0, 10);
    
    const uniqueWords = [...new Set(words)];
    const generatedHashtags = uniqueWords.map(word => `#${word}`);
    const trendingHashtags = ['#trending', '#mustread', '#knowledge', '#learning', '#todayilearned', '#factoftheday'];
    
    setCaptions(sampleCaptions);
    setHashtags([...generatedHashtags.slice(0, 5), ...trendingHashtags.slice(0, 3)]);
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
              <SummaryGenerator
                articleContent={articleContent}
                articleTitle={articleTitle}
                summary={summary}
                isGenerating={isGenerating}
              />
              
              {!isGenerating && captions.length > 0 && (
                <CaptionGenerator
                  captions={captions}
                  hashtags={hashtags}
                />
              )}
              
              <SummarySocialShare
                onClose={onClose}
                onVoiceOver={onVoiceOver}
                summary={summary}
              />
            </div>
          </div>
          
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
