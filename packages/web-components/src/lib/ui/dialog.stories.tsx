import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { ArrowLeftIcon, FilePlus2Icon, FileTextIcon, Info, LayoutTemplate, UploadIcon, UsersIcon } from 'lucide-react';
import { useStaticAssetsUrl } from '@skeleton/core-utils';
import { ButtonCard } from '../custom/button-card';
import { CsvUploader } from '../custom/csv-uploader';
import { Alert, AlertDescription, AlertTitle } from './alert';
import { Button } from './button';
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogMedia,
  DialogTitle,
  DialogTrigger,
} from './dialog';
import { Field, FieldLabel } from './field';
import { Input } from './input';
import { Label } from './label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';

const OPEN_DOCS = { docs: { story: { inline: false, iframeHeight: 420 } } };

/**
 * One Dialog for every modal of the app: the same parts (`DialogHeader`, `DialogBody`, `DialogFooter`,
 * `DialogMedia`), the same 16px radius and 24px padding. Only the width changes: `size` sm 440
 * (a confirmation), md 560 (a form, the default), lg 740 (an import, a flow, a paywall). The
 * "Type" stories below are the app's five kinds of modal, with neutral copy.
 */
const meta = {
  title: 'Components/UI/Dialog',
  component: Dialog,
  parameters: { layout: 'centered' },
  args: { onOpenChange: fn() },
  render: (args) => (
    <Dialog {...args}>
      <DialogTrigger asChild>
        <Button variant="outline">Rename project</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename project</DialogTitle>
          <DialogDescription>The name is only visible to your team.</DialogDescription>
        </DialogHeader>
        <DialogBody className="grid gap-2">
          <Label htmlFor="project-name">Name</Label>
          <Input id="project-name" defaultValue="Q4 Roadmap" />
        </DialogBody>
        <DialogFooter className="sm:justify-between">
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Open: Story = { args: { defaultOpen: true }, parameters: OPEN_DOCS };

export const WithoutCloseButton: Story = {
  args: { defaultOpen: true },
  parameters: OPEN_DOCS,
  render: (args) => (
    <Dialog {...args}>
      <DialogContent showCloseButton={false} className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Generating the report</DialogTitle>
          <DialogDescription>We are compiling the activity of your 3 teams. This takes about a minute.</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  ),
};

const MEMBERS = ['Ada Lovelace', 'Grace Hopper', 'Alan Turing', 'Katherine Johnson', 'Margaret Hamilton', 'Linus Torvalds', 'Barbara Liskov', 'Dennis Ritchie', 'Edsger Dijkstra', 'Donald Knuth', 'Radia Perlman', 'Tim Berners-Lee'];

/**
 * The default: the header and the footer stay put, only `DialogBody` scrolls. Scroll the list: the
 * rule under the header appears, the one above the footer goes once at the bottom.
 */
export const Scrollable: Story = {
  args: { defaultOpen: true },
  parameters: { docs: { story: { inline: false, iframeHeight: 560 } } },
  render: (args) => (
    <Dialog {...args}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Choose the members</DialogTitle>
          <DialogDescription>They will get access to the team.</DialogDescription>
        </DialogHeader>
        <DialogBody className="flex flex-col gap-2">
          {MEMBERS.map((member) => (
            <div key={member} className="rounded-xl outline outline-1 outline-offset-[-1px] outline-border-subtle bg-card px-4 py-3 body">
              {member}
            </div>
          ))}
        </DialogBody>
        <DialogFooter className="sm:justify-between">
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button>Continue</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

/** `fixedHeight`: the same height whatever the content, for the steps of one flow. */
export const ScrollableFixedHeight: Story = {
  name: 'Scrollable — Fixed height',
  args: { defaultOpen: true },
  parameters: { docs: { story: { inline: false, iframeHeight: 760 } } },
  render: (args) => (
    <Dialog {...args}>
      <DialogContent fixedHeight>
        <DialogHeader>
          <DialogTitle>Name the project</DialogTitle>
          <DialogDescription>Step 1 of 3</DialogDescription>
        </DialogHeader>
        <DialogBody className="grid gap-2">
          <Label htmlFor="flow-project-name">Name</Label>
          <Input id="flow-project-name" defaultValue="Q4 Roadmap" />
        </DialogBody>
        <DialogFooter className="sm:justify-between">
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button>Next</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

/** A confirmation (Delete team): `sm`, the message in the body, in the text color. */
export const TypeConfirmation: Story = {
  name: 'Type — Confirmation',
  args: { defaultOpen: true },
  parameters: OPEN_DOCS,
  render: (args) => (
    <Dialog {...args}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Delete team</DialogTitle>
        </DialogHeader>
        {/* The message is the dialog's content, not a subtitle. Still a DialogDescription, so a screen
            reader reads it with the title. */}
        <DialogBody>
          <DialogDescription className="text-foreground">
            <span className="font-semibold">Customer Success – EMEA</span>
            {' will be permanently deleted.'}
            <br />
            {'Its members will keep their access to the workspace.'}
          </DialogDescription>
        </DialogBody>
        <DialogFooter className="sm:justify-between">
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button variant="destructive">Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

/** A form (Create a new workspace): `md`, the default. */
export const TypeForm: Story = {
  name: 'Type — Form',
  args: { defaultOpen: true },
  parameters: { docs: { story: { inline: false, iframeHeight: 480 } } },
  render: (args) => (
    <Dialog {...args}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new workspace</DialogTitle>
        </DialogHeader>
        <DialogBody className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Field orientation="vertical">
              <FieldLabel htmlFor="workspace-name">Workspace name *</FieldLabel>
              <Input id="workspace-name" placeholder="Your workspace name" />
            </Field>
            <p className="body text-muted-foreground">This will be displayed across the platform.</p>
          </div>
          <Alert>
            <Info />
            <AlertTitle>You'll be the Owner of this workspace</AlertTitle>
            <AlertDescription>You can invite team members and configure settings after creation.</AlertDescription>
          </Alert>
        </DialogBody>
        <DialogFooter className="sm:justify-between">
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

/** A success (Workspace created): `sm` with `DialogMedia`, a centered `heading-sm` title. */
export const TypeSuccess: Story = {
  name: 'Type — Success',
  args: { defaultOpen: true },
  parameters: { docs: { story: { inline: false, iframeHeight: 560 } } },
  render: function Render(args) {
    const assetsUrl = useStaticAssetsUrl();
    return (
      <Dialog {...args}>
        <DialogContent size="sm">
          <DialogMedia>
            <img src={`${assetsUrl}/workspace-created.svg`} alt="" className="aspect-[2/1] bg-indigo-200 object-cover" />
          </DialogMedia>
          <DialogHeader className="items-center text-center sm:text-center">
            <DialogTitle className="heading-sm">Workspace created!</DialogTitle>
            <DialogDescription>
              Acme is ready to use. You can now configure your settings and invite team members.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button size="lg" className="w-full">
                Done !
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  },
};

/** A flow (Import contacts): `lg` with `fixedHeight`, every step the same size. */
export const TypeFlow: Story = {
  name: 'Type — Flow',
  args: { defaultOpen: true },
  parameters: { docs: { story: { inline: false, iframeHeight: 760 } } },
  render: (args) => (
    <Dialog {...args}>
      <DialogContent size="lg" fixedHeight>
        <DialogHeader>
          <DialogTitle>Import contacts into "Customer Success – EMEA"</DialogTitle>
          <DialogDescription>Import a file or pick existing members to add to the team.</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <Tabs defaultValue="csv" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="csv" className="flex-1">
                <FileTextIcon className="size-4" />
                Import CSV
              </TabsTrigger>
              <TabsTrigger value="members" className="flex-1">
                <UsersIcon className="size-4" />
                From members
              </TabsTrigger>
            </TabsList>
            <TabsContent value="csv" className="mt-4">
              <CsvUploader
                onFileSelect={() => undefined}
                className="h-[280px]"
                helperText="Supported: .csv, .xlsx (max 1,000 rows)"
              />
            </TabsContent>
          </Tabs>
        </DialogBody>
        <DialogFooter className="sm:justify-between">
          <Button variant="ghost">Back</Button>
          <Button variant="outline">Skip for now</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

/** The sub-steps of the "New project" choice dialog. */
const CHOICE_SUB_STEPS = {
  template: { title: 'Start from a template', unit: 'the template you pick' },
  import: { title: 'Import a project', unit: 'the file you import' },
} as const;

/**
 * A choice (New project): `md`, the cards are the actions, so there is no footer. A sub-step's header
 * carries a back button in the close button's style.
 */
export const TypeChoice: Story = {
  name: 'Type — Choice',
  args: { defaultOpen: true },
  parameters: { docs: { story: { inline: false, iframeHeight: 560 } } },
  render: function Render(args) {
    const [step, setStep] = useState<keyof typeof CHOICE_SUB_STEPS | null>(null);
    const sub = step ? CHOICE_SUB_STEPS[step] : null;
    return (
      <Dialog {...args}>
        <DialogContent>
          {sub === null ? (
            <>
              <DialogHeader>
                <DialogTitle>What do you want to create?</DialogTitle>
                <DialogDescription>Pick a starting point. You can change everything later.</DialogDescription>
              </DialogHeader>
              <DialogBody className="flex flex-col gap-2">
                <ButtonCard
                  icon={<LayoutTemplate className="size-5 text-muted-foreground" strokeWidth={1.5} />}
                  title="Start from a template"
                  description="Pick one of the ready-made projects: sections, fields and permissions are already set up."
                  onClick={() => setStep('template')}
                />
                <ButtonCard
                  icon={<UploadIcon className="size-5 text-muted-foreground" strokeWidth={1.5} />}
                  title="Import a project"
                  description="Bring your data from a spreadsheet or another tool. We map the columns for you."
                  onClick={() => setStep('import')}
                />
                <ButtonCard
                  icon={<FilePlus2Icon className="size-5 text-muted-foreground" strokeWidth={1.5} />}
                  title="Start from scratch"
                  description="An empty project you build at your own pace."
                />
              </DialogBody>
            </>
          ) : (
            <>
              <DialogHeader className="flex-row items-start gap-3">
                {/* The close button's style (ghost icon, 36px, 20px icon), centered on the title's
                    line; the arrow lines up with the 24px edge. */}
                <Button variant="ghost" size="icon" className="-my-[7px] -ml-2 shrink-0" aria-label="Back" onClick={() => setStep(null)}>
                  <ArrowLeftIcon className="size-5" />
                </Button>
                <div className="flex flex-col gap-2">
                  <DialogTitle>{sub.title}</DialogTitle>
                  <DialogDescription>
                    Choose your starting point.
                    <br />
                    We&apos;ll then set up the project from {sub.unit}.
                  </DialogDescription>
                </div>
              </DialogHeader>
              <DialogBody className="flex flex-col gap-2">
                <ButtonCard
                  icon={<UsersIcon className="size-5 text-muted-foreground" strokeWidth={1.5} />}
                  title="For my team"
                  description="Shared with the members of your current team."
                />
                <ButtonCard
                  icon={<FileTextIcon className="size-5 text-muted-foreground" strokeWidth={1.5} />}
                  title="Just for me"
                  description="Private until you decide to share it."
                />
              </DialogBody>
            </>
          )}
        </DialogContent>
      </Dialog>
    );
  },
};
