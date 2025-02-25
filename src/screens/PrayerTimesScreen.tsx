import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useQuranStore } from '../store/quranStore';
import { PrayerTimes } from './PrayerTimes';
import { IslamicCalendar } from './IslamicCalendar';

export const PrayerTimesScreen: React.FC = () => {
  const { isDarkMode } = useQuranStore();

  return (
    <ScrollView
      style={[styles.container, isDarkMode && styles.containerDark]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.grid}>
        <View style={styles.section}>
          <PrayerTimes />
        </View>
        <View style={styles.section}>
          <IslamicCalendar />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  containerDark: {
    backgroundColor: '#111827',
  },
  content: {
    padding: 16,
  },
  grid: {
    gap: 16,
  },
  section: {
    width: '100%',
  },
});
