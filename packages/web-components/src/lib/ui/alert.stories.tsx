import type { Meta, StoryObj } from '@storybook/react-vite';
import { CircleAlertIcon, InfoIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './alert';

const VARIANTS = ['default', 'important', 'destructive'] as const;

/** The colour says how much it matters, the icon what kind of message it is. */
const ICONS = {
  default: InfoIcon,
  important: InfoIcon,
  destructive: CircleAlertIcon,
} as const;

const meta = {
  title: 'Components/UI/Alert',
  component: Alert,
  parameters: { layout: 'padded' },
  argTypes: { variant: { control: 'select', options: VARIANTS } },
  render: (args) => (
    <Alert {...args} className="max-w-lg">
      <InfoIcon />
      <AlertTitle>Your domain is not verified yet</AlertTitle>
      <AlertDescription>
        Add the DNS record to acme.com to start sending emails from your own domain.
      </AlertDescription>
    </Alert>
  ),
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Not to be missed, but no risk: a prerequisite, an upsell, something ready to review. */
export const Important: Story = {
  args: { variant: 'important' },
  render: (args) => (
    <Alert {...args} className="max-w-lg">
      <InfoIcon />
      <AlertTitle>Your own account needs 2FA first</AlertTitle>
      <AlertDescription>Turn on two-factor authentication on your account before enforcing it for the workspace.</AlertDescription>
    </Alert>
  ),
};

export const Destructive: Story = {
  args: { variant: 'destructive' },
  render: (args) => (
    <Alert {...args} className="max-w-lg">
      <CircleAlertIcon />
      <AlertTitle>Export failed</AlertTitle>
      <AlertDescription>The report could not be exported. Try again in a few minutes.</AlertDescription>
    </Alert>
  ),
};

export const TitleOnly: Story = {
  render: (args) => (
    <Alert {...args} className="max-w-lg">
      <InfoIcon />
      <AlertTitle>Changes are saved automatically.</AlertTitle>
    </Alert>
  ),
};

/** Every variant, in light and dark. */
export const Matrix: Story = {
  render: (args) => (
    <div className="grid gap-6 md:grid-cols-2">
      {(['light', 'dark'] as const).map((theme) => (
        <div key={theme} className={`${theme} flex flex-col gap-3 rounded-2xl bg-background p-4`}>
          {VARIANTS.map((variant) => {
            const Icon = ICONS[variant];
            return (
              <Alert key={variant} {...args} variant={variant}>
                <Icon />
                <AlertTitle className="capitalize">{variant}</AlertTitle>
                <AlertDescription>Add the DNS record to acme.com to verify your domain.</AlertDescription>
              </Alert>
            );
          })}
        </div>
      ))}
    </div>
  ),
};
