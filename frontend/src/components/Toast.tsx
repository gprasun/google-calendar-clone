import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@hooks/redux';
import { clearError } from '@store/slices/uiSlice';

const Toast: React.FC = () => {
  const { error } = useAppSelector((state) => state.ui);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const getIcon = (type: 'error') => {
    switch (type) {
      case 'error':
        return <AlertCircle className="w-5 h-5"/>;
    }
  };

  const getColors = (type: 'error') => {
    switch (type) {
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.95 }}
            className={`max-w-sm w-full border rounded-lg p-4 shadow-lg ${getColors('error')}`}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {getIcon('error')}
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium">Error</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
              <div className="ml-4 flex-shrink-0">
                <button
                  onClick={() => dispatch(clearError())}
                  className="inline-flex text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Toast;