import type { Meta, StoryObj } from '@storybook/react-vite';
import { withForm } from '@skeleton/storybook-support';
import { ControlledLanguageInput, type LanguageOption } from './controlled-language-input';

const LANGUAGES: LanguageOption[] = [
  { iso2: 'en', label: 'English', flag: '🇬🇧' },
  { iso2: 'fr', label: 'French', flag: '🇫🇷' },
  { iso2: 'de', label: 'German', flag: '🇩🇪' },
  { iso2: 'es', label: 'Spanish', flag: '🇪🇸' },
  { iso2: 'it', label: 'Italian', flag: '🇮🇹' },
  { iso2: 'nl', label: 'Dutch', flag: '🇳🇱' },
];

const meta = {
  title: 'Patterns/Form/LanguageInput',
  component: ControlledLanguageInput,
  decorators: [withForm],
  parameters: { layout: 'centered', form: { defaultValues: { language: 'fr' } } },
  args: {
    name: 'language',
    label: 'Interface language',
    languages: LANGUAGES,
    placeholder: 'Select a language',
    searchPlaceholder: 'Search…',
    emptyMessage: 'No language found.',
  },
  argTypes: { direction: { control: 'inline-radio', options: ['vertical', 'horizontal'] } },
} satisfies Meta<typeof ControlledLanguageInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = { parameters: { form: { defaultValues: {} } } };

export const Horizontal: Story = { args: { direction: 'horizontal' } };

export const Failed: Story = {
  name: 'Error',
  parameters: { form: { defaultValues: {}, errors: { language: 'Pick a language' } } },
};
