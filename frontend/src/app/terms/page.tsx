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
            Last updated: January 2026
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
              By accessing or using Happy Birthday Mate, you agree to be bound by these Terms of Service ("Terms"). If you do not agree, do not use the Service.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold gradient-text mb-4">2. Description of Service</h2>
            <p className="text-gray-700 leading-relaxed">
              Happy Birthday Mate is a digital celebration platform that connects people who share birthdays and enables social interaction, celebrations, and optional paid features.
            </p>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold gradient-text mb-4">3. Eligibility</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You must:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Be at least 13 years old</li>
              <li>Provide accurate information</li>
              <li>Use the Service for lawful purposes only</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold gradient-text mb-4">4. User Accounts</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You are responsible for:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Maintaining the confidentiality of your account</li>
              <li>All activities conducted under your account</li>
              <li>Ensuring content you post complies with these Terms</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold gradient-text mb-4">5. User Conduct</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You agree not to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
              <li>Harass, abuse, or harm others</li>
              <li>Impersonate any person or entity</li>
              <li>Upload malicious, illegal, or offensive content</li>
              <li>Attempt to breach platform security</li>
              <li>Exploit or scrape platform data</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              Violations may result in suspension or termination.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold gradient-text mb-4">6. Content Ownership</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
              <li>You retain ownership of content you create.</li>
              <li>By posting content, you grant Happy Birthday Mate a non-exclusive, royalty-free license to display and distribute it within the platform.</li>
              <li>We reserve the right to remove content that violates these Terms.</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold gradient-text mb-4">7. Payments & Paid Features</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
              <li>Some features may require payment.</li>
              <li>Payments are processed by third-party providers such as Flutterwave.</li>
              <li>Fees, pricing, and charges will be clearly disclosed before purchase.</li>
              <li>Transaction fees or international processing fees may apply.</li>
              <li>All payments are final unless otherwise required by law.</li>
              <li><strong>Withdrawal availability depends on supported payment providers by country.</strong> Some regions may have limited withdrawal options or processing delays due to provider availability and local regulations.</li>
              <li>Birthday Coins can be converted to cash and withdrawn, subject to available payment methods in your country.</li>
            </ul>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold gradient-text mb-4">8. Refunds</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Refunds, where applicable, are subject to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>The nature of the service</li>
              <li>Applicable laws</li>
              <li>Payment processor policies</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Digital goods and virtual features may be non-refundable.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold gradient-text mb-4">9. Platform Availability</h2>
            <p className="text-gray-700 leading-relaxed">
              We aim for continuous availability but do not guarantee uninterrupted access. Maintenance, updates, or external issues may cause downtime.
            </p>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold gradient-text mb-4">10. Disclaimer of Warranties</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              The Service is provided "as is" and "as available."
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              We make no warranties regarding:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Continuous operation</li>
              <li>Error-free performance</li>
              <li>User behavior or interactions</li>
            </ul>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold gradient-text mb-4">11. Limitation of Liability</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              To the maximum extent permitted by law, Happy Birthday Mate shall not be liable for:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Indirect or consequential damages</li>
              <li>Loss of data or revenue</li>
              <li>User-generated content or interactions</li>
            </ul>
          </section>

          {/* Section 12 */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold gradient-text mb-4">12. Indemnification</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You agree to indemnify and hold Happy Birthday Mate harmless from claims arising from:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Your use of the Service</li>
              <li>Violation of these Terms</li>
              <li>Infringement of third-party rights</li>
            </ul>
          </section>

          {/* Section 13 */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold gradient-text mb-4">13. Termination</h2>
            <p className="text-gray-700 leading-relaxed">
              We may suspend or terminate access at our discretion if these Terms are violated or for platform integrity reasons.
            </p>
          </section>

          {/* Section 14 */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold gradient-text mb-4">14. Governing Law</h2>
            <p className="text-gray-700 leading-relaxed">
              These Terms shall be governed by the laws of the Federal Republic of Nigeria, without regard to conflict of law principles.
            </p>
          </section>

          {/* Section 15 */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold gradient-text mb-4">15. Changes to Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              We may modify these Terms at any time. Continued use of the Service constitutes acceptance of updated Terms.
            </p>
          </section>

          {/* Section 16 */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold gradient-text mb-4">16. Contact</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              For questions or support:
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

