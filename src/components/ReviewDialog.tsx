
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

interface ReviewQuestion {
  id: string;
  question: string;
  rating: number;
}

interface ReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitReview: () => void;
}

const ReviewDialog: React.FC<ReviewDialogProps> = ({ 
  open, 
  onOpenChange,
  onSubmitReview
}) => {
  const [reviewQuestions, setReviewQuestions] = useState<ReviewQuestion[]>([
    { id: "clarity", question: "How clear is the information presented?", rating: 0 },
    { id: "accuracy", question: "How accurate does the information seem?", rating: 0 },
    { id: "comprehensiveness", question: "How comprehensive is the article?", rating: 0 },
    { id: "organization", question: "How well-organized is the content?", rating: 0 },
    { id: "relevance", question: "How relevant is the content to the topic?", rating: 0 }
  ]);
  const [reviewSuggestion, setReviewSuggestion] = useState<string>("");

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
    onSubmitReview();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Review Article</DialogTitle>
          <DialogDescription>
            Please rate the quality of the generated article
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {reviewQuestions.map((question) => (
            <div key={question.id} className="space-y-2">
              <p className="font-medium text-sm">{question.question}</p>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <Star
                    key={rating}
                    className={`h-6 w-6 cursor-pointer ${
                      question.rating >= rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                    onClick={() => handleRatingChange(question.id, rating)}
                  />
                ))}
              </div>
            </div>
          ))}
          
          <div className="space-y-2">
            <Label htmlFor="suggestion" className="font-medium">Additional comments (optional)</Label>
            <Textarea
              id="suggestion"
              placeholder="Share your thoughts about the article..."
              value={reviewSuggestion}
              onChange={(e) => setReviewSuggestion(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submitReview} type="submit">
            <Star className="mr-2 h-4 w-4" />
            Submit Review
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewDialog;
