import type { Meta, StoryObj } from '@storybook/react-vite';
import { ShareIcon } from 'lucide-react';
import { Button, SidebarProvider, Tabs, TabsList, TabsTrigger } from '@skeleton/web-components';
import { Navbar } from './navbar';

const meta = {
  title: 'Layout/Navbar',
  component: Navbar,
  // The sidebar toggle needs a sidebar context.
  decorators: [
    (Story) => (
      <SidebarProvider defaultOpen={false} className="min-h-0">
        <div className="w-full border-b">
          <Story />
        </div>
      </SidebarProvider>
    ),
  ],
  args: {
    left: <span className="truncate text-sm font-medium">Onboarding checklist</span>,
    right: (
      <>
        <Button variant="outline" size="sm">
          <ShareIcon /> Share
        </Button>
        <Button size="sm">Publish</Button>
      </>
    ),
  },
} satisfies Meta<typeof Navbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** The centered slot, where funnels put their stepper (desktop only). */
export const WithCenter: Story = {
  args: {
    center: <span className="text-sm text-muted-foreground">Step 2 of 4 · Team</span>,
  },
};

/** In-flow content next to the left group, like editor tabs. */
export const WithChildren: Story = {
  args: {
    leftClassName: 'w-64',
    children: (
      <Tabs defaultValue="edit">
        <TabsList>
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
      </Tabs>
    ),
  },
};

export const WithoutToggle: Story = { args: { showToggle: false } };

/** On mobile, a second full-width row under the bar. */
export const MobileSecondRow: Story = {
  args: { mobileSecondRow: <span className="text-sm text-muted-foreground">Step 2 of 4 · Team</span> },
  globals: { viewport: { value: 'mobile1' } },
};
