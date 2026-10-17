import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Input } from './input';
import { Label } from './label';

const meta = {
  title: 'Components/UI/Input',
  component: Input,
  parameters: { layout: 'centered' },
  args: { placeholder: 'https://acme.com', onChange: fn(), className: 'w-72' },
  argTypes: {
    type: { control: 'select', options: ['text', 'email', 'password', 'number', 'url', 'file'] },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Filled: Story = { args: { defaultValue: 'https://globex.com/solutions' } };

export const Disabled: Story = { args: { disabled: true, defaultValue: 'https://initech.com' } };

export const Invalid: Story = { args: { 'aria-invalid': true, defaultValue: 'not a url' } };

export const File: Story = { args: { type: 'file', placeholder: undefined } };

export const WithLabel: Story = {
  render: (args) => (
    <div className="grid gap-2">
      <Label htmlFor="website-url">Website URL</Label>
      <Input {...args} id="website-url" />
    </div>
  ),
};
