import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { ActivityIcon, UsersIcon } from 'lucide-react';
import { Progress } from '../ui/progress';
import { MetricCard } from './metric-card';

const meta = {
  title: 'Components/Custom/MetricCard',
  component: MetricCard,
  parameters: { layout: 'centered' },
  decorators: [(Story) => <div className="w-80"><Story /></div>],
  args: {
    headerText: 'Sessions this month',
    statisticText: '12,480',
    descriptionText: '+18% vs last month',
    icon: <ActivityIcon className="size-8 text-primary" />,
    onCtaClick: fn(),
  },
  argTypes: { variant: { control: 'select', options: ['default', 'empty'] } },
} satisfies Meta<typeof MetricCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = { args: { variant: 'empty', descriptionDataEmpty: 'No sessions yet' } };

export const WithBadges: Story = {
  args: {
    headerText: 'Active members',
    statisticText: '37',
    descriptionText: 'out of 120 members',
    icon: <UsersIcon className="size-8 text-primary" />,
    badge1: true,
    badge1Text: 'Camille signed in 4 times',
    badge2: true,
    badge2Text: 'Hugo joined the Product team',
  },
};

export const WithCtaAndSlot: Story = {
  args: {
    headerText: 'Seats',
    statisticText: '62',
    descriptionText: 'seats left this period',
    icon: undefined,
    separator: true,
    slot: <Progress value={62} className="h-2" />,
    cta1: true,
    cta1Text: 'Buy seats',
  },
};
