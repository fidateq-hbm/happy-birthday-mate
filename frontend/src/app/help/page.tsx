'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, HelpCircle, MessageCircle, BookOpen, Sparkles, ArrowRight, Gift, Users, Image, Heart, Shield, Settings, Cake } from 'lucide-react';
import { motion } from 'framer-motion';
import { MobileAppHeader } from '@/components/MobileAppHeader';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { useAuthStore } from '@/store/authStore';
import { usePageMetadata } from '@/hooks/usePageMetadata';

const HELP_CATEGORIES = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: Sparkles,
    color: 'from-purple-500 to-pink-500',
    description: 'New to Happy Birthday Mate? Start here!',
    questions: [
      'How do I create an account?',
      'What is a Birthday Tribe?',
      'How do I set up my profile?',
      'When can I create my Birthday Wall?'
    ]
  },
  {
    id: 'birthday-walls',
    title: 'Birthday Walls',
    icon: Image,
    color: 'from-blue-500 to-cyan-500',
    description: 'Create beautiful photo galleries for your celebration',
    questions: [
      'How do I create a Birthday Wall?',
      'When can I create my wall?',
      'Can I add frames to my photos?',
      'How do I view my past birthday walls?',
      'Can others upload photos to my wall?'
    ]
  },
  {
    id: 'tribes',
    title: 'Birthday Tribes',
    icon: Users,
    color: 'from-green-500 to-emerald-500',
    description: 'Connect with people who share your birthday',
    questions: [
      'What is a Birthday Tribe?',
      'When does the Tribe Room open?',
      'Can I invite guests to my Tribe Room?',
      'How do I find my birthday mates?'
    ]
  },
  {
    id: 'gifts',
    title: 'Gifts & Cards',
    icon: Gift,
    color: 'from-yellow-500 to-orange-500',
    description: 'Send digital gifts and celebration cards',
    questions: [
      'How do I send a digital gift?',
      'What types of gifts are available?',
      'How do I activate a gift I received?',
      'Can I send gifts to non-users?'
    ]
  },
  {
    id: 'buddy',
    title: 'Birthday Buddy',
    icon: Heart,
    color: 'from-red-500 to-pink-500',
    description: 'Get matched with a birthday twin',
    questions: [
      'What is a Birthday Buddy?',
      'How does the matching work?',
      'Can I decline a match?',
      'Is the matching anonymous?'
    ]
  },
  {
    id: 'account',
    title: 'Account & Profile',
    icon: Settings,
    color: 'from-indigo-500 to-purple-500',
    description: 'Manage your account and preferences',
    questions: [
      'How do I change my profile picture?',
      'Can I update my birthday?',
      'How do I change my password?',
      'What is state-level visibility?'
    ]
  },
  {
    id: 'privacy',
    title: 'Privacy & Safety',
    icon: Shield,
    color: 'from-gray-600 to-gray-800',
    description: 'Your privacy and safety matters',
    questions: [
      'How is my data protected?',
      'Who can see my profile?',
      'Can I report inappropriate content?',
      'How do I delete my account?'
    ]
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    icon: HelpCircle,
    color: 'from-blue-600 to-indigo-600',
    description: 'Common issues and solutions',
    questions: [
      'I can\'t log in to my account',
      'My photos aren\'t uploading',
      'I\'m not receiving emails',
      'The app is not working on my device'
    ]
  }
];

const QUICK_LINKS = [
  { title: 'Contact Support', icon: MessageCircle, href: '/contact', color: 'bg-primary-600 hover:bg-primary-700' },
  { title: 'View FAQ', icon: BookOpen, href: '/faq', color: 'bg-purple-600 hover:bg-purple-700' },
];

