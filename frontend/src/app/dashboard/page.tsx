'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { tribeAPI, adminAPI, userAPI, roomAPI } from '@/lib/api';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { 
  Gift, Users, Calendar, Image, LogOut, Settings, 
  Cake, Sparkles, MapPin, Clock, Shield, Heart, BarChart3
} from 'lucide-react';
import toast from 'react-hot-toast';
import { CelebrantSpiral } from '@/components/CelebrantSpiral';
import { MobileCelebrantCarousel } from '@/components/MobileCelebrantCarousel';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { MobileAppHeader } from '@/components/MobileAppHeader';
import { NotificationDropdown } from '@/components/NotificationDropdown';
import { DigitalGiftEffects } from '@/components/DigitalGiftEffects';
import { EmailVerificationBanner } from '@/components/EmailVerificationBanner';
import { daysUntilBirthday, isBirthdayToday } from '@/utils/dates';
import { normalizeImageUrl, getFallbackAvatar } from '@/utils/images';

export default function DashboardPage() {
  const router = useRouter();
  const { user, firebaseUser, loading, logout, setFirebaseUser } = useAuthStore();
  const [tribeInfo, setTribeInfo] = useState<any>(null);
  const [celebrants, setCelebrants] = useState<any[]>([]);
  const [celebrities, setCelebrities] = useState<any[]>([]);
  const [stateCelebrantCount, setStateCelebrantCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile
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

  useEffect(() => {
    if (user) {
      // Fetch tribe info
      tribeAPI.getTribeInfo(user.tribe_id)
        .then(response => setTribeInfo(response.data))
        .catch(console.error);

      // Fetch tribe members for spiral
      userAPI.getTribeMembers(user.tribe_id, 50)
        .then(response => setCelebrants(response.data.members))
        .catch(console.error);

      // Fetch celebrities
      adminAPI.getCelebritiesToday()
        .then(response => setCelebrities(response.data.celebrities))
        .catch(console.error);

      // Fetch state celebrant count
      adminAPI.getStateCelebrants(user.state)
        .then(response => setStateCelebrantCount(response.data.total_celebrants))
        .catch(console.error);
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      logout();
      toast.success('Logged out successfully');
      router.push('/');
    } catch (error) {
      toast.error('Failed to log out');
    }
  };

  const handleEnterTribeRoom = async () => {
    if (!user) return;
    
    // Extract month and day from date_of_birth
    const birthDate = new Date(user.date_of_birth);
    const birthMonth = birthDate.getMonth() + 1; // getMonth() returns 0-11
    const birthDay = birthDate.getDate();
    
    if (!isBirthdayToday(birthMonth, birthDay)) {
      toast.error('Tribe room only opens on your birthday!');
      return;
    }

    try {
      const response = await tribeAPI.getTribeRoom(user.tribe_id, user.id);
      router.push(`/tribe/${user.tribe_id}/room/${response.data.room_id}`);
    } catch (error) {
      toast.error('Failed to enter tribe room');
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Extract month and day from date_of_birth
  const birthDate = new Date(user.date_of_birth);
  const birthMonth = birthDate.getMonth() + 1; // getMonth() returns 0-11
  const birthDay = birthDate.getDate();
  const daysUntil = daysUntilBirthday(birthMonth, birthDay);
  const isBirthday = isBirthdayToday(birthMonth, birthDay);

  return (
    <AuthProvider>
      <div className="min-h-screen overflow-x-hidden pb-20 md:pb-0">
        {/* Mobile Header */}
        <MobileAppHeader show={isMobile} title="Profile" />
        
        {/* Desktop Header */}
        {!isMobile && (
          <header className="glass-effect border-b border-white/20 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
              <button 
                onClick={() => router.push('/')}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <Cake className="w-8 h-8 text-primary-600" />
                <h1 className="text-2xl font-bold gradient-text">Happy Birthday Mate</h1>
              </button>
              <div className="flex items-center gap-4">
                <NotificationDropdown isMobile={false} />
                <img
                  src={normalizeImageUrl(user.profile_picture_url)}
                  alt={user.first_name}
                  className="w-10 h-10 rounded-full border-2 border-primary-400 object-cover"
                  onError={(e) => {
                    // Fallback to default avatar if image fails to load
                    (e.target as HTMLImageElement).src = getFallbackAvatar(user.first_name);
                  }}
                />
                <span className="font-semibold">{user.first_name}</span>
                <button
                  onClick={handleLogout}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </header>
        )}

        <main className={`max-w-7xl mx-auto px-4 ${isMobile ? 'pt-20 pb-24' : 'py-8'} space-y-4 md:space-y-8`}>
          {/* Email Verification Banner */}
          {firebaseUser && !firebaseUser.emailVerified && (
            <EmailVerificationBanner
              userEmail={firebaseUser.email || ''}
              emailVerified={firebaseUser.emailVerified}
              onVerificationCheck={async () => {
                // Reload Firebase user to get latest verification status
                if (firebaseUser) {
                  await firebaseUser.reload();
                  setFirebaseUser(firebaseUser);
                }
              }}
            />
          )}

          {/* Profile Picture Card - Mobile Only */}
          {isMobile && (
            <div className="glass-effect rounded-2xl p-6 text-center">
              <div className="relative inline-block mb-4">
                <img
                  src={normalizeImageUrl(user.profile_picture_url)}
                  alt={user.first_name}
                  className="w-24 h-24 rounded-full border-4 border-primary-400 object-cover mx-auto shadow-xl"
                  onError={(e) => {
                    // Fallback to default avatar if image fails to load
                    (e.target as HTMLImageElement).src = getFallbackAvatar(user.first_name);
                  }}
                />
                {/* Digital Gift Badge */}
                <DigitalGiftEffects userId={user.id} />
              </div>
              <h2 className="text-2xl font-bold mb-1">{user.first_name}</h2>
              <div className="flex items-center justify-center gap-2 text-gray-600 text-sm">
                <MapPin className="w-4 h-4" />
                <span>{user.city || user.state}, {user.country}</span>
              </div>
            </div>
          )}

          {/* Birthday Status */}
          {isBirthday ? (
            <div className="celebration-gradient rounded-2xl md:rounded-3xl p-6 md:p-8 text-white text-center relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-3xl md:text-5xl font-black mb-3 md:mb-4">🎉 HAPPY BIRTHDAY! 🎉</h2>
                <p className="text-base md:text-xl mb-4 md:mb-6">Today is YOUR day, {user.first_name}!</p>
                <button
                  onClick={handleEnterTribeRoom}
                  className="bg-white text-primary-700 px-6 md:px-8 py-3 md:py-4 rounded-full font-bold text-base md:text-lg hover:shadow-2xl transition-all transform hover:scale-105 w-full sm:w-auto"
                >
                  Enter Birthday Tribe Room 🎊
                </button>
              </div>
              <div className="absolute inset-0 flex items-center justify-center opacity-10">
                <Sparkles className="w-32 h-32 md:w-64 md:h-64" />
              </div>
            </div>
          ) : (
            <div className="glass-effect rounded-2xl md:rounded-3xl p-6 md:p-8 text-center">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 md:gap-3 mb-3 md:mb-4">
                <Clock className="w-6 h-6 md:w-8 md:h-8 text-primary-600" />
                <h2 className="text-2xl md:text-3xl font-bold gradient-text">
                  {daysUntil} Days Until Your Birthday
                </h2>
              </div>
              <p className="text-sm md:text-base text-gray-600">
                Get ready to celebrate with your tribe: {user.tribe_id}
              </p>
            </div>
          )}

          {/* Tribe Info */}
          {tribeInfo && (
            <div className="glass-effect rounded-xl md:rounded-2xl p-4 md:p-6">
              <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 md:w-6 md:h-6 text-primary-600" />
                <span className="text-base md:text-2xl">Your Birthday Tribe: {user.tribe_id}</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-4">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg md:rounded-xl p-3 md:p-4">
                  <p className="text-xs md:text-sm text-gray-600 mb-1">Tribe Members</p>
                  <p className="text-2xl md:text-3xl font-bold gradient-text">{tribeInfo.member_count}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg md:rounded-xl p-3 md:p-4">
                  <p className="text-xs md:text-sm text-gray-600 mb-1">Room Status</p>
                  <p className="text-base md:text-lg font-semibold">
                    {tribeInfo.is_active ? (
                      <span className="text-green-600">🟢 Active Now</span>
                    ) : (
                      <span className="text-gray-600">⚪ Opens on Birthday</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Celebrant Spiral - Desktop view */}
          {celebrants.length > 0 && !isMobile && (
            <div className="glass-effect rounded-2xl md:rounded-3xl p-6 md:p-8">
              <h3 className="text-xl md:text-2xl font-bold text-center mb-4 md:mb-6 gradient-text">
                Your Birthday Mates
              </h3>
              <CelebrantSpiral celebrants={celebrants} totalCount={tribeInfo?.member_count} />
            </div>
          )}

          {/* Mobile Celebrant Carousel - Mobile view */}
          {celebrants.length > 0 && isMobile && (
            <div className="glass-effect rounded-2xl p-6">
              <h3 className="text-xl font-bold text-center mb-4 gradient-text">
                Your Birthday Mates
              </h3>
              <MobileCelebrantCarousel celebrants={celebrants} totalCount={tribeInfo?.member_count} />
            </div>
          )}

          {/* State Celebrants */}
          <div className="glass-effect rounded-xl md:rounded-2xl p-4 md:p-6">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 md:w-5 md:h-5 text-primary-600" />
              <h3 className="text-base md:text-xl font-bold">Celebrating in {user.state}</h3>
            </div>
            <p className="text-sm md:text-base text-gray-600">
              <span className="text-xl md:text-2xl font-bold text-primary-600">{stateCelebrantCount}</span>{' '}
              people are celebrating today in your state
            </p>
          </div>

          {/* Celebrity Birthday Twin */}
          {celebrities.length > 0 && (
            <div className="glass-effect rounded-xl md:rounded-2xl p-4 md:p-6">
              <h3 className="text-base md:text-xl font-bold mb-3 md:mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-yellow-500" />
                Born on Your Day
              </h3>
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 md:gap-4">
                <img
                  src={celebrities[0].photo_url}
                  alt={celebrities[0].name}
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-4 border-primary-400 flex-shrink-0"
                />
                <div className="text-center sm:text-left">
                  <p className="font-bold text-base md:text-lg">{celebrities[0].name}</p>
                  <p className="text-xs md:text-sm text-gray-600">{celebrities[0].description}</p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className={`grid grid-cols-2 ${user.is_admin ? 'md:grid-cols-6' : 'md:grid-cols-5'} gap-3 md:gap-4`}>
            <button
              onClick={async () => {
                try {
                  // Check if user has existing wall
                  const response = await roomAPI.getUserBirthdayWall(user.id);
                  router.push(`/birthday-wall/${response.data.public_url_code}`);
                } catch (error: any) {
                  // No existing wall - go to create page
                  if (error.response?.status === 404) {
                    router.push('/birthday-wall/create');
                  } else {
                    console.error('Error checking wall:', error);
                    router.push('/birthday-wall/create');
                  }
                }
              }}
              className="glass-effect rounded-xl md:rounded-2xl p-4 md:p-6 hover:shadow-xl transition-all text-center sm:text-left"
            >
              <Image className="w-6 h-6 md:w-8 md:h-8 text-primary-600 mb-2 md:mb-3 mx-auto sm:mx-0" />
              <h4 className="font-bold text-sm md:text-lg mb-1">Birthday Wall</h4>
              <p className="text-xs md:text-sm text-gray-600 hidden sm:block">View or create your photo gallery</p>
            </button>
            
            <button
              onClick={() => router.push('/birthday-wall/archive')}
              className="glass-effect rounded-xl md:rounded-2xl p-4 md:p-6 hover:shadow-xl transition-all text-center sm:text-left"
            >
              <Image className="w-6 h-6 md:w-8 md:h-8 text-purple-600 mb-2 md:mb-3 mx-auto sm:mx-0" />
              <h4 className="font-bold text-sm md:text-lg mb-1">Wall Archive</h4>
              <p className="text-xs md:text-sm text-gray-600 hidden sm:block">View all your past birthday walls</p>
            </button>

            <button
              onClick={() => router.push('/gifts')}
              className="glass-effect rounded-xl md:rounded-2xl p-4 md:p-6 hover:shadow-xl transition-all text-center sm:text-left"
            >
              <Gift className="w-6 h-6 md:w-8 md:h-8 text-pink-600 mb-2 md:mb-3 mx-auto sm:mx-0" />
              <h4 className="font-bold text-sm md:text-lg mb-1">Digital Gifts</h4>
              <p className="text-xs md:text-sm text-gray-600 hidden sm:block">Send celebration gifts</p>
            </button>

            <button
              onClick={() => router.push('/buddy')}
              className="glass-effect rounded-xl md:rounded-2xl p-4 md:p-6 hover:shadow-xl transition-all text-center sm:text-left"
            >
              <Heart className="w-6 h-6 md:w-8 md:h-8 text-red-600 mb-2 md:mb-3 mx-auto sm:mx-0" />
              <h4 className="font-bold text-sm md:text-lg mb-1">Birthday Buddy</h4>
              <p className="text-xs md:text-sm text-gray-600 hidden sm:block">Get matched with a birthday twin</p>
            </button>

            <button
              onClick={() => router.push('/settings')}
              className="glass-effect rounded-xl md:rounded-2xl p-4 md:p-6 hover:shadow-xl transition-all text-center sm:text-left"
            >
              <Settings className="w-6 h-6 md:w-8 md:h-8 text-blue-600 mb-2 md:mb-3 mx-auto sm:mx-0" />
              <h4 className="font-bold text-sm md:text-lg mb-1">Settings</h4>
              <p className="text-xs md:text-sm text-gray-600 hidden sm:block">Update profile picture & preferences</p>
            </button>

            {/* Admin Dashboard Link - Only visible to admins */}
            {user.is_admin && (
              <button
                onClick={() => router.push('/admin')}
                className="glass-effect rounded-xl md:rounded-2xl p-4 md:p-6 hover:shadow-xl transition-all text-center sm:text-left border-2 border-yellow-400"
              >
                <BarChart3 className="w-6 h-6 md:w-8 md:h-8 text-yellow-600 mb-2 md:mb-3 mx-auto sm:mx-0" />
                <h4 className="font-bold text-sm md:text-lg mb-1">Admin Dashboard</h4>
                <p className="text-xs md:text-sm text-gray-600 hidden sm:block">Platform monitoring & analytics</p>
              </button>
            )}
          </div>
        </main>
        
        {/* Mobile Bottom Navigation */}
        <MobileBottomNav show={isMobile} />
      </div>
    </AuthProvider>
  );
}

