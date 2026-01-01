'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, X, Gift, Users, Cake, Heart, MessageSquare, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { daysUntilBirthday, isBirthdayToday } from '@/utils/dates';

interface Notification {
  id: string;
  type: 'birthday' | 'tribe' | 'buddy' | 'gift' | 'wall' | 'reminder';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  icon: React.ReactNode;
}

export function NotificationDropdown({ isMobile = false }: { isMobile?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user } = useAuthStore();

  // Generate notifications based on user state
  useEffect(() => {
    if (!user) return;

    const newNotifications: Notification[] = [];
    
    // Extract birthday info
    const birthDate = new Date(user.date_of_birth);
    const birthMonth = birthDate.getMonth() + 1;
    const birthDay = birthDate.getDate();
    const daysUntil = daysUntilBirthday(birthMonth, birthDay);
    const isBirthday = isBirthdayToday(birthMonth, birthDay);

    // Birthday today notification
    if (isBirthday) {
      newNotifications.push({
        id: 'birthday-today',
        type: 'birthday',
        title: '🎉 Happy Birthday!',
        message: 'Your birthday tribe room is now open! Celebrate with your birthday mates.',
        timestamp: new Date(),
        read: false,
        actionUrl: '/dashboard',
        icon: <Cake className="w-5 h-5 text-yellow-500" />
      });
    }

    // Birthday countdown notifications
    if (!isBirthday) {
      if (daysUntil === 1) {
        newNotifications.push({
          id: 'birthday-tomorrow',
          type: 'reminder',
          title: 'Birthday Tomorrow! 🎂',
          message: 'Your birthday is tomorrow! Your tribe room will open at midnight.',
          timestamp: new Date(),
          read: false,
          actionUrl: '/dashboard',
          icon: <Sparkles className="w-5 h-5 text-purple-500" />
        });
      } else if (daysUntil <= 7 && daysUntil > 1) {
        newNotifications.push({
          id: 'birthday-week',
          type: 'reminder',
          title: `${daysUntil} Days Until Your Birthday`,
          message: `Get ready to celebrate with your tribe: ${user.tribe_id}`,
          timestamp: new Date(),
          read: false,
          actionUrl: '/dashboard',
          icon: <Cake className="w-5 h-5 text-pink-500" />
        });
      }
    }

    // Birthday buddy notification (if matched)
    // This would come from API in production
    // For now, we'll check if user has a buddy
    // You can enhance this by calling the buddy API

    // Digital gifts notification placeholder
    // In production, this would come from API
    // newNotifications.push({
    //   id: 'gift-received',
    //   type: 'gift',
    //   title: 'Digital Gift Received! 🎁',
    //   message: 'You received a digital gift from a birthday mate!',
    //   timestamp: new Date(),
    //   read: false,
    //   actionUrl: '/gifts',
    //   icon: <Gift className="w-5 h-5 text-pink-500" />
    // });

    setNotifications(newNotifications);
    setUnreadCount(newNotifications.filter(n => !n.read).length);
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    setNotifications(prev =>
      prev.map(n =>
        n.id === notification.id ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
    setIsOpen(false);

    // Navigate if action URL exists
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 hover:bg-gray-100 rounded-full transition-colors ${
          isMobile ? '' : 'md:p-2'
        }`}
        aria-label="Notifications"
      >
        <Bell className={`${isMobile ? 'w-5 h-5' : 'w-5 h-5'} text-gray-600`} />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"
          />
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for mobile */}
            {isMobile && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/20 z-40"
                onClick={() => setIsOpen(false)}
              />
            )}

            {/* Dropdown Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 ${
                isMobile ? 'fixed top-16 right-4' : 'top-full'
              } max-h-[80vh] overflow-hidden flex flex-col`}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-bold gradient-text">Notifications</h3>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Notifications List */}
              <div className="overflow-y-auto flex-1">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No notifications yet</p>
                    <p className="text-gray-400 text-xs mt-1">
                      You'll see updates about your birthday, tribe, and gifts here
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {notifications.map((notification) => (
                      <motion.button
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                          !notification.read ? 'bg-blue-50/50' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`flex-shrink-0 mt-0.5 ${!notification.read ? 'opacity-100' : 'opacity-60'}`}>
                            {notification.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className={`text-sm font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                {notification.title}
                              </p>
                              {!notification.read && (
                                <span className="flex-shrink-0 w-2 h-2 bg-primary-600 rounded-full mt-1.5" />
                              )}
                            </div>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                              {formatTime(notification.timestamp)}
                            </p>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

