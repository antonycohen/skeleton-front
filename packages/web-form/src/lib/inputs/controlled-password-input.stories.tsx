import type { Meta, StoryObj } from '@storybook/react-vite';
import { withForm } from '@skeleton/storybook-support';
import { ControlledPasswordInput } from './controlled-password-input';

const meta = {
  title: 'Patterns/Form/PasswordInput',
  component: ControlledPasswordInput,
  decorators: [withForm],
  parameters: { layout: 'centered', form: { defaultValues: { password: 'correct-horse-battery' } } },
  args: { name: 'password', label: 'Password', placeholder: 'At least 12 characters' },
  argTypes: { direction: { control: 'inline-radio', options: ['vertical', 'horizontal'] } },
} satisfies Meta<typeof ControlledPasswordInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = { parameters: { form: { defaultValues: { password: '' } } } };

export const Failed: Story = {
  name: 'Error',
  parameters: { form: { defaultValues: { password: 'acme' }, errors: { password: 'Password must be at least 12 characters' } } },
};
