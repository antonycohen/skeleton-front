import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Label } from './label';
import { RadioGroup, RadioGroupItem } from './radio-group';

const OPTIONS = [
  { value: 'monthly', label: 'Monthly — billed every month' },
  { value: 'yearly', label: 'Yearly — two months free' },
  { value: 'custom', label: 'Custom — talk to sales' },
];

const meta = {
  title: 'Components/UI/RadioGroup',
  component: RadioGroup,
  parameters: { layout: 'centered' },
  args: { defaultValue: 'monthly', onValueChange: fn() },
  argTypes: { disabled: { control: 'boolean' } },
  render: (args) => (
    <RadioGroup {...args} className="w-72">
      {OPTIONS.map((option) => (
        <div key={option.value} className="flex items-center gap-3">
          <RadioGroupItem value={option.value} id={`type-${option.value}`} />
          <Label htmlFor={`type-${option.value}`}>{option.label}</Label>
        </div>
      ))}
    </RadioGroup>
  ),
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NoSelection: Story = { args: { defaultValue: undefined } };

export const Disabled: Story = { args: { disabled: true } };

export const Invalid: Story = {
  args: { defaultValue: undefined, 'aria-invalid': true },
  render: (args) => (
    <RadioGroup {...args} className="w-72">
      {OPTIONS.map((option) => (
        <div key={option.value} className="flex items-center gap-3">
          <RadioGroupItem value={option.value} id={`invalid-${option.value}`} aria-invalid />
          <Label htmlFor={`invalid-${option.value}`}>{option.label}</Label>
        </div>
      ))}
    </RadioGroup>
  ),
};
