import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuranStore } from '../store/quranStore';
import type { RootStackScreenProps } from '../types/navigation';

type NavigationProp = RootStackScreenProps<'Main'>['navigation'];

export const NotFound: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { isDarkMode } = useQuranStore();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={[styles.title, isDarkMode && styles.textLight]}>
          404 - Page Not Found
        </Text>
        <Text style={[styles.subtitle, isDarkMode && styles.textLight]}>
          The page you're looking for doesn't exist or has been moved.
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Main')}
        >
          <Text style={styles.buttonText}>Return Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  textLight: {
    color: '#E5E7EB',
  },
});
