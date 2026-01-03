'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { roomAPI, uploadAPI } from '@/lib/api';
import { ArrowLeft, Upload, Heart, Smile, ThumbsUp, Share2, Eye, Flag, MoreVertical, Trash2, Edit2, X, Check, Palette } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { MobileAppHeader } from '@/components/MobileAppHeader';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import BirthdayWallBackground from '@/components/BirthdayWallBackground';
import { ReportContentModal } from '@/components/ReportContentModal';
import { normalizeImageUrl } from '@/utils/images';

interface Photo {
  id: number;
  photo_url: string;
  caption: string;
  uploaded_by: string;
  uploaded_by_user_id?: number;  // For ownership check
  created_at: string;
  frame_style?: string;
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
  is_open?: boolean;
  is_archived?: boolean;
  birthday_year?: number;
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
  const [selectedFrame, setSelectedFrame] = useState<string>('none');
  const [showFramePicker, setShowFramePicker] = useState(false);
  const [reportingPhotoId, setReportingPhotoId] = useState<number | null>(null);
  const [editingPhotoId, setEditingPhotoId] = useState<number | null>(null);
  const [editingCaption, setEditingCaption] = useState<string>('');
  const [deletingPhotoId, setDeletingPhotoId] = useState<number | null>(null);
  const [changingFramePhotoId, setChangingFramePhotoId] = useState<number | null>(null);

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
      setLoading(true);
      const response = await roomAPI.getBirthdayWall(wallCode, user?.id);
      setWall(response.data);
      console.log('Wall fetched:', response.data);
      console.log('Photos count:', response.data.photos?.length || 0);
      // Log photo URLs for debugging
      if (response.data.photos && response.data.photos.length > 0) {
        console.log('Photo URLs:', response.data.photos.map((p: any) => ({
          id: p.id,
          original_url: p.photo_url,
          normalized_url: normalizeImageUrl(p.photo_url)
        })));
      }
    } catch (error) {
      console.error('Error fetching wall:', error);
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
      await roomAPI.uploadPhotoToWall(wall.wall_id, photoUrl, '', user.id, selectedFrame);
      
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
    
    // Don't allow reactions on archived walls
    if (wall.is_archived) {
      toast.error('This wall is archived. Reactions are disabled.');
      return;
    }
    
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

  const handleDeletePhoto = async (photoId: number) => {
    if (!user || !wall) return;
    
    if (!confirm('Are you sure you want to delete this photo?')) {
      return;
    }
    
    setDeletingPhotoId(photoId);
    try {
      await roomAPI.deletePhoto(wall.wall_id, photoId);
      toast.success('Photo deleted successfully');
      await fetchWall(); // Refresh wall
    } catch (error: any) {
      console.error('Error deleting photo:', error);
      let errorMessage = 'Failed to delete photo';
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      toast.error(errorMessage);
    } finally {
      setDeletingPhotoId(null);
    }
  };

  const handleStartEdit = (photo: Photo) => {
    setEditingPhotoId(photo.id);
    setEditingCaption(photo.caption || '');
  };

  const handleCancelEdit = () => {
    setEditingPhotoId(null);
    setEditingCaption('');
  };

  const handleSaveEdit = async (photoId: number) => {
    if (!user || !wall) return;
    
    try {
      await roomAPI.updatePhoto(wall.wall_id, photoId, {
        caption: editingCaption.trim() || undefined
      });
      toast.success('Photo updated successfully');
      setEditingPhotoId(null);
      setEditingCaption('');
      await fetchWall(); // Refresh wall
    } catch (error: any) {
      console.error('Error updating photo:', error);
      let errorMessage = 'Failed to update photo';
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      toast.error(errorMessage);
    }
  };

  const handleChangeFrame = async (photoId: number, frameStyle: string) => {
    if (!user || !wall) return;
    
    setChangingFramePhotoId(photoId);
    try {
      await roomAPI.updatePhoto(wall.wall_id, photoId, {
        frame_style: frameStyle
      });
      toast.success('Frame updated successfully');
      setChangingFramePhotoId(null);
      await fetchWall(); // Refresh wall
    } catch (error: any) {
      console.error('Error updating frame:', error);
      let errorMessage = 'Failed to update frame';
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      toast.error(errorMessage);
      setChangingFramePhotoId(null);
    }
  };

  // Check if user can edit/delete a photo
  const canEditPhoto = (photo: Photo): boolean => {
    if (!user || !wall) return false;
    // Wall owner or photo uploader can edit/delete
    const isWallOwner = wall.owner_name === user.first_name; // Simple check, backend will verify
    const isPhotoUploader = photo.uploaded_by_user_id === user.id;
    return (isWallOwner || isPhotoUploader) && !wall.is_archived;
  };

  // Frame styling functions
  const getFrameClass = (frameStyle: string) => {
    switch (frameStyle) {
      case 'classic': return 'p-3';
      case 'elegant': return 'p-4';
      case 'vintage': return 'p-2';
      case 'modern': return 'p-1';
      case 'gold': return 'p-3';
      case 'rainbow': return 'p-2';
      case 'polaroid': return 'p-4 bg-white';
      default: return '';
    }
  };

  const getFrameWrapperClass = (frameStyle: string) => {
    switch (frameStyle) {
      case 'classic': return 'border-4 border-gray-800 rounded-lg p-2 bg-gray-100';
      case 'elegant': return 'border-2 border-gray-400 rounded-lg shadow-lg p-3 bg-white';
      case 'vintage': return 'border-4 border-amber-600 rounded-lg p-2 bg-amber-50';
      case 'modern': return 'border-2 border-gray-300 rounded-lg p-1 bg-gray-50';
      case 'gold': return 'border-4 border-yellow-500 rounded-lg p-2 bg-yellow-50 shadow-lg';
      case 'rainbow': return 'border-4 border-transparent bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 rounded-lg p-1';
      case 'polaroid': return 'bg-white p-4 shadow-2xl rounded-sm';
      default: return '';
    }
  };

  const getFrameImageClass = (frameStyle: string) => {
    switch (frameStyle) {
      case 'polaroid': return 'rounded-sm';
      default: return 'rounded-lg';
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
          {/* Archive Status Banner */}
          {wall.is_archived && (
            <div className={`mb-6 ${isMobile ? 'mb-6' : 'mb-8'} relative z-20`}>
              <div className="glass-effect rounded-2xl p-4 border-2 border-amber-300 bg-amber-50/50">
                <p className={`text-center font-semibold text-amber-800 ${isMobile ? 'text-sm' : 'text-base'}`}>
                  📸 Archive - {wall.birthday_year} Birthday Wall
                </p>
                <p className={`text-center text-amber-700 mt-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  This wall is archived and read-only. View your memories from {wall.birthday_year}!
                </p>
              </div>
            </div>
          )}

          {/* Upload Section - Only show when wall is open */}
          {user && wall.is_active && wall.is_open && !wall.is_archived && (
            <div className={`mb-6 ${isMobile ? 'mb-6' : 'mb-8'} relative z-20`}>
              {/* Frame Picker */}
              {showFramePicker && (
                <div className="glass-effect rounded-xl p-4 mb-4 border-2 border-primary-200">
                  <p className={`font-semibold mb-3 ${isMobile ? 'text-sm' : 'text-base'}`}>Choose Frame Style</p>
                  <div className={`grid ${isMobile ? 'grid-cols-4' : 'grid-cols-4'} gap-2`}>
                    {['none', 'classic', 'elegant', 'vintage', 'modern', 'gold', 'rainbow', 'polaroid'].map((frame) => (
                      <button
                        key={frame}
                        onClick={() => {
                          setSelectedFrame(frame);
                          setShowFramePicker(false);
                        }}
                        className={`p-2 rounded-lg border-2 transition-all capitalize ${
                          selectedFrame === frame
                            ? 'border-primary-500 bg-primary-100'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className={`${isMobile ? 'text-[10px]' : 'text-xs'}`}>
                          {frame === 'none' ? 'None' : frame}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Frame Selection Button - Outside the label */}
              <div className="mb-3 flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setShowFramePicker(!showFramePicker);
                  }}
                  className={`px-4 py-2 rounded-lg bg-primary-100 text-primary-700 hover:bg-primary-200 transition-colors ${isMobile ? 'text-xs' : 'text-sm'}`}
                >
                  {showFramePicker ? 'Hide' : 'Choose'} Frame
                </button>
              </div>
              
              {/* Upload Area - Label only for file input */}
              <label className={`glass-effect rounded-2xl flex flex-col items-center cursor-pointer hover:shadow-xl transition-all border-2 border-dashed border-primary-300 ${isMobile ? 'p-5' : 'p-6'}`}>
                <Upload className={`text-primary-600 mb-3 ${isMobile ? 'w-10 h-10' : 'w-12 h-12'}`} />
                <p className={`font-semibold mb-1 ${isMobile ? 'text-base' : 'text-lg'}`}>Upload a Photo</p>
                <p className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>Share a memory to the birthday wall</p>
                {selectedFrame !== 'none' && (
                  <p className={`text-primary-600 mt-1 ${isMobile ? 'text-[10px]' : 'text-xs'}`}>
                    Frame: {selectedFrame}
                  </p>
                )}
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
                  <div className={`glass-effect rounded-2xl hover:shadow-xl transition-all ${isMobile ? 'p-2 mb-4' : 'p-2'} ${getFrameClass(photo.frame_style || 'none')}`}>
                    <div className={`${getFrameWrapperClass(photo.frame_style || 'none')}`}>
                      <img
                        src={normalizeImageUrl(photo.photo_url)}
                        alt={photo.caption || 'Birthday memory'}
                        className={`w-full h-auto object-cover ${getFrameImageClass(photo.frame_style || 'none')} ${isMobile ? 'max-h-64' : ''}`}
                        loading="lazy"
                        onError={(e) => {
                          // Fallback to data URI placeholder if image fails to load
                          const target = e.target as HTMLImageElement;
                          // Use a data URI to prevent network requests and infinite loops
                          if (!target.src.startsWith('data:')) {
                            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzljYTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBhdmFpbGFibGU8L3RleHQ+PC9zdmc+';
                            target.onerror = null; // Prevent infinite loop
                          }
                        }}
                      />
                    </div>
                    {editingPhotoId === photo.id ? (
                      <div className={`${isMobile ? 'p-2' : 'p-3'}`}>
                        <textarea
                          value={editingCaption}
                          onChange={(e) => setEditingCaption(e.target.value)}
                          placeholder="Add a caption..."
                          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none ${isMobile ? 'text-xs' : 'text-sm'}`}
                          rows={2}
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => handleSaveEdit(photo.id)}
                            disabled={deletingPhotoId === photo.id}
                            className="flex items-center gap-1 px-3 py-1 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-xs disabled:opacity-50"
                          >
                            <Check className="w-3 h-3" />
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="flex items-center gap-1 px-3 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-xs"
                          >
                            <X className="w-3 h-3" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      photo.caption && (
                        <p className={`${isMobile ? 'p-2 text-xs' : 'p-3 text-sm'}`}>{photo.caption}</p>
                      )
                    )}
                    <div className={`flex items-center justify-between ${isMobile ? 'px-2 pb-2' : 'px-3 pb-3'}`}>
                      <p className={`text-gray-500 ${isMobile ? 'text-[10px]' : 'text-xs'}`}>by {photo.uploaded_by}</p>
                      <div className="flex gap-2 items-center">
                        {/* Frame change button - show for all users on non-archived walls */}
                        {!wall.is_archived && (
                          <div className="relative">
                            <button
                              onClick={() => setChangingFramePhotoId(changingFramePhotoId === photo.id ? null : photo.id)}
                              disabled={changingFramePhotoId === photo.id && deletingPhotoId === photo.id}
                              className="text-gray-400 hover:text-purple-600 transition-colors cursor-pointer p-1 disabled:opacity-50 relative"
                              title="Change frame"
                            >
                              {changingFramePhotoId === photo.id ? (
                                <div className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} animate-spin rounded-full border-2 border-purple-600 border-t-transparent`}></div>
                              ) : (
                                <Palette className={isMobile ? 'w-3 h-3' : 'w-4 h-4'} />
                              )}
                            </button>
                            {/* Frame picker dropdown */}
                            {changingFramePhotoId === photo.id && (
                              <div 
                                className="absolute bottom-full right-0 mb-2 glass-effect rounded-lg p-2 border-2 border-primary-200 z-50 min-w-[200px]"
                                onClick={(e) => e.stopPropagation()} // Prevent clicks from closing the dropdown
                              >
                                <p className={`font-semibold mb-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>Choose Frame</p>
                                <div className="grid grid-cols-4 gap-1">
                                  {['none', 'classic', 'elegant', 'vintage', 'modern', 'gold', 'rainbow', 'polaroid'].map((frame) => (
                                    <button
                                      key={frame}
                                      onClick={(e) => {
                                        e.stopPropagation(); // Prevent event bubbling
                                        handleChangeFrame(photo.id, frame);
                                      }}
                                      className={`p-1.5 rounded border-2 transition-all capitalize text-[10px] cursor-pointer ${
                                        photo.frame_style === frame
                                          ? 'border-primary-500 bg-primary-100'
                                          : 'border-gray-200 hover:border-gray-300'
                                      }`}
                                    >
                                      {frame === 'none' ? 'None' : frame}
                                    </button>
                                  ))}
                                </div>
                                <button
                                  onClick={() => setChangingFramePhotoId(null)}
                                  className="mt-2 w-full px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                        {/* Edit/Delete buttons - only show for wall owner or photo uploader */}
                        {canEditPhoto(photo) && editingPhotoId !== photo.id && (
                          <>
                            <button
                              onClick={() => handleStartEdit(photo)}
                              disabled={deletingPhotoId === photo.id || changingFramePhotoId === photo.id}
                              className="text-gray-400 hover:text-blue-600 transition-colors cursor-pointer p-1 disabled:opacity-50"
                              title="Edit photo"
                            >
                              <Edit2 className={isMobile ? 'w-3 h-3' : 'w-4 h-4'} />
                            </button>
                            <button
                              onClick={() => handleDeletePhoto(photo.id)}
                              disabled={deletingPhotoId === photo.id || changingFramePhotoId === photo.id}
                              className="text-gray-400 hover:text-red-600 transition-colors cursor-pointer p-1 disabled:opacity-50"
                              title="Delete photo"
                            >
                              {deletingPhotoId === photo.id ? (
                                <div className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} animate-spin rounded-full border-2 border-red-600 border-t-transparent`}></div>
                              ) : (
                                <Trash2 className={isMobile ? 'w-3 h-3' : 'w-4 h-4'} />
                              )}
                            </button>
                          </>
                        )}
                        <button 
                          onClick={() => handleReaction(photo.id, "❤️")}
                          disabled={reacting === photo.id || !user || wall.is_archived}
                          className={`flex items-center gap-1 transition-colors ${
                            photo.user_reacted?.includes("❤️")
                              ? 'text-red-500' 
                              : (photo.reactions?.["❤️"] ?? 0) > 0
                              ? 'text-red-400'
                              : 'text-gray-400 hover:text-red-500'
                          } ${reacting === photo.id || wall.is_archived ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <Heart className={isMobile ? 'w-3 h-3' : 'w-4 h-4'} fill={photo.user_reacted?.includes("❤️") ? 'currentColor' : 'none'} />
                          {(photo.reactions?.["❤️"] ?? 0) > 0 && (
                            <span className={`${isMobile ? 'text-[10px]' : 'text-xs'}`}>{photo.reactions?.["❤️"] ?? 0}</span>
                          )}
                        </button>
                        <button 
                          onClick={() => handleReaction(photo.id, "👍")}
                          disabled={reacting === photo.id || !user || wall.is_archived}
                          className={`flex items-center gap-1 transition-colors ${
                            photo.user_reacted?.includes("👍")
                              ? 'text-blue-500' 
                              : (photo.reactions?.["👍"] ?? 0) > 0
                              ? 'text-blue-400'
                              : 'text-gray-400 hover:text-blue-500'
                          } ${reacting === photo.id || wall.is_archived ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <ThumbsUp className={isMobile ? 'w-3 h-3' : 'w-4 h-4'} fill={photo.user_reacted?.includes("👍") ? 'currentColor' : 'none'} />
                          {(photo.reactions?.["👍"] ?? 0) > 0 && (
                            <span className={`${isMobile ? 'text-[10px]' : 'text-xs'}`}>{photo.reactions?.["👍"] ?? 0}</span>
                          )}
                        </button>
                        <button 
                          onClick={() => handleReaction(photo.id, "😊")}
                          disabled={reacting === photo.id || !user || wall.is_archived}
                          className={`flex items-center gap-1 transition-colors ${
                            photo.user_reacted?.includes("😊")
                              ? 'text-yellow-500' 
                              : (photo.reactions?.["😊"] ?? 0) > 0
                              ? 'text-yellow-400'
                              : 'text-gray-400 hover:text-yellow-500'
                          } ${reacting === photo.id || wall.is_archived ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <Smile className={isMobile ? 'w-3 h-3' : 'w-4 h-4'} fill={photo.user_reacted?.includes("😊") ? 'currentColor' : 'none'} />
                          {(photo.reactions?.["😊"] ?? 0) > 0 && (
                            <span className={`${isMobile ? 'text-[10px]' : 'text-xs'}`}>{photo.reactions?.["😊"] ?? 0}</span>
                          )}
                        </button>
                        {user && (
                          <button
                            onClick={() => setReportingPhotoId(photo.id)}
                            className="text-gray-400 hover:text-orange-600 transition-colors cursor-pointer p-1"
                            title="Report photo"
                          >
                            <Flag className={isMobile ? 'w-3 h-3' : 'w-4 h-4'} />
                          </button>
                        )}
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

        {/* Report Content Modal */}
        {reportingPhotoId !== null && (
          <ReportContentModal
            isOpen={reportingPhotoId !== null}
            onClose={() => setReportingPhotoId(null)}
            contentType="photo"
            contentId={reportingPhotoId}
            contentPreview={wall.photos.find(p => p.id === reportingPhotoId)?.caption || 'Photo on Birthday Wall'}
          />
        )}
      </div>
    </AuthProvider>
  );
}

