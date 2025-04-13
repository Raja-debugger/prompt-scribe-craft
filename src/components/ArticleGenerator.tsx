import React, { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Sparkles, Copy, Loader2, Search, Star, Hash, MessageSquareText, FileText, 
  Image as ImageIcon, Folder, Youtube, Save, BookText, Link as LinkIcon, 
  History, ArrowDown, ArrowUp, Video, X, Headphones } from "lucide-react";
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
import ArticleReviewButton from "./ArticleReviewButton";
import VideoGenerator from "./VideoGenerator";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { runwayAPI } from "@/utils/runwayAPI";

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
  
  // Add new state for video generation
  const [showVideoGenerator, setShowVideoGenerator] = useState<boolean>(false);
  const [transitionClass, setTransitionClass] = useState<string>("");
  
  // Add new state for summary and audio
  const [summarizedContent, setSummarizedContent] = useState<string>("");
  const [showSummary, setShowSummary] = useState<boolean>(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState<boolean>(false);
  const [showVoiceOver, setShowVoiceOver] = useState<boolean>(false);
  const [voiceOverAudio, setVoiceOverAudio] = useState<string | null>(null);
  const [isGeneratingVoiceOver, setIsGeneratingVoiceOver] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
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
          
          // Set suggested images
          setSuggestedImages(placeholderImages.slice(0, 3));
        }
      }
    }
  }, [location]);

  // Add summarize article function
  const summarizeArticle = async () => {
    if (!generatedArticle) {
      toast.error("Please generate an article first");
      return;
    }
    
    setIsGeneratingSummary(true);
    setSummarizedContent("");
    
    try {
      // Extract title from the article
      const titleMatch = generatedArticle.match(/^# \*\*(.*?)\*\*/);
      const title = titleMatch ? titleMatch[1] : "Article";
      
      // Extract main content without title and source
      const mainContent = generatedArticle
        .replace(/^# \*\*.*?\*\*\n\n/, '')
        .replace(/\n\n---\n\*Source.*\*$/, '');
      
      // Create a summary using a simple algorithm (in a real app, you'd use an AI service)
      const paragraphs = mainContent.split('\n\n').filter(p => p && !p.startsWith('#'));
      const firstParagraph = paragraphs[0] || "";
      
      // Get first sentence from each section
      const sections = mainContent.split(/^## \*\*.*?\*\*$/m).filter(Boolean);
      const firstSentences = sections.map(section => {
        const sentences = section.split(/\.\s+/);
        return sentences[0] ? sentences[0] + '.' : '';
      }).filter(Boolean);
      
      // Combine into a summary
      let summary = `# **Summary: ${title}**\n\n`;
      summary += firstParagraph + "\n\n";
      
      if (firstSentences.length > 0) {
        summary += "## **Key Points**\n\n";
        firstSentences.forEach(sentence => {
          summary += `- ${sentence}\n`;
        });
      }
      
      // Set the summary
      setSummarizedContent(summary);
      setShowSummary(true);
      toast.success("Summary generated successfully!");
    } catch (error) {
      console.error("Error summarizing article:", error);
      toast.error("Failed to summarize article");
    } finally {
      setIsGeneratingSummary(false);
    }
  };
  
  // Generate voice over for the summary
  const generateVoiceOver = async () => {
    if (!summarizedContent) {
      // If no summary exists, generate one first
      await summarizeArticle();
    }
    
    if (!summarizedContent) {
      toast.error("Please summarize the article first");
      return;
    }
    
    setIsGeneratingVoiceOver(true);
    
    try {
      // Extract plain text from the markdown for the voice over
      const plainText = summarizedContent
        .replace(/^# \*\*.*?\*\*\n\n/, '')
        .replace(/## \*\*.*?\*\*/g, '')
        .replace(/- /g, '');
      
      console.log("Generating voice over for:", plainText);
      
      // Call the Runway API to generate the voice over
      const response = await runwayAPI.generateVoiceOver({
        text: plainText.substring(0, 1000), // Limit text to 1000 chars if needed
        voice: "narrator" // Use a default voice
      });
      
      if (response.url) {
        console.log("Voice over generated successfully:", response.url);
        setVoiceOverAudio(response.url);
        setShowVoiceOver(true);
        
        // Handle audio playback
        if (audioRef.current) {
          audioRef.current.src = response.url;
          audioRef.current.load();
        }
        
        toast.success("Voice over generated successfully!");
      } else {
        toast.error("Failed to generate voice over");
      }
    } catch (error) {
      console.error("Error generating voice over:", error);
      toast.error("Failed to generate voice over");
    } finally {
      setIsGeneratingVoiceOver(false);
    }
  };

  // Function to handle voice over button click globally
  const handleVoiceOverClick = () => {
    if (generatedArticle) {
      generateVoiceOver();
    } else {
      toast.error("Please generate an article first");
    }
  };

  // Function to handle summary button click globally
  const handleSummaryClick = () => {
    if (generatedArticle) {
      summarizeArticle();
    } else {
      toast.error("Please generate an article first");
    }
  };

  // Add these functions to window object to make them accessible from Navbar
  useEffect(() => {
    // @ts-ignore
    window.handleVoiceOverClick = handleVoiceOverClick;
    // @ts-ignore
    window.handleSummaryClick = handleSummaryClick;
    
    return () => {
      // @ts-ignore
      delete window.handleVoiceOverClick;
      // @ts-ignore
      delete window.handleSummaryClick;
    };
  }, [generatedArticle, summarizedContent]);

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

  // Add slight animation when generating article
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
    setTransitionClass("animate-fade-in");
    
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
      
      // Add animation class
      setTransitionClass("animate-fade-in");
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
    <div className="space-y-6">
      <Tabs defaultValue="generate" className="w-full" value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="generate" className="font-semibold">Generate Article</TabsTrigger>
          <TabsTrigger value="settings" className="font-semibold">Format Settings</TabsTrigger>
          <TabsTrigger value="summary" disabled={!generatedArticle} className="font-semibold">Summary</TabsTrigger>
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
            <div className={`grid grid-cols-1 gap-6 ${transitionClass}`}>
              <Card className="border shadow-md dark:shadow-none dark:border-gray-800">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="font-display text-2xl">Generated Article</CardTitle>
                    <CardDescription>
                      Your Wikipedia-based article is ready
                    </CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <ArticleReviewButton 
                      variant="outline" 
                      className="font-medium"
                    />
                    <Button variant="outline" onClick={copyToClipboard} className="font-medium">
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={summarizeArticle}
                      className="font-medium"
                    >
                      <MessageSquareText className="mr-2 h-4 w-4" />
                      Summarize
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={generateVoiceOver}
                      className="font-medium text-green-600 dark:text-green-400 border-green-600/30 hover:bg-green-50 dark:hover:bg-green-900/20"
                    >
                      <Headphones className="mr-2 h-4 w-4" />
                      Voice Over
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
                              <span className="ml-1">(i)</span>
                            </div>
                          </PopoverTrigger>
                          <PopoverContent className="w-80">
                            <div className="space-y-2">
                              <h4 className="font-medium">Readability Analysis</h4>
                              <p className="text-sm">
                                Score: <span className={getReadabilityColor(readabilityScore)}>{readabilityScore}</span>
                                <br />
                                Reading Level: {getReadabilityDescription(readabilityScore)}
                              </p>
                              <div className="text-xs text-muted-foreground">
                                This score is based on the Flesch-Kincaid readability formula.
                                Lower scores indicate more complex text.
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </CardContent>
                )}
                
                <CardContent className="prose dark:prose-invert max-w-none mt-4">
                  <ReactMarkdown>{generatedArticle}</ReactMarkdown>
                </CardContent>
                
                <CardFooter className="flex justify-between flex-wrap gap-2">
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => saveArticle('draft')}
                      className="font-medium"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Save as Draft
                    </Button>
                    <Button 
                      variant="gradient" 
                      onClick={() => saveArticle('published')}
                      className="font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Publish Article
                    </Button>
                  </div>
                  
                  {articleSaved && (
                    <Badge variant="outline" className="ml-auto bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800">
                      {articleId ? "Saved" : "New Draft"}
                    </Badge>
                  )}
                </CardFooter>
              </Card>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Article Format Settings</CardTitle>
              <CardDescription>
                Customize how your generated article will be formatted
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="tone">Writing Tone</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger id="tone">
                    <SelectValue placeholder="Select a tone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="conversational">Conversational</SelectItem>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="simple">Simple</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="temperature">Creativity Level</Label>
                  <span className="text-sm text-muted-foreground">{temperature.toFixed(1)}</span>
                </div>
                <Slider
                  id="temperature"
                  min={0.1}
                  max={1.0}
                  step={0.1}
                  value={[temperature]}
                  onValueChange={(values) => setTemperature(values[0])}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Conservative</span>
                  <span>Creative</span>
                </div>
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Add new Summary tab */}
        <TabsContent value="summary" className="space-y-6">
          {isGeneratingSummary ? (
            <Card>
              <CardContent className="py-10 flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-center text-muted-foreground">Generating summary...</p>
              </CardContent>
            </Card>
          ) : summarizedContent ? (
            <Card className="border shadow-md dark:shadow-none dark:border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="font-display text-2xl">Article Summary</CardTitle>
                  <CardDescription>
                    Concise version of your generated article
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      navigator.clipboard.writeText(summarizedContent);
                      toast.success("Summary copied to clipboard!");
                    }}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={generateVoiceOver}
                    className="text-green-600 dark:text-green-400 border-green-600/30 hover:bg-green-50 dark:hover:bg-green-900/20"
                  >
                    <Headphones className="mr-2 h-4 w-4" />
                    Generate Voice Over
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none">
                <ReactMarkdown>{summarizedContent}</ReactMarkdown>
              </CardContent>
              
              {voiceOverAudio && (
                <CardFooter className="flex flex-col items-start space-y-4 pt-0">
                  <Separator className="mb-2" />
                  <div className="w-full">
                    <h3 className="text-sm font-medium mb-2">Voice Over</h3>
                    <audio 
                      controls 
                      className="w-full" 
                      ref={audioRef}
                      src={voiceOverAudio}
                    >
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                </CardFooter>
              )}
            </Card>
          ) : (
            <Card>
              <CardContent className="py-10 flex flex-col items-center justify-center">
                <MessageSquareText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-center mb-2">No Summary Available</h3>
                <p className="text-center text-muted-foreground mb-6">
                  Generate a summary of your article for quick reference or voice over.
                </p>
                <Button onClick={summarizeArticle} disabled={!generatedArticle}>
                  <MessageSquareText className="mr-2 h-4 w-4" />
                  Generate Summary
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="seo" className="space-y-6">
          {seoMetadata && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>SEO Analysis</CardTitle>
                  <CardDescription>
                    Key metrics about your article for search engines
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Title</Label>
                    <div className="p-3 rounded-md bg-muted">
                      <p className="text-base">{seoMetadata.title}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Meta Description</Label>
                    <div className="p-3 rounded-md bg-muted">
                      <p className="text-sm">{seoMetadata.description}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Keywords</Label>
                    <div className="flex flex-wrap gap-2">
                      {seoMetadata.keywords.map((keyword, index) => (
                        <Badge key={index} variant="outline">{keyword}</Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Keyword Density</Label>
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
                            <TableCell>{item.keyword}</TableCell>
                            <TableCell className="text-right">{item.count}</TableCell>
                            <TableCell className="text-right">{item.density}%</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Word Count</Label>
                      <div className="p-3 rounded-md bg-muted text-sm">
                        {seoMetadata.wordCount} words
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Readability Score</Label>
                      <div className="p-3 rounded-md bg-muted text-sm">
                        {seoMetadata.readabilityScore !== null ? 
                          <>
                            <span className={getReadabilityColor(seoMetadata.readabilityScore)}>
                              {seoMetadata.readabilityScore}
                            </span> 
                            - {getReadabilityDescription(seoMetadata.readabilityScore)}
                          </> : 
                          "Not available"
                        }
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Voice Over Dialog */}
      <Dialog open={showVoiceOver} onOpenChange={setShowVoiceOver}>
        <DialogContent className="sm:max-w-md">
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Voice Over</h2>
            <p className="text-sm text-muted-foreground">
              Listen to the AI-generated voice over of your article summary
            </p>
            
            {isGeneratingVoiceOver ? (
              <div className="flex flex-col items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p>Generating voice over...</p>
              </div>
            ) : voiceOverAudio ? (
              <div className="w-full">
                <audio 
                  controls 
                  className="w-full" 
                  autoPlay
                  ref={audioRef}
                  src={voiceOverAudio}
                >
                  Your browser does not support the audio element.
                </audio>
              </div>
            ) : (
              <div className="text-center py-8">
                <p>No audio available. Try generating a voice over.</p>
              </div>
            )}
            
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                onClick={() => setShowVoiceOver(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Summary Dialog */}
      <Dialog open={showSummary} onOpenChange={setShowSummary}>
        <DialogContent className="sm:max-w-xl">
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Article Summary</h2>
            
            {isGeneratingSummary ? (
              <div className="flex flex-col items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p>Generating summary...</p>
              </div>
            ) : summarizedContent ? (
              <div className="prose dark:prose-invert max-w-none">
                <ReactMarkdown>{summarizedContent}</ReactMarkdown>
              </div>
            ) : (
              <div className="text-center py-8">
                <p>No summary available.</p>
              </div>
            )}
            
            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={generateVoiceOver}
                disabled={!summarizedContent || isGeneratingVoiceOver}
              >
                {isGeneratingVoiceOver ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Headphones className="mr-2 h-4 w-4" />
                    Generate Voice Over
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => setShowSummary(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Video Generator Dialog */}
      <Dialog open={showVideoGenerator} onOpenChange={setShowVideoGenerator}>
        <DialogContent className="sm:max-w-3xl">
          <VideoGenerator 
            articleContent={generatedArticle} 
            articleTitle={seoMetadata?.title || prompt}
            onClose={() => setShowVideoGenerator(false)} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ArticleGenerator;
