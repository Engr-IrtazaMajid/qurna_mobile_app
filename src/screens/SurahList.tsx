import React, { memo, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ListRenderItem,
} from 'react-native';
import { useQuery } from 'react-query';
import { useQuranStore } from '../store/quranStore';
import { fetchSurahs } from '../services/api';
import { Surah } from '../types/quran';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, TabParamList } from '../types/navigation';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

// Memoized Text Components
const SurahNumber = memo(
  ({ number, isDarkMode }: { number: number; isDarkMode: boolean }) => (
    <Text style={[styles.number, isDarkMode && styles.textDark]}>{number}</Text>
  )
);

const SurahName = memo(
  ({ name, isDarkMode }: { name: string; isDarkMode: boolean }) => (
    <Text style={[styles.englishName, isDarkMode && styles.textDark]}>
      {name}
    </Text>
  )
);

// const SurahTranslation = memo(
//   ({
//     translation,
//     isDarkMode,
//   }: {
//     translation: string;
//     isDarkMode: boolean;
//   }) => (
//     <Text
//       style={[styles.englishMeaning, isDarkMode && styles.textDarkSecondary]}
//     >
//       {translation}
//     </Text>
//   )
// );

const VersesCount = memo(
  ({ count, isDarkMode }: { count: number; isDarkMode: boolean }) => (
    <Text style={[styles.versesCount, isDarkMode && styles.textDarkSecondary]}>
      {count} verses
    </Text>
  )
);

const ArabicName = memo(
  ({ name, isDarkMode }: { name: string; isDarkMode: boolean }) => (
    <Text style={[styles.arabicName, isDarkMode && styles.textDark]}>
      {name}
    </Text>
  )
);

// Memoized Surah Item Component
const SurahItem = memo(
  ({
    surah,
    onPress,
    isDarkMode,
    isActive,
  }: {
    surah: Surah;
    onPress: () => void;
    isDarkMode: boolean;
    isActive: boolean;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.surahItem,
        isDarkMode && styles.surahItemDark,
        isActive && styles.activeSurah,
      ]}
    >
      <View style={styles.leftContainer}>
        <View style={styles.numberContainer}>
          <Text style={styles.number}>{surah.number}</Text>
        </View>
        <View style={styles.nameContainer}>
          <Text style={[styles.englishName, isDarkMode && styles.textDark]}>
            {surah.englishName}
          </Text>
          <Text
            style={[
              styles.englishMeaning,
              isDarkMode && styles.textDarkSecondary,
            ]}
          >
            {surah.englishNameTranslation}
          </Text>
          <Text
            style={[styles.versesCount, isDarkMode && styles.textDarkSecondary]}
          >
            {surah.numberOfAyahs} verses
          </Text>
        </View>
      </View>
      <Text style={[styles.arabicName, isDarkMode && styles.textDark]}>
        {surah.name}
      </Text>
    </TouchableOpacity>
  )
);

export const SurahList = ({ navigation }: Props) => {
  const { currentSurah, isDarkMode, lastReadPositions, currentAyah } =
    useQuranStore();
  const { data: surahs, isLoading } = useQuery('surahs', fetchSurahs);

  const handlePress = useCallback(
    (surah: Surah) => {
      navigation.navigate('Surah', {
        number: surah.number,
        lastPosition: lastReadPositions[surah.number],
      });
    },
    [navigation, lastReadPositions]
  );

  const renderItem: ListRenderItem<Surah> = useCallback(
    ({ item }) => (
      <SurahItem
        surah={item}
        onPress={() => handlePress(item)}
        isDarkMode={isDarkMode}
        isActive={currentSurah?.number === item.number}
      />
    ),
    [handlePress, isDarkMode, currentSurah]
  );

  const keyExtractor = useCallback((item: Surah) => item.number.toString(), []);

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: 88,
      offset: 88 * index,
      index,
    }),
    []
  );

  const listProps = useMemo(
    () => ({
      initialNumToRender: 10,
      maxToRenderPerBatch: 5,
      windowSize: 3,
      removeClippedSubviews: true,
      keyExtractor,
      getItemLayout,
      renderItem,
    }),
    [keyExtractor, getItemLayout, renderItem]
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' color='#10B981' />
      </View>
    );
  }

  return (
    <FlatList
      data={surahs}
      {...listProps}
      style={[styles.container, isDarkMode && styles.containerDark]}
      contentContainerStyle={[
        styles.contentContainer,
        currentAyah ? { paddingBottom: 132 } : { paddingBottom: 64 },
      ]}
      showsVerticalScrollIndicator={false}
    />
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
  contentContainer: {
    padding: 16,
    paddingBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  surahItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  surahItemDark: {
    backgroundColor: '#1F2937',
  },
  activeSurah: {
    borderColor: '#10B981',
    borderWidth: 2,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  numberContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E5F7F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  number: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10B981',
  },
  nameContainer: {
    flex: 1,
    marginRight: 16,
  },
  englishName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  englishMeaning: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 2,
  },
  versesCount: {
    fontSize: 12,
    color: '#6B7280',
  },
  arabicName: {
    fontSize: 22,
    color: '#10B981',
    fontFamily: 'arabic',
    textAlign: 'right',
  },
  textDark: {
    color: '#F3F4F6',
  },
  textDarkSecondary: {
    color: '#9CA3AF',
  },
});
