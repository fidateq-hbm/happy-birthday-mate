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
            <h2 className="text-2xl md:text-3xl font-bold gradient-text mb-4">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Happy Birthday Mate ("we", "our", "us") respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, store, disclose, and safeguard your information when you use our website, mobile services, and related platforms (collectively, the "Service").
            </p>
            <p className="text-gray-700 leading-relaxed">
              By accessing or using Happy Birthday Mate, you agree to the practices described in this Privacy Policy.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold gradient-text mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl md:text-2xl font-semibold text-gray-800 mb-3">a. Information You Provide</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may collect:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
              <li>Name or username</li>
              <li>Email address</li>
              <li>Date of birth (day and month only, where applicable)</li>
              <li>Profile photos or uploaded media</li>
              <li>Messages, posts, and interactions within Birthday Walls or Tribe Rooms</li>
              <li>Payment-related metadata (transaction references, amounts, status — not card details)</li>
            </ul>

            <h3 className="text-xl md:text-2xl font-semibold text-gray-800 mb-3 mt-6">b. Automatically Collected Information</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>IP address</li>
              <li>Device and browser type</li>
              <li>Usage logs and interaction data</li>
              <li>Cookies and similar technologies</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold gradient-text mb-4">3. Authentication & Account Security</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Authentication is handled securely via third-party providers.</li>
              <li>We do not store passwords.</li>
              <li>Secure tokens are used to manage sessions.</li>
              <li>Users are responsible for safeguarding their login credentials.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold gradient-text mb-4">4. How We Use Your Information</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use your information to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Provide and improve the Service</li>
              <li>Match users by birthday</li>
              <li>Enable celebrations, interactions, and digital gifts</li>
              <li>Process payments and prevent fraud</li>
              <li>Communicate updates, service notices, or support messages</li>
              <li>Ensure platform safety, integrity, and compliance</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold gradient-text mb-4">5. Payments & Financial Data</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Payments on Happy Birthday Mate are processed by third-party payment processors, including Flutterwave.
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
              <li>We do not collect or store card or bank details.</li>
              <li>Payment data is handled directly by the payment provider under their own privacy policies.</li>
              <li>Transaction records may be stored for reconciliation, compliance, and dispute resolution.</li>
            </ul>
            <p className="text-gray-700 leading-relaxed font-semibold">
              Merchant Notice:
            </p>
            <p className="text-gray-700 leading-relaxed">
              Payments may appear under our registered business entity name on bank statements.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold gradient-text mb-4">6. Cookies & Tracking</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use cookies to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
              <li>Maintain sessions</li>
              <li>Improve performance</li>
              <li>Understand user behavior</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              You may control cookies through your browser settings.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold gradient-text mb-4">7. Data Sharing & Disclosure</h2>
            <p className="text-gray-700 leading-relaxed mb-4 font-semibold">
              We do not sell your personal data.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may share information:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>With trusted service providers (hosting, analytics, payment processors)</li>
              <li>To comply with legal obligations</li>
              <li>To protect the rights, safety, or integrity of users and the platform</li>
            </ul>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold gradient-text mb-4">8. International Users</h2>
            <p className="text-gray-700 leading-relaxed">
              Happy Birthday Mate is accessible globally. By using the Service, you consent to the transfer and processing of your data across borders in accordance with applicable laws.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold gradient-text mb-4">9. Data Security</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We apply industry-standard safeguards including:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
              <li>HTTPS/TLS encryption</li>
              <li>Secure access controls</li>
              <li>Input validation and abuse prevention</li>
              <li>Restricted administrative access</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              However, no system is 100% immune from risk.
            </p>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold gradient-text mb-4">10. Data Retention</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We retain personal data only for as long as necessary to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
              <li>Provide the Service</li>
              <li>Meet legal, accounting, or regulatory obligations</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              Users may request account deletion where applicable.
            </p>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold gradient-text mb-4">11. Your Rights</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Depending on your location, you may have rights to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
              <li>Access your data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion</li>
              <li>Withdraw consent</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              Requests can be made via our support contact.
            </p>
          </section>

          {/* Section 12 */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold gradient-text mb-4">12. Children's Privacy</h2>
            <p className="text-gray-700 leading-relaxed">
              Happy Birthday Mate is not intended for children under 13. We do not knowingly collect data from minors.
            </p>
          </section>

          {/* Section 13 */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold gradient-text mb-4">13. Changes to This Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy periodically. Changes will be posted on this page with an updated revision date.
            </p>
          </section>

          {/* Section 14 */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold gradient-text mb-4">14. Contact</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              For privacy-related inquiries, contact:
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

