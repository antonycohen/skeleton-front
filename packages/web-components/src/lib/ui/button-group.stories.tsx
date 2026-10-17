import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { ChevronDownIcon, CopyIcon, MinusIcon, PlusIcon, SearchIcon } from 'lucide-react';
import { Button } from './button';
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from './button-group';
import { Input } from './input';

const ORIENTATIONS = ['horizontal', 'vertical'] as const;

const meta = {
  title: 'Components/UI/ButtonGroup',
  component: ButtonGroup,
  parameters: { layout: 'centered' },
  args: { onClick: fn() },
  argTypes: { orientation: { control: 'inline-radio', options: ORIENTATIONS } },
  render: (args) => (
    <ButtonGroup {...args}>
      <Button variant="outline">Desktop</Button>
      <Button variant="outline">Tablet</Button>
      <Button variant="outline">Mobile</Button>
    </ButtonGroup>
  ),
} satisfies Meta<typeof ButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {};

export const Vertical: Story = {
  args: { orientation: 'vertical' },
  render: (args) => (
    <ButtonGroup {...args}>
      <Button variant="outline" size="icon" aria-label="Zoom in"><PlusIcon /></Button>
      <Button variant="outline" size="icon" aria-label="Zoom out"><MinusIcon /></Button>
    </ButtonGroup>
  ),
};

export const WithSeparator: Story = {
  render: (args) => (
    <ButtonGroup {...args}>
      <Button>Publish</Button>
      <ButtonGroupSeparator />
      <Button size="icon" aria-label="More publish options"><ChevronDownIcon /></Button>
    </ButtonGroup>
  ),
};

export const WithInputAndText: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      <ButtonGroup {...args}>
        <ButtonGroupText>https://</ButtonGroupText>
        <Input defaultValue="acme.com/pricing" className="w-56" />
        <Button variant="outline" size="icon" aria-label="Copy"><CopyIcon /></Button>
      </ButtonGroup>
      <ButtonGroup {...args}>
        <Input placeholder="Search accounts…" className="w-56" />
        <Button variant="outline" size="icon" aria-label="Search"><SearchIcon /></Button>
      </ButtonGroup>
    </div>
  ),
};

/** Both orientations. */
export const Matrix: Story = {
  render: (args) => (
    <div className="flex items-start gap-8">
      {ORIENTATIONS.map((orientation) => (
        <ButtonGroup key={orientation} {...args} orientation={orientation}>
          <Button variant="outline">One</Button>
          <Button variant="outline">Two</Button>
          <Button variant="outline">Three</Button>
        </ButtonGroup>
      ))}
    </div>
  ),
};
