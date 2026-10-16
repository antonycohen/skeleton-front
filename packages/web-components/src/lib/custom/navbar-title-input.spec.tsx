import {describe, expect, it, vi} from 'vitest';
import {fireEvent, render, screen} from '@testing-library/react';
import {NavbarTitleInput} from './navbar-title-input';

const renderInput = (props: Partial<Parameters<typeof NavbarTitleInput>[0]> = {}) => {
  const onCommit = vi.fn();
  render(<NavbarTitleInput aria-label="Project name" value="Spring launch" onCommit={onCommit} {...props} />);
  return { onCommit, input: screen.getByLabelText('Project name') as HTMLInputElement };
};

describe('NavbarTitleInput', () => {
  it('commits the trimmed draft on Enter', () => {
    const { onCommit, input } = renderInput();
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: '  Summer launch ' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    fireEvent.blur(input);
    expect(onCommit).toHaveBeenCalledWith('Summer launch');
  });

  it('commits on blur', () => {
    const { onCommit, input } = renderInput();
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'Autumn launch' } });
    fireEvent.blur(input);
    expect(onCommit).toHaveBeenCalledWith('Autumn launch');
  });

  it('reverts on Escape without committing', () => {
    const { onCommit, input } = renderInput();
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'Oops' } });
    fireEvent.keyDown(input, { key: 'Escape' });
    fireEvent.blur(input);
    expect(onCommit).not.toHaveBeenCalled();
    expect(input.value).toBe('Spring launch');
  });

  it('does not commit an unchanged or empty draft', () => {
    const { onCommit, input } = renderInput();
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.blur(input);
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'Spring launch' } });
    fireEvent.blur(input);
    expect(onCommit).not.toHaveBeenCalled();
    expect(input.value).toBe('Spring launch');
  });

  it('follows the value prop while not editing', () => {
    const { rerender } = render(<NavbarTitleInput aria-label="Project name" value="One" onCommit={vi.fn()} />);
    rerender(<NavbarTitleInput aria-label="Project name" value="Two" onCommit={vi.fn()} />);
    expect((screen.getByLabelText('Project name') as HTMLInputElement).value).toBe('Two');
  });

  it('renders read-only without a commit handler', () => {
    const { onCommit, input } = renderInput({ readOnly: true });
    expect(input.readOnly).toBe(true);
    fireEvent.change(input, { target: { value: 'Nope' } });
    fireEvent.blur(input);
    expect(onCommit).not.toHaveBeenCalled();
  });
});
