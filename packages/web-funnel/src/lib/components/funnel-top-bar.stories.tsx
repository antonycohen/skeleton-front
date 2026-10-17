import type { Meta, StoryObj } from '@storybook/react-vite';
import { FunnelTopBar } from './funnel-top-bar';
import { DemoFunnel } from './funnel-layout.stories';

const BASE_URL = '/workspaces/new';
const atStep = (step: string) => ({ router: { url: `${BASE_URL}/${step}`, path: `${BASE_URL}/*` } });
const ready = { usage: 'team', seats: 12 } as const;

/**
 * The funnel's navbar: the step's left component, the stepper in the center (a second row on
 * mobile), the step's actions on the right. Same demo funnel as `FunnelLayout`.
 */
const meta = {
  title: 'Patterns/Funnel/FunnelTopBar',
  component: FunnelTopBar,
  parameters: atStep('usage'),
  render: (args, { parameters }) => (
    <DemoFunnel initialState={(parameters as { funnelState?: typeof ready }).funnelState ?? { usage: null, seats: 0 }}>
      <FunnelTopBar {...args} className="border-b" />
    </DemoFunnel>
  ),
} satisfies Meta<typeof FunnelTopBar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** First step: the later steps are not reachable yet. */
export const Default: Story = {};

/** Every step reachable, the second one active. */
export const SecondStep: Story = { parameters: { ...atStep('team'), funnelState: ready } };

export const WithoutStepper: Story = { parameters: { ...atStep('setting-up'), funnelState: ready } };

/** On mobile the stepper moves to a compact second row. */
export const Mobile: Story = {
  parameters: { ...atStep('team'), funnelState: ready },
  globals: { viewport: { value: 'mobile1' } },
};
