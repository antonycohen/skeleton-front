import type { Meta, StoryObj } from '@storybook/react-vite';
import { withForm } from '@skeleton/storybook-support';
import { ControlledRadioGroupInput } from './controlled-radio-group-input';

const VISIBILITY_OPTIONS = [
  { value: 'private', label: 'Only me' },
  { value: 'team', label: 'My team' },
  { value: 'workspace', label: 'Everyone in the workspace' },
];

const meta = {
  title: 'Patterns/Form/RadioGroupInput',
  component: ControlledRadioGroupInput,
  decorators: [withForm],
  parameters: { layout: 'centered', form: { defaultValues: { visibility: 'team' } } },
  args: { name: 'visibility', label: 'Who can see this', options: VISIBILITY_OPTIONS },
  argTypes: { direction: { control: 'inline-radio', options: ['vertical', 'horizontal'] } },
} satisfies Meta<typeof ControlledRadioGroupInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Horizontal: Story = { args: { direction: 'horizontal' } };

export const Failed: Story = {
  name: 'Error',
  parameters: { form: { defaultValues: {}, errors: { visibility: 'Choose who can see this' } } },
};
