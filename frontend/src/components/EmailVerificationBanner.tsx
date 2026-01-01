'use client';

import { useState } from 'react';
import { sendEmailVerification, reload } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Mail, X, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface EmailVerificationBannerProps {
  userEmail: string;
  emailVerified: boolean;
  onVerificationCheck?: () => void;
}

export function EmailVerificationBanner({ 
  userEmail, 
  emailVerified,
  onVerificationCheck 
}: EmailVerificationBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Don't show if email is verified or banner is dismissed
  if (emailVerified || isDismissed) return null;

  const handleResendVerification = async () => {
    const user = auth.currentUser;
    if (!user) return;

    setIsSending(true);
    try {
      await sendEmailVerification(user);
      toast.success('Verification email sent! Please check your inbox 📧');
    } catch (error: any) {
      console.error('Error sending verification email:', error);
      toast.error(error.message || 'Failed to send verification email');
    } finally {
      setIsSending(false);
    }
  };

  const handleCheckVerification = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      await reload(user);
      if (user.emailVerified) {
        toast.success('Email verified! 🎉');
        onVerificationCheck?.();
      } else {
        toast.error('Email not yet verified. Please check your inbox.');
      }
    } catch (error: any) {
      console.error('Error checking verification:', error);
      toast.error('Failed to check verification status');
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4"
      >
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-yellow-800">
              Please verify your email address
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                We've sent a verification email to <strong>{userEmail}</strong>.
                Please check your inbox and click the verification link to activate your account.
              </p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={handleResendVerification}
                disabled={isSending}
                className="inline-flex items-center gap-2 px-3 py-2 border border-transparent text-sm font-medium rounded-md text-yellow-800 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Mail className="w-4 h-4" />
                {isSending ? 'Sending...' : 'Resend Email'}
              </button>
              <button
                onClick={handleCheckVerification}
                className="inline-flex items-center gap-2 px-3 py-2 border border-transparent text-sm font-medium rounded-md text-yellow-800 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                <CheckCircle className="w-4 h-4" />
                I've Verified
              </button>
            </div>
          </div>
          <div className="ml-auto pl-3">
            <button
              onClick={() => setIsDismissed(true)}
              className="inline-flex text-yellow-400 hover:text-yellow-500 focus:outline-none"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