export default function HelpCenterPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [filteredCategories, setFilteredCategories] = useState(HELP_CATEGORIES);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCategories(HELP_CATEGORIES);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = HELP_CATEGORIES.map(category => {
      const matchingQuestions = category.questions.filter(q => 
        q.toLowerCase().includes(query) || 
        category.title.toLowerCase().includes(query) ||
        category.description.toLowerCase().includes(query)
      );
      
      if (matchingQuestions.length > 0 || category.title.toLowerCase().includes(query)) {
        return {
          ...category,
          questions: matchingQuestions.length > 0 ? matchingQuestions : category.questions
        };
      }
      return null;
    }).filter(Boolean) as typeof HELP_CATEGORIES;

    setFilteredCategories(filtered);
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Mobile App Header */}
      <MobileAppHeader show={isMobile} title="Help Center" />

      {/* Desktop Header */}
      {!isMobile && (
        <header className="glass-effect border-b border-white/20 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full celebration-gradient flex items-center justify-center">
                <Cake className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold gradient-text">Help Center</h1>
            </div>
            <button
              onClick={() => router.push(user ? '/dashboard' : '/')}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              {user ? 'Back to Dashboard' : 'Go Home'}
            </button>
          </div>
        </header>
      )}

      <main className={`max-w-7xl mx-auto ${isMobile ? 'px-4 pt-20 pb-24' : 'px-4 py-12'}`}>
        {/* Hero Section */}
        <div className="text-center mb-8 md:mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full celebration-gradient mb-4 md:mb-6">
              <HelpCircle className="w-10 h-10 md:w-12 md:h-12 text-white" />
            </div>
            <h1 className="text-3xl md:text-5xl font-black gradient-text mb-3 md:mb-4">
              How can we help you celebrate? 🎉
            </h1>
            <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
              Find answers to common questions or get in touch with our support team
            </p>
          </motion.div>
        </div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8 md:mb-12"
        >
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for help... (e.g., 'create wall', 'tribe room', 'gifts')"
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

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 md:mb-12 max-w-2xl mx-auto"
        >
          {QUICK_LINKS.map((link, index) => (
            <motion.button
              key={link.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
              onClick={() => router.push(link.href)}
              className={`${link.color} text-white rounded-xl p-4 md:p-6 flex items-center justify-between shadow-lg hover:shadow-xl transition-all transform hover:scale-105`}
            >
              <div className="flex items-center gap-3">
                <link.icon className="w-6 h-6 md:w-8 md:h-8" />
                <span className="font-bold text-base md:text-lg">{link.title}</span>
              </div>
              <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
            </motion.button>
          ))}
        </motion.div>

        {/* Help Categories */}
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-8 gradient-text">
            {searchQuery ? `Search Results (${filteredCategories.length})` : 'Browse by Category'}
          </h2>
          
          {filteredCategories.length === 0 ? (
            <div className="text-center py-12">
              <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-2">No results found</p>
              <p className="text-gray-500 text-sm">Try different keywords or browse categories below</p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'} gap-4 md:gap-6`}>
              {filteredCategories.map((category, index) => {
                const Icon = category.icon;
                return (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    onClick={() => router.push(`/faq?category=${category.id}`)}
                    className="glass-effect rounded-2xl p-5 md:p-6 cursor-pointer hover:shadow-2xl transition-all transform hover:scale-105 border-2 border-transparent hover:border-primary-300"
                  >
                    <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-4`}>
                      <Icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
                    </div>
                    <h3 className="font-bold text-lg md:text-xl mb-2 gradient-text">{category.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{category.description}</p>
                    <div className="space-y-2">
                      {category.questions.slice(0, 3).map((question, qIndex) => (
                        <div key={qIndex} className="flex items-start gap-2 text-sm text-gray-500">
                          <span className="text-primary-600 mt-1">•</span>
                          <span className="line-clamp-2">{question}</span>
                        </div>
                      ))}
                      {category.questions.length > 3 && (
                        <p className="text-primary-600 text-sm font-semibold mt-2">
                          +{category.questions.length - 3} more questions
                        </p>
                      )}
                    </div>
                    <div className="mt-4 flex items-center text-primary-600 font-semibold text-sm">
                      <span>View all</span>
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Still Need Help Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 md:mt-16"
        >
          <div className="glass-effect rounded-3xl p-6 md:p-8 text-center border-2 border-primary-200">
            <MessageCircle className="w-12 h-12 md:w-16 md:h-16 text-primary-600 mx-auto mb-4" />
            <h3 className="text-2xl md:text-3xl font-bold gradient-text mb-3">Still need help?</h3>
            <p className="text-gray-600 mb-6 max-w-xl mx-auto">
              Can't find what you're looking for? Our support team is here to help you celebrate!
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

