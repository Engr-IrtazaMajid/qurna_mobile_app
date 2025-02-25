import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Location from 'expo-location';
import { useQuranStore } from '../store/quranStore';
import { useQuery } from 'react-query';
import { fetchPrayerTimes, PrayerTimes } from '../services/prayerApi';

const DateHeader: React.FC<{
  date: string;
  hijri: string;
  isDarkMode: boolean;
}> = ({ date, hijri, isDarkMode }) => {
  const styles = StyleSheet.create({
    container: {
      marginHorizontal: 16,
      marginVertical: 24,
      padding: 20,
      borderRadius: 20,
      backgroundColor: isDarkMode
        ? 'rgba(31, 41, 55, 0.95)'
        : 'rgba(255, 255, 255, 0.95)',
      shadowColor: isDarkMode ? '#000' : '#2563EB',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: isDarkMode ? 0.5 : 0.1,
      shadowRadius: 12,
      elevation: 8,
      borderWidth: 1,
      borderColor: isDarkMode
        ? 'rgba(75, 85, 99, 0.3)'
        : 'rgba(37, 99, 235, 0.1)',
    },
    dateRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    dateSection: {
      flex: 1,
    },
    gregorianDate: {
      fontSize: 26,
      fontWeight: '700',
      color: isDarkMode ? '#F3F4F6' : '#10B981',
      marginBottom: 6,
      letterSpacing: 0.5,
    },
    hijriDate: {
      fontSize: 22,
      color: isDarkMode ? '#9CA3AF' : '#4A7563',
      fontFamily: 'arabic',
      opacity: 0.9,
    },
    iconContainer: {
      width: 54,
      height: 54,
      borderRadius: 27,
      backgroundColor: isDarkMode
        ? 'rgba(16, 185, 129, 0.15)'
        : 'rgba(16, 185, 129, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 16,
      borderWidth: 1,
      borderColor: isDarkMode
        ? 'rgba(16, 185, 129, 0.3)'
        : 'rgba(16, 185, 129, 0.2)',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.dateRow}>
        <View style={styles.dateSection}>
          <Text style={styles.gregorianDate}>{date}</Text>
          <Text style={styles.hijriDate}>{hijri}</Text>
        </View>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name='calendar-month'
            size={30}
            color={isDarkMode ? '#10B981' : '#059669'}
          />
        </View>
      </View>
    </View>
  );
};

export const PrayerTimesScreen: React.FC = () => {
  const { isDarkMode, currentAyah } = useQuranStore();
  const styles = createStyles(isDarkMode, currentAyah);

  const {
    data: prayerTimes,
    isLoading,
    error,
  } = useQuery<PrayerTimes>(
    'prayerTimes',
    async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Location permission not granted');
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      return fetchPrayerTimes(location.coords);
    },
    {
      staleTime: 1000 * 60 * 60, // 1 hour
      cacheTime: 1000 * 60 * 60 * 24, // 24 hours
    }
  );

  return (
    <ScrollView
      style={[styles.container, isDarkMode && styles.containerDark]}
      showsVerticalScrollIndicator={false}
    >
      {prayerTimes && (
        <DateHeader
          date={prayerTimes.date}
          hijri={prayerTimes.hijri}
          isDarkMode={isDarkMode}
        />
      )}

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color='#10B981' />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Icon name='alert-circle' size={48} color='#EF4444' />
          <Text style={[styles.errorText, isDarkMode && styles.textLight]}>
            {(error as Error).message}
          </Text>
        </View>
      ) : (
        <View style={styles.timesContainer}>
          {prayerTimes &&
            Object.entries(prayerTimes.timings)
              .filter(([key]) =>
                ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].includes(key)
              )
              .map(([prayer, time]) => {
                const prayerInfo = getPrayerInfo(prayer, isDarkMode);
                return (
                  <View
                    key={prayer}
                    style={[
                      styles.timeCard,
                      {
                        backgroundColor: prayerInfo.background,
                        borderColor: prayerInfo.borderColor,
                      },
                    ]}
                  >
                    <View style={styles.prayerInfo}>
                      <View style={styles.prayerNameContainer}>
                        <View
                          style={[
                            styles.iconContainer,
                            { backgroundColor: prayerInfo.color + '20' },
                          ]}
                        >
                          <MaterialCommunityIcons
                            name={prayerInfo.icon}
                            size={24}
                            color={prayerInfo.color}
                          />
                        </View>
                        <Text
                          style={[
                            styles.prayerName,
                            { color: prayerInfo.color },
                          ]}
                        >
                          {prayer}
                        </Text>
                      </View>
                      <Text style={styles.prayerDesc}>{prayerInfo.desc}</Text>
                    </View>
                    <Text style={[styles.time, { color: prayerInfo.color }]}>
                      {time}
                    </Text>
                  </View>
                );
              })}
        </View>
      )}
    </ScrollView>
  );
};

