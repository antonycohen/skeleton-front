import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { TooltipBanner } from './tooltip-banner';

/** A character on a transparent background, sitting on the banner's bottom edge. */
const CHARACTER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 216 144"><rect x="68" y="20" width="80" height="64" rx="20" fill="#e0e7ff"/><circle cx="92" cy="52" r="8" fill="#312e81"/><circle cx="124" cy="52" r="8" fill="#312e81"/><rect x="100" y="66" width="16" height="4" rx="2" fill="#312e81"/><rect x="108" y="6" width="4" height="14" fill="#e0e7ff"/><circle cx="110" cy="6" r="5" fill="#f9a8d4"/><rect x="56" y="92" width="104" height="52" rx="24" fill="#c7d2fe"/></svg>',
  );

const meta = {
  title: 'Components/Custom/TooltipBanner',
  component: TooltipBanner,
  parameters: { layout: 'centered' },
  args: {
    children: 'Your workspace is ready! Camille, Hugo and Léa can now join the Acme team.',
    characterSrc: CHARACTER,
    onDismiss: fn(),
  },
} satisfies Meta<typeof TooltipBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutCharacter: Story = { args: { characterSrc: undefined, className: 'pr-16' } };

export const NotDismissible: Story = { args: { onDismiss: undefined } };
