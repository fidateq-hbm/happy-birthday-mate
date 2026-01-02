'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { userAPI, api } from '@/lib/api';
import { ArrowLeft, Upload, User, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { MobileAppHeader } from '@/components/MobileAppHeader';
import { MobileBottomNav } from '@/components/MobileBottomNav';

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading } = useAuthStore();
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadProfilePicture = async () => {
    if (!profilePicture || !user) {
      toast.error('Please select a profile picture');
      return;
    }

    setUploading(true);

    try {
      // Upload to backend using authenticated API client
      const formData = new FormData();
      formData.append('file', profilePicture);

      // Use the api client which automatically includes Authorization header
      // Note: Don't set Content-Type manually - axios will set it with boundary for FormData
      const uploadResponse = await api.post('/upload/profile-picture', formData, {
        timeout: 60000, // 60 second timeout for file uploads
      });

      const uploadData = uploadResponse.data;
      const profilePictureUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${uploadData.url}`;

      // Update user profile
      await userAPI.updateProfilePicture(user.id, profilePictureUrl);

      toast.success('Profile picture updated! 🎉');
      
      // Refresh the page to show new picture
      window.location.reload();
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.detail || 'Failed to upload profile picture');
    } finally {
      setUploading(false);
    }
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        {/* Mobile App Header */}
        <MobileAppHeader show={isMobile} />

        {/* Desktop Header */}
        {!isMobile && (
          <header className="glass-effect border-b border-white/20 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold gradient-text">Settings</h1>
            </div>
          </header>
        )}

        <div className={`max-w-2xl mx-auto ${isMobile ? 'p-4 pt-20 pb-24' : 'p-4 py-8'}`}>
          {isMobile && (
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
          )}

          <div className={`glass-effect rounded-3xl ${isMobile ? 'p-6' : 'p-8'}`}>
            {isMobile ? (
              <h1 className="text-2xl font-bold gradient-text mb-6">Settings</h1>
            ) : (
              <h1 className="text-3xl font-bold gradient-text mb-6">Settings</h1>
            )}

            {/* Current Profile Picture */}
            <div className={`mb-8 ${isMobile ? 'text-center' : ''}`}>
              <h2 className={`font-semibold mb-4 ${isMobile ? 'text-lg' : 'text-xl'}`}>Current Profile Picture</h2>
              <div className={`flex items-center ${isMobile ? 'flex-col gap-4' : 'gap-6'}`}>
                <img
                  src={user.profile_picture_url}
                  alt={user.first_name}
                  className={`rounded-full object-cover border-4 border-primary-400 ${isMobile ? 'w-24 h-24' : 'w-32 h-32'}`}
                />
                <div className={isMobile ? 'text-center' : ''}>
                  <p className={`text-gray-600 ${isMobile ? 'text-base font-semibold' : 'text-sm'}`}>
                    {user.first_name}
                  </p>
                  <p className={`text-gray-500 mt-1 ${isMobile ? 'text-sm' : 'text-xs'}`}>
                    Birthday Tribe: {user.tribe_id}
                  </p>
                </div>
              </div>
            </div>

            {/* Upload New Picture */}
            <div className="border-t border-gray-200 pt-8">
              <h2 className={`font-semibold mb-4 ${isMobile ? 'text-lg' : 'text-xl'}`}>Update Profile Picture</h2>
              
              <div className="flex flex-col items-center gap-4">
                {profilePicturePreview ? (
                  <img
                    src={profilePicturePreview}
                    alt="Preview"
                    className={`rounded-full object-cover border-4 border-primary-400 ${isMobile ? 'w-32 h-32' : 'w-40 h-40'}`}
                  />
                ) : (
                  <div className={`rounded-full bg-gray-200 flex items-center justify-center border-4 border-dashed border-gray-300 ${isMobile ? 'w-32 h-32' : 'w-40 h-40'}`}>
                    <User className={`text-gray-400 ${isMobile ? 'w-12 h-12' : 'w-16 h-16'}`} />
                  </div>
                )}

                <label className={`celebration-gradient text-white ${isMobile ? 'px-4 py-2.5 text-sm' : 'px-6 py-3'} rounded-xl cursor-pointer hover:shadow-lg transition-all flex items-center gap-2 w-full justify-center`}>
                  <Upload className="w-5 h-5" />
                  Choose New Picture
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className="hidden"
                  />
                </label>

                {profilePicture && (
                  <button
                    onClick={handleUploadProfilePicture}
                    disabled={uploading}
                    className={`bg-green-600 hover:bg-green-700 text-white ${isMobile ? 'px-6 py-2.5 text-sm' : 'px-8 py-3'} rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center gap-2 w-full justify-center`}
                  >
                    <Save className="w-5 h-5" />
                    {uploading ? 'Uploading...' : 'Save Profile Picture'}
                  </button>
                )}
              </div>

              <div className={`mt-6 bg-blue-50 border border-blue-200 rounded-xl ${isMobile ? 'p-3' : 'p-4'}`}>
                <p className={`text-blue-800 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  📸 <strong>Tips:</strong> Use a clear photo of yourself. Max size: 5MB. 
                  Accepted formats: JPG, PNG, GIF, WEBP
                </p>
              </div>
            </div>

            {/* Additional Settings */}
            <div className="border-t border-gray-200 pt-8 mt-8">
              <h2 className={`font-semibold mb-4 ${isMobile ? 'text-lg' : 'text-xl'}`}>Privacy Settings</h2>
              
              <div className="space-y-4">
                <label className={`flex items-center justify-between ${isMobile ? 'p-3' : 'p-4'} bg-gray-50 rounded-xl`}>
                  <div>
                    <p className={`font-medium ${isMobile ? 'text-sm' : ''}`}>State Visibility</p>
                    <p className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>Show celebrants from your state</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={user.state_visibility_enabled}
                    onChange={() => {
                      toast('Feature coming soon!', {
                        icon: 'ℹ️',
                      });
                    }}
                    className={`text-primary-600 rounded ${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav show={isMobile && !!user} />
      </div>
    </AuthProvider>
  );
}

