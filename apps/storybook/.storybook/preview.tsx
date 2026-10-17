import type { Preview } from '@storybook/react-vite';
import { withThemeByClassName } from '@storybook/addon-themes';
import { setupWorker } from 'msw/browser';
import { mswLoader } from 'msw-storybook-addon/csf3';
import { defaultHandlers, sessionLoader, withProviders } from '@skeleton/storybook-support/preview';
import '../src/styles.css';
import '../src/prototypes/prototype-styles.css';

const preview: Preview = {
  loaders: [
    // The default handlers are the worker's initial ones: they survive the reset between stories,
    // and each story's `parameters.msw` overrides are layered on top.
    mswLoader(async () => {
      const workerUrl = './mockServiceWorker.js';
      // Some embedded browsers (e.g. the Claude app's preview pane) expose the Service Worker API but
      // refuse to register a worker. MSW only falls back to patching fetch/XHR in the page when the
      // API is missing, so hide it when registration fails.
      try {
        await navigator.serviceWorker.register(workerUrl);
      } catch (error) {
        console.warn('[storybook-msw] Service Worker unavailable, mocking in fallback mode.', error);
        delete (Navigator.prototype as { serviceWorker?: unknown }).serviceWorker;
      }
      const worker = setupWorker(...defaultHandlers);
      await worker.start({
        quiet: true,
        serviceWorker: { url: workerUrl },
        // Every API call is answered (the fallback handler catches what no domain mocks, and says
        // so in the console); anything else — fonts, images, Vite — goes to the network.
        onUnhandledFrame: 'bypass',
      });
      return worker;
    }),
    sessionLoader,
  ],
  decorators: [
    // Flags the Prototypes stories on <html> (portalled dialogs included), for the styles they try
    // out before the design system takes them (prototypes/prototype-styles.css).
    (Story, context) => {
      document.documentElement.toggleAttribute('data-prototype', context.title.startsWith('Prototypes/'));
      return <Story />;
    },
    withProviders,
    withThemeByClassName({ themes: { light: '', dark: 'dark' }, defaultTheme: 'light', parentSelector: 'html' }),
  ],
  parameters: {
    layout: 'fullscreen',
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i }, expanded: true },
    a11y: { test: 'todo' },
    options: {
      storySort: {
        order: ['Introduction', 'Foundations', ['Colors', 'Typography', 'Spacing & layout', 'Radius & shadows', 'Icons'], 'Components', ['UI', 'Custom', 'Pro blocks'], 'Patterns', 'Layout', 'Screens', 'Prototypes', ['About']],
      },
    },
  },
  tags: ['autodocs'],
};

export default preview;
