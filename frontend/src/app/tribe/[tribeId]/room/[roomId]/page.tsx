'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { tribeAPI } from '@/lib/api';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { Send, ArrowLeft, Users, Clock, Edit2, Trash2, X, Check } from 'lucide-react';
import { EmojiPicker } from '@/components/EmojiPicker';
import toast from 'react-hot-toast';
import { formatDateTime, timeAgo } from '@/utils/dates';
import { MobileAppHeader } from '@/components/MobileAppHeader';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { FeaturedMessage, DigitalGiftEffects } from '@/components/DigitalGiftEffects';
import { giftAPI } from '@/lib/api';
import { TribeRoomBackground } from '@/components/TribeRoomBackground';
import { motion } from 'framer-motion';

interface Message {
  id: number;
  user_id: number;
  content: string;
  created_at: string;
  updated_at?: string;
  is_edited?: boolean;
}

export default function TribeRoomPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [featuredMessages, setFeaturedMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [deletingMessageId, setDeletingMessageId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const tribeId = params.tribeId as string;
  const roomId = parseInt(params.roomId as string);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchMessages();
      fetchFeaturedMessages();
      const interval = setInterval(fetchMessages, 3000); // Poll every 3 seconds
      const featuredInterval = setInterval(fetchFeaturedMessages, 30000); // Check every 30 seconds
      return () => {
        clearInterval(interval);
        clearInterval(featuredInterval);
      };
    }
  }, [user, roomId]);

  const fetchFeaturedMessages = async () => {
    if (!user) return;
    try {
      const response = await giftAPI.getActiveGifts(user.id);
      setFeaturedMessages(response.data.featured_messages || []);
    } catch (error) {
      console.error('Error fetching featured messages:', error);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    if (!user) return;
    try {
      const response = await tribeAPI.getMessages(tribeId, roomId, user.id, 100);
      // Remove duplicates by message ID to prevent duplicate messages
      const uniqueMessages = response.data.messages.filter((msg: Message, index: number, self: Message[]) => 
        index === self.findIndex((m: Message) => m.id === msg.id)
      );
      setMessages(uniqueMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage((prev) => prev + emoji);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newMessage.trim()) return;

    setSending(true);
    try {
      await tribeAPI.sendMessage(tribeId, roomId, newMessage, user.id);
      setNewMessage('');
      fetchMessages();
    } catch (error: any) {
      // Handle error - ensure we always pass a string to toast.error
      let errorMessage = 'Failed to send message';
      if (error.response?.data) {
        const errorData = error.response.data;
        // Handle Pydantic validation errors (array of errors)
        if (Array.isArray(errorData.detail)) {
          errorMessage = errorData.detail.map((e: any) => e.msg || e.message || String(e)).join(', ');
        } 
        // Handle string error messages
        else if (typeof errorData.detail === 'string') {
          errorMessage = errorData.detail;
        }
        // Handle object errors - convert to string
        else if (errorData.detail && typeof errorData.detail === 'object') {
          errorMessage = errorData.detail.msg || errorData.detail.message || 'Validation error occurred';
        }
        // Fallback to error message
        else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    } finally {
      setSending(false);
    }
  };

  const handleStartEdit = (message: Message) => {
    setEditingMessageId(message.id);
    setEditContent(message.content);
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditContent('');
  };

  const handleSaveEdit = async (messageId: number) => {
    if (!user || !editContent.trim()) return;

    try {
      const response = await tribeAPI.editMessage(tribeId, roomId, messageId, editContent, user.id);
      // Update the message in local state instead of refetching
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === messageId 
            ? { ...msg, content: editContent, is_edited: true, updated_at: response.data.updated_at }
            : msg
        )
      );
      setEditingMessageId(null);
      setEditContent('');
      toast.success('Message updated! ✨');
    } catch (error: any) {
      let errorMessage = 'Failed to update message';
      if (error.response?.data?.detail) {
        errorMessage = typeof error.response.data.detail === 'string' 
          ? error.response.data.detail 
          : 'Failed to update message';
      }
      toast.error(errorMessage);
    }
  };

  const handleDelete = async (messageId: number) => {
    if (!user) return;
    
    if (!confirm('Are you sure you want to delete this message?')) {
      return;
    }

    setDeletingMessageId(messageId);
    try {
      await tribeAPI.deleteMessage(tribeId, roomId, messageId, user.id);
      // Remove the message from local state instead of refetching
      setMessages(prevMessages => prevMessages.filter(msg => msg.id !== messageId));
      toast.success('Message deleted');
    } catch (error: any) {
      let errorMessage = 'Failed to delete message';
      if (error.response?.data?.detail) {
        errorMessage = typeof error.response.data.detail === 'string' 
          ? error.response.data.detail 
          : 'Failed to delete message';
      }
      toast.error(errorMessage);
    } finally {
      setDeletingMessageId(null);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col relative overflow-hidden">
        {/* Beautiful Animated Background */}
        <TribeRoomBackground />
        
        {/* Mobile App Header */}
        <MobileAppHeader show={isMobile} />

        {/* Desktop Header */}
        {!isMobile && (
          <header className="glass-effect border-b border-white/20 sticky top-0 z-50 backdrop-blur-2xl bg-white/80">
            <div className="max-w-4xl mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h1 className="text-xl font-bold gradient-text flex items-center gap-2">
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        <Users className="w-5 h-5" />
                      </motion.div>
                      Birthday Tribe {tribeId}
                    </h1>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <span>🎉</span> 24-hour celebration room
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>Active for 24h</span>
                </div>
              </div>
            </div>
          </header>
        )}

        {/* Mobile Header */}
        {isMobile && (
          <header className="glass-effect border-b border-white/20 sticky top-16 z-40 backdrop-blur-2xl bg-white/80">
            <div className="px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div>
                    <h1 className="text-base font-bold gradient-text flex items-center gap-2">
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        <Users className="w-4 h-4" />
                      </motion.div>
                      Tribe {tribeId}
                    </h1>
                    <p className="text-xs text-gray-600 flex items-center gap-1">
                      <span>🎉</span> 24h celebration
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <Clock className="w-3 h-3" />
                  <span>24h</span>
                </div>
              </div>
            </div>
          </header>
        )}

        {/* Messages */}
        <main className={`flex-1 overflow-y-auto relative z-10 ${isMobile ? 'pt-36 pb-32' : ''}`}>
          <div className={`mx-auto ${isMobile ? 'px-3 pt-2 pb-24' : 'max-w-4xl px-4 py-6'} space-y-4`}>
            {/* Featured Messages */}
            {featuredMessages.map((msg) => (
              <FeaturedMessage key={msg.gift_id} message={msg} />
            ))}
            
            {/* Confetti Effect */}
            {user && <DigitalGiftEffects userId={user.id} />}
            
            {messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 relative z-10"
              >
                <div className="inline-block mb-4 text-6xl animate-bounce">🎉</div>
                <p className="text-gray-700 mb-2 font-semibold text-lg">No messages yet</p>
                <p className="text-sm text-gray-600 bg-white/50 backdrop-blur-sm rounded-full px-4 py-2 inline-block">
                  Be the first to say happy birthday! 🎂✨
                </p>
              </motion.div>
            ) : (
              messages.map((message, index) => {
                const isOwn = message.user_id === user.id;
                const isEditing = editingMessageId === message.id;
                const isDeleting = deletingMessageId === message.id;
                
                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'} relative z-10 group`}
                  >
                    <div
                      className={`${isMobile ? 'max-w-[85%]' : 'max-w-[70%]'} rounded-3xl ${isMobile ? 'px-4 py-3' : 'px-5 py-3'} shadow-lg hover:shadow-xl transition-all relative ${
                        isOwn
                          ? 'celebration-gradient text-white backdrop-blur-sm border-2 border-white/30'
                          : 'glass-effect border-2 border-white/40 backdrop-blur-xl bg-white/80'
                      }`}
                    >
                      {/* Edit/Delete Buttons (only for own messages) */}
                      {isOwn && !isEditing && (
                        <div className="absolute -top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleStartEdit(message)}
                            className="p-1.5 bg-white/90 hover:bg-white rounded-lg shadow-lg backdrop-blur-sm text-primary-600"
                            title="Edit message"
                          >
                            <Edit2 className="w-3 h-3" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDelete(message.id)}
                            disabled={isDeleting}
                            className="p-1.5 bg-white/90 hover:bg-white rounded-lg shadow-lg backdrop-blur-sm text-red-600 disabled:opacity-50"
                            title="Delete message"
                          >
                            <Trash2 className="w-3 h-3" />
                          </motion.button>
                        </div>
                      )}

                      {isEditing ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white/20 backdrop-blur-sm border-2 border-white/50 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                            placeholder="Edit message..."
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleSaveEdit(message.id);
                              } else if (e.key === 'Escape') {
                                handleCancelEdit();
                              }
                            }}
                          />
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={handleCancelEdit}
                              className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleSaveEdit(message.id)}
                              disabled={!editContent.trim()}
                              className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors disabled:opacity-50"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 mb-1">
                            <p className={`font-semibold ${isMobile ? 'text-xs' : 'text-sm'} ${isOwn ? 'text-white' : 'text-gray-800'}`}>
                              {isOwn ? 'You' : `Birthday Mate #${message.user_id}`}
                            </p>
                            {isOwn && <span className="text-white/70 text-xs">✨</span>}
                          </div>
                          <p className={`break-words leading-relaxed ${isMobile ? 'text-sm' : 'text-base'} ${isOwn ? 'text-white' : 'text-gray-800'}`}>
                            {message.content}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <p className={`${isMobile ? 'text-[10px]' : 'text-xs'} ${isOwn ? 'text-white/80' : 'text-gray-500'}`}>
                              {timeAgo(message.created_at)}
                            </p>
                            {message.is_edited && (
                              <span className={`${isMobile ? 'text-[10px]' : 'text-xs'} ${isOwn ? 'text-white/60' : 'text-gray-400'} italic`}>
                                (edited)
                              </span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
            <div ref={messagesEndRef} />
            {/* Extra spacing on mobile to prevent messages from being covered */}
            {isMobile && <div className="h-20" />}
          </div>
        </main>

        {/* Message Input */}
        <footer className={`glass-effect border-t border-white/30 sticky ${isMobile ? 'bottom-16 z-30' : 'bottom-0 z-30'} backdrop-blur-2xl bg-white/90 shadow-2xl`}>
          <div className={`mx-auto ${isMobile ? 'px-3 py-3' : 'max-w-4xl px-4 py-4'}`}>
            <form onSubmit={handleSendMessage} className={`flex ${isMobile ? 'gap-2' : 'gap-3'} items-center`}>
              <EmojiPicker onEmojiSelect={handleEmojiSelect} isMobile={isMobile} />
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Send birthday wishes... 🎉"
                className={`flex-1 border-2 border-white/50 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-primary-400 bg-white/90 backdrop-blur-sm shadow-lg transition-all ${isMobile ? 'px-4 py-3 text-sm' : 'px-5 py-3'} placeholder:text-gray-400`}
                disabled={sending}
              />
              <motion.button
                type="submit"
                disabled={sending || !newMessage.trim()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`celebration-gradient text-white rounded-2xl font-semibold hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg border-2 border-white/30 ${isMobile ? 'px-5 py-3' : 'px-7 py-3'}`}
              >
                <Send className={isMobile ? 'w-4 h-4' : 'w-5 h-5'} />
                {!isMobile && 'Send'}
              </motion.button>
            </form>
            {!isMobile && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                This room closes at midnight. Messages are text-only.
              </p>
            )}
          </div>
        </footer>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav show={isMobile && !!user} />
      </div>
    </AuthProvider>
  );
}

