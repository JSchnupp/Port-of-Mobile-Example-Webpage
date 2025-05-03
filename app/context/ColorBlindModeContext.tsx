'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface ColorBlindModeContextType {
  isColorBlindMode: boolean;
  toggleColorBlindMode: () => void;
}

const ColorBlindModeContext = createContext<ColorBlindModeContextType | undefined>(undefined);

export function ColorBlindModeProvider({ children }: { children: React.ReactNode }) {
  const [isColorBlindMode, setIsColorBlindMode] = useState(false);

  const toggleColorBlindMode = () => {
    setIsColorBlindMode(prev => !prev);
  };

  useEffect(() => {
    const handleToggle = () => {
      toggleColorBlindMode();
    };

    window.addEventListener('toggleColorBlindMode', handleToggle);
    return () => {
      window.removeEventListener('toggleColorBlindMode', handleToggle);
    };
  }, []);

  return (
    <ColorBlindModeContext.Provider value={{ isColorBlindMode, toggleColorBlindMode }}>
      {children}
    </ColorBlindModeContext.Provider>
  );
}

export function useColorBlindMode() {
  const context = useContext(ColorBlindModeContext);
  if (context === undefined) {
    throw new Error('useColorBlindMode must be used within a ColorBlindModeProvider');
  }
  return context.isColorBlindMode;
} 