import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type RefObject } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { cn } from '@skeleton/core-utils';
import { useTranslation } from '@skeleton/core-translations';

/** One rendering of a clip: its video, and its poster (the still, shown while the video loads). */
export type ClipSource = { video: string; poster: string };

/** A short silent clip showing a gesture in the real UI: its files in each theme, its still, its shape. */
export type ClipSpec = {
  /** The clip in the light theme: played while the app is dark. */
  light: ClipSource;
  /** The clip in the dark theme: played while the app is light. */
  dark: ClipSource;
  /** Where it stops once done, in seconds (its poster's frame). */
  stillAt: number;
  /** Its CSS aspect ratio, so its place is kept while it loads (`'16 / 10'`). */
  aspect: string;
  /** What it shows, for screen readers. */
  label: string;
};

/**
 * A clip's files side by side under `base` (no extension): `.mp4` and its `.jpg` still, `-dark` for the
 * dark theme's (`${useStaticAssetsUrl()}/clips/editor-how-to`: the static assets host).
 */
export const clipSources = (base: string): Pick<ClipSpec, 'light' | 'dark'> => ({
  light: { video: `${base}.mp4`, poster: `${base}.jpg` },
  dark: { video: `${base}-dark.mp4`, poster: `${base}-dark.jpg` },
});

/** Played this many times, then it stops on its still. */
const PLAYS = 2;

/** Playing; paused by a click; or done (played twice, no need to play it any more): on its still. */
export type ClipState = 'playing' | 'paused' | 'done';

/**
 * A clip's playback: its state, its plays, where it is. Each clip has its own by default; one store
 * passed to several clips makes them one playback (a clip shown in several places, one at a time):
 * paused in one, paused in all; the next one mounted plays on where the last one was.
 */
export type ClipStore = {
  state: ClipState;
  setState: (state: ClipState) => void;
  /** Plays completed since it started (or since a replay, which starts at the last one). */
  playsRef: RefObject<number>;
  /** Where it is, in seconds. */
  timeRef: RefObject<number>;
};

export type UseClipStoreOptions = {
  /**
   * False once there's no need to play it any more (what it shows was done): it goes to its still,
   * and a click still plays it once more. With reduced motion it starts there.
   */
  playing?: boolean;
};

export function useClipStore({ playing = true }: UseClipStoreOptions = {}): ClipStore {
  const reducedMotion = usePrefersReducedMotion();
  const animated = playing && !reducedMotion;
  const [state, setState] = useState<ClipState>(animated ? 'playing' : 'done');
  // Done as soon as it needn't play any more (adjusted while rendering, not in an effect).
  const [wasAnimated, setWasAnimated] = useState(animated);
  if (wasAnimated !== animated) {
    setWasAnimated(animated);
    if (!animated) setState('done');
  }
  const playsRef = useRef(0);
  const timeRef = useRef(0);
  return useMemo(() => ({ state, setState, playsRef, timeRef }), [state]);
}

export type ClipProps = ClipSpec & {
  /** A playback shared with other clips (`useClipStore`); its own otherwise. */
  store?: ClipStore;
  /** Its own playback only: see `UseClipStoreOptions.playing`. */
  playing?: boolean;
  className?: string;
};

/**
 * A clip and its playback. Played twice, then done: on its still; done at once with reduced motion,
 * or once there's no need to play it (`playing`). The whole clip is the control, as a video's: a click
 * pauses it, plays it on, or once done plays it once more; paused or done, it's dimmed with the icon of
 * what a click does in its middle (Play, Replay), playing, Pause on hover. Just the icon, no button
 * around it. In the other theme than the app's (the `dark` class on `<html>`), switching with it: dark
 * in light, light in dark, so it reads as a demo, not as the UI itself.
 */
