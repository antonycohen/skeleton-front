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
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog';
import { Field, FieldLabel } from './field';
import { Input } from './input';
import { Label } from './label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';

const OPEN_DOCS = { docs: { story: { inline: false, iframeHeight: 420 } } };

/**
 * One Dialog for every modal of the app: `DialogHeader`, `DialogFooter` and the content in between.
 * The width is set with `className` on `DialogContent` (`sm:max-w-lg` by default). The "Type" stories
 * below are the app's kinds of modal.
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
        <div className="grid gap-2">
          <Label htmlFor="project-name">Name</Label>
          <Input id="project-name" defaultValue="Q4 Roadmap" />
        </div>
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

/** A confirmation (Delete team): narrow, the message in the text color. */
export const TypeConfirmation: Story = {
  name: 'Type — Confirmation',
  args: { defaultOpen: true },
  parameters: OPEN_DOCS,
  render: (args) => (
    <Dialog {...args}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Delete team</DialogTitle>
        </DialogHeader>
        {/* The message is the dialog's content, not a subtitle. Still a DialogDescription, so a screen
            reader reads it with the title. */}
        <DialogDescription className="text-foreground">
          <span className="font-semibold">Customer Success – EMEA</span>
          {' will be permanently deleted.'}
          <br />
          {'Its members will keep their access to the workspace.'}
        </DialogDescription>
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

/** A form (Create a new workspace): the default width. */
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
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Field orientation="vertical">
              <FieldLabel htmlFor="workspace-name">Workspace name *</FieldLabel>
              <Input id="workspace-name" placeholder="Your workspace name" />
            </Field>
            <p className="text-sm text-muted-foreground">This will be displayed across the platform.</p>
          </div>
          <Alert>
            <Info />
            <AlertTitle>You'll be the Owner of this workspace</AlertTitle>
            <AlertDescription>You can invite team members and configure settings after creation.</AlertDescription>
          </Alert>
        </div>
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

/** A success (Workspace created): narrow, an illustration on top, a centered title. */
export const TypeSuccess: Story = {
  name: 'Type — Success',
  args: { defaultOpen: true },
  parameters: { docs: { story: { inline: false, iframeHeight: 560 } } },
  render: function Render(args) {
    const assetsUrl = useStaticAssetsUrl();
    return (
      <Dialog {...args}>
        <DialogContent className="overflow-clip p-0 sm:max-w-md">
          <div className="px-2 pt-2">
            <div className="relative aspect-[2/1] w-full overflow-clip rounded-md bg-indigo-200">
              <img src={`${assetsUrl}/workspace-created.svg`} alt="" className="absolute inset-0 size-full object-cover" />
            </div>
          </div>
          <DialogHeader className="items-center px-8 text-center sm:text-center">
            <DialogTitle className="text-xl">Workspace created!</DialogTitle>
            <DialogDescription>
              Acme is ready to use. You can now configure your settings and invite team members.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="px-8 pb-8">
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

/** A flow (Import contacts): wide, tabs to pick the source. */
export const TypeFlow: Story = {
  name: 'Type — Flow',
  args: { defaultOpen: true },
  parameters: { docs: { story: { inline: false, iframeHeight: 760 } } },
  render: (args) => (
    <Dialog {...args}>
      <DialogContent className="sm:max-w-[740px]">
        <DialogHeader>
          <DialogTitle>Import contacts into "Customer Success – EMEA"</DialogTitle>
          <DialogDescription>Import a file or pick existing members to add to the team.</DialogDescription>
        </DialogHeader>
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
 * A choice (New project): the cards are the actions, so there is no footer. A sub-step's header carries
 * a back button in the close button's style.
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
              <div className="flex flex-col gap-2">
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
              </div>
            </>
          ) : (
            <>
              <DialogHeader className="flex-row items-start gap-3">
                {/* The close button's style (ghost icon), centered on the title's line. */}
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
              <div className="flex flex-col gap-2">
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
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    );
  },
};
