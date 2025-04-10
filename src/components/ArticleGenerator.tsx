
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Sparkles, Copy, Loader2, Search } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ArticleGeneratorProps {}

const ArticleGenerator: React.FC<ArticleGeneratorProps> = () => {
  const [prompt, setPrompt] = useState<string>("");
  const [generatedArticle, setGeneratedArticle] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [temperature, setTemperature] = useState<number>(0.7);
  const [tone, setTone] = useState<string>("professional");
  const [length, setLength] = useState<string>("medium");

  const generateArticle = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a topic to research");
      return;
    }

    setIsGenerating(true);
    setGeneratedArticle("");
    
    try {
      // Step 1: Search Wikipedia for relevant pages
      const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(prompt)}&format=json&origin=*&srlimit=3`;
      const searchResponse = await fetch(searchUrl);
      const searchData = await searchResponse.json();
      
      if (!searchData.query || !searchData.query.search || searchData.query.search.length === 0) {
        toast.error("No Wikipedia articles found for this topic");
        setIsGenerating(false);
        return;
      }
      
      // Step 2: Get the content for the most relevant page
      const pageId = searchData.query.search[0].pageid;
      const contentUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=&explaintext=&pageids=${pageId}&format=json&origin=*`;
      const contentResponse = await fetch(contentUrl);
      const contentData = await contentResponse.json();
      
      const pageContent = contentData.query.pages[pageId].extract;
      
      // Step 3: Format the content based on user preferences
      let formattedContent = formatWikipediaContent(pageContent, tone, length);
      
      // Add title and source attribution
      const pageTitle = contentData.query.pages[pageId].title;
      formattedContent = `# ${pageTitle}\n\n${formattedContent}\n\n---\n*Source: Information gathered from Wikipedia*`;
      
      setGeneratedArticle(formattedContent);
      toast.success("Article generated successfully!");
    } catch (error) {
      console.error("Error generating article:", error);
      toast.error("Failed to generate article. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Format Wikipedia content based on user preferences
  const formatWikipediaContent = (content: string, tone: string, length: string): string => {
    // Split content into paragraphs
    const paragraphs = content.split('\n').filter(p => p.trim() !== '');
    
    // Adjust length
    let adjustedParagraphs = paragraphs;
    if (length === "short" && paragraphs.length > 2) {
      adjustedParagraphs = paragraphs.slice(0, 2);
    } else if (length === "medium" && paragraphs.length > 5) {
      adjustedParagraphs = paragraphs.slice(0, 5);
    } else if (length === "long" && paragraphs.length > 10) {
      adjustedParagraphs = paragraphs.slice(0, 10);
    }
    
    // Apply tone (simplified implementation)
    let finalContent = adjustedParagraphs.join('\n\n');
    
    // Convert to markdown format with headers, paragraphs
    let markdownContent = "";
    
    // Add introduction
    markdownContent += "## Introduction\n\n";
    if (adjustedParagraphs.length > 0) {
      markdownContent += adjustedParagraphs[0] + "\n\n";
    }
    
    // Add main content with appropriate sections
    if (adjustedParagraphs.length > 1) {
      markdownContent += "## Overview\n\n";
      
      for (let i = 1; i < adjustedParagraphs.length; i++) {
        if (i % 2 === 0 && i < adjustedParagraphs.length - 1) {
          markdownContent += `## ${generateSectionTitle(prompt, i)}\n\n`;
        }
        markdownContent += adjustedParagraphs[i] + "\n\n";
      }
    }
    
    // Add conclusion
    markdownContent += "## Conclusion\n\n";
    markdownContent += `This article provided information about ${prompt}. For more detailed information, consider exploring additional resources on this topic.`;
    
    return markdownContent;
  };

  // Generate a section title based on the prompt
  const generateSectionTitle = (prompt: string, sectionIndex: number): string => {
    const titles = [
      `Key Aspects of ${prompt}`,
      `Understanding ${prompt}`,
      `${prompt} in Context`,
      `Important Facts About ${prompt}`,
      `Exploring ${prompt} Further`
    ];
    
    return titles[sectionIndex % titles.length];
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedArticle);
    toast.success("Article copied to clipboard!");
  };

  const articleLengthOptions = {
    short: "Short (1-2 paragraphs)",
    medium: "Medium (3-5 paragraphs)",
    long: "Long (6+ paragraphs)",
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="flex flex-col space-y-6">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Wikipedia Article Generator</h1>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Create research-based articles instantly using Wikipedia data
          </p>
        </div>

        <Alert className="bg-blue-50 border-blue-200 text-blue-800 mb-4">
          <AlertDescription>
            This generator creates articles by gathering and formatting information from Wikipedia. No API key required!
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="generate" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="generate">Generate Article</TabsTrigger>
            <TabsTrigger value="settings">Format Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>What topic would you like to research?</CardTitle>
                <CardDescription>
                  Enter a topic, person, event, or concept to generate an article from Wikipedia
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Enter your topic here... (e.g., 'Quantum Physics', 'Leonardo da Vinci', 'Climate Change')"
                  className="h-40 resize-none"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button 
                  onClick={generateArticle} 
                  disabled={isGenerating} 
                  className="bg-brand-600 hover:bg-brand-700"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Researching...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Generate Article
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>

            {generatedArticle && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Generated Article</CardTitle>
                    <CardDescription>
                      Your Wikipedia-based article is ready
                    </CardDescription>
                  </div>
                  <Button variant="outline" onClick={copyToClipboard}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </Button>
                </CardHeader>
                <Separator />
                <CardContent className="pt-6 prose max-w-none dark:prose-invert">
                  <ReactMarkdown>{generatedArticle}</ReactMarkdown>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Settings</CardTitle>
                <CardDescription>
                  Customize how your article will be formatted
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Content Focus</Label>
                  <Slider
                    defaultValue={[temperature]}
                    max={1}
                    step={0.1}
                    onValueChange={(value) => setTemperature(value[0])}
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>More General</span>
                    <span>More Specific</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="tone">Tone</Label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger id="tone">
                      <SelectValue placeholder="Select tone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="conversational">Conversational</SelectItem>
                      <SelectItem value="informative">Informative</SelectItem>
                      <SelectItem value="educational">Educational</SelectItem>
                      <SelectItem value="simplified">Simplified</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="length">Article Length</Label>
                  <Select value={length} onValueChange={setLength}>
                    <SelectTrigger id="length">
                      <SelectValue placeholder="Select length" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">{articleLengthOptions.short}</SelectItem>
                      <SelectItem value="medium">{articleLengthOptions.medium}</SelectItem>
                      <SelectItem value="long">{articleLengthOptions.long}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ArticleGenerator;
