import { create } from 'zustand';
import {
  Surah,
  Ayah,
  Reciter,
  AudioSettings,
  Bookmark,
  LastReadPosition,
} from '../types/quran';
import { fetchSurahs } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface QuranStore {
  currentSurah: Surah | null;
  currentAyah: Ayah | null;
  currentSurahAyahs: Ayah[] | null;
  currentReciter: Reciter | null;
  translationReciters: { [key: string]: Reciter };
  audioSettings: AudioSettings;
  isPlaying: boolean;
  isDarkMode: boolean;
  audioRef: HTMLAudioElement | null;
  translationAudioRef: HTMLAudioElement | null;
  isLoading: boolean;
  previousSurah: Surah | null;
  nextSurah: Surah | null;
  bookmarks: Bookmark[];
  lastReadPositions: { [surahNumber: number]: LastReadPosition };
  setCurrentSurah: (surah: Surah) => Promise<void>;
  setCurrentAyah: (ayah: Ayah) => void;
  setCurrentSurahAyahs: (ayahs: Ayah[]) => void;
  setCurrentReciter: (reciter: Reciter) => void;
  setTranslationReciter: (language: string, reciter: Reciter) => void;
  togglePlayback: () => void;
  toggleDarkMode: () => void;
  setAudioRef: (ref: HTMLAudioElement) => void;
  setTranslationAudioRef: (ref: HTMLAudioElement) => void;
  setIsLoading: (loading: boolean) => void;
  toggleTranslation: () => void;
  setTranslationLanguage: (language: string) => void;
  preloadNextAyahs: () => void;
  preloadNextAyah: () => void;
  loadStoredState: () => void;
  setDisplayLanguage: (language: string) => void;
  addBookmark: (bookmark: Bookmark) => void;
  removeBookmark: (ayah: Ayah) => void;
  isBookmarked: (ayah: Ayah) => boolean;
  updateLastReadPosition: (
    surahNumber: number,
    position: LastReadPosition
  ) => void;
}

const STORAGE_KEY = 'quran-app-state';

const saveState = async (state: Partial<QuranStore>) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving state:', error);
  }
};

let cachedSurahs: Surah[] | null = null;

const fetchAllSurahs = async (): Promise<Surah[]> => {
  if (cachedSurahs) return cachedSurahs;
  const data = await fetchSurahs();
  cachedSurahs = data;
  return data;
};

