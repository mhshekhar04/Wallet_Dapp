// ThemeToggleButton.js

import React from 'react';
import { TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; // Ensure this package is installed
import { useTheme } from './ThemeContext';

const ThemeToggleButton = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <TouchableOpacity onPress={toggleTheme} style={{ padding: 10 }}>
      <Icon
        name={isDarkMode ? 'sunny-outline' : 'moon-outline'} // Change icon based on theme
        size={24}
        color={isDarkMode ? '#FFD700' : '#4F4F4F'} // Yellow for sun, grey for moon
      />
    </TouchableOpacity>
  );
};

export default ThemeToggleButton;
