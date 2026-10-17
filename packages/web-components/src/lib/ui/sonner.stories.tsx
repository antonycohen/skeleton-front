import type { Meta, StoryObj } from '@storybook/react-vite';
import { toast } from 'sonner';
import { Button } from './button';
import { Toaster } from './sonner';

/** The global decorator already mounts a plain toaster: this story's toasts target its own. */
const TOASTER_ID = 'story';

const fakeRequest = () => new Promise((resolve) => setTimeout(resolve, 2000));

function ToastButtons() {
  const options = { toasterId: TOASTER_ID };
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={() => toast('Project duplicated', { ...options, description: 'Q4 Roadmap (copy)' })}>
        Default
      </Button>
      <Button variant="outline" onClick={() => toast.success('Changes saved', options)}>Success</Button>
      <Button variant="outline" onClick={() => toast.info('Domain verified: acme.com', options)}>Info</Button>
      <Button variant="outline" onClick={() => toast.warning('3 of 1,000 API calls left', options)}>Warning</Button>
      <Button variant="outline" onClick={() => toast.error('Export failed, try again', options)}>Error</Button>
      <Button variant="outline" onClick={() => toast.loading('Generating the report…', options)}>Loading</Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.promise(fakeRequest(), {
            ...options,
            loading: 'Sending the invitation…',
            success: 'Invitation sent',
            error: 'Invitation failed',
          })
        }
      >
        Promise
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast('Project deleted', { ...options, action: { label: 'Undo', onClick: () => toast.success('Restored', options) } })
        }
      >
        With action
      </Button>
    </div>
  );
}

const meta = {
  title: 'Components/UI/Sonner',
  component: Toaster,
  parameters: { layout: 'centered', docs: { story: { inline: false, iframeHeight: 360 } } },
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

/** One button per toast type. */
export const Default: Story = {};

export const RichColors: Story = { args: { richColors: true } };

export const TopCenter: Story = { args: { position: 'top-center' } };
