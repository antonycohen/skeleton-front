import type { Meta, StoryObj } from '@storybook/react-vite';
import { CircleAlertIcon, CircleCheckIcon, InfoIcon, TriangleAlertIcon } from 'lucide-react';
import { Button } from './button';
import { Alert, AlertAction, AlertDescription, AlertTitle } from './alert';

const VARIANTS = ['default', 'important', 'success', 'warning', 'destructive'] as const;

/** The colour says how much it matters, the icon what kind of message it is. */
const ICONS = {
  default: InfoIcon,
  important: InfoIcon,
  success: CircleCheckIcon,
  warning: TriangleAlertIcon,
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

/** Not to be missed, but no risk: a prerequisite, an upsell, something ready to review. A risk is a `warning`. */
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

export const Success: Story = {
  args: { variant: 'success' },
  render: (args) => (
    <Alert {...args} className="max-w-lg">
      <CircleCheckIcon />
      <AlertTitle>Import complete</AlertTitle>
      <AlertDescription>248 contacts were added to the Enterprise accounts list.</AlertDescription>
    </Alert>
  ),
};

/** Consequences to read before confirming: removing SSO, codes shown once, irreversible changes. */
export const Warning: Story = {
  args: { variant: 'warning' },
  render: (args) => (
    <Alert {...args} className="max-w-lg">
      <TriangleAlertIcon />
      <AlertTitle>Recovery codes are shown only once</AlertTitle>
      <AlertDescription>Copy or download them now. You won't be able to see them again after closing.</AlertDescription>
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

/** `AlertAction` sits on the right, centred on the text: a small outline button, or a link before it. */
export const WithAction: Story = {
  args: { variant: 'destructive' },
  render: (args) => (
    <div className="flex max-w-2xl flex-col gap-3">
      <Alert {...args}>
        <CircleAlertIcon />
        <AlertTitle>This workspace is scheduled for deletion</AlertTitle>
        <AlertDescription>Deletion will occur on November 4, 2026. All actions are limited to read-only.</AlertDescription>
        <AlertAction>
          <Button variant="outline" size="sm">Cancel deletion</Button>
        </AlertAction>
      </Alert>
      <Alert variant="important">
        <InfoIcon />
        <AlertTitle>12 members have not accepted their invitation</AlertTitle>
        <AlertAction>
          <Button variant="link" size="sm" className="px-0 text-current">Learn more</Button>
          <Button variant="outline" size="sm">Manage</Button>
        </AlertAction>
      </Alert>
    </div>
  ),
};

/** Titles wrap instead of being cut. */
export const LongTitle: Story = {
  args: { variant: 'destructive' },
  render: (args) => (
    <Alert {...args} className="max-w-lg">
      <CircleAlertIcon />
      <AlertTitle>
        Your subscription is past due. Change your payment method and pay your overdue invoice, or cancel your
        subscription.
      </AlertTitle>
      <AlertAction>
        <Button variant="outline" size="sm">Update</Button>
      </AlertAction>
    </Alert>
  ),
};

/** Every variant, with and without an action, in light and dark. */
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
                {variant !== 'default' && variant !== 'success' && (
                  <AlertAction>
                    <Button variant="outline" size="sm">Action</Button>
                  </AlertAction>
                )}
              </Alert>
            );
          })}
        </div>
      ))}
    </div>
  ),
};
