
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import ArticleGenerator from "@/components/ArticleGenerator";
import Navbar from "@/components/Navbar";
import { SidebarNav, sidebarNavItems } from "@/components/SidebarNav";
import ImprovedAIChatbot from "@/components/ImprovedAIChatbot";
import TextSummarizer from "@/components/TextSummarizer";
import VoiceOver from "@/components/VoiceOver";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const { isAuthenticated } = useAuth();
  const [showSummarizer, setShowSummarizer] = useState<boolean>(false);
  const [showVoiceOver, setShowVoiceOver] = useState<boolean>(false);
  const [articleContent, setArticleContent] = useState<string>("");
  const [articleTitle, setArticleTitle] = useState<string>("Your Article");

  // Connect global click handlers for summary and voice over buttons
  useEffect(() => {
    // Set up global handlers to be used by navbar buttons
    // @ts-ignore
    window.handleSummaryClick = () => {
      // Get article content from localStorage or any other source
      const content = localStorage.getItem("article_content") || "";
      const title = localStorage.getItem("article_title") || "Your Article";
      
      if (content) {
        setArticleContent(content);
        setArticleTitle(title);
        setShowSummarizer(true);
      } else {
        console.log("No article content found to summarize");
      }
    };
    
    // @ts-ignore
    window.handleVoiceOverClick = () => {
      // First check if we have a summary
      const summary = localStorage.getItem("summarized_text");
      const title = localStorage.getItem("summarized_title") || "Your Article";
      
      if (summary) {
        setArticleContent(summary);
        setArticleTitle(title);
        setShowVoiceOver(true);
      } else {
        // If no summary, try to get the original article
        const content = localStorage.getItem("article_content");
        if (content) {
          setArticleContent(content);
          setArticleTitle(localStorage.getItem("article_title") || "Your Article");
          setShowSummarizer(true); // Show summarizer first
        } else {
          console.log("No content found to create voice over");
        }
      }
    };
    
    // Add event listeners to the navbar buttons
    const summaryButton = document.getElementById('summary-button');
    const voiceOverButton = document.getElementById('voiceover-button');
    
    if (summaryButton) {
      summaryButton.addEventListener('click', () => {
        // @ts-ignore
        if (window.handleSummaryClick) {
          // @ts-ignore
          window.handleSummaryClick();
        }
      });
    }
    
    if (voiceOverButton) {
      voiceOverButton.addEventListener('click', () => {
        // @ts-ignore
        if (window.handleVoiceOverClick) {
          // @ts-ignore
          window.handleVoiceOverClick();
        }
      });
    }
    
    return () => {
      // Clean up event listeners
      if (summaryButton) {
        summaryButton.removeEventListener('click', () => {});
      }
      if (voiceOverButton) {
        voiceOverButton.removeEventListener('click', () => {});
      }
      // @ts-ignore
      delete window.handleSummaryClick;
      // @ts-ignore
      delete window.handleVoiceOverClick;
    };
  }, []);

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  const handleVoiceOverFromSummary = (summary: string) => {
    setArticleContent(summary);
    setShowSummarizer(false);
    setShowVoiceOver(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="container mx-auto py-8 px-4 max-w-6xl relative"
      >
        <div className="flex flex-col md:flex-row gap-8">
          <motion.aside 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="md:w-64 md:shrink-0"
          >
            <div className="sticky top-16">
              <div className="space-y-4">
                <div className="px-3 py-2">
                  <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                    Navigation
                  </h2>
                  <SidebarNav items={sidebarNavItems} />
                </div>
              </div>
            </div>
          </motion.aside>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex-1"
          >
            <ArticleGenerator />
          </motion.div>
        </div>
      </motion.div>
      
      {/* Modal overlays for summarizer and voice over */}
      <AnimatePresence>
        {showSummarizer && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <TextSummarizer 
                articleContent={articleContent}
                articleTitle={articleTitle}
                onClose={() => setShowSummarizer(false)}
                onVoiceOver={handleVoiceOverFromSummary}
              />
            </motion.div>
          </motion.div>
        )}
        
        {showVoiceOver && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <VoiceOver 
                articleContent={articleContent}
                articleTitle={articleTitle}
                onClose={() => setShowVoiceOver(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Add the improved AI Chatbot */}
      <ImprovedAIChatbot />
    </div>
  );
};

export default Index;
