import type { Meta, StoryObj } from '@storybook/react-vite';
import { withForm } from '@skeleton/storybook-support';
import { ControlledTextareaInput } from './controlled-textarea-input';

const meta = {
  title: 'Patterns/Form/TextareaInput',
  component: ControlledTextareaInput,
  decorators: [withForm],
  parameters: {
    layout: 'centered',
    form: {
      defaultValues: {
        description: 'Owns billing and payments across the customer app and the back office.',
      },
    },
  },
  args: { name: 'description', label: 'Team description', placeholder: 'What does this team work on?' },
  argTypes: { direction: { control: 'inline-radio', options: ['vertical', 'horizontal'] } },
} satisfies Meta<typeof ControlledTextareaInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** A character counter under the field. */
export const WithLimit: Story = { args: { limit: 280, description: 'Shown on the team page.' } };

export const Horizontal: Story = { args: { direction: 'horizontal' } };

export const Failed: Story = {
  name: 'Error',
  parameters: { form: { defaultValues: { description: '' }, errors: { description: 'A description is required' } } },
};
