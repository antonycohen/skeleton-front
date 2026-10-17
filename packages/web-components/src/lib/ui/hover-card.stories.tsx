import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Avatar, AvatarFallback } from './avatar';
import { Button } from './button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from './hover-card';

const meta = {
  title: 'Components/UI/HoverCard',
  component: HoverCard,
  parameters: { layout: 'centered' },
  args: { onOpenChange: fn(), openDelay: 200 },
  render: (args) => (
    <HoverCard {...args}>
      <HoverCardTrigger asChild>
        <Button variant="link">@acme</Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="flex gap-4">
          <Avatar className="size-10">
            <AvatarFallback>AC</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">Acme Corporation</h4>
            <p className="text-sm">Manufacturing · 5,000 employees · Chicago, IL</p>
            <p className="text-xs text-muted-foreground">Customer since 2024</p>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  ),
} satisfies Meta<typeof HoverCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Open: Story = {
  args: { defaultOpen: true },
  parameters: { docs: { story: { inline: false, iframeHeight: 260 } } },
};
