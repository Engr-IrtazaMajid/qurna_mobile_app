import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StyledText } from './StyledText';

interface LoadingSpinnerProps {
  text?: string;
  size?: 'large' | 'small' | number | undefined;
  color?: string;
  isDarkMode: boolean;
  style?: any;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  text = 'Loading...',
  size = 'large',
  color = '#10B981',
  isDarkMode = false,
  style = '',
}) => (
  <View
    style={[styles.container, isDarkMode && styles.loadingContainerDark, style]}
  >
    <ActivityIndicator size={size} color={color} />
    {text && (
      <StyledText style={styles.text} variant='subtitle'>
        {text}
      </StyledText>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    marginTop: 16,
    color: '#10B981',
  },
  loadingContainerDark: {
    backgroundColor: '#0F172A',
  },
});
