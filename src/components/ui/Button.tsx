import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useQuranStore } from '../../store/quranStore';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  onPress,
  title,
  variant = 'primary',
  style,
  textStyle,
  disabled,
}) => {
  const { isDarkMode } = useQuranStore();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        styles[variant],
        isDarkMode && styles[`${variant}Dark`],
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          styles[`${variant}Text`],
          isDarkMode && styles.textLight,
          disabled && styles.disabledText,
          textStyle,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: '#10B981',
  },
  primaryDark: {
    backgroundColor: '#059669',
  },
  secondary: {
    backgroundColor: '#F3F4F6',
  },
  secondaryDark: {
    backgroundColor: '#374151',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  outlineDark: {
    borderColor: '#059669',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryText: {
    color: 'white',
  },
  secondaryText: {
    color: '#4B5563',
  },
  outlineText: {
    color: '#10B981',
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.7,
  },
  textLight: {
    color: '#F3F4F6',
  },
}); 