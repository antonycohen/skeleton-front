import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChartLineIcon } from 'lucide-react';
import { daysAgo } from '@skeleton/storybook-support';
import { LineChartCard, type LineChartCardDataPoint, type LineChartCardSeries } from './line-chart-card';
import { EmptyChartContent } from './empty-chart-content';

const series: LineChartCardSeries[] = [
  { key: 'active', label: 'Active users', color: '#6366F1' },
  { key: 'signups', label: 'New sign-ups', color: '#A1A1AA' },
];

/** Weekly activity over two months. */
const data: LineChartCardDataPoint[] = Array.from({ length: 9 }, (_, i) => ({
  date: daysAgo((8 - i) * 7),
  active: 180 + i * 42 + ((i * 53) % 40),
  signups: 160 + i * 9 + ((i * 31) % 30),
}));

const meta = {
  title: 'Components/Custom/LineChartCard',
  component: LineChartCard,
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div className="max-w-2xl"><Story /></div>],
  args: { data, series, title: 'Activity over time', description: 'Active users vs new sign-ups, last 8 weeks' },
} satisfies Meta<typeof LineChartCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithHeader: Story = {
  args: { headerIcon: <ChartLineIcon />, headerLabel: 'Acme — Q4 Roadmap' },
};

export const SingleSeries: Story = {
  args: { series: series.slice(0, 1), title: 'Active users' },
};

export const Empty: Story = { args: { data: [] } };

export const CustomEmptyState: Story = {
  args: {
    data: [],
    emptyState: <EmptyChartContent title="No data yet" description="Activity appears here once your members sign in." />,
  },
};
