
import React from "react";
import { Button } from "@/components/ui/button";
import { X, Headphones } from "lucide-react";

interface SummarySocialShareProps {
  onClose: () => void;
  onVoiceOver?: (summary: string) => void;
  summary: string;
}

export const SummarySocialShare: React.FC<SummarySocialShareProps> = ({
  onClose,
  onVoiceOver,
  summary,
}) => {
  const handleVoiceOver = () => {
    if (onVoiceOver && summary) {
      onVoiceOver(summary);
    }
  };

  return (
    <div className="flex justify-between mt-4">
      <Button variant="outline" onClick={onClose} className="text-xs">
        <X className="mr-1 h-3 w-3" />
        Close
      </Button>
      {onVoiceOver && (
        <Button 
          onClick={handleVoiceOver} 
          disabled={!summary}
          className="bg-gradient-to-r from-[rgba(150,93,233,1)] to-[rgba(99,88,238,1)] hover:from-[rgba(99,88,238,1)] hover:to-[rgba(150,93,233,1)] text-white text-xs"
        >
          <Headphones className="mr-1 h-3 w-3" />
          Voice Over
        </Button>
      )}
    </div>
  );
};
