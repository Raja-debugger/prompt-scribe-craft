
import ArticleGenerator from "@/components/ArticleGenerator";
import ProfileSection from "@/components/ProfileSection";
import { ThemeToggle } from "@/components/ThemeToggle";
import Navbar from "@/components/Navbar";
import { SidebarNav, sidebarNavItems } from "@/components/SidebarNav";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto py-8 px-4 max-w-6xl relative">
        <div className="flex flex-col md:flex-row gap-8">
          <aside className="md:w-64 md:shrink-0">
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
          </aside>
          
          <div className="flex-1">
            <ArticleGenerator />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
