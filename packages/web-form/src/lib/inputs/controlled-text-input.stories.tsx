import type { Meta, StoryObj } from '@storybook/react-vite';
import { withForm } from '@skeleton/storybook-support';
import { GlobeIcon } from 'lucide-react';
import { ControlledTextInput } from './controlled-text-input';

const meta = {
  title: 'Patterns/Form/TextInput',
  component: ControlledTextInput,
  decorators: [withForm],
  parameters: { layout: 'centered', form: { defaultValues: { name: 'Acme — Product team' } } },
  args: { name: 'name', label: 'Project name', placeholder: 'e.g. Website redesign' },
  argTypes: { direction: { control: 'inline-radio', options: ['vertical', 'horizontal'] } },
} satisfies Meta<typeof ControlledTextInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = { parameters: { form: { defaultValues: { name: '' } } } };

export const WithDescription: Story = {
  args: { description: 'Only your team sees this name.' },
};

/** A fixed prefix before the value (pasting a full URL strips it). */
export const WithPrefix: Story = {
  args: { name: 'websiteUrl', label: 'Website', inputPrefix: 'https://', placeholder: 'www.acme.io' },
  parameters: { form: { defaultValues: { websiteUrl: 'www.acme.io/pricing' } } },
};

export const WithLeftElement: Story = {
  args: { name: 'domain', label: 'Company domain', leftElement: <GlobeIcon className="size-4 text-muted-foreground" /> },
  parameters: { form: { defaultValues: { domain: 'globex.com' } } },
};

export const Horizontal: Story = { args: { direction: 'horizontal' } };

export const Disabled: Story = { args: { disabled: true } };

export const Failed: Story = {
  name: 'Error',
  parameters: { form: { defaultValues: { name: '' }, errors: { name: 'Name must be at least 2 characters' } } },
};
