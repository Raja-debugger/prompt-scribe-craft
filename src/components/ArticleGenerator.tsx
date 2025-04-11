
import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Sparkles, Copy, Loader2, Search, Star, Hash, MessageSquareText, FileText, Image as ImageIcon, Folder, Youtube, Save, BookText, Link as LinkIcon, History } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { YoutubeEmbed } from "@/components/YoutubeEmbed";
import { Link, useLocation, useNavigate } from "react-router-dom";
import SearchHistory from "./SearchHistory";
import { v4 as uuidv4 } from "uuid";

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

interface SavedArticle {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  lastUpdated: string;
  type: 'published' | 'draft';
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
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [articleId, setArticleId] = useState<string>("");
  const [articleSaved, setArticleSaved] = useState<boolean>(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  
  const placeholderImages = [
    "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=600&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=600&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=60"
  ];

  useEffect(() => {
    // Load search history from localStorage
    const history = localStorage.getItem("searchHistory");
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
    
    // Check URL parameters for edit or view mode
    const params = new URLSearchParams(location.search);
    const editId = params.get("edit");
    const viewId = params.get("view");
    
    if (editId || viewId) {
      const id = editId || viewId;
      const savedArticles = localStorage.getItem("savedArticles");
      
      if (savedArticles) {
        const articles = JSON.parse(savedArticles) as SavedArticle[];
        const article = articles.find(a => a.id === id);
        
        if (article) {
          // Extract title and main content
          const titleMatch = article.content.match(/^# \*\*(.*?)\*\*/);
          const title = titleMatch ? titleMatch[1] : "";
          
          setPrompt(title);
          setGeneratedArticle(article.content);
          setArticleId(id);
          setArticleSaved(true);
          
          // If it's view mode, disable editing
          if (viewId) {
            // TODO: Add view-only mode logic if needed
          }
          
          // Since we're loading an existing article, we need to calculate its stats
          const readability = calculateReadabilityScore(article.content);
          setReadabilityScore(readability);
          
          const count = countWords(article.content);
          setWordCount(count);
          
          const tags = generateHashtags(title, title);
          setHashtags(tags);
          
          const caps = generateCaptions(title, title, article.content);
          setCaptions(caps);
          
          const seoData = generateSEOMetadata(title, article.content, title);
          setSeoMetadata(seoData);
        }
      }
    }
  }, [location]);

  const saveToHistory = useCallback((query: string) => {
    if (!query.trim()) return;
    
    setSearchHistory(prev => {
      // Remove duplicate if exists
      const filtered = prev.filter(item => item !== query);
      // Add to beginning of array
      const updated = [query, ...filtered].slice(0, 10); // Keep only 10 items
      // Save to localStorage
      localStorage.setItem("searchHistory", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearHistoryItem = (index: number) => {
    setSearchHistory(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      localStorage.setItem("searchHistory", JSON.stringify(updated));
      return updated;
    });
  };

  const clearAllHistory = () => {
    setSearchHistory([]);
    localStorage.setItem("searchHistory", JSON.stringify([]));
    toast.success("Search history cleared");
  };

  const selectHistoryItem = (item: string) => {
    setPrompt(item);
  };

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
    setArticleId("");
    setArticleSaved(false);
    
    try {
      // Add topic to search history
      saveToHistory(prompt);
      
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

  const saveArticle = (type: 'published' | 'draft') => {
    if (!generatedArticle) {
      toast.error("No article to save");
      return;
    }

    // Extract title from the article
    const titleMatch = generatedArticle.match(/^# \*\*(.*?)\*\*/);
    const title = titleMatch ? titleMatch[1] : "Untitled Article";

    // Create article object
    const article: SavedArticle = {
      id: articleId || uuidv4(),
      title,
      content: generatedArticle,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      type
    };

    // Get existing articles from localStorage
    const existingSavedArticles = localStorage.getItem("savedArticles");
    let savedArticles: SavedArticle[] = existingSavedArticles ? JSON.parse(existingSavedArticles) : [];

    // If article already exists, update it
    if (articleId) {
      savedArticles = savedArticles.map(a => 
        a.id === articleId ? { ...article, createdAt: a.createdAt } : a
      );
    } else {
      // Otherwise add new article
      savedArticles.push(article);
      setArticleId(article.id);
    }

    // Save to localStorage
    localStorage.setItem("savedArticles", JSON.stringify(savedArticles));
    setArticleSaved(true);

    // Show success message
    toast.success(type === 'published' ? "Article published successfully" : "Draft saved successfully");
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
    
    // Add more general hashtags
    hashtags.push('#Research');
    hashtags.push('#Knowledge');
    hashtags.push('#Wikipedia');
    hashtags.push('#Learning');
    hashtags.push('#Education');
    hashtags.push('#Facts');
    hashtags.push('#Information');
    hashtags.push('#Study');
    hashtags.push('#Academic');
    hashtags.push('#Educational');
    hashtags.push('#TodayILearned');
    hashtags.push('#FactOfTheDay');
    hashtags.push('#DidYouKnow');
    hashtags.push('#KnowledgeIsPower');
    hashtags.push('#Insights');
    
    return hashtags.slice(0, 15);
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
    setShowReview(false);
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
    long: "Long (1000-1200 words)",
  };

  return (
    <div className="min-h-screen bg-background text-foreground pt-16">
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

              {searchHistory.length > 0 && (
                <SearchHistory 
                  history={searchHistory}
                  onSelectHistory={selectHistoryItem}
                  onClearHistory={clearAllHistory}
                  onClearHistoryItem={clearHistoryItem}
                  className="mb-4"
                />
              )}

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
                          <div className="flex flex-wrap gap-2">
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
                                    </div>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-80 p-4">
                                    <div className="space-y-2">
                                      <h4 className="font-medium text-sm">Flesch-Kincaid Grade Level</h4>
                                      <p className="text-sm text-muted-foreground">{getReadabilityDescription(readabilityScore)}</p>
                                      <div className="mt-2">
                                        <div className="bg-gray-200 dark:bg-gray-700 w-full h-2 rounded-full overflow-hidden">
                                          <div 
                                            className={`h-full ${readabilityScore < 8 ? 'bg-green-500' : readabilityScore < 12 ? 'bg-amber-500' : 'bg-red-500'}`} 
                                            style={{ width: `${Math.min(100, (readabilityScore / 18) * 100)}%` }}
                                          ></div>
                                        </div>
                                        <div className="flex justify-between text-xs mt-1 text-muted-foreground">
                                          <span>Easier to read</span>
                                          <span>Harder to read</span>
                                        </div>
                                      </div>
                                    </div>
                                  </PopoverContent>
                                </Popover>
                              </div>
                            </div>
                          </CardContent>
                        )}
                        
                        <CardContent>
                          {showReview && (
                            <div className="mb-6 p-4 border rounded-md bg-gray-50 dark:bg-gray-800/50">
                              <h3 className="text-lg font-medium mb-4">Rate this article:</h3>
                              <div className="space-y-4">
                                {reviewQuestions.map((q) => (
                                  <div key={q.id} className="space-y-2">
                                    <div className="flex justify-between items-center">
                                      <Label htmlFor={q.id} className="text-sm">{q.question}</Label>
                                      <span className="text-sm font-medium">{q.rating > 0 ? `${q.rating}/5` : '-'}</span>
                                    </div>
                                    <RadioGroup 
                                      id={q.id}
                                      value={q.rating.toString()} 
                                      onValueChange={(val) => handleRatingChange(q.id, parseInt(val))}
                                      className="flex space-x-1"
                                    >
                                      {[1, 2, 3, 4, 5].map((rating) => (
                                        <div key={rating} className="flex items-center">
                                          <RadioGroupItem value={rating.toString()} id={`${q.id}-${rating}`} className="sr-only" />
                                          <Label
                                            htmlFor={`${q.id}-${rating}`}
                                            className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer ${
                                              q.rating === rating ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700'
                                            }`}
                                          >
                                            {rating}
                                          </Label>
                                        </div>
                                      ))}
                                    </RadioGroup>
                                  </div>
                                ))}
                                <div className="space-y-2">
                                  <Label htmlFor="suggestion" className="text-sm">Additional feedback (optional):</Label>
                                  <Textarea
                                    id="suggestion"
                                    value={reviewSuggestion}
                                    onChange={(e) => setReviewSuggestion(e.target.value)}
                                    placeholder="Enter any additional feedback..."
                                    className="h-20 resize-none"
                                  />
                                </div>
                                <div className="flex justify-end">
                                  <Button onClick={submitReview} className="w-full sm:w-auto">Submit Review</Button>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          <div className="prose prose-blue dark:prose-invert max-w-none article-content">
                            <ReactMarkdown>{generatedArticle}</ReactMarkdown>
                          </div>
                          
                          <div className="mt-8 flex flex-wrap gap-3 justify-between">
                            <div className="space-y-2">
                              <div>
                                <Button variant="outline" className="mr-2">
                                  <Save className="mr-2 h-4 w-4" />
                                  Save as Draft
                                </Button>
                                <Button className="bg-green-600 hover:bg-green-700" onClick={() => saveArticle('published')}>
                                  <BookText className="mr-2 h-4 w-4" />
                                  Publish
                                </Button>
                              </div>
                              {articleSaved && (
                                <p className="text-sm text-muted-foreground">
                                  Last saved: {new Date().toLocaleString()}
                                </p>
                              )}
                            </div>
                            <Button variant="ghost" asChild>
                              <Link to="/saved-articles">
                                <Folder className="mr-2 h-4 w-4" />
                                View Saved Articles
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div>
                      <Card className="border shadow-md dark:shadow-none dark:border-gray-800">
                        <CardHeader>
                          <CardTitle className="font-medium text-lg">Related Content</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div>
                            <h3 className="font-medium text-sm mb-3 flex items-center">
                              <Youtube className="mr-2 h-4 w-4" />
                              Related YouTube Video
                            </h3>
                            <YoutubeEmbed searchQuery={prompt} />
                          </div>
                          
                          <Separator />
                          
                          <div>
                            <h3 className="font-medium text-sm mb-3 flex items-center">
                              <Hash className="mr-2 h-4 w-4" />
                              Suggested Hashtags
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {hashtags.map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <Separator />
                          
                          <div>
                            <h3 className="font-medium text-sm mb-3 flex items-center">
                              <MessageSquareText className="mr-2 h-4 w-4" />
                              Social Media Captions
                            </h3>
                            <div className="space-y-3">
                              {captions.map((caption, index) => (
                                <div key={index} className="relative group">
                                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md text-sm">
                                    {caption}
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => {
                                      navigator.clipboard.writeText(caption);
                                      toast.success("Caption copied!");
                                    }}
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </>
              )}
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Article Format Settings</CardTitle>
                  <CardDescription>
                    Customize how your article is generated
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="tone">Tone</Label>
                    <Select value={tone} onValueChange={setTone}>
                      <SelectTrigger id="tone">
                        <SelectValue placeholder="Select tone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="academic">Academic</SelectItem>
                        <SelectItem value="simplified">Simplified</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      The overall tone and style of the generated content.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="temperature">Creativity</Label>
                      <span className="text-sm text-muted-foreground">{temperature.toFixed(1)}</span>
                    </div>
                    <Slider
                      id="temperature"
                      value={[temperature]}
                      min={0.1}
                      max={1}
                      step={0.1}
                      onValueChange={(value) => setTemperature(value[0])}
                    />
                    <p className="text-sm text-muted-foreground">
                      Lower values produce more predictable content, higher values allow more creativity.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="length">Article Length</Label>
                    <Select value={length} onValueChange={setLength}>
                      <SelectTrigger id="length">
                        <SelectValue placeholder="Select length" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="long">{articleLengthOptions.long}</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      The approximate word count for the generated article.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="seo" className="space-y-6">
              {seoMetadata ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Sparkles className="mr-2 h-5 w-5 text-amber-500" />
                      SEO Analysis
                    </CardTitle>
                    <CardDescription>
                      Search engine optimization metrics and suggestions for your article
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium mb-2">Title Tag</h3>
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                          <p className="text-blue-600 dark:text-blue-400 font-medium">{seoMetadata.title}</p>
                          <p className="text-green-600 dark:text-green-400 text-xs mt-1">{`https://yourwebsite.com/${seoMetadata.title.toLowerCase().replace(/\s+/g, '-')}`}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{seoMetadata.description}</p>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium mb-2">Meta Description</h3>
                        <Textarea 
                          value={seoMetadata.description}
                          className="resize-none h-20"
                          readOnly
                        />
                        <div className="flex justify-between mt-1">
                          <p className="text-xs text-muted-foreground">
                            Optimal length: 150-160 characters
                          </p>
                          <p className={`text-xs ${seoMetadata.description.length > 160 ? 'text-red-500' : 'text-green-500'}`}>
                            {seoMetadata.description.length}/160 characters
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium mb-2">Focus Keywords</h3>
                        <div className="flex flex-wrap gap-2">
                          {seoMetadata.keywords.map((keyword, index) => (
                            <Badge key={index} variant="outline" className="bg-gray-50 dark:bg-gray-800">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium mb-2">Content Analysis</h3>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Metric</TableHead>
                              <TableHead>Value</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell>Word Count</TableCell>
                              <TableCell>{seoMetadata.wordCount}</TableCell>
                              <TableCell>
                                <Badge variant={seoMetadata.wordCount >= 1000 ? "success" : "destructive"}>
                                  {seoMetadata.wordCount >= 1000 ? "Good" : "Too Short"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Readability Score</TableCell>
                              <TableCell>{seoMetadata.readabilityScore}</TableCell>
                              <TableCell>
                                <Badge variant={seoMetadata.readabilityScore && seoMetadata.readabilityScore < 12 ? "success" : "warning"}>
                                  {seoMetadata.readabilityScore && seoMetadata.readabilityScore < 12 ? "Good" : "Too Complex"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium mb-2">Keyword Density Analysis</h3>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Keyword</TableHead>
                              <TableHead>Count</TableHead>
                              <TableHead>Density (%)</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {seoMetadata.keywordDensity.map((item, index) => (
                              <TableRow key={index}>
                                <TableCell>{item.keyword}</TableCell>
                                <TableCell>{item.count}</TableCell>
                                <TableCell>
                                  {item.density}%
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No SEO Data Available</h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    Generate an article first to see SEO analysis and suggestions.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ArticleGenerator;
