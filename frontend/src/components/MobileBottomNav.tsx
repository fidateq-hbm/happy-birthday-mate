'use client';

import { Home, Users, Gift, User, Settings } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface MobileBottomNavProps {
  show?: boolean;
}

export function MobileBottomNav({ show = true }: MobileBottomNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  if (!show) return null;

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Users, label: 'Tribe', path: '/tribe' },
    { icon: Gift, label: 'Gifts', path: '/gifts' },
    { icon: User, label: 'Profile', path: '/dashboard' },
  ];

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="bg-white/95 backdrop-blur-xl border-t border-gray-200 shadow-2xl">
        <div className="flex items-center justify-around px-2 py-3">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            
            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all relative"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-primary-50 rounded-xl"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon
                  className={`w-6 h-6 relative z-10 transition-colors ${
                    isActive ? 'text-primary-600' : 'text-gray-400'
                  }`}
                />
                <span
                  className={`text-xs font-medium relative z-10 transition-colors ${
                    isActive ? 'text-primary-600' : 'text-gray-500'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
}

