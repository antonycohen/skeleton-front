import type { Meta, StoryObj } from '@storybook/react-vite';
import { BadgeStatus, type BadgeStatusVariant } from './badge-status';

const VARIANTS: BadgeStatusVariant[] = ['green', 'yellow', 'red', 'blue', 'primary', 'neutral', 'pricing'];

const meta = {
  title: 'Components/Custom/BadgeStatus',
  component: BadgeStatus,
  parameters: { layout: 'centered' },
  args: { variant: 'green', children: 'Active' },
  argTypes: { variant: { control: 'select', options: VARIANTS } },
} satisfies Meta<typeof BadgeStatus>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Green: Story = {};

export const Yellow: Story = { args: { variant: 'yellow', children: 'Trial ends in 3 days' } };

export const Red: Story = { args: { variant: 'red', children: 'Payment failed' } };

export const Blue: Story = { args: { variant: 'blue', children: 'Scheduled' } };

/** The brand tone, for something new or highlighted. */
export const Primary: Story = { args: { variant: 'primary', children: 'New' } };

export const Neutral: Story = { args: { variant: 'neutral', children: 'Archived' } };

/** No dot: a plain tag (a keyword, a count). */
export const WithoutDot: Story = { args: { variant: 'neutral', dot: false, children: '+6 tags' } };

/** No border, background or padding: the dot and the text, for statuses in dense rows. */
export const Plain: Story = { args: { variant: 'primary', appearance: 'plain', children: 'New' } };

/** No dot, teal: a pricing tag. */
export const Pricing: Story = { args: { variant: 'pricing', children: 'Save 20%' } };

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      {(['badge', 'plain'] as const).map((appearance) => (
        <div key={appearance} className="flex flex-wrap gap-2">
          {VARIANTS.map((variant) => (
            <BadgeStatus key={variant} variant={variant} appearance={appearance}>{variant}</BadgeStatus>
          ))}
        </div>
      ))}
    </div>
  ),
};
