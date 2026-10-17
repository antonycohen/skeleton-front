import type { Meta, StoryObj } from '@storybook/react-vite';
import { withForm } from '@skeleton/storybook-support';
import { ControlledRTEInput } from './controlled-rte-input';

const meta = {
  title: 'Patterns/Form/RTEInput',
  component: ControlledRTEInput,
  decorators: [withForm],
  parameters: {
    layout: 'centered',
    form: {
      defaultValues: {
        welcomeMessage:
          '<p><strong>Welcome to Acme!</strong> Here is how to get started.</p><ul><li>Complete your profile</li><li>Invite your teammates</li></ul>',
      },
    },
  },
  args: { name: 'welcomeMessage', label: 'Welcome message', placeholder: 'Say hello to new members' },
  argTypes: { direction: { control: 'inline-radio', options: ['vertical', 'horizontal'] } },
} satisfies Meta<typeof ControlledRTEInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: { description: 'Shown to new members when they join the workspace.' },
  parameters: { form: { defaultValues: { welcomeMessage: '' } } },
};

export const Disabled: Story = { args: { disabled: true } };

export const Failed: Story = {
  name: 'Error',
  parameters: { form: { defaultValues: { welcomeMessage: '' }, errors: { welcomeMessage: 'A welcome message is required' } } },
};
