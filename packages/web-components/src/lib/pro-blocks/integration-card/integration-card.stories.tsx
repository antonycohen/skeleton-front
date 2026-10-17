import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type ComponentType } from 'react';
import { fn } from 'storybook/test';
import { CalendarIcon, GitBranchIcon, HardDriveIcon, MessageSquareIcon, ZapIcon } from 'lucide-react';
import { IntegrationCard } from './integration-card';

/** A neutral logo: the integration's colour, a generic icon. */
function Logo({ icon: Icon, className }: { icon: ComponentType<{ className?: string }>; className: string }) {
  return (
    <span className={`flex size-10 items-center justify-center rounded-lg text-white ${className}`}>
      <Icon className="size-5" />
    </span>
  );
}

const meta = {
  title: 'Components/Pro blocks/IntegrationCard',
  component: IntegrationCard,
  parameters: { layout: 'centered' },
  args: {
    title: 'Slack',
    description: 'Get notified in your channels when a member joins or a payment fails.',
    icon: <Logo icon={MessageSquareIcon} className="bg-purple-600" />,
    externalUrl: 'https://slack.com',
    onEnabledChange: fn(),
    onSettingsClick: fn(),
    onRequestClick: fn(),
  },
  argTypes: { status: { control: 'select', options: ['not-connected', 'connected', 'expiring', 'expired'] } },
} satisfies Meta<typeof IntegrationCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NotConnected: Story = {};

export const Connected: Story = { args: { status: 'connected', enabled: true } };

export const Expiring: Story = { args: { status: 'expiring', enabled: true } };

export const Expired: Story = { args: { status: 'expired', enabled: false } };

export const ComingSoon: Story = {
  args: {
    title: 'Calendar',
    description: 'Sync your project deadlines with your team calendar.',
    icon: <Logo icon={CalendarIcon} className="bg-sky-600" />,
    active: false,
    externalUrl: undefined,
  },
};

/** The integrations page grid, with working switches. */
export const Grid: Story = {
  parameters: { layout: 'padded' },
  render: function Render(args) {
    const [enabled, setEnabled] = useState<Record<string, boolean>>({ slack: true, github: true });
    const toggle = (key: string) => (value: boolean) => setEnabled((prev) => ({ ...prev, [key]: value }));
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <IntegrationCard {...args} status="connected" enabled={enabled['slack']} onEnabledChange={toggle('slack')} />
        <IntegrationCard
          {...args}
          title="Cloud storage"
          description="Attach files from your cloud drive to any project."
          icon={<Logo icon={HardDriveIcon} className="bg-emerald-600" />}
          status="expired"
          enabled={enabled['storage']}
          onEnabledChange={toggle('storage')}
        />
        <IntegrationCard
          {...args}
          title="GitHub"
          description="Link pull requests to the tasks they close."
          icon={<Logo icon={GitBranchIcon} className="bg-neutral-800" />}
          status="expiring"
          enabled={enabled['github']}
          onEnabledChange={toggle('github')}
        />
        <IntegrationCard
          {...args}
          title="Zapier"
          description="Connect the app to thousands of tools without code."
          icon={<Logo icon={ZapIcon} className="bg-orange-500" />}
          active={false}
        />
        <IntegrationCard
          {...args}
          title="Calendar"
          description="Sync your project deadlines with your team calendar."
          icon={<Logo icon={CalendarIcon} className="bg-sky-600" />}
          active={false}
        />
      </div>
    );
  },
};
