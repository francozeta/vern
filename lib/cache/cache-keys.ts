/**
 * Centralized cache keys for React Query and custom hooks
 * Prevents key duplication and makes cache invalidation easier
 */

export const CACHE_KEYS = {
  // Auth & User
  AUTH_USER: "auth-user",
  USER_PROFILE: (username: string) => ["user-profile", username],
  USER_BY_ID: (userId: string) => ["user", userId],

  // Home & Feed
  HOME_DATA: (userId: string) => ["home", userId],
  HOME_STATS: (userId: string) => ["home-stats", userId],

  // Reviews
  REVIEWS_ALL: (userId: string | null) => ["reviews", userId],
  REVIEW_BY_ID: (reviewId: string) => ["review", reviewId],
  REVIEWS_BY_TRACK: (trackId: string) => ["reviews-track", trackId],
  USER_REVIEWS: (userId: string) => ["user-reviews", userId],

  // Songs/Tracks
  SONGS_ALL: ["songs"],
  SONGS_BY_ARTIST: (artistId: string) => ["songs-artist", artistId],
  SONGS: (artistId?: string) => (artistId ? ["songs-artist", artistId] : ["songs"]),
  SONG_BY_ID: (songId: string) => ["song", songId],
  SONGS_SEARCH: (query: string) => ["songs-search", query],

  // Users
  SUGGESTED_USERS: (limit?: number) => ["suggested-users", limit || 10],
  USERS_SEARCH: (query: string) => ["users-search", query],

  // Activity
  ACTIVITY_FEED: (userId: string) => ["activity-feed", userId],

  // Follows
  FOLLOWERS: (userId: string) => ["followers", userId],
  FOLLOWING: (userId: string) => ["following", userId],

  // Comments
  COMMENTS_BY_REVIEW: (reviewId: string) => ["comments", reviewId],

  // Search (Deezer & Users combined)
  SEARCH_DEEZER: (query: string) => ["search-deezer", query],
}

export const cacheKeys = CACHE_KEYS
