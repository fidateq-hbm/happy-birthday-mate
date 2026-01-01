'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/**
 * Firebase Action Handler Page
 * 
 * Firebase sends password reset links to:
 * https://[project-id].firebaseapp.com/__/auth/action?mode=resetPassword&oobCode=...&continueUrl=...
 * 
 * This page intercepts that, extracts the code, and redirects to our reset-password page
 * with the code preserved in the URL.
 */
export default function FirebaseActionHandlerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleAction = () => {
      console.log('=== ACTION HANDLER ===');
      console.log('Full URL:', typeof window !== 'undefined' ? window.location.href : 'N/A');
      
      // Get the mode and code from URL parameters
      const mode = searchParams.get('mode');
      const oobCode = searchParams.get('oobCode') || searchParams.get('oobcode');
      
      // Check if this is a completion redirect from Firebase
      const firebaseComplete = searchParams.get('firebase');
      
      console.log('Mode:', mode);
      console.log('oobCode:', oobCode ? oobCode.substring(0, 20) + '...' : 'none');
      console.log('Firebase complete:', firebaseComplete);
      
      if (firebaseComplete === 'complete' || (!mode && !oobCode)) {
        // Firebase already handled the action, just show success
        console.log('✅ Firebase completed the action');
        setIsProcessing(false);
        setError('Action completed successfully. You can close this page or return to the app.');
        return;
      }
      
      if (!mode || !oobCode) {
        console.error('Missing parameters');
        setIsProcessing(false);
        setShowManualEntry(true);
        setError('Invalid action link. Please use the link from your email or request a new one.');
        return;
      }

      // Handle the action based on mode
      if (mode === 'resetPassword') {
        // Store code in sessionStorage as backup
        if (typeof window !== 'undefined') {
          try {
            sessionStorage.setItem('firebase_reset_code', oobCode);
            sessionStorage.setItem('firebase_reset_mode', mode);
            console.log('✅ Stored reset code in sessionStorage');
          } catch (e) {
            console.warn('Could not store code in sessionStorage:', e);
          }
        }
        
        // Redirect to our reset-password page with the code preserved
        const resetUrl = `/reset-password?oobCode=${encodeURIComponent(oobCode)}&mode=${encodeURIComponent(mode)}`;
        
        console.log('✅ Redirecting to reset password with code:', resetUrl);
        setIsProcessing(false);
        router.replace(resetUrl);
      } else if (mode === 'verifyEmail') {
        // Handle email verification - redirect to a verification page or show success
        console.log('✅ Email verification completed');
        setIsProcessing(false);
        // You can create a verify-email page or just show success
        setError('Email verified successfully! You can now close this page.');
        // Optionally redirect to a verification success page
        // router.replace(`/verify-email?oobCode=${encodeURIComponent(oobCode)}`);
      } else {
        setIsProcessing(false);
        setError(`Unsupported action: ${mode}`);
        console.error('Unsupported mode:', mode);
      }
    };

    handleAction();
  }, [searchParams, router]);

  const handleManualCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) {
      setError('Please enter the reset code');
      return;
    }
    
    // Extract code from URL if user pasted the full Firebase link
    let extractedCode = manualCode.trim();
    const urlMatch = extractedCode.match(/[?&](?:oobCode|oobcode|code)=([^&?#]+)/i);
    if (urlMatch && urlMatch[1]) {
      extractedCode = decodeURIComponent(urlMatch[1]);
      console.log('✅ Extracted code from pasted URL');
    }
    
    // Store in sessionStorage
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('firebase_reset_code', extractedCode);
        sessionStorage.setItem('firebase_reset_mode', 'resetPassword');
      } catch (e) {
        console.warn('Could not store in sessionStorage:', e);
      }
    }
    
    // Redirect to reset password page
    const resetUrl = `/reset-password?oobCode=${encodeURIComponent(extractedCode)}&mode=resetPassword`;
    console.log('Redirecting with manually entered code');
    router.replace(resetUrl);
  };


  // Show loading state while processing
  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Processing reset link...</p>
        </div>
      </div>
    );
  }

  // Show manual entry form if code is missing
  if (showManualEntry) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="w-full max-w-2xl">
          <div className="glass-effect rounded-3xl p-8 space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold gradient-text mb-2">Password Reset Code Entry</h2>
              {error && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4 text-left">
                  <p className="text-yellow-800 text-sm font-semibold mb-2">⚠️ Action Required:</p>
                  <p className="text-yellow-700 text-sm">{error}</p>
                </div>
              )}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-left">
                <p className="text-blue-800 font-semibold mb-2">📧 How to get your reset code:</p>
                <ol className="text-blue-700 text-sm space-y-2 list-decimal list-inside">
                  <li>Open the password reset email you received</li>
                  <li>Find the reset link (it starts with <code className="bg-blue-100 px-1 rounded">firebaseapp.com/__/auth/action</code>)</li>
                  <li>Right-click on the link and select "Copy link address"</li>
                  <li>Paste the FULL link in the box below</li>
                </ol>
              </div>
            </div>

            <form onSubmit={handleManualCodeSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reset Code or Full Email Link
                </label>
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="Paste the code or full Firebase link here"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-2">
                  <strong>Tip:</strong> You can paste either:
                  <br />• The full Firebase link from your email (recommended - we'll extract the code automatically)
                  <br />• Or just the code itself (the long string after <code>oobCode=</code>)
                </p>
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 font-semibold mb-1">Example link format:</p>
                  <code className="text-xs text-gray-700 break-all">
                    https://[project].firebaseapp.com/__/auth/action?mode=resetPassword&oobCode=ABC123...
                  </code>
                </div>
              </div>

              <button
                type="submit"
                className="w-full celebration-gradient text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-all"
              >
                Continue to Reset Password
              </button>
            </form>

            <div className="text-center">
              <button
                onClick={() => router.push('/forgot-password')}
                className="text-sm text-gray-600 hover:text-gray-900 underline"
              >
                Request New Reset Link
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback - should not reach here, but just in case
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
        <p className="text-gray-600">Processing reset link...</p>
      </div>
    </div>
  );
}

