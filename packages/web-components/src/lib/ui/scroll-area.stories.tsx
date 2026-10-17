import type { Meta, StoryObj } from '@storybook/react-vite';
import { ScrollArea, ScrollBar } from './scroll-area';
import { Separator } from './separator';

const ACCOUNTS = Array.from(
  { length: 30 },
  (_, i) => `${['Acme', 'Globex', 'Initech', 'Umbrella', 'Hooli', 'Stark'][i % 6]} ${['Corporation', 'Inc.', 'Group', 'Labs', 'Systems'][i % 5]} #${i + 1}`,
);

const meta = {
  title: 'Components/UI/ScrollArea',
  component: ScrollArea,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof ScrollArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Vertical: Story = {
  render: (args) => (
    <ScrollArea {...args} className="h-72 w-56 rounded-md border">
      <div className="p-4">
        <h4 className="mb-4 text-sm font-medium">Accounts</h4>
        {ACCOUNTS.map((account) => (
          <div key={account}>
            <div className="text-sm">{account}</div>
            <Separator className="my-2" />
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
};

export const Horizontal: Story = {
  render: (args) => (
    <ScrollArea {...args} className="w-96 rounded-md border whitespace-nowrap">
      <div className="flex w-max gap-4 p-4">
        {ACCOUNTS.slice(0, 10).map((account) => (
          <div key={account} className="flex h-32 w-40 items-end rounded-md bg-muted p-3 text-sm">{account}</div>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  ),
};
