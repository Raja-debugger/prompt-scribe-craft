
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Youtube, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

interface YoutubeEmbedProps {
  searchTerm: string;
}

const YOUTUBE_API_KEY = 'AIzaSyCWmRe5WCOp0gqazLEA2548tikFYSHp15E';

export function YoutubeEmbed({ searchTerm }: YoutubeEmbedProps) {
  const [videoId, setVideoId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const searchYoutubeVideo = async () => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=${encodeURIComponent(searchTerm)}&key=${YOUTUBE_API_KEY}&type=video`
      );
      
      const data = await response.json();
      
      if (data.items && data.items.length > 0) {
        setVideoId(data.items[0].id.videoId);
      }
    } catch (error) {
      console.error("Error fetching YouTube video:", error);
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="overflow-hidden border-purple-100 shadow-lg transition-all duration-300 hover:shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-[rgba(150,93,233,1)] to-[rgba(99,88,238,1)]">
          <CardTitle className="text-lg font-medium flex items-center text-white">
            <Youtube className="mr-2 h-5 w-5 text-white" />
            Related Video
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={searchYoutubeVideo}
            disabled={loading}
            className="hover:bg-purple-400/20 transition-colors duration-300 text-white"
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
            <div className="aspect-video flex items-center justify-center bg-gradient-to-r from-purple-50 to-indigo-50">
              {loading ? (
                <RefreshCw className="h-8 w-8 animate-spin text-purple-400" />
              ) : (
                <p className="text-gray-500 text-sm text-center p-4">
                  No related videos found. Try a different search term.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
