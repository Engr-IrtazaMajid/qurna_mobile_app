import React, { memo } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from './ui/Card';
import { StyledText } from './ui/StyledText';
import { Ayah } from '../types/quran';
import { IconButton } from './ui/IconButton';

interface AyahCardProps {
  ayah: Ayah;
  isCurrentAyah: boolean;
  isDarkMode: boolean;
  onPress: () => void;
  onBookmarkToggle: () => void;
  isBookmarked: boolean;
  withTranslation: boolean;
  selectedLanguage: string;
}

export const AyahCard = memo(
  ({
    ayah,
    isCurrentAyah,
    isDarkMode,
    onPress,
    onBookmarkToggle,
    isBookmarked,
    withTranslation,
    selectedLanguage,
  }: AyahCardProps) => (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card
        style={{
          ...styles.container,
          ...(isCurrentAyah ? styles.activeCard : {}),
        }}
      >
        <View style={styles.header}>
          <StyledText
            variant='subtitle'
            style={{
              ...styles.ayahNumber,
              ...(isCurrentAyah ? styles.ayahNumberActive : {}),
              ...(isCurrentAyah ? styles.activeText : {}),
            }}
          >
            {ayah.numberInSurah}
          </StyledText>
          <IconButton
            style={{
              ...styles.bookmarkButton,
              ...(isDarkMode ? styles.bookmarkButtonDark : {}),
              ...(isBookmarked ? styles.bookmarkButtonActive : {}),
            }}
            name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
            size={20}
            color={isBookmarked ? '#10B981' : '#9CA3AF'}
            onPress={onBookmarkToggle}
            active={isBookmarked}
          />
        </View>

        <StyledText
          variant='arabic'
          style={{
            ...styles.arabicText,
            ...(isCurrentAyah ? styles.activeText : {}),
          }}
        >
          {ayah.text}
        </StyledText>

        {withTranslation && ayah.translations?.[selectedLanguage] && (
          <StyledText
            style={{
              ...styles.translationText,
              ...(isCurrentAyah ? styles.activeText : {}),
            }}
          >
            {ayah.translations[selectedLanguage]}
          </StyledText>
        )}
      </Card>
    </TouchableOpacity>
  )
);

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  activeCard: {
    borderColor: '#10B981',
    borderWidth: 2,
    transform: [{ scale: 1.02 }],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  ayahNumber: {
    fontSize: 17,
    color: '#64748B',
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
  bookmarkIcon: {
    transform: [{ scale: 1.1 }],
    opacity: 0.8,
  },
  arabicText: {
    marginBottom: 16,
  },
  translationText: {
    fontSize: 16,
    color: '#475569',
    lineHeight: 28,
    letterSpacing: 0.3,
  },
  activeText: {
    color: '#10B981',
  },
});
