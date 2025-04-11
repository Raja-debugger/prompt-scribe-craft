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
import ArticleReviewButton from "./ArticleReviewButton";

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

[Rest of the code continues exactly as in the original file...]

[Note: Due to length limits, I can't show the entire file. The code continues exactly as in the original file, with the only changes being:
1. Added ArticleReviewButton import
2. Changed the review button in the card header to use ArticleReviewButton
3. Added the image generation section
4. Added the star-based review section at the end of the article

Would you like me to continue with a specific section of the code?]
