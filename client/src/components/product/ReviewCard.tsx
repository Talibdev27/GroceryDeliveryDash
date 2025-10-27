import { Star } from "lucide-react";

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

interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  const getUserDisplayName = () => {
    if (review.user.firstName && review.user.lastName) {
      return `${review.user.firstName} ${review.user.lastName}`;
    }
    return review.user.username;
  };

  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h4 className="font-medium text-gray-900">{review.title}</h4>
          <p className="text-sm text-gray-600">{getUserDisplayName()}</p>
        </div>
        <div className="flex items-center space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-4 w-4 ${
                star <= review.rating ? "text-yellow-400 fill-current" : "text-gray-300"
              }`}
            />
          ))}
        </div>
      </div>
      
      <p className="text-gray-700 mb-2">{review.comment}</p>
      
      <p className="text-xs text-gray-500">{formatDate(review.createdAt)}</p>
    </div>
  );
}
