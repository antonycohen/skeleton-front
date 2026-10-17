import type { Meta, StoryObj } from '@storybook/react-vite';
import { daysAgo } from '@skeleton/storybook-support';
import { BarChartCard, type BarChartCardDataPoint } from './bar-chart-card';
import { EmptyChartContent } from './empty-chart-content';

/** 30 days of sessions, with a weekday rhythm. */
const sessions: BarChartCardDataPoint[] = Array.from({ length: 30 }, (_, i) => {
  const day = 29 - i;
  const weekend = day % 7 === 1 || day % 7 === 2;
  return { name: 'Sessions', date: daysAgo(day), value: (weekend ? 40 : 120) + ((i * 37) % 60) + i * 3 };
});

const meta = {
  title: 'Components/Custom/BarChartCard',
  component: BarChartCard,
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div className="max-w-xl"><Story /></div>],
  args: { data: sessions, title: 'Sessions last 30 days', description: 'Across all workspaces' },
} satisfies Meta<typeof BarChartCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CustomColor: Story = {
  args: { title: 'Sign-ups', description: 'Across all workspaces', barColor: '#14B8A6', data: sessions.map((p) => ({ ...p, value: Math.round(p.value / 12) })) },
};

export const Empty: Story = { args: { data: [] } };

export const CustomEmptyState: Story = {
  args: {
    data: [],
    emptyState: <EmptyChartContent title="No sessions yet" description="Invite your team to start collecting activity." />,
  },
};
