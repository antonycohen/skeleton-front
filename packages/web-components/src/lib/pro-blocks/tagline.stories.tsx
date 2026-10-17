import type { Meta, StoryObj } from '@storybook/react-vite';
import { SparklesIcon } from 'lucide-react';
import { Tagline } from './tagline';

const VARIANTS = ['default', 'ghost', 'white'] as const;

const meta = {
  title: 'Components/Pro blocks/Tagline',
  component: Tagline,
  parameters: { layout: 'centered' },
  args: { children: <><SparklesIcon /> AI-powered workspace</> },
  argTypes: { variant: { control: 'select', options: VARIANTS }, asChild: { table: { disable: true } } },
} satisfies Meta<typeof Tagline>;

export default meta;
type Story = StoryObj<typeof meta>;

/** `ghost` is the default variant. */
export const Ghost: Story = {};

export const Default: Story = { args: { variant: 'default' } };

export const White: Story = {
  args: { variant: 'white' },
  decorators: [(Story) => <div className="rounded-lg bg-primary p-4"><Story /></div>],
};

export const AllVariants: Story = {
  render: (args) => (
    <div className="flex items-center gap-4 rounded-lg bg-gradient-to-r from-background to-primary p-4">
      {VARIANTS.map((variant) => (
        <Tagline key={variant} {...args} variant={variant} />
      ))}
    </div>
  ),
};
