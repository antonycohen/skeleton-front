/**
 * Raw instruction block found in assistant text, before payload parsing.
 */
export interface RawInstructionBlock {
  name: string;
  attrString: string;
  content: string;
}

const OPEN_TAG = /<assistant-instruction\s+name="([^"]+)"([^>]*?)>/g;
const CLOSE_TAG = '</assistant-instruction>';
const THINKING_TAG = /<\/?thinking>/g;

/**
 * Extract `<assistant-instruction>` blocks from assistant text, tolerating the glitches the
 * model occasionally produces:
 *
 * - the same block emitted twice (a draft followed by the real one) → only the **last
 *   complete** block per name is returned;
 * - a draft that never closes and runs into the next opening tag → dropped when a complete
 *   block of the same name exists, otherwise used as-is (its content ends at the next tag);
 * - stray `<thinking>` / `</thinking>` tags inside a block → removed.
 *
 * Blocks are returned in order of appearance.
 */
export function extractInstructionBlocks(text: string): RawInstructionBlock[] {
  const opens: { name: string; attrString: string; start: number; end: number }[] = [];
  const pattern = new RegExp(OPEN_TAG.source, 'g');
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    opens.push({ name: match[1], attrString: match[2], start: match.index, end: match.index + match[0].length });
  }

  const blocks = opens.map((open, i) => {
    const nextOpen = i + 1 < opens.length ? opens[i + 1].start : text.length;
    const close = text.indexOf(CLOSE_TAG, open.end);
    const closed = close >= 0 && close < nextOpen;
    const contentEnd = closed ? close : nextOpen;
    return {
      name: open.name,
      attrString: open.attrString,
      content: text.slice(open.end, contentEnd).replace(THINKING_TAG, '').trim(),
      closed,
    };
  });

  const chosen = new Map<string, (typeof blocks)[number]>();
  for (const block of blocks) {
    const current = chosen.get(block.name);
    // A closed block always wins over an unterminated one; among equals, last wins.
    if (!current || block.closed || !current.closed) {
      chosen.set(block.name, block);
    }
  }

  return blocks
    .filter((block) => chosen.get(block.name) === block)
    .map(({ name, attrString, content }) => ({ name, attrString, content }));
}
