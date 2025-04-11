
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Trash2, Edit, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

interface Article {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  lastUpdated: string;
  type: 'published' | 'draft';
}

const SavedArticles = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [activeTab, setActiveTab] = useState("published");

  useEffect(() => {
    // Load articles from localStorage
    const savedArticles = localStorage.getItem("savedArticles");
    if (savedArticles) {
      setArticles(JSON.parse(savedArticles));
    }
  }, []);

  const deleteArticle = (id: string) => {
    const updatedArticles = articles.filter(article => article.id !== id);
    setArticles(updatedArticles);
    localStorage.setItem("savedArticles", JSON.stringify(updatedArticles));
    toast.success("Article deleted successfully");
  };

  const filteredArticles = articles.filter(article => article.type === activeTab);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <div className="flex justify-end mb-4">
          <ThemeToggle />
        </div>
        
        <div className="flex flex-col space-y-6">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-display font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Saved Articles
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto font-sans">
              View, edit and manage your published articles and drafts
            </p>
          </div>

          <Tabs defaultValue="published" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="published" className="font-semibold">Published</TabsTrigger>
              <TabsTrigger value="draft" className="font-semibold">Drafts</TabsTrigger>
            </TabsList>

            <TabsContent value="published" className="space-y-6">
              {filteredArticles.length === 0 ? (
                <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                  <AlertDescription>
                    You haven't published any articles yet. Generate an article and click "Publish" to save it here.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredArticles.map((article) => (
                    <Card key={article.id} className="border shadow-md dark:shadow-none dark:border-gray-800">
                      <CardHeader>
                        <CardTitle className="font-display text-xl">{article.title}</CardTitle>
                        <CardDescription>
                          Published on: {new Date(article.createdAt).toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-40">
                          <div className="prose prose-sm dark:prose-invert">
                            {article.content.slice(0, 300)}...
                          </div>
                        </ScrollArea>
                      </CardContent>
                      <CardFooter className="flex justify-between gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/?edit=${article.id}`}>
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/?view=${article.id}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Link>
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => deleteArticle(article.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="draft" className="space-y-6">
              {filteredArticles.length === 0 ? (
                <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                  <AlertDescription>
                    You haven't saved any drafts yet. Generate an article and click "Save as Draft" to save it here.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredArticles.map((article) => (
                    <Card key={article.id} className="border shadow-md dark:shadow-none dark:border-gray-800">
                      <CardHeader>
                        <CardTitle className="font-display text-xl">{article.title}</CardTitle>
                        <CardDescription>
                          Last updated: {new Date(article.lastUpdated).toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-40">
                          <div className="prose prose-sm dark:prose-invert">
                            {article.content.slice(0, 300)}...
                          </div>
                        </ScrollArea>
                      </CardContent>
                      <CardFooter className="flex justify-between gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/?edit=${article.id}`}>
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Link>
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => deleteArticle(article.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex justify-center mt-6">
            <Button asChild className="font-medium">
              <Link to="/">
                <FileText className="mr-2 h-4 w-4" />
                Generate New Article
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavedArticles;
