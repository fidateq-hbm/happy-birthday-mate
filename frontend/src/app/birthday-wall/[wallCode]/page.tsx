'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { roomAPI, uploadAPI } from '@/lib/api';
import { ArrowLeft, Upload, Heart, Smile, ThumbsUp, Share2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { MobileAppHeader } from '@/components/MobileAppHeader';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import BirthdayWallBackground from '@/components/BirthdayWallBackground';

interface Photo {
  id: number;
  photo_url: string;
  caption: string;
  uploaded_by: string;
  created_at: string;
  reactions?: {
    "❤️": number;
    "👍": number;
    "😊": number;
  };
  user_reacted?: string[];
}

interface Wall {
  wall_id: number;
  title: string;
  theme: string;
  accent_color: string;
  background_animation?: string;
  background_color?: string;
  animation_intensity?: string;
  owner_name: string;
  is_active: boolean;
  photos: Photo[];
}

export default function BirthdayWallPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [wall, setWall] = useState<Wall | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [reacting, setReacting] = useState<number | null>(null); // Track which photo is being reacted to

  const wallCode = params.wallCode as string;

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchWall();
  }, [wallCode, user?.id]);

  // Update page title and meta tags for better sharing
  useEffect(() => {
    if (wall) {
      document.title = `${wall.title} - Happy Birthday Mate`;
      
      // Update Open Graph meta tags for better social sharing
      const updateMetaTag = (property: string, content: string) => {
        let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute('property', property);
          document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
      };

      const url = window.location.href;
      const description = `Check out ${wall.owner_name}'s Birthday Wall! Share memories and celebrate together. 🎉`;
      
      updateMetaTag('og:title', wall.title);
      updateMetaTag('og:description', description);
      updateMetaTag('og:url', url);
      updateMetaTag('og:type', 'website');
      updateMetaTag('og:site_name', 'Happy Birthday Mate');
      
      // Twitter Card meta tags
      let twitterTitle = document.querySelector('meta[name="twitter:title"]') as HTMLMetaElement;
      if (!twitterTitle) {
        twitterTitle = document.createElement('meta');
        twitterTitle.setAttribute('name', 'twitter:title');
        document.head.appendChild(twitterTitle);
      }
      twitterTitle.setAttribute('content', wall.title);
      
      let twitterDesc = document.querySelector('meta[name="twitter:description"]') as HTMLMetaElement;
      if (!twitterDesc) {
        twitterDesc = document.createElement('meta');
        twitterDesc.setAttribute('name', 'twitter:description');
        document.head.appendChild(twitterDesc);
      }
      twitterDesc.setAttribute('content', description);
    }
  }, [wall]);

  const fetchWall = async () => {
    try {
      const response = await roomAPI.getBirthdayWall(wallCode, user?.id);
      setWall(response.data);
    } catch (error) {
      toast.error('Birthday Wall not found');
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !wall) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size too large. Maximum size is 10MB');
      return;
    }

    setUploading(true);
    try {
      console.log('Starting photo upload...', { fileName: file.name, fileSize: file.size });
      
      // Upload to backend
      console.log('Uploading to backend...', { wallId: wall.wall_id, userId: user.id });
      const uploadResponse = await uploadAPI.uploadBirthdayWallPhoto(wall.wall_id, user.id, file);
      const photoUrl = uploadResponse.data.url;
      console.log('Backend upload complete, photo URL:', photoUrl);

      // Add to wall
      console.log('Adding photo to wall...');
      await roomAPI.uploadPhotoToWall(wall.wall_id, photoUrl, '', user.id);
      
      console.log('Photo upload successful!');
      toast.success('Photo uploaded! 📸');
      fetchWall();
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
      });
      
      // Handle error - ensure we always pass a string to toast.error
      let errorMessage = 'Failed to upload photo';
      if (error.response?.data) {
        const errorData = error.response.data;
        // Handle Pydantic validation errors (array of errors)
        if (Array.isArray(errorData.detail)) {
          errorMessage = errorData.detail.map((e: any) => e.msg || e.message || String(e)).join(', ');
        } 
        // Handle string error messages
        else if (typeof errorData.detail === 'string') {
          errorMessage = errorData.detail;
        }
        // Handle object errors - convert to string
        else if (errorData.detail && typeof errorData.detail === 'object') {
          errorMessage = errorData.detail.msg || errorData.detail.message || 'Validation error occurred';
        }
        // Fallback to error message
        else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setUploading(false);
      // Reset file input to allow re-uploading the same file
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = wall?.title || 'My Birthday Wall';
    const text = `Check out ${wall?.owner_name}'s Birthday Wall on Happy Birthday Mate! 🎉`;
    
    // Use Web Share API if available (especially on mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: text,
          url: url,
        });
        toast.success('Shared successfully! 🎉');
        return;
      } catch (error: any) {
        // User cancelled or error occurred, fall back to clipboard
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    }
    
    // Fallback: Copy to clipboard with proper formatting
    try {
      // Ensure URL is properly formatted
      const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
      
      // Copy URL with a message to make it more clickable
      const shareText = `${text}\n\n${fullUrl}`;
      await navigator.clipboard.writeText(shareText);
      toast.success('Link copied to clipboard! 📋');
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        toast.success('Link copied to clipboard! 📋');
      } catch (err) {
        toast.error('Failed to copy link. Please copy manually.');
      }
      document.body.removeChild(textArea);
    }
  };

  const handleReaction = async (photoId: number, emoji: string) => {
    if (!user || !wall) return;
    
    setReacting(photoId);
    try {
      await roomAPI.addPhotoReaction(wall.wall_id, photoId, emoji, user.id);
      
      // Refresh wall to get updated reactions
      await fetchWall();
    } catch (error: any) {
      console.error('Error adding reaction:', error);
      let errorMessage = 'Failed to add reaction';
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      toast.error(errorMessage);
    } finally {
      setReacting(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!wall) {
    return null;
  }

  return (
    <AuthProvider>
      <div className="min-h-screen relative">
        {/* Animated Background */}
        <BirthdayWallBackground
          animationType={(wall?.background_animation as any) || 'celebration'}
          backgroundColor={wall?.background_color || 'bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100'}
          intensity={(wall?.animation_intensity as any) || 'medium'}
        />
        
        {/* Mobile App Header */}
        <MobileAppHeader show={isMobile} />

        {/* Desktop Header */}
        {!isMobile && (
          <header className="glass-effect border-b border-white/20 sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h1 className="text-2xl font-bold gradient-text">{wall.title}</h1>
                    <p className="text-sm text-gray-600">by {wall.owner_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Eye className="w-4 h-4" />
                    <span>{wall.photos.length} photos</span>
                  </div>
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                </div>
              </div>
            </div>
          </header>
        )}

        {/* Mobile Header */}
        {isMobile && (
          <header className="glass-effect border-b border-white/20 sticky top-16 z-30 backdrop-blur-md bg-white/80">
            <div className="px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div>
                    <h1 className="text-base font-bold gradient-text">{wall.title}</h1>
                    <p className="text-xs text-gray-600">by {wall.owner_name}</p>
                  </div>
                </div>
                <button
                  onClick={handleShare}
                  className="p-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </header>
        )}

        {/* Content */}
        <main className={`mx-auto relative z-10 ${isMobile ? 'px-3 pt-32 pb-32' : 'max-w-6xl px-4 py-8'}`}>
          {/* Upload Section */}
          {user && wall.is_active && (
            <div className={`mb-6 ${isMobile ? 'mb-6' : 'mb-8'} relative z-20`}>
              <label className={`glass-effect rounded-2xl flex flex-col items-center cursor-pointer hover:shadow-xl transition-all border-2 border-dashed border-primary-300 ${isMobile ? 'p-5' : 'p-6'}`}>
                <Upload className={`text-primary-600 mb-3 ${isMobile ? 'w-10 h-10' : 'w-12 h-12'}`} />
                <p className={`font-semibold mb-1 ${isMobile ? 'text-base' : 'text-lg'}`}>Upload a Photo</p>
                <p className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>Share a memory to the birthday wall</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={uploading}
                  className="hidden"
                />
                {uploading && <p className="text-sm text-primary-600 mt-2">Uploading...</p>}
              </label>
            </div>
          )}

          {/* Section Separator */}
          {wall.photos.length > 0 && (
            <div className={`mb-6 ${isMobile ? 'mb-6' : 'mb-8'} relative z-20`}>
              <div className="h-px bg-gradient-to-r from-transparent via-primary-300 to-transparent"></div>
              <p className={`text-center mt-3 text-gray-500 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                {wall.photos.length} {wall.photos.length === 1 ? 'Memory' : 'Memories'}
              </p>
            </div>
          )}

          {/* Photos Grid */}
          {wall.photos.length === 0 ? (
            <div className={`text-center relative z-20 ${isMobile ? 'py-12' : 'py-16'}`}>
              <p className={`text-gray-500 mb-2 ${isMobile ? 'text-base' : 'text-lg'}`}>No photos yet</p>
              <p className={`text-gray-400 ${isMobile ? 'text-xs' : 'text-sm'}`}>Be the first to add a memory!</p>
            </div>
          ) : (
            <div className={`relative z-20 ${isMobile ? 'space-y-4' : 'columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4'}`}>
              {wall.photos.map((photo, index) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className={isMobile ? '' : 'break-inside-avoid'}
                >
                  <div className={`glass-effect rounded-2xl hover:shadow-xl transition-all ${isMobile ? 'p-2 mb-4' : 'p-2'}`}>
                    <img
                      src={photo.photo_url}
                      alt={photo.caption || 'Birthday memory'}
                      className={`w-full rounded-xl object-cover ${isMobile ? 'max-h-64' : ''}`}
                    />
                    {photo.caption && (
                      <p className={`${isMobile ? 'p-2 text-xs' : 'p-3 text-sm'}`}>{photo.caption}</p>
                    )}
                    <div className={`flex items-center justify-between ${isMobile ? 'px-2 pb-2' : 'px-3 pb-3'}`}>
                      <p className={`text-gray-500 ${isMobile ? 'text-[10px]' : 'text-xs'}`}>by {photo.uploaded_by}</p>
                      <div className="flex gap-2 items-center">
                        <button 
                          onClick={() => handleReaction(photo.id, "❤️")}
                          disabled={reacting === photo.id || !user}
                          className={`flex items-center gap-1 transition-colors ${
                            photo.user_reacted?.includes("❤️")
                              ? 'text-red-500' 
                              : (photo.reactions?.["❤️"] ?? 0) > 0
                              ? 'text-red-400'
                              : 'text-gray-400 hover:text-red-500'
                          } ${reacting === photo.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <Heart className={isMobile ? 'w-3 h-3' : 'w-4 h-4'} fill={photo.user_reacted?.includes("❤️") ? 'currentColor' : 'none'} />
                          {(photo.reactions?.["❤️"] ?? 0) > 0 && (
                            <span className={`${isMobile ? 'text-[10px]' : 'text-xs'}`}>{photo.reactions?.["❤️"] ?? 0}</span>
                          )}
                        </button>
                        <button 
                          onClick={() => handleReaction(photo.id, "👍")}
                          disabled={reacting === photo.id || !user}
                          className={`flex items-center gap-1 transition-colors ${
                            photo.user_reacted?.includes("👍")
                              ? 'text-blue-500' 
                              : (photo.reactions?.["👍"] ?? 0) > 0
                              ? 'text-blue-400'
                              : 'text-gray-400 hover:text-blue-500'
                          } ${reacting === photo.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <ThumbsUp className={isMobile ? 'w-3 h-3' : 'w-4 h-4'} fill={photo.user_reacted?.includes("👍") ? 'currentColor' : 'none'} />
                          {(photo.reactions?.["👍"] ?? 0) > 0 && (
                            <span className={`${isMobile ? 'text-[10px]' : 'text-xs'}`}>{photo.reactions?.["👍"] ?? 0}</span>
                          )}
                        </button>
                        <button 
                          onClick={() => handleReaction(photo.id, "😊")}
                          disabled={reacting === photo.id || !user}
                          className={`flex items-center gap-1 transition-colors ${
                            photo.user_reacted?.includes("😊")
                              ? 'text-yellow-500' 
                              : (photo.reactions?.["😊"] ?? 0) > 0
                              ? 'text-yellow-400'
                              : 'text-gray-400 hover:text-yellow-500'
                          } ${reacting === photo.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <Smile className={isMobile ? 'w-3 h-3' : 'w-4 h-4'} fill={photo.user_reacted?.includes("😊") ? 'currentColor' : 'none'} />
                          {(photo.reactions?.["😊"] ?? 0) > 0 && (
                            <span className={`${isMobile ? 'text-[10px]' : 'text-xs'}`}>{photo.reactions?.["😊"] ?? 0}</span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav show={isMobile && !!user} />
      </div>
    </AuthProvider>
  );
}

