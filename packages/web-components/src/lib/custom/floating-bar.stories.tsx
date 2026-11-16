import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../ui/button';
import { FloatingBar } from './floating-bar';

/** The dark pill that floats over a canvas or a panel. Always dark, whatever the theme. */
const meta = {
  title: 'Components/Custom/FloatingBar',
  component: FloatingBar,
  parameters: { layout: 'centered' },
  render: (args) => (
    <FloatingBar {...args}>
      <span className="body px-2">3 items selected</span>
      <Button size="sm">Continue</Button>
    </FloatingBar>
  ),
} satisfies Meta<typeof FloatingBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
