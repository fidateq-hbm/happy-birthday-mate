'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { Users, MessageSquare, Sparkles, Heart, Gift, Calendar, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { MobileAppHeader } from '@/components/MobileAppHeader';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { isBirthdayToday } from '@/utils/dates';
import { buddyAPI } from '@/lib/api';

export default function BuddyPage() {
  const router = useRouter();
  const { user, loading } = useAuthStore();
  const [isMobile, setIsMobile] = useState(false);
  const [hasBuddy, setHasBuddy] = useState(false);
  const [buddyInfo, setBuddyInfo] = useState<any>(null);
  const [isLoadingBuddy, setIsLoadingBuddy] = useState(true);
  const [isMatching, setIsMatching] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);

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

  // Fetch buddy status from API
  const fetchBuddyStatus = async () => {
    if (!user) return;
    
    setIsLoadingBuddy(true);
    try {
      const response = await buddyAPI.getBuddyStatus(user.id);
      const status = response.data;
      
      setHasBuddy(status.has_buddy);
      if (status.has_buddy) {
        setBuddyInfo({
          buddy_id: status.buddy_id,
          buddy_name: status.buddy_name,
          buddy_photo: status.buddy_photo,
          is_accepted: status.is_accepted,
          is_revealed: status.is_revealed,
          room_id: status.room_id,
        });
      } else {
        setBuddyInfo(null);
      }
    } catch (error: any) {
      console.error('Error fetching buddy status:', error);
      // Don't show error toast - just set to no buddy
      setHasBuddy(false);
      setBuddyInfo(null);
    } finally {
      setIsLoadingBuddy(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBuddyStatus();
    }
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const isBirthday = isBirthdayToday(user.birth_month, user.birth_day);

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
                <Users className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold gradient-text">Birthday Buddy</h1>
            </div>
          </header>
        )}

        <main className={`max-w-4xl mx-auto ${isMobile ? 'p-4 pt-20 pb-24' : 'p-4 py-8'}`}>
          {isMobile && (
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
            >
              ← Back
            </button>
          )}

          {/* Feature Explanation */}
          <div className="glass-effect rounded-3xl p-6 md:p-8 space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-pink-400 mb-4">
                <Heart className="w-10 h-10 text-white" />
              </div>
              <h1 className={`font-bold gradient-text mb-2 ${isMobile ? 'text-2xl' : 'text-4xl'}`}>
                Birthday Buddy
              </h1>
              <p className={`text-gray-600 ${isMobile ? 'text-sm' : 'text-base'}`}>
                Get matched with a special birthday twin for 1-on-1 celebration
              </p>
            </div>

            {/* How It Works */}
            <div className="space-y-4">
              <h2 className={`font-bold ${isMobile ? 'text-lg' : 'text-xl'}`}>How It Works</h2>
              <div className="space-y-3">
                {[
                  {
                    icon: Calendar,
                    title: 'Automatic Matching',
                    description: 'On your birthday, we automatically pair you with another celebrant from your tribe.',
                    color: 'text-primary-600'
                  },
                  {
                    icon: MessageSquare,
                    title: 'Private Chat',
                    description: 'Start chatting with your birthday buddy in a private 1-on-1 room.',
                    color: 'text-blue-600'
                  },
                  {
                    icon: Sparkles,
                    title: 'Special Connection',
                    description: 'Celebrate together and create a unique birthday memory with your twin.',
                    color: 'text-pink-600'
                  }
                ].map((step, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className={`p-2 rounded-lg bg-white ${step.color}`}>
                      <step.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold mb-1 ${isMobile ? 'text-sm' : ''}`}>{step.title}</h3>
                      <p className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Status */}
            {isBirthday ? (
              <div className="celebration-gradient rounded-2xl p-6 text-white text-center">
                <Sparkles className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">It&apos;s Your Birthday! 🎉</h3>
                
                {isLoadingBuddy ? (
                  <div className="flex items-center justify-center gap-2 py-4">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <p>Loading buddy status...</p>
                  </div>
                ) : hasBuddy && buddyInfo ? (
                  <>
                    {buddyInfo.is_accepted ? (
                      <>
                        {buddyInfo.is_revealed && buddyInfo.buddy_name ? (
                          <>
                            <div className="mb-4">
                              <img
                                src={buddyInfo.buddy_photo || '/default-avatar.png'}
                                alt={buddyInfo.buddy_name}
                                className="w-20 h-20 rounded-full mx-auto mb-2 border-2 border-white"
                              />
                              <p className="text-lg font-semibold">{buddyInfo.buddy_name}</p>
                              <p className="text-sm opacity-90">Your Birthday Buddy!</p>
                            </div>
                            {buddyInfo.room_id ? (
                              <button
                                onClick={() => {
                                  // Navigate to buddy chat room
                                  // Using the same pattern as tribe rooms but for buddy
                                  router.push(`/buddy/room/${buddyInfo.room_id}`);
                                }}
                                className="bg-white text-primary-700 px-6 py-3 rounded-xl font-semibold hover:shadow-xl transition-all"
                              >
                                Chat with {buddyInfo.buddy_name} 💬
                              </button>
                            ) : (
                              <p className="text-sm opacity-75">Room is being created...</p>
                            )}
                          </>
                        ) : (
                          <>
                            <p className="mb-4">You have a birthday buddy! Accept to reveal who it is.</p>
                            <div className="flex gap-3 justify-center">
                              <button
                                onClick={async () => {
                                  if (!user) return;
                                  setIsAccepting(true);
                                  try {
                                    await buddyAPI.acceptBuddy(user.id, true);
                                    toast.success('Buddy accepted! 🎉');
                                    await fetchBuddyStatus();
                                  } catch (error: any) {
                                    console.error('Error accepting buddy:', error);
                                    toast.error('Failed to accept buddy. Please try again.');
                                  } finally {
                                    setIsAccepting(false);
                                  }
                                }}
                                disabled={isAccepting}
                                className="bg-white text-primary-700 px-6 py-3 rounded-xl font-semibold hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isAccepting ? (
                                  <span className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Accepting...
                                  </span>
                                ) : (
                                  'Accept Buddy ✨'
                                )}
                              </button>
                              <button
                                onClick={async () => {
                                  if (!user) return;
                                  setIsAccepting(true);
                                  try {
                                    await buddyAPI.acceptBuddy(user.id, false);
                                    toast.success('Buddy request declined.');
                                    await fetchBuddyStatus();
                                  } catch (error: any) {
                                    console.error('Error declining buddy:', error);
                                    toast.error('Failed to decline buddy. Please try again.');
                                  } finally {
                                    setIsAccepting(false);
                                  }
                                }}
                                disabled={isAccepting}
                                className="bg-white/20 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Decline
                              </button>
                            </div>
                          </>
                        )}
                      </>
                    ) : (
                      <p className="mb-4">Waiting for your buddy to accept...</p>
                    )}
                  </>
                ) : (
                  <>
                    <p className="mb-4">Find your perfect birthday buddy match!</p>
                    <button
                      onClick={async () => {
                        if (!user) return;
                        setIsMatching(true);
                        try {
                          const response = await buddyAPI.matchBuddy(user.id);
                          const data = response.data;
                          
                          if (data.matched) {
                            toast.success('Birthday buddy matched! 🎉');
                            await fetchBuddyStatus();
                          } else {
                            toast.info(data.message || 'No match found yet. We\'ll notify you when someone with your birthday joins!');
                          }
                        } catch (error: any) {
                          console.error('Error matching buddy:', error);
                          toast.error('Failed to find a match. Please try again.');
                        } finally {
                          setIsMatching(false);
                        }
                      }}
                      disabled={isMatching}
                      className="bg-white text-primary-700 px-6 py-3 rounded-xl font-semibold hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isMatching ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Finding Match...
                        </span>
                      ) : (
                        'Find My Birthday Buddy 🎯'
                      )}
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="glass-effect rounded-2xl p-6 text-center">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-bold mb-2">Not Your Birthday Yet</h3>
                <p className="text-gray-600 mb-4">
                  Birthday Buddy matching happens automatically on your birthday. 
                  Come back on your special day to get matched!
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Tip:</strong> Make sure your profile is complete and you&apos;re active 
                    on your birthday to increase your chances of getting a great match!
                  </p>
                </div>
              </div>
            )}

            {/* Benefits */}
            <div className="border-t border-gray-200 pt-6">
              <h2 className={`font-bold mb-4 ${isMobile ? 'text-lg' : 'text-xl'}`}>Why Birthday Buddy?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { icon: Heart, text: 'Special connection with someone sharing your exact birthday' },
                  { icon: Gift, text: 'Exchange birthday wishes and celebrate together' },
                  { icon: Users, text: 'Make a new friend from your birthday tribe' },
                  { icon: Sparkles, text: 'Create unique birthday memories' }
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <benefit.icon className={`w-5 h-5 text-primary-600 mt-0.5 ${isMobile ? 'w-4 h-4' : ''}`} />
                    <p className={`text-gray-700 ${isMobile ? 'text-xs' : 'text-sm'}`}>{benefit.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav show={isMobile && !!user} />
      </div>
    </AuthProvider>
  );
}

