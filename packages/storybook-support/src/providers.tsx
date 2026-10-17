import { useState, type ReactNode } from 'react';
import type { Decorator, Loader } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { TranslationProvider } from '@skeleton/core-translations';
import { ConfigProvider } from '@skeleton/core-config';
import { WorkspaceProvider } from '@skeleton/core-workspace';
import { useOAuthStore } from '@skeleton/core-store-oauth';
import { useSessionStore } from '@skeleton/core-store-session';
import { SidebarProvider } from '@skeleton/web-components';
import { SidebarVisibilityProvider } from '@skeleton/web-layout';
import { AppShell, type ShellNavigationItem } from './app-shell';
import { USER_ID } from './fixtures/session';
import { applyScenario, scenario, type ScenarioParameters } from './scenario';

/**
 * How a screen story is mounted. `path` is the route pattern the page is declared under (so
 * `useParams` works), `url` the address it opens at; both are relative to the workspace
 * (`/w/:workspaceId/`) unless they start with `/`.
 */
export type ScreenParameters = {
  path: string;
  url?: string;
  /** `app` (default): inside the signed-in shell. `bare`: the page alone (full-screen views, login…). */
  layout?: 'app' | 'bare';
  /** Workspace-less screens (login, account picker…) skip the WorkspaceProvider. */
  workspace?: boolean;
  /** The sidebar's main menu, in place of the default one (paths relative to the workspace). */
  navigation?: ShellNavigationItem[];
};

export type RouterParameters = { url?: string; path?: string };

const base64Url = (value: object) =>
  btoa(JSON.stringify(value)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');

/** An unsigned JWT the app accepts (it never verifies signatures, the API does). */
const fakeAccessToken = base64Url({ alg: 'none', typ: 'JWT' }) + '.' +
  base64Url({ sub: USER_ID, aud: import.meta.env.VITE_OAUTH_CLIENT_ID, exp: 4_102_444_800 }) + '.storybook';

/** Before each story renders: who is connected, in which workspace. */
export const sessionLoader: Loader = async ({ parameters }) => {
  applyScenario(parameters as ScenarioParameters);
  if (scenario.user) {
    useOAuthStore.getState().setAuth({ accessToken: fakeAccessToken, refreshToken: null, accessTokenExpirationDate: null });
    useSessionStore.setState({ connectedUser: scenario.user, isLoading: false, error: null });
  } else {
    useOAuthStore.getState().reset();
    useSessionStore.setState({ connectedUser: null, isLoading: false, error: null });
  }
  return {};
};

const absolute = (path: string, workspaceId: string) =>
  path.startsWith('/') ? path : `/w/${workspaceId}/${path}`;

/** Shown when a story navigates away (a redirect, a link click): the address it went to. */
function NavigatedAway() {
  const location = useLocation();
  return (
    <div className="flex min-h-60 flex-col items-center justify-center gap-2 p-8 text-center text-sm text-muted-foreground">
      <span className="font-medium text-foreground">Navigated away</span>
      <code className="rounded bg-muted px-2 py-1">{location.pathname + location.search + location.hash}</code>
    </div>
  );
}

function BareShell() {
  return (
    <SidebarVisibilityProvider>
      <SidebarProvider defaultOpen={false}>
        <div className="w-full">
          <Outlet />
        </div>
      </SidebarProvider>
    </SidebarVisibilityProvider>
  );
}

function StoryProviders({ children }: { children: ReactNode }) {
  // One cache per story, so stories never see each other's data.
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: Infinity, retry: false }, mutations: { retry: false } } }),
  );
  return (
    <QueryClientProvider client={queryClient}>
      <TranslationProvider>
        {children}
        <Toaster />
      </TranslationProvider>
    </QueryClientProvider>
  );
}

/**
 * Global decorator. Components get a query client, translations and a router (at
 * `parameters.router.url`, default `/`). Screens (`parameters.screen`) also get the app
 * configuration, the open workspace and — unless `layout: 'bare'` — the signed-in shell.
 */
export const withProviders: Decorator = (Story, context) => {
  const screen = context.parameters['screen'] as ScreenParameters | undefined;
  const workspaceId = scenario.workspace.id as string;

  if (!screen) {
    const router = (context.parameters['router'] ?? {}) as RouterParameters;
    return (
      <StoryProviders>
        <MemoryRouter initialEntries={[router.url ?? '/']}>
          <Routes>
            <Route path={router.path ?? '*'} element={<Story />} />
            {router.path && <Route path="*" element={<NavigatedAway />} />}
          </Routes>
        </MemoryRouter>
      </StoryProviders>
    );
  }

  const path = absolute(screen.path, workspaceId);
  const url = absolute(screen.url ?? screen.path, workspaceId);
  const routes = (
    <Routes>
      {screen.layout === 'bare' ? (
        // Pages render their own top bar, whose sidebar toggle needs a sidebar context even here.
        <Route element={<BareShell />}>
          <Route path={path} element={<Story />} />
          <Route path="*" element={<NavigatedAway />} />
        </Route>
      ) : (
        <Route element={<AppShell navigation={screen.navigation} />}>
          <Route path={path} element={<Story />} />
          <Route path="*" element={<NavigatedAway />} />
        </Route>
      )}
    </Routes>
  );

  return (
    <StoryProviders>
      <MemoryRouter initialEntries={[url]}>
        <ConfigProvider>
          {screen.workspace === false ? routes : <WorkspaceProvider selectedWorkspaceId={workspaceId}>{routes}</WorkspaceProvider>}
        </ConfigProvider>
      </MemoryRouter>
    </StoryProviders>
  );
};
