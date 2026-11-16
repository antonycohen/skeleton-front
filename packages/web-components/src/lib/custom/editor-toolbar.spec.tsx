import {describe, expect, it, vi} from 'vitest';
import {createEvent, fireEvent, render, screen} from '@testing-library/react';
import {TooltipProvider} from '../ui/tooltip';
import {EditorToolbar, type EditorToolbarProps} from './editor-toolbar';

const toolbar = (props: EditorToolbarProps) => (
  <TooltipProvider>
    <EditorToolbar tool="select" viewMode="single" {...props} />
  </TooltipProvider>
);

describe('EditorToolbar', () => {
  it('is the edit’s while a text changed, and its tools again once it ends', () => {
    const editing = {onCancel: vi.fn(), onApply: vi.fn()};
    const {rerender} = render(toolbar({}));
    expect(screen.getByLabelText('Select blocks')).toBeTruthy();

    rerender(toolbar({editing}));
    expect(screen.getByText('Unsaved text changes')).toBeTruthy();
    expect(screen.queryByLabelText('Select blocks')).toBeNull();
    fireEvent.click(screen.getByRole('button', {name: /Apply/}));
    expect(editing.onApply).toHaveBeenCalledTimes(1);

    // No Web Animations API here (as with reduced motion): back at once, no morph.
    rerender(toolbar({}));
    expect(screen.queryByText('Unsaved text changes')).toBeNull();
    expect(screen.getByLabelText('Select blocks')).toBeTruthy();
  });

  it('keeps the focus on the text being edited: a press on its edit bar takes none', () => {
    render(toolbar({editing: {onCancel: vi.fn(), onApply: vi.fn()}}));
    const cancel = screen.getByRole('button', {name: /Cancel/});
    const press = createEvent.mouseDown(cancel);

    fireEvent(cancel, press);

    expect(press.defaultPrevented).toBe(true);
  });

  it('offers to interact with the page: checked by hand, or held with the shortcut', () => {
    const onInteractChange = vi.fn();
    const {rerender} = render(toolbar({interact: false, onInteractChange}));

    fireEvent.click(screen.getByText('Interact with the page'));
    expect(onInteractChange).toHaveBeenLastCalledWith(true);

    // Held: on while the keys are down, off when they are let go.
    onInteractChange.mockClear();
    fireEvent.keyDown(window, {key: 'Shift', shiftKey: true, metaKey: true, ctrlKey: true});
    expect(onInteractChange).toHaveBeenLastCalledWith(true);
    rerender(toolbar({interact: true, onInteractChange}));
    fireEvent.keyUp(window, {key: 'Shift'});
    expect(onInteractChange).toHaveBeenLastCalledWith(false);
  });

  it('keeps the page interactive, once checked by hand, through the keys typed in it', () => {
    const onInteractChange = vi.fn();
    render(toolbar({interact: true, onInteractChange}));

    fireEvent.keyDown(window, {key: 'a'});
    fireEvent.keyUp(window, {key: 'a'});

    expect(onInteractChange).not.toHaveBeenCalled();
  });

  it('has no interact toggle unless asked for', () => {
    render(toolbar({}));
    expect(screen.queryByText('Interact with the page')).toBeNull();
  });
});
