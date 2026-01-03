'use client';

import { useState, useEffect } from 'react';
import { Users, Mail, UserPlus, X, Check, Clock } from 'lucide-react';
import { roomAPI } from '@/lib/api';
import { userAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface WallInvitationManagerProps {
  wallId: number;
  isOwner: boolean;
  onUpdate?: () => void;
  isMobile?: boolean;
}

interface Invitation {
  id: number;
  invited_user_id?: number;
  invited_email?: string;
  invited_name?: string;
  invitation_type: string;
  is_accepted: boolean;
  accepted_at?: string;
  created_at: string;
}

interface BirthdayMate {
  id: number;
  first_name: string;
  email: string;
  profile_picture_url: string;
}

export function WallInvitationManager({
  wallId,
  isOwner,
  onUpdate,
  isMobile = false
}: WallInvitationManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [birthdayMates, setBirthdayMates] = useState<BirthdayMate[]>([]);
  const [loading, setLoading] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [inviteType, setInviteType] = useState<'birthday_mate' | 'guest'>('birthday_mate');
  const [selectedMateId, setSelectedMateId] = useState<number | null>(null);
  const [guestEmail, setGuestEmail] = useState('');
  const [guestName, setGuestName] = useState('');

  useEffect(() => {
    if (isOpen && isOwner) {
      fetchInvitations();
      fetchBirthdayMates();
    }
  }, [isOpen, isOwner, wallId]);

  const fetchInvitations = async () => {
    try {
      const response = await roomAPI.getWallInvitations(wallId);
      setInvitations(response.data.invitations || []);
    } catch (error: any) {
      console.error('Error fetching invitations:', error);
      toast.error('Failed to load invitations');
    }
  };

  const fetchBirthdayMates = async () => {
    try {
      // Get current user's tribe members
      const { user } = await import('@/store/authStore');
      const authStore = await import('@/store/authStore');
      const currentUser = authStore.useAuthStore.getState().user;
      
      if (currentUser) {
        const response = await userAPI.getTribeMembers(currentUser.tribe_id, 100, false);
        // Filter out the wall owner
        const mates = (response.data.members || []).filter(
          (mate: BirthdayMate) => mate.id !== currentUser.id
        );
        setBirthdayMates(mates);
      }
    } catch (error: any) {
      console.error('Error fetching birthday mates:', error);
    }
  };

  const handleInvite = async () => {
    if (inviteType === 'birthday_mate' && !selectedMateId) {
      toast.error('Please select a birthday mate');
      return;
    }
    
    if (inviteType === 'guest' && (!guestEmail || !guestName)) {
      toast.error('Please provide guest email and name');
      return;
    }

    setInviting(true);
    try {
      const inviteData: any = {
        invitation_type: inviteType
      };

      if (inviteType === 'birthday_mate') {
        inviteData.invited_user_id = selectedMateId;
      } else {
        inviteData.invited_email = guestEmail;
        inviteData.invited_name = guestName;
      }

      await roomAPI.inviteToWall(wallId, inviteData);
      toast.success('Invitation sent! 🎉');
      
      // Reset form
      setSelectedMateId(null);
      setGuestEmail('');
      setGuestName('');
      
      // Refresh invitations
      fetchInvitations();
      onUpdate?.();
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      toast.error(error.response?.data?.detail || 'Failed to send invitation');
    } finally {
      setInviting(false);
    }
  };

  if (!isOwner) return null;

  return (
    <>
      {/* Invitation Manager Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed ${isMobile ? 'bottom-32 right-4' : 'top-20 right-20'} z-40 bg-purple-600 text-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all`}
        title="Manage Invitations"
      >
        <UserPlus className="w-5 h-5" />
      </button>

      {/* Invitation Manager Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            
            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`fixed ${isMobile ? 'bottom-0 left-0 right-0' : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'} z-50 glass-effect rounded-3xl ${isMobile ? 'rounded-b-none' : ''} ${isMobile ? 'p-6 max-h-[80vh] overflow-y-auto' : 'p-8 w-full max-w-lg'} shadow-2xl`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className={`font-bold gradient-text ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                  Manage Invitations
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Invite Type Tabs */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setInviteType('birthday_mate')}
                  className={`flex-1 p-3 rounded-xl border-2 transition-all ${
                    inviteType === 'birthday_mate'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200'
                  }`}
                >
                  <Users className="w-5 h-5 mx-auto mb-1" />
                  <p className="text-sm font-semibold">Birthday Mates</p>
                </button>
                <button
                  onClick={() => setInviteType('guest')}
                  className={`flex-1 p-3 rounded-xl border-2 transition-all ${
                    inviteType === 'guest'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200'
                  }`}
                >
                  <Mail className="w-5 h-5 mx-auto mb-1" />
                  <p className="text-sm font-semibold">Guests</p>
                </button>
              </div>

              {/* Invite Form */}
              <div className="mb-6">
                {inviteType === 'birthday_mate' ? (
                  <div>
                    <label className="block text-sm font-semibold mb-3">Select Birthday Mate</label>
                    <div className="max-h-48 overflow-y-auto space-y-2">
                      {birthdayMates.length === 0 ? (
                        <p className="text-gray-500 text-sm text-center py-4">
                          No birthday mates available
                        </p>
                      ) : (
                        birthdayMates.map((mate) => (
                          <button
                            key={mate.id}
                            onClick={() => setSelectedMateId(mate.id)}
                            className={`w-full p-3 rounded-xl border-2 transition-all text-left ${
                              selectedMateId === mate.id
                                ? 'border-primary-500 bg-primary-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={mate.profile_picture_url}
                                alt={mate.first_name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                              <div className="flex-1">
                                <p className="font-semibold">{mate.first_name}</p>
                                <p className="text-xs text-gray-600">{mate.email}</p>
                              </div>
                              {selectedMateId === mate.id && (
                                <Check className="w-5 h-5 text-primary-600" />
                              )}
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Guest Email</label>
                      <input
                        type="email"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        placeholder="guest@example.com"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Guest Name</label>
                      <input
                        type="text"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="Guest Name"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}

                <button
                  onClick={handleInvite}
                  disabled={inviting || (inviteType === 'birthday_mate' && !selectedMateId) || (inviteType === 'guest' && (!guestEmail || !guestName))}
                  className="w-full mt-4 celebration-gradient text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {inviting ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>

              {/* Invitations List */}
              <div>
                <h3 className="font-semibold mb-3">Sent Invitations</h3>
                {invitations.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">
                    No invitations sent yet
                  </p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {invitations.map((inv) => (
                      <div
                        key={inv.id}
                        className="p-3 bg-gray-50 rounded-xl border border-gray-200"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-semibold">
                              {inv.invited_name || `User #${inv.invited_user_id}`}
                            </p>
                            <p className="text-xs text-gray-600">
                              {inv.invited_email || 'Birthday Mate'}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {inv.is_accepted ? (
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                Accepted
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Pending
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

