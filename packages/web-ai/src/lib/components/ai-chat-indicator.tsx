'use client';

import Lottie from 'lottie-react';
import {AnimatePresence, motion} from 'motion/react';
import {cn} from '@skeleton/core-utils';
import {ThinkingContent} from '../plugins/block-plugins/thinking';
import chatIdleAnimation from '../assets/lottie/chat-Idle.json';
import chatThinkingAnimation from '../assets/lottie/chat-thinking.json';
import chatSuccessAnimation from '../assets/lottie/chat-success.json';
import chatErrorAnimation from '../assets/lottie/chat-error.json';

const TRANSITION_EASE = [0.22, 1, 0.36, 1] as const;
const TRANSITION_DURATION = 0.55;

export type AiChatIndicatorStatus = 'idle' | 'thinking' | 'success' | 'error';

interface LottieConfig {
  data: unknown;
  loop: boolean;
}

const lottieByStatus: Record<AiChatIndicatorStatus, LottieConfig> = {
  idle: { data: chatIdleAnimation, loop: true },
  thinking: { data: chatThinkingAnimation, loop: true },
  success: { data: chatSuccessAnimation, loop: false },
  error: { data: chatErrorAnimation, loop: true },
};

export interface AiChatIndicatorProps {
  /** Current indicator status */
  status: AiChatIndicatorStatus;
  /** Current thinking text — shown alongside the animation when status === 'thinking' */
  thinking?: string;
  /** Additional CSS classes */
  className?: string;
  /** Pixel size of the animation (defaults to 32) */
  size?: number;
}

/**
 * Global chat status indicator. Renders a single Lottie animation that
 * crossfades between idle / thinking / success / error states. When the
 * status is 'thinking' and `thinking` text is provided, the thinking content
 * is rendered next to the animation (same look as ThinkingContent inline).
 */
export function AiChatIndicator({ status, thinking, className, size = 32 }: AiChatIndicatorProps) {
  const { data, loop } = lottieByStatus[status];
  const showThinking = status === 'thinking' && Boolean(thinking);
  return (
    <div
      data-slot="ai-chat-indicator"
      className={cn('flex items-center gap-4', className)}
    >
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={status}
            initial={{ opacity: 0, scale: 0.55, filter: 'blur(8px)', rotate: -10, y: 4 }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)', rotate: 0, y: 0 }}
            exit={{ opacity: 0, scale: 1.18, filter: 'blur(8px)', rotate: 10, y: -4 }}
            transition={{ duration: TRANSITION_DURATION, ease: TRANSITION_EASE }}
            className="absolute inset-0 flex items-center justify-center"
            style={{ transformOrigin: '50% 55%', willChange: 'transform, opacity, filter' }}
          >
            <Lottie
              animationData={data}
              loop={loop}
              autoplay
              rendererSettings={{ preserveAspectRatio: 'xMidYMid meet' }}
              style={{ width: size, height: size }}
            />
          </motion.div>
        </AnimatePresence>
      </div>
      {showThinking && (
        <ThinkingContent thinking={thinking ?? ''} className="min-w-0 flex-1" />
      )}
    </div>
  );
}
