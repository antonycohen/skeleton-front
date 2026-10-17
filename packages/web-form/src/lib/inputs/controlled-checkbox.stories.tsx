import type { Meta, StoryObj } from '@storybook/react-vite';
import { withForm } from '@skeleton/storybook-support';
import { ControlledCheckbox } from './controlled-checkbox';

const meta = {
  title: 'Patterns/Form/Checkbox',
  component: ControlledCheckbox,
  decorators: [withForm],
  parameters: { layout: 'centered', form: { defaultValues: { notifyOnMention: false } } },
  args: { name: 'notifyOnMention', label: 'Email me when a teammate mentions me' },
  argTypes: { direction: { control: 'inline-radio', options: ['vertical', 'horizontal'] } },
} satisfies Meta<typeof ControlledCheckbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Checked: Story = { parameters: { form: { defaultValues: { notifyOnMention: true } } } };

export const WithDescription: Story = { args: { description: 'At most one email per hour.' } };

export const Failed: Story = {
  name: 'Error',
  parameters: { form: { defaultValues: {}, errors: { notifyOnMention: 'Accept to continue' } } },
};
