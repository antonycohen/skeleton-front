import type { Meta, StoryObj } from '@storybook/react-vite';
import { TextContent } from './text-content';

/** An assistant text block: markdown rendered with Streamdown, instruction tags stripped. */
const meta = {
  title: 'Patterns/AI/TextContent',
  component: TextContent,
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div className="max-w-2xl"><Story /></div>],
  args: {
    text:
      '## Your workspace this month\n\n' +
      'Three people joined **Acme**, and two invitations are still pending.\n\n' +
      '| Member | Team | Joined |\n|---|---|---|\n| Léa Bernard | Product | Oct 2 |\n| Hugo Dubois | Design | Oct 5 |\n| Tom Lefèvre | Engineering | Oct 6 |\n\n' +
      'Next steps:\n\n1. Resend the pending invitations\n2. Add the new members to their teams\n\n' +
      'Run `export members` to download the list as CSV.',
  },
} satisfies Meta<typeof TextContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Instruction tags never show: the composer handles them. */
export const WithInstruction: Story = {
  args: {
    text:
      'Which team should I add them to?\n' +
      '<assistant-instruction name="suggestions">\nProduct\nDesign\nEngineering\n</assistant-instruction>',
  },
};

/** While the text streams, incomplete markdown still renders (here an unclosed bold). */
export const Streaming: Story = {
  args: { text: 'Three people joined **Acme this', isStreaming: true },
};
