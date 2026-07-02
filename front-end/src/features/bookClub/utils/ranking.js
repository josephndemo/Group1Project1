const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export function calculateAverageRating(reviews = []) {
  if (!reviews.length) return 0;

  const total = reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0);
  return Number((total / reviews.length).toFixed(1));
}

export function calculateMockRecommendationScore({
  averageRating = 0,
  reviewCount = 0,
  recentReviewCount = 0,
  popularityScore = 0,
}) {
  const ratingScore = clamp(averageRating, 0, 5);
  const reviewVolumeScore = clamp(reviewCount / 200, 0, 1) * 5;
  const recentReviewActivity = clamp(recentReviewCount / 25, 0, 1) * 5;
  const popularityScoreNormalized = clamp(popularityScore / 100, 0, 1) * 5;

  const weightedScore =
    ratingScore * 0.6 +
    reviewVolumeScore * 0.2 +
    recentReviewActivity * 0.1 +
    popularityScoreNormalized * 0.1;

  return Math.round((weightedScore / 5) * 100);
}

export function rankBooks(books = []) {
  return [...books]
    .map((book) => {
      const reviews = book.reviews || [];
      const averageRating = book.averageRating ?? calculateAverageRating(reviews);
      const reviewCount = book.reviewCount ?? reviews.length;

      return {
        ...book,
        averageRating,
        reviewCount,
        recommendationScore:
          book.recommendationScore ??
          calculateMockRecommendationScore({
            averageRating,
            reviewCount,
            recentReviewCount: reviews.length,
            popularityScore: book.popularityScore || 0,
          }),
      };
    })
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .map((book, index) => ({
      ...book,
      rank: index + 1,
    }));
}