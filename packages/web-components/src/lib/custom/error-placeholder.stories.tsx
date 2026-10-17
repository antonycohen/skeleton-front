import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { FileQuestionIcon, ServerCrashIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { ErrorPlaceholder } from './error-placeholder';

const ASSETS: string = import.meta.env.VITE_STATIC_ASSETS_URL;

const meta = {
  title: 'Components/Custom/ErrorPlaceholder',
  component: ErrorPlaceholder,
  decorators: [(Story) => <div className="h-[600px]"><Story /></div>],
  args: {
    image: <img src={`${ASSETS}/error-illustration.svg`} alt="" className="h-40" />,
    title: 'This project does not exist',
    description: 'It may have been deleted, or you no longer have access to the workspace it belongs to.',
    actions: <Button onClick={fn()}>Back to projects</Button>,
  },
} satisfies Meta<typeof ErrorPlaceholder>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NotFound: Story = {
  args: {
    image: <FileQuestionIcon className="size-16 text-muted-foreground" />,
    title: 'Page not found',
    description: 'The address may be mistyped or the page has moved.',
  },
};

export const ServerError: Story = {
  args: {
    image: <ServerCrashIcon className="size-16 text-muted-foreground" />,
    title: 'Something went wrong',
    description: 'We could not load this page. Try again in a moment.',
    actions: (
      <>
        <Button variant="outline" onClick={fn()}>Contact support</Button>
        <Button onClick={fn()}>Retry</Button>
      </>
    ),
  },
};
