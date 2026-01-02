'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, ChevronDown, ChevronUp, ArrowLeft, HelpCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MobileAppHeader } from '@/components/MobileAppHeader';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { useAuthStore } from '@/store/authStore';
import { usePageMetadata } from '@/hooks/usePageMetadata';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQ_DATA: FAQItem[] = [
  // Getting Started
  {
    category: 'getting-started',
    question: 'How do I create an account?',
    answer: 'Creating an account is easy! Click "Sign Up" on the homepage, choose to sign up with email/password or Google, fill in your details (name, birthday, location), upload a profile picture, and you\'re all set! Your Birthday Tribe is automatically assigned based on your birth month and day.'
  },
  {
    category: 'getting-started',
    question: 'What is a Birthday Tribe?',
    answer: 'A Birthday Tribe is a group of people who share the same birthday (month and day). You\'re automatically assigned to your tribe when you sign up. Your tribe room opens on your birthday for 24 hours, where you can celebrate together with your birthday mates!'
  },
  {
    category: 'getting-started',
    question: 'How do I set up my profile?',
    answer: 'After signing up, you\'ll complete onboarding where you provide your name, birthday, gender, location, and upload a profile picture. You can update your profile picture and preferences anytime from the Settings page.'
  },
  {
    category: 'getting-started',
    question: 'When can I create my Birthday Wall?',
    answer: 'You can create your Birthday Wall within 24 hours before your birthday. The wall opens 24 hours before your birthday and closes 48 hours after, then becomes an archived memory you can always revisit!'
  },
  
  // Birthday Walls
  {
    category: 'birthday-walls',
    question: 'How do I create a Birthday Wall?',
    answer: 'Go to your Dashboard and click "Birthday Wall". If you\'re within 24 hours of your birthday, you can create one. Choose your theme, colors, background animation, and start uploading photos!'
  },
  {
    category: 'birthday-walls',
    question: 'When can I create my wall?',
    answer: 'Birthday Walls can only be created within 24 hours before your birthday. This ensures the celebration happens at the right time! If it\'s too early, you\'ll see a countdown.'
  },
  {
    category: 'birthday-walls',
    question: 'Can I add frames to my photos?',
    answer: 'Yes! When uploading photos to your Birthday Wall, you can choose from 8 beautiful frame styles: Classic, Elegant, Vintage, Modern, Gold, Rainbow, Polaroid, or None. Just click "Choose Frame" before uploading.'
  },
  {
    category: 'birthday-walls',
    question: 'How do I view my past birthday walls?',
    answer: 'All your past Birthday Walls are archived by year! Go to your Dashboard and click "Wall Archive" to see all your walls organized by year (2025, 2026, etc.). Each wall is a beautiful memory you can always revisit.'
  },
  {
    category: 'birthday-walls',
    question: 'Can others upload photos to my wall?',
    answer: 'Yes! While your wall is open (24 hours before to 48 hours after your birthday), anyone with the link can upload photos. After it closes, the wall becomes read-only and archived.'
  },
  
  // Tribes
  {
    category: 'tribes',
    question: 'What is a Birthday Tribe?',
    answer: 'Your Birthday Tribe consists of everyone who shares your exact birthday (month and day). You\'re automatically assigned when you sign up. It\'s your community of birthday mates!'
  },
  {
    category: 'tribes',
    question: 'When does the Tribe Room open?',
    answer: 'The Tribe Room opens ceremonially at 00:00 (midnight) on your birthday in your local timezone and stays open for 24 hours. It then closes and becomes read-only.'
  },
  {
    category: 'tribes',
    question: 'Can I invite guests to my Tribe Room?',
    answer: 'Yes! On your birthday, you can create a Personal Birthday Room and generate invite links. Guests can join via the link, but they\'ll be clearly labeled as "Guests" (not birthday mates).'
  },
  {
    category: 'tribes',
    question: 'How do I find my birthday mates?',
    answer: 'Your birthday mates are automatically in your tribe! You can see them in the celebrant spiral on your dashboard. On your birthday, you can chat with them in the Tribe Room.'
  },
  
  // Gifts
  {
    category: 'gifts',
    question: 'How do I send a digital gift?',
    answer: 'Go to the "Gifts" page, browse the catalog, select a gift, and choose who to send it to. Digital gifts (like confetti, badges, wall highlights) activate immediately after purchase!'
  },
  {
    category: 'gifts',
    question: 'What types of gifts are available?',
    answer: 'We offer platform-owned digital gifts (confetti, badges, wall highlights, featured messages) and third-party gift cards (Amazon, Netflix, Spotify, etc.). More options are added regularly!'
  },
  {
    category: 'gifts',
    question: 'How do I activate a gift I received?',
    answer: 'Go to your "Gifts" page and click on any received gift to activate it. Digital gifts activate instantly, while gift cards are delivered via email.'
  },
  {
    category: 'gifts',
    question: 'Can I send gifts to non-users?',
    answer: 'Currently, gifts can only be sent to registered users. The recipient will receive a notification when they log in.'
  },
  
  // Birthday Buddy
  {
    category: 'buddy',
    question: 'What is a Birthday Buddy?',
    answer: 'A Birthday Buddy is a one-on-one match with someone who shares your exact birthday. It guarantees at least one meaningful connection on your special day!'
  },
  {
    category: 'buddy',
    question: 'How does the matching work?',
    answer: 'On your birthday, the system automatically pairs you with another birthday mate who hasn\'t been matched yet. You\'ll receive a notification when matched!'
  },
  {
    category: 'buddy',
    question: 'Can I decline a match?',
    answer: 'Yes! You can accept or decline a Birthday Buddy match. If you decline, you won\'t be rematched for that birthday cycle.'
  },
  {
    category: 'buddy',
    question: 'Is the matching anonymous?',
    answer: 'Yes! Your Birthday Buddy match is anonymous until you send your first message. This adds excitement to the connection!'
  },
  
  // Account
  {
    category: 'account',
    question: 'How do I change my profile picture?',
    answer: 'Go to Settings, click on your current profile picture, and upload a new one. You can change it up to 48 hours before your birthday or on your birthday day.'
  },
  {
    category: 'account',
    question: 'Can I update my birthday?',
    answer: 'For security and to maintain the integrity of Birthday Tribes, your birthday cannot be changed after signup. Please ensure it\'s correct during onboarding.'
  },
  {
    category: 'account',
    question: 'How do I change my password?',
    answer: 'If you signed up with email/password, go to Settings and look for "Change Password". You can also use "Forgot Password" on the login page to reset it.'
  },
  {
    category: 'account',
    question: 'What is state-level visibility?',
    answer: 'State-level visibility lets you see (and be seen by) other celebrants in your state. By default, it shows only counts. You can opt-in to show your name and profile picture for 24 hours.'
  },
  
  // Privacy
  {
    category: 'privacy',
    question: 'How is my data protected?',
    answer: 'We take privacy seriously! Your data is encrypted, we comply with GDPR, and we never sell your personal information. Read our Privacy Policy for full details.'
  },
  {
    category: 'privacy',
    question: 'Who can see my profile?',
    answer: 'Your profile picture appears in your Birthday Tribe and on your Birthday Wall. You control state-level visibility in Settings. We never share your exact location or contact info.'
  },
  {
    category: 'privacy',
    question: 'Can I report inappropriate content?',
    answer: 'Yes! If you encounter inappropriate content, please contact our support team at support@happybirthdaymate.com with details about the content. Our moderation team reviews all reports and takes appropriate action to keep the platform safe and celebratory.'
  },
  {
    category: 'privacy',
    question: 'How do I delete my account?',
    answer: 'Contact support at support@happybirthdaymate.com to request account deletion. We\'ll process your request within 30 days per GDPR requirements.'
  },
  
  // Troubleshooting
  {
    category: 'troubleshooting',
    question: 'I can\'t log in to my account',
    answer: 'Try using "Forgot Password" to reset your password. If you used Google sign-in, make sure you\'re using the same Google account. Contact support if issues persist.'
  },
  {
    category: 'troubleshooting',
    question: 'My photos aren\'t uploading',
    answer: 'Check your internet connection, ensure the file is under 10MB, and that it\'s a valid image format (JPG, PNG, WebP). Try refreshing the page and uploading again.'
  },
  {
    category: 'troubleshooting',
    question: 'I\'m not receiving emails',
    answer: 'Check your spam folder! Our emails sometimes end up there. Also verify your email address in Settings. If still not receiving emails, contact support.'
  },
  {
    category: 'troubleshooting',
    question: 'The app is not working on my device',
    answer: 'Try clearing your browser cache, updating your browser, or using a different browser. For mobile, try reinstalling the PWA. Contact support with your device/browser details if issues persist.'
  },
];

