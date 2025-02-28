import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useQuranStore } from '../store/quranStore';
import { format } from 'date-fns';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, TabParamList } from '../types/navigation';
import { Ayah } from '../types/quran';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Bookmarks'>,
  NativeStackScreenProps<RootStackParamList>
>;

export const BookmarksList = ({ navigation }: Props) => {
  const { bookmarks, removeBookmark, audioSettings, isDarkMode } =
    useQuranStore();

  if (bookmarks.length === 0) {
    return (
      <View
        style={[styles.emptyContainer, isDarkMode && styles.emptyContainerDark]}
      >
        <View style={styles.emptyIconContainer}>
          <Icon
            name='bookmark'
            size={72}
            color={isDarkMode ? '#4B5563' : '#9CA3AF'}
          />
        </View>
        <Text style={[styles.emptyTitle, isDarkMode && styles.textLight]}>
          No Bookmarks Yet
        </Text>
        <Text style={[styles.emptySubtitle, isDarkMode && styles.textLight]}>
          Start bookmarking your favorite verses to save them for quick access
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, isDarkMode && styles.containerDark]}
      contentContainerStyle={styles.content}
    >
      {bookmarks.map(
        (bookmark: { ayah: Ayah; timestamp: number; note?: string }) => (
          <View
            key={`${bookmark.ayah.number}-${bookmark.timestamp}`}
            style={[styles.card, isDarkMode && styles.cardDark]}
          >
            <View
              style={[styles.cardHeader, isDarkMode && styles.cardHeaderDark]}
            >
              <View style={styles.surahInfo}>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('Surah', {
                      number: Number(bookmark.ayah.surahNumber),
                      lastPosition: { ayahNumber: bookmark.ayah.numberInSurah },
                    })
                  }
                >
                  <Text
                    style={[
                      styles.surahLink,
                      isDarkMode && styles.surahLinkDark,
                    ]}
                  >
                    {`Surah ${bookmark.ayah.surahNumber || ''} • Verse ${
                      bookmark.ayah.numberInSurah || ''
                    }`}
                  </Text>
                  <Text
                    style={[
                      styles.timestamp,
                      isDarkMode && styles.timestampDark,
                    ]}
                  >
                    {format(bookmark.timestamp, 'MMM d, yyyy')}
                  </Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={() => removeBookmark(bookmark.ayah)}
                style={[
                  styles.deleteButton,
                  isDarkMode && styles.deleteButtonDark,
                ]}
                activeOpacity={0.7}
              >
                <Icon
                  name='trash-2'
                  size={20}
                  color={isDarkMode ? '#FCA5A5' : '#DC2626'}
                />
              </TouchableOpacity>
            </View>

            <Text style={[styles.arabicText, isDarkMode && styles.textLight]}>
              {bookmark.ayah.text}
            </Text>

            {audioSettings.withTranslation &&
              bookmark.ayah.translations &&
              bookmark.ayah.translations[audioSettings.selectedLanguage] && (
                <Text
                  style={[
                    styles.translationText,
                    isDarkMode && styles.textLight,
                  ]}
                >
                  {bookmark.ayah.translations[audioSettings.selectedLanguage]}
                </Text>
              )}

            {bookmark.note && (
              <View
                style={[
                  styles.noteContainer,
                  isDarkMode && styles.noteContainerDark,
                ]}
              >
                <Text style={[styles.noteText, isDarkMode && styles.textLight]}>
                  {bookmark.note}
                </Text>
              </View>
            )}
          </View>
        )
      )}
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
    paddingBottom: 32,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F9FAFB',
  },
  emptyContainerDark: {
    backgroundColor: '#111827',
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 24,
    letterSpacing: 0.1,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  cardDark: {
    backgroundColor: '#1F2937',
    borderColor: '#374151',
    shadowOpacity: 0.4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  cardHeaderDark: {
    borderBottomColor: '#374151',
  },
  surahInfo: {
    flex: 1,
    marginRight: 16,
  },
  surahLink: {
    color: '#059669',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  surahLinkDark: {
    color: '#34D399',
  },
  timestamp: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 12,
    letterSpacing: 0.2,
  },
  timestampDark: {
    color: '#9CA3AF',
  },
  deleteButton: {
    padding: 10,
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  deleteButtonDark: {
    backgroundColor: '#991B1B',
    borderColor: '#7F1D1D',
  },
  arabicText: {
    fontSize: 26,
    color: '#111827',
    textAlign: 'right',
    lineHeight: 46,
    fontFamily: 'arabic',
    marginBottom: 20,
    letterSpacing: 1,
  },
  translationText: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
  },
  noteContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  noteContainerDark: {
    backgroundColor: '#374151',
    borderColor: '#4B5563',
  },
  noteText: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 24,
    letterSpacing: 0.1,
  },
  textLight: {
    color: '#F3F4F6',
  },
  emptyIconContainer: {
    marginBottom: 24,
  },
});
