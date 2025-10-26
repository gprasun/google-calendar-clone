import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { X, Share2, Trash2 } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@hooks/redux';
import { closeShareModal } from '@store/slices/uiSlice';
import { useShareCalendarMutation, useGetCalendarSharesQuery } from '@store/api/calendarApi';

const ShareModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { shareModalOpen, shareCalendarId } = useAppSelector((state) => state.ui);
  const [shareCalendar, { isLoading: isSharing }] = useShareCalendarMutation();
  const { data: sharesResponse } = useGetCalendarSharesQuery(shareCalendarId || '', {
    skip: !shareCalendarId,
  });

  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'viewer' | 'editor'>('viewer');

  const shares = sharesResponse?.data || [];

  const handleClose = () => {
    dispatch(closeShareModal());
    setEmail('');
    setRole('viewer');
  };

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !shareCalendarId) return;

    try {
      await shareCalendar({
        id: shareCalendarId,
        email: email.trim(),
        role,
      }).unwrap();
      setEmail('');
      setRole('viewer');
    } catch (error) {
      console.error('Failed to share calendar:', error);
    }
  };

  return (
    <Dialog open={shareModalOpen} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-lg shadow-xl w-full max-w-md">
          <div className="flex items-center justify-between p-6 border-b border-google-gray-200">
            <Dialog.Title className="text-lg font-medium text-google-gray-900 flex items-center">
              <Share2 className="w-5 h-5 mr-2" />
              Share Calendar
            </Dialog.Title>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-google-gray-100 rounded-lg"
            >
              <X className="w-5 h-5 text-google-gray-500" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Share Form */}
            <form onSubmit={handleShare} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-google-gray-700 mb-2">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="Enter email address"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-google-gray-700 mb-2">
                  Permission
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'viewer' | 'editor')}
                  className="input-field"
                >
                  <option value="viewer">Can view</option>
                  <option value="editor">Can edit</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSharing || !email.trim()}
                className="btn-primary w-full"
              >
                {isSharing ? 'Sharing...' : 'Share'}
              </button>
            </form>

            {/* Current Shares */}
            {shares.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-google-gray-700 mb-3">
                  People with access
                </h3>
                <div className="space-y-2">
                  {shares.map((share) => (
                    <div
                      key={share.id}
                      className="flex items-center justify-between p-3 bg-google-gray-50 rounded-lg"
                    >
                      <div>
                        <div className="font-medium text-sm text-google-gray-900">
                          {share.user.name}
                        </div>
                        <div className="text-xs text-google-gray-500">
                          {share.user.email}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-google-gray-500 capitalize">
                          {share.role}
                        </span>
                        {share.role !== 'owner' && (
                          <button className="p-1 hover:bg-google-gray-200 rounded">
                            <Trash2 className="w-4 h-4 text-google-gray-400" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default ShareModal;