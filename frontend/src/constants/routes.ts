export const ROUTES = {
  HOME: '#',
  LIVE: '#live',
  SUBSCRIPTIONS: '#subscriptions',
  MY_VIDEOS: '#my-videos',
  HISTORY: '#history',
  WATCH_LATER: '#watch-later',
  LIKED_VIDEOS: '#liked-videos',
  PROFILE: '#profile',
  WATCH: (videoId: string) => `#video=${videoId}`,
  SEARCH: (query: string) => `#search=${encodeURIComponent(query)}`,
} as const;
