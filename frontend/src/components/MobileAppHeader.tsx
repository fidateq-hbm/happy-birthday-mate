'use client';

import { Cake, Search, LogOut, MoreVertical } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import { NotificationDropdown } from './NotificationDropdown';
import toast from 'react-hot-toast';

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
  const router = useRouter();
  const { logout, user } = useAuthStore();
  const [showMenu, setShowMenu] = useState(false);

  if (!show) return null;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      logout();
      toast.success('Logged out successfully');
      router.push('/');
      setShowMenu(false);
    } catch (error) {
      toast.error('Failed to log out');
      setShowMenu(false);
    }
  };

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
          <div className="flex items-center gap-2 relative">
            {showSearch && (
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Search className="w-5 h-5 text-gray-600" />
              </button>
            )}
            <NotificationDropdown isMobile={true} />
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Menu"
                >
                  <MoreVertical className="w-5 h-5 text-gray-600" />
                </button>
                {showMenu && (
                  <>
                    {/* Backdrop to close menu */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowMenu(false)}
                    />
                    {/* Menu dropdown */}
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors text-left"
                      >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Log Out</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
}

