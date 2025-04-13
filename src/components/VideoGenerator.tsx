import React, { useState, useEffect, useRef } from "react";
import VoiceOver from "./VoiceOver";
import { runwayAPI } from "@/utils/runwayAPI";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";

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
  const [voiceOverUrl, setVoiceOverUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationComplete, setGenerationComplete] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const extractPlainText = (markdown: string) => {
    return markdown
      .replace(/^# \*\*.*?\*\*\n\n/, '')
      .replace(/## \*\*.*?\*\*/g, '')
      .replace(/- /g, '')
      .replace(/\n\n---\n\*Source.*\*$/, '');
  };

  const generateSummary = (content: string) => {
    const paragraphs = content.split('\n\n').filter(p => p && !p.startsWith('#'));
    const firstParagraph = paragraphs[0] || "";
    
    let summary = firstParagraph + "\n\n";
    
    const sections = content.split(/^## \*\*.*?\*\*$/m).filter(Boolean);
    summary += `This was a summary of ${articleTitle}.`;
    
    return summary;
  };

  useEffect(() => {
    const generateVoiceOver = async () => {
      if (isGenerating || generationComplete) return;
      
      setIsGenerating(true);
      
      try {
        console.log("Starting voice over generation for:", articleTitle);
        
        const plainText = extractPlainText(articleContent);
        const summary = generateSummary(plainText);
        
        console.log("Generated summary for voice over:", summary);
        
        const response = await runwayAPI.generateVoiceOver({
          text: summary.substring(0, 1000),
          voice: "narrator"
        });
        
        if (response.url) {
          console.log("Voice over generation successful:", response.url);
          setVoiceOverUrl(response.url);
          setGenerationComplete(true);
          
          if (audioRef.current) {
            audioRef.current.src = response.url;
            audioRef.current.load();
          }
        } else {
          console.error("Voice over generation failed - no URL returned");
          toast.error("Failed to generate voice over");
        }
      } catch (error) {
        console.error("Error generating voice over:", error);
        toast.error("Error generating voice over");
      } finally {
        setIsGenerating(false);
      }
    };

    generateVoiceOver();
  }, [articleContent, articleTitle]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Voice Over</h2>
        <Button variant="outline" onClick={onClose}>Close</Button>
      </div>
      
      {isGenerating ? (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
          <p className="text-muted-foreground">Generating voice over...</p>
        </div>
      ) : voiceOverUrl ? (
        <div className="space-y-4">
          <div className="p-4 rounded-md bg-muted">
            <h3 className="font-medium mb-2">Listen to your article</h3>
            <audio 
              controls 
              className="w-full" 
              ref={audioRef}
              src={voiceOverUrl}
              autoPlay
            >
              Your browser does not support the audio element.
            </audio>
          </div>
          
          <div className="flex justify-end">
            <Button 
              onClick={() => {
                if (audioRef.current) {
                  audioRef.current.play();
                }
              }}
            >
              Play Again
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8">
          <p className="text-muted-foreground">Failed to generate voice over. Please try again.</p>
          <Button 
            className="mt-4"
            onClick={() => {
              setGenerationComplete(false);
              setIsGenerating(false);
            }}
          >
            Retry
          </Button>
        </div>
      )}
    </div>
  );
};

export default VideoGenerator;
