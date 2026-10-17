import type { Meta, StoryObj } from '@storybook/react-vite';
import { EmptyChartContent } from './empty-chart-content';

const meta = {
  title: 'Components/Custom/EmptyChartContent',
  component: EmptyChartContent,
  parameters: { layout: 'centered' },
  args: { title: 'No data yet', description: 'Invite your team to start collecting activity.' },
} satisfies Meta<typeof EmptyChartContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
