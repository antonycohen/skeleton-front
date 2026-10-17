import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import Color from 'color';
import { fn } from 'storybook/test';
import {
  ColorPicker,
  ColorPickerAlpha,
  ColorPickerEyeDropper,
  ColorPickerFormat,
  ColorPickerHue,
  ColorPickerOutput,
  ColorPickerSelection,
} from './color-picker';

const meta = {
  title: 'Components/Custom/ColorPicker',
  component: ColorPicker,
  parameters: { layout: 'centered' },
  args: { defaultValue: '#6366F1', onChange: fn(), className: 'w-72 rounded-lg border bg-background p-4 shadow-sm' },
} satisfies Meta<typeof ColorPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every part: selection area, hue and alpha sliders, eye dropper, format switch and value. */
export const Default: Story = {
  render: (args) => (
    <ColorPicker {...args}>
      <ColorPickerSelection className="h-40 rounded-md" />
      <div className="flex items-center gap-4">
        <ColorPickerEyeDropper />
        <div className="grid w-full gap-1">
          <ColorPickerHue />
          <ColorPickerAlpha />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <ColorPickerOutput />
        <ColorPickerFormat />
      </div>
    </ColorPicker>
  ),
};

/** A compact color input: no alpha, hex readout. */
export const HexColor: Story = {
  render: function Render(args) {
    const [hex, setHex] = useState('#6366F1');
    return (
      <div className="flex flex-col gap-3">
        <ColorPicker
          {...args}
          className={args.className + ' gap-3'}
          onChange={(rgba) => setHex(Color.rgb(rgba).hex())}
        >
          <ColorPickerSelection className="h-32 rounded-md" />
          <ColorPickerHue />
          <div className="flex items-center gap-2">
            <ColorPickerEyeDropper />
            <ColorPickerFormat className="flex-1" />
          </div>
        </ColorPicker>
        <div className="flex items-center gap-2 text-sm">
          <span className="size-5 rounded border" style={{ backgroundColor: hex }} />
          <code>{hex.toUpperCase()}</code>
        </div>
      </div>
    );
  },
};
