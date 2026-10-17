import type { Meta, StoryObj } from '@storybook/react-vite';
import { withForm } from '@skeleton/storybook-support';
import { useState } from 'react';
import { ControlledTokenInput, type TokenOption } from './controlled-token-input';

const DEPARTMENTS: TokenOption[] = [
  { value: 'engineering', label: 'Engineering' },
  { value: 'design', label: 'Design' },
  { value: 'product', label: 'Product' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'customer-success', label: 'Customer success' },
];

const meta = {
  title: 'Patterns/Form/TokenInput',
  component: ControlledTokenInput,
  decorators: [withForm],
  parameters: { layout: 'centered', form: { defaultValues: { tags: ['onboarding', 'billing'] } } },
  args: { name: 'tags', label: 'Tags', placeholder: 'Type and press Enter' },
  argTypes: { direction: { control: 'inline-radio', options: ['vertical', 'horizontal'] } },
} satisfies Meta<typeof ControlledTokenInput>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Free text: any value can be added. */
export const Default: Story = {};

export const Empty: Story = { parameters: { form: { defaultValues: { tags: [] } } } };

/** Values picked from a fixed list. */
export const StaticOptions: Story = {
  args: {
    name: 'departments',
    label: 'Departments',
    placeholder: 'Add a department',
    source: { type: 'static', options: DEPARTMENTS },
    forceSelection: true,
  },
  parameters: { form: { defaultValues: { departments: ['engineering', 'customer-success'] } } },
};

/** Options come from a search (here filtered locally, as a query hook would). */
export const QueryOptions: Story = {
  args: { name: 'departments', label: 'Departments', placeholder: 'Search a department', forceSelection: true },
  parameters: { form: { defaultValues: { departments: ['product'] } } },
  render: function Render(args) {
    const [term, setTerm] = useState('');
    const options = DEPARTMENTS.filter((d) => d.label.toLowerCase().includes(term.toLowerCase()));
    return <ControlledTokenInput {...args} source={{ type: 'query', options, onSearch: setTerm }} />;
  },
};

export const Failed: Story = {
  name: 'Error',
  parameters: { form: { defaultValues: { tags: [] }, errors: { tags: 'Add at least one tag' } } },
};
