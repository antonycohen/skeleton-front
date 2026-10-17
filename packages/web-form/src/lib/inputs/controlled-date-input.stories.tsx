import type { Meta, StoryObj } from '@storybook/react-vite';
import { withForm } from '@skeleton/storybook-support';
import { ControlledDateInput } from './controlled-date-input';

const meta = {
  title: 'Patterns/Form/DateInput',
  component: ControlledDateInput,
  decorators: [withForm],
  parameters: { layout: 'centered', form: { defaultValues: { expiresAt: new Date('2026-12-31T00:00:00Z') } } },
  args: { name: 'expiresAt', label: 'Expiration date', placeholder: 'Pick a date' },
  argTypes: { direction: { control: 'inline-radio', options: ['vertical', 'horizontal'] } },
} satisfies Meta<typeof ControlledDateInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: { description: 'The API key stops working after this date.' },
  parameters: { form: { defaultValues: {} } },
};

export const Horizontal: Story = { args: { direction: 'horizontal' } };

export const Disabled: Story = { args: { disabled: true } };

export const Failed: Story = {
  name: 'Error',
  parameters: { form: { defaultValues: {}, errors: { expiresAt: 'The expiration date must be in the future' } } },
};
