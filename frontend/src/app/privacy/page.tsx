'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, ArrowLeft, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { MobileAppHeader } from '@/components/MobileAppHeader';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { useAuthStore } from '@/store/authStore';
import { usePageMetadata } from '@/hooks/usePageMetadata';

export default function PrivacyPolicyPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Mobile App Header */}
      <MobileAppHeader show={isMobile} title="Privacy Policy" />

      {/* Desktop Header */}
      {!isMobile && (
        <header className="glass-effect border-b border-white/20 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
            <button
              onClick={() => router.push(user ? '/dashboard' : '/')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold gradient-text">Privacy Policy</h1>
          </div>
        </header>
      )}

      <main className={`max-w-4xl mx-auto ${isMobile ? 'px-4 pt-20 pb-24' : 'px-4 py-12'}`}>
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 md:mb-12"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full celebration-gradient mb-4 md:mb-6">
            <Shield className="w-10 h-10 md:w-12 md:h-12 text-white" />
          </div>
          <h1 className="text-3xl md:text-5xl font-black gradient-text mb-3 md:mb-4">
            Privacy Policy
          </h1>
          <p className="text-gray-600 text-base md:text-lg">
            <strong>Happy Birthday Mate</strong>
          </p>
          <p className="text-gray-500 text-sm md:text-base mt-2">
            Effective Date: January 1, 2026
          </p>
          <p className="text-gray-500 text-sm md:text-base">
            Website: <a href="https://www.happybirthdaymate.com" className="text-primary-600 hover:underline">https://www.happybirthdaymate.com</a>
          </p>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-effect rounded-3xl p-6 md:p-10 space-y-8 md:space-y-10"
        >
          {/* Section 1 */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold gradient-text mb-4">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Happy Birthday Mate ("we," "our," "us") respects your privacy and is committed to protecting your personal data.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              This Privacy Policy explains:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
              <li>What data we collect</li>
              <li>Why we collect it</li>
              <li>How we use and protect it</li>
              <li>Your rights regarding your data</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              Happy Birthday Mate is a celebration platform, not a social network or marketplace.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold gradient-text mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl md:text-2xl font-semibold text-gray-800 mb-3">A. Information You Provide Directly</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              When you create an account or use the platform, we may collect:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
              <li>First name</li>
              <li>Date of birth (day & month used for birthday matching)</li>
              <li>Gender (optional)</li>
              <li>Country and state</li>
              <li>Profile photo</li>
              <li>Email address</li>
              <li>Consent confirmation</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-4">
              <strong>Optional:</strong>
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
              <li>City (non-precise, text only)</li>
            </ul>

            <h3 className="text-xl md:text-2xl font-semibold text-gray-800 mb-3 mt-6">B. Automatically Collected Information</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
              <li>Device type and browser (for security and performance)</li>
              <li>IP address (used only for fraud prevention and regional routing)</li>
              <li>Basic usage data (e.g., pages visited, feature usage)</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-4">
              <strong>We do not collect:</strong>
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Exact GPS location</li>
              <li>Interests or personality profiles</li>
              <li>Emotional or mental health diagnoses</li>
              <li>Relationship or contact graphs</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold gradient-text mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use your information to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
              <li>Assign you to your birthday tribe</li>
              <li>Enable birthday rooms and celebrations</li>
              <li>Display celebrants (only with consent)</li>
              <li>Generate personalized birthday messages</li>
              <li>Improve platform performance and security</li>
              <li>Comply with legal obligations</li>
            </ul>
            <p className="text-gray-700 leading-relaxed font-semibold">
              We do not sell personal data.
            </p>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold gradient-text mb-4">4. AI Usage</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Happy Birthday Mate uses AI to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
              <li>Generate personalized birthday quotes</li>
              <li>Curate joyful celebratory content</li>
              <li>Detect harmful or abusive content for safety</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-4">
              <strong>AI processing:</strong>
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Does not profile emotional health</li>
              <li>Does not make automated decisions about users</li>
              <li>Is used strictly for celebration and moderation purposes</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold gradient-text mb-4">5. Cookies & Tracking</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use minimal cookies for:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
              <li>Authentication</li>
              <li>Security</li>
              <li>Session management</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              We do not use third-party ad trackers in V1.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold gradient-text mb-4">6. Payments</h2>
            <p className="text-gray-700 leading-relaxed">
              When payments are enabled:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mt-4">
              <li>Payments are processed by third-party providers (e.g., Paystack, Flutterwave, Lemon Squeezy)</li>
              <li>We do not store your card or bank details</li>
              <li>Payment providers have their own privacy policies.</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold gradient-text mb-4">7. Data Sharing</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may share limited data only with:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
              <li>Hosting and infrastructure providers</li>
              <li>Payment processors (when applicable)</li>
              <li>Legal authorities if required by law</li>
            </ul>
            <p className="text-gray-700 leading-relaxed font-semibold">
              We never share data for advertising resale.
            </p>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold gradient-text mb-4">8. Data Retention</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Account data is retained while your account is active</li>
              <li>Celebration content is temporary by design</li>
              <li>You may request account deletion at any time</li>
            </ul>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold gradient-text mb-4">9. Your Rights</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Depending on your location, you may have the right to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
              <li>Access your data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion</li>
              <li>Withdraw consent</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              Requests can be made via:
            </p>
            <div className="mt-4 flex items-center gap-2 text-primary-600">
              <Mail className="w-5 h-5" />
              <a href="mailto:support@happybirthdaymate.com" className="font-semibold hover:underline">
                support@happybirthdaymate.com
              </a>
            </div>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold gradient-text mb-4">10. Children's Privacy</h2>
            <p className="text-gray-700 leading-relaxed">
              Happy Birthday Mate may be used by minors with parental or guardian consent.
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              We do not knowingly collect data from children without consent.
            </p>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold gradient-text mb-4">11. Changes to This Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy from time to time.
              Material changes will be communicated clearly on the platform.
            </p>
          </section>

          {/* Section 12 */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold gradient-text mb-4">12. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              For privacy questions:
            </p>
            <div className="flex items-center gap-2 text-primary-600">
              <Mail className="w-5 h-5" />
              <a href="mailto:support@happybirthdaymate.com" className="font-semibold hover:underline">
                support@happybirthdaymate.com
              </a>
            </div>
          </section>
        </motion.div>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 text-center"
        >
          <button
            onClick={() => router.push(user ? '/dashboard' : '/')}
            className="celebration-gradient text-white px-8 py-3 rounded-full font-bold hover:shadow-xl transition-all transform hover:scale-105"
          >
            Back to {user ? 'Dashboard' : 'Home'}
          </button>
        </motion.div>
      </main>

      {/* Mobile Bottom Navigation */}
      {user && <MobileBottomNav show={isMobile} />}
    </div>
  );
}

