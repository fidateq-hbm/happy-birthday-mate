'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smile, X } from 'lucide-react';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  isMobile?: boolean;
}

const EMOJI_CATEGORIES = {
  'Celebration': ['🎉', '🎊', '🎈', '🎁', '🎂', '🍰', '🥳', '🎆', '🎇', '✨', '🌟', '⭐', '💫', '🎪', '🎭', '🎨'],
  'Happy': ['😊', '😄', '😃', '😁', '😆', '😍', '🥰', '😘', '😗', '😙', '😚', '☺️', '🙂', '🤗', '🤩', '😎'],
  'Love': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💖', '💗', '💓', '💕', '💞', '💟', '❣️', '💝'],
  'Party': ['🎊', '🎉', '🥳', '🎈', '🎁', '🎂', '🍾', '🥂', '🍻', '🎵', '🎶', '🎤', '🎧', '🎸', '🎹', '🎺'],
  'Nature': ['🌸', '🌺', '🌻', '🌷', '🌹', '🌼', '💐', '🌿', '🍀', '🌱', '🌳', '🌲', '🌴', '🌵', '🌾', '🌿'],
  'Food': ['🍰', '🎂', '🧁', '🍪', '🍩', '🍫', '🍬', '🍭', '🍮', '🍯', '🥧', '🍕', '🍔', '🌮', '🌯', '🍟'],
  'Symbols': ['✨', '🌟', '⭐', '💫', '🔥', '💯', '✅', '👍', '👏', '🙌', '👋', '🤝', '🤞', '✌️', '🤟', '🤘'],
};

export function EmojiPicker({ onEmojiSelect, isMobile = false }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<keyof typeof EMOJI_CATEGORIES>('Celebration');
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji);
    // Keep picker open for quick selection, but close on mobile after selection
    if (isMobile) {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={pickerRef}>
      <motion.button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className={`flex items-center justify-center rounded-xl transition-all ${
          isOpen
            ? 'bg-primary-100 text-primary-700'
            : 'bg-white/80 hover:bg-white text-gray-600 hover:text-primary-600'
        } ${isMobile ? 'w-10 h-10' : 'w-11 h-11'} border-2 border-white/50 shadow-lg backdrop-blur-sm`}
      >
        <Smile className={isMobile ? 'w-5 h-5' : 'w-6 h-6'} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-black/20"
            />
            {/* Picker */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className={`fixed ${isMobile ? 'bottom-32 left-1/2 -translate-x-1/2 max-h-[50vh]' : 'bottom-20 right-4 max-h-[70vh]'} z-50 glass-effect rounded-3xl shadow-2xl border-2 border-white/40 backdrop-blur-xl overflow-hidden flex flex-col ${
                isMobile ? 'w-[calc(100vw-1.5rem)] max-w-sm' : 'w-80'
              }`}
            >
            {/* Header */}
            <div className="p-3 border-b border-white/20 bg-gradient-to-r from-primary-50 to-pink-50">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold gradient-text">Choose Emoji</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white/50 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              {/* Category Tabs */}
              <div className="flex gap-1 overflow-x-auto scrollbar-hide">
                {Object.keys(EMOJI_CATEGORIES).map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category as keyof typeof EMOJI_CATEGORIES)}
                    className={`px-2 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                      activeCategory === category
                        ? 'bg-primary-600 text-white shadow-lg'
                        : 'bg-white/50 text-gray-600 hover:bg-white/70'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Emoji Grid */}
            <div className="p-3 flex-1 overflow-y-auto min-h-0">
              <div className="grid grid-cols-8 gap-2">
                {EMOJI_CATEGORIES[activeCategory].map((emoji, index) => (
                  <motion.button
                    key={`${activeCategory}-${index}`}
                    onClick={() => handleEmojiClick(emoji)}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    className="text-2xl p-2 hover:bg-primary-100 rounded-lg transition-colors cursor-pointer"
                  >
                    {emoji}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

