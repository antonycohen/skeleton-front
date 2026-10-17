import type { Meta, StoryObj } from '@storybook/react-vite';
import { withForm } from '@skeleton/storybook-support';
import { ControlledSelectInput } from './controlled-select-input';

const INDUSTRIES = [
  { value: 'software', label: 'Software' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'financial-services', label: 'Financial services' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'retail', label: 'Retail' },
];

const meta = {
  title: 'Patterns/Form/SelectInput',
  component: ControlledSelectInput,
  decorators: [withForm],
  parameters: { layout: 'centered', form: { defaultValues: { industry: 'manufacturing' } } },
  args: { name: 'industry', label: 'Industry', options: INDUSTRIES, placeholder: 'Select an industry' },
  argTypes: { direction: { control: 'inline-radio', options: ['vertical', 'horizontal'] } },
} satisfies Meta<typeof ControlledSelectInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: { description: 'Used to tailor your onboarding.' },
  parameters: { form: { defaultValues: {} } },
};

export const Horizontal: Story = { args: { direction: 'horizontal' } };

export const Disabled: Story = { args: { disabled: true } };

export const Failed: Story = {
  name: 'Error',
  parameters: { form: { defaultValues: {}, errors: { industry: 'Pick an industry' } } },
};
