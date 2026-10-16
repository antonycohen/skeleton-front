import React, { ReactNode, useCallback, useEffect, useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import { IntlProvider } from "react-intl";
import {
  DEFAULT_LOCALE,
  isSupportedLocale,
  messages,
  SupportedLocale,
} from "../translations";

export { messages };

const LOCALE_STORAGE_KEY = "skeleton-locale";

/** The stored choice, else the browser's language when supported, else the default. */
const getInitialLocale = (): SupportedLocale => {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (isSupportedLocale(stored)) return stored;
  } catch {
    // Storage unavailable (private mode): fall through.
  }
  const browserLocale = typeof navigator !== "undefined" ? navigator.language?.slice(0, 2) : null;
  return isSupportedLocale(browserLocale) ? browserLocale : DEFAULT_LOCALE;
};

export interface TranslationProviderProps {
  children: ReactNode;
}

export const ContextIntl = React.createContext<{
  locale: SupportedLocale;
  selectLanguage: (lang: string) => void;
}>({
  locale: DEFAULT_LOCALE,
  selectLanguage: (_: string) => {
    // do nothing
  }
});

export function TranslationProvider(props: TranslationProviderProps) {
  const [locale, setLocale] = useState<SupportedLocale>(getInitialLocale);

  useEffect(() => {
    dayjs.locale(locale);
    document.documentElement.lang = locale;
  }, [locale]);

  const selectLanguage = useCallback((lang: string) => {
    if (!isSupportedLocale(lang)) return;
    setLocale(lang);
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, lang);
    } catch {
      // Storage unavailable: the choice lasts for this session only.
    }
  }, []);

  return (
    <ContextIntl.Provider value={{ locale, selectLanguage }}>
      <IntlProvider
        locale={locale}
        defaultLocale={DEFAULT_LOCALE}
        messages={messages[locale]}
        onError={(error) => {
          if (import.meta.env.DEV) {
            console.warn(`[i18n] ${error.message}`);
          }
        }}
      >
        {props.children}
      </IntlProvider>
    </ContextIntl.Provider>
  );
}

export function useSelectedLanguage() {
  return React.useContext(ContextIntl).locale;
}

export function useSelectLanguage() {
  return React.useContext(ContextIntl).selectLanguage;
}

/**
 * Follows a language preference stored elsewhere (e.g. the connected user's
 * localization preferences): switches the UI when it is a supported locale.
 */
export function useSyncLanguage(language: string | null | undefined) {
  const { locale, selectLanguage } = React.useContext(ContextIntl);
  useEffect(() => {
    if (isSupportedLocale(language) && language !== locale) {
      selectLanguage(language);
    }
    // Only a change of the preference triggers a switch, not a manual pick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);
}

export default TranslationProvider;
