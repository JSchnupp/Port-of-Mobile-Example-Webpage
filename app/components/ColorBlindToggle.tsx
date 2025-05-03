'use client';

import { useColorBlindMode } from '@/app/context/ColorBlindModeContext';

export function ColorBlindToggle() {
  const isColorBlindMode = useColorBlindMode();

  return (
    <button
      className={`px-4 py-2 rounded-md ${
        isColorBlindMode ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-800'
      }`}
      onClick={() => {
        const event = new CustomEvent('toggleColorBlindMode');
        window.dispatchEvent(event);
      }}
    >
      {isColorBlindMode ? 'Color Blind Mode: On' : 'Color Blind Mode: Off'}
    </button>
  );
} 