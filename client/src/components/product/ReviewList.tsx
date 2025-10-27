import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ReviewCard } from "./ReviewCard";

interface Review {
  id: number;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    username: string;
  };
}

interface ReviewListProps {
  productId: number;
}

export function ReviewList({ productId }: ReviewListProps) {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/products/${productId}/reviews`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || []);
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  if (loading) {
    return <div className="text-center py-4">Loading reviews...</div>;
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>{t("reviews.noReviews")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{t("reviews.title")}</h3>
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  );
}
