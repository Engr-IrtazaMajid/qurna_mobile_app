import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Icon from 'react-native-vector-icons/Feather';
import { Audio } from 'expo-av';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import { useQuranStore } from '../store/quranStore';
import { Surah } from '../types/quran';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

// Add type for navigation
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface NavigationButtonProps {
  direction: 'previous' | 'next';
  surah: Surah | null;
}

const NavigationButton: React.FC<NavigationButtonProps> = ({
  direction,
  surah,
}) => {
  const navigation = useNavigation<NavigationProp>();
  const { isDarkMode } = useQuranStore();

  if (!surah) {
    return <View style={{ width: 50 }} />;
  }

  return (
    <TouchableOpacity
      style={[
        styles.navigationButton,
        isDarkMode && styles.navigationButtonDark,
      ]}
      onPress={() =>
        navigation.navigate('Surah', {
          number: surah.number,
        })
      }
    >
      <Icon
        name={direction === 'previous' ? 'chevron-left' : 'chevron-right'}
        size={24}
        color={isDarkMode ? '#E5E7EB' : '#6B7280'}
      />
    </TouchableOpacity>
  );
};

const PlayButton: React.FC<{
  isPlaying: boolean;
  isLoading: boolean;
  disabled: boolean;
  onPress: () => void;
}> = ({ isPlaying, isLoading, disabled, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    style={styles.playButton}
  >
    {isLoading ? (
      <LoadingSpinner text='' size={'small'} color='#fff' isDarkMode={false} />
    ) : isPlaying ? (
      <Ionicons name='pause-circle' size={30} color='#fff' />
    ) : (
      <Ionicons name='play-circle' size={30} color='#fff' />
    )}
  </TouchableOpacity>
);

const ControlButton: React.FC<{
  iconName: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  disabled: boolean;
  isDarkMode: boolean;
}> = ({ iconName, onPress, disabled, isDarkMode }) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    style={[
      styles.controlButton,
      isDarkMode && styles.controlButtonDark,
      { opacity: disabled ? 0.5 : 1 },
    ]}
  >
    <Ionicons
      name={iconName}
      size={24}
      color={isDarkMode ? '#E5E7EB' : '#6B7280'}
    />
  </TouchableOpacity>
);

