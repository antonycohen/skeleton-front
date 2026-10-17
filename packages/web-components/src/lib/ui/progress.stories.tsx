import type { Meta, StoryObj } from '@storybook/react-vite';
import { Progress } from './progress';

const meta = {
  title: 'Components/UI/Progress',
  component: Progress,
  parameters: { layout: 'centered' },
  args: { value: 60, className: 'w-72' },
  argTypes: { value: { control: { type: 'range', min: 0, max: 100 } } },
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = { args: { value: 0 } };

export const Complete: Story = { args: { value: 100 } };

/** As used for a quota: 820 of 1,000 API calls. */
export const Quota: Story = {
  render: (args) => (
    <div className="flex w-72 flex-col gap-2 text-sm">
      <div className="flex justify-between">
        <span>API calls</span>
        <span className="text-muted-foreground">820 / 1,000</span>
      </div>
      <Progress {...args} value={82} className="w-full" />
    </div>
  ),
};
