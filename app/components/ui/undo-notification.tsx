import { useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface UndoNotificationProps {
  message: string;
  onUndo: () => void;
  onClose: () => void;
  duration?: number;
}

export function UndoNotification({ 
  message, 
  onUndo, 
  onClose,
  duration = 3000 
}: UndoNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 flex items-center gap-4 animate-fade-in-up">
        <span className="text-gray-900 dark:text-gray-100">{message}</span>
        <button
          onClick={onUndo}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
        >
          Undo
        </button>
        <button
          onClick={() => {
            setIsVisible(false);
            onClose();
          }}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
} 