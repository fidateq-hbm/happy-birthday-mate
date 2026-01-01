'use client';

import { useState, useEffect } from 'react';
import { confirmPasswordReset } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { Lock, CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { AuthProvider } from '@/components/auth/AuthProvider';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [email, setEmail] = useState('');
  const [oobCode, setOobCode] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Also check window.location for code (Firebase might put it in hash or full URL)
  const getCodeFromAnywhere = (): string | null => {
    // Check URL search params first
    const fromParams = searchParams.get('oobCode') || searchParams.get('oobcode') || searchParams.get('code');
    if (fromParams) return fromParams;
    
    // Check window.location.search (in case Next.js searchParams doesn't catch it)
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const fromUrl = urlParams.get('oobCode') || urlParams.get('oobcode') || urlParams.get('code');
      if (fromUrl) return fromUrl;
      
      // Check hash fragment (Firebase sometimes uses this)
      const hash = window.location.hash;
      if (hash) {
        const hashParams = new URLSearchParams(hash.substring(1));
        const fromHash = hashParams.get('oobCode') || hashParams.get('oobcode') || hashParams.get('code');
        if (fromHash) return fromHash;
      }
      
      // Check full URL string (last resort - regex match)
      const fullUrl = window.location.href;
      const urlMatch = fullUrl.match(/[?&#](?:oobCode|oobcode|code)=([^&?#]+)/i);
      if (urlMatch && urlMatch[1]) {
        return decodeURIComponent(urlMatch[1]);
      }
      
      // Check document.referrer (if user came from Firebase action handler)
      if (document.referrer) {
        const referrerMatch = document.referrer.match(/[?&#](?:oobCode|oobcode|code)=([^&?#]+)/i);
        if (referrerMatch && referrerMatch[1]) {
          console.log('Found code in document.referrer');
          return decodeURIComponent(referrerMatch[1]);
        }
      }
      
      // Check sessionStorage (if code was stored during redirect)
      try {
        const storedCode = sessionStorage.getItem('firebase_reset_code');
        if (storedCode) {
          console.log('Found code in sessionStorage');
          return storedCode;
        }
      } catch (e) {
        // sessionStorage might not be available
      }
    }
    
    return null;
  };

  useEffect(() => {
    const initializePage = () => {
      // Debug: Log all URL information
      if (typeof window !== 'undefined') {
        console.log('=== RESET PASSWORD PAGE LOADED ===');
        console.log('Full URL:', window.location.href);
        console.log('URL search:', window.location.search);
        console.log('URL hash:', window.location.hash);
      }
      
      // Get code directly from URL parameters (Firebase should append it)
      let extractedCode = searchParams.get('oobCode') || searchParams.get('oobcode');
      const mode = searchParams.get('mode');
      
      console.log('Code from URL params:', extractedCode ? extractedCode.substring(0, 30) + '...' : 'none');
      console.log('Mode from URL params:', mode);
      
      // If not in URL params, try alternative extraction methods
      if (!extractedCode && typeof window !== 'undefined') {
        console.log('Code not in URL params, trying alternative extraction...');
        extractedCode = getCodeFromAnywhere();
        console.log('Code from alternative methods:', extractedCode ? extractedCode.substring(0, 30) + '...' : 'none');
      }

      // Firebase sends links in different formats - handle both
      if (!extractedCode) {
        // Check if there's an error parameter from the API handler
        const errorParam = searchParams.get('error');
        const debugParam = searchParams.get('debug');
        
        console.error('=== NO RESET CODE FOUND ===');
        console.error('Full URL was:', typeof window !== 'undefined' ? window.location.href : 'N/A');
        console.error('Error parameter:', errorParam);
        console.error('Debug parameter:', debugParam);
        console.error('');
        console.error('DIAGNOSIS:');
        if (debugParam === 'api_handler_called') {
          console.error('✅ API handler was called, but Firebase did not send the code');
          console.error('This means Firebase redirected to our API route without the oobCode parameter');
          console.error('');
          console.error('ROOT CAUSE:');
          console.error('Firebase action handler redirects to continueUrl, but does NOT append oobCode');
          console.error('This is a known limitation when using handleCodeInApp: false');
          console.error('');
          console.error('SOLUTION:');
          console.error('We need to extract the code from the Firebase action handler URL BEFORE it redirects');
          console.error('OR use handleCodeInApp: true and handle it client-side');
        } else {
          console.error('API handler was not called - Firebase might have redirected directly');
        }
        console.error('');
        console.error('IMMEDIATE FIX:');
        console.error('1. Copy the FULL link from your email (starts with firebaseapp.com)');
        console.error('2. Extract the oobCode from that URL');
        console.error('3. Manually navigate to: /reset-password?oobCode=EXTRACTED_CODE&mode=resetPassword');
        
        toast.error(
          'Reset code not found. Check server console for API handler logs. You may need to manually extract the code from the email link.',
          { duration: 10000 }
        );
        
        // Show the error page
        setVerified(false);
        setVerifying(false);
        return;
      }

      // Store the code immediately - don't verify it
      // NOTE: verifyPasswordResetCode can consume the code, so we skip it
      // The code will be validated when the user submits the form
      // Ensure code is properly decoded (in case it's URL encoded)
      let decodedCode = extractedCode;
      try {
        decodedCode = decodeURIComponent(extractedCode);
      } catch (e) {
        // Code might not be encoded, use as-is
        console.log('Code is not URL encoded, using as-is');
      }
      
      console.log('✅ Code extracted successfully');
      console.log('Code (first 30 chars):', decodedCode.substring(0, 30) + '...');
      console.log('Code length:', decodedCode.length);
      setOobCode(decodedCode);
      
      // Show the form immediately without verifying the code
      // The code will be validated when confirmPasswordReset is called
      setVerified(true);
      setVerifying(false);
    };

    initializePage();
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (!oobCode) {
      toast.error('Reset code is missing. Please request a new reset link.');
      router.push('/forgot-password');
      return;
    }

    setLoading(true);

    try {
      // Use the stored code (not from searchParams to avoid re-reading)
      if (!oobCode) {
        toast.error('Reset code is missing. Please request a new reset link.');
        router.push('/forgot-password');
        return;
      }
      
      console.log('=== ATTEMPTING PASSWORD RESET ===');
      console.log('Code (first 30 chars):', oobCode.substring(0, 30) + '...');
      console.log('Code length:', oobCode.length);
      console.log('Code (full):', oobCode);
      console.log('Password length:', password.length);
      console.log('Auth domain:', auth.app.options.authDomain);
      console.log('Project ID:', auth.app.options.projectId);
      
      // IMPORTANT: Use the code exactly as extracted - don't modify it
      await confirmPasswordReset(auth, oobCode, password);
      toast.success('Password reset successfully! 🎉');
      
      // Clear any stored codes
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.removeItem('firebase_reset_code');
          sessionStorage.removeItem('firebase_reset_mode');
        } catch (e) {
          // Ignore
        }
      }
      
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error: any) {
      console.error('Error resetting password:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Full error object:', error);
      
      let errorMessage = 'Failed to reset password. Please try again.';
      let shouldRedirect = false;
      
      if (error.code === 'auth/expired-action-code') {
        errorMessage = 'This reset link has expired. Please request a new one.';
        shouldRedirect = true;
      } else if (error.code === 'auth/invalid-action-code') {
        errorMessage = 'This reset link is invalid or has already been used. Please request a new one.';
        shouldRedirect = true;
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use a stronger password (at least 6 characters).';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled. Please contact support.';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'User account not found. Please request a new reset link.';
        shouldRedirect = true;
      }
      
      toast.error(errorMessage, { duration: 5000 });
      
      if (shouldRedirect) {
        setTimeout(() => router.push('/forgot-password'), 3000);
      }
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <AuthProvider>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Verifying reset link...</p>
          </div>
        </div>
      </AuthProvider>
    );
  }

  if (!verified && !oobCode) {
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
                <h2 className="text-3xl font-bold gradient-text">Reset Code Not Found</h2>
                <p className="text-gray-600 mt-4">
                  The password reset link doesn't contain the required code. This can happen if:
                </p>
                <ul className="text-left text-sm text-gray-600 mt-4 space-y-2 list-disc list-inside">
                  <li>The link was modified by your email client</li>
                  <li>Firebase redirect didn't preserve the code</li>
                  <li>The link format is different than expected</li>
                </ul>
                <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                  <p className="text-sm font-semibold text-blue-900 mb-2">How to fix:</p>
                  <ol className="text-left text-sm text-blue-800 space-y-1 list-decimal list-inside">
                    <li>Open your email and find the password reset email</li>
                    <li>Right-click on the reset link and select "Copy link address"</li>
                    <li>Paste the FULL link directly into your browser's address bar</li>
                    <li>Press Enter to navigate</li>
                  </ol>
                </div>
                <div className="mt-6">
                  <Link
                    href="/forgot-password"
                    className="celebration-gradient text-white font-semibold px-6 py-3 rounded-xl hover:shadow-lg transition-all inline-block"
                  >
                    Request New Reset Link
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AuthProvider>
    );
  }

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
                {email ? (
                  <>Enter your new password for <strong>{email}</strong></>
                ) : (
                  <>Enter your new password</>
                )}
              </p>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full celebration-gradient text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
              >
                {loading ? 'Resetting Password...' : 'Reset Password'}
              </button>
            </form>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Remember your password?{' '}
                <Link href="/login" className="text-primary-600 font-semibold hover:underline">
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </AuthProvider>
  );
}

