
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Youtube, RefreshCw } from "lucide-react";

interface YoutubeEmbedProps {
  searchTerm: string;
}

export function YoutubeEmbed({ searchTerm }: YoutubeEmbedProps) {
  const [videoId, setVideoId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const searchYoutubeVideo = async () => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    
    try {
      // This is a simulation of YouTube API results since we don't have an actual API key
      // In a real app, you would use the YouTube Data API v3
      
      // For demo purposes, we'll use a predefined list of videos based on common topics
      const simulatedVideos: Record<string, string> = {
        "quantum physics": "zNVQfWC_YEQ",
        "black holes": "e-P5IFTqB98",
        "climate change": "SWmEo6Y_p4Q",
        "artificial intelligence": "kQmhykPBXG4",
        "history": "xuCn8ux2gbs",
        "world war 2": "DwKPFT-RioU",
        "leonardo da vinci": "5qYEjpUCLSI",
        "space exploration": "MHQZxQlgBAs",
        "biology": "QnQe0xW_JY4",
        "astronomy": "0rHUDWjR5gg",
        "chemistry": "FSyAehMdpyI",
        "technology": "xtFhK9hKNzk",
        "psychology": "vo4pMVb0R6M",
      };
      
      // Find a matching video or a default one
      let foundVideoId = null;
      const searchTermLower = searchTerm.toLowerCase();
      
      // Try to find an exact match first
      if (simulatedVideos[searchTermLower]) {
        foundVideoId = simulatedVideos[searchTermLower];
      } else {
        // Check if the search term is included in any of the keys
        for (const [key, id] of Object.entries(simulatedVideos)) {
          if (key.includes(searchTermLower) || searchTermLower.includes(key)) {
            foundVideoId = id;
            break;
          }
        }
        
        // If still no match, use a default video about knowledge
        if (!foundVideoId) {
          foundVideoId = "iDbyYGrswtg"; // Default video: TED-Ed "Why is knowledge so important"
        }
      }
      
      setVideoId(foundVideoId);
    } catch (error) {
      console.error("Error searching YouTube:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchTerm) {
      searchYoutubeVideo();
    }
  }, [searchTerm]);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium flex items-center">
          <Youtube className="mr-2 h-5 w-5 text-red-600" />
          Related Video
        </CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={searchYoutubeVideo}
          disabled={loading}
        >
          {loading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {videoId ? (
          <div className="aspect-video">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${videoId}`}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="border-0"
            ></iframe>
          </div>
        ) : (
          <div className="aspect-video flex items-center justify-center bg-gray-100 dark:bg-gray-800">
            {loading ? (
              <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm text-center p-4">
                No related videos found. Try a different search term.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
