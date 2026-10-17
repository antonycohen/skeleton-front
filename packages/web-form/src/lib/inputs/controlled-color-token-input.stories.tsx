import type { Meta, StoryObj } from '@storybook/react-vite';
import { withForm } from '@skeleton/storybook-support';
import { ControlledColorTokenInput } from './controlled-color-token-input';

const meta = {
  title: 'Patterns/Form/ColorTokenInput',
  component: ControlledColorTokenInput,
  decorators: [withForm],
  parameters: { layout: 'centered', form: { defaultValues: { colors: ['#4F46E5', '#0EA5E9', '#F59E0B'] } } },
  args: { name: 'colors', label: 'Theme colors' },
  argTypes: { direction: { control: 'inline-radio', options: ['vertical', 'horizontal'] } },
} satisfies Meta<typeof ControlledColorTokenInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = { parameters: { form: { defaultValues: { colors: [] } } } };

export const Horizontal: Story = { args: { direction: 'horizontal' } };
