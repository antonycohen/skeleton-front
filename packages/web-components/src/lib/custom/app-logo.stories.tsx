import type { Meta, StoryObj } from '@storybook/react-vite';
import { AppLogo } from './app-logo';

/** The product's logo: icon and wordmark, served from the app's `public/` folder. */
const meta = {
  title: 'Components/Custom/AppLogo',
  component: AppLogo,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof AppLogo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
