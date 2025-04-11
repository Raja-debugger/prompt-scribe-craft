
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Sparkles, Copy, Loader2, Search, Star, Hash, MessageSquareText, FileText, Image as ImageIcon, Folder, Youtube } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { YoutubeEmbed } from "@/components/YoutubeEmbed";

interface ArticleGeneratorProps {}

interface ReviewQuestion {
  id: string;
  question: string;
  rating: number;
}

interface SEOMetadata {
  title: string;
  description: string;
  keywords: string[];
  wordCount: number;
  readabilityScore: number | null;
  keywordDensity: {
    keyword: string;
    count: number;
    density: number;
  }[];
}

const ArticleGenerator: React.FC<ArticleGeneratorProps> = () => {
  const [prompt, setPrompt] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [generatedArticle, setGeneratedArticle] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [temperature, setTemperature] = useState<number>(0.7);
  const [tone, setTone] = useState<string>("professional");
  const [length, setLength] = useState<string>("long");
  const [readabilityScore, setReadabilityScore] = useState<number | null>(null);
  const [wordCount, setWordCount] = useState<number>(0);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [captions, setCaptions] = useState<string[]>([]);
  const [seoMetadata, setSeoMetadata] = useState<SEOMetadata | null>(null);
  const [selectedTab, setSelectedTab] = useState<string>("generate");
  const [activeImageTab, setActiveImageTab] = useState<string>("suggested");
  const [suggestedImages, setSuggestedImages] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [reviewQuestions, setReviewQuestions] = useState<ReviewQuestion[]>([
    { id: "clarity", question: "How clear is the information presented?", rating: 0 },
    { id: "accuracy", question: "How accurate does the information seem?", rating: 0 },
    { id: "comprehensiveness", question: "How comprehensive is the article?", rating: 0 },
    { id: "organization", question: "How well-organized is the content?", rating: 0 },
    { id: "relevance", question: "How relevant is the content to the topic?", rating: 0 }
  ]);
  const [reviewSuggestion, setReviewSuggestion] = useState<string>("");
  const [showReview, setShowReview] = useState<boolean>(false);

  const placeholderImages = [
    "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=600&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=600&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=60"
  ];

  const generateArticle = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a topic to research");
      return;
    }

    setIsGenerating(true);
    setGeneratedArticle("");
    setReadabilityScore(null);
    setWordCount(0);
    setHashtags([]);
    setCaptions([]);
    setShowReview(false);
    setSuggestedImages([]);
    setSelectedImages([]);
    setSeoMetadata(null);
    
    try {
      const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(prompt)}&format=json&origin=*&srlimit=3`;
      const searchResponse = await fetch(searchUrl);
      const searchData = await searchResponse.json();
      
      if (!searchData.query || !searchData.query.search || searchData.query.search.length === 0) {
        toast.error("No Wikipedia articles found for this topic");
        setIsGenerating(false);
        return;
      }
      
      let allContent = "";
      let collectedPages = [];
      
      const mainPageId = searchData.query.search[0].pageid;
      const mainContentUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext=&pageids=${mainPageId}&format=json&origin=*`;
      const mainContentResponse = await fetch(mainContentUrl);
      const mainContentData = await mainContentResponse.json();
      
      const mainPageContent = mainContentData.query.pages[mainPageId].extract;
      const mainPageTitle = mainContentData.query.pages[mainPageId].title;
      
      allContent += mainPageContent;
      collectedPages.push(mainPageTitle);
      
      if (countWords(allContent) < 800 && searchData.query.search.length > 1) {
        for (let i = 1; i < searchData.query.search.length; i++) {
          const relatedPageId = searchData.query.search[i].pageid;
          const relatedContentUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=&explaintext=&pageids=${relatedPageId}&format=json&origin=*`;
          const relatedContentResponse = await fetch(relatedContentUrl);
          const relatedContentData = await relatedContentResponse.json();
          
          const relatedPageContent = relatedContentData.query.pages[relatedPageId].extract;
          const relatedPageTitle = relatedContentData.query.pages[relatedPageId].title;
          
          allContent += "\n\n" + relatedPageContent;
          collectedPages.push(relatedPageTitle);
          
          if (countWords(allContent) >= 800) break;
        }
      }
      
      let formattedContent = formatWikipediaContent(allContent, tone, "long", 1200);
      
      const readability = calculateReadabilityScore(formattedContent);
      setReadabilityScore(readability);
      
      const articleWordCount = countWords(formattedContent);
      setWordCount(articleWordCount);
      
      const generatedHashtags = generateHashtags(prompt, mainPageTitle);
      setHashtags(generatedHashtags);
      
      const generatedCaptions = generateCaptions(prompt, mainPageTitle, formattedContent);
      setCaptions(generatedCaptions);

      const seoData = generateSEOMetadata(prompt, formattedContent, mainPageTitle);
      setSeoMetadata(seoData);

      setSuggestedImages(placeholderImages.slice(0, 3));
      
      formattedContent = `# **${mainPageTitle}**\n\n${formattedContent}\n\n---\n*Source: Information gathered from Wikipedia (${collectedPages.join(", ")})*`;
      
      setGeneratedArticle(formattedContent);
      toast.success("Article generated successfully!");
    } catch (error) {
      console.error("Error generating article:", error);
      toast.error("Failed to generate article. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const countWords = (text: string): number => {
    return text.split(/\s+/).filter(word => word.length > 0).length;
  };

  const calculateReadabilityScore = (text: string): number => {
    const sentences = text.split(/[.!?]+/).filter(sentence => sentence.length > 0);
    const words = text.split(/\s+/).filter(word => word.length > 0);
    const syllables = countSyllables(text);
    
    if (sentences.length === 0 || words.length === 0) return 0;
    
    const ASL = words.length / sentences.length; // Average Sentence Length
    const ASW = syllables / words.length; // Average Syllables per Word
    
    const readabilityScore = 0.39 * ASL + 11.8 * ASW - 15.59;
    
    return Math.round(readabilityScore * 10) / 10;
  };

  const countSyllables = (text: string): number => {
    const words = text.toLowerCase().split(/\s+/).filter(word => word.length > 0);
    let count = 0;
    
    for (const word of words) {
      const cleanWord = word.replace(/[^a-z]/g, '');
      if (cleanWord.length < 3 || word.match(/^[aeiouy]+$/)) {
        count += 1;
        continue;
      }
      
      let syllableCount = cleanWord.match(/[aeiouy]{1,2}/g)?.length || 1;
      
      if (cleanWord.endsWith('e') && !cleanWord.endsWith('le')) {
        syllableCount -= 1;
      }
      if (cleanWord.endsWith('es') || cleanWord.endsWith('ed') && !cleanWord.match(/[aeiouy]d$/)) {
        syllableCount -= 1;
      }
      
      count += Math.max(1, syllableCount);
    }
    
    return count;
  };

  const formatWikipediaContent = (content: string, tone: string, length: string, targetMaxWords: number = 1200): string => {
    const paragraphs = content.split('\n').filter(p => p.trim() !== '');
    
    const targetMinWords = 1000;
    
    let adjustedParagraphs = [];
    let currentWordCount = 0;
    
    for (let i = 0; i < paragraphs.length; i++) {
      const paragraphWordCount = paragraphs[i].split(/\s+/).length;
      
      if (currentWordCount + paragraphWordCount > targetMaxWords && currentWordCount >= targetMinWords) {
        break;
      }
      
      adjustedParagraphs.push(paragraphs[i]);
      currentWordCount += paragraphWordCount;
      
      if (currentWordCount >= targetMinWords && 
          i + 1 < paragraphs.length && 
          currentWordCount + paragraphs[i+1].split(/\s+/).length > targetMaxWords) {
        break;
      }
    }
    
    if (currentWordCount < targetMinWords && paragraphs.length > adjustedParagraphs.length) {
      for (let i = adjustedParagraphs.length; i < paragraphs.length; i++) {
        const words = paragraphs[i].split(/\s+/);
        const wordsNeeded = targetMinWords - currentWordCount;
        
        if (wordsNeeded <= 0) break;
        
        if (words.length <= wordsNeeded) {
          adjustedParagraphs.push(paragraphs[i]);
          currentWordCount += words.length;
        } else {
          const truncatedParagraph = words.slice(0, wordsNeeded).join(' ') + '...';
          adjustedParagraphs.push(truncatedParagraph);
          currentWordCount += wordsNeeded;
          break;
        }
      }
    }
    
    let markdownContent = "";
    
    markdownContent += "## **Introduction**\n\n";
    if (adjustedParagraphs.length > 0) {
      markdownContent += adjustedParagraphs[0] + "\n\n";
    }
    
    if (adjustedParagraphs.length > 1) {
      const remainingParagraphs = adjustedParagraphs.length - 1;
      const sectionCount = Math.min(4, Math.ceil(remainingParagraphs / 2));
      const paragraphsPerSection = Math.ceil(remainingParagraphs / sectionCount);
      
      for (let i = 0; i < sectionCount; i++) {
        markdownContent += `## **${generateSectionTitle(prompt, i)}**\n\n`;
        
        const startIdx = 1 + (i * paragraphsPerSection);
        const endIdx = Math.min(adjustedParagraphs.length, startIdx + paragraphsPerSection);
        
        for (let j = startIdx; j < endIdx; j++) {
          markdownContent += adjustedParagraphs[j] + "\n\n";
        }
      }
    }
    
    markdownContent += "## **Conclusion**\n\n";
    markdownContent += `This article provided essential information about ${prompt}. The content covered key aspects of the topic, including historical context, significant developments, and current relevance. For more detailed information, consider exploring the original Wikipedia sources referenced.`;
    
    return markdownContent;
  };

  const generateSectionTitle = (prompt: string, sectionIndex: number): string => {
    const titles = [
      `Key Aspects of ${prompt}`,
      `Understanding ${prompt}`,
      `${prompt} in Context`,
      `Important Facts About ${prompt}`,
      `Exploring ${prompt} Further`,
      `Historical Background of ${prompt}`,
      `The Significance of ${prompt}`,
      `${prompt}: Analysis and Insights`,
      `Contemporary Perspectives on ${prompt}`,
      `Future Directions for ${prompt}`
    ];
    
    return titles[sectionIndex % titles.length];
  };

  const generateHashtags = (prompt: string, title: string): string[] => {
    const words = [...new Set([...prompt.split(/\s+/), ...title.split(/\s+/)])];
    const hashtags = [];
    
    hashtags.push(`#${prompt.replace(/\s+/g, '')}`);
    hashtags.push(`#${title.replace(/\s+/g, '')}`);
    
    for (const word of words) {
      if (word.length > 3 && !hashtags.includes(`#${word}`)) {
        hashtags.push(`#${word}`);
      }
    }
    
    hashtags.push('#Research');
    hashtags.push('#Knowledge');
    hashtags.push('#Wikipedia');
    hashtags.push('#Learning');
    
    return hashtags.slice(0, 10);
  };

  const generateCaptions = (prompt: string, title: string, content: string): string[] => {
    const firstSentence = content.split('.')[0].trim() + '.';
    
    return [
      `📚 Exploring ${title}: ${firstSentence} #${prompt.replace(/\s+/g, '')} #Learning`,
      `🔍 Did you know about ${title}? Check out this comprehensive article to learn more! #Research #Knowledge`,
      `🌟 Enhance your understanding of ${title} with this well-researched article. Perfect for students and enthusiasts alike! #Education #${title.replace(/\s+/g, '')}`,
      `💡 Fascinating insights about ${title} - expand your knowledge today! #Wikipedia #Information`,
      `📖 "${firstSentence}" Learn more about ${title} in my latest research article. #Learning #${prompt.replace(/\s+/g, '')}`
    ];
  };

  const generateSEOMetadata = (prompt: string, content: string, title: string): SEOMetadata => {
    const paragraphs = content.split('\n\n');
    let description = '';
    
    for (const paragraph of paragraphs) {
      if (paragraph.trim() && !paragraph.startsWith('#')) {
        description = paragraph.slice(0, 160) + (paragraph.length > 160 ? '...' : '');
        break;
      }
    }
    
    const words = content.toLowerCase().split(/\s+/);
    const wordFrequency: {[key: string]: number} = {};
    
    const commonWords = new Set(['the', 'and', 'of', 'to', 'a', 'in', 'for', 'is', 'on', 'that', 'by', 'this', 'with', 'i', 'you', 'it', 'not', 'or', 'be', 'are', 'from', 'at', 'as', 'your']);
    
    for (const word of words) {
      const cleanWord = word.replace(/[^a-z]/g, '');
      if (cleanWord.length < 3 || commonWords.has(cleanWord)) continue;
      
      wordFrequency[cleanWord] = (wordFrequency[cleanWord] || 0) + 1;
    }
    
    const sortedWords = Object.entries(wordFrequency).sort((a, b) => b[1] - a[1]);
    
    const keywords = sortedWords.slice(0, 10).map(entry => entry[0]);
    
    const totalWords = words.length;
    const keywordDensity = sortedWords.slice(0, 5).map(([keyword, count]) => ({
      keyword,
      count,
      density: Math.round((count / totalWords) * 1000) / 10,
    }));
    
    return {
      title,
      description,
      keywords,
      wordCount: totalWords,
      readabilityScore: calculateReadabilityScore(content),
      keywordDensity,
    };
  };

  const generateImageAltText = (image: string, content: string): string => {
    const filenameParts = image.split('/').pop()?.split('?')[0].split('-') || [];
    const keywords = filenameParts
      .filter(word => word.length > 3)
      .map(word => word.replace(/[0-9]/g, ''));
    
    return `${prompt} - ${keywords.join(' ')}`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedArticle);
    toast.success("Article copied to clipboard!");
  };

  const handleRatingChange = (questionId: string, rating: number) => {
    setReviewQuestions(prevQuestions => 
      prevQuestions.map(q => 
        q.id === questionId ? { ...q, rating } : q
      )
    );
  };

  const submitReview = () => {
    const unansweredQuestions = reviewQuestions.filter(q => q.rating === 0);
    if (unansweredQuestions.length > 0) {
      toast.error("Please answer all review questions before submitting");
      return;
    }

    const totalRating = reviewQuestions.reduce((sum, q) => sum + q.rating, 0);
    const averageRating = totalRating / reviewQuestions.length;
    
    toast.success(`Thank you for your review! Average rating: ${averageRating.toFixed(1)}/5`);
  };

  const toggleReviewSection = () => {
    setShowReview(!showReview);
  };

  const getReadabilityDescription = (score: number): string => {
    if (score < 6) return "Elementary school level";
    if (score < 8) return "Middle school level";
    if (score < 10) return "High school level";
    if (score < 12) return "Early college level";
    if (score < 14) return "College level";
    return "Graduate level";
  };

  const getReadabilityColor = (score: number): string => {
    if (score < 8) return "text-green-600";
    if (score < 12) return "text-amber-600";
    return "text-red-600";
  };

  const toggleImageSelection = (imageUrl: string) => {
    setSelectedImages(prev => {
      if (prev.includes(imageUrl)) {
        return prev.filter(img => img !== imageUrl);
      } else {
        return [...prev, imageUrl];
      }
    });
  };

  const articleLengthOptions = {
    short: "Short (250-300 words)",
    medium: "Medium (500-600 words)",
    long: "Long (1000-1200 words)",
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <div className="flex justify-end mb-4">
          <ThemeToggle />
        </div>
        
        <div className="flex flex-col space-y-6">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-display font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Wikipedia Article Generator
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto font-sans">
              Create research-based articles (1000-1200 words) with bold headings and formatted text
            </p>
          </div>

          <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 mb-4">
            <AlertDescription>
              This generator creates articles by gathering and formatting information from Wikipedia. Generate articles between 1000-1200 words with bold headings, readability scoring and SEO optimization!
            </AlertDescription>
          </Alert>

          <Tabs defaultValue="generate" className="w-full" value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="generate" className="font-semibold">Generate Article</TabsTrigger>
              <TabsTrigger value="settings" className="font-semibold">Format Settings</TabsTrigger>
              <TabsTrigger value="seo" disabled={!generatedArticle} className="font-semibold">SEO Tools</TabsTrigger>
            </TabsList>

            <TabsContent value="generate" className="space-y-6">
              <Card className="border shadow-md dark:shadow-none dark:border-gray-800">
                <CardHeader>
                  <CardTitle className="font-display text-2xl">What topic would you like to research?</CardTitle>
                  <CardDescription>
                    Enter a topic, person, event, or concept to generate an article from Wikipedia
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="topic" className="font-medium">Topic</Label>
                    <Textarea
                      id="topic"
                      placeholder="Enter your topic here... (e.g., 'Quantum Physics', 'Leonardo da Vinci', 'Climate Change')"
                      className="h-40 resize-none mt-1.5"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="category" className="font-medium">Category (Optional)</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger id="category" className="mt-1.5">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="science">Science</SelectItem>
                        <SelectItem value="history">History</SelectItem>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="art">Art & Culture</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="health">Health & Medicine</SelectItem>
                        <SelectItem value="general">General Knowledge</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button 
                    onClick={generateArticle} 
                    disabled={isGenerating} 
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 font-medium px-6 text-white"
                    size="lg"
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
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-6">
                      <Card className="border shadow-md dark:shadow-none dark:border-gray-800">
                        <CardHeader className="flex flex-row items-center justify-between">
                          <div>
                            <CardTitle className="font-display text-2xl">Generated Article</CardTitle>
                            <CardDescription>
                              Your Wikipedia-based article is ready
                            </CardDescription>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" onClick={toggleReviewSection} className="font-medium">
                              <Star className="mr-2 h-4 w-4" />
                              Review
                            </Button>
                            <Button variant="outline" onClick={copyToClipboard} className="font-medium">
                              <Copy className="mr-2 h-4 w-4" />
                              Copy
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => setSelectedTab("seo")}
                              className="font-medium"
                            >
                              <Sparkles className="mr-2 h-4 w-4" />
                              SEO
                            </Button>
                          </div>
                        </CardHeader>
                        
                        {readabilityScore !== null && (
                          <CardContent className="pb-0">
                            <div className="flex flex-wrap gap-4 justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-md text-sm">
                              <div>
                                <span className="font-semibold">Word Count:</span> {wordCount} words
                              </div>
                              <div>
                                <span className="font-semibold">Reading Time:</span> ~{Math.ceil(wordCount / 200)} min
                              </div>
                              <div>
                                <Popover>
                                  <PopoverTrigger>
                                    <div className="flex items-center cursor-pointer text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                                      <span className="font-semibold">Readability Score:</span>
                                      <span className={`ml-1 ${getReadabilityColor(readabilityScore)}`}>{readabilityScore}</span>
                                      <span className="ml-2 text-xs underline">What's this?</span>
                                    </div>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-80">
                                    <div className="space-y-2">
                                      <h4 className="font-medium">Readability Score Explained</h4>
                                      <p className="text-sm text-gray-700 dark:text-gray-300">
                                        This number represents the Flesch-Kincaid Grade Level, indicating the US grade level needed to understand the text.
                                      </p>
                                      <div className="text-sm">
                                        <p><strong>Your score:</strong> {readabilityScore} - {getReadabilityDescription(readabilityScore)}</p>
                                        <p className="mt-2"><strong>Scale:</strong></p>
                                        <ul className="list-disc list-inside space-y-1 mt-1">
                                          <li>1-5: Elementary school</li>
                                          <li>6-8: Middle school</li>
                                          <li>9-12: High school</li>
                                          <li>13+: College level and beyond</li>
                                        </ul>
                                      </div>
                                    </div>
                                  </PopoverContent>
                                </Popover>
                              </div>
                            </div>
                          </CardContent>
                        )}
                        
                        <Separator className="my-4" />
                        
                        <CardContent className="article-content">
                          <ReactMarkdown>{generatedArticle}</ReactMarkdown>
                        </CardContent>
                      </Card>

                      {showReview && (
                        <Card className="border shadow-md dark:shadow-none dark:border-gray-800">
                          <CardHeader>
                            <CardTitle className="font-display text-xl flex items-center">
                              <Star className="mr-2 h-5 w-5 text-yellow-500" fill="currentColor" />
                              Rate This Article
                            </CardTitle>
                            <CardDescription>
                              Help us improve by rating the quality of the generated article
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-6">
                            {reviewQuestions.map((question) => (
                              <div key={question.id} className="space-y-2">
                                <Label className="font-medium">{question.question}</Label>
                                <div className="flex items-center space-x-2">
                                  <RadioGroup 
                                    value={question.rating.toString()} 
                                    onValueChange={(value) => handleRatingChange(question.id, parseInt(value))}
                                    className="flex space-x-2"
                                  >
                                    {[1, 2, 3, 4, 5].map((rating) => (
                                      <div key={rating} className="flex flex-col items-center">
                                        <RadioGroupItem value={rating.toString()} id={`${question.id}-${rating}`} className="sr-only" />
                                        <Label 
                                          htmlFor={`${question.id}-${rating}`}
                                          className={`cursor-pointer p-1 ${question.rating === rating ? 'text-yellow-500' : 'text-gray-400'}`}
                                        >
                                          <Star className={`h-6 w-6 ${question.rating >= rating ? 'fill-yellow-400' : ''}`} />
                                        </Label>
                                        <span className="text-xs">{rating}</span>
                                      </div>
                                    ))}
                                  </RadioGroup>
                                </div>
                              </div>
                            ))}
                            
                            <div className="space-y-2">
                              <Label htmlFor="suggestion" className="font-medium">How could we improve this article?</Label>
                              <Textarea
                                id="suggestion"
                                placeholder="Share your suggestions..."
                                value={reviewSuggestion}
                                onChange={(e) => setReviewSuggestion(e.target.value)}
                              />
                            </div>
                            
                            <Button 
                              onClick={submitReview}
                              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 font-medium text-white"
                            >
                              Submit Review
                            </Button>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                    
                    <div className="space-y-6">
                      <YoutubeEmbed searchTerm={prompt} />
                      
                      {hashtags.length > 0 && (
                        <Card className="border shadow-md dark:shadow-none dark:border-gray-800">
                          <CardHeader>
                            <CardTitle className="flex items-center font-display text-xl">
                              <Hash className="mr-2 h-5 w-5" />
                              Hashtags & Captions
                            </CardTitle>
                            <CardDescription>
                              Use these for sharing on social media
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-6">
                            <div>
                              <h3 className="text-lg font-medium mb-2">Hashtags</h3>
                              <div className="flex flex-wrap gap-2">
                                {hashtags.map((tag, index) => (
                                  <div key={index} className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-sm">
                                    {tag}
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            <Separator />
                            
                            <div>
                              <h3 className="text-lg font-medium mb-2 flex items-center">
                                <MessageSquareText className="mr-2 h-5 w-5" />
                                Social Media Captions
                              </h3>
                              <div className="space-y-3">
                                {captions.map((caption, index) => (
                                  <div key={index} className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-md relative group">
                                    <p className="text-gray-800 dark:text-gray-200">{caption}</p>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={() => {
                                        navigator.clipboard.writeText(caption);
                                        toast.success("Caption copied to clipboard!");
                                      }}
                                    >
                                      <Copy className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </div>
                </>
              )}
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-6">
              <Card className="border shadow-md dark:shadow-none dark:border-gray-800">
                <CardHeader>
                  <CardTitle className="font-display text-2xl">Format Settings</CardTitle>
                  <CardDescription>
                    Customize how your article is generated
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="tone" className="font-medium">Writing Tone</Label>
                    <Select value={tone} onValueChange={setTone}>
                      <SelectTrigger id="tone">
                        <SelectValue placeholder="Select tone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Professional & Academic</SelectItem>
                        <SelectItem value="conversational">Conversational & Friendly</SelectItem>
                        <SelectItem value="simple">Simple & Direct</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="length" className="font-medium">Article Length</Label>
                    <Select value={length} onValueChange={setLength}>
                      <SelectTrigger id="length">
                        <SelectValue placeholder="Select length" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="long">Long (1000-1200 words)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="temperature" className="font-medium">Creativity Level</Label>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{temperature.toFixed(1)}</span>
                    </div>
                    <Slider
                      id="temperature"
                      min={0.1}
                      max={1.0}
                      step={0.1}
                      value={[temperature]}
                      onValueChange={(value) => setTemperature(value[0])}
                      className="mt-2"
                    />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>Factual</span>
                      <span>Creative</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="seo" className="space-y-6">
              {seoMetadata && (
                <>
                  <Card className="border shadow-md dark:shadow-none dark:border-gray-800">
                    <CardHeader>
                      <CardTitle className="font-display text-2xl flex items-center">
                        <Sparkles className="mr-2 h-5 w-5 text-amber-500" />
                        SEO Analysis
                      </CardTitle>
                      <CardDescription>
                        Search engine optimization metrics for your article
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-lg font-medium mb-2">Title</h3>
                            <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-md">
                              <p className="text-blue-800 dark:text-blue-300 font-semibold">{seoMetadata.title}</p>
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="text-lg font-medium mb-2">Meta Description</h3>
                            <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-md">
                              <p className="text-gray-700 dark:text-gray-300 text-sm">{seoMetadata.description}</p>
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="text-lg font-medium mb-2">Keywords</h3>
                            <div className="flex flex-wrap gap-2">
                              {seoMetadata.keywords.map((keyword, index) => (
                                <Badge key={index} variant="outline" className="bg-gray-50 dark:bg-gray-800/50">
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-lg font-medium mb-2">Content Metrics</h3>
                            <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-md space-y-2">
                              <div className="flex justify-between">
                                <span className="text-gray-700 dark:text-gray-300">Word Count:</span>
                                <span className="font-medium">{seoMetadata.wordCount}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-700 dark:text-gray-300">Readability Score:</span>
                                <span className={`font-medium ${getReadabilityColor(seoMetadata.readabilityScore || 0)}`}>
                                  {seoMetadata.readabilityScore?.toFixed(1) || "N/A"} - {seoMetadata.readabilityScore ? getReadabilityDescription(seoMetadata.readabilityScore) : "N/A"}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="text-lg font-medium mb-2">Keyword Density</h3>
                            <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-md">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Keyword</TableHead>
                                    <TableHead className="text-right">Count</TableHead>
                                    <TableHead className="text-right">Density</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {seoMetadata.keywordDensity.map((item, index) => (
                                    <TableRow key={index}>
                                      <TableCell className="font-medium">{item.keyword}</TableCell>
                                      <TableCell className="text-right">{item.count}</TableCell>
                                      <TableCell className="text-right">{item.density}%</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ArticleGenerator;
