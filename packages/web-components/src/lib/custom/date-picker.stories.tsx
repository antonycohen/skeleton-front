import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { fn } from 'storybook/test';
import { STORYBOOK_NOW } from '@skeleton/storybook-support';
import { DatePicker } from './date-picker';

const meta = {
  title: 'Components/Custom/DatePicker',
  component: DatePicker,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Uncontrolled: keeps its own date. */
export const Default: Story = {};

export const WithValue: Story = {
  render: function Render(args) {
    const [date, setDate] = useState<Date | undefined>(STORYBOOK_NOW);
    return <DatePicker {...args} value={date} onChange={(next) => { setDate(next); args.onChange?.(next); }} />;
  },
  args: { onChange: fn() },
};

export const CustomPlaceholder: Story = { args: { placeholder: 'Project end date' } };

export const Invalid: Story = { args: { 'aria-invalid': true } };

export const Disabled: Story = { args: { disabled: true } };
