'use client';

import { useState, Suspense } from 'react';
import { createUserWithEmailAndPassword, signInWithPopup, sendEmailVerification, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { Chrome, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { authAPI } from '@/lib/api';

function SignupPageContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Send email verification
      await sendEmailVerification(user);
      
      toast.success('Account created! Please check your email to verify your account 📧');
      router.push(`/onboarding?redirect=${encodeURIComponent(redirectTo)}`);
    } catch (error: any) {
      // Handle specific Firebase errors with user-friendly messages
      let errorMessage = 'Failed to create account. Please try again.';
      
      if (error.code === 'auth/email-already-in-use') {
        // Email exists in Firebase - check if user completed onboarding
        try {
          // Try to sign in with the provided credentials to check if password is correct
          const signInResult = await signInWithEmailAndPassword(auth, email, password);
          const firebaseUser = signInResult.user;
          
          // Check if user exists in backend (completed onboarding)
          // Note: getMe() uses Authorization header from Firebase token automatically
          try {
            await authAPI.getMe();
            // User exists in backend - they completed signup
            toast.error('This email is already registered. Please log in instead.');
            router.push('/login');
          } catch (backendError: any) {
            // User doesn't exist in backend - incomplete signup
            // Send verification email if not already verified
            if (!firebaseUser.emailVerified) {
              await sendEmailVerification(firebaseUser);
            }
            toast.success('Welcome back! Let\'s complete your profile 🎉');
            router.push(`/onboarding?redirect=${encodeURIComponent(redirectTo)}`);
          }
          return; // Exit early since we handled the incomplete signup
        } catch (signInError: any) {
          // Password is wrong or other sign-in error
          if (signInError.code === 'auth/wrong-password') {
            errorMessage = 'This email is already registered, but the password is incorrect. Please log in with your existing password, or use "Forgot Password" to reset it.';
          } else if (signInError.code === 'auth/user-disabled') {
            errorMessage = 'This account has been disabled. Please contact support for assistance.';
          } else {
            errorMessage = 'This email is already registered. Please log in instead, or use a different email address.';
          }
        }
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use at least 6 characters with a mix of letters and numbers.';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Email/password signup is currently disabled. Please use Google sign-in or contact support.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.message) {
        // Fallback to Firebase error message if it's user-friendly
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      
      // Check if user already exists
      // Note: getMe() uses Authorization header from Firebase token automatically
      try {
        await authAPI.getMe();
        toast.success('Welcome back! 🎉');
        router.push(redirectTo);
      } catch {
        // New user, go to onboarding
        toast.success('Account created! Let\'s complete your profile 🎉');
        router.push(`/onboarding?redirect=${encodeURIComponent(redirectTo)}`);
      }
    } catch (error: any) {
      // Handle specific Firebase errors with user-friendly messages
      let errorMessage = 'Failed to sign up with Google. Please try again.';
      
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in was cancelled. Please try again if you want to continue.';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Popup was blocked by your browser. Please allow popups for this site and try again.';
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
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>

          <div className="glass-effect rounded-3xl p-8 space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold gradient-text">Join the Celebration!</h2>
              <p className="text-gray-600 mt-2">Create your account to start celebrating</p>
            </div>

            <button
              onClick={handleGoogleSignup}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 hover:border-primary-500 rounded-xl px-6 py-3 font-semibold transition-all hover:shadow-lg disabled:opacity-50"
            >
              <Chrome className="w-5 h-5" />
              Continue with Google
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Or with email</span>
              </div>
            </div>

            <form onSubmit={handleEmailSignup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="••••••••"
                />
                <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full celebration-gradient text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <a href={`/login?redirect=${encodeURIComponent(redirectTo)}`} className="text-primary-600 font-semibold hover:underline">
                Log in
              </a>
            </p>
          </div>
        </div>
      </div>
    </AuthProvider>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <SignupPageContent />
    </Suspense>
  );
}
