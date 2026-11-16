import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { fn } from 'storybook/test';
import { SearchInput } from './search-input';

const meta = {
  title: 'Components/Custom/SearchInput',
  component: SearchInput,
  parameters: { layout: 'padded' },
  args: { label: 'Search pages', value: '', onValueChange: fn() },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    return (
      <SearchInput
        {...args}
        value={value}
        onValueChange={(next) => {
          setValue(next);
          args.onValueChange(next);
        }}
      />
    );
  },
} satisfies Meta<typeof SearchInput>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 256px from `sm`, full width below. Type to filter. */
export const Default: Story = {};

export const WithValue: Story = { args: { value: 'pricing' } };
