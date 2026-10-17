import { useState, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { LoaderCircleIcon } from 'lucide-react';
import { Label, RadioGroup, RadioGroupItem, SidebarProvider, Slider } from '@skeleton/web-components';
import { FunnelProvider, useFunnel } from '../store/funnel-provider';
import type { FunnelStep } from '../types';
import { FunnelLayout } from './funnel-layout';
import { FunnelRoutes } from './funnel-route';

type DemoState = { usage: 'personal' | 'team' | null; seats: number };

const BASE_URL = '/workspaces/new';

function StepFrame({ title, description, children }: { title: string; description: string; children?: ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-12">
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  );
}

function UsageStep() {
  const { state, setState } = useFunnel<DemoState>();
  return (
    <StepFrame title="How will you use this workspace?" description="This decides which features are set up first.">
      <RadioGroup value={state.usage ?? ''} onValueChange={(usage) => setState?.({ ...state, usage: usage as DemoState['usage'] })}>
        <div className="flex items-center gap-2">
          <RadioGroupItem id="personal" value="personal" />
          <Label htmlFor="personal">Just me</Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem id="team" value="team" />
          <Label htmlFor="team">With my team</Label>
        </div>
      </RadioGroup>
    </StepFrame>
  );
}

function TeamStep() {
  const { state, setState } = useFunnel<DemoState>();
  return (
    <StepFrame title="How big is your team?" description="Pick how many seats the workspace starts with.">
      <Slider value={[state.seats]} max={50} step={1} onValueChange={([seats]) => setState?.({ ...state, seats })} />
      <span className="text-sm text-muted-foreground">{state.seats} seats</span>
    </StepFrame>
  );
}

function ReviewStep() {
  const { state } = useFunnel<DemoState>();
  return <StepFrame title="Review" description={`Acme workspace, ${state.seats} seats, ready to create.`} />;
}

function SettingUpStep() {
  return (
    <StepFrame title="Setting up your workspace" description="This takes a few seconds.">
      <LoaderCircleIcon className="size-6 animate-spin text-muted-foreground" />
    </StepFrame>
  );
}

const workspaceName = <span className="truncate px-2 text-sm font-medium">Acme workspace</span>;

export const demoSteps: FunnelStep<DemoState>[] = [
  {
    id: 'usage',
    label: 'Usage',
    path: 'usage',
    component: UsageStep,
    availabilityFn: () => true,
    optionComponent: workspaceName,
    actions: [{ id: 'next', label: 'Continue', onClick: (ctx) => ctx.navigateToNextStep() }],
  },
  {
    id: 'team',
    label: 'Team',
    path: 'team',
    component: TeamStep,
    availabilityFn: ({ state }) => state.usage !== null,
    optionComponent: workspaceName,
    actions: [
      { id: 'back', label: 'Back', variant: 'outline', onClick: (ctx) => ctx.navigateToPreviousStep() },
      { id: 'next', label: 'Continue', onClick: (ctx) => ctx.navigateToNextStep() },
    ],
  },
  {
    id: 'review',
    label: 'Review',
    path: 'review',
    component: ReviewStep,
    availabilityFn: ({ state }) => state.usage !== null && state.seats > 0,
    optionComponent: workspaceName,
    actions: [
      { id: 'back', label: 'Back', variant: 'outline', onClick: (ctx) => ctx.navigateToPreviousStep() },
      { id: 'next', label: 'Create workspace', onClick: (ctx) => ctx.navigateToNextStep() },
    ],
  },
  {
    // A step outside the stepper, which hides it too.
    id: 'setting-up',
    label: 'Setting up',
    path: 'setting-up',
    component: SettingUpStep,
    availabilityFn: ({ state }) => state.seats > 0,
    showInStepper: false,
    showStepper: false,
    optionComponent: workspaceName,
  },
];

export function DemoFunnel({ initialState, children }: { initialState: DemoState; children: ReactNode }) {
  const [state, setState] = useState(initialState);
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="w-full">
        <FunnelProvider steps={demoSteps} state={state} setState={setState} baseUrl={BASE_URL}>
          {children}
        </FunnelProvider>
      </div>
    </SidebarProvider>
  );
}

const atStep = (step: string) => ({ router: { url: `${BASE_URL}/${step}`, path: `${BASE_URL}/*` } });

type DemoParameters = { funnelState?: DemoState };

/**
 * A three-step demo funnel: `FunnelProvider` + `FunnelLayout` (top bar with the stepper and the
 * step's actions) + `FunnelRoutes` (one route per step, unavailable steps redirect to the first
 * available one). Steps navigate through the stepper and the action buttons.
 */
const meta = {
  title: 'Patterns/Funnel/FunnelLayout',
  component: FunnelLayout,
  // Shared with the top bar's stories.
  excludeStories: ['demoSteps', 'DemoFunnel'],
  parameters: atStep('usage'),
  render: (args, { parameters }) => (
    <DemoFunnel initialState={(parameters as DemoParameters).funnelState ?? { usage: null, seats: 0 }}>
      <FunnelLayout {...args}>
        <FunnelRoutes />
      </FunnelLayout>
    </DemoFunnel>
  ),
} satisfies Meta<typeof FunnelLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SecondStep: Story = {
  parameters: { ...atStep('team'), funnelState: { usage: 'team', seats: 12 } },
};

export const LastStep: Story = {
  parameters: { ...atStep('review'), funnelState: { usage: 'team', seats: 12 } },
};

/** A step that hides the stepper (not part of it either). */
export const WithoutStepper: Story = {
  parameters: { ...atStep('setting-up'), funnelState: { usage: 'team', seats: 12 } },
};

/** Opening a step that is not available yet lands on the first available one. */
export const UnavailableStep: Story = { parameters: atStep('review') };

/** A custom left slot instead of the step's own. */
export const WithLeftComponent: Story = {
  args: { leftComponent: <span className="px-2 text-sm text-muted-foreground">Draft · saved 2 min ago</span> },
};
