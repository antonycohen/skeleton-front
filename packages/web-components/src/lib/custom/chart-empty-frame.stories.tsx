import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChartEmptyFrame } from './chart-empty-frame';
import { EmptyChartContent } from './empty-chart-content';

const formatDate = (date: string | Date) =>
  new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

const meta = {
  title: 'Components/Custom/ChartEmptyFrame',
  component: ChartEmptyFrame,
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div className="h-64 max-w-xl"><Story /></div>],
  args: { dateFormatter: formatDate },
} satisfies Meta<typeof ChartEmptyFrame>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: <EmptyChartContent title="No data yet" description="Sessions appear here once your members sign in." /> },
};

/** Axes only. */
export const Bare: Story = {};
