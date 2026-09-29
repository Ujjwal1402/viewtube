export const FEED_CATEGORIES = [
  'All',
  'Live Now',
  'Technology',
  'Animation',
  'Music',
  'Sci-Fi',
  'Travel',
  'Gaming',
  'Your Uploads',
] as const;

export type FeedCategory = typeof FEED_CATEGORIES[number];
