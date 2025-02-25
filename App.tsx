import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Navigation } from './src/navigation';
import { QueryClient, QueryClientProvider } from 'react-query';
import { StatusBar } from 'react-native';

// Create a client
const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar barStyle='dark-content' />
        <Navigation />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
