
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Volume2, Pause, Play, RotateCw, Check, VolumeX, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface VoiceOverProps {
  articleContent: string;
  articleTitle: string;
  onClose: () => void;
}

const VoiceOver: React.FC<VoiceOverProps> = ({
  articleContent,
  articleTitle,
  onClose,
}) => {
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("generate");
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);
  const [volume, setVolume] = useState<number>(80);
  
  // Function to summarize article content
  const summarizeContent = (content: string, maxLength: number = 500): string => {
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

  // Function to generate voice over
  const generateVoiceOver = async () => {
    setIsGenerating(true);
    setProgress(0);
    
    // Create a summary of the article
    const summary = summarizeContent(articleContent, 500);
    
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
      }, 600);
      
      // Mock voice generation - in a real implementation, this would call ElevenLabs API
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // For demo purposes, use sample audio. In a real implementation, this would be the URL from the API
      // Sample professional narration audio files
      const sampleAudios = [
        "https://audio-samples.github.io/samples/mp3/blizzard_biased/sample-1.mp3",
        "https://audio-samples.github.io/samples/mp3/blizzard_biased/sample-2.mp3",
        "https://audio-samples.github.io/samples/mp3/blizzard_biased/sample-3.mp3"
      ];
      
      // Choose a consistent audio file based on the article title
      const titleHash = articleTitle.split("").reduce((hash, char) => char.charCodeAt(0) + hash, 0);
      const audioUrl = sampleAudios[titleHash % sampleAudios.length];
      
      setAudioUrl(audioUrl);
      clearInterval(interval);
      setProgress(100);
      toast.success("Voice over generated successfully!");
      setActiveTab("listen");
      
      // Create audio element
      const audio = new Audio(audioUrl);
      setAudioRef(audio);
      
      // Set volume
      audio.volume = volume / 100;
      
      // Add event listeners
      audio.addEventListener("ended", () => setIsPlaying(false));
      audio.addEventListener("pause", () => setIsPlaying(false));
      audio.addEventListener("play", () => setIsPlaying(true));
      
    } catch (error) {
      console.error("Error generating voice over:", error);
      toast.error("Failed to generate voice over. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle play/pause
  const togglePlayback = () => {
    if (!audioRef) return;
    
    if (isPlaying) {
      audioRef.pause();
    } else {
      audioRef.play();
    }
    
    setIsPlaying(!isPlaying);
  };

  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    
    if (audioRef) {
      audioRef.volume = newVolume / 100;
    }
  };

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (audioRef) {
        audioRef.pause();
        audioRef.src = "";
      }
    };
  }, [audioRef]);

  // Auto-generate the voice over when component mounts
  useEffect(() => {
    generateVoiceOver();
  }, []);

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

  return (
    <Card className="w-full max-w-3xl mx-auto overflow-hidden shadow-lg border-primary/10">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
        <CardTitle className="flex items-center text-primary">
          <Volume2 className="mr-2 h-5 w-5" />
          AI Voice Over
        </CardTitle>
        <CardDescription>
          Listen to an AI-generated voice over summary of your article
        </CardDescription>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generate">Generate</TabsTrigger>
          <TabsTrigger value="listen" disabled={!audioUrl}>Listen</TabsTrigger>
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
                        <span>Your voice over will summarize the key points from your article</span>
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                  
                  <Separator />
                  
                  <motion.div variants={itemVariants} className="space-y-2">
                    <h3 className="font-medium">Content Summary</h3>
                    <div className="p-3 bg-muted rounded-md text-sm max-h-40 overflow-y-auto">
                      {summarizeContent(articleContent, 500)}
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
                    onClick={generateVoiceOver} 
                    disabled={isGenerating}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    {isGenerating ? (
                      <>
                        <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Regenerate Audio
                      </>
                    )}
                  </Button>
                </CardFooter>
              </motion.div>
            </TabsContent>
          )}
          
          {activeTab === "listen" && (
            <TabsContent value="listen" key="listen-tab">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-4"
              >
                <CardContent className="space-y-6 pt-4">
                  <motion.div 
                    variants={itemVariants}
                    className="p-6 rounded-md bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 flex flex-col items-center"
                  >
                    <motion.div 
                      initial={{ scale: 1 }}
                      animate={{ scale: isPlaying ? [1, 1.05, 1] : 1 }}
                      transition={{ repeat: isPlaying ? Infinity : 0, duration: 2 }}
                      className="relative w-16 h-16 mb-4"
                    >
                      {isPlaying ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                            <Pause 
                              onClick={togglePlayback} 
                              className="h-8 w-8 text-primary cursor-pointer hover:text-primary/80 transition-colors"
                            />
                          </div>
                          <div className="absolute inset-0 bg-primary/5 rounded-full animate-ping opacity-75"></div>
                        </div>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                            <Play 
                              onClick={togglePlayback} 
                              className="h-8 w-8 text-primary cursor-pointer hover:text-primary/80 transition-colors ml-1"
                            />
                          </div>
                        </div>
                      )}
                    </motion.div>
                    
                    <h3 className="text-lg font-medium mb-2">{articleTitle}</h3>
                    <p className="text-sm text-muted-foreground text-center max-w-md">
                      Listen to the AI voice over summary of your article
                    </p>
                  </motion.div>
                  
                  <motion.div variants={itemVariants} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        {volume === 0 ? (
                          <VolumeX className="h-4 w-4 mr-2 text-muted-foreground" />
                        ) : (
                          <Volume2 className="h-4 w-4 mr-2 text-muted-foreground" />
                        )}
                        <h3 className="font-medium">Volume</h3>
                      </div>
                      <span className="text-sm text-muted-foreground">{volume}%</span>
                    </div>
                    <Slider
                      min={0}
                      max={100}
                      step={1}
                      value={[volume]}
                      onValueChange={handleVolumeChange}
                      className="mt-2"
                    />
                  </motion.div>
                </CardContent>
                
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => setActiveTab("generate")}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Regenerate
                  </Button>
                  <Button onClick={togglePlayback}>
                    {isPlaying ? (
                      <>
                        <Pause className="mr-2 h-4 w-4" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Play
                      </>
                    )}
                  </Button>
                </CardFooter>
              </motion.div>
            </TabsContent>
          )}
        </AnimatePresence>
      </Tabs>
    </Card>
  );
};

export default VoiceOver;
