import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import { useQuranStore } from '../../store/quranStore';

interface StyledTextProps {
  children: React.ReactNode;
  variant?: 'body' | 'title' | 'subtitle' | 'arabic';
  style?: TextStyle;
}

export const StyledText: React.FC<StyledTextProps> = ({
  children,
  variant = 'body',
  style,
}) => {
  const { isDarkMode } = useQuranStore();

  return (
    <Text
      style={[
        styles.base,
        styles[variant],
        isDarkMode && styles.textLight,
        style,
      ]}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  base: {
    color: '#111827',
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4B5563',
  },
  arabic: {
    fontSize: 28,
    fontFamily: 'arabic',
    textAlign: 'right',
    lineHeight: 52,
    letterSpacing: 1.2,
  },
  textLight: {
    color: '#F3F4F6',
  },
}); 