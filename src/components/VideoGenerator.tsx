
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Video, Download, Clock, Sparkles, RotateCw, Check } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { runwayAPI } from "@/utils/runwayAPI";

interface VideoGeneratorProps {
  articleContent: string;
  articleTitle: string;
  onClose: () => void;
}

const VideoGenerator: React.FC<VideoGeneratorProps> = ({
  articleContent,
  articleTitle,
  onClose,
}) => {
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [duration, setDuration] = useState<number>(20);
  const [activeTab, setActiveTab] = useState<string>("generate");
  
  // Function to summarize article content
  const summarizeContent = (content: string, maxLength: number = 200): string => {
    // Remove markdown formatting
    const plainText = content.replace(/#{1,6}\s+/g, '').replace(/\*\*/g, '');
    
    // Extract first few sentences
    const sentences = plainText.split(/[.!?]+/).filter(s => s.trim());
    let summary = '';
    
    for (const sentence of sentences) {
      if ((summary + sentence).length <= maxLength) {
        summary += sentence.trim() + ". ";
      } else {
        break;
      }
    }
    
    return summary.trim();
  };

  const generateVideo = async () => {
    setIsGenerating(true);
    setProgress(0);
    
    // Create a summary of the article
    const summary = summarizeContent(articleContent, 150);
    const prompt = `Create a professional video about ${articleTitle}: ${summary}`;
    
    try {
      // Set up progress simulation
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(interval);
            return 95;
          }
          return prev + Math.floor(Math.random() * 5);
        });
      }, 800);
      
      // Generate the video
      const videoResponse = await runwayAPI.generateVideo({
        prompt: prompt,
        aspectRatio: "16:9",
        duration: duration
      });
      
      clearInterval(interval);
      setProgress(100);
      
      if (videoResponse.status === "completed" && videoResponse.url) {
        setVideoUrl(videoResponse.url);
        toast.success("Video generated successfully!");
        setActiveTab("preview");
      } else {
        throw new Error("Video generation did not complete successfully");
      }
    } catch (error) {
      console.error("Error generating video:", error);
      toast.error("Failed to generate video. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Animation variants for smooth transitions
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 }
  };

  // Auto-generate the video when component mounts
  useEffect(() => {
    generateVideo();
  }, []);

  return (
    <Card className="w-full max-w-3xl mx-auto overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Video className="mr-2 h-5 w-5" />
          Video Generator
        </CardTitle>
        <CardDescription>
          Generate a short video summarizing your article using AI
        </CardDescription>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generate">Generate</TabsTrigger>
          <TabsTrigger value="preview" disabled={!videoUrl}>Preview</TabsTrigger>
        </TabsList>
        
        <AnimatePresence mode="wait">
          {activeTab === "generate" && (
            <TabsContent value="generate" key="generate-tab">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-4"
              >
                <CardContent className="space-y-4 pt-4">
                  <motion.div variants={itemVariants} className="space-y-2">
                    <Alert className="bg-muted border-primary/20">
                      <Check className="h-4 w-4 text-primary" />
                      <AlertTitle>Ready to Generate</AlertTitle>
                      <AlertDescription className="flex justify-between items-center">
                        <span>Your video will summarize the key points from your article</span>
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                  
                  <Separator />
                  
                  <motion.div variants={itemVariants} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">Video Duration</h3>
                      <span className="text-sm text-muted-foreground">{duration} seconds</span>
                    </div>
                    <Slider
                      min={10}
                      max={30}
                      step={1}
                      value={[duration]}
                      onValueChange={(value) => setDuration(value[0])}
                      className="mt-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>10s</span>
                      <span>20s</span>
                      <span>30s</span>
                    </div>
                  </motion.div>
                  
                  <motion.div variants={itemVariants} className="space-y-2">
                    <h3 className="font-medium">Content Summary</h3>
                    <div className="p-3 bg-muted rounded-md text-sm">
                      {summarizeContent(articleContent, 150)}
                    </div>
                  </motion.div>
                  
                  {isGenerating && (
                    <motion.div 
                      variants={itemVariants}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-2"
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">Generation Progress</h3>
                        <span className="text-sm">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <p className="text-xs text-muted-foreground animate-pulse flex items-center">
                        <RotateCw className="h-3 w-3 mr-2 animate-spin" />
                        Processing your article content...
                      </p>
                    </motion.div>
                  )}
                </CardContent>
                
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={generateVideo} 
                    disabled={isGenerating}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    {isGenerating ? (
                      <>
                        <Clock className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Regenerate Video
                      </>
                    )}
                  </Button>
                </CardFooter>
              </motion.div>
            </TabsContent>
          )}
          
          {activeTab === "preview" && (
            <TabsContent value="preview" key="preview-tab">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-4"
              >
                <CardContent className="space-y-4 pt-4">
                  <motion.div 
                    variants={itemVariants}
                    className="relative rounded-md overflow-hidden aspect-video bg-black"
                  >
                    {videoUrl && (
                      <video
                        controls
                        className="w-full h-full"
                        src={videoUrl}
                        autoPlay
                      >
                        Your browser does not support the video tag.
                      </video>
                    )}
                  </motion.div>
                  
                  <motion.div variants={itemVariants} className="flex justify-center">
                    <Button variant="outline" className="mr-2" onClick={() => setActiveTab("generate")}>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Regenerate
                    </Button>
                    <Button onClick={() => {
                      // Download the video
                      if (videoUrl) {
                        const a = document.createElement('a');
                        a.href = videoUrl;
                        a.download = `${articleTitle.replace(/\s+/g, '-')}-video.mp4`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        toast.success("Video download started");
                      }
                    }}>
                      <Download className="mr-2 h-4 w-4" />
                      Download Video
                    </Button>
                  </motion.div>
                </CardContent>
              </motion.div>
            </TabsContent>
          )}
        </AnimatePresence>
      </Tabs>
    </Card>
  );
};

export default VideoGenerator;
