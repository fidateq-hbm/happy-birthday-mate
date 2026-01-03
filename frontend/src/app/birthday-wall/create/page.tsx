'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { roomAPI } from '@/lib/api';
import { ArrowLeft, Palette, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { MobileAppHeader } from '@/components/MobileAppHeader';
import { MobileBottomNav } from '@/components/MobileBottomNav';

const THEMES = [
  { value: 'celebration', label: 'Celebration', gradient: 'from-purple-400 to-pink-400' },
  { value: 'elegant', label: 'Elegant', gradient: 'from-gray-800 to-gray-600' },
  { value: 'vibrant', label: 'Vibrant', gradient: 'from-yellow-400 to-red-500' },
  { value: 'minimal', label: 'Minimal', gradient: 'from-blue-50 to-gray-50' },
  { value: 'gold', label: 'Gold', gradient: 'from-yellow-600 to-yellow-400' },
  { value: 'rainbow', label: 'Rainbow', gradient: 'from-red-400 via-yellow-400 to-blue-400' },
];

const ACCENT_COLORS = [
  '#FFD700', '#FF69B4', '#87CEEB', '#98FF98', '#DDA0DD', '#F0E68C',
];

const BACKGROUND_ANIMATIONS = [
  { value: 'celebration', label: '🎉 Celebration', emoji: '🎂🎈🎁', description: 'Cakes, balloons, and gifts' },
  { value: 'autumn', label: '🍂 Autumn', emoji: '🍁🍂🌰', description: 'Falling leaves and autumn vibes' },
  { value: 'spring', label: '🌸 Spring', emoji: '🌷🌸🦋', description: 'Flowers and butterflies' },
  { value: 'winter', label: '❄️ Winter', emoji: '❄️⛄🎄', description: 'Snowflakes and winter magic' },
  { value: 'ocean', label: '🌊 Ocean', emoji: '🐠🌊🐚', description: 'Marine life and waves' },
  { value: 'galaxy', label: '🌌 Galaxy', emoji: '⭐✨🌙', description: 'Stars and cosmic elements' },
  { value: 'confetti', label: '🎊 Confetti', emoji: '🎊🎉✨', description: 'Party confetti and sparkles' },
];

const BACKGROUND_COLORS = [
  { value: 'bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100', label: 'Purple Pink', preview: 'linear-gradient(to bottom right, #e9d5ff, #fce7f3, #dbeafe)' },
  { value: 'bg-gradient-to-br from-yellow-100 via-orange-100 to-red-100', label: 'Sunset', preview: 'linear-gradient(to bottom right, #fef3c7, #fed7aa, #fee2e2)' },
  { value: 'bg-gradient-to-br from-blue-100 via-cyan-100 to-teal-100', label: 'Ocean', preview: 'linear-gradient(to bottom right, #dbeafe, #cffafe, #ccfbf1)' },
  { value: 'bg-gradient-to-br from-green-100 via-emerald-100 to-teal-100', label: 'Nature', preview: 'linear-gradient(to bottom right, #dcfce7, #d1fae5, #ccfbf1)' },
  { value: 'bg-gradient-to-br from-pink-100 via-rose-100 to-red-100', label: 'Rose', preview: 'linear-gradient(to bottom right, #fce7f3, #ffe4e6, #fee2e2)' },
  { value: 'bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100', label: 'Royal', preview: 'linear-gradient(to bottom right, #e0e7ff, #e9d5ff, #fce7f3)' },
  { value: 'bg-gradient-to-br from-gray-50 via-slate-100 to-gray-100', label: 'Elegant', preview: 'linear-gradient(to bottom right, #f9fafb, #f1f5f9, #f3f4f6)' },
  { value: 'bg-gradient-to-br from-amber-100 via-yellow-100 to-orange-100', label: 'Golden', preview: 'linear-gradient(to bottom right, #fef3c7, #fef9c3, #fed7aa)' },
];

export default function CreateBirthdayWallPage() {
  const router = useRouter();
  const { user, loading } = useAuthStore();
  const [title, setTitle] = useState('My Birthday Wall');
  const [theme, setTheme] = useState('celebration');
  const [accentColor, setAccentColor] = useState('#FFD700');
  const [backgroundAnimation, setBackgroundAnimation] = useState('celebration');
  const [backgroundColor, setBackgroundColor] = useState('bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100');
  const [animationIntensity, setAnimationIntensity] = useState('medium');
  const [creating, setCreating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [checkingExisting, setCheckingExisting] = useState(true);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Check for existing wall on mount (only once)
  useEffect(() => {
    let isMounted = true;
    
    const checkExistingWall = async () => {
      if (!user || loading) return;
      
      setCheckingExisting(true);
      try {
        const response = await roomAPI.getUserBirthdayWall(user.id);
        // Wall exists - redirect to it
        if (isMounted) {
          toast.success('You already have a birthday wall! Redirecting...');
          router.push(`/birthday-wall/${response.data.public_url_code}`);
        }
      } catch (error: any) {
        // No existing wall - allow creation
        if (isMounted) {
          if (error.response?.status === 404) {
            setCheckingExisting(false);
          } else {
            console.error('Error checking existing wall:', error);
            setCheckingExisting(false);
          }
        }
      }
    };

    if (user && !loading) {
      checkExistingWall();
    } else if (!loading && !user) {
      // User not loaded and not loading - stop checking
      setCheckingExisting(false);
    }

    return () => {
      isMounted = false;
    };
  }, [user?.id, loading]); // Only depend on user.id and loading, not the whole user object or router

  const handleCreate = async () => {
    if (!user) return;

    setCreating(true);
    try {
      const response = await roomAPI.createBirthdayWall(user.id, {
        title,
        theme,
        accent_color: accentColor,
        background_animation: backgroundAnimation,
        background_color: backgroundColor,
        animation_intensity: animationIntensity,
      });

      // Check if wall already exists (backend returns existing wall)
      if (response.data.message === 'Wall already exists') {
        toast.success('You already have a birthday wall! Redirecting...');
        router.push(`/birthday-wall/${response.data.public_url_code}`);
        return;
      }

      toast.success('Birthday Wall created! 🎉');
      router.push(`/birthday-wall/${response.data.public_url_code}`);
    } catch (error: any) {
      console.error('Error creating birthday wall:', error);
      // Handle error - ensure we always pass a string to toast.error
      let errorMessage = 'Failed to create Birthday Wall';
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
      setCreating(false);
    }
  };

  if (loading || !user || checkingExisting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {checkingExisting ? 'Checking for existing wall...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <div className="min-h-screen">
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
              <h1 className="text-2xl font-bold gradient-text">Create Birthday Wall</h1>
            </div>
          </header>
        )}

        <div className={`${isMobile ? 'p-4 pt-20 pb-24' : 'p-4 py-8'}`}>
          <div className={`mx-auto ${isMobile ? '' : 'max-w-3xl'}`}>
            {isMobile && (
              <button
                onClick={() => router.push('/dashboard')}
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            )}

            <div className={`glass-effect rounded-3xl ${isMobile ? 'p-6' : 'p-8'} space-y-6 md:space-y-8`}>
              <div className="text-center">
                <h1 className={`font-bold gradient-text mb-2 ${isMobile ? 'text-2xl' : 'text-4xl'}`}>Create Your Birthday Wall</h1>
                <p className={`text-gray-600 ${isMobile ? 'text-sm' : ''}`}>A beautiful photo gallery for your celebration</p>
              </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Wall Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="My Birthday Wall"
              />
            </div>

            {/* Theme */}
            <div>
              <label className={`block font-medium text-gray-700 mb-3 flex items-center gap-2 ${isMobile ? 'text-sm' : 'text-sm'}`}>
                <Palette className={isMobile ? 'w-3 h-3' : 'w-4 h-4'} />
                Choose Theme
              </label>
              <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-3'} gap-3`}>
                {THEMES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setTheme(t.value)}
                    className={`relative rounded-xl p-4 border-2 transition-all ${
                      theme === t.value
                        ? 'border-primary-500 shadow-lg scale-105'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-full h-20 rounded-lg bg-gradient-to-r ${t.gradient} mb-2`}></div>
                    <p className="text-sm font-medium">{t.label}</p>
                    {theme === t.value && (
                      <div className="absolute top-2 right-2 bg-primary-500 text-white rounded-full p-1">
                        <Sparkles className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Accent Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Accent Color
              </label>
              <div className="flex gap-3">
                {ACCENT_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setAccentColor(color)}
                    className={`w-12 h-12 rounded-full border-4 transition-all ${
                      accentColor === color
                        ? 'border-primary-500 scale-110'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Background Animation */}
            <div>
              <label className={`block font-medium text-gray-700 mb-3 flex items-center gap-2 ${isMobile ? 'text-sm' : 'text-sm'}`}>
                <Sparkles className={isMobile ? 'w-3 h-3' : 'w-4 h-4'} />
                Background Animation
              </label>
              <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-3'} gap-3`}>
                {BACKGROUND_ANIMATIONS.map((anim) => (
                  <button
                    key={anim.value}
                    onClick={() => setBackgroundAnimation(anim.value)}
                    className={`relative rounded-xl p-4 border-2 transition-all text-left ${
                      backgroundAnimation === anim.value
                        ? 'border-primary-500 shadow-lg scale-105 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="text-2xl mb-1">{anim.emoji}</div>
                    <p className="text-sm font-medium">{anim.label}</p>
                    <p className="text-xs text-gray-500 mt-1">{anim.description}</p>
                    {backgroundAnimation === anim.value && (
                      <div className="absolute top-2 right-2 bg-primary-500 text-white rounded-full p-1">
                        <Sparkles className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Background Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Background Color
              </label>
              <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-3`}>
                {BACKGROUND_COLORS.map((bg) => (
                  <button
                    key={bg.value}
                    onClick={() => setBackgroundColor(bg.value)}
                    className={`relative rounded-xl p-3 border-2 transition-all h-20 ${
                      backgroundColor === bg.value
                        ? 'border-primary-500 shadow-lg scale-105'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={{ background: bg.preview }}
                  >
                    <p className="text-xs font-medium text-gray-700">{bg.label}</p>
                    {backgroundColor === bg.value && (
                      <div className="absolute top-1 right-1 bg-primary-500 text-white rounded-full p-1">
                        <Sparkles className="w-2 h-2" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Animation Intensity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Animation Intensity
              </label>
              <div className="flex gap-3">
                {['low', 'medium', 'high'].map((intensity) => (
                  <button
                    key={intensity}
                    onClick={() => setAnimationIntensity(intensity)}
                    className={`flex-1 rounded-lg p-3 border-2 transition-all capitalize ${
                      animationIntensity === intensity
                        ? 'border-primary-500 bg-primary-50 text-primary-700 font-semibold'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {intensity}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center">
              <p className="text-sm text-gray-500 mb-4">Preview</p>
              <div
                className={`rounded-xl p-6 bg-gradient-to-r ${
                  THEMES.find((t) => t.value === theme)?.gradient
                }`}
              >
                <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
                <div className="w-12 h-12 rounded-full mx-auto" style={{ backgroundColor: accentColor }}></div>
              </div>
            </div>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-900">
                <strong>Note:</strong> Your Birthday Wall can only be created within 24 hours before your birthday. 
                It opens 24 hours before your birthday and closes 48 hours after. After closing, it becomes an archived memory 
                labeled by year that you can always revisit. Friends can upload photos and react with emojis while it's open.
                <br /><br />
                <strong>After closure, the Birthday Wall becomes archived and visible only to the celebrant.</strong>
              </p>
            </div>

            {/* Create Button */}
            <button
              onClick={handleCreate}
              disabled={creating || !title.trim()}
              className={`w-full celebration-gradient text-white font-bold rounded-xl hover:shadow-xl transition-all disabled:opacity-50 ${isMobile ? 'py-3 text-sm' : 'py-4'}`}
            >
              {creating ? 'Creating...' : 'Create Birthday Wall 🎉'}
            </button>
            </div>
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav show={isMobile && !!user} />
      </div>
    </AuthProvider>
  );
}

