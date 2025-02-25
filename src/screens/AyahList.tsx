import React, { useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useQuery } from 'react-query';
import { useQuranStore } from '../store/quranStore';
import { fetchAyahs, fetchSurahs } from '../services/api';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import GlobeIcon from 'react-native-vector-icons/Entypo';
import { LanguageSelector } from '../screens/LanguageSelector';
import { Ayah } from '../types/quran';
import type { RootStackScreenProps } from '../types/navigation';
import {
  getCacheKey,
  createTranslationsMap,
  mapAyahsWithTranslations,
} from '../utils/quranHelpers';
import { ReciterSelector } from '../screens/ReciterSelector';

const AyahCard = React.memo(
  ({
    ayah,
    isCurrentAyah,
    isDarkMode,
    onPress,
    onBookmarkToggle,
    isBookmarked,
    withTranslation,
    selectedLanguage,
  }: {
    ayah: Ayah;
    isCurrentAyah: boolean;
    isDarkMode: boolean;
    onPress: () => void;
    onBookmarkToggle: () => void;
    isBookmarked: boolean;
    withTranslation: boolean;
    selectedLanguage: string;
  }) => (
    <TouchableOpacity
      style={[
        styles.ayahCard,
        isDarkMode && styles.ayahCardDark,
        isCurrentAyah && styles.ayahCardActive,
      ]}
      onPress={onPress}
    >
      <View style={styles.ayahHeader}>
        <Text
          style={[styles.ayahNumber, isCurrentAyah && styles.ayahNumberActive]}
        >
          {ayah.numberInSurah}
        </Text>
        <TouchableOpacity
          onPress={onBookmarkToggle}
          style={[
            styles.bookmarkButton,
            isDarkMode && styles.bookmarkButtonDark,
            isBookmarked && styles.bookmarkButtonActive,
          ]}
        >
          <Icon
            name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
            size={20}
            color={isBookmarked ? '#10B981' : '#9CA3AF'}
            style={{
              transform: [{ scale: isBookmarked ? 1.1 : 1 }],
              opacity: isBookmarked ? 1 : 0.6,
            }}
          />
        </TouchableOpacity>
      </View>

      <Text
        style={[
          styles.arabicText,
          isDarkMode && styles.arabicTextDark,
          isCurrentAyah && styles.activeText,
        ]}
      >
        {ayah.text}
      </Text>

      {withTranslation &&
        ayah.translations &&
        ayah.translations[selectedLanguage] && (
          <Text
            style={[
              styles.translationText,
              isDarkMode && styles.translationTextDark,
              isCurrentAyah && styles.activeTranslationText,
            ]}
          >
            {ayah.translations[selectedLanguage]}
          </Text>
        )}
    </TouchableOpacity>
  )
);

