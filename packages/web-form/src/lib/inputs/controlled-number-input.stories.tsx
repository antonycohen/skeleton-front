import type { Meta, StoryObj } from '@storybook/react-vite';
import { withForm } from '@skeleton/storybook-support';
import { ControlledNumberInput } from './controlled-number-input';

const meta = {
  title: 'Patterns/Form/NumberInput',
  component: ControlledNumberInput,
  decorators: [withForm],
  parameters: { layout: 'centered', form: { defaultValues: { seats: 25 } } },
  args: { name: 'seats', label: 'Seats', min: 1, max: 500, step: 1 },
} satisfies Meta<typeof ControlledNumberInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = { args: { placeholder: '10' }, parameters: { form: { defaultValues: {} } } };

export const Failed: Story = {
  name: 'Error',
  parameters: { form: { defaultValues: { seats: 900 }, errors: { seats: 'Your plan allows up to 500 seats' } } },
};
