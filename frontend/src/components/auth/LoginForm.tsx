'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Mail, Lock, Chrome } from 'lucide-react';
import Link from 'next/link';
import { authAPI } from '@/lib/api';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Reload user to get latest email verification status
      await user.reload();
      
      // Check if user exists in backend (completed onboarding)
      try {
        // Note: getMe() uses Authorization header from Firebase token automatically
        await authAPI.getMe();
        // User exists in backend - redirect to dashboard
        if (!user.emailVerified) {
          toast('Please verify your email address to access all features', { 
            icon: '📧',
            duration: 5000 
          });
        } else {
          toast.success('Welcome back! 🎉');
        }
        router.push('/dashboard');
      } catch (backendError: any) {
        // User doesn't exist in backend - incomplete signup, redirect to onboarding
        if (!user.emailVerified) {
          toast('Please verify your email address first', { 
            icon: '📧',
            duration: 5000 
          });
        }
        toast.success('Welcome back! Let\'s complete your profile 🎉');
        router.push('/onboarding');
      }
    } catch (error: any) {
      // Handle specific Firebase errors with user-friendly messages
      let errorMessage = 'Failed to log in. Please try again.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address. Please sign up first or check your email.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again or reset your password.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled. Please contact support for assistance.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed login attempts. Please try again later or reset your password.';
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

  const handleGoogleLogin = async () => {
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      
      // Check if user exists in backend
      // If not, redirect to onboarding
      try {
        // Note: getMe() uses Authorization header from Firebase token automatically
        await authAPI.getMe();
        toast.success('Welcome back! 🎉');
        router.push('/dashboard');
      } catch {
        // User doesn't exist, redirect to onboarding
        router.push('/onboarding');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to log in with Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md glass-effect rounded-3xl p-8 space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold gradient-text">Welcome Back!</h2>
        <p className="text-gray-600 mt-2">Log in to celebrate together</p>
      </div>

      <button
        onClick={handleGoogleLogin}
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
          <span className="px-4 bg-white text-gray-500">Or continue with email</span>
        </div>
      </div>

      <form onSubmit={handleEmailLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
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
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Link
            href="/forgot-password"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full celebration-gradient text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-600">
        Don&apos;t have an account?{' '}
        <a href="/signup" className="text-primary-600 font-semibold hover:underline">
          Sign up
        </a>
      </p>
    </div>
  );
}

