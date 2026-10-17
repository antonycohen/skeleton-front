import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card, CardDescription, CardHeader, CardTitle } from '@skeleton/web-components';
import { LayoutContent } from './layout-content';
import { LayoutHeader } from './layout-header';

const STATS = [
  { title: 'Active members', value: '24' },
  { title: 'AI messages this month', value: '1,284' },
  { title: 'Open invitations', value: '3' },
];

/** The page container: page padding, 48px between sections. */
const meta = {
  title: 'Layout/LayoutContent',
  component: LayoutContent,
  args: {
    children: (
      <>
        <LayoutHeader pageTitle="Dashboard" pageDescription="How your workspace is doing this month." />
        <div className="grid gap-4 md:grid-cols-3">
          {STATS.map((stat) => (
            <Card key={stat.title}>
              <CardHeader>
                <CardDescription>{stat.title}</CardDescription>
                <CardTitle className="text-2xl">{stat.value}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>
      </>
    ),
  },
} satisfies Meta<typeof LayoutContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
