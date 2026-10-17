import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from './badge';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from './table';

const ROWS = [
  { account: 'Acme Corporation', domain: 'acme.com', status: 'Active', visits: 5_210 },
  { account: 'Globex', domain: 'globex.com', status: 'Active', visits: 4_380 },
  { account: 'Initech', domain: 'initech.com', status: 'Trial', visits: 0 },
  { account: 'Umbrella Group', domain: 'umbrella.io', status: 'Paused', visits: 2_890 },
] as const;

const STATUS_VARIANT = { Active: 'success', Trial: 'secondary', Paused: 'warning' } as const;

const meta = {
  title: 'Components/UI/Table',
  component: Table,
  parameters: { layout: 'padded' },
  render: (args) => (
    <Table {...args}>
      <TableCaption>Workspaces of the Enterprise plan.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Workspace</TableHead>
          <TableHead>Domain</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Sessions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {ROWS.map((row) => (
          <TableRow key={row.account} data-state={row.account === 'Globex' ? 'selected' : undefined}>
            <TableCell className="font-medium">{row.account}</TableCell>
            <TableCell className="text-muted-foreground">{row.domain}</TableCell>
            <TableCell><Badge variant={STATUS_VARIANT[row.status]}>{row.status}</Badge></TableCell>
            <TableCell className="text-right">{row.visits.toLocaleString('en-US')}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Total</TableCell>
          <TableCell className="text-right">
            {ROWS.reduce((sum, row) => sum + row.visits, 0).toLocaleString('en-US')}
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Header, body (one row selected), footer and caption. */
export const Default: Story = {};

export const Empty: Story = {
  render: (args) => (
    <Table {...args}>
      <TableHeader>
        <TableRow>
          <TableHead>Workspace</TableHead>
          <TableHead>Domain</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">No workspaces yet.</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};
