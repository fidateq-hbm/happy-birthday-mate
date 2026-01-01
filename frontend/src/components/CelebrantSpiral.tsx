'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Cake, PartyPopper, Heart, Gift } from 'lucide-react';
import { normalizeImageUrl } from '@/utils/images';

interface Celebrant {
  id: number;
  first_name: string;
  profile_picture_url: string;
  country: string;
}

interface CelebrantSpiralProps {
  celebrants: Celebrant[];
  totalCount?: number;
}

export function CelebrantSpiral({ celebrants, totalCount }: CelebrantSpiralProps) {
  const [rotation, setRotation] = useState(0);
  const [timeUntilRefresh, setTimeUntilRefresh] = useState(30);
  const [messageIndex, setMessageIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile on mount
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const celebrationMessages = [
    "🎉 Celebrating Together!",
    "🌍 Birthdays Worldwide",
    "🎂 Special Day Magic",
    "✨ No One Celebrates Alone",
    "💝 Birthday Joy",
    "🎊 Global Celebration"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation((prev) => (prev + 0.5) % 360);
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // Countdown timer for refresh
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeUntilRefresh((prev) => {
        if (prev <= 1) {
          return 30; // Reset to 30 seconds
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Rotate messages every 5 seconds
  useEffect(() => {
    const messageTimer = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % celebrationMessages.length);
    }, 5000);

    return () => clearInterval(messageTimer);
  }, []);

  if (celebrants.length === 0) {
    return (
      <div className={`flex items-center justify-center ${isMobile ? 'h-64' : 'h-96'}`}>
        <div className="text-center space-y-4">
          <p className="text-2xl text-gray-400">🎂</p>
          <p className="text-gray-500 font-medium">No celebrants for today yet</p>
          <p className="text-sm text-gray-400">Be the first to join this birthday tribe!</p>
        </div>
      </div>
    );
  }

  // On mobile, show simplified version (handled by parent)
  if (isMobile) {
    return null; // Parent component will show MobileCelebrantCarousel instead
  }

  const displayCount = Math.min(celebrants.length, 24); // Max 24 visible at once
  const radius = 200;
  const angleStep = (2 * Math.PI) / displayCount;

  return (
    <div className="relative w-full h-[500px] flex items-center justify-center mb-8">
      {/* Center display with dynamic content */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div 
          className="text-center space-y-3 glass-effect p-8 rounded-full w-48 h-48 flex flex-col items-center justify-center shadow-2xl border-4 border-white/50"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
        >
          {/* Animated icon that changes */}
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1.1, 1]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatDelay: 1
            }}
          >
            <Cake className="w-12 h-12 text-primary-600" />
          </motion.div>

          {/* Total count */}
          {(totalCount ?? 0) > 0 && (
            <div className="space-y-1">
              <motion.p 
                className="text-4xl font-black gradient-text"
                key={totalCount}
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring" }}
              >
                {totalCount ?? 0}
              </motion.p>
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Celebrating
              </p>
            </div>
          )}

          {/* Rotating celebration messages */}
          <AnimatePresence mode="wait">
            <motion.p
              key={messageIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className="text-xs font-medium text-gray-500"
            >
              {celebrationMessages[messageIndex]}
            </motion.p>
          </AnimatePresence>

          {/* Countdown to refresh */}
          {(totalCount ?? 0) > displayCount && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-xs text-gray-400 flex items-center gap-1"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                ⟳
              </motion.div>
              {timeUntilRefresh}s
            </motion.div>
          )}
        </motion.div>

        {/* Floating particles around center */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: '50%',
              top: '50%',
            }}
            animate={{
              x: [0, Math.cos(i * 60 * Math.PI / 180) * 120],
              y: [0, Math.sin(i * 60 * Math.PI / 180) * 120],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeOut"
            }}
          >
            {i % 3 === 0 ? '✨' : i % 3 === 1 ? '🎈' : '🎉'}
          </motion.div>
        ))}
      </div>

      {celebrants.slice(0, displayCount).map((celebrant, index) => {
        const angle = angleStep * index + (rotation * Math.PI) / 180;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        return (
          <motion.div
            key={`${celebrant.id}-${index}`}
            className="absolute"
            style={{
              left: `calc(50% + ${x}px)`,
              top: `calc(50% + ${y}px)`,
              transform: 'translate(-50%, -50%)',
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.2, zIndex: 10 }}
          >
            <div className="relative group">
              <img
                src={normalizeImageUrl(celebrant.profile_picture_url)}
                alt={celebrant.first_name}
                className="w-20 h-20 rounded-full border-4 border-white shadow-xl object-cover transition-transform"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(celebrant.first_name)}&background=6366f1&color=fff&size=128`;
                }}
              />
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap glass-effect px-3 py-1 rounded-lg text-sm font-medium">
                {celebrant.first_name}
                <div className="text-xs text-gray-500">{celebrant.country}</div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

