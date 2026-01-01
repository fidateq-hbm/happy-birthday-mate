'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { giftAPI } from '@/lib/api';

interface ActiveGifts {
  confetti_effects: Array<{
    gift_id: number;
    gift_name: string;
    delivered_at: string;
    expires_at: string;
  }>;
  badges: Array<{
    gift_id: number;
    gift_name: string;
    badge_type: string;
    delivered_at: string;
    expires_at: string;
  }>;
  wall_highlights: Array<{
    gift_id: number;
    gift_name: string;
    delivered_at: string;
    expires_at: string;
  }>;
  featured_messages: Array<{
    gift_id: number;
    gift_name: string;
    message: string;
    sender_id: number;
    delivered_at: string;
    expires_at: string;
  }>;
  digital_cards: Array<{
    gift_id: number;
    gift_name: string;
    message: string;
    sender_id: number;
    delivered_at: string;
  }>;
}

interface DigitalGiftEffectsProps {
  userId: number;
  onActiveGiftsLoaded?: (gifts: ActiveGifts) => void;
}

export function DigitalGiftEffects({ userId, onActiveGiftsLoaded }: DigitalGiftEffectsProps) {
  const [activeGifts, setActiveGifts] = useState<ActiveGifts | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActiveGifts = async () => {
      try {
        const response = await giftAPI.getActiveGifts(userId);
        setActiveGifts(response.data);
        if (onActiveGiftsLoaded) {
          onActiveGiftsLoaded(response.data);
        }
      } catch (error) {
        console.error('Error fetching active gifts:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchActiveGifts();
      // Refresh every 30 seconds to check for new gifts
      const interval = setInterval(fetchActiveGifts, 30000);
      return () => clearInterval(interval);
    }
  }, [userId, onActiveGiftsLoaded]);

  if (loading || !activeGifts) return null;

  return (
    <>
      {/* Confetti Effects */}
      {activeGifts.confetti_effects.length > 0 && (
        <ConfettiEffect count={activeGifts.confetti_effects.length} />
      )}

      {/* Badges */}
      {activeGifts.badges.length > 0 && (
        <BadgeDisplay badge={activeGifts.badges[0]} />
      )}
    </>
  );
}

// Confetti Effect Component
function ConfettiEffect({ count }: { count: number }) {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // Trigger confetti animation
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 5000); // Show for 5 seconds

    return () => clearTimeout(timer);
  }, []);

  if (!showConfetti) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {Array.from({ length: Math.min(count * 20, 100) }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            backgroundColor: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#AA96DA'][
              Math.floor(Math.random() * 6)
            ],
          }}
          initial={{
            y: -100,
            x: 0,
            rotate: 0,
            opacity: 1,
          }}
          animate={{
            y: window.innerHeight + 100,
            x: (Math.random() - 0.5) * 200,
            rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
            opacity: 0,
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            delay: Math.random() * 0.5,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}

// Badge Display Component
function BadgeDisplay({ badge }: { badge: ActiveGifts['badges'][0] }) {
  const badgeIcons: Record<string, string> = {
    golden: '👑',
    diamond: '💎',
    platinum: '⚪',
    royal: '👑',
    star: '⭐',
    legend: '🏆',
    champion: '🥇',
    superstar: '🌟',
    hero: '🦸',
    magical: '✨',
    default: '🎖️',
  };

  const badgeColors: Record<string, string> = {
    golden: 'from-yellow-400 to-yellow-600',
    diamond: 'from-cyan-400 to-blue-600',
    platinum: 'from-gray-300 to-gray-500',
    royal: 'from-purple-400 to-purple-600',
    star: 'from-yellow-300 to-orange-500',
    legend: 'from-orange-400 to-red-600',
    champion: 'from-yellow-500 to-yellow-700',
    superstar: 'from-pink-400 to-purple-600',
    hero: 'from-blue-400 to-indigo-600',
    magical: 'from-purple-300 to-pink-500',
    default: 'from-gray-400 to-gray-600',
  };

  const icon = badgeIcons[badge.badge_type] || badgeIcons.default;
  const colorClass = badgeColors[badge.badge_type] || badgeColors.default;

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      className="absolute -top-2 -right-2 z-10"
    >
      <div className={`bg-gradient-to-br ${colorClass} rounded-full p-2 shadow-lg border-2 border-white`}>
        <span className="text-2xl">{icon}</span>
      </div>
    </motion.div>
  );
}

// Export components for use in other pages
export function WallHighlight({ hasHighlight }: { hasHighlight: boolean }) {
  if (!hasHighlight) return null;

  return (
    <div className="absolute inset-0 pointer-events-none">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="absolute inset-0 border-4 border-yellow-400 rounded-2xl shadow-[0_0_20px_rgba(255,215,0,0.6)]"
      />
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="absolute inset-0 border-2 border-yellow-300 rounded-2xl"
      />
    </div>
  );
}

export function FeaturedMessage({ message }: { message: ActiveGifts['featured_messages'][0] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className="glass-effect rounded-3xl p-5 mb-4 border-2 border-yellow-400/60 bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50 shadow-2xl backdrop-blur-xl relative overflow-hidden"
    >
      {/* Animated background sparkles */}
      <div className="absolute inset-0 opacity-20">
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-yellow-400 rounded-full"
            style={{
              left: `${20 + i * 20}%`,
              top: `${30 + i * 10}%`,
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 2,
              delay: i * 0.3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
      
      <div className="flex items-start gap-4 relative z-10">
        <motion.div
          animate={{ rotate: [0, 15, -15, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="text-3xl"
        >
          📌
        </motion.div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold text-yellow-800 bg-gradient-to-r from-yellow-300 to-orange-300 px-3 py-1.5 rounded-full shadow-lg border border-yellow-400/50">
              ⭐ FEATURED MESSAGE ⭐
            </span>
          </div>
          <p className="text-gray-900 font-bold text-lg leading-relaxed mb-2">{message.message}</p>
          <p className="text-xs text-gray-600 font-medium">🎁 From: {message.gift_name}</p>
        </div>
      </div>
    </motion.div>
  );
}

export function DigitalCardView({ card }: { card: ActiveGifts['digital_cards'][0] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.05 }}
        onClick={() => setIsOpen(true)}
        className="glass-effect rounded-2xl p-6 cursor-pointer border-2 border-primary-300 hover:border-primary-500 transition-all"
      >
        <div className="text-center">
          <div className="text-6xl mb-4">💌</div>
          <h3 className="text-xl font-bold gradient-text mb-2">{card.gift_name}</h3>
          <p className="text-sm text-gray-600">Click to open</p>
        </div>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-effect rounded-3xl p-8 max-w-md w-full text-center"
            >
              <div className="text-8xl mb-6">💌</div>
              <h2 className="text-3xl font-bold gradient-text mb-4">{card.gift_name}</h2>
              {card.message && (
                <p className="text-gray-700 text-lg mb-6 leading-relaxed">{card.message}</p>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="celebration-gradient text-white px-6 py-3 rounded-full font-semibold hover:shadow-xl transition-all"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

