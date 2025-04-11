
import ArticleGenerator from "@/components/ArticleGenerator";
import ProfileSection from "@/components/ProfileSection";
import { ThemeToggle } from "@/components/ThemeToggle";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-6xl relative">
        <div className="flex justify-end items-center gap-4 mb-6">
          <ProfileSection size="compact" className="shadow-sm" />
          <ThemeToggle />
        </div>
        <ArticleGenerator />
      </div>
    </div>
  );
};

export default Index;