export const AudioPlayer: React.FC<{ style?: object }> = ({ style }) => {
  const navigation = useNavigation<NavigationProp>();
  const [isTranslationPlaying, setIsTranslationPlaying] = useState(false);
  const arabicSoundRef = useRef<Audio.Sound | null>(null);
  const translationSoundRef = useRef<Audio.Sound | null>(null);

  const {
    isPlaying,
    currentAyah,
    currentSurah,
    currentSurahAyahs,
    audioSettings,
    togglePlayback,
    setCurrentAyah,
    isLoading,
    setIsLoading,
    preloadNextAyah,
    previousSurah,
    nextSurah,
    isDarkMode,
  } = useQuranStore();

  // Load and play audio when currentAyah changes
  useEffect(() => {
    const loadAndPlayAudio = async () => {
      if (!currentAyah?.audio) return;
      setIsLoading(true);
      setIsTranslationPlaying(false);

      try {
        // First, stop and unload all existing audio
        await Promise.all([
          arabicSoundRef.current?.unloadAsync(),
          translationSoundRef.current?.unloadAsync(),
        ]);
        arabicSoundRef.current = null;
        translationSoundRef.current = null;

        // Load Arabic audio first
        const { sound: newArabicSound } = await Audio.Sound.createAsync(
          { uri: currentAyah.audio },
          { shouldPlay: false },
          onArabicPlaybackStatusUpdate
        );
        arabicSoundRef.current = newArabicSound;

        // Load translation audio if needed
        if (
          audioSettings.withTranslation &&
          currentAyah.translationAudios &&
          currentAyah.translationAudios[audioSettings.selectedLanguage]
        ) {
          const { sound: newTranslationSound } = await Audio.Sound.createAsync(
            {
              uri: currentAyah.translationAudios[
                audioSettings.selectedLanguage
              ],
            },
            { shouldPlay: false },
            onTranslationPlaybackStatusUpdate
          );
          translationSoundRef.current = newTranslationSound;
        }

        // Play if needed
        if (isPlaying && arabicSoundRef.current) {
          await arabicSoundRef.current.playAsync();
          preloadNextAyah();
        }
      } catch (error) {
        console.error('Audio loading error:', error);
        togglePlayback();
      } finally {
        setIsLoading(false);
      }
    };

    loadAndPlayAudio();

    // Cleanup on unmount
    return () => {
      if (arabicSoundRef.current) {
        arabicSoundRef.current.unloadAsync();
      }
      if (translationSoundRef.current) {
        translationSoundRef.current.unloadAsync();
      }
    };
  }, [
    currentAyah,
    isPlaying,
    audioSettings.withTranslation,
    audioSettings.selectedLanguage,
    togglePlayback,
    setIsLoading,
    preloadNextAyah,
  ]);

  const onArabicPlaybackStatusUpdate = (status: any) => {
    if (status.didJustFinish && !status.isLooping) {
      handleArabicAudioEnd();
    }
  };

  const onTranslationPlaybackStatusUpdate = (status: any) => {
    if (status.didJustFinish && !status.isLooping) {
      handleTranslationAudioEnd();
    }
  };

  const handlePlayPause = async () => {
    if (!arabicSoundRef.current || !currentAyah?.audio) return;

    try {
      if (isPlaying) {
        // Stop all audio immediately
        if (isTranslationPlaying && translationSoundRef.current) {
          await translationSoundRef.current.stopAsync();
        } else if (arabicSoundRef.current) {
          await arabicSoundRef.current.stopAsync();
        }
        setIsTranslationPlaying(false);
      } else {
        // Start fresh playback
        if (arabicSoundRef.current) {
          await arabicSoundRef.current.playAsync();
          preloadNextAyah();
        }
      }
      togglePlayback();
    } catch (error) {
      console.error('Audio playback error:', error);
      setIsTranslationPlaying(false);
      if (isPlaying) {
        togglePlayback();
      }
    }
  };

  const handleArabicAudioEnd = async () => {
    if (
      audioSettings.withTranslation &&
      translationSoundRef.current &&
      currentAyah?.translationAudios &&
      currentAyah.translationAudios[audioSettings.selectedLanguage]
    ) {
      try {
        // Ensure Arabic audio is fully stopped before playing translation
        if (arabicSoundRef.current) {
          await arabicSoundRef.current.stopAsync();
        }

        // Small delay to ensure clean transition
        await new Promise((resolve) => setTimeout(resolve, 100));

        setIsTranslationPlaying(true);
        await translationSoundRef.current.playAsync();
      } catch (error) {
        console.error('Translation audio playback error:', error);
        setIsTranslationPlaying(false);
        handleNextAyah();
      }
    } else {
      handleNextAyah();
    }
  };

  const handleTranslationAudioEnd = () => {
    setIsTranslationPlaying(false);
    handleNextAyah();
  };

  const handleNextAyah = () => {
    if (!currentSurahAyahs || !currentAyah) return;

    const currentIndex = currentSurahAyahs.findIndex(
      (ayah) => ayah.number === currentAyah.number
    );

    if (currentIndex < currentSurahAyahs.length - 1) {
      setCurrentAyah(currentSurahAyahs[currentIndex + 1]);
    } else {
      togglePlayback();
    }
  };

  const handlePrevAyah = () => {
    if (!currentSurahAyahs || !currentAyah) return;

    const currentIndex = currentSurahAyahs.findIndex(
      (ayah) => ayah.number === currentAyah.number
    );

    if (currentIndex > 0) {
      setCurrentAyah(currentSurahAyahs[currentIndex - 1]);
    }
  };

  const navigateToCurrentAyah = () => {
    if (currentSurah) {
      navigation.navigate('Surah', {
        number: currentSurah.number,
        lastPosition: currentAyah?.numberInSurah
          ? { ayahNumber: currentAyah.numberInSurah }
          : undefined,
      });
    }
  };

  const isFirstAyah =
    !currentSurahAyahs || !currentAyah
      ? true
      : currentSurahAyahs[0].number === currentAyah.number;

  const isLastAyah =
    !currentSurahAyahs || !currentAyah
      ? true
      : currentSurahAyahs[currentSurahAyahs.length - 1].number ===
        currentAyah.number;

  if (!currentSurah) {
    return null;
  }

  return (
    <View style={[styles.container, isDarkMode && styles.containerDark, style]}>
      <View style={styles.audioControls}>
        <TouchableOpacity onPress={navigateToCurrentAyah}>
          <Text style={[styles.surahText, isDarkMode && styles.textLight]}>
            {currentSurah.name} • Verse {currentAyah?.numberInSurah}
          </Text>
        </TouchableOpacity>

        {isTranslationPlaying && (
          <Text style={styles.translationText}>
            Playing {audioSettings.selectedLanguage.toUpperCase()}
          </Text>
        )}

        <View style={styles.controlRow}>
          <NavigationButton direction='previous' surah={previousSurah} />
          <View style={styles.controlsGroup}>
            <ControlButton
              iconName='play-back'
              onPress={handlePrevAyah}
              disabled={isFirstAyah || isLoading}
              isDarkMode={isDarkMode}
            />
            <PlayButton
              isPlaying={isPlaying}
              isLoading={isLoading}
              disabled={!currentAyah?.audio || isLoading}
              onPress={handlePlayPause}
            />
            <ControlButton
              iconName='play-forward'
              onPress={handleNextAyah}
              disabled={isLastAyah || isLoading}
              isDarkMode={isDarkMode}
            />
          </View>
          <NavigationButton direction='next' surah={nextSurah} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: -3 },
    shadowRadius: 6,
    elevation: 8,
  },
  containerDark: {
    backgroundColor: 'rgba(31,41,55,0.98)',
    borderTopColor: '#374151',
  },
  textLight: {
    color: '#F3F4F6',
  },
  audioControls: {
    alignItems: 'center',
    gap: 8,
  },
  surahText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  translationText: {
    fontSize: 13,
    color: '#10B981',
    marginBottom: 8,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 4,
    paddingHorizontal: 4,
  },
  navigationButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  navigationButtonDark: {
    backgroundColor: '#374151',
  },
  playButton: {
    backgroundColor: '#10B981',
    borderRadius: 25,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
  },
  controlButton: {
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
  },
  controlButtonDark: {
    backgroundColor: '#374151',
  },
  controlsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
});

export default AudioPlayer;
