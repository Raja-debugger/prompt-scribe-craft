
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Check, ClipboardCopy, Sparkles, Headphones } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { geminiAPI } from "@/utils/geminiAPI";
import { runwayAPI } from "@/utils/runwayAPI";

interface TextSummarizerProps {
  articleContent: string;
  articleTitle: string;
  onClose: () => void;
  onVoiceOver: (summary: string) => void;
}

const TextSummarizer: React.FC<TextSummarizerProps> = ({
  articleContent,
  articleTitle,
  onClose,
  onVoiceOver
}) => {
  const [summarizedText, setSummarizedText] = useState<string>("");
  const [isSummarizing, setIsSummarizing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  const generateSummary = async () => {
    setIsSummarizing(true);
    setProgress(0);
    
    // Set up progress simulation
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + Math.floor(Math.random() * 5);
      });
    }, 300);
    
    try {
      const summary = await geminiAPI.summarizeText({ text: articleContent });
      setSummarizedText(summary);
      
      clearInterval(interval);
      setProgress(100);
      
      // Store the summary in localStorage to persist between pages
      localStorage.setItem("summarized_text", summary);
      localStorage.setItem("summarized_title", articleTitle);
    } catch (error) {
      console.error("Error generating summary:", error);
      toast.error("Failed to generate summary. Please try again.");
    } finally {
      setIsSummarizing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(summarizedText);
    toast.success("Summary copied to clipboard");
  };

  const handleVoiceOver = () => {
    onVoiceOver(summarizedText);
  };

  // Run summarization when component mounts
  React.useEffect(() => {
    generateSummary();
    // Store the current article in case we need it later
    localStorage.setItem("original_article", articleContent);
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-lg border-primary/10">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
        <CardTitle className="flex items-center text-primary">
          <Sparkles className="mr-2 h-5 w-5" />
          AI Article Summary
        </CardTitle>
        <CardDescription>
          AI-generated summary of your article
        </CardDescription>
      </CardHeader>
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <CardContent className="space-y-4 pt-4">
          {isSummarizing ? (
            <motion.div variants={itemVariants} className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Summarizing Article</h3>
                <span className="text-sm">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-muted-foreground animate-pulse flex items-center">
                <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                Our AI is extracting the key points from your article...
              </p>
            </motion.div>
          ) : (
            <>
              <motion.div variants={itemVariants}>
                <Alert className="bg-muted border-primary/20">
                  <Check className="h-4 w-4 text-primary" />
                  <AlertDescription className="flex justify-between items-center">
                    <span>Summary generated successfully</span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="ml-2" 
                      onClick={copyToClipboard}
                    >
                      <ClipboardCopy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                  </AlertDescription>
                </Alert>
              </motion.div>
              
              <Separator />
              
              <motion.div variants={itemVariants} className="space-y-2">
                <h3 className="font-medium">Article Summary</h3>
                <Textarea 
                  className="min-h-[200px] text-sm focus-visible:ring-1"
                  value={summarizedText}
                  onChange={(e) => setSummarizedText(e.target.value)}
                />
              </motion.div>
            </>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button 
            onClick={handleVoiceOver}
            disabled={!summarizedText || isSummarizing}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            <Headphones className="mr-2 h-4 w-4" />
            Generate Voice Over
          </Button>
        </CardFooter>
      </motion.div>
    </Card>
  );
};

export default TextSummarizer;
