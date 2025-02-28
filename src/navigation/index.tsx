import React from 'react';
import { TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { RootStackParamList, TabParamList } from '../types/navigation';
import { useQuranStore } from '../store/quranStore';
import { SurahList } from '../screens/SurahList';
import { AyahList } from '../screens/AyahList';
import { BookmarksList } from '../screens/BookmarksList';
import { PrayerTimesScreen } from '../screens/PrayerTimes';
import { Layout } from '../screens/Layout';
import { AudioPlayerWrapper } from '../components/AudioPlayerWrapper';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const TabNavigator = () => {
  const { isDarkMode, toggleDarkMode } = useQuranStore();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }: { color: string; size: number }) => {
          const iconMap: Record<string, string> = {
            Home: 'book-open',
            Bookmarks: 'bookmark',
            'Prayer Times': 'clock',
          };
          return (
            <Icon
              name={iconMap[route.name] || 'circle'}
              size={size}
              color={color}
            />
          );
        },
        tabBarActiveTintColor: '#10B981',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          backgroundColor: isDarkMode ? '#1F2937' : 'white',
          borderTopColor: isDarkMode ? '#374151' : '#E5E7EB',
          height: 60,
          paddingBottom: 4,
          paddingTop: 4,
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          elevation: 0,
          borderTopWidth: 1,
          zIndex: 1,
        },
        headerStyle: {
          backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
        },
        headerTintColor: '#10B981',
        headerShadowVisible: false,
        headerTitleAlign: 'center',
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
          color: '#10B981',
        },
        headerRight: () => (
          <TouchableOpacity
            onPress={toggleDarkMode}
            style={{
              padding: 8,
              marginRight: 8,
              borderRadius: 20,
              backgroundColor: isDarkMode ? '#374151' : '#F3F4F6',
            }}
          >
            <Icon
              name={isDarkMode ? 'sun' : 'moon'}
              size={24}
              color={isDarkMode ? '#FCD34D' : '#4B5563'}
            />
          </TouchableOpacity>
        ),
      })}
    >
      <Tab.Screen
        name='Home'
        component={SurahList}
        options={{
          title: 'Quran',
          headerShown: true,
        }}
      />
      <Tab.Screen
        name='Bookmarks'
        component={BookmarksList}
        options={{
          title: 'Bookmarks',
        }}
      />
      <Tab.Screen
        name='Prayer Times'
        component={PrayerTimesScreen}
        options={{
          title: 'Prayer Times',
        }}
      />
    </Tab.Navigator>
  );
};

const MainStack = () => {
  const { isDarkMode } = useQuranStore();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
        },
        headerTintColor: '#10B981',
        headerShadowVisible: false,
        headerTitleAlign: 'center',
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
          color: '#10B981',
        },
      }}
    >
      <Stack.Screen name='Main' options={{ headerShown: false }}>
        {(props) => (
          <Layout>
            <TabNavigator />
          </Layout>
        )}
      </Stack.Screen>
      <Stack.Screen
        name='Surah'
        options={({ route }) => ({
          title: `Surah ${route.params.number}`,
          headerShown: true,
        })}
      >
        {(props) => (
          <Layout>
            <AyahList {...props} />
          </Layout>
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

export const Navigation = () => {
  const { isDarkMode } = useQuranStore();

  return (
    <NavigationContainer>
      <SafeAreaProvider>
        <SafeAreaView
          style={{
            flex: 1,
            backgroundColor: isDarkMode ? '#111827' : '#F9FAFB',
          }}
        >
          <MainStack />
          <AudioPlayerWrapper />
        </SafeAreaView>
      </SafeAreaProvider>
    </NavigationContainer>
  );
};
