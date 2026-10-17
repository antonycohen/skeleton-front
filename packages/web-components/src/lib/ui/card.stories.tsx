import type { Meta, StoryObj } from '@storybook/react-vite';
import { EllipsisIcon } from 'lucide-react';
import { Badge } from './badge';
import { Button } from './button';
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';

const meta = {
  title: 'Components/UI/Card',
  component: Card,
  parameters: { layout: 'centered' },
  argTypes: { variant: { control: 'inline-radio', options: ['default', 'subtle'] } },
  render: (args) => (
    <Card {...args} className="w-96">
      <CardHeader>
        <CardTitle>Q4 Roadmap</CardTitle>
        <CardDescription>3 teams · 12 members</CardDescription>
        <CardAction>
          <Button variant="ghost" size="icon" aria-label="Project actions"><EllipsisIcon /></Button>
        </CardAction>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <div className="text-muted-foreground">Tasks</div>
          <div className="text-lg font-semibold">248</div>
        </div>
        <div>
          <div className="text-muted-foreground">Done</div>
          <div className="text-lg font-semibold">62%</div>
        </div>
        <div>
          <div className="text-muted-foreground">Velocity</div>
          <div className="text-lg font-semibold">+18%</div>
        </div>
      </CardContent>
      <CardFooter className="justify-between border-t">
        <Badge variant="success">Active</Badge>
        <Button size="sm" variant="outline">Open</Button>
      </CardFooter>
    </Card>
  ),
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const HeaderOnly: Story = {
  render: (args) => (
    <Card {...args} className="w-96">
      <CardHeader>
        <CardTitle>No projects yet</CardTitle>
        <CardDescription>Create your first project to start organizing your team's work.</CardDescription>
      </CardHeader>
    </Card>
  ),
};

/** `subtle`: the subtle surface and outline, for a card nested in a page section. */
export const Subtle: Story = { args: { variant: 'subtle' } };
