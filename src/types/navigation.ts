import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Main: undefined;
  Surah: { number: number; lastPosition?: { ayahNumber: number } };
};

export type TabParamList = {
  Home: undefined;
  Bookmarks: undefined;
  'Prayer Times': undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;
