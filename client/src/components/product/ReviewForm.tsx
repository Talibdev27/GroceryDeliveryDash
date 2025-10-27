import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";

interface ReviewFormProps {
  productId: number;
  onReviewAdded: () => void;
}

export function ReviewForm({ productId, onReviewAdded }: ReviewFormProps) {
  const { t } = useTranslation();
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !comment.trim()) {
      alert("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ rating, title, comment })
      });

      if (response.ok) {
        setTitle("");
        setComment("");
        setRating(5);
        onReviewAdded();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to submit review");
      }
    } catch (error) {
      console.error("Review submission error:", error);
      alert("Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-medium">{t("reviews.writeReview")}</h3>
      
      <div>
        <Label>{t("reviews.rating")}</Label>
        <div className="flex space-x-1 mt-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="focus:outline-none"
            >
              <Star
                className={`h-6 w-6 ${
                  star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
                }`}
              />
            </button>
          ))}
          <span className="ml-2 text-sm text-gray-600">
            {rating} {t("reviews.stars")}
          </span>
        </div>
      </div>

      <div>
        <Label htmlFor="review-title">{t("reviews.reviewTitle")}</Label>
        <Input
          id="review-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter review title"
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="review-comment">{t("reviews.comment")}</Label>
        <Textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this product"
          rows={4}
          className="mt-1"
        />
      </div>

      <Button 
        onClick={handleSubmit} 
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? "Submitting..." : t("reviews.submit")}
      </Button>
    </div>
  );
}
