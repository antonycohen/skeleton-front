import type { Meta, StoryObj } from '@storybook/react-vite';
import { Checkbox } from './checkbox';
import { Label } from './label';

const meta = {
  title: 'Components/UI/Label',
  component: Label,
  parameters: { layout: 'centered' },
  args: { children: 'Project name' },
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Dimmed when its peer control is disabled. */
export const WithDisabledPeer: Story = {
  render: (args) => (
    <div className="flex items-center gap-2">
      <Checkbox id="notify" disabled />
      <Label {...args} htmlFor="notify">Notify the sales team</Label>
    </div>
  ),
};
