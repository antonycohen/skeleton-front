import type {ReactNode} from 'react';
// Uncomment this line to use CSS modules
// import styles from './app.module.css';

import {BrowserRouter} from 'react-router-dom';
import {TranslationProvider, useTranslation} from '@skeleton/core-translations';
import {SessionProvider} from '@skeleton/core-store-session';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {ReactQueryDevtools} from '@tanstack/react-query-devtools';
import {RootRoutes} from './routes/root-routes';
import {Toaster} from 'sonner';
import {PostHogErrorBoundary, PostHogProvider} from '@posthog/react'
import type {CaptureResult} from 'posthog-js'
import {Button, ErrorPlaceholder} from "@skeleton/web-components";
import {useStaticAssetsUrl} from "@skeleton/core-utils";
import {ConfigProvider} from "@skeleton/core-config";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
    },
  },
});


const SENSITIVE_QUERY_PARAMS = ['code', 'state', 'access_token', 'refresh_token', 'id_token'];
const URL_PROPERTIES = ['$current_url', '$referrer', '$initial_current_url', '$initial_referrer'];

const scrubSensitiveQueryParams = (value: string): string => {
  try {
    const parsed = new URL(value, window.location.origin);
    let modified = false;
    SENSITIVE_QUERY_PARAMS.forEach((param) => {
      if (parsed.searchParams.has(param)) {
        parsed.searchParams.set(param, '[redacted]');
        modified = true;
      }
    });
    return modified ? parsed.toString() : value;
  } catch {
    return value;
  }
};

const options = {
  api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
  defaults: '2026-01-30',
  before_send: (event: CaptureResult | null) => {
    if (!event?.properties) return event;
    URL_PROPERTIES.forEach((prop) => {
      const value = event.properties[prop];
      if (typeof value === 'string') {
        event.properties[prop] = scrubSensitiveQueryParams(value);
      }
    });
    return event;
  },
} as const

const YourFallbackComponent = ({error}: { error: unknown }) => {
  // Rendered above TranslationProvider: messages resolve in the default locale.
  const {t} = useTranslation();
  const assetsUrl = useStaticAssetsUrl();
  console.log({
    error: error
  });
  return (
    <div className="h-screen">
      <ErrorPlaceholder image={<img
        src={`${assetsUrl}/error-illustration.svg`}
        alt=""
        className="h-100vh w-[280px] object-cover"
      />} title={t('common.error')}

                        actions={
                          <Button size="sm" onClick={() => window.location.reload()}>
                            {t('common.reloadPage')}
                          </Button>
                        }
      />
    </div>
  )
}

const POSTHOG_KEY = import.meta.env.VITE_PUBLIC_POSTHOG_KEY;

/** Analytics are optional: without a PostHog key the app runs without them. */
const AnalyticsProvider = ({children}: {children: ReactNode}) => {
  if (!POSTHOG_KEY) {
    return <>{children}</>;
  }
  return (
    <PostHogProvider apiKey={POSTHOG_KEY} options={options}>
      {children}
    </PostHogProvider>
  );
};

export function App() {

  return (
    <AnalyticsProvider>
      <PostHogErrorBoundary
        fallback={YourFallbackComponent}
      >
        <QueryClientProvider client={queryClient}>
          <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left"/>
          <Toaster offset={{right: '96px', bottom: '16px'}} mobileOffset={{right: '96px', bottom: '16px'}}/>
          <BrowserRouter>
            <TranslationProvider>
              <SessionProvider>
                <ConfigProvider>
                  <RootRoutes/>
                </ConfigProvider>
              </SessionProvider>
            </TranslationProvider>
          </BrowserRouter>
        </QueryClientProvider>
      </PostHogErrorBoundary>
    </AnalyticsProvider>

  );
}

export default App;
