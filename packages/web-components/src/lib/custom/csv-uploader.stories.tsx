import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { CsvUploader } from './csv-uploader';

const meta = {
  title: 'Components/Custom/CsvUploader',
  component: CsvUploader,
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div className="max-w-2xl"><Story /></div>],
  args: { onFileSelect: fn() },
} satisfies Meta<typeof CsvUploader>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Drop a file or pick one: invalid types and files over 10 MB show an error. */
export const Default: Story = {};

export const Analyzing: Story = { args: { isAnalyzing: true } };

export const Disabled: Story = { args: { disabled: true } };

export const CsvOnly: Story = { args: { accept: '.csv', helperText: 'Supported: .csv (max 500 rows)' } };
