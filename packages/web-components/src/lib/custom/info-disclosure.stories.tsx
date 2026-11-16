import type { Meta, StoryObj } from '@storybook/react-vite';
import { CircleHelp } from 'lucide-react';
import { InfoDisclosure } from './info-disclosure';

const meta = {
  title: 'Components/Custom/InfoDisclosure',
  component: InfoDisclosure,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="max-w-lg">
        <Story />
      </div>
    ),
  ],
  args: {
    icon: <CircleHelp />,
    title: 'What changes in my workspace?',
    children: (
      <ul className="flex list-disc flex-col gap-1 pl-4">
        <li>Only the settings you edit: nothing else is touched.</li>
        <li>Your data stays available while the change is prepared.</li>
      </ul>
    ),
  },
} satisfies Meta<typeof InfoDisclosure>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Closed: a click anywhere on the card opens it. */
export const Default: Story = {};

/** Open: its header row closes it. */
export const Open: Story = { args: { defaultOpen: true } };
