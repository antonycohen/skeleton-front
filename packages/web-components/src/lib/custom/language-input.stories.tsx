import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { fn } from 'storybook/test';
import { LanguageInput, type LanguageOption } from './language-input';

const languages: LanguageOption[] = [
  { iso2: 'en', label: 'English', flag: '🇬🇧' },
  { iso2: 'fr', label: 'French', flag: '🇫🇷' },
  { iso2: 'de', label: 'German', flag: '🇩🇪' },
  { iso2: 'es', label: 'Spanish', flag: '🇪🇸' },
  { iso2: 'it', label: 'Italian', flag: '🇮🇹' },
  { iso2: 'nl', label: 'Dutch', flag: '🇳🇱' },
  { iso2: 'pt', label: 'Portuguese', flag: '🇵🇹' },
];

const meta = {
  title: 'Components/Custom/LanguageInput',
  component: LanguageInput,
  parameters: { layout: 'centered' },
  args: { languages, onChange: fn(), className: 'w-64' },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    return <LanguageInput {...args} value={value} onChange={(next) => { setValue(next); args.onChange?.(next); }} />;
  },
} satisfies Meta<typeof LanguageInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Selected: Story = { args: { value: 'fr' } };

export const Invalid: Story = { args: { 'aria-invalid': true } };

export const Disabled: Story = { args: { value: 'en', disabled: true } };
