import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { fn } from 'storybook/test';
import { NavbarTitleInput } from './navbar-title-input';

const meta = {
  title: 'Components/Custom/NavbarTitleInput',
  component: NavbarTitleInput,
  parameters: { layout: 'centered' },
  args: { value: 'Q4 Roadmap — Platform teams', onCommit: fn(), 'aria-label': 'Project name' },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    return (
      <NavbarTitleInput
        {...args}
        value={value}
        onCommit={args.onCommit && ((next) => { setValue(next); args.onCommit?.(next); })}
      />
    );
  },
} satisfies Meta<typeof NavbarTitleInput>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Hover then click to rename: Enter commits, Escape reverts. */
export const Default: Story = {};

export const ReadOnly: Story = { args: { readOnly: true } };

export const Wide: Story = { args: { className: 'w-80' } };

export const Placeholder: Story = { args: { value: '', placeholder: 'Untitled project' } };
