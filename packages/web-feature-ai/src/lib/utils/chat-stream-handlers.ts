import { toast } from 'sonner';
import type { ContextContentBlock, StreamEvent } from '@skeleton/core-api-models';
import type { AiChatEventBus } from '@skeleton/web-ai';

// English fallbacks: callers with access to translations pass localized messages in the options.
const DEFAULT_INTERRUPTED_MESSAGE =
  "Connection lost — the assistant couldn't finish responding. Please try again.";
const DEFAULT_ERROR_MESSAGE = "The assistant couldn't finish responding. Please try again.";
const DEFAULT_CONNECTION_CLOSED_MESSAGE =
  'The connection closed before the assistant finished responding.';

export interface ChatStreamHandlers {
  onEvent: (event: StreamEvent) => void;
  onError: () => void;
  onComplete: () => void;
}

export interface ChatStreamHandlersOptions {
  /** Toast shown when the connection drops before the end of the turn. */
  interruptedMessage?: string;
  /** Toast shown when the server reports an error without a message. */
  errorMessage?: string;
  /** Message of the synthetic `error` event published when the connection drops. */
  connectionClosedMessage?: string;
  /**
   * Called once per turn, on the first content block: the backend echoes the
   * turn's resolved selection as a `context` block right after message_start,
   * so a first block that is NOT a context echo means the selection sent with
   * the request didn't resolve (stale id) and the turn ran globally. Only
   * wired by callers that actually sent a context.
   */
  onContextOutcome?: (echoed: ContextContentBlock | null) => void;
}

/**
 * Builds the `onEvent` / `onError` / `onComplete` callbacks for a streaming
 * chat agent so the UI never silently hangs when the SSE connection drops.
 *
 * A stream is considered to have ended cleanly only once a `message_stop` (or
 * an explicit server `error`) event arrives. If the connection errors, times
 * out, or simply closes before that — e.g. a proxy idle-timeout — we:
 *   1. publish a synthetic `error` event so `useStreamEventHandler` resets the
 *      streaming state (re-enables the input, stops the spinner, finalizes the
 *      partial message), and
 *   2. show a toast so the user knows to retry.
 */
export function createChatStreamHandlers(
  eventBus: AiChatEventBus,
  options: ChatStreamHandlersOptions = {},
): ChatStreamHandlers {
  const {
    interruptedMessage = DEFAULT_INTERRUPTED_MESSAGE,
    errorMessage = DEFAULT_ERROR_MESSAGE,
    connectionClosedMessage = DEFAULT_CONNECTION_CLOSED_MESSAGE,
    onContextOutcome,
  } = options;
  let ended = false;
  let firstBlockSeen = false;

  const notifyInterrupted = () => {
    if (ended) return;
    ended = true;
    eventBus.publish({
      type: 'error',
      error: {
        type: 'connection_closed',
        message: connectionClosedMessage,
      },
    });
    toast.error(interruptedMessage);
  };

  return {
    onEvent: (event: StreamEvent) => {
      if (event.type === 'content_block_start' && !firstBlockSeen) {
        firstBlockSeen = true;
        onContextOutcome?.(
          event.contentBlock.type === 'context' ? event.contentBlock : null,
        );
      }
      if (event.type === 'message_stop') {
        ended = true;
      } else if (event.type === 'error') {
        ended = true;
        toast.error(event.error.message || errorMessage);
      }
      eventBus.publish(event);
    },
    // Connection-level failure: stream errored, timed out, or returned non-2xx.
    onError: notifyInterrupted,
    // Stream ended: if we never saw message_stop it closed prematurely.
    onComplete: notifyInterrupted,
  };
}
