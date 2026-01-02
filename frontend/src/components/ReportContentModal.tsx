'use client';

import { useState } from 'react';
import { X, Flag, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { adminAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

interface ReportContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentType: 'message' | 'photo' | 'profile_picture' | 'user_profile';
  contentId: number;
  contentPreview?: string; // For showing what's being reported
}

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam or Scam', emoji: '🚫' },
  { value: 'harassment', label: 'Harassment or Bullying', emoji: '⚠️' },
  { value: 'inappropriate', label: 'Inappropriate Content', emoji: '🔞' },
  { value: 'hate_speech', label: 'Hate Speech', emoji: '💬' },
  { value: 'violence', label: 'Violence or Threats', emoji: '⚔️' },
  { value: 'copyright', label: 'Copyright Violation', emoji: '©️' },
  { value: 'other', label: 'Other', emoji: '❓' },
];

export function ReportContentModal({
  isOpen,
  onClose,
  contentType,
  contentId,
  contentPreview,
}: ReportContentModalProps) {
  const { user } = useAuthStore();
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedReason) {
      toast.error('Please select a reason for reporting');
      return;
    }

    if (!user) {
      toast.error('You must be logged in to report content');
      return;
    }

    setSubmitting(true);
    try {
      const reasonText = REPORT_REASONS.find(r => r.value === selectedReason)?.label || selectedReason;
      const fullReason = additionalDetails 
        ? `${reasonText}: ${additionalDetails}`
        : reasonText;

      // Note: flagContent uses Authorization header - user_id is extracted from token
      await adminAPI.flagContent({
        content_type: contentType,
        content_id: contentId,
        reason: fullReason,
      });

      toast.success('Content reported successfully. Our moderation team will review it.');
      onClose();
      setSelectedReason('');
      setAdditionalDetails('');
    } catch (error: any) {
      console.error('Error reporting content:', error);
      toast.error(error.response?.data?.detail || 'Failed to report content. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative glass-effect rounded-3xl p-6 md:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
              <Flag className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold gradient-text mb-2">
              Report Content
            </h2>
            <p className="text-gray-600 text-sm md:text-base">
              Help us keep the platform safe and celebratory
            </p>
          </div>

          {/* Content Preview (if provided) */}
          {contentPreview && (
            <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-xs text-gray-500 mb-2">Content being reported:</p>
              <p className="text-sm text-gray-700 line-clamp-3">{contentPreview}</p>
            </div>
          )}

          {/* Reason Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Why are you reporting this? *
            </label>
            <div className="space-y-2">
              {REPORT_REASONS.map((reason) => (
                <button
                  key={reason.value}
                  type="button"
                  onClick={() => setSelectedReason(reason.value)}
                  className={`w-full p-3 rounded-xl border-2 transition-all text-left ${
                    selectedReason === reason.value
                      ? 'border-red-500 bg-red-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{reason.emoji}</span>
                    <span className="font-medium text-gray-800">{reason.label}</span>
                    {selectedReason === reason.value && (
                      <div className="ml-auto w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Additional Details */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Additional Details (Optional)
            </label>
            <textarea
              value={additionalDetails}
              onChange={(e) => setAdditionalDetails(e.target.value)}
              placeholder="Provide more context about why you're reporting this content..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-200 outline-none transition-all resize-none text-sm"
            />
            <p className="text-xs text-gray-500 mt-2">
              {additionalDetails.length} characters
            </p>
          </div>

          {/* Warning */}
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-800">
                False reports may result in action against your account. Only report content that violates our community guidelines.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || !selectedReason}
              className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Flag className="w-4 h-4" />
                  Report
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

