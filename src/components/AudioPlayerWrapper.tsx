import React, { useState, useEffect } from 'react';
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

  const [isVisible, setIsVisible] = useState(shouldShowUI);

  useEffect(() => {
    setIsVisible(shouldShowUI);
  }, [shouldShowUI]);

  return (
    <AudioPlayer
      style={{
        bottom: isVisible ? (isMainTab ? 60 : 0) : 0,
        height: isVisible ? 'auto' : 0,
        opacity: isVisible ? 1 : 0,
      }}
    />
  );
};
