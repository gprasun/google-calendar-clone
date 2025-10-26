import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { X, Palette } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@hooks/redux';
import { closeCalendarModal } from '@store/slices/uiSlice';
import { useCreateCalendarMutation, useUpdateCalendarMutation } from '@store/api/calendarApi';

const CalendarModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { calendarModalOpen, calendarFormData } = useAppSelector((state) => state.ui);
  const [createCalendar, { isLoading: isCreating }] = useCreateCalendarMutation();
  const [updateCalendar, { isLoading: isUpdating }] = useUpdateCalendarMutation();

  const isEditing = !!calendarFormData?.id;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#1a73e8',
    isPublic: false,
  });

  useEffect(() => {
    if (calendarFormData) {
      setFormData(calendarFormData);
    } else {
      setFormData({
        name: '',
        description: '',
        color: '#1a73e8',
        isPublic: false,
      });
    }
  }, [calendarFormData]);

  const handleClose = () => {
    dispatch(closeCalendarModal());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) return;

    try {
      if (isEditing && calendarFormData?.id) {
        await updateCalendar({
          id: calendarFormData.id,
          name: formData.name,
          description: formData.description,
          color: formData.color,
        }).unwrap();
      } else {
        await createCalendar({
          name: formData.name,
          description: formData.description,
          color: formData.color,
          isPublic: formData.isPublic,
        }).unwrap();
      }
      handleClose();
    } catch (error) {
      console.error('Failed to save calendar:', error);
    }
  };

  const colorOptions = [
    { value: '#1a73e8', label: 'Blue' },
    { value: '#d50000', label: 'Red' },
    { value: '#f9ab00', label: 'Yellow' },
    { value: '#0d7377', label: 'Green' },
    { value: '#9c27b0', label: 'Purple' },
    { value: '#ff6d01', label: 'Orange' },
    { value: '#039be5', label: 'Teal' },
    { value: '#ad1457', label: 'Pink' },
  ];

  return (
    <Dialog open={calendarModalOpen} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-lg shadow-xl w-full max-w-md">
          <div className="flex items-center justify-between p-6 border-b border-google-gray-200">
            <Dialog.Title className="text-lg font-medium text-google-gray-900">
              {isEditing ? 'Edit Calendar' : 'Create Calendar'}
            </Dialog.Title>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-google-gray-100 rounded-lg"
            >
              <X className="w-5 h-5 text-google-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-google-gray-700 mb-2">
                Calendar name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
                placeholder="Enter calendar name"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-google-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field resize-none"
                rows={3}
                placeholder="Enter description (optional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-google-gray-700 mb-2">
                <Palette className="w-4 h-4 inline mr-1" />
                Color
              </label>
              <div className="flex space-x-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, color: color.value })}
                    className={`w-8 h-8 rounded-full border-2 ${
                      formData.color === color.value ? 'border-google-gray-400' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.label}
                  />
                ))}
              </div>
            </div>

            {!isEditing && (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                  className="rounded border-google-gray-300"
                />
                <label htmlFor="isPublic" className="text-sm text-google-gray-700">
                  Make calendar public
                </label>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating || isUpdating || !formData.name.trim()}
                className="btn-primary"
              >
                {isCreating || isUpdating ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default CalendarModal;