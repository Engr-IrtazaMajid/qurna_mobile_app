import React from 'react';
import { useNavigationState } from '@react-navigation/native';
import { AudioPlayer } from '../screens/AudioPlayer';

export const AudioPlayerWrapper = () => {
  const state = useNavigationState((state) => state);
  const currentRoute = state?.routes[state.index];
  const isMainTab = currentRoute?.name === 'Main';
  const isSurahScreen = currentRoute?.name === 'Surah';

  const shouldShowUI =
    isSurahScreen ||
    (isMainTab &&
      currentRoute.state?.routes[currentRoute.state.index || 0]?.name ===
        'Home');

  if (!shouldShowUI) {
    return <AudioPlayer style={{ height: 0, opacity: 0 }} />;
  }

  const bottomPosition = isMainTab ? 60 : 0;

  return <AudioPlayer style={{ bottom: bottomPosition }} />;
};
