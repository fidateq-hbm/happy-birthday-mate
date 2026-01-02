'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { adminAPI, userAPI } from '@/lib/api';
import { Gift, Users, Sparkles, Calendar, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { CelebrantSpiral } from '@/components/CelebrantSpiral';
import { MobileCelebrantCarousel } from '@/components/MobileCelebrantCarousel';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { MobileAppHeader } from '@/components/MobileAppHeader';

interface Celebrity {
  id: number;
  name: string;
  photo_url: string;
  description: string;
  birth_year: number;
}

interface Celebrant {
  id: number;
  first_name: string;
  profile_picture_url: string;
  country: string;
}

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuthStore();
  const [celebrities, setCelebrities] = useState<Celebrity[]>([]);
  const [celebrantCount, setCelebrantCount] = useState(0);
  const [rotatingCelebrants, setRotatingCelebrants] = useState<Celebrant[]>([]);
  const [totalCelebrants, setTotalCelebrants] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Removed auto-redirect - allow logged-in users to view homepage
    // if (!loading && user) {
    //   router.push('/dashboard');
    // }
  }, [user, loading, router]);

  useEffect(() => {
    // Fetch today's celebrities
    adminAPI.getCelebritiesToday()
      .then(response => {
        console.log('Celebrities response:', response.data);
        const celebs = response.data?.celebrities || response.data || [];
        console.log(`Found ${celebs.length} celebrities for today`);
        setCelebrities(celebs);
      })
      .catch(error => {
        console.error('Error fetching celebrities:', error);
        console.error('Error details:', error.response?.data || error.message);
        // Set empty array on error so UI doesn't break
        setCelebrities([]);
      });

    // Fetch platform stats
    adminAPI.getStats()
      .then(response => setCelebrantCount(response.data.todays_celebrants))
      .catch(console.error);
      
    // Fetch today's celebrants for the spiral
    // Note: This would ideally be a backend endpoint that fetches random celebrants celebrating today
    // For now, we'll fetch from a tribe as a demo
    const fetchCelebrants = () => {
      const today = new Date();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const todayTribeId = `${month}-${day}`;
      
      userAPI.getTribeMembers(todayTribeId, 24, true)
        .then(response => {
          setRotatingCelebrants(response.data.members || []);
          setTotalCelebrants(response.data.total_count || 0);
        })
        .catch(err => {
          console.error('Error fetching celebrants:', err);
          setRotatingCelebrants([]);
          setTotalCelebrants(0);
        });
    };
    
    fetchCelebrants();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchCelebrants, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden w-full">
      {/* Mobile App Header */}
      <MobileAppHeader show={isMobile} />
      
      {/* Hero Section */}
      <section className={`relative overflow-hidden py-12 md:py-20 px-4 ${isMobile ? 'pt-24' : ''}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-black gradient-text mb-4 md:mb-6 px-2">
                Happy Birthday Mate
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto mb-6 md:mb-8 px-4">
                {user 
                  ? `Where no one celebrates alone. Join your birthday tribe and celebrate with the world. Welcome back, ${user.first_name}! 🎉` 
                  : 'Where no one celebrates alone. Join your birthday tribe and celebrate with the world.'}
              </p>
            </motion.div>

            {/* Show different buttons based on auth state */}
            {!user ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center px-4"
              >
                <button
                  onClick={() => router.push('/signup')}
                  className="celebration-gradient text-white px-6 md:px-8 py-3 md:py-4 rounded-full font-bold text-base md:text-lg hover:shadow-2xl transition-all transform hover:scale-105 w-full sm:w-auto max-w-xs"
                >
                  Start Celebrating 🎉
                </button>
                <button
                  onClick={() => router.push('/login')}
                  className="glass-effect px-6 md:px-8 py-3 md:py-4 rounded-full font-bold text-base md:text-lg hover:shadow-xl transition-all w-full sm:w-auto max-w-xs"
                >
                  Log In
                </button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center px-4"
              >
                <button
                  onClick={() => router.push('/dashboard')}
                  className="celebration-gradient text-white px-6 md:px-8 py-3 md:py-4 rounded-full font-bold text-base md:text-lg hover:shadow-2xl transition-all transform hover:scale-105 w-full sm:w-auto max-w-xs"
                >
                  Go to Dashboard 🎂
                </button>
                <button
                  onClick={() => router.push('/tribe')}
                  className="glass-effect px-6 md:px-8 py-3 md:py-4 rounded-full font-bold text-base md:text-lg hover:shadow-xl transition-all w-full sm:w-auto max-w-xs"
                >
                  View My Tribe 👥
                </button>
              </motion.div>
            )}

            {/* Live Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="glass-effect inline-block px-6 md:px-8 py-3 md:py-4 rounded-full mt-6 md:mt-8 mx-4"
            >
              <p className="text-base md:text-lg font-semibold">
                <span className="gradient-text text-xl md:text-2xl">{celebrantCount}</span>{' '}
                people celebrating today worldwide 🌍
              </p>
            </motion.div>
          </div>
        </div>

        {/* Floating Decorations */}
        <div className="absolute top-20 left-10 animate-float">
          <Gift className="w-12 h-12 text-primary-400 opacity-50" />
        </div>
        <div className="absolute bottom-20 right-10 animate-float" style={{ animationDelay: '1s' }}>
          <Sparkles className="w-16 h-16 text-pink-400 opacity-50" />
        </div>
        <div className="absolute top-40 right-20 animate-float" style={{ animationDelay: '2s' }}>
          <Heart className="w-10 h-10 text-red-400 opacity-50" />
        </div>
      </section>

      {/* Celebrity Birthday Twin - Show first 3 */}
      {celebrities.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="glass-effect rounded-3xl p-8"
            >
              <h2 className="text-3xl font-bold text-center mb-6 gradient-text">
                🌟 Born on This Day
              </h2>
              <div className="space-y-6">
                {celebrities.slice(0, 3).map((celeb, index) => (
                  <motion.div
                    key={celeb.id}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="flex items-center gap-6"
                  >
                    <img
                      src={celeb.photo_url}
                      alt={celeb.name}
                      className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-primary-400 flex-shrink-0"
                    />
                    <div>
                      <h3 className="text-xl md:text-2xl font-bold">{celeb.name}</h3>
                      <p className="text-gray-600 mt-2 text-sm md:text-base">{celeb.description}</p>
                      {celeb.birth_year && (
                        <p className="text-sm text-gray-500 mt-1">
                          Born {new Date().getFullYear() - celeb.birth_year} years ago ({celeb.birth_year})
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Celebrant Spiral */}
      <section className={`py-12 md:py-20 px-4 bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 overflow-hidden ${isMobile && user ? 'pb-24' : ''}`}>
        <div className="max-w-7xl mx-auto w-full">
          {/* Celebrity Spotlight */}
          {celebrities.length > 0 && (
            <div className="mb-12 md:mb-16">
              <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-center mb-6 md:mb-8 gradient-text px-4">
                🌟 Famous Birthdays Today
              </h3>
              <div className="flex flex-wrap justify-center gap-4 md:gap-8 px-2">
                {celebrities.slice(0, 3).map((celeb) => (
                  <motion.div
                    key={celeb.id}
                    className="glass-effect rounded-xl md:rounded-2xl p-4 md:p-6 w-full sm:w-auto sm:max-w-xs text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                  >
                    <img
                      src={celeb.photo_url}
                      alt={celeb.name}
                      className="w-24 h-24 md:w-32 md:h-32 rounded-full mx-auto mb-3 md:mb-4 border-4 border-primary-400 object-cover shadow-xl"
                    />
                    <h4 className="font-bold text-lg md:text-xl mb-2 gradient-text">{celeb.name}</h4>
                    <p className="text-gray-600 text-xs md:text-sm mb-2 px-2">{celeb.description}</p>
                    <p className="text-gray-500 text-xs">Born {celeb.birth_year}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
          
          {/* Spiral with total count */}
          <div className="relative w-full overflow-hidden">
            {totalCelebrants > 0 && !isMobile && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8 px-4"
              >
                <p className="text-base md:text-lg text-gray-600">
                  <span className="text-3xl md:text-4xl font-bold gradient-text">{totalCelebrants.toLocaleString()}</span>
                  <span className="block mt-2 text-gray-700 font-medium text-sm md:text-base">
                    {totalCelebrants === 1 ? 'person is' : 'people are'} celebrating today worldwide 🎂
                  </span>
                  {totalCelebrants > 30 && (
                    <span className="block mt-2 text-xs md:text-sm text-gray-500 italic">
                      Showing a random selection • Refreshes every 30 seconds
                    </span>
                  )}
                </p>
              </motion.div>
            )}
            
            {/* Desktop: Spiral | Mobile: Horizontal Carousel */}
            {isMobile ? (
              <MobileCelebrantCarousel 
                celebrants={rotatingCelebrants} 
                totalCount={totalCelebrants} 
              />
            ) : (
              <CelebrantSpiral 
                celebrants={rotatingCelebrants} 
                totalCount={totalCelebrants} 
              />
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 md:py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-12 md:mb-16 gradient-text px-4">
            Why Happy Birthday Mate?
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                icon: Users,
                title: 'Birthday Tribes',
                description: 'Connect with people who share your exact birthday. Celebrate together for 24 magical hours.',
                color: 'text-purple-600',
              },
              {
                icon: Gift,
                title: 'Digital Gifts',
                description: 'Send beautiful digital cards, effects, and gift cards to make someone\'s day special.',
                color: 'text-pink-600',
              },
              {
                icon: Calendar,
                title: 'Birthday Walls',
                description: 'Create stunning photo galleries that capture memories from your special day.',
                color: 'text-blue-600',
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="glass-effect rounded-xl md:rounded-2xl p-6 md:p-8 hover:shadow-2xl transition-all"
              >
                <feature.icon className={`w-10 h-10 md:w-12 md:h-12 ${feature.color} mb-3 md:mb-4`} />
                <h3 className="text-xl md:text-2xl font-bold mb-2 md:mb-3">{feature.title}</h3>
                <p className="text-sm md:text-base text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Only show when user is not logged in */}
      {!user && (
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="celebration-gradient rounded-3xl p-12 text-white"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ready to Never Celebrate Alone?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Join thousands celebrating birthdays together around the world.
              </p>
              <button
                onClick={() => router.push('/signup')}
                className="bg-white text-primary-700 px-10 py-4 rounded-full font-bold text-lg hover:shadow-2xl transition-all transform hover:scale-105"
              >
                Join Now - It&apos;s Free! 🎂
              </button>
            </motion.div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className={`py-12 px-4 border-t border-gray-200 ${isMobile ? 'pb-24' : ''}`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-8">
            <div>
              <h4 className="font-bold text-gray-900 mb-3">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/help" className="hover:text-primary-600 transition-colors">Help Center</Link></li>
                <li><Link href="/faq" className="hover:text-primary-600 transition-colors">FAQ</Link></li>
                <li><Link href="/contact" className="hover:text-primary-600 transition-colors">Contact Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-3">Features</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="/#features" className="hover:text-primary-600 transition-colors">Birthday Walls</a></li>
                <li><a href="/#features" className="hover:text-primary-600 transition-colors">Birthday Tribes</a></li>
                <li><a href="/#features" className="hover:text-primary-600 transition-colors">Digital Gifts</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/privacy" className="hover:text-primary-600 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-primary-600 transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-3">About</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/about" className="hover:text-primary-600 transition-colors">About Us</Link></li>
                <li><a href="mailto:support@happybirthdaymate.com" className="hover:text-primary-600 transition-colors">support@happybirthdaymate.com</a></li>
              </ul>
            </div>
          </div>
          <div className="text-center text-gray-600 border-t border-gray-200 pt-8">
            <p>&copy; 2025 Happy Birthday Mate. All rights reserved.</p>
            <p className="mt-2 text-sm">
              A platform where birthdays become rituals, not just dates. 🎉
            </p>
          </div>
        </div>
      </footer>
      
      {/* Mobile Bottom Navigation - Show when logged in */}
      <MobileBottomNav show={isMobile && !!user} />
    </div>
  );
}

