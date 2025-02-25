import { QueryClient, QueryClientProvider } from 'react-query';
import { Navigation } from './navigation';

const queryClient = new QueryClient();

export const App = () => (
  <QueryClientProvider client={queryClient}>
    <Navigation />
  </QueryClientProvider>
);