const CATEGORY_NAMES: Record<string, string> = {
  'getting-started': 'Getting Started',
  'birthday-walls': 'Birthday Walls',
  'tribes': 'Birthday Tribes',
  'gifts': 'Gifts & Cards',
  'buddy': 'Birthday Buddy',
  'account': 'Account & Profile',
  'privacy': 'Privacy & Safety',
  'troubleshooting': 'Troubleshooting',
};

function FAQPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const [isMobile, setIsMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    searchParams.get('category') || null
  );

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleItem = (index: number) => {
    const newOpen = new Set(openItems);
    if (newOpen.has(index)) {
      newOpen.delete(index);
    } else {
      newOpen.add(index);
    }
    setOpenItems(newOpen);
  };

  // Filter FAQs based on search and category
  const filteredFAQs = FAQ_DATA.filter(faq => {
    const matchesCategory = !selectedCategory || faq.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Group by category
  const groupedFAQs = filteredFAQs.reduce((acc, faq, index) => {
    if (!acc[faq.category]) {
      acc[faq.category] = [];
    }
    acc[faq.category].push({ ...faq, originalIndex: FAQ_DATA.indexOf(faq) });
    return acc;
  }, {} as Record<string, (FAQItem & { originalIndex: number })[]>);

  const categories = Object.keys(groupedFAQs);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Mobile App Header */}
      <MobileAppHeader show={isMobile} title="FAQ" />

      {/* Desktop Header */}
      {!isMobile && (
        <header className="glass-effect border-b border-white/20 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
            <button
              onClick={() => router.push('/help')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold gradient-text">Frequently Asked Questions</h1>
          </div>
        </header>
      )}

      <main className={`max-w-5xl mx-auto ${isMobile ? 'px-4 pt-20 pb-24' : 'px-4 py-12'}`}>
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 md:mb-12"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full celebration-gradient mb-4 md:mb-6">
            <HelpCircle className="w-10 h-10 md:w-12 md:h-12 text-white" />
          </div>
          <h1 className="text-3xl md:text-5xl font-black gradient-text mb-3 md:mb-4">
            Frequently Asked Questions 🎯
          </h1>
          <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
            Find quick answers to common questions about Happy Birthday Mate
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 md:mb-8"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search questions... (e.g., 'wall', 'tribe', 'gifts')"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 md:py-5 rounded-2xl border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-200 outline-none text-base md:text-lg shadow-lg"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 md:mb-8"
        >
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                !selectedCategory
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              All Categories
            </button>
            {Object.keys(CATEGORY_NAMES).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-primary-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {CATEGORY_NAMES[cat]}
              </button>
            ))}
          </div>
        </motion.div>

        {/* FAQ Items */}
        <div className="space-y-6 md:space-y-8">
          {categories.length === 0 ? (
            <div className="text-center py-12">
              <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-2">No questions found</p>
              <p className="text-gray-500 text-sm">Try different search terms or select a different category</p>
            </div>
          ) : (
            categories.map((category) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-effect rounded-2xl md:rounded-3xl p-6 md:p-8"
              >
                <h2 className="text-xl md:text-2xl font-bold gradient-text mb-4 md:mb-6 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-primary-600" />
                  {CATEGORY_NAMES[category]}
                </h2>
                <div className="space-y-3">
                  {groupedFAQs[category].map((faq, idx) => {
                    const globalIndex = faq.originalIndex;
                    const isOpen = openItems.has(globalIndex);
                    return (
                      <div
                        key={globalIndex}
                        className="border-2 border-gray-200 rounded-xl overflow-hidden hover:border-primary-300 transition-colors"
                      >
                        <button
                          onClick={() => toggleItem(globalIndex)}
                          className="w-full px-4 md:px-6 py-4 md:py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                        >
                          <span className="font-semibold text-base md:text-lg text-gray-800 pr-4">
                            {faq.question}
                          </span>
                          {isOpen ? (
                            <ChevronUp className="w-5 h-5 md:w-6 md:h-6 text-primary-600 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="w-5 h-5 md:w-6 md:h-6 text-gray-400 flex-shrink-0" />
                          )}
                        </button>
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="px-4 md:px-6 pb-4 md:pb-5 text-gray-600 text-sm md:text-base leading-relaxed">
                                {faq.answer}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Still Need Help */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 md:mt-16"
        >
          <div className="glass-effect rounded-3xl p-6 md:p-8 text-center border-2 border-primary-200">
            <h3 className="text-2xl md:text-3xl font-bold gradient-text mb-3">
              Still have questions? 🤔
            </h3>
            <p className="text-gray-600 mb-6 max-w-xl mx-auto">
              Can't find what you're looking for? Our support team is ready to help!
            </p>
            <button
              onClick={() => router.push('/contact')}
              className="celebration-gradient text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              Contact Support 🎈
            </button>
          </div>
        </motion.div>
      </main>

      {/* Mobile Bottom Navigation */}
      {user && <MobileBottomNav show={isMobile} />}
    </div>
  );
}

export default function FAQPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
      </div>
    }>
      <FAQPageContent />
    </Suspense>
  );
}

