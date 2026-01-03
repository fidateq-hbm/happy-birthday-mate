'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Cake, Gift, Image, Users, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

function InvitePageContent() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuthStore();
  const [wallInfo, setWallInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const inviteCode = params.code as string;

  useEffect(() => {
    if (authLoading) return;

    // Fetch wall info to show celebrant name (works without auth)
    const fetchWallInfo = async () => {
      try {
        const { roomAPI } = await import('@/lib/api');
        const response = await roomAPI.getBirthdayWall(inviteCode);
        setWallInfo(response.data);
      } catch (err: any) {
        console.error('Error fetching wall:', err);
        setError('Invalid invitation link');
      } finally {
        setLoading(false);
      }
    };

    fetchWallInfo();
  }, [inviteCode, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🎂</div>
          <h1 className="text-2xl font-bold gradient-text mb-4">Invalid Invitation</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/"
            className="celebration-gradient text-white px-6 py-3 rounded-xl font-semibold inline-block hover:shadow-lg transition-all"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  const celebrantName = wallInfo?.owner_name || 'a friend';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              rotate: [0, 360],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          >
            {['🎂', '🎈', '🎁', '🎉', '✨'][Math.floor(Math.random() * 5)]}
          </motion.div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl w-full"
        >
          <div className="glass-effect rounded-3xl p-8 md:p-12 shadow-2xl bg-white/95 backdrop-blur-lg">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="text-8xl mb-4"
              >
                🎉
              </motion.div>
              <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-4">
                You're Invited to Celebrate!
              </h1>
              <p className="text-xl text-gray-700">
                <strong className="text-primary-600">{celebrantName}</strong> has invited you to join their birthday celebration on Happy Birthday Mate!
              </p>
            </div>

            {/* What You Can Do */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Join the Celebration and:
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200"
                >
                  <Image className="w-8 h-8 text-purple-600 mb-3" />
                  <h3 className="font-bold text-lg mb-2">Upload Photos</h3>
                  <p className="text-gray-700 text-sm">
                    Share your favorite memories and photos with {celebrantName} on their special day!
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200"
                >
                  <Gift className="w-8 h-8 text-blue-600 mb-3" />
                  <h3 className="font-bold text-lg mb-2">Send Digital Gifts</h3>
                  <p className="text-gray-700 text-sm">
                    Send confetti, badges, wall highlights, and other digital gifts to make their day extra special!
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border-2 border-yellow-200"
                >
                  <Users className="w-8 h-8 text-yellow-600 mb-3" />
                  <h3 className="font-bold text-lg mb-2">Join the Tribe</h3>
                  <p className="text-gray-700 text-sm">
                    Connect with others who share the same birthday and celebrate together!
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200"
                >
                  <Sparkles className="w-8 h-8 text-green-600 mb-3" />
                  <h3 className="font-bold text-lg mb-2">Create Your Wall</h3>
                  <p className="text-gray-700 text-sm">
                    When it's your birthday, create your own wall and invite friends to celebrate with you!
                  </p>
                </motion.div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-4">
              {user ? (
                <Link
                  href={`/birthday-wall/${inviteCode}`}
                  className="block w-full celebration-gradient text-white py-4 rounded-xl font-bold text-lg text-center hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  Go to {celebrantName}'s Wall 🎉
                  <ArrowRight className="w-5 h-5" />
                </Link>
              ) : (
                <>
                  <Link
                    href={`/signup?redirect=/birthday-wall/${inviteCode}`}
                    className="block w-full celebration-gradient text-white py-4 rounded-xl font-bold text-lg text-center hover:shadow-xl transition-all flex items-center justify-center gap-2"
                  >
                    Sign Up - It's Free! 🎂
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    href={`/login?redirect=/birthday-wall/${inviteCode}`}
                    className="block w-full text-center text-primary-600 font-semibold hover:text-primary-700 transition-colors"
                  >
                    Already have an account? Sign in
                  </Link>
                </>
              )}
            </div>

            {/* Footer Note */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                By signing up, you'll be able to join {celebrantName}'s birthday celebration and create your own when it's your special day!
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function InvitePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <InvitePageContent />
    </Suspense>
  );
}

