'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, ArrowLeft, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { MobileAppHeader } from '@/components/MobileAppHeader';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { useAuthStore } from '@/store/authStore';
import { usePageMetadata } from '@/hooks/usePageMetadata';

export default function TermsOfServicePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isMobile, setIsMobile] = useState(false);

  usePageMetadata({
    title: 'Terms of Service',
    description: 'Read Happy Birthday Mate\'s Terms of Service. Understand the rules and guidelines for using our celebration platform.',
    keywords: [
      'terms of service',
      'terms and conditions',
      'user agreement',
      'platform rules',
      'terms',
    ],
    canonical: '/terms',
  });

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Mobile App Header */}
      <MobileAppHeader show={isMobile} title="Terms of Service" />

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
            <h1 className="text-2xl font-bold gradient-text">Terms of Service</h1>
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
            <FileText className="w-10 h-10 md:w-12 md:h-12 text-white" />
          </div>
          <h1 className="text-3xl md:text-5xl font-black gradient-text mb-3 md:mb-4">
            Terms of Service
          </h1>
          <p className="text-gray-600 text-base md:text-lg">
            <strong>Happy Birthday Mate</strong>
          </p>
          <p className="text-gray-500 text-sm md:text-base mt-2">
            Effective Date: January 1, 2026
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
            <h2 className="text-2xl md:text-3xl font-bold gradient-text mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              By accessing or using Happy Birthday Mate, you agree to these Terms of Service.
            </p>
            <p className="text-gray-700 leading-relaxed">
              If you do not agree, please do not use the platform.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold gradient-text mb-4">2. Nature of the Platform</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Happy Birthday Mate is:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
              <li>A time-bound digital celebration platform</li>
              <li>Not a social network</li>
              <li>Not a marketplace</li>
              <li>Not a dating or planning service</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              Celebration spaces open and close automatically.
            </p>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold gradient-text mb-4">3. Eligibility</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You must:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Provide accurate information</li>
              <li>Have consent if registering on behalf of another person</li>
              <li>Be legally permitted to use digital services in your country</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold gradient-text mb-4">4. User Accounts</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You are responsible for:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
              <li>Maintaining account security</li>
              <li>Activities conducted under your account</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to suspend or terminate accounts for violations.
            </p>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold gradient-text mb-4">5. Acceptable Use</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You agree not to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Harass, abuse, or threaten others</li>
              <li>Upload offensive or illegal content</li>
              <li>Impersonate others</li>
              <li>Attempt to access unauthorized areas</li>
              <li>Exploit celebrants or guests</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold gradient-text mb-4">6. Content & Celebrations</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Celebration content is temporary by design</li>
              <li>We may moderate or remove content that violates platform rules</li>
              <li>You retain ownership of content you upload, but grant us permission to display it during celebrations</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold gradient-text mb-4">7. Payments & Digital Goods</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              When enabled:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Digital gifts and services are non-refundable unless required by law</li>
              <li>Prices may change</li>
              <li>Availability may vary by country</li>
              <li>We reserve the right to add or remove monetization features.</li>
            </ul>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold gradient-text mb-4">8. Third-Party Services</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Happy Birthday Mate may integrate:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
              <li>Payment processors</li>
              <li>AI services</li>
              <li>Fulfillment providers (for branded merchandise)</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              We are not responsible for third-party service failures.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold gradient-text mb-4">9. Platform Availability</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We strive for reliability but do not guarantee uninterrupted access.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              The platform may be unavailable due to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Maintenance</li>
              <li>Updates</li>
              <li>Technical issues</li>
            </ul>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold gradient-text mb-4">10. Limitation of Liability</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Happy Birthday Mate is provided "as is."
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              We are not liable for:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Emotional outcomes of celebrations</li>
              <li>Missed messages or gifts</li>
              <li>Third-party failures</li>
              <li>Indirect or consequential damages</li>
            </ul>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold gradient-text mb-4">11. Termination</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You may stop using the platform at any time.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may suspend or terminate access if:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Terms are violated</li>
              <li>Legal compliance requires it</li>
            </ul>
          </section>

          {/* Section 12 */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold gradient-text mb-4">12. Governing Law</h2>
            <p className="text-gray-700 leading-relaxed">
              These Terms are governed by applicable international principles and local laws where required.
            </p>
          </section>

          {/* Section 13 */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold gradient-text mb-4">13. Contact</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              For questions or disputes:
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

