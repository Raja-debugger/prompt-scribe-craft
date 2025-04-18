
import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Copy, Headphones } from "lucide-react";
import { toast } from "sonner";

interface SummaryGeneratorProps {
  articleContent: string;
  articleTitle: string;
  summary: string;
  isGenerating: boolean;
}

export const SummaryGenerator: React.FC<SummaryGeneratorProps> = ({
  articleContent,
  articleTitle,
  summary,
  isGenerating,
}) => {
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(summary);
    toast.success("Summary copied to clipboard");
  };

  const speakSummary = () => {
    if (summary) {
      if (isSpeaking) {
        speechSynthesis.cancel();
        setIsSpeaking(false);
        toast.info("Speech stopped");
      } else {
        const utterance = new SpeechSynthesisUtterance(summary);
        utterance.rate = 1;
        utterance.pitch = 1;
        utterance.onend = () => setIsSpeaking(false);
        
        speechSynthesis.speak(utterance);
        setIsSpeaking(true);
        toast.success("Speaking summary...");
      }
    }
  };

  return (
    <div className="space-y-2">
      {isGenerating ? (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary mb-3" />
          <p className="text-sm text-center">Generating summary...</p>
        </div>
      ) : (
        <>
          <h2 className="text-sm font-medium">Summary of "{articleTitle}":</h2>
          <Textarea 
            value={summary} 
            readOnly 
            className="h-[200px] resize-none text-sm leading-relaxed border rounded-lg shadow-sm"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          />
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
        </>
      )}
    </div>
  );
};
