import { ReactNode, useContext } from "react";
import { createIntl, IntlContext, PrimitiveType } from "react-intl";
import { DEFAULT_LOCALE, messages } from "../translations";

export type TFunction = (
  id: string,
  options?: Record<string, PrimitiveType | any>,
) => string;

export type TFunctionNode = (
  id: string,
  options?: Record<string, PrimitiveType | any>,
) => ReactNode;

/**
 * Used when no `TranslationProvider` is mounted (unit tests rendering a
 * component alone): messages resolve in the default locale.
 */
const fallbackIntl = createIntl({
  locale: DEFAULT_LOCALE,
  messages: messages[DEFAULT_LOCALE],
  onError: () => {
    // Missing keys are reported by the provider, not here.
  },
});

export function useTranslation() {
  const intl = useContext(IntlContext) ?? fallbackIntl;

  const t: TFunction = (
    id: string,
    options?: Record<string, PrimitiveType | any>,
  ) => {
    return intl.formatMessage({ id }, options) as string;
  };

  const tNode: TFunctionNode = (
    id: string,
    options?: Record<string, PrimitiveType | any>,
  ) => {
    return intl.formatMessage(
      { id },
      {
        b: (chunks: any) => <strong>{chunks}</strong>,
        br: <br />,
        "ul-decimal": (chunks: any) => (
          <ul className="list-decimal ps-4">{chunks}</ul>
        ),
        li: (chunks: any) => <li>{chunks}</li>,
        ...options,
      },
    );
  };

  const isKeyExist = (id?: string): boolean => {
    return !!(id && intl.messages[id]);
  };

  /** Translates `id` when it is a known key, else returns it as is (e.g. a server message). */
  const tIfKey = (id: string | undefined | null): string | undefined => {
    if (!id) return id ?? undefined;
    return isKeyExist(id) ? t(id) : id;
  };

  return { t, tNode, tIfKey, isKeyExist, intl };
}
