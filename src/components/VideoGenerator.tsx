import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Video, Film, Download, Clock, Sparkles, Settings, Check } from "lucide-react";
import { toast } from "sonner";

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
  const [apiKey, setApiKey] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [duration, setDuration] = useState<number>(20);
  const [activeTab, setActiveTab] = useState<string>("generate");
  const [showApiInput, setShowApiInput] = useState<boolean>(true);
  
  // Function to summarize article content (simplified for demo)
  const summarizeContent = (content: string, maxLength: number = 200): string => {
    // Remove markdown formatting for simplicity
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
    if (!apiKey) {
      toast.error("Please enter your Lumen5 API key");
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    
    // Create a summary of the article
    const summary = summarizeContent(articleContent, 150);
    
    try {
      // Simulate API progress for demo purposes
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(interval);
            return 95;
          }
          return prev + Math.floor(Math.random() * 10);
        });
      }, 800);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // In a real implementation, you would call the Lumen5 API here
      /* 
      const response = await fetch('https://api.lumen5.com/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          title: articleTitle,
          content: summary,
          duration: duration,
          // Other Lumen5 specific parameters
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate video');
      }
      
      setVideoUrl(data.videoUrl);
      */
      
      // For demo, set a sample video URL
      clearInterval(interval);
      setProgress(100);
      
      // Using a placeholder video for demo
      setVideoUrl("https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4");
      
      toast.success("Video generated successfully!");
      setActiveTab("preview");
    } catch (error) {
      console.error("Error generating video:", error);
      toast.error("Failed to generate video. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Film className="mr-2 h-5 w-5" />
          Video Generator
        </CardTitle>
        <CardDescription>
          Generate a short video summarizing your article using Lumen5 API
        </CardDescription>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generate">Generate</TabsTrigger>
          <TabsTrigger value="preview" disabled={!videoUrl}>Preview</TabsTrigger>
        </TabsList>
        
        <TabsContent value="generate">
          <CardContent className="space-y-4 pt-4">
            {showApiInput && (
              <div className="space-y-2">
                <Label htmlFor="api-key">Lumen5 API Key</Label>
                <div className="flex space-x-2">
                  <Input
                    id="api-key"
                    type="password"
                    placeholder="Enter your Lumen5 API key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      if (apiKey) {
                        setShowApiInput(false);
                        toast.success("API Key saved!");
                      }
                    }}
                    disabled={!apiKey}
                  >
                    <Check className="h-4 w-4 mr-1" /> Save
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Your API key is only stored locally in this browser session
                </p>
              </div>
            )}
            
            {!showApiInput && (
              <Alert className="bg-muted border-primary/20">
                <Check className="h-4 w-4 text-primary" />
                <AlertTitle>API Key Configured</AlertTitle>
                <AlertDescription className="flex justify-between items-center">
                  <span>Your Lumen5 API key is ready to use</span>
                  <Button variant="link" onClick={() => setShowApiInput(true)} className="h-auto p-0">
                    Change
                  </Button>
                </AlertDescription>
              </Alert>
            )}
            
            <Separator />
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Video Duration</Label>
                <span className="text-sm text-muted-foreground">{duration} seconds</span>
              </div>
              <Slider
                min={10}
                max={30}
                step={1}
                value={[duration]}
                onValueChange={(value) => setDuration(value[0])}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>10s</span>
                <span>20s</span>
                <span>30s</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Content Summary</Label>
              <div className="p-3 bg-muted rounded-md text-sm">
                {summarizeContent(articleContent, 150)}
              </div>
            </div>
            
            {isGenerating && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Generation Progress</Label>
                  <span className="text-sm">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-muted-foreground animate-pulse">
                  Processing your article content...
                </p>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={generateVideo} 
              disabled={isGenerating || !apiKey}
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
                  Generate Video
                </>
              )}
            </Button>
          </CardFooter>
        </TabsContent>
        
        <TabsContent value="preview">
          <CardContent className="space-y-4 pt-4">
            <div className="relative rounded-md overflow-hidden aspect-video bg-black">
              {videoUrl && (
                <video
                  controls
                  className="w-full h-full"
                  src={videoUrl}
                >
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
            
            <div className="flex justify-center">
              <Button variant="outline" className="mr-2" onClick={() => setActiveTab("generate")}>
                <Settings className="mr-2 h-4 w-4" />
                Adjust Settings
              </Button>
              <Button onClick={() => {
                // In a real implementation, this would download the video
                window.open(videoUrl, '_blank');
                toast.success("Video download started");
              }}>
                <Download className="mr-2 h-4 w-4" />
                Download Video
              </Button>
            </div>
          </CardContent>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default VideoGenerator;
