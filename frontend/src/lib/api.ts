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
    
    // If sending FormData, remove Content-Type header to let axios set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
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
  getMe: () => api.get('/auth/me'), // Uses Authorization header from interceptor
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
  submitContactForm: (data: { name: string; email: string; subject: string; message: string; user_id?: number }) =>
    api.post('/users/contact', data),
};

// Tribe endpoints - All use Authorization header from interceptor
export const tribeAPI = {
  getTribeInfo: (tribeId: string) => api.get(`/tribes/${tribeId}`),
  getTribeRoom: (tribeId: string) => api.get(`/tribes/${tribeId}/room`), // user_id from token
  sendMessage: (tribeId: string, roomId: number, message: string) =>
    api.post(`/tribes/${tribeId}/room/${roomId}/messages`, { message }), // user_id from token
  getMessages: (tribeId: string, roomId: number, limit?: number) =>
    api.get(`/tribes/${tribeId}/room/${roomId}/messages`, { params: { limit } }), // user_id from token
  editMessage: (tribeId: string, roomId: number, messageId: number, message: string) =>
    api.put(`/tribes/${tribeId}/room/${roomId}/messages/${messageId}`, { message }), // user_id from token
  deleteMessage: (tribeId: string, roomId: number, messageId: number) =>
    api.delete(`/tribes/${tribeId}/room/${roomId}/messages/${messageId}`), // user_id from token
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
    deletePhoto: (wallId: number, photoId: number) =>
      api.delete(`/rooms/birthday-wall/${wallId}/photos/${photoId}`),
    updatePhoto: (wallId: number, photoId: number, data: { caption?: string; frame_style?: string }) =>
      api.patch(`/rooms/birthday-wall/${wallId}/photos/${photoId}`, data),
  // EME Phase 1: Invitation and Upload Control
  inviteToWall: (wallId: number, data: { invited_user_id?: number; invited_email?: string; invited_name?: string; invitation_type: string }) =>
    api.post(`/rooms/birthday-wall/${wallId}/invite`, data),
  getWallInvitations: (wallId: number) =>
    api.get(`/rooms/birthday-wall/${wallId}/invitations`),
  acceptWallInvitation: (invitationCode: string) =>
    api.post(`/rooms/birthday-wall/invite/accept/${invitationCode}`),
  updateUploadControl: (wallId: number, data: { uploads_enabled?: boolean; upload_permission?: string; upload_paused?: boolean; is_sealed?: boolean }) =>
    api.patch(`/rooms/birthday-wall/${wallId}/upload-control`, data),
  getUploadStatus: (wallId: number) =>
    api.get(`/rooms/birthday-wall/${wallId}/upload-status`),
};

// Gift endpoints
export const giftAPI = {
  getCatalog: () => api.get('/gifts/catalog'),
  sendGift: (data: any) => api.post('/gifts/send', data), // sender_id from token
  getReceivedGifts: (userId: number) =>
    api.get(`/gifts/received`, { params: { user_id: userId } }),
  getSentGifts: (userId: number) =>
    api.get(`/gifts/sent`, { params: { user_id: userId } }),
  activateGift: (giftId: number) =>
    api.post(`/gifts/activate/${giftId}`),
  getActiveGifts: (userId: number) =>
    api.get(`/gifts/active/${userId}`),
  verifyPayment: (giftId: number) =>
    api.get(`/payments/verify/${giftId}`),
};

// Note: All admin endpoints now use Authorization header (Bearer token) from the interceptor
// No need for firebase_uid query parameters anymore

// Admin endpoints - All use Authorization header from interceptor
export const adminAPI = {
  addCelebrity: (data: any) => api.post('/admin/celebrities', data),
  getCelebritiesToday: () => api.get('/admin/celebrities/today'),
  flagContent: (data: any) => api.post('/admin/flag-content', data), // user_id extracted from token
  getFlaggedContent: (status?: string, limit?: number) =>
    api.get('/admin/flagged-content', { params: { status, limit } }),
  getStats: () => api.get('/admin/stats/overview'),
  getStateCelebrants: (state: string) =>
    api.get(`/admin/celebrants/state/${state}`),
  // Analytics endpoints - All use Authorization header from interceptor
  getAnalyticsOverview: (days: number = 30) => {
    return api.get('/admin/analytics/overview', { params: { days } });
  },
  getUserGrowth: (days: number = 30) => {
    return api.get('/admin/analytics/user-growth', { params: { days } });
  },
  getEngagementMetrics: (days: number = 30) => {
    return api.get('/admin/analytics/engagement', { params: { days } });
  },
  getGeographicAnalytics: () => {
    return api.get('/admin/analytics/geographic');
  },
  getTribeAnalytics: () => {
    return api.get('/admin/analytics/tribes');
  },
  // Activity monitoring endpoints - All use Authorization header from interceptor
  getRecentActivities: (limit: number = 50, activityType?: string) => {
    return api.get('/admin/activities/recent', { params: { limit, activity_type: activityType } });
  },
  getUserActivities: (userId?: number, limit: number = 50) => {
    return api.get('/admin/activities/users', { params: { user_id: userId, limit } });
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

