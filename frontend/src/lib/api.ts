import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  async (config) => {
    // Get Firebase auth token if available
    if (typeof window !== 'undefined') {
      const { auth } = await import('./firebase');
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle expected 404s silently
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 404 on /api/auth/me is expected for users who haven't completed onboarding
    // Don't log these as errors - they're handled gracefully in the frontend
    if (error.response?.status === 404 && error.config?.url?.includes('/auth/me')) {
      // Silently handle expected 404s - these are not errors
      return Promise.reject(error);
    }
    // For other errors, reject normally (they'll be logged/handled by components)
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  signup: (data: any) => api.post('/auth/signup', data),
  getMe: (firebaseUid: string) => api.get(`/auth/me?firebase_uid=${firebaseUid}`),
  verifyToken: (token: string) => api.get(`/auth/verify-token?token=${token}`),
};

// User endpoints
export const userAPI = {
  getProfile: (userId: number) => api.get(`/users/${userId}`),
  updateProfile: (userId: number, data: any) => api.patch(`/users/${userId}`, data),
  updateProfilePicture: (userId: number, profilePictureUrl: string) => 
    api.put(`/users/${userId}/profile-picture`, { profile_picture_url: profilePictureUrl }),
  getTribeMembers: (tribeId: string, limit: number = 30, randomSample: boolean = true) => 
    api.get(`/users/tribe/${tribeId}/members`, { 
      params: { limit, random_sample: randomSample } 
    }),
};

// Tribe endpoints
export const tribeAPI = {
  getTribeInfo: (tribeId: string) => api.get(`/tribes/${tribeId}`),
  getTribeRoom: (tribeId: string, userId: number) => 
    api.get(`/tribes/${tribeId}/room`, { params: { user_id: userId } }),
  sendMessage: (tribeId: string, roomId: number, message: string, userId: number) =>
    api.post(`/tribes/${tribeId}/room/${roomId}/messages`, { message, user_id: userId }),
  getMessages: (tribeId: string, roomId: number, userId: number, limit?: number) =>
    api.get(`/tribes/${tribeId}/room/${roomId}/messages`, { 
      params: { user_id: userId, limit } 
    }),
  editMessage: (tribeId: string, roomId: number, messageId: number, message: string, userId: number) =>
    api.put(`/tribes/${tribeId}/room/${roomId}/messages/${messageId}`, { message, user_id: userId }),
  deleteMessage: (tribeId: string, roomId: number, messageId: number, userId: number) =>
    api.delete(`/tribes/${tribeId}/room/${roomId}/messages/${messageId}`, { params: { user_id: userId } }),
};

// Room endpoints
export const roomAPI = {
  createPersonalRoom: (userId: number, name?: string) =>
    api.post('/rooms/personal', { name, user_id: userId }),
  joinRoom: (roomId: number, inviteCode: string, userId: number) =>
    api.post(`/rooms/${roomId}/join`, { invite_code: inviteCode, user_id: userId }),
  createBirthdayWall: (userId: number, data: any) =>
    api.post(`/rooms/birthday-wall?user_id=${userId}`, data),
  getUserBirthdayWall: (userId: number) =>
    api.get(`/rooms/birthday-wall/user/${userId}`),
  getWallArchive: (userId: number) =>
    api.get(`/rooms/birthday-wall/user/${userId}/archive`),
  getBirthdayWall: (wallCode: string, userId?: number) =>
    api.get(`/rooms/birthday-wall/${wallCode}`, { 
      params: userId ? { user_id: userId } : {} 
    }),
  uploadPhotoToWall: (wallId: number, photoUrl: string, caption: string, userId: number, frameStyle?: string) =>
    api.post(`/rooms/birthday-wall/${wallId}/photos?user_id=${userId}`, { 
      photo_url: photoUrl, 
      caption,
      frame_style: frameStyle || "none"
    }),
  addPhotoReaction: (wallId: number, photoId: number, emoji: string, userId: number) =>
    api.post(`/rooms/birthday-wall/${wallId}/photos/${photoId}/reactions?user_id=${userId}`, {
      emoji
    }),
};

// Gift endpoints
export const giftAPI = {
  getCatalog: () => api.get('/gifts/catalog'),
  sendGift: (senderId: number, data: any) =>
    api.post('/gifts/send', { ...data, sender_id: senderId }),
  getReceivedGifts: (userId: number) =>
    api.get(`/gifts/received`, { params: { user_id: userId } }),
  getSentGifts: (userId: number) =>
    api.get(`/gifts/sent`, { params: { user_id: userId } }),
  activateGift: (giftId: number) =>
    api.post(`/gifts/activate/${giftId}`),
  getActiveGifts: (userId: number) =>
    api.get(`/gifts/active/${userId}`),
};

// Helper to get firebase_uid for admin calls
const getFirebaseUid = async (): Promise<string | null> => {
  if (typeof window === 'undefined') return null;
  try {
    const { auth } = await import('./firebase');
    return auth.currentUser?.uid || null;
  } catch {
    return null;
  }
};

// Admin endpoints
export const adminAPI = {
  addCelebrity: async (data: any) => {
    const firebaseUid = await getFirebaseUid();
    return api.post(`/admin/celebrities?firebase_uid=${firebaseUid}`, data);
  },
  getCelebritiesToday: () => api.get('/admin/celebrities/today'),
  flagContent: (userId: number, data: any) =>
    api.post('/admin/flag-content', { ...data, user_id: userId }),
  getFlaggedContent: async (status?: string, limit?: number) => {
    const firebaseUid = await getFirebaseUid();
    return api.get('/admin/flagged-content', { params: { status, limit, firebase_uid: firebaseUid } });
  },
  getStats: () => api.get('/admin/stats/overview'),
  getStateCelebrants: (state: string) =>
    api.get(`/admin/celebrants/state/${state}`),
  // Analytics endpoints
  getAnalyticsOverview: async (days: number = 30) => {
    const firebaseUid = await getFirebaseUid();
    return api.get('/admin/analytics/overview', { params: { days, firebase_uid: firebaseUid } });
  },
  getUserGrowth: async (days: number = 30) => {
    const firebaseUid = await getFirebaseUid();
    return api.get('/admin/analytics/user-growth', { params: { days, firebase_uid: firebaseUid } });
  },
  getEngagementMetrics: async (days: number = 30) => {
    const firebaseUid = await getFirebaseUid();
    return api.get('/admin/analytics/engagement', { params: { days, firebase_uid: firebaseUid } });
  },
  getGeographicAnalytics: async () => {
    const firebaseUid = await getFirebaseUid();
    return api.get('/admin/analytics/geographic', { params: { firebase_uid: firebaseUid } });
  },
  getTribeAnalytics: async () => {
    const firebaseUid = await getFirebaseUid();
    return api.get('/admin/analytics/tribes', { params: { firebase_uid: firebaseUid } });
  },
  // Activity monitoring endpoints
  getRecentActivities: async (limit: number = 50, activityType?: string) => {
    const firebaseUid = await getFirebaseUid();
    return api.get('/admin/activities/recent', { params: { limit, activity_type: activityType, firebase_uid: firebaseUid } });
  },
  getUserActivities: async (userId?: number, limit: number = 50) => {
    const firebaseUid = await getFirebaseUid();
    return api.get('/admin/activities/users', { params: { user_id: userId, limit, firebase_uid: firebaseUid } });
  },
};

// Upload endpoints
export const uploadAPI = {
  uploadBirthdayWallPhoto: async (wallId: number, userId: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('wall_id', wallId.toString());
    formData.append('user_id', userId.toString());
    
    const response = await api.post('/upload/birthday-wall-photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // 60 second timeout for file uploads
    });
    return response;
  },
  uploadProfilePicture: (file: File, userId: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('user_id', userId);
    return api.post('/upload/profile-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// AI endpoints
export const aiAPI = {
  generateGiftMessage: (data: {
    recipient_name: string;
    sender_name: string;
    gift_name: string;
    gift_type?: string;
    recipient_age?: number;
    recipient_country?: string;
  }) => api.post('/ai/generate-gift-message', data),
  getTemplateMessages: (data: {
    recipient_name: string;
    recipient_age?: number;
    recipient_country?: string;
  }) => api.post('/ai/get-template-messages', data),
};

// Birthday Buddy endpoints
export const buddyAPI = {
  getBuddyStatus: (userId: number) => api.get(`/buddy/status/${userId}`),
  matchBuddy: (userId: number) => api.post(`/buddy/match/${userId}`),
  acceptBuddy: (userId: number, accept: boolean) => 
    api.post(`/buddy/accept/${userId}`, { accept }),
};

export default api;

