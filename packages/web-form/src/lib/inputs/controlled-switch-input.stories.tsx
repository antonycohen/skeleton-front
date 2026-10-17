import type { Meta, StoryObj } from '@storybook/react-vite';
import { withForm } from '@skeleton/storybook-support';
import { ControlledSwitchInput } from './controlled-switch-input';

const meta = {
  title: 'Patterns/Form/SwitchInput',
  component: ControlledSwitchInput,
  decorators: [withForm],
  parameters: { layout: 'centered', form: { defaultValues: { weeklyDigest: false } } },
  args: { name: 'weeklyDigest', label: 'Send a weekly activity digest' },
} satisfies Meta<typeof ControlledSwitchInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const On: Story = { parameters: { form: { defaultValues: { weeklyDigest: true } } } };

export const WithDescription: Story = {
  args: { description: 'A summary of what happened in your workspace, every Monday.' },
};

export const Inline: Story = { args: { inline: true } };

export const Disabled: Story = { args: { disabled: true } };
