
import ArticleGenerator from "@/components/ArticleGenerator";
import ProfileSection from "@/components/ProfileSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-6xl relative">
        <div className="absolute top-4 right-4 md:right-8 w-64 z-10">
          <ProfileSection />
        </div>
        <ArticleGenerator />
      </div>
    </div>
  );
};

export default Index;