const createStyles = (isDarkMode: boolean, currentAyah: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F9FAFB',
      paddingBottom: currentAyah ? 80 : 0,
    },
    containerDark: {
      backgroundColor: '#111827',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      gap: 8,
    },
    headerText: {
      fontSize: 20,
      fontWeight: '600',
      color: isDarkMode ? '#E5E7EB' : '#111827',
    },
    dateContainer: {
      alignItems: 'center',
      marginTop: 12,
    },
    dateText: {
      fontSize: 16,
      color: isDarkMode ? '#E5E7EB' : '#111827',
      fontWeight: '500',
    },
    hijriDate: {
      fontSize: 14,
      color: isDarkMode ? '#9CA3AF' : '#6B7280',
      marginTop: 4,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 200,
    },
    textLight: {
      color: '#E5E7EB',
    },
    textLightSecondary: {
      color: '#9CA3AF',
    },
    timesContainer: {
      paddingHorizontal: 16,
      paddingBottom: currentAyah ? 140 : 100,
    },
    timeCard: {
      borderRadius: 16,
      padding: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
      borderWidth: 1,
    },
    timeCardDark: {
      backgroundColor: '#1F2937',
    },
    prayerInfo: {
      flex: 1,
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    prayerNameContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 6,
    },
    prayerName: {
      fontSize: 18,
      fontWeight: '700',
    },
    prayerDesc: {
      fontSize: 14,
      marginLeft: 52,
      color: isDarkMode ? '#9CA3AF' : '#6B7280',
      opacity: 0.8,
    },
    time: {
      fontSize: 22,
      fontWeight: '700',
      fontFamily: 'arabic',
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      gap: 12,
    },
    errorText: {
      color: '#EF4444',
      textAlign: 'center',
      padding: 16,
    },
  });

const getPrayerInfo = (prayer: string, isDarkMode: boolean) => {
  const info = {
    Fajr: {
      icon: 'weather-sunset-up',
      color: isDarkMode ? '#FCD34D' : '#F59E0B',
      desc: 'Dawn Prayer',
      background: isDarkMode
        ? 'rgba(252, 211, 77, 0.1)'
        : 'rgba(245, 158, 11, 0.1)',
      borderColor: isDarkMode
        ? 'rgba(252, 211, 77, 0.2)'
        : 'rgba(245, 158, 11, 0.2)',
    },
    Dhuhr: {
      icon: 'white-balance-sunny',
      color: isDarkMode ? '#FDBA74' : '#F97316',
      desc: 'Noon Prayer',
      background: isDarkMode
        ? 'rgba(253, 186, 116, 0.1)'
        : 'rgba(249, 115, 22, 0.1)',
      borderColor: isDarkMode
        ? 'rgba(253, 186, 116, 0.2)'
        : 'rgba(249, 115, 22, 0.2)',
    },
    Asr: {
      icon: 'weather-partly-cloudy',
      color: isDarkMode ? '#6EE7B7' : '#10B981',
      desc: 'Afternoon Prayer',
      background: isDarkMode
        ? 'rgba(110, 231, 183, 0.1)'
        : 'rgba(16, 185, 129, 0.1)',
      borderColor: isDarkMode
        ? 'rgba(110, 231, 183, 0.2)'
        : 'rgba(16, 185, 129, 0.2)',
    },
    Maghrib: {
      icon: 'weather-sunset-down',
      color: isDarkMode ? '#A5B4FC' : '#6366F1',
      desc: 'Sunset Prayer',
      background: isDarkMode
        ? 'rgba(165, 180, 252, 0.1)'
        : 'rgba(99, 102, 241, 0.1)',
      borderColor: isDarkMode
        ? 'rgba(165, 180, 252, 0.2)'
        : 'rgba(99, 102, 241, 0.2)',
    },
    Isha: {
      icon: 'weather-night',
      color: isDarkMode ? '#C4B5FD' : '#7C3AED',
      desc: 'Night Prayer',
      background: isDarkMode
        ? 'rgba(196, 181, 253, 0.1)'
        : 'rgba(124, 58, 237, 0.1)',
      borderColor: isDarkMode
        ? 'rgba(196, 181, 253, 0.2)'
        : 'rgba(124, 58, 237, 0.2)',
    },
  };
  return info[prayer as keyof typeof info];
};
