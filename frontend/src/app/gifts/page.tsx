'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { giftAPI, aiAPI } from '@/lib/api';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { MobileAppHeader } from '@/components/MobileAppHeader';
import { Gift, Send, Heart, Sparkles, Inbox, Package, Star, Eye, X, Users, CreditCard, MessageSquare, Wand2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { userAPI } from '@/lib/api';
import { DigitalCardView } from '@/components/DigitalGiftEffects';

interface GiftItem {
  id: number;
  name: string;
  description: string;
  gift_type: string;
  price: number;
  currency: string;
  image_url?: string;
  is_featured?: boolean;
}

export default function GiftsPage() {
  const router = useRouter();
  const { user, loading } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'catalog' | 'sent' | 'received'>('catalog');
  const [giftCatalog, setGiftCatalog] = useState<GiftItem[]>([]);
  const [sentGifts, setSentGifts] = useState([]);
  const [receivedGifts, setReceivedGifts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [previewGift, setPreviewGift] = useState<GiftItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sendGiftModal, setSendGiftModal] = useState<GiftItem | null>(null);
  const [tribeMembers, setTribeMembers] = useState<any[]>([]);
  const [selectedRecipient, setSelectedRecipient] = useState<number | null>(null);
  const [paymentProvider, setPaymentProvider] = useState<'stripe' | 'paypal' | 'paystack' | 'flutterwave'>('flutterwave');
  const [giftMessage, setGiftMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [showTemplateMessages, setShowTemplateMessages] = useState(false);
  const [templateMessages, setTemplateMessages] = useState<string[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchGiftData();
      fetchTribeMembers();
    }
  }, [user, loading, router, activeTab]);

  const fetchTribeMembers = async () => {
    if (!user) return;
    try {
      const response = await userAPI.getTribeMembers(user.tribe_id, 50, false);
      setTribeMembers(response.data.members || []);
    } catch (error) {
      console.error('Error fetching tribe members:', error);
    }
  };

  const generateAIMessage = async () => {
    if (!sendGiftModal || !selectedRecipient || !user) {
      toast.error('Please select a recipient first');
      return;
    }

    setIsGeneratingAI(true);
    
    try {
      // Find recipient info
      const recipient = tribeMembers.find(m => m.id === selectedRecipient);
      
      // Calculate recipient age if date_of_birth is available
      let recipientAge: number | undefined;
      if (recipient?.date_of_birth) {
        const birthDate = new Date(recipient.date_of_birth);
        const today = new Date();
        recipientAge = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          recipientAge--;
        }
      }
      
      // Call AI API to generate message
      const response = await aiAPI.generateGiftMessage({
        recipient_name: recipient?.first_name || 'friend',
        sender_name: user.first_name,
        gift_name: sendGiftModal.name,
        gift_type: sendGiftModal.gift_type,
        recipient_age: recipientAge,
        recipient_country: recipient?.country,
      });
      
      const generatedMessage = response.data?.message;
      
      // Validate the message is complete (not just one word)
      if (!generatedMessage || generatedMessage.trim().split(/\s+/).length < 3) {
        console.warn('AI generated incomplete message, using template fallback');
        // Use template as fallback
        const templateResponse = await aiAPI.getTemplateMessages({
          recipient_name: recipient?.first_name || 'friend',
          recipient_age: recipientAge,
          recipient_country: recipient?.country,
        });
        const templates = templateResponse.data.messages || [];
        if (templates.length > 0) {
          setGiftMessage(templates[Math.floor(Math.random() * templates.length)]);
          toast.success('Message generated from templates! ✨');
        } else {
          setGiftMessage(`Happy Birthday ${recipient?.first_name || 'friend'}! 🎉 Wishing you a wonderful day filled with joy and happiness!`);
          toast.success('Default message set!');
        }
      } else {
        setGiftMessage(generatedMessage);
        toast.success('AI message generated! ✨');
      }
    } catch (error: any) {
      console.error('Error generating AI message:', error);
      // Try to use templates as fallback
      try {
        const recipient = tribeMembers.find(m => m.id === selectedRecipient);
        let recipientAge: number | undefined;
        if (recipient?.date_of_birth) {
          const birthDate = new Date(recipient.date_of_birth);
          const today = new Date();
          recipientAge = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            recipientAge--;
          }
        }
        
        const templateResponse = await aiAPI.getTemplateMessages({
          recipient_name: recipient?.first_name || 'friend',
          recipient_age: recipientAge,
          recipient_country: recipient?.country,
        });
        const templates = templateResponse.data.messages || [];
        if (templates.length > 0) {
          setGiftMessage(templates[Math.floor(Math.random() * templates.length)]);
          toast.success('Using template message! 📝');
        } else {
          setGiftMessage(`Happy Birthday ${recipient?.first_name || 'friend'}! 🎉 Wishing you a wonderful day filled with joy and happiness!`);
          toast.error('Failed to generate message. Using default.');
        }
      } catch (templateError) {
        const recipient = tribeMembers.find(m => m.id === selectedRecipient);
        setGiftMessage(`Happy Birthday ${recipient?.first_name || 'friend'}! 🎉 Wishing you a wonderful day filled with joy and happiness!`);
        toast.error('Failed to generate message. Please try again.');
      }
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const loadTemplateMessages = async () => {
    if (!selectedRecipient) {
      toast.error('Please select a recipient first');
      return;
    }

    setIsLoadingTemplates(true);
    setShowTemplateMessages(true);
    
    try {
      const recipient = tribeMembers.find(m => m.id === selectedRecipient);
      
      // Calculate recipient age if date_of_birth is available
      let recipientAge: number | undefined;
      if (recipient?.date_of_birth) {
        const birthDate = new Date(recipient.date_of_birth);
        const today = new Date();
        recipientAge = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          recipientAge--;
        }
      }
      
      const response = await aiAPI.getTemplateMessages({
        recipient_name: recipient?.first_name || 'friend',
        recipient_age: recipientAge,
        recipient_country: recipient?.country,
      });
      
      setTemplateMessages(response.data.messages || []);
      toast.success(`Loaded ${response.data.count || 0} template messages! 📝`);
    } catch (error: any) {
      console.error('Error loading template messages:', error);
      toast.error('Failed to load template messages');
      setTemplateMessages([]);
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  const handleSendGift = async () => {
    if (!user || !sendGiftModal || !selectedRecipient) {
      toast.error('Please select a recipient');
      return;
    }

    setIsSending(true);
    try {
      // Step 1: Create gift transaction
      const giftResponse = await giftAPI.sendGift({
        recipient_id: selectedRecipient,
        gift_catalog_id: sendGiftModal.id,
        payment_provider: paymentProvider,
        message: giftMessage || undefined,
      });

      const giftId = giftResponse.data.gift_id;
      const paymentData = giftResponse.data.payment_data;

      // Step 2: Handle payment based on provider
      if (paymentProvider === 'flutterwave' && paymentData?.payment_url) {
        // Redirect to Flutterwave payment page
        toast.loading('Redirecting to payment...', { id: 'payment' });
        window.location.href = paymentData.payment_url;
        return; // Don't close modal yet, user will be redirected
      } else {
        // For other providers or if no payment URL, handle as before
        toast.loading('Processing payment...', { id: 'payment' });
        
        // Simulate payment delay for other providers
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        toast.success('Payment successful!', { id: 'payment' });
        
        try {
          await giftAPI.activateGift(giftId);
        } catch (activateError: any) {
          console.error('Error activating gift:', activateError);
          toast.error('Gift created but activation failed. Please contact support.', { duration: 5000 });
        }

        toast.success('Gift sent successfully! 🎉');
        setSendGiftModal(null);
        setSelectedRecipient(null);
        setGiftMessage('');
        fetchGiftData();
      }
    } catch (error: any) {
      console.error('Error sending gift:', error);
      toast.error(error.response?.data?.detail || 'Failed to send gift. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const fetchGiftData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'catalog') {
        const response = await giftAPI.getCatalog();
        setGiftCatalog(response.data.gifts || []);
      } else if (activeTab === 'sent') {
        const response = await giftAPI.getSentGifts(user!.id);
        setSentGifts(response.data.gifts || []);
      } else {
        const response = await giftAPI.getReceivedGifts(user!.id);
        setReceivedGifts(response.data.gifts || []);
      }
    } catch (error) {
      console.error('Error fetching gift data:', error);
      toast.error('Failed to load gifts');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) return null;

  const giftIcons: { [key: string]: string } = {
    digital_card: '💌',
    confetti_effect: '✨',
    wall_highlight: '🌟',
    celebrant_badge: '🏆',
    featured_message: '📌',
    gift_card: '🎁'
  };

  const categoryLabels: { [key: string]: string } = {
    digital_card: 'Digital Cards',
    confetti_effect: 'Confetti Effects',
    wall_highlight: 'Wall Highlights',
    celebrant_badge: 'Badges',
    featured_message: 'Featured Messages',
    gift_card: 'Gift Cards'
  };

  // Get unique categories from gifts
  const categories = Array.from(new Set(giftCatalog.map(g => g.gift_type)));

  // Filter gifts by selected category
  const filteredGifts = selectedCategory
    ? giftCatalog.filter(g => g.gift_type === selectedCategory)
    : giftCatalog;

  return (
    <div className="min-h-screen pb-20 overflow-x-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <MobileAppHeader show={isMobile} title="Gifts" />

      <div className={`${isMobile ? 'pt-20' : 'pt-8'} px-4 max-w-7xl mx-auto`}>
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <Gift className="w-8 h-8 text-primary-600" />
            <h1 className="text-3xl md:text-4xl font-bold gradient-text">Digital Gifts</h1>
          </div>
          <p className="text-gray-600">
            Send beautiful gifts to make someone's day special
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 mb-6 glass-effect p-2 rounded-2xl"
        >
          {[
            { id: 'catalog', label: 'Catalog', icon: Package },
            { id: 'sent', label: 'Sent', icon: Send },
            { id: 'received', label: 'Received', icon: Inbox },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setSelectedCategory(null); // Reset category when switching tabs
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all ${
                activeTab === tab.id
                  ? 'celebration-gradient text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </motion.div>

        {/* Category Filters - Only show on Catalog tab */}
        {activeTab === 'catalog' && categories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-6"
          >
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-full font-semibold text-sm transition-all ${
                  selectedCategory === null
                    ? 'celebration-gradient text-white shadow-lg'
                    : 'glass-effect text-gray-600 hover:bg-gray-100'
                }`}
              >
                All Gifts ({giftCatalog.length})
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full font-semibold text-sm transition-all flex items-center gap-2 ${
                    selectedCategory === category
                      ? 'celebration-gradient text-white shadow-lg'
                      : 'glass-effect text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span>{giftIcons[category] || '🎁'}</span>
                  <span>{categoryLabels[category] || category}</span>
                  <span className="text-xs opacity-75">
                    ({giftCatalog.filter(g => g.gift_type === category).length})
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        )}

        {/* Gift Catalog */}
        <AnimatePresence mode="wait">
          {!isLoading && activeTab === 'catalog' && (
            <motion.div
              key="catalog"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {filteredGifts.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredGifts.map((gift, index) => (
                    <motion.div
                      key={gift.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="glass-effect rounded-2xl p-6 hover:shadow-xl transition-all cursor-pointer group relative"
                      whileHover={{ y: -5 }}
                    >
                      {gift.is_featured && (
                        <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 z-10">
                          <Star className="w-3 h-3 fill-current" />
                          Featured
                        </div>
                      )}
                      <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                        {giftIcons[gift.gift_type as keyof typeof giftIcons] || '🎁'}
                      </div>
                      <h3 className="font-bold text-lg mb-2">{gift.name}</h3>
                      <p className="text-sm text-gray-600 mb-4">{gift.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold gradient-text">
                          {gift.currency === 'USD' ? '$' : gift.currency}{gift.price}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setPreviewGift(gift)}
                            className="glass-effect px-4 py-2 rounded-full text-sm font-semibold hover:shadow-lg transition-all flex items-center gap-1"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                          <button
                            onClick={() => setSendGiftModal(gift)}
                            className="celebration-gradient text-white px-4 py-2 rounded-full text-sm font-semibold hover:shadow-lg transition-all"
                          >
                            Send Gift
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="glass-effect rounded-3xl p-12 text-center">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">
                    {selectedCategory 
                      ? `No ${categoryLabels[selectedCategory] || selectedCategory} available`
                      : 'No gifts available'}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {selectedCategory 
                      ? 'Try selecting a different category'
                      : 'Check back soon for new gifts!'}
                  </p>
                  {selectedCategory && (
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className="celebration-gradient text-white px-6 py-3 rounded-full font-semibold hover:shadow-xl transition-all"
                    >
                      Show All Gifts
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* Sent Gifts */}
          {!isLoading && activeTab === 'sent' && (
            <motion.div
              key="sent"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {sentGifts.length > 0 ? (
                <div className="space-y-4">
                  {sentGifts.map((gift: any) => (
                    <div key={gift.id} className="glass-effect rounded-2xl p-4 flex items-center gap-4">
                      <div className="text-3xl">🎁</div>
                      <div className="flex-1">
                        <h4 className="font-bold">{gift.gift_name}</h4>
                        <p className="text-sm text-gray-500">To: {gift.recipient_name}</p>
                      </div>
                      <div className="text-sm text-gray-400">
                        {new Date(gift.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="glass-effect rounded-3xl p-12 text-center">
                  <Send className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">No gifts sent yet</h3>
                  <p className="text-gray-500 mb-4">Start spreading joy by sending your first gift!</p>
                  <button
                    onClick={() => setActiveTab('catalog')}
                    className="celebration-gradient text-white px-6 py-3 rounded-full font-semibold hover:shadow-xl transition-all"
                  >
                    Browse Gifts
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* Received Gifts */}
          {!isLoading && activeTab === 'received' && (
            <motion.div
              key="received"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {receivedGifts.length > 0 ? (
                <div className="space-y-4">
                  {receivedGifts.map((gift: any) => (
                    <div key={gift.id} className="glass-effect rounded-2xl p-4 flex items-center gap-4">
                      <div className="text-3xl">💝</div>
                      <div className="flex-1">
                        <h4 className="font-bold">{gift.gift_name}</h4>
                        <p className="text-sm text-gray-500">From: {gift.sender_name}</p>
                      </div>
                      <div className="text-sm text-gray-400">
                        {new Date(gift.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="glass-effect rounded-3xl p-12 text-center">
                  <Inbox className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">No gifts received yet</h3>
                  <p className="text-gray-500">
                    Your friends can send you gifts on your birthday!
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Gift Preview Modal */}
      <AnimatePresence>
        {previewGift && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setPreviewGift(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-effect rounded-3xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => setPreviewGift(null)}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Preview Content */}
              <div className="text-center space-y-6">
                <div className="text-8xl mb-4">
                  {giftIcons[previewGift.gift_type as keyof typeof giftIcons] || '🎁'}
                </div>

                <div>
                  <h2 className="text-3xl font-bold gradient-text mb-2">{previewGift.name}</h2>
                  {previewGift.is_featured && (
                    <div className="inline-flex items-center gap-1 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold mb-4">
                      <Star className="w-3 h-3 fill-current" />
                      Featured
                    </div>
                  )}
                </div>

                <p className="text-lg text-gray-600">{previewGift.description}</p>

                {/* Preview Demo Based on Gift Type */}
                <div className="my-8">
                  {previewGift.gift_type === 'digital_card' && (
                    <div className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-2xl p-8 border-4 border-primary-300">
                      <div className="text-6xl mb-4">💌</div>
                      <p className="text-gray-700 font-semibold">Animated Birthday Card</p>
                      <p className="text-sm text-gray-600 mt-2">Opens with personalized message and animations</p>
                    </div>
                  )}

                  {previewGift.gift_type === 'confetti_effect' && (
                    <div className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-2xl p-8 border-4 border-yellow-300 relative overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-6xl animate-bounce">✨</div>
                        <div className="text-4xl absolute top-10 left-10 animate-pulse">🎉</div>
                        <div className="text-4xl absolute bottom-10 right-10 animate-pulse">🎊</div>
                      </div>
                      <p className="text-gray-700 font-semibold relative z-10">Confetti Animation</p>
                      <p className="text-sm text-gray-600 mt-2 relative z-10">Appears on recipient's profile</p>
                    </div>
                  )}

                  {previewGift.gift_type === 'wall_highlight' && (
                    <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl p-8 border-4 border-blue-300">
                      <div className="text-6xl mb-4">🌟</div>
                      <p className="text-gray-700 font-semibold">Photo Highlight Frame</p>
                      <p className="text-sm text-gray-600 mt-2">Special frame around the photo on birthday wall</p>
                    </div>
                  )}

                  {previewGift.gift_type === 'celebrant_badge' && (
                    <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-8 border-4 border-purple-300">
                      <div className="text-6xl mb-4">🏆</div>
                      <p className="text-gray-700 font-semibold">Special Celebrant Badge</p>
                      <p className="text-sm text-gray-600 mt-2">Appears on profile for 24 hours</p>
                    </div>
                  )}

                  {previewGift.gift_type === 'featured_message' && (
                    <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl p-8 border-4 border-green-300">
                      <div className="text-6xl mb-4">📌</div>
                      <p className="text-gray-700 font-semibold">Pinned Message</p>
                      <p className="text-sm text-gray-600 mt-2">Your message stays at the top of the tribe room</p>
                    </div>
                  )}

                  {previewGift.gift_type === 'gift_card' && (
                    <div className="bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl p-8 border-4 border-orange-300">
                      <div className="text-6xl mb-4">🎁</div>
                      <p className="text-gray-700 font-semibold">Digital Gift Card</p>
                      <p className="text-sm text-gray-600 mt-2">Redeemable immediately after purchase</p>
                      {previewGift.name.includes('Amazon') && (
                        <p className="text-xs text-gray-500 mt-4">Works on Amazon.com</p>
                      )}
                      {previewGift.name.includes('Netflix') && (
                        <p className="text-xs text-gray-500 mt-4">Works on Netflix.com</p>
                      )}
                      {previewGift.name.includes('Spotify') && (
                        <p className="text-xs text-gray-500 mt-4">Works on Spotify.com</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Price and Action */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-sm text-gray-600">Price</p>
                      <p className="text-3xl font-bold gradient-text">
                        {previewGift.currency === 'USD' ? '$' : previewGift.currency}{previewGift.price}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setPreviewGift(null);
                        setSendGiftModal(previewGift);
                      }}
                      className="celebration-gradient text-white px-8 py-3 rounded-full font-semibold hover:shadow-xl transition-all"
                    >
                      Send Gift
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Send Gift Modal */}
      <AnimatePresence>
        {sendGiftModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setSendGiftModal(null);
              setSelectedRecipient(null);
              setGiftMessage('');
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-effect rounded-3xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  setSendGiftModal(null);
                  setSelectedRecipient(null);
                  setGiftMessage('');
                }}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Send Gift Content */}
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-6xl mb-4">
                    {giftIcons[sendGiftModal.gift_type as keyof typeof giftIcons] || '🎁'}
                  </div>
                  <h2 className="text-2xl font-bold gradient-text mb-2">{sendGiftModal.name}</h2>
                  <p className="text-gray-600">{sendGiftModal.description}</p>
                  <p className="text-xl font-bold gradient-text mt-2">
                    {sendGiftModal.currency === 'USD' ? '$' : sendGiftModal.currency}{sendGiftModal.price}
                  </p>
                </div>

                {/* Select Recipient */}
                <div>
                  <label className="block text-sm font-semibold mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Select Recipient
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-48 overflow-y-auto">
                    {tribeMembers
                      .filter(member => member.id !== user?.id)
                      .map((member) => (
                        <button
                          key={member.id}
                          onClick={() => setSelectedRecipient(member.id)}
                          className={`p-3 rounded-xl border-2 transition-all ${
                            selectedRecipient === member.id
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <img
                            src={member.profile_picture_url}
                            alt={member.first_name}
                            className="w-12 h-12 rounded-full mx-auto mb-2 object-cover"
                          />
                          <p className="text-sm font-medium truncate">{member.first_name}</p>
                          <p className="text-xs text-gray-500 truncate">{member.country}</p>
                        </button>
                      ))}
                  </div>
                  {tribeMembers.filter(m => m.id !== user?.id).length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No other tribe members available. You can only send gifts to your birthday tribe members.
                    </p>
                  )}
                </div>

                {/* Payment Provider */}
                <div>
                  <label className="block text-sm font-semibold mb-3 flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Payment Method
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {['stripe', 'paypal', 'paystack'].map((provider) => (
                      <button
                        key={provider}
                        onClick={() => setPaymentProvider(provider as any)}
                        className={`p-4 rounded-xl border-2 transition-all capitalize ${
                          paymentProvider === provider
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {provider}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Optional Message */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-semibold flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Personal Message (Optional)
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={loadTemplateMessages}
                        disabled={!selectedRecipient || isLoadingTemplates}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoadingTemplates ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                            Loading...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            Templates
                          </>
                        )}
                      </button>
                      <button
                        onClick={generateAIMessage}
                        disabled={!selectedRecipient || isGeneratingAI}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isGeneratingAI ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                            Generating...
                          </>
                        ) : (
                          <>
                            <Wand2 className="w-4 h-4" />
                            AI Generate
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={giftMessage}
                    onChange={(e) => setGiftMessage(e.target.value)}
                    placeholder="Add a personal message to your gift... or click 'Generate AI Message' for a personalized greeting!"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    rows={4}
                  />
                  {giftMessage && (
                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      {giftMessage.length} characters
                    </p>
                  )}
                  
                  {/* Template Messages Modal */}
                  {showTemplateMessages && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowTemplateMessages(false)}>
                      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                        <div className="p-4 border-b flex items-center justify-between">
                          <h3 className="text-lg font-bold">Choose a Template Message</h3>
                          <button
                            onClick={() => setShowTemplateMessages(false)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4">
                          {templateMessages.length === 0 ? (
                            <div className="text-center py-8">
                              <p className="text-gray-500">No template messages available</p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {templateMessages.map((msg, index) => (
                                <button
                                  key={index}
                                  onClick={() => {
                                    setGiftMessage(msg);
                                    setShowTemplateMessages(false);
                                    toast.success('Template message selected! 📝');
                                  }}
                                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-primary-50 hover:border-primary-300 transition-colors"
                                >
                                  <p className="text-sm text-gray-700">{msg}</p>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Send Button */}
                <button
                  onClick={handleSendGift}
                  disabled={!selectedRecipient || isSending}
                  className="w-full celebration-gradient text-white py-4 rounded-xl font-semibold hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSending ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Gift ({sendGiftModal.currency === 'USD' ? '$' : sendGiftModal.currency}{sendGiftModal.price})
                    </>
                  )}
                </button>

                {!selectedRecipient && (
                  <p className="text-sm text-red-500 text-center">
                    Please select a recipient to send the gift
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <MobileBottomNav show={isMobile} />
    </div>
  );
}
