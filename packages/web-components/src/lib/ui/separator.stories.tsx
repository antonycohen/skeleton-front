import type { Meta, StoryObj } from '@storybook/react-vite';
import { Separator } from './separator';

const meta = {
  title: 'Components/UI/Separator',
  component: Separator,
  parameters: { layout: 'centered' },
  argTypes: { orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] } },
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  render: (args) => (
    <div className="w-72">
      <div className="text-sm font-medium">Q4 Roadmap</div>
      <div className="text-sm text-muted-foreground">3 teams · 12 members</div>
      <Separator {...args} className="my-4" />
      <div className="text-sm text-muted-foreground">Updated 2 days ago</div>
    </div>
  ),
};

export const Vertical: Story = {
  args: { orientation: 'vertical' },
  render: (args) => (
    <div className="flex h-5 items-center gap-4 text-sm">
      <span>Projects</span>
      <Separator {...args} />
      <span>Teams</span>
      <Separator {...args} />
      <span>Settings</span>
    </div>
  ),
};
