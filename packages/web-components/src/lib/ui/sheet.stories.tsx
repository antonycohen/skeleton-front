import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './sheet';

const OPEN_DOCS = { docs: { story: { inline: false, iframeHeight: 480 } } };

type Side = 'right' | 'left' | 'top' | 'bottom';

const meta = {
  title: 'Components/UI/Sheet',
  component: Sheet,
  parameters: { layout: 'centered' },
  args: { onOpenChange: fn() },
  render: (args, { parameters }) => (
    <Sheet {...args}>
      <SheetTrigger asChild>
        <Button variant="outline">Edit account</Button>
      </SheetTrigger>
      <SheetContent side={(parameters['side'] as Side | undefined) ?? 'right'}>
        <SheetHeader>
          <SheetTitle>Acme Corporation</SheetTitle>
          <SheetDescription>The company's details, shared with everyone in the workspace.</SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 px-4">
          <div className="grid gap-2">
            <Label htmlFor="account-domain">Domain</Label>
            <Input id="account-domain" defaultValue="acme.com" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="account-industry">Industry</Label>
            <Input id="account-industry" defaultValue="Manufacturing" />
          </div>
        </div>
        <SheetFooter>
          <Button>Save changes</Button>
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
} satisfies Meta<typeof Sheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Open: Story = { args: { defaultOpen: true }, parameters: OPEN_DOCS };

export const OpenLeft: Story = { args: { defaultOpen: true }, parameters: { ...OPEN_DOCS, side: 'left' } };

export const OpenBottom: Story = { args: { defaultOpen: true }, parameters: { ...OPEN_DOCS, side: 'bottom' } };
