'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Send, Sparkles, MessageCircle, Clock, CheckCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { MobileAppHeader } from '@/components/MobileAppHeader';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { useAuthStore } from '@/store/authStore';
import { userAPI } from '@/lib/api';

const CONTACT_REASONS = [
  { value: 'account', label: 'Account Issue', emoji: '👤' },
  { value: 'technical', label: 'Technical Problem', emoji: '🔧' },
  { value: 'feature', label: 'Feature Request', emoji: '💡' },
  { value: 'feedback', label: 'Feedback', emoji: '💬' },
  { value: 'gift', label: 'Gift Issue', emoji: '🎁' },
  { value: 'wall', label: 'Birthday Wall', emoji: '📸' },
  { value: 'tribe', label: 'Tribe Room', emoji: '👥' },
  { value: 'other', label: 'Other', emoji: '❓' },
];

export default function ContactPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isMobile, setIsMobile] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'other',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.first_name || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      await userAPI.submitContactForm({
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        user_id: user?.id
      });
      
      toast.success('Message sent successfully! We\'ll get back to you soon. 🎉');
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: 'other', message: '' });
    } catch (error: any) {
      console.error('Error submitting contact form:', error);
      let errorMessage = 'Failed to send message. Please try again or email us directly.';
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <MobileAppHeader show={isMobile} title="Contact Us" />
        <div className={`max-w-2xl mx-auto ${isMobile ? 'px-4 pt-20 pb-24' : 'px-4 py-12'}`}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-effect rounded-3xl p-8 md:p-12 text-center"
          >
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 md:w-16 md:h-16 text-green-600" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-4">
              Message Sent! 🎉
            </h2>
            <p className="text-gray-600 text-lg mb-8">
              Thank you for reaching out! We typically respond within 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  setSubmitted(false);
                  router.push('/help');
                }}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Back to Help Center
              </button>
              <button
                onClick={() => setSubmitted(false)}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Send Another Message
              </button>
            </div>
          </motion.div>
        </div>
        {user && <MobileBottomNav show={isMobile} />}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Mobile App Header */}
      <MobileAppHeader show={isMobile} title="Contact Us" />

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
            <h1 className="text-2xl font-bold gradient-text">Contact Us</h1>
          </div>
        </header>
      )}

      <main className={`max-w-4xl mx-auto ${isMobile ? 'px-4 pt-20 pb-24' : 'px-4 py-12'}`}>
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 md:mb-12"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full celebration-gradient mb-4 md:mb-6">
            <MessageCircle className="w-10 h-10 md:w-12 md:h-12 text-white" />
          </div>
          <h1 className="text-3xl md:text-5xl font-black gradient-text mb-3 md:mb-4">
            We'd love to hear from you! 💌
          </h1>
          <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
            Have a question, suggestion, or need help? Send us a message and we'll get back to you as soon as possible.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8 mb-8 md:mb-12">
          {/* Contact Methods */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-1 space-y-4"
          >
            <div className="glass-effect rounded-2xl p-6 text-center">
              <Mail className="w-8 h-8 text-primary-600 mx-auto mb-3" />
              <h3 className="font-bold text-lg mb-2">Email Us</h3>
              <a
                href="mailto:support@happybirthdaymate.com"
                className="text-primary-600 hover:underline break-all text-sm"
              >
                support@happybirthdaymate.com
              </a>
            </div>

            <div className="glass-effect rounded-2xl p-6 text-center">
              <Clock className="w-8 h-8 text-primary-600 mx-auto mb-3" />
              <h3 className="font-bold text-lg mb-2">Response Time</h3>
              <p className="text-gray-600 text-sm">
                We typically respond within <span className="font-semibold text-primary-600">24 hours</span>
              </p>
            </div>

            <div className="glass-effect rounded-2xl p-6 text-center">
              <Sparkles className="w-8 h-8 text-primary-600 mx-auto mb-3" />
              <h3 className="font-bold text-lg mb-2">Before You Contact</h3>
              <p className="text-gray-600 text-sm mb-3">
                Check our FAQ for quick answers
              </p>
              <button
                onClick={() => router.push('/faq')}
                className="text-primary-600 hover:underline font-semibold text-sm"
              >
                View FAQ →
              </button>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="md:col-span-2"
          >
            <form onSubmit={handleSubmit} className="glass-effect rounded-3xl p-6 md:p-8 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-200 outline-none transition-all"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-200 outline-none transition-all"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  What can we help you with? *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {CONTACT_REASONS.map((reason) => (
                    <button
                      key={reason.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, subject: reason.value })}
                      className={`p-3 rounded-xl border-2 transition-all text-center ${
                        formData.subject === reason.value
                          ? 'border-primary-500 bg-primary-50 shadow-lg scale-105'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{reason.emoji}</div>
                      <div className="text-xs font-medium">{reason.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Message *
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-200 outline-none transition-all resize-none"
                  placeholder="Tell us how we can help you celebrate better..."
                />
                <p className="text-xs text-gray-500 mt-2">
                  {formData.message.length} characters
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full celebration-gradient text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      {user && <MobileBottomNav show={isMobile} />}
    </div>
  );
}

