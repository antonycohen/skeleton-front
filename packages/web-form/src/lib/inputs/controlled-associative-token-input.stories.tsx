import type { Meta, StoryObj } from '@storybook/react-vite';
import { withForm } from '@skeleton/storybook-support';
import { ControlledAssociativeTokenInput } from './controlled-associative-token-input';

const meta = {
  title: 'Patterns/Form/AssociativeTokenInput',
  component: ControlledAssociativeTokenInput,
  decorators: [withForm],
  parameters: {
    layout: 'centered',
    form: { defaultValues: { metadata: { environment: 'production', region: 'eu-west-1' } } },
  },
  args: {
    name: 'metadata',
    label: 'Metadata',
    keyLabel: 'Key',
    valueLabel: 'Value',
    keyPlaceholder: 'cost_center',
    valuePlaceholder: 'engineering',
  },
  argTypes: { direction: { control: 'inline-radio', options: ['vertical', 'horizontal'] } },
} satisfies Meta<typeof ControlledAssociativeTokenInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = { parameters: { form: { defaultValues: { metadata: null } } } };

export const Horizontal: Story = { args: { direction: 'horizontal' } };
