import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Label } from './label';
import { Switch } from './switch';

const meta = {
  title: 'Components/UI/Switch',
  component: Switch,
  parameters: { layout: 'centered' },
  args: { onCheckedChange: fn(), 'aria-label': 'Toggle' },
  argTypes: { checked: { control: 'boolean' }, disabled: { control: 'boolean' } },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Checked: Story = { args: { defaultChecked: true } };

export const Disabled: Story = { args: { disabled: true, defaultChecked: true } };

export const WithLabel: Story = {
  render: (args) => (
    <div className="flex items-center gap-2">
      <Switch {...args} id="notifications" defaultChecked />
      <Label htmlFor="notifications">Email notifications</Label>
    </div>
  ),
};
