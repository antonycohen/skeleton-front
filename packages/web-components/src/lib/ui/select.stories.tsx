import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from './select';

const meta = {
  title: 'Components/UI/Select',
  component: Select,
  parameters: { layout: 'centered' },
  args: { onValueChange: fn() },
  argTypes: { disabled: { control: 'boolean' } },
  render: (args, { parameters }) => (
    <Select {...args}>
      <SelectTrigger className="w-60" size={(parameters['size'] as 'sm' | 'default' | undefined) ?? 'default'}>
        <SelectValue placeholder="Choose a workspace" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Workspaces</SelectLabel>
          <SelectItem value="acme">Acme Corporation</SelectItem>
          <SelectItem value="globex">Globex</SelectItem>
          <SelectItem value="initech">Initech</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Teams</SelectLabel>
          <SelectItem value="product">Product</SelectItem>
          <SelectItem value="sales" disabled>Sales (no members yet)</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithValue: Story = { args: { defaultValue: 'globex' } };

export const Small: Story = { args: { defaultValue: 'acme' }, parameters: { size: 'sm' } };

export const Disabled: Story = { args: { disabled: true, defaultValue: 'acme' } };

export const Open: Story = {
  args: { defaultOpen: true, defaultValue: 'acme' },
  parameters: { docs: { story: { inline: false, iframeHeight: 360 } } },
};
