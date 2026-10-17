import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { ChartLineIcon, FileTextIcon, UsersIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';

const meta = {
  title: 'Components/UI/Tabs',
  component: Tabs,
  parameters: { layout: 'centered' },
  args: { defaultValue: 'projects', onValueChange: fn() },
  render: (args) => (
    <Tabs {...args} className="w-96">
      <TabsList>
        <TabsTrigger value="projects"><FileTextIcon /> Projects</TabsTrigger>
        <TabsTrigger value="members"><UsersIcon /> Members</TabsTrigger>
        <TabsTrigger value="analytics"><ChartLineIcon /> Analytics</TabsTrigger>
        <TabsTrigger value="settings" disabled>Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="projects" className="rounded-md border p-4 text-sm">5 active projects.</TabsContent>
      <TabsContent value="members" className="rounded-md border p-4 text-sm">Camille, Hugo and Léa.</TabsContent>
      <TabsContent value="analytics" className="rounded-md border p-4 text-sm">12,480 sessions, +38% week over week.</TabsContent>
    </Tabs>
  ),
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SecondTab: Story = { args: { defaultValue: 'members' } };

export const Vertical: Story = {
  args: { orientation: 'vertical' },
  render: (args) => (
    <Tabs {...args} className="w-[28rem] flex-row">
      <TabsList className="h-auto flex-col">
        <TabsTrigger value="projects" className="w-full justify-start">Projects</TabsTrigger>
        <TabsTrigger value="members" className="w-full justify-start">Members</TabsTrigger>
      </TabsList>
      <TabsContent value="projects" className="rounded-md border p-4 text-sm">5 active projects.</TabsContent>
      <TabsContent value="members" className="rounded-md border p-4 text-sm">Camille, Hugo and Léa.</TabsContent>
    </Tabs>
  ),
};
