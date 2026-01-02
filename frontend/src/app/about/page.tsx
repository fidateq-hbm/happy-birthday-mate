'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Cake, Heart, Users, Sparkles, Globe, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { MobileAppHeader } from '@/components/MobileAppHeader';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { useAuthStore } from '@/store/authStore';

const VALUES = [
  {
    icon: Heart,
    title: 'No One Celebrates Alone',
    description: 'Every birthday deserves to be celebrated with a community of people who share your special day.',
    color: 'from-red-500 to-pink-500',
  },
  {
    icon: Users,
    title: 'Global Connection',
    description: 'Connect with birthday mates from around the world, creating meaningful connections across cultures.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Sparkles,
    title: 'Ritual-Based Celebration',
    description: 'Transform birthdays from simple dates into meaningful rituals that bring people together.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Globe,
    title: 'Inclusive & Safe',
    description: 'A welcoming space where everyone can celebrate their birthday in a safe, respectful environment.',
    color: 'from-green-500 to-emerald-500',
  },
];

export default function AboutPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Mobile App Header */}
      <MobileAppHeader show={isMobile} title="About Us" />

      {/* Desktop Header */}
      {!isMobile && (
        <header className="glass-effect border-b border-white/20 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
            <button
              onClick={() => router.push(user ? '/dashboard' : '/')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold gradient-text">About Us</h1>
          </div>
        </header>
      )}

      <main className={`max-w-6xl mx-auto ${isMobile ? 'px-4 pt-20 pb-24' : 'px-4 py-12'}`}>
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 md:mb-16"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 md:w-32 md:h-32 rounded-full celebration-gradient mb-6 md:mb-8">
            <Cake className="w-12 h-12 md:w-16 md:h-16 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black gradient-text mb-4 md:mb-6">
            About Happy Birthday Mate 🎉
          </h1>
          <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            A global, ritual-based digital celebration platform where no one celebrates alone.
            We believe every birthday deserves to be shared with a community of people who understand the magic of your special day.
          </p>
        </motion.div>

        {/* Mission Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-effect rounded-3xl p-8 md:p-12 mb-12 md:mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-6 text-center">
            Our Mission
          </h2>
          <p className="text-gray-700 text-lg md:text-xl leading-relaxed text-center max-w-4xl mx-auto">
            To transform birthdays from simple calendar dates into meaningful rituals that connect people across the globe.
            We're building a platform where every person can find their birthday tribe—a community of people who share their exact birthday,
            creating bonds that transcend borders, cultures, and backgrounds.
          </p>
        </motion.div>

        {/* Values Section */}
        <div className="mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-8 md:mb-12 text-center">
            Our Values
          </h2>
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-6 md:gap-8`}>
            {VALUES.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="glass-effect rounded-2xl p-6 md:p-8 hover:shadow-xl transition-all"
                >
                  <div className={`w-16 h-16 md:w-20 md:h-20 rounded-xl bg-gradient-to-br ${value.color} flex items-center justify-center mb-4 md:mb-6`}>
                    <Icon className="w-8 h-8 md:w-10 md:h-10 text-white" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold gradient-text mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                    {value.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Story Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-effect rounded-3xl p-8 md:p-12 mb-12 md:mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-6 text-center">
            Our Story
          </h2>
          <div className="space-y-6 text-gray-700 text-base md:text-lg leading-relaxed max-w-4xl mx-auto">
            <p>
              Happy Birthday Mate was born from a simple observation: birthdays are universal, but the way we celebrate them shouldn't be limited by geography or circumstance.
              We envisioned a platform where finding someone who shares your exact birthday is just the beginning of a beautiful connection.
            </p>
            <p>
              Our platform brings together people from all walks of life—whether you're celebrating your 18th or 80th birthday, whether you're in New York or Nairobi,
              whether you prefer quiet celebrations or grand parties. Here, you're part of a tribe that understands the significance of your special day.
            </p>
            <p>
              Through Birthday Walls, Tribe Rooms, digital gifts, and meaningful connections, we're creating a space where every birthday becomes a ritual worth celebrating,
              and every celebrant finds their community.
            </p>
          </div>
        </motion.div>

        {/* Features Highlight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass-effect rounded-3xl p-8 md:p-12 text-center border-2 border-primary-200"
        >
          <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-6">
            Join the Celebration! 🎈
          </h2>
          <p className="text-gray-600 text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            Ready to find your birthday tribe and celebrate with the world?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!user ? (
              <>
                <button
                  onClick={() => router.push('/signup')}
                  className="celebration-gradient text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-xl transition-all transform hover:scale-105"
                >
                  Sign Up Free
                </button>
                <button
                  onClick={() => router.push('/login')}
                  className="bg-white text-primary-600 border-2 border-primary-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-primary-50 transition-all"
                >
                  Log In
                </button>
              </>
            ) : (
              <button
                onClick={() => router.push('/dashboard')}
                className="celebration-gradient text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                Go to Dashboard
              </button>
            )}
          </div>
        </motion.div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12 md:mt-16 text-center"
        >
          <p className="text-gray-600 mb-4">
            Have questions or want to get in touch?
          </p>
          <a
            href="/contact"
            className="text-primary-600 hover:text-primary-700 font-semibold text-lg hover:underline"
          >
            Contact Us →
          </a>
        </motion.div>
      </main>

      {/* Mobile Bottom Navigation */}
      {user && <MobileBottomNav show={isMobile} />}
    </div>
  );
}

