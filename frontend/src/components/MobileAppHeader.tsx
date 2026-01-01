'use client';

import { Cake, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { NotificationDropdown } from './NotificationDropdown';

interface MobileAppHeaderProps {
  show?: boolean;
  title?: string;
  showSearch?: boolean;
}

export function MobileAppHeader({ 
  show = true, 
  title = "Happy Birthday Mate",
  showSearch = false 
}: MobileAppHeaderProps) {
  if (!show) return null;

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 md:hidden"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
      }}
    >
      <div className="bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-lg">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full celebration-gradient flex items-center justify-center">
              <Cake className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold gradient-text">{title}</h1>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {showSearch && (
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Search className="w-5 h-5 text-gray-600" />
              </button>
            )}
            <NotificationDropdown isMobile={true} />
          </div>
        </div>
      </div>
    </motion.header>
  );
}

