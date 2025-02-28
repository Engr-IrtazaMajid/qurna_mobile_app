import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useQuranStore } from '../../store/quranStore';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({ children, style }) => {
  const { isDarkMode } = useQuranStore();

  return (
    <View style={[styles.card, isDarkMode && styles.cardDark, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  cardDark: {
    backgroundColor: '#1F2937',
    borderColor: '#334155',
  },
}); 