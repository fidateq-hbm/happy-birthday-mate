'use client';

import { useState, useEffect } from 'react';
import { Share2, Copy, Check, X, Link2, MessageCircle, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface WallShareDialogProps {
  wallCode: string;
  wallTitle: string;
  ownerName: string;
  isOpen: boolean;
  onClose: () => void;
  isMobile?: boolean;
}

export function WallShareDialog({
  wallCode,
  wallTitle,
  ownerName,
  isOpen,
  onClose,
  isMobile = false
}: WallShareDialogProps) {
  const [copied, setCopied] = useState(false);
  const [shareLink, setShareLink] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const baseUrl = window.location.origin;
      setShareLink(`${baseUrl}/invite/${wallCode}`);
    }
  }, [wallCode]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      toast.success('Link copied! 📋');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleShare = async () => {
    const shareText = `🎉 Join me in celebrating my birthday on Happy Birthday Mate! ${shareLink}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${ownerName}'s Birthday Celebration`,
          text: shareText,
          url: shareLink
        });
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          handleCopy();
        }
      }
    } else {
      handleCopy();
    }
  };

  const shareMessage = `🎉 Join me in celebrating my birthday on Happy Birthday Mate! 

${shareLink}

Sign up to upload photos, send digital gifts, and celebrate together! 🎂✨`;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-[55]"
          />
          
          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`fixed ${isMobile ? 'inset-0 m-auto h-fit max-h-[55vh] w-[calc(100vw-3rem)] max-w-[300px]' : 'top-[15vh] left-1/2 -translate-x-1/2 max-h-[75vh] w-[90vw] max-w-[600px]'} z-[60] rounded-2xl ${isMobile ? 'p-3 overflow-y-auto' : 'p-8 overflow-y-auto'} shadow-2xl bg-white border-2 border-gray-200`}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className={`flex items-center justify-between ${isMobile ? 'mb-4' : 'mb-6'}`}>
              <h2 className={`font-bold gradient-text ${isMobile ? 'text-base' : 'text-2xl'}`}>
                Share Birthday Wall
              </h2>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Share Link Card */}
            <div className={isMobile ? 'mb-4' : 'mb-6'}>
              <label className={`block ${isMobile ? 'text-xs' : 'text-sm'} font-semibold ${isMobile ? 'mb-2' : 'mb-3'} text-gray-900`}>
                Share this link with friends and family
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareLink}
                  readOnly
                  className={`flex-1 ${isMobile ? 'px-3 py-2 text-xs' : 'px-4 py-3'} border-2 border-gray-200 ${isMobile ? 'rounded-lg' : 'rounded-xl'} bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500`}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy();
                  }}
                  className={`${isMobile ? 'px-3 py-2 text-xs' : 'px-4 py-3'} ${isMobile ? 'rounded-lg' : 'rounded-xl'} border-2 transition-all flex items-center gap-2 ${
                    copied
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-primary-500 bg-primary-500 text-white hover:bg-primary-600'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-5 h-5" />
                      <span className="hidden sm:inline">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5" />
                      <span className="hidden sm:inline">Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Share Message Preview */}
            <div className={isMobile ? 'mb-4' : 'mb-6'}>
              <label className={`block ${isMobile ? 'text-xs' : 'text-sm'} font-semibold ${isMobile ? 'mb-2' : 'mb-3'} text-gray-900`}>
                Message to share
              </label>
              <div className={`${isMobile ? 'p-2.5' : 'p-4'} bg-gray-50 ${isMobile ? 'rounded-lg' : 'rounded-xl'} border-2 border-gray-200`}>
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-700 whitespace-pre-wrap`}>{shareMessage}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(shareMessage);
                  toast.success('Message copied! 📋');
                }}
                className={`mt-2 ${isMobile ? 'text-xs' : 'text-sm'} text-primary-600 hover:text-primary-700 font-medium`}
              >
                Copy message
              </button>
            </div>

            {/* Share Buttons */}
            <div className="space-y-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleShare();
                }}
                className={`w-full celebration-gradient text-white ${isMobile ? 'py-2 text-sm' : 'py-3'} ${isMobile ? 'rounded-lg' : 'rounded-xl'} font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2`}
              >
                <Share2 className="w-5 h-5" />
                Share via...
              </button>

              {/* Quick Share Options */}
              <div className={`grid grid-cols-2 ${isMobile ? 'gap-2' : 'gap-3'}`}>
                <a
                  href={`whatsapp://send?text=${encodeURIComponent(shareMessage)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className={`${isMobile ? 'p-2 text-xs' : 'p-3'} bg-green-500 text-white ${isMobile ? 'rounded-lg' : 'rounded-xl'} font-semibold hover:bg-green-600 transition-all flex items-center justify-center gap-2`}
                >
                  <MessageCircle className="w-5 h-5" />
                  WhatsApp
                </a>
                <a
                  href={`mailto:?subject=${encodeURIComponent(`${ownerName}'s Birthday Celebration`)}&body=${encodeURIComponent(shareMessage)}`}
                  onClick={(e) => e.stopPropagation()}
                  className="p-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
                >
                  <Mail className="w-5 h-5" />
                  Email
                </a>
              </div>
            </div>

            {/* Info */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-900">
                <strong>💡 Tip:</strong> When friends click the link, they'll be able to sign up and join your celebration! They can upload photos, send digital gifts, and celebrate with you.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

