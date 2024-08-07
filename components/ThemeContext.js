// ThemeContext.js

import React, { createContext, useContext, useState } from 'react';

// Create a ThemeContext
const ThemeContext = createContext();

// ThemeProvider component
export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const lightTheme = {
    background: '#FFFFFF',
    text: '#000000',
    primary: '#6200EE',
  };

  const darkTheme = {
    background: '#17171A',
    text: '#FFFFFF',
    primary: '#FEBF32', // Match your theme color
  };

  const theme = {
    isDarkMode,
    colors: isDarkMode ? darkTheme : lightTheme,
    toggleTheme,
  };

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
};

// Custom hook to use the ThemeContext
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
