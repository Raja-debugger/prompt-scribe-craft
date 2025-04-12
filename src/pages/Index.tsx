
import ArticleGenerator from "@/components/ArticleGenerator";
import { ThemeToggle } from "@/components/ThemeToggle";
import Navbar from "@/components/Navbar";
import { SidebarNav, sidebarNavItems } from "@/components/SidebarNav";
import AIChatbot from "@/components/AIChatbot";
import { motion } from "framer-motion";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex-1"
          >
            <ArticleGenerator />
          </motion.div>
        </div>
      </motion.div>
      
      {/* Add the AI Chatbot */}
      <AIChatbot />
    </div>
  );
};

export default Index;
