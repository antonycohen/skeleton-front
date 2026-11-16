import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {act, fireEvent, render, renderHook, screen} from '@testing-library/react';
import {Clip, useClipStore, type ClipSpec} from './clip';

const SPEC: ClipSpec = {
  light: {video: '/clip.mp4', poster: '/clip.jpg'},
  dark: {video: '/clip-dark.mp4', poster: '/clip-dark.jpg'},
  stillAt: 7,
  aspect: '16 / 10',
  label: 'How to edit',
};

const video = () => screen.getByLabelText('How to edit') as HTMLVideoElement;
const source = () => video().querySelector('source')?.getAttribute('src');

/** jsdom plays nothing: play and pause recorded, play resolving as browsers do. */
let play: ReturnType<typeof vi.fn>;
let pause: ReturnType<typeof vi.fn>;
let reducedMotion = false;

beforeEach(() => {
  reducedMotion = false;
  play = vi.fn(() => Promise.resolve());
  pause = vi.fn();
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(play);
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(pause);
  window.matchMedia = vi.fn().mockImplementation(() => ({
    matches: reducedMotion,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
});

afterEach(() => {
  vi.restoreAllMocks();
  document.documentElement.classList.remove('dark');
});

describe('Clip', () => {
  it('plays the other theme’s clip than the app’s, switching with it', async () => {
    const {unmount} = render(<Clip {...SPEC} />);
    expect(source()).toBe('/clip-dark.mp4');
    expect(video().getAttribute('poster')).toBe('/clip-dark.jpg');

    // The theme observer reports in a microtask: let it run inside act.
    await act(async () => {
      document.documentElement.classList.add('dark');
      await Promise.resolve();
    });
    expect(source()).toBe('/clip.mp4');
    // Gone before the theme is put back.
    unmount();
  });

  it('is a pause / play control while it plays', () => {
    render(<Clip {...SPEC} />);
    fireEvent.click(screen.getByRole('button', {name: 'Pause'}));
    expect(pause).toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', {name: 'Play'}));
    expect(play).toHaveBeenCalled();
    expect(screen.getByRole('button', {name: 'Pause'})).toBeTruthy();
  });

  it('plays twice, then stops on its still; a click plays it once more', () => {
    render(<Clip {...SPEC} />);
    fireEvent.ended(video());
    expect(screen.getByRole('button', {name: 'Pause'})).toBeTruthy();
    fireEvent.ended(video());
    expect(screen.getByRole('button', {name: 'Replay'})).toBeTruthy();
    expect(video().currentTime).toBe(7);

    fireEvent.click(screen.getByRole('button', {name: 'Replay'}));
    expect(video().currentTime).toBe(0);
    fireEvent.ended(video());
    expect(screen.getByRole('button', {name: 'Replay'})).toBeTruthy();
  });

  it('starts on its still with reduced motion', () => {
    reducedMotion = true;
    render(<Clip {...SPEC} />);
    expect(screen.getByRole('button', {name: 'Replay'})).toBeTruthy();
    expect(video().autoplay).toBe(false);
  });

  it('goes to its still once it needn’t play any more', () => {
    const {rerender} = render(<Clip {...SPEC} playing />);
    expect(screen.getByRole('button', {name: 'Pause'})).toBeTruthy();
    rerender(<Clip {...SPEC} playing={false} />);
    expect(screen.getByRole('button', {name: 'Replay'})).toBeTruthy();
    expect(video().currentTime).toBe(7);
  });

  it('shares one playback between the clips given the same store', () => {
    const {result} = renderHook(() => useClipStore());
    const {rerender} = render(<Clip {...SPEC} store={result.current} />);
    fireEvent.click(screen.getByRole('button', {name: 'Pause'}));
    expect(result.current.state).toBe('paused');
    // Another place on the same playback: paused too.
    rerender(<Clip {...SPEC} store={result.current} key="another" />);
    expect(screen.getByRole('button', {name: 'Play'})).toBeTruthy();
  });
});
