import { FieldPath, FieldValues } from 'react-hook-form';
import { useTranslation } from '@skeleton/core-translations';
import { ControlledTokenInput, TokenOption } from './controlled-token-input';

type LanguageOption = TokenOption<string> & { flag: string; i18nKey: string };

// Values are BCP-47 tags. English carries its region so that US and UK spellings can be told
// apart. `label` is the English name; `i18nKey` is the translated name shown in the UI.
const LANGUAGE_OPTIONS: LanguageOption[] = [
  { value: 'en-US', label: 'English (US)', i18nKey: 'form.languages.en-US', flag: '🇺🇸' },
  { value: 'en-GB', label: 'English (UK)', i18nKey: 'form.languages.en-GB', flag: '🇬🇧' },
  { value: 'fr', label: 'French', i18nKey: 'form.languages.fr', flag: '🇫🇷' },
  { value: 'es', label: 'Spanish', i18nKey: 'form.languages.es', flag: '🇪🇸' },
  { value: 'de', label: 'German', i18nKey: 'form.languages.de', flag: '🇩🇪' },
  { value: 'it', label: 'Italian', i18nKey: 'form.languages.it', flag: '🇮🇹' },
  { value: 'pt', label: 'Portuguese', i18nKey: 'form.languages.pt', flag: '🇵🇹' },
  { value: 'nl', label: 'Dutch', i18nKey: 'form.languages.nl', flag: '🇳🇱' },
  { value: 'pl', label: 'Polish', i18nKey: 'form.languages.pl', flag: '🇵🇱' },
  { value: 'ru', label: 'Russian', i18nKey: 'form.languages.ru', flag: '🇷🇺' },
  { value: 'ja', label: 'Japanese', i18nKey: 'form.languages.ja', flag: '🇯🇵' },
  { value: 'zh', label: 'Chinese', i18nKey: 'form.languages.zh', flag: '🇨🇳' },
  { value: 'ko', label: 'Korean', i18nKey: 'form.languages.ko', flag: '🇰🇷' },
  { value: 'ar', label: 'Arabic', i18nKey: 'form.languages.ar', flag: '🇸🇦' },
  { value: 'hi', label: 'Hindi', i18nKey: 'form.languages.hi', flag: '🇮🇳' },
  { value: 'tr', label: 'Turkish', i18nKey: 'form.languages.tr', flag: '🇹🇷' },
  { value: 'sv', label: 'Swedish', i18nKey: 'form.languages.sv', flag: '🇸🇪' },
  { value: 'da', label: 'Danish', i18nKey: 'form.languages.da', flag: '🇩🇰' },
  { value: 'no', label: 'Norwegian', i18nKey: 'form.languages.no', flag: '🇳🇴' },
  { value: 'fi', label: 'Finnish', i18nKey: 'form.languages.fi', flag: '🇫🇮' },
  { value: 'cs', label: 'Czech', i18nKey: 'form.languages.cs', flag: '🇨🇿' },
  { value: 'el', label: 'Greek', i18nKey: 'form.languages.el', flag: '🇬🇷' },
  { value: 'he', label: 'Hebrew', i18nKey: 'form.languages.he', flag: '🇮🇱' },
  { value: 'th', label: 'Thai', i18nKey: 'form.languages.th', flag: '🇹🇭' },
  { value: 'vi', label: 'Vietnamese', i18nKey: 'form.languages.vi', flag: '🇻🇳' },
  { value: 'id', label: 'Indonesian', i18nKey: 'form.languages.id', flag: '🇮🇩' },
  { value: 'ms', label: 'Malay', i18nKey: 'form.languages.ms', flag: '🇲🇾' },
  { value: 'uk', label: 'Ukrainian', i18nKey: 'form.languages.uk', flag: '🇺🇦' },
  { value: 'ro', label: 'Romanian', i18nKey: 'form.languages.ro', flag: '🇷🇴' },
  { value: 'hu', label: 'Hungarian', i18nKey: 'form.languages.hu', flag: '🇭🇺' },
  { value: 'bg', label: 'Bulgarian', i18nKey: 'form.languages.bg', flag: '🇧🇬' },
];

// Legacy values that may still be stored, rendered but not offered as new choices: a bare `en`
// (stored before the region was requested).
const LEGACY_LANGUAGE_DISPLAY: Record<string, { flag: string; label: string; i18nKey: string }> = {
  en: { flag: '🌐', label: 'English', i18nKey: 'form.languages.en' },
};

/**
 * Display text of a language tag. `translate` resolves an option's `i18nKey`; without it the
 * English label is used.
 */
const getLanguageDisplay = (tag: string, translate?: (key: string) => string): string => {
  const labelOf = (option: { label: string; i18nKey: string }) =>
    translate ? translate(option.i18nKey) : option.label;
  const exact = LANGUAGE_OPTIONS.find((l) => l.value === tag);
  if (exact) return `${exact.flag} ${labelOf(exact)}`;
  const legacy = LEGACY_LANGUAGE_DISPLAY[tag];
  if (legacy) return `${legacy.flag} ${labelOf(legacy)}`;
  // Unknown regional tag (e.g. `fr-CA`, `pt-BR`): reuse the base language's flag and label and keep
  // the region visible, rather than showing a raw code.
  const base = LANGUAGE_OPTIONS.find((l) => l.value === tag.split('-')[0]);
  if (base && tag.includes('-')) return `${base.flag} ${labelOf(base)} (${tag.split('-')[1]})`;
  return tag;
};

type ControlledLanguageTokenInputProps<TForm extends FieldValues> = {
  name: FieldPath<TForm>;
  label?: string;
  placeholder?: string;
  direction?: 'horizontal' | 'vertical';
  className?: string;
};

export function ControlledLanguageTokenInput<TForm extends FieldValues>(
  props: ControlledLanguageTokenInputProps<TForm>,
) {
  const { name, label, placeholder, direction, className } = props;
  const { t } = useTranslation();
  const options = LANGUAGE_OPTIONS.map((option) => ({ ...option, label: t(option.i18nKey) }));

  return (
    <ControlledTokenInput<TForm, string>
      name={name}
      label={label}
      placeholder={placeholder ?? t('form.languageToken.placeholder')}
      direction={direction}
      className={className}
      forceSelection
      source={{ type: 'static', options }}
      renderToken={(iso) => <span>{getLanguageDisplay(iso, t)}</span>}
    />
  );
}

export { LANGUAGE_OPTIONS, getLanguageDisplay };
