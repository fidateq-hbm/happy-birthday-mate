'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { giftAPI } from '@/lib/api';

export default function PaymentCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [message, setMessage] = useState('Verifying payment...');

  useEffect(() => {
    const verifyPayment = async () => {
      const giftId = searchParams.get('gift_id');
      const tx_ref = searchParams.get('tx_ref');
      const transaction_id = searchParams.get('transaction_id');
      const status = searchParams.get('status');

      if (!giftId) {
        setStatus('failed');
        setMessage('Invalid payment callback. Missing gift ID.');
        return;
      }

      try {
        // Verify payment status with backend
        const response = await giftAPI.verifyPayment(parseInt(giftId));
        
        if (response.data.payment_status === 'completed') {
          setStatus('success');
          setMessage('Payment successful! Your gift has been sent. 🎉');
          
          // Redirect to gifts page after 3 seconds
          setTimeout(() => {
            router.push('/gifts');
          }, 3000);
        } else if (response.data.payment_status === 'failed') {
          setStatus('failed');
          setMessage('Payment failed. Please try again.');
        } else {
          // Still pending - wait a bit and check again
          setTimeout(() => {
            verifyPayment();
          }, 2000);
        }
      } catch (error: any) {
        console.error('Payment verification error:', error);
        setStatus('failed');
        setMessage(error.response?.data?.detail || 'Failed to verify payment. Please contact support.');
      }
    };

    verifyPayment();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-effect rounded-3xl p-8 md:p-12 max-w-md w-full text-center"
      >
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 text-primary-600 mx-auto mb-6 animate-spin" />
            <h2 className="text-2xl font-bold gradient-text mb-4">Verifying Payment</h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
            </motion.div>
            <h2 className="text-2xl font-bold gradient-text mb-4">Payment Successful! 🎉</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <p className="text-sm text-gray-500">Redirecting to gifts page...</p>
          </>
        )}

        {status === 'failed' && (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-red-600 mb-4">Payment Failed</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <button
              onClick={() => router.push('/gifts')}
              className="celebration-gradient text-white px-6 py-3 rounded-full font-semibold hover:shadow-xl transition-all"
            >
              Back to Gifts
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}

