import type { Meta, StoryObj } from '@storybook/react-vite';
import { toast } from 'sonner';
import { Button } from './button';
import { Toaster } from './sonner';

/** The global decorator already mounts a toaster: this story's toasts target its own, which takes the args. */
const TOASTER_ID = 'story';

const fakeRequest = () => new Promise((resolve) => setTimeout(resolve, 2500));

/**
 * The app's cases first (success and error with a message, nearly always; a description, an action,
 * a promise), then the other types.
 */
function ToastButtons() {
  const options = { toasterId: TOASTER_ID };
  return (
    <div className="flex max-w-xl flex-wrap justify-center gap-2">
      <Button variant="outline" onClick={() => toast.success('Variant published', options)}>
        Success
      </Button>
      <Button variant="outline" onClick={() => toast.error('Could not save changes to Hero. Please try again.', options)}>
        Error
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.error('The run was rejected', {
            ...options,
            description: 'Most likely too many demos are running (2 at once max). Retry in a few minutes.',
          })
        }
      >
        With description
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.success('Account selection saved — it applies from the next sync', {
            ...options,
            action: { label: 'Sync now', onClick: () => undefined },
          })
        }
      >
        With action
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.promise(fakeRequest(), {
            ...options,
            loading: 'Generating file...',
            success: 'File generated and downloaded',
            error: 'Failed to generate file',
          })
        }
      >
        Promise
      </Button>
      <Button variant="outline" onClick={() => toast.warning('3 of 1,000 API calls left', options)}>
        Warning
      </Button>
      <Button variant="outline" onClick={() => toast.info('Domain verified: acme.com', options)}>
        Info
      </Button>
      <Button variant="outline" onClick={() => toast('Project duplicated', options)}>
        Plain
      </Button>
    </div>
  );
}

/**
 * Always dark, in both modes: it stands out from the white pages in light mode and sits a step
 * above the background in dark mode. The status shows on the icon and, when a success, error or
 * warning toast opens, in a reflection passing once along its border.
 */
const meta = {
  title: 'Components/UI/Sonner',
  component: Toaster,
  parameters: { layout: 'centered', docs: { story: { inline: false, iframeHeight: 480 } } },
  args: { id: TOASTER_ID },
  render: (args) => (
    <>
      <ToastButtons />
      <Toaster {...args} />
    </>
  ),
} satisfies Meta<typeof Toaster>;

export default meta;
type Story = StoryObj<typeof meta>;

/** One button per case. */
export const Default: Story = {};

export const TopCenter: Story = { args: { position: 'top-center' } };