export function Clip({ store, playing, className, light, dark, stillAt, aspect, label }: ClipProps) {
  const { t } = useTranslation();
  const own = useClipStore({ playing });
  const { state, setState, playsRef, timeRef } = store ?? own;
  const source = useDarkTheme() ? light : dark;
  const videoRef = useRef<HTMLVideoElement>(null);
  // This video put where the playback is: until then, its own position (0 while it loads) isn't saved.
  const placedRef = useRef(false);

  // Done: on its still, here and in any other clip on the same playback.
  useEffect(() => {
    if (state !== 'done') return;
    timeRef.current = stillAt;
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    video.currentTime = stillAt;
  }, [state, stillAt, timeRef]);

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;
    if (state === 'playing') {
      video.pause();
      timeRef.current = video.currentTime;
      setState('paused');
      return;
    }
    if (state === 'done') {
      // Played once more.
      playsRef.current = PLAYS - 1;
      timeRef.current = 0;
      video.currentTime = 0;
    }
    video.play().catch(() => undefined);
    setState('playing');
  };

  const Icon = state === 'done' ? RotateCcw : state === 'paused' ? Play : Pause;
  return (
    <button
      type="button"
      data-slot="clip"
      onClick={toggle}
      aria-label={state === 'done' ? t('components.clip.replay') : state === 'paused' ? t('components.clip.play') : t('components.clip.pause')}
      className={cn(
        'group relative block w-full cursor-pointer bg-muted outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-inset',
        className,
      )}
    >
      <video
        // A theme switched: the other clip, loaded anew, where the playback is.
        key={source.video}
        ref={videoRef}
        className="block w-full"
        style={{ aspectRatio: aspect }}
        autoPlay={state === 'playing'}
        muted
        playsInline
        poster={source.poster}
        aria-label={label}
        // Mounted again (a theme, another place on the same playback): where the playback was, its
        // still once done.
        onLoadStart={() => {
          placedRef.current = false;
        }}
        onLoadedMetadata={(event) => {
          event.currentTarget.currentTime = state === 'done' ? stillAt : timeRef.current;
          placedRef.current = true;
        }}
        onTimeUpdate={(event) => {
          if (placedRef.current && state === 'playing') timeRef.current = event.currentTarget.currentTime;
        }}
        onEnded={(event) => {
          playsRef.current += 1;
          if (playsRef.current >= PLAYS) {
            setState('done');
            return;
          }
          timeRef.current = 0;
          event.currentTarget.currentTime = 0;
          event.currentTarget.play().catch(() => undefined);
        }}
      >
        <source src={source.video} type="video/mp4" />
      </video>
      {/* What a click does, in the middle, on one dim (black/40) whatever the icon: always when it's
          still, on hover while it plays. */}
      <span
        aria-hidden
        className={cn(
          'absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity',
          state === 'playing' && 'opacity-0 group-hover:opacity-100',
        )}
      >
        <Icon
          className={cn('size-6 text-white drop-shadow-md', Icon !== RotateCcw && 'fill-current')}
          strokeWidth={Icon === RotateCcw ? 2.25 : 1.5}
        />
      </span>
    </button>
  );
}

const subscribeToTheme = (onChange: () => void) => {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  return () => observer.disconnect();
};
const isDarkTheme = () => document.documentElement.classList.contains('dark');

/** Whether the app is in its dark theme: the `dark` class on `<html>` (next-themes', Storybook's toolbar). */
function useDarkTheme() {
  return useSyncExternalStore(subscribeToTheme, isDarkTheme, () => false);
}

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';
const reducedMotionQuery = () => (typeof window.matchMedia === 'function' ? window.matchMedia(REDUCED_MOTION) : null);
const subscribeToMotion = (onChange: () => void) => {
  const query = reducedMotionQuery();
  query?.addEventListener('change', onChange);
  return () => query?.removeEventListener('change', onChange);
};
const prefersReducedMotion = () => reducedMotionQuery()?.matches ?? false;

function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribeToMotion, prefersReducedMotion, () => false);
}
