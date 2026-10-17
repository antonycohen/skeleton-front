import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Button } from '../ui/button';
import { RichTextEditor } from './rich-text-editor';

const meta = {
  title: 'Components/Custom/RichTextEditor',
  component: RichTextEditor,
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div className="max-w-xl"><Story /></div>],
  args: { onChange: fn() },
} satisfies Meta<typeof RichTextEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const WithContent: Story = {
  args: {
    value:
      '<p><b>Acme</b> ships to 40 countries.</p><p>This quarter, the platform team focuses on <i>sub-second API monitoring</i> to keep checkout up during peak season.</p>',
  },
};

export const PlainTextValue: Story = { args: { value: 'Kick-off with Globex: insurance, 12,000 employees.' } };

export const WithActions: Story = {
  args: {
    placeholder: 'Add a comment…',
    actions: <Button size="sm" onClick={fn()}>Apply</Button>,
  },
};

export const Invalid: Story = { args: { 'aria-invalid': true } };

export const Disabled: Story = { args: { value: '<p>Read-only instructions.</p>', disabled: true } };
