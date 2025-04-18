
import React from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";

interface CaptionGeneratorProps {
  captions: string[];
  hashtags: string[];
}

export const CaptionGenerator: React.FC<CaptionGeneratorProps> = ({
  captions,
  hashtags,
}) => {
  return (
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
  );
};
