
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import ReviewDialog from "./ReviewDialog";

interface ArticleReviewButtonProps {
  variant?: "default" | "outline" | "secondary" | "destructive" | "ghost" | "link" | "gradient";
  className?: string;
}

const ArticleReviewButton: React.FC<ArticleReviewButtonProps> = ({ 
  variant = "outline", 
  className = ""
}) => {
  const [reviewOpen, setReviewOpen] = useState(false);

  const handleReviewSubmitted = () => {
    // You can add any additional functionality here after review is submitted
  };

  return (
    <>
      <Button 
        variant={variant} 
        onClick={() => setReviewOpen(true)} 
        className={`font-medium ${className}`}
      >
        <Star className="mr-2 h-4 w-4" />
        Review
      </Button>
      
      <ReviewDialog 
        open={reviewOpen} 
        onOpenChange={setReviewOpen}
        onSubmitReview={handleReviewSubmitted}
      />
    </>
  );
};

export default ArticleReviewButton;
