'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { userAPI } from '@/lib/api';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { MobileAppHeader } from '@/components/MobileAppHeader';
import { Users, MapPin, Calendar, Cake, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { normalizeImageUrl } from '@/utils/images';

interface TribeMember {
  id: number;
  first_name: string;
  profile_picture_url: string;
  country: string;
  state: string;
}

export default function TribePage() {
  const router = useRouter();
  const { user, loading } = useAuthStore();
  const [tribeMembers, setTribeMembers] = useState<TribeMember[]>([]);
  const [totalMembers, setTotalMembers] = useState(0);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Only fetch if we have a user and they're not loading
    if (!loading && user && user.tribe_id) {
      fetchTribeMembers();
    }
  }, [user?.id, loading, user?.tribe_id]); // Use user?.id to avoid dependency issues

  const fetchTribeMembers = async () => {
    if (!user) return;
    
    setIsLoadingMembers(true);
    try {
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );
      
      const response = await Promise.race([
        userAPI.getTribeMembers(user.tribe_id, 50, false),
        timeoutPromise
      ]) as any;
      
      setTribeMembers(response.data.members || []);
      setTotalMembers(response.data.total_count || 0);
    } catch (error: any) {
      console.error('Error fetching tribe members:', error);
      toast.error(error.message === 'Request timeout' 
        ? 'Request took too long. Please check your connection.' 
        : 'Failed to load tribe members');
      // Set empty state so page still renders
      setTribeMembers([]);
      setTotalMembers(0);
    } finally {
      setIsLoadingMembers(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your tribe...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please log in to view your tribe</p>
          <button
            onClick={() => router.push('/login')}
            className="celebration-gradient text-white px-6 py-3 rounded-full font-semibold"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const birthDate = new Date(user.date_of_birth);
  const birthDay = birthDate.getDate();
  const monthName = birthDate.toLocaleString('default', { month: 'long' });

  return (
    <div className="min-h-screen pb-20 overflow-x-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <MobileAppHeader show={isMobile} title="My Tribe" />

      <div className={`${isMobile ? 'pt-20' : 'pt-8'} px-4 max-w-7xl mx-auto`}>
        {/* Tribe Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect rounded-3xl p-6 md:p-8 mb-6 text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Cake className="w-8 h-8 text-primary-600" />
            <h1 className="text-3xl md:text-4xl font-bold gradient-text">
              {monthName} {birthDay}
            </h1>
          </div>
          <p className="text-gray-600 mb-4">
            Your Birthday Tribe - People born on the same day as you
          </p>
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary-600" />
              <span className="font-semibold">{totalMembers} members</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-pink-600" />
              <span className="font-semibold">Tribe {user.tribe_id}</span>
            </div>
          </div>
        </motion.div>

        {/* Tribe Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-primary-50 to-pink-50 rounded-2xl p-6 mb-6"
        >
          <div className="flex items-start gap-3">
            <Sparkles className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-lg mb-2">About Birthday Tribes</h3>
              <p className="text-sm text-gray-600">
                Everyone born on {monthName} {birthDay} is part of this tribe. 
                Connect, celebrate together, and make your birthday unforgettable! 
                On your birthday, you all celebrate as one global community for 24 magical hours.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Loading State */}
        {isLoadingMembers && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
            <p className="text-gray-600 text-sm">Loading tribe members...</p>
            <p className="text-gray-400 text-xs mt-2">This may take a few seconds</p>
          </div>
        )}

        {/* Tribe Members Grid */}
        {!isLoadingMembers && tribeMembers.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary-600" />
              Tribe Members
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {tribeMembers.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-effect rounded-2xl p-4 text-center hover:shadow-xl transition-all cursor-pointer"
                  whileHover={{ y: -5 }}
                >
                  <div className="relative mb-3">
                    <img
                      src={normalizeImageUrl(member.profile_picture_url)}
                      alt={member.first_name}
                      className="w-20 h-20 rounded-full mx-auto object-cover border-4 border-white shadow-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.first_name)}&background=6366f1&color=fff&size=128`;
                      }}
                    />
                    {member.id === user.id && (
                      <div className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs px-2 py-1 rounded-full font-bold">
                        You
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold text-sm mb-1 truncate">{member.first_name}</h3>
                  <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{member.country}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {totalMembers > tribeMembers.length && (
              <div className="text-center mt-6">
                <button
                  onClick={fetchTribeMembers}
                  className="celebration-gradient text-white px-6 py-3 rounded-full font-semibold hover:shadow-xl transition-all"
                >
                  Load More Members
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Empty State */}
        {!isLoadingMembers && tribeMembers.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-effect rounded-3xl p-12 text-center"
          >
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No tribe members yet</h3>
            <p className="text-gray-500 mb-4">
              Be the first to celebrate on {monthName} {birthDay}!
            </p>
            <button
              onClick={fetchTribeMembers}
              className="celebration-gradient text-white px-6 py-3 rounded-full font-semibold hover:shadow-xl transition-all"
            >
              Refresh
            </button>
          </motion.div>
        )}
      </div>

      <MobileBottomNav show={isMobile} />
    </div>
  );
}

