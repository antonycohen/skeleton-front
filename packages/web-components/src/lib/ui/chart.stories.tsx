import type { Meta, StoryObj } from '@storybook/react-vite';
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from './chart';

const SESSIONS = [
  { month: 'May', current: 1_860, previous: 1_420 },
  { month: 'Jun', current: 2_305, previous: 1_510 },
  { month: 'Jul', current: 2_970, previous: 1_480 },
  { month: 'Aug', current: 2_730, previous: 1_390 },
  { month: 'Sep', current: 3_490, previous: 1_610 },
  { month: 'Oct', current: 4_120, previous: 1_700 },
];

const ACTIVATION = [
  { week: 'W36', current: 3.1, previous: 2.4 },
  { week: 'W37', current: 3.6, previous: 2.5 },
  { week: 'W38', current: 3.4, previous: 2.3 },
  { week: 'W39', current: 4.0, previous: 2.6 },
  { week: 'W40', current: 4.2, previous: 2.5 },
  { week: 'W41', current: 4.6, previous: 2.7 },
];

const config = {
  current: { label: 'This year', color: 'var(--color-chart-1)' },
  previous: { label: 'Last year', color: 'var(--color-chart-2)' },
} satisfies ChartConfig;

const meta = {
  title: 'Components/UI/Chart',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** Sessions per month, this year vs. last year. */
export const Bars: Story = {
  render: () => (
    <ChartContainer config={config} className="h-72 w-full max-w-2xl">
      <BarChart accessibilityLayer data={SESSIONS}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis tickLine={false} axisLine={false} width={40} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="current" fill="var(--color-current)" radius={4} />
        <Bar dataKey="previous" fill="var(--color-previous)" radius={4} />
      </BarChart>
    </ChartContainer>
  ),
};

/** Weekly activation rate (%). */
export const Lines: Story = {
  render: () => (
    <ChartContainer config={config} className="h-72 w-full max-w-2xl">
      <LineChart accessibilityLayer data={ACTIVATION} margin={{ left: 12, right: 12 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="week" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis tickLine={false} axisLine={false} width={32} unit="%" />
        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Line dataKey="current" type="monotone" stroke="var(--color-current)" strokeWidth={2} dot={false} />
        <Line dataKey="previous" type="monotone" stroke="var(--color-previous)" strokeWidth={2} dot={false} />
      </LineChart>
    </ChartContainer>
  ),
};
