import type { Meta, StoryObj } from '@storybook/react-vite';
import { DotStatus, type DotStatusVariant } from './dot-status';

const VARIANTS: DotStatusVariant[] = ['primary', 'green', 'red', 'pending', 'yellow', 'blue', 'neutral'];

const meta = {
  title: 'Components/Custom/DotStatus',
  component: DotStatus,
  parameters: { layout: 'centered' },
  args: { variant: 'green', label: 'Published' },
  argTypes: { variant: { control: 'select', options: VARIANTS } },
} satisfies Meta<typeof DotStatus>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Green: Story = {};

/** Not started yet (a draft): a hollow ring. */
export const Pending: Story = { args: { variant: 'pending', label: 'Draft' } };

/** The four tones of a typical publication status, next to their text. */
export const WithText: Story = {
  render: () => (
    <div className="flex flex-col gap-3 body">
      {([
        ['primary', 'Ready'],
        ['green', 'Published'],
        ['red', 'Unpublished'],
        ['pending', 'Draft'],
      ] as const).map(([variant, label]) => (
        <div key={variant} className="flex items-center gap-2">
          <DotStatus variant={variant} />
          {label}
        </div>
      ))}
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-3">
      {VARIANTS.map((variant) => (
        <DotStatus key={variant} variant={variant} label={variant} />
      ))}
    </div>
  ),
};
