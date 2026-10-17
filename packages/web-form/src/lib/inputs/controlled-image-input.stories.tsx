import type { Meta, StoryObj } from '@storybook/react-vite';
import { withForm } from '@skeleton/storybook-support';
import { ControlledImageInput } from './controlled-image-input';

/** An inline logo, so the preview needs no network. */
const ACME_LOGO =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="80"><rect width="240" height="80" rx="12" fill="#4f46e5"/><text x="120" y="52" font-family="sans-serif" font-size="32" font-weight="700" fill="#fff" text-anchor="middle">ACME</text></svg>',
  );

const meta = {
  title: 'Patterns/Form/ImageInput',
  component: ControlledImageInput,
  decorators: [withForm],
  parameters: { layout: 'centered', form: { defaultValues: { logo: null } } },
  args: { name: 'logo', label: 'Workspace logo', accept: 'image/png,image/svg+xml' },
  argTypes: { direction: { control: 'inline-radio', options: ['vertical', 'horizontal'] } },
} satisfies Meta<typeof ControlledImageInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Filled: Story = {
  parameters: { form: { defaultValues: { logo: { id: null, base64: null, url: ACME_LOGO, originalFilename: 'acme-logo.svg' } } } },
};

export const WithDescription: Story = { args: { description: 'SVG or PNG, at least 240px wide.' } };

export const Horizontal: Story = { args: { direction: 'horizontal' } };

export const Disabled: Story = { args: { disabled: true } };
