import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { AiChatInputPluginContext } from '../types';
import { SuggestionChips } from './suggestion-chips';

const context = (isStreaming = false) =>
  ({ sendMessageContent: vi.fn(), isStreaming }) as unknown as AiChatInputPluginContext;

describe('SuggestionChips', () => {
  afterEach(cleanup);

  it('sends a double-clicked answer once (the host has not shown it yet)', () => {
    const ctx = context();
    render(<SuggestionChips suggestions={['Copy a page', 'Start from scratch']} ctx={ctx} />);

    const chip = screen.getByText('Start from scratch');
    fireEvent.click(chip);
    fireEvent.click(chip);

    expect(ctx.sendMessageContent).toHaveBeenCalledTimes(1);
    expect(ctx.sendMessageContent).toHaveBeenCalledWith('Start from scratch');
  });

  it('takes an answer again once the next question comes', () => {
    const ctx = context();
    const { rerender } = render(<SuggestionChips suggestions={['Copy a page', 'Start from scratch']} ctx={ctx} />);
    fireEvent.click(screen.getByText('Start from scratch'));

    rerender(<SuggestionChips suggestions={['English', 'French']} ctx={ctx} />);
    fireEvent.click(screen.getByText('French'));

    expect(ctx.sendMessageContent).toHaveBeenCalledTimes(2);
    expect(ctx.sendMessageContent).toHaveBeenLastCalledWith('French');
  });

  it('takes an answer again when the first one never started a reply', () => {
    vi.useFakeTimers();
    try {
      const ctx = context();
      render(<SuggestionChips suggestions={['Copy a page', 'Start from scratch']} ctx={ctx} />);
      fireEvent.click(screen.getByText('Start from scratch'));

      vi.advanceTimersByTime(3000);
      fireEvent.click(screen.getByText('Start from scratch'));

      expect(ctx.sendMessageContent).toHaveBeenCalledTimes(2);
    } finally {
      vi.useRealTimers();
    }
  });

  it('takes the same answer again once the reply has streamed', () => {
    const suggestions = ['Copy a page', 'Start from scratch'];
    const { rerender } = render(<SuggestionChips suggestions={suggestions} ctx={context()} />);
    const ctx = context();
    rerender(<SuggestionChips suggestions={suggestions} ctx={ctx} />);
    fireEvent.click(screen.getByText('Start from scratch'));

    rerender(<SuggestionChips suggestions={suggestions} ctx={{ ...ctx, isStreaming: true }} />);
    rerender(<SuggestionChips suggestions={suggestions} ctx={ctx} />);
    fireEvent.click(screen.getByText('Start from scratch'));

    expect(ctx.sendMessageContent).toHaveBeenCalledTimes(2);
  });
});
