'use client';

import { useState, useEffect } from 'react';
import { Settings, Play, Pause, Lock, Unlock, Users, Mail, X } from 'lucide-react';
import { roomAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface WallControlPanelProps {
  wallId: number;
  isOwner: boolean;
  uploadsEnabled: boolean;
  uploadPermission: string;
  uploadPaused: boolean;
  isSealed: boolean;
  onUpdate?: () => void;
  isMobile?: boolean;
}

export function WallControlPanel({
  wallId,
  isOwner,
  uploadsEnabled,
  uploadPermission,
  uploadPaused,
  isSealed,
  onUpdate,
  isMobile = false
}: WallControlPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localUploadsEnabled, setLocalUploadsEnabled] = useState(uploadsEnabled);
  const [localUploadPermission, setLocalUploadPermission] = useState(uploadPermission);
  const [localUploadPaused, setLocalUploadPaused] = useState(uploadPaused);
  const [localIsSealed, setLocalIsSealed] = useState(isSealed);

  useEffect(() => {
    setLocalUploadsEnabled(uploadsEnabled);
    setLocalUploadPermission(uploadPermission);
    setLocalUploadPaused(uploadPaused);
    setLocalIsSealed(isSealed);
  }, [uploadsEnabled, uploadPermission, uploadPaused, isSealed]);

  if (!isOwner) return null;

  const handleUpdate = async (updates: {
    uploads_enabled?: boolean;
    upload_permission?: string;
    upload_paused?: boolean;
    is_sealed?: boolean;
  }) => {
    setLoading(true);
    try {
      await roomAPI.updateUploadControl(wallId, updates);
      toast.success('Wall settings updated! 🎉');
      
      // Update local state
      if (updates.uploads_enabled !== undefined) {
        setLocalUploadsEnabled(updates.uploads_enabled);
      }
      if (updates.upload_permission !== undefined) {
        setLocalUploadPermission(updates.upload_permission);
      }
      if (updates.upload_paused !== undefined) {
        setLocalUploadPaused(updates.upload_paused);
      }
      if (updates.is_sealed !== undefined) {
        setLocalIsSealed(updates.is_sealed);
      }
      
      onUpdate?.();
    } catch (error: any) {
      console.error('Error updating wall control:', error);
      toast.error(error.response?.data?.detail || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  const permissionLabels: { [key: string]: string } = {
    none: 'No one',
    birthday_mates: 'Birthday Mates Only',
    invited_guests: 'Invited Guests Only',
    both: 'Birthday Mates & Invited Guests'
  };

  return (
    <>
      {/* Control Panel Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed ${isMobile ? 'bottom-20 right-4' : 'top-20 right-4'} z-40 celebration-gradient text-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all`}
        title="Wall Control Panel"
      >
        <Settings className="w-5 h-5" />
      </button>

      {/* Control Panel Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-[55]"
            />
            
            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: isMobile ? 100 : 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: isMobile ? 100 : 20 }}
              style={{
                ...(isMobile ? {} : { 
                  maxWidth: 'min(90vw, 500px)',
                  width: '100%'
                })
              }}
              className={`fixed ${isMobile ? 'bottom-0 left-0 right-0 max-h-[90vh]' : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-h-[85vh]'} z-[60] glass-effect rounded-3xl ${isMobile ? 'rounded-b-none' : ''} ${isMobile ? 'p-6 overflow-y-auto' : 'p-8 w-full overflow-y-auto'} shadow-2xl bg-white/95 backdrop-blur-lg`}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className={`font-bold gradient-text ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                  Wall Control Panel
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Uploads Enabled Toggle */}
              <div className="mb-6">
                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${localUploadsEnabled ? 'bg-green-100' : 'bg-gray-200'}`}>
                      {localUploadsEnabled ? (
                        <Play className="w-5 h-5 text-green-600" />
                      ) : (
                        <Pause className="w-5 h-5 text-gray-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">Enable Uploads</p>
                      <p className="text-sm text-gray-600">
                        {localUploadsEnabled ? 'Uploads are enabled' : 'Uploads are disabled'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpdate({ uploads_enabled: !localUploadsEnabled });
                    }}
                    disabled={loading || localIsSealed}
                    className={`relative w-14 h-8 rounded-full transition-colors ${localUploadsEnabled ? 'bg-green-500' : 'bg-gray-300'} ${localIsSealed ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${localUploadsEnabled ? 'translate-x-6' : ''}`} />
                  </button>
                </label>
              </div>

              {/* Upload Permission - Always show when uploads are enabled */}
              {localUploadsEnabled && !localIsSealed && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-3 text-gray-900">Who Can Upload?</label>
                  <div className="space-y-2">
                    {['none', 'birthday_mates', 'invited_guests', 'both'].map((permission) => (
                      <button
                        key={permission}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdate({ upload_permission: permission });
                        }}
                        disabled={loading}
                        className={`w-full p-3 rounded-xl border-2 transition-all text-left ${
                          localUploadPermission === permission
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                            localUploadPermission === permission
                              ? 'border-primary-500 bg-primary-500'
                              : 'border-gray-300 bg-white'
                          }`} />
                          <span className="font-medium text-gray-900">{permissionLabels[permission]}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Pause Uploads */}
              {localUploadsEnabled && !localIsSealed && (
                <div className="mb-6">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpdate({ upload_paused: !localUploadPaused });
                    }}
                    disabled={loading}
                    className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                      localUploadPaused
                        ? 'border-amber-300 bg-amber-50'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <Pause className={`w-5 h-5 ${localUploadPaused ? 'text-amber-600' : 'text-gray-600'}`} />
                    <div className="text-left flex-1">
                      <p className="font-semibold">
                        {localUploadPaused ? 'Resume Uploads' : 'Pause Uploads'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {localUploadPaused ? 'Click to resume uploads' : 'Temporarily pause uploads'}
                      </p>
                    </div>
                  </button>
                </div>
              )}

              {/* Seal Wall */}
              <div className="mb-6">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUpdate({ is_sealed: !localIsSealed });
                  }}
                  disabled={loading}
                  className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                    localIsSealed
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {localIsSealed ? (
                    <Lock className="w-5 h-5 text-red-600" />
                  ) : (
                    <Unlock className="w-5 h-5 text-gray-600" />
                  )}
                  <div className="text-left flex-1">
                    <p className="font-semibold">
                      {localIsSealed ? 'Wall is Sealed' : 'Seal Wall'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {localIsSealed 
                        ? 'Wall is permanently sealed and immutable' 
                        : 'Permanently seal wall (no more uploads or changes)'}
                    </p>
                  </div>
                </button>
              </div>

              {/* Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-900">
                  <strong>Note:</strong> By default, uploads are disabled. Enable uploads and choose who can contribute to your wall.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