export const AyahList = ({
  route,
  navigation,
}: RootStackScreenProps<'Surah'>) => {
  const { number, lastPosition } = route.params;
  const {
    setCurrentAyah,
    currentSurahAyahs,
    currentAyah,
    isPlaying,
    isLoading,
    currentSurah,
    setCurrentSurahAyahs,
    currentReciter,
    audioSettings,
    toggleTranslation,
    isDarkMode,
    setTranslationLanguage,
    setDisplayLanguage,
    setCurrentSurah,
    addBookmark,
    removeBookmark,
    isBookmarked,
  } = useQuranStore();

  const scrollViewRef = useRef<ScrollView>(null);
  const flatListRef = useRef<FlatList>(null);

  const { data: surahs } = useQuery('surahs', fetchSurahs, {
    staleTime: Infinity,
    onSuccess: (data) => {
      if (number && !currentSurah) {
        const surah = data.find((s) => s.number === number);
        if (surah) {
          setCurrentSurah({ ...surah, ayahs: [] });
        }
      }
    },
  });

  useEffect(() => {
    if (number && surahs) {
      const surah = surahs.find((s) => s.number === number);
      if (surah) {
        setCurrentSurah({ ...surah, ayahs: [] });
      }
    }
  }, [number, setCurrentSurah, surahs]);

  const reciterId = currentReciter?.id || 'ar.alafasy';

  const translationsCache = useRef<{
    [key: string]: {
      ayahs: Ayah[];
      translations: { [key: number]: string };
      reciterId: string;
    };
  }>({});

  const { isLoading: isAyahsLoading, data: ayahs } = useQuery(
    [
      'ayahs',
      number,
      reciterId,
      audioSettings.withTranslation,
      audioSettings.selectedLanguage,
    ],
    async () => {
      const cacheKey = getCacheKey(
        number.toString(),
        audioSettings.selectedLanguage
      );
      const cachedData = translationsCache.current[cacheKey];

      if (cachedData && cachedData.reciterId === reciterId) {
        return mapAyahsWithTranslations(
          cachedData.ayahs,
          cachedData.translations,
          audioSettings.selectedLanguage,
          audioSettings.withTranslation
        );
      }

      const ayahs = await fetchAyahs(
        number,
        reciterId,
        audioSettings.withTranslation,
        audioSettings.selectedLanguage
      );

      translationsCache.current[cacheKey] = {
        ayahs,
        reciterId,
        translations: createTranslationsMap(
          ayahs,
          audioSettings.selectedLanguage
        ),
      };

      return ayahs;
    },
    {
      enabled: !!number,
      onSuccess: (data) => {
        setCurrentSurahAyahs(data);
        if (lastPosition?.ayahNumber) {
          const targetAyah = data.find(
            (a) => a.numberInSurah === lastPosition.ayahNumber
          );
          if (targetAyah) {
            setCurrentAyah(targetAyah);
            return;
          }
        }
        if (!currentAyah || currentAyah.surahNumber !== number) {
          setCurrentAyah(data[0]);
        }
      },
    }
  );

  useEffect(() => {
    if (flatListRef.current && lastPosition?.ayahNumber && ayahs) {
      setTimeout(() => {
        const index = ayahs.findIndex(
          (ayah) => ayah.numberInSurah === lastPosition.ayahNumber
        );
        if (index !== -1) {
          flatListRef.current?.scrollToIndex({
            index,
            animated: true,
            viewPosition: 0.3,
          });
        }
      }, 300);
    }
  }, [ayahs, lastPosition]);

  const handleAyahClick = (ayah: Ayah) => {
    if (currentAyah?.number !== ayah.number || !isPlaying) {
      setCurrentAyah(ayah);
    }
  };

  const handleBookmarkToggle = (ayah: Ayah) => {
    if (isBookmarked(ayah)) {
      removeBookmark(ayah);
    } else {
      addBookmark({
        ayah,
        timestamp: Date.now(),
      });
    }
  };

  const handlePreviousSurah = () => {
    if (currentSurah?.number && currentSurah.number > 1) {
      navigation.replace('Surah', {
        number: currentSurah.number - 1,
      });
    }
  };

  const handleNextSurah = () => {
    if (currentSurah?.number && currentSurah.number < 114) {
      navigation.replace('Surah', {
        number: currentSurah.number + 1,
      });
    }
  };

  const renderItem = useCallback(
    ({ item: ayah }: { item: Ayah }) => (
      <AyahCard
        ayah={ayah}
        isCurrentAyah={currentAyah?.number === ayah.number}
        isDarkMode={isDarkMode}
        onPress={() => handleAyahClick(ayah)}
        onBookmarkToggle={() => handleBookmarkToggle(ayah)}
        isBookmarked={isBookmarked(ayah)}
        withTranslation={audioSettings.withTranslation}
        selectedLanguage={audioSettings.selectedLanguage}
      />
    ),
    [
      currentAyah?.number,
      isDarkMode,
      audioSettings.withTranslation,
      audioSettings.selectedLanguage,
    ]
  );

  const keyExtractor = useCallback((item: Ayah) => item.number.toString(), []);

  const getItemLayout = useCallback(
    (data: any, index: number) => ({
      length: 200, // Approximate height of each item
      offset: 200 * index,
      index,
    }),
    []
  );

  if (isAyahsLoading || !currentSurahAyahs) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' color='#10B981' />
      </View>
    );
  }

  if (!currentSurah || currentSurahAyahs.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No ayahs found</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Main')}
          style={styles.returnButton}
        >
          <Text style={styles.returnButtonText}>Return to Surah list</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View
      style={[styles.pageContainer, isDarkMode && styles.pageContainerDark]}
    >
      <FlatList
        ref={flatListRef}
        data={currentSurahAyahs}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        maxToRenderPerBatch={10}
        windowSize={10}
        removeClippedSubviews={true}
        initialNumToRender={10}
        ListHeaderComponent={() => (
          <View
            style={[
              styles.headerContainer,
              isDarkMode && styles.headerContainerDark,
            ]}
          >
            <View style={styles.navigationRow}>
              <TouchableOpacity
                onPress={handlePreviousSurah}
                style={[styles.navButton, isDarkMode && styles.navButtonDark]}
                disabled={currentSurah?.number === 1}
              >
                <Icon
                  name='chevron-left'
                  size={24}
                  color={isDarkMode ? '#E2E8F0' : '#4B5563'}
                />
              </TouchableOpacity>

              <View style={styles.titleContainer}>
                <Text
                  style={[
                    styles.surahTitle,
                    isDarkMode && styles.surahTitleDark,
                  ]}
                >
                  {currentSurah?.name}
                </Text>
                <Text
                  style={[
                    styles.surahNumber,
                    isDarkMode && styles.surahNumberDark,
                  ]}
                >
                  {currentSurah?.number}/114
                </Text>
              </View>

              <TouchableOpacity
                onPress={handleNextSurah}
                style={[styles.navButton, isDarkMode && styles.navButtonDark]}
                disabled={currentSurah?.number === 114}
              >
                <Icon
                  name='chevron-right'
                  size={24}
                  color={isDarkMode ? '#E2E8F0' : '#4B5563'}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.controls}>
              <ReciterSelector />
              <View style={styles.translationRow}>
                <TouchableOpacity
                  onPress={toggleTranslation}
                  style={[
                    styles.translationButton,
                    isDarkMode && styles.translationButtonDark,
                  ]}
                >
                  <GlobeIcon name='globe' size={20} color='white' />
                  <Text
                    style={[
                      styles.translationButtonText,
                      isDarkMode && styles.translationButtonTextDark,
                      audioSettings.withTranslation &&
                        styles.translationButtonTextActive,
                    ]}
                  >
                    {audioSettings.withTranslation ? 'Hide' : 'Show'}
                  </Text>
                </TouchableOpacity>

                {audioSettings.withTranslation ? (
                  <View style={styles.languageSelector}>
                    <LanguageSelector
                      onLanguageChange={(lang) => {
                        setTranslationLanguage(lang);
                        setDisplayLanguage(lang);
                      }}
                    />
                  </View>
                ) : null}
              </View>
            </View>
          </View>
        )}
        contentContainerStyle={[
          styles.contentContainer,
          currentAyah && styles.contentContainerWithPlayer,
        ]}
        onScrollToIndexFailed={() => {}}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  pageContainerDark: {
    backgroundColor: '#0F172A',
  },
  container: {
    flex: 1,
  },
  containerDark: {
    backgroundColor: '#111827',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 120,
  },
  contentContainerWithPlayer: {
    paddingBottom: 96, // Increased padding to account for player
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingContainerDark: {
    backgroundColor: '#0F172A',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 12,
  },
  returnButton: {
    padding: 10,
  },
  returnButtonText: {
    color: '#10B981',
    fontSize: 16,
  },
  headerContainer: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  headerContainerDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    shadowOpacity: 0.3,
  },
  navigationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  surahTitle: {
    fontSize: 32,
    fontFamily: 'arabic',
    color: '#111827',
    marginBottom: 8,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  surahTitleDark: {
    color: '#F1F5F9',
  },
  surahNumber: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  surahNumberDark: {
    color: '#94A3B8',
  },
  navButton: {
    padding: 14,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    width: 52,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  navButtonDark: {
    backgroundColor: '#334155',
    borderColor: '#475569',
  },
  controls: {
    gap: 20,
    padding: 4,
  },
  translationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  translationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: '#047857',
  },
  translationButtonDark: {
    backgroundColor: '#10B981',
    borderColor: '#047857',
  },
  translationButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
    letterSpacing: 0.2,
  },
  translationButtonTextDark: {
    color: 'white',
  },
  translationButtonTextActive: {
    color: 'white',
  },
  languageSelector: {
    flex: 1,
    maxWidth: 200,
  },
  ayahCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  ayahCardDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  ayahCardActive: {
    borderColor: '#10B981',
    borderWidth: 2,
    transform: [{ scale: 1.02 }],
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  ayahHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomColor: '#F1F5F9',
  },
  ayahHeaderDark: {
    borderBottomColor: '#334155',
  },
  ayahNumber: {
    fontSize: 17,
    fontWeight: '600',
    color: '#64748B',
    letterSpacing: 0.3,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 26,
  },
  ayahNumberActive: {
    color: '#10B981',
    backgroundColor: '#E5F7F0',
  },
  bookmarkButton: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  bookmarkButtonDark: {
    backgroundColor: '#334155',
    borderColor: '#475569',
  },
  bookmarkButtonActive: {
    backgroundColor: '#E8FFF7',
    borderColor: '#10B981',
  },
  bookmarkButtonActiveDark: {
    backgroundColor: '#064E3B',
    borderColor: '#10B981',
  },
  arabicText: {
    fontSize: 28,
    color: '#0F172A',
    textAlign: 'right',
    lineHeight: 52,
    fontFamily: 'arabic',
    marginBottom: 24,
    letterSpacing: 1.2,
  },
  arabicTextDark: {
    color: '#F8FAFC',
  },
  translationText: {
    fontSize: 16,
    color: '#475569',
    lineHeight: 28,
    letterSpacing: 0.3,
  },
  translationTextDark: {
    color: '#E2E8F0',
  },
  textLight: {
    color: '#F8FAFC',
  },
  activeText: {
    color: '#10B981',
  },
  activeTranslationText: {
    color: '#10B981',
  },
});
