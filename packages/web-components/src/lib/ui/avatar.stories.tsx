import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';

const PHOTO =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#6366f1"/><circle cx="32" cy="26" r="12" fill="#e0e7ff"/><rect x="12" y="42" width="40" height="22" rx="11" fill="#e0e7ff"/></svg>',
  );

const meta = {
  title: 'Components/UI/Avatar',
  component: Avatar,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src={PHOTO} alt="Jane Cooper" />
      <AvatarFallback>JC</AvatarFallback>
    </Avatar>
  ),
};

/** No image, or an image that fails to load: the initials show. */
export const Fallback: Story = {
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src="https://invalid.storybook.local/broken.png" alt="Jane Cooper" />
      <AvatarFallback>JC</AvatarFallback>
    </Avatar>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-3">
      {['size-6 text-xs', 'size-8 text-sm', 'size-10', 'size-14 text-lg'].map((size) => (
        <Avatar key={size} {...args} className={size}>
          <AvatarFallback>AC</AvatarFallback>
        </Avatar>
      ))}
    </div>
  ),
};

export const Group: Story = {
  render: (args) => (
    <div className="flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background">
      {['JC', 'MR', 'TW', 'LS'].map((initials) => (
        <Avatar key={initials} {...args}>
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      ))}
    </div>
  ),
};
