
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Volume2, Pause, Play, RotateCw, VolumeX, Sparkles } from "lucide-react";
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
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("generate");
  const [volume, setVolume] = useState<number>(80);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  
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

  // Generate voice over using Web Speech API
  const generateVoiceOver = async () => {
    setIsGenerating(true);
    
    try {
      // Create a summary of the article
      const summary = summarizeContent(articleContent, 500);
      
      // Create speech synthesis utterance
      const utterance = new SpeechSynthesisUtterance(summary);
      utteranceRef.current = utterance;
      
      // Set volume
      utterance.volume = volume / 100;
      
      // Set up event handlers
      utterance.onend = () => setIsPlaying(false);
      utterance.onpause = () => setIsPlaying(false);
      utterance.onresume = () => setIsPlaying(true);
      utterance.onstart = () => setIsPlaying(true);
      
      // Store the utterance for later use
      utteranceRef.current = utterance;
      
      toast.success("Voice over generated successfully!");
      setActiveTab("listen");
    } catch (error) {
      console.error("Error generating voice over:", error);
      toast.error("Failed to generate voice over. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle play/pause
  const togglePlayback = () => {
    if (!utteranceRef.current) {
      console.error("No utterance available");
      return;
    }
    
    if (isPlaying) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
    } else {
      if (speechSynthesis.paused) {
        window.speechSynthesis.resume();
      } else {
        window.speechSynthesis.speak(utteranceRef.current);
      }
      setIsPlaying(true);
    }
  };

  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    
    if (utteranceRef.current) {
      utteranceRef.current.volume = newVolume / 100;
    }
  };

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (isPlaying) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isPlaying]);

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-2xl"
    >
      <Card className="w-full overflow-hidden border-0 shadow-lg bg-gradient-to-r from-purple-600 to-indigo-600 p-1 rounded-xl">
        <div className="bg-white dark:bg-gray-900 rounded-lg overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 pb-3">
            <CardTitle className="flex items-center text-primary text-lg">
              <Volume2 className="mr-2 h-4 w-4" />
              Text-to-Speech Converter
            </CardTitle>
            <CardDescription className="text-xs">
              Listen to an AI-generated voice over of your article
            </CardDescription>
          </CardHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="generate" className="text-xs py-1.5">Generate</TabsTrigger>
              <TabsTrigger value="listen" className="text-xs py-1.5">Listen</TabsTrigger>
            </TabsList>
            
            <AnimatePresence mode="wait">
              {activeTab === "generate" && (
                <TabsContent value="generate" key="generate-tab">
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="space-y-3"
                  >
                    <CardContent className="space-y-3 pt-4">
                      <motion.div variants={itemVariants} className="space-y-2">
                        <h3 className="text-sm font-medium">Content to Read Aloud</h3>
                        <div className="p-2 bg-muted rounded-md text-xs max-h-32 overflow-y-auto">
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
                          <p className="text-xs text-muted-foreground animate-pulse flex items-center">
                            <RotateCw className="h-3 w-3 mr-2 animate-spin" />
                            Processing your article content...
                          </p>
                        </motion.div>
                      )}
                    </CardContent>
                    
                    <CardFooter className="flex justify-between pt-2">
                      <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
                        Cancel
                      </Button>
                      <Button 
                        onClick={generateVoiceOver} 
                        disabled={isGenerating}
                        size="sm"
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs"
                      >
                        {isGenerating ? (
                          <>
                            <RotateCw className="mr-1 h-3 w-3 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-1 h-3 w-3" />
                            Generate Audio
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
                    className="space-y-3"
                  >
                    <CardContent className="space-y-4 pt-4">
                      <motion.div 
                        variants={itemVariants}
                        className="p-4 rounded-md bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 flex flex-col items-center"
                      >
                        <motion.div 
                          initial={{ scale: 1 }}
                          animate={{ scale: isPlaying ? [1, 1.05, 1] : 1 }}
                          transition={{ repeat: isPlaying ? Infinity : 0, duration: 2 }}
                          className="relative w-14 h-14 mb-3"
                        >
                          {isPlaying ? (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
                                <Pause 
                                  onClick={togglePlayback} 
                                  className="h-6 w-6 text-primary cursor-pointer hover:text-primary/80 transition-colors"
                                />
                              </div>
                              <div className="absolute inset-0 bg-primary/5 rounded-full animate-ping opacity-75"></div>
                            </div>
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
                                <Play 
                                  onClick={togglePlayback} 
                                  className="h-6 w-6 text-primary cursor-pointer hover:text-primary/80 transition-colors ml-1"
                                />
                              </div>
                            </div>
                          )}
                        </motion.div>
                        
                        <h3 className="text-sm font-medium mb-1">{articleTitle}</h3>
                        <p className="text-xs text-muted-foreground text-center max-w-md">
                          Click play to listen to the voice over
                        </p>
                      </motion.div>
                      
                      <motion.div variants={itemVariants} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            {volume === 0 ? (
                              <VolumeX className="h-3 w-3 mr-1 text-muted-foreground" />
                            ) : (
                              <Volume2 className="h-3 w-3 mr-1 text-muted-foreground" />
                            )}
                            <h3 className="text-xs font-medium">Volume</h3>
                          </div>
                          <span className="text-xs text-muted-foreground">{volume}%</span>
                        </div>
                        <Slider
                          min={0}
                          max={100}
                          step={1}
                          value={[volume]}
                          onValueChange={handleVolumeChange}
                          className="mt-1"
                        />
                      </motion.div>
                    </CardContent>
                    
                    <CardFooter className="flex justify-between pt-0">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setActiveTab("generate")}
                        className="text-xs"
                      >
                        <Sparkles className="mr-1 h-3 w-3" />
                        Regenerate
                      </Button>
                      <Button 
                        onClick={togglePlayback}
                        size="sm"
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs"
                      >
                        {isPlaying ? (
                          <>
                            <Pause className="mr-1 h-3 w-3" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="mr-1 h-3 w-3" />
                            Speak
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </motion.div>
                </TabsContent>
              )}
            </AnimatePresence>
          </Tabs>
        </div>
      </Card>
    </motion.div>
  );
};

export default VoiceOver;
