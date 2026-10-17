import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { ArrowUpIcon, CopyIcon, GlobeIcon, LoaderIcon, SearchIcon } from 'lucide-react';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from './input-group';

const ALIGNS = ['inline-start', 'inline-end', 'block-start', 'block-end'] as const;

const meta = {
  title: 'Components/UI/InputGroup',
  component: InputGroup,
  parameters: { layout: 'centered' },
  render: (args) => (
    <InputGroup {...args} className="w-80">
      <InputGroupInput placeholder="Search accounts…" />
      <InputGroupAddon><SearchIcon /></InputGroupAddon>
      <InputGroupAddon align="inline-end">12 results</InputGroupAddon>
    </InputGroup>
  ),
} satisfies Meta<typeof InputGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithText: Story = {
  render: (args) => (
    <InputGroup {...args} className="w-80">
      <InputGroupAddon><InputGroupText>https://</InputGroupText></InputGroupAddon>
      <InputGroupInput defaultValue="acme.com/pricing" />
      <InputGroupAddon align="inline-end"><GlobeIcon /></InputGroupAddon>
    </InputGroup>
  ),
};

export const WithButton: Story = {
  render: (args) => (
    <InputGroup {...args} className="w-80">
      <InputGroupInput readOnly defaultValue="snp_acme_7f3a9c" />
      <InputGroupAddon align="inline-end">
        <InputGroupButton size="icon-xs" aria-label="Copy" onClick={fn()}><CopyIcon /></InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  ),
};

export const Loading: Story = {
  render: (args) => (
    <InputGroup {...args} data-disabled className="w-80">
      <InputGroupInput disabled defaultValue="https://globex.com" />
      <InputGroupAddon align="inline-end"><LoaderIcon className="animate-spin" /></InputGroupAddon>
    </InputGroup>
  ),
};

export const Invalid: Story = {
  render: (args) => (
    <InputGroup {...args} className="w-80">
      <InputGroupAddon><GlobeIcon /></InputGroupAddon>
      <InputGroupInput aria-invalid defaultValue="acme pricing" />
    </InputGroup>
  ),
};

/** A prompt box: textarea with a toolbar below. */
export const Textarea: Story = {
  render: (args) => (
    <InputGroup {...args} className="w-96">
      <InputGroupTextarea placeholder="Summarize this week's activity for the Acme team…" />
      <InputGroupAddon align="block-end">
        <InputGroupText className="text-xs">Assistant</InputGroupText>
        <InputGroupButton variant="default" size="icon-xs" className="ml-auto rounded-full" aria-label="Send" onClick={fn()}>
          <ArrowUpIcon />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  ),
};

/** Every addon alignment. */
export const Matrix: Story = {
  render: (args) => (
    <div className="flex w-80 flex-col gap-4">
      {ALIGNS.map((align) => (
        <InputGroup key={align} {...args}>
          <InputGroupInput placeholder="acme.com" />
          <InputGroupAddon align={align}><InputGroupText>{align}</InputGroupText></InputGroupAddon>
        </InputGroup>
      ))}
    </div>
  ),
};
