import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Checkbox } from './checkbox';
import { Label } from './label';

const meta = {
  title: 'Components/UI/Checkbox',
  component: Checkbox,
  parameters: { layout: 'centered' },
  args: { onCheckedChange: fn(), 'aria-label': 'Select' },
  argTypes: {
    checked: { control: 'select', options: [false, true, 'indeterminate'] },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Checked: Story = { args: { defaultChecked: true } };

export const Indeterminate: Story = { args: { checked: 'indeterminate' } };

export const Disabled: Story = { args: { disabled: true, defaultChecked: true } };

export const Invalid: Story = { args: { 'aria-invalid': true } };

export const WithLabel: Story = {
  render: (args) => (
    <div className="flex items-center gap-2">
      <Checkbox {...args} id="exclude-customers" />
      <Label htmlFor="exclude-customers">Exclude existing customers</Label>
    </div>
  ),
};
