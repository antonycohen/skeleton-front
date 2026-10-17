import type { Meta, StoryObj } from '@storybook/react-vite';
import { StepButton } from './step-button';

const meta = {
  title: 'Components/Custom/StepButton',
  component: StepButton,
  parameters: { layout: 'centered' },
  args: { label: 'Workspace', number: 1, to: '/onboarding/workspace' },
  argTypes: { state: { control: 'select', options: ['filled', 'active', 'disabled'] } },
  decorators: [(Story) => <div className="@container w-[800px]"><div className="flex"><Story /></div></div>],
} satisfies Meta<typeof StepButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Filled: Story = {};

export const Active: Story = { args: { state: 'active', label: 'Team', number: 2 } };

export const Disabled: Story = { args: { state: 'disabled', label: 'Plan', number: 3 } };

/** The funnel's step bar (labels stack under the circle below the @3xl container width). */
export const Stepper: Story = {
  render: () => (
    <div className="flex w-full items-center gap-4">
      <StepButton label="Workspace" number={1} state="filled" to="#workspace" />
      <StepButton label="Profile" number={2} state="filled" to="#profile" />
      <StepButton label="Team" number={3} state="active" to="#team" />
      <StepButton label="Plan" number={4} state="disabled" />
      <StepButton label="Done" number={5} state="disabled" />
    </div>
  ),
};

export const NarrowStepper: Story = {
  ...Stepper,
  decorators: [(Story) => <div className="@container w-[360px]"><div className="flex"><Story /></div></div>],
};
