import { describe, expect, it } from 'vitest';
import { extractInstructionBlocks } from './extract-instructions';
import { parseSuggestionsPayload } from '../plugins/instruction-plugins/instruction-suggestion-plugin/parse-suggestions';

const OPTIONS = [
  'Generic pages killing LinkedIn Ads conversion rates',
  'Enterprise ABM platforms too expensive and complex',
  'No dev resources to build personalized pages at scale',
  'Something else',
];
const OPEN = '<assistant-instruction name="suggestions" data-question="Which goal matters most?">';
const BLOCK = `${OPEN}\n${OPTIONS.join('\n')}\n</assistant-instruction>`;

describe('extractInstructionBlocks', () => {
  it('repairs the production glitch: unterminated draft, stray </thinking>, then the real block', () => {
    const draft = BLOCK.replace('</assistant-instruction>', '</thinking>');
    const text = `Which is the sharpest pain?\n\n${draft}\n${BLOCK}`;

    const blocks = extractInstructionBlocks(text);

    expect(blocks).toHaveLength(1);
    expect(blocks[0].name).toBe('suggestions');
    expect(blocks[0].attrString).toContain('data-question="Which goal matters most?"');
    expect(parseSuggestionsPayload(blocks[0].content, { 'data-question': 'q' }).suggestions).toEqual(OPTIONS);
  });

  it('keeps the last complete block per name', () => {
    const first = BLOCK.replace('Something else', 'Other');
    const blocks = extractInstructionBlocks(`${first}\n${BLOCK}`);

    expect(blocks).toHaveLength(1);
    expect(blocks[0].content.endsWith('Something else')).toBe(true);
  });

  it('keeps distinct names, in order of appearance', () => {
    const textInput = '<assistant-instruction name="text-input" label="Url"></assistant-instruction>';
    const blocks = extractInstructionBlocks(`${textInput}\n${BLOCK}`);

    expect(blocks.map((b) => b.name)).toEqual(['text-input', 'suggestions']);
    expect(blocks[0].content).toBe('');
  });

  it('falls back to an unterminated block when nothing better exists', () => {
    const blocks = extractInstructionBlocks(`Q?\n${OPEN}\nA\nB\n`);

    expect(blocks).toHaveLength(1);
    expect(blocks[0].content).toBe('A\nB');
  });

  it('strips thinking tags inside a block', () => {
    const blocks = extractInstructionBlocks(`${OPEN}\n<thinking>\nA\n</thinking>\nB\n</assistant-instruction>`);

    expect(parseSuggestionsPayload(blocks[0].content).suggestions).toEqual(['A', 'B']);
  });

  it('returns nothing when there is no block', () => {
    expect(extractInstructionBlocks('plain text')).toEqual([]);
  });
});

describe('parseSuggestionsPayload', () => {
  it('drops tag-looking lines but keeps options starting with "<"-free text', () => {
    const { suggestions } = parseSuggestionsPayload(`A\n</thinking>\n${OPEN}\nB < C\n`);

    expect(suggestions).toEqual(['A', 'B < C']);
  });
});
