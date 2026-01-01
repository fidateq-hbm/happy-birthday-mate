'use client';

import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { AuthProvider } from '@/components/auth/AuthProvider';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const router = useRouter();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // PERMANENT FIX: Remove actionCodeSettings entirely
      // Let Firebase handle the action on their own domain, which works reliably
      // Firebase will redirect back to our app after processing
      console.log('Sending password reset email to:', email);
      console.log('Firebase will handle the action on their domain and redirect back to our app');
      
      await sendPasswordResetEmail(auth, email);
      setEmailSent(true);
      toast.success('Password reset email sent! Check your inbox 📧');
    } catch (error: any) {
      // Handle specific Firebase errors with user-friendly messages
      let errorMessage = 'Failed to send password reset email. Please try again.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address. Please check your email or sign up.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please try again later.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthProvider>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </Link>

          <div className="glass-effect rounded-3xl p-8 space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold gradient-text">Reset Password</h2>
              <p className="text-gray-600 mt-2">
                {emailSent 
                  ? 'Check your email for reset instructions' 
                  : 'Enter your email to receive a password reset link'}
              </p>
            </div>

            {emailSent ? (
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-700 font-medium">
                    Password reset email sent!
                  </p>
                  <p className="text-sm text-gray-600">
                    We've sent a password reset link to <strong>{email}</strong>
                  </p>
                  <p className="text-xs text-gray-500 mt-4">
                    Please check your inbox and click the link to reset your password.
                    The link will expire in 1 hour.
                  </p>
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-left">
                    <p className="text-xs text-blue-800 font-semibold mb-1">💡 Having trouble?</p>
                    <p className="text-xs text-blue-700">
                      If the reset link doesn't work automatically, you can copy the full link from the email and paste it into the manual entry form that will appear.
                    </p>
                  </div>
                </div>
                <div className="pt-4 space-y-3">
                  <button
                    onClick={() => {
                      setEmailSent(false);
                      setEmail('');
                    }}
                    className="w-full text-primary-600 hover:text-primary-700 font-semibold text-sm"
                  >
                    Send another email
                  </button>
                  <Link
                    href="/login"
                    className="block w-full celebration-gradient text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-all text-center"
                  >
                    Back to Login
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="you@example.com"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Enter the email address associated with your account
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full celebration-gradient text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            )}

            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                Remember your password?{' '}
                <Link href="/login" className="text-primary-600 font-semibold hover:underline">
                  Log in
                </Link>
              </p>
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link href="/signup" className="text-primary-600 font-semibold hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </AuthProvider>
  );
}