export const useQuranStore = create<QuranStore>((set, get) => ({
  currentSurah: null,
  currentAyah: null,
  currentSurahAyahs: null,
  currentReciter: null,
  translationReciters: {},
  audioSettings: {
    withTranslation: false,
    selectedLanguage: 'Select Language',
    displayLanguage: 'ur',
  },
  isPlaying: false,
  isDarkMode: false,
  audioRef: null,
  translationAudioRef: null,
  isLoading: false,
  previousSurah: null,
  nextSurah: null,
  bookmarks: [],
  lastReadPositions: {},
  setCurrentSurah: async (surah) => {
    try {
      const allSurahs = await fetchAllSurahs();
      const currentIndex = allSurahs?.findIndex(
        (s) => s.number === surah.number
      );

      // Reset audio state
      if (get().audioRef) {
        get().audioRef?.pause();
      }
      if (get().translationAudioRef) {
        get().translationAudioRef?.pause();
      }

      set({
        currentSurah: surah,
        currentAyah: null,
        currentSurahAyahs: null,
        previousSurah: currentIndex > 0 ? allSurahs[currentIndex - 1] : null,
        nextSurah:
          currentIndex < allSurahs.length - 1
            ? allSurahs[currentIndex + 1]
            : null,
        isPlaying: false,
      });

      await AsyncStorage.setItem('currentSurah', JSON.stringify(surah));
      saveState(get());
    } catch (error) {
      console.error('Error setting current surah:', error);
    }
  },
  setCurrentAyah: (ayah) => {
    set((state) => ({
      currentAyah: ayah,
      lastReadPositions: ayah?.surahNumber
        ? {
            ...state.lastReadPositions,
            [ayah.surahNumber as number]: {
              ayahNumber: ayah.numberInSurah,
              timestamp: Date.now(),
            },
          }
        : state.lastReadPositions,
    }));
    saveState({ ...get(), currentAyah: ayah });
  },
  setCurrentSurahAyahs: (ayahs) => {
    const ayahsWithSurah = ayahs.map((ayah) => ({
      ...ayah,
      surahNumber: get().currentSurah?.number,
    }));
    set({ currentSurahAyahs: ayahsWithSurah });
    saveState({ ...get(), currentSurahAyahs: ayahsWithSurah });
  },
  setCurrentReciter: (reciter) => {
    set({ currentReciter: reciter });
    saveState({ ...get(), currentReciter: reciter });
  },
  setTranslationReciter: (language, reciter) => {
    set((state) => ({
      translationReciters: {
        ...state.translationReciters,
        [language]: reciter,
      },
    }));
    saveState({
      ...get(),
      translationReciters: {
        ...get().translationReciters,
        [language]: reciter,
      },
    });
  },
  togglePlayback: () => set((state) => ({ isPlaying: !state.isPlaying })),
  toggleDarkMode: () => {
    set((state) => {
      const newDarkMode = !state.isDarkMode;
      saveState({ ...get(), isDarkMode: newDarkMode });
      return { isDarkMode: newDarkMode };
    });
  },
  toggleTranslation: () => {
    set((state) => {
      const newSettings = {
        ...state.audioSettings,
        withTranslation: !state.audioSettings.withTranslation,
      };
      saveState({ ...get(), audioSettings: newSettings });
      return { audioSettings: newSettings };
    });
  },
  setTranslationLanguage: (language: string) => {
    set((state) => ({
      audioSettings: {
        ...state.audioSettings,
        selectedLanguage: language,
        displayLanguage: language,
      },
    }));
    saveState(get());
  },
  setAudioRef: (ref) => set({ audioRef: ref }),
  setTranslationAudioRef: (ref) => set({ translationAudioRef: ref }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  preloadNextAyahs: async () => {
    const { currentAyah, currentSurahAyahs } = get();
    if (!currentAyah || !currentSurahAyahs) return;

    const currentIndex = currentSurahAyahs.findIndex(
      (ayah) => ayah.number === currentAyah.number
    );

    // Preload next 4 ayahs
    const nextAyahs = currentSurahAyahs.slice(
      currentIndex + 1,
      currentIndex + 5
    );

    nextAyahs.forEach(async (ayah) => {
      // Preload Arabic audio
      if (ayah.audio) {
        const audioPreload = new Audio();
        audioPreload.src = ayah.audio;
        audioPreload.preload = 'auto';
      }

      // Preload translation audio if enabled
      if (get().audioSettings.withTranslation) {
        const translationAudio =
          ayah.translationAudios[get().audioSettings.selectedLanguage];
        if (translationAudio) {
          const translationPreload = new Audio();
          translationPreload.src = translationAudio;
          translationPreload.preload = 'auto';
        }
      }
    });
  },
  preloadNextAyah: () => {
    get().preloadNextAyahs();
  },
  loadStoredState: async () => {
    try {
      const storedState = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedState) {
        const parsedState = JSON.parse(storedState);
        set({
          ...parsedState,
          audioSettings: {
            ...parsedState.audioSettings,
            selectedLanguage:
              parsedState.audioSettings?.selectedLanguage || 'ur',
            displayLanguage: parsedState.audioSettings?.displayLanguage || 'ur',
          },
          bookmarks: parsedState.bookmarks || [],
          lastReadPositions: parsedState.lastReadPositions || {},
        });
      }
    } catch (error) {
      console.error('Error loading state:', error);
    }
  },
  setDisplayLanguage: (language: string) => {
    set((state) => ({
      audioSettings: {
        ...state.audioSettings,
        displayLanguage: language,
      },
    }));
    saveState(get());
  },
  addBookmark: (bookmark) => {
    set((state) => {
      const newBookmarks = [...state.bookmarks, bookmark];
      saveState({ bookmarks: newBookmarks });
      return { bookmarks: newBookmarks };
    });
  },
  removeBookmark: (ayah) => {
    set((state) => {
      const newBookmarks = state.bookmarks.filter(
        (bookmark) => bookmark.ayah.number !== ayah.number
      );
      saveState({ bookmarks: newBookmarks });
      return { bookmarks: newBookmarks };
    });
  },
  isBookmarked: (ayah) => {
    return get().bookmarks.some(
      (bookmark) => bookmark.ayah.number === ayah.number
    );
  },
  updateLastReadPosition: (surahNumber: number, position: LastReadPosition) => {
    set((state) => {
      const newPositions = {
        ...state.lastReadPositions,
        [surahNumber]: position,
      };
      saveState({ lastReadPositions: newPositions });
      return { lastReadPositions: newPositions };
    });
  },
}));

// Initialize store with saved data
const initStore = async () => {
  try {
    const savedSurah = await AsyncStorage.getItem('currentSurah');
    if (savedSurah) {
      useQuranStore.setState({ currentSurah: JSON.parse(savedSurah) });
    }
  } catch (error) {
    console.error('Error loading saved data:', error);
  }
};

initStore();
