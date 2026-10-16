// Uncomment this line to use CSS modules
// import styles from './app.module.css';

import { BrowserRouter } from 'react-router-dom';
import { TranslationProvider } from '@skeleton/core-translations';
import { SessionProvider } from '@skeleton/core-store-session';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RootRoutes } from './routes/root-routes';
import { Toaster } from 'sonner';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
    },
  },
});


export function App() {

  return (
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />
        <Toaster />
        <TranslationProvider>
          <SessionProvider >
            <BrowserRouter>
              <RootRoutes />
            </BrowserRouter>
          </SessionProvider>
        </TranslationProvider>
      </QueryClientProvider>
  );
}

export default App;
