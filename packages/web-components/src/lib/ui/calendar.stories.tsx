import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { DateRange } from 'react-day-picker';
import { Calendar } from './calendar';

/** A fixed "today", so the stories never drift. */
const TODAY = new Date(2026, 9, 7);
const day = (offset: number) => new Date(2026, 9, 7 + offset);

const meta = {
  title: 'Components/UI/Calendar',
  component: Calendar,
  parameters: { layout: 'centered' },
  args: { today: TODAY, defaultMonth: TODAY, className: 'rounded-md border shadow-sm' },
  argTypes: {
    captionLayout: { control: 'select', options: ['label', 'dropdown', 'dropdown-months', 'dropdown-years'] },
    buttonVariant: { control: 'select', options: ['ghost', 'outline', 'default'] },
  },
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

function SingleCalendar(args: Story['args']) {
  const [selected, setSelected] = useState<Date | undefined>(day(3));
  return <Calendar {...args} mode="single" selected={selected} onSelect={setSelected} />;
}

export const Single: Story = { render: (args) => <SingleCalendar {...args} /> };

function RangeCalendar(args: Story['args']) {
  const [range, setRange] = useState<DateRange | undefined>({ from: day(-3), to: day(4) });
  return <Calendar {...args} mode="range" numberOfMonths={2} selected={range} onSelect={setRange} />;
}

/** A reporting period. */
export const Range: Story = { render: (args) => <RangeCalendar {...args} /> };

export const DropdownCaption: Story = {
  args: { captionLayout: 'dropdown', startMonth: new Date(2024, 0), endMonth: new Date(2028, 11) },
};

export const DisabledPastDays: Story = { args: { mode: 'single', disabled: { before: TODAY } } };
