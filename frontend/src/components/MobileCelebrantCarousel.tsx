'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Cake, Sparkles } from 'lucide-react';
import { normalizeImageUrl } from '@/utils/images';

interface Celebrant {
  id: number;
  first_name: string;
  profile_picture_url: string;
  country: string;
}

interface MobileCelebrantCarouselProps {
  celebrants: Celebrant[];
  totalCount?: number;
}

export function MobileCelebrantCarousel({ celebrants, totalCount }: MobileCelebrantCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCelebrants, setVisibleCelebrants] = useState<Celebrant[]>([]);
  const [direction, setDirection] = useState(0);
  const constraintsRef = useRef(null);

  // Haptic feedback (if supported)
  const triggerHaptic = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  // Handle swipe gesture
  const handleDragEnd = (event: any, info: PanInfo) => {
    const swipeThreshold = 50;
    
    if (info.offset.x > swipeThreshold) {
      // Swipe right - go to previous
      setDirection(-1);
      setCurrentIndex((prev) => (prev - 1 + celebrants.length) % celebrants.length);
      triggerHaptic();
    } else if (info.offset.x < -swipeThreshold) {
      // Swipe left - go to next
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % celebrants.length);
      triggerHaptic();
    }
  };

  useEffect(() => {
    if (celebrants.length === 0) return;

    // Show 3 celebrants at a time (previous, current, next)
    const getVisibleCelebrants = () => {
      const prev = celebrants[(currentIndex - 1 + celebrants.length) % celebrants.length];
      const current = celebrants[currentIndex];
      const next = celebrants[(currentIndex + 1) % celebrants.length];
      return [prev, current, next];
    };

    setVisibleCelebrants(getVisibleCelebrants());

    // Auto-advance every 3 seconds
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % celebrants.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [celebrants, currentIndex]);

  if (celebrants.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 px-4">
        <div className="text-center space-y-4">
          <p className="text-2xl">🎂</p>
          <p className="text-gray-500 font-medium">No celebrants today yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-96 overflow-hidden px-2 sm:px-4 py-8 touch-pan-y" ref={constraintsRef}>
      {/* Total count banner */}
      {(totalCount ?? 0) > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 left-1/2 -translate-x-1/2 z-10"
        >
          <div className="glass-effect px-6 py-2 rounded-full shadow-lg flex items-center gap-2">
            <Cake className="w-4 h-4 text-primary-600" />
            <span className="font-bold gradient-text text-lg">{totalCount ?? 0}</span>
            <span className="text-sm text-gray-600">celebrating</span>
          </div>
        </motion.div>
      )}

      {/* Horizontal orbital carousel with swipe support */}
      <motion.div 
        className="relative w-full h-full flex items-center justify-center perspective-1000"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
      >
        <AnimatePresence mode="sync" custom={direction}>
          {visibleCelebrants.map((celebrant, index) => {
            const position = index - 1; // -1 = left, 0 = center, 1 = right
            const isCenter = position === 0;
            
            return (
              <motion.div
                key={`${celebrant.id}-${currentIndex}-${index}`}
                className="absolute"
                initial={{
                  x: -400,
                  scale: 0.5,
                  rotateY: -90,
                  z: -200,
                  opacity: 0,
                }}
                animate={{
                  x: position * 140, // Spacing between cards
                  scale: isCenter ? 1.2 : 0.7,
                  rotateY: position * 25, // Slight 3D rotation
                  z: isCenter ? 100 : -100, // Pop out effect for center
                  opacity: isCenter ? 1 : 0.4,
                }}
                exit={{
                  x: 400,
                  scale: 0.5,
                  rotateY: 90,
                  z: -200,
                  opacity: 0,
                }}
                transition={{
                  type: "spring",
                  stiffness: 100,
                  damping: 20,
                  duration: 0.6,
                }}
                style={{
                  transformStyle: 'preserve-3d',
                }}
              >
                {/* Card container with 3D effect */}
                <motion.div
                  className="relative"
                  animate={isCenter ? {
                    y: [0, -10, 0],
                  } : {}}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  {/* Glow effect for center card */}
                  {isCenter && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-400 via-pink-400 to-purple-400 blur-xl"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.6, 0.3],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                    />
                  )}
                  
                  {/* Profile picture */}
                  <div className="relative">
                    <img
                      src={normalizeImageUrl(celebrant.profile_picture_url)}
                      alt={celebrant.first_name}
                      className={`rounded-full object-cover shadow-2xl border-4 ${
                        isCenter 
                          ? 'w-32 h-32 border-white' 
                          : 'w-24 h-24 border-white/50'
                      }`}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(celebrant.first_name)}&background=6366f1&color=fff&size=128`;
                      }}
                    />
                    
                    {/* Name badge */}
                    {isCenter && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap"
                      >
                        <div className="glass-effect px-4 py-2 rounded-full shadow-lg">
                          <p className="font-bold text-gray-800">{celebrant.first_name}</p>
                          <p className="text-xs text-gray-500">{celebrant.country}</p>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Sparkle effects for center */}
                  {isCenter && (
                    <>
                      <motion.div
                        className="absolute -top-2 -right-2"
                        animate={{
                          scale: [1, 1.5, 1],
                          rotate: [0, 180, 360],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                        }}
                      >
                        ✨
                      </motion.div>
                      <motion.div
                        className="absolute -bottom-2 -left-2"
                        animate={{
                          scale: [1, 1.5, 1],
                          rotate: [360, 180, 0],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: 1,
                        }}
                      >
                        🎉
                      </motion.div>
                    </>
                  )}
                </motion.div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* Progress indicator dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {celebrants.slice(0, Math.min(celebrants.length, 10)).map((_, idx) => (
          <motion.div
            key={idx}
            className={`w-2 h-2 rounded-full transition-all ${
              idx === currentIndex % 10 
                ? 'bg-primary-600 w-6' 
                : 'bg-gray-300'
            }`}
            animate={{
              scale: idx === currentIndex % 10 ? 1.2 : 1,
            }}
          />
        ))}
        {celebrants.length > 10 && (
          <span className="text-xs text-gray-500 ml-2">
            +{celebrants.length - 10}
          </span>
        )}
      </div>

      {/* Swipe instruction (shows briefly) */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ delay: 4, duration: 1 }}
        className="absolute bottom-16 left-1/2 -translate-x-1/2 text-sm text-gray-400 flex items-center gap-2"
      >
        <span>👈</span>
        <span>Swipe or auto-play</span>
        <span>👉</span>
      </motion.div>
    </div>
  );
}

