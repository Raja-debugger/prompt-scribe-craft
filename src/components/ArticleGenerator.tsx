
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Sparkles, Copy, Loader2, Lock } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface ArticleGeneratorProps {}

const ArticleGenerator: React.FC<ArticleGeneratorProps> = () => {
  const [apiKey, setApiKey] = useState<string>("");
  const [prompt, setPrompt] = useState<string>("");
  const [generatedArticle, setGeneratedArticle] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [temperature, setTemperature] = useState<number>(0.7);
  const [tone, setTone] = useState<string>("professional");
  const [length, setLength] = useState<string>("medium");

  const generateArticle = async () => {
    if (!apiKey) {
      toast.error("Please enter your OpenAI API key");
      return;
    }

    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setIsGenerating(true);
    
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: `You are an expert article writer. Write a well-structured ${length} article with a ${tone} tone. 
              Include title, introduction, several well-organized sections with subheadings, and a conclusion. 
              Format the article using Markdown with proper headers, paragraphs, and emphasis where appropriate.`,
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: temperature,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setGeneratedArticle(data.choices[0].message.content);
        toast.success("Article generated successfully!");
      } else {
        toast.error(`Error: ${data.error?.message || "Failed to generate article"}`);
      }
    } catch (error) {
      console.error("Error generating article:", error);
      toast.error("Failed to generate article. Please check your API key and try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedArticle);
    toast.success("Article copied to clipboard!");
  };

  const articleLengthOptions = {
    short: "Short (300-500 words)",
    medium: "Medium (800-1200 words)",
    long: "Long (1500+ words)",
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="flex flex-col space-y-6">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">AI Article Generator</h1>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Create high-quality articles instantly with the power of artificial intelligence
          </p>
        </div>

        <Tabs defaultValue="generate" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="generate">Generate Article</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>What would you like to write about?</CardTitle>
                <CardDescription>
                  Enter a topic, headline, or detailed prompt for your article
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Enter your prompt here... (e.g., 'Write an article about the benefits of meditation for reducing stress and improving focus')"
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
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
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
                      Your AI-generated article is ready
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
                <CardTitle>API Key</CardTitle>
                <CardDescription>
                  Enter your OpenAI API key to generate articles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="apiKey">OpenAI API Key</Label>
                    <div className="relative">
                      <Input
                        id="apiKey"
                        type="password"
                        placeholder="sk-..."
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                      />
                      <Lock className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500">
                      Your API key is stored locally and never sent to our servers
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Content Settings</CardTitle>
                <CardDescription>
                  Customize how your article will be generated
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Creativity</Label>
                  <Slider
                    defaultValue={[temperature]}
                    max={1}
                    step={0.1}
                    onValueChange={(value) => setTemperature(value[0])}
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>More Precise</span>
                    <span>More Creative</span>
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
                      <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                      <SelectItem value="informative">Informative</SelectItem>
                      <SelectItem value="humorous">Humorous</SelectItem>
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
