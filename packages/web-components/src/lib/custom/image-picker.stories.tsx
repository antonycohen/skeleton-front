import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { fn } from 'storybook/test';
import type { Image } from '@skeleton/core-api-models';
import { ImagePicker } from './image-picker';

const logo: Image = {
  id: '1a000000-0000-4000-8000-000000000001',
  base64: null,
  url: '/logo-icon.svg',
  originalFilename: 'acme-logo.png',
  resizedImages: null,
};

const meta = {
  title: 'Components/Custom/ImagePicker',
  component: ImagePicker,
  parameters: { layout: 'centered' },
  decorators: [(Story) => <div className="w-80"><Story /></div>],
  args: { onChange: fn() },
  render: function Render(args) {
    const [value, setValue] = useState(args.value ?? null);
    return <ImagePicker {...args} value={value} onChange={(next) => { setValue(next); args.onChange?.(next); }} />;
  },
} satisfies Meta<typeof ImagePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Choose a file: it is previewed from its base64. */
export const Empty: Story = {};

export const WithImage: Story = { args: { value: logo } };

export const Invalid: Story = { args: { 'aria-invalid': true } };

export const Disabled: Story = { args: { value: logo, disabled: true } };
