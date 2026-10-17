import type { Meta, StoryObj } from '@storybook/react-vite';
import { withForm } from '@skeleton/storybook-support';
import { ControlledLanguageTokenInput } from './controlled-language-token-input';

const meta = {
  title: 'Patterns/Form/LanguageTokenInput',
  component: ControlledLanguageTokenInput,
  decorators: [withForm],
  parameters: { layout: 'centered', form: { defaultValues: { languages: ['en-US', 'fr', 'de'] } } },
  args: { name: 'languages', label: 'Languages', placeholder: 'Add a language' },
  argTypes: { direction: { control: 'inline-radio', options: ['vertical', 'horizontal'] } },
} satisfies Meta<typeof ControlledLanguageTokenInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = { parameters: { form: { defaultValues: { languages: [] } } } };

/** Older records store a bare `en` or a regional tag the list does not offer. */
export const LegacyValues: Story = {
  parameters: { form: { defaultValues: { languages: ['en', 'fr-CA', 'pt-BR'] } } },
};
