import type { Meta, StoryObj } from '@storybook/react-vite';
import { withForm } from '@skeleton/storybook-support';
import { ControlledColorPickerInput } from './controlled-color-picker-input';

const meta = {
  title: 'Patterns/Form/ColorPickerInput',
  component: ControlledColorPickerInput,
  decorators: [withForm],
  parameters: { layout: 'centered', form: { defaultValues: { primaryColor: '#4F46E5' } } },
  args: { name: 'primaryColor', label: 'Primary color' },
  argTypes: { direction: { control: 'inline-radio', options: ['vertical', 'horizontal'] } },
} satisfies Meta<typeof ControlledColorPickerInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = { parameters: { form: { defaultValues: { primaryColor: null } } } };

export const Horizontal: Story = { args: { direction: 'horizontal' } };
