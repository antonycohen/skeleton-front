import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { fn } from 'storybook/test';
import { EditorToolbar, type EditorToolbarTool, type EditorToolbarViewMode } from './editor-toolbar';

const meta = {
  title: 'Components/Custom/EditorToolbar',
  component: EditorToolbar,
  parameters: { layout: 'centered' },
  args: {
    tool: 'select',
    originalContent: false,
    viewMode: 'single',
    onToolChange: fn(),
    onOriginalContentChange: fn(),
    onViewModeChange: fn(),
  },
  argTypes: {
    tool: { control: 'select', options: ['select', 'text'] },
    viewMode: { control: 'select', options: ['single', 'canvas'] },
  },
} satisfies Meta<typeof EditorToolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Fully wired: hold ⌘/Ctrl + Shift to peek at the original content. */
export const Interactive: Story = {
  render: function Render(args) {
    const [tool, setTool] = useState<EditorToolbarTool>('select');
    const [original, setOriginal] = useState(false);
    const [viewMode, setViewMode] = useState<EditorToolbarViewMode>('single');
    return (
      <EditorToolbar
        {...args}
        tool={tool}
        onToolChange={setTool}
        originalContent={original}
        onOriginalContentChange={setOriginal}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
    );
  },
};

export const TextTool: Story = { args: { tool: 'text' } };

export const ViewingOriginal: Story = { args: { originalContent: true } };

export const AllBreakpoints: Story = { args: { viewMode: 'canvas' } };

/** On the original page: no "view original content" segment. */
export const OriginalPage: Story = { args: { originalContent: undefined } };

export const ViewModeOnly: Story = { args: { tool: undefined, originalContent: undefined } };
