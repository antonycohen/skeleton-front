import { delay, http, HttpResponse, type HttpHandler } from 'msw';
import { api, collection, json, problem, snakeKeys } from '../api';
import { aiConversationMessages, aiConversations, aiReplyEvents } from '../../fixtures/ai';
import { USER_ID } from '../../fixtures/session';

const CONVERSATIONS = '/organizations/:organizationId/ai-conversations';

const cors = () => ({
  'Access-Control-Allow-Origin': window.location.origin,
  'Access-Control-Allow-Credentials': 'true',
});

const findConversation = (id: unknown) => aiConversations.find((c) => c.id === id);

const body = async (request: Request) => ((await request.json().catch(() => ({}))) ?? {}) as Record<string, unknown>;

/**
 * A chat turn's answer: Anthropic-format server-sent events (`event:` + `data:` lines, wire-format
 * keys), a few tens of milliseconds apart so the reply visibly streams in.
 */
const sseStream = (events: object[]) => {
  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      for (const event of events) {
        const { type } = event as { type: string };
        controller.enqueue(encoder.encode(`event: ${type}\ndata: ${JSON.stringify(snakeKeys(event))}\n\n`));
        await delay(type === 'content_block_delta' ? 60 : 150);
      }
      controller.close();
    },
  });
};

/** Default handlers for the ai domain (fixtures in ../../fixtures/ai.ts). */
export const aiHandlers: HttpHandler[] = [
  http.get(api(CONVERSATIONS), ({ request }) => collection(aiConversations, request)),
  http.post(api(CONVERSATIONS), async ({ params, request }) =>
    json(
      {
        ...aiConversations[4],
        id: crypto.randomUUID(),
        title: null,
        organization: { id: params['organizationId'], name: 'Acme' },
        createdBy: USER_ID,
        ...(await body(request)),
      },
      { status: 201 },
    ),
  ),
  http.get(api(`${CONVERSATIONS}/:conversationId`), ({ params }) => {
    const conversation = findConversation(params['conversationId']);
    return conversation ? json(conversation) : problem(404, 'Conversation not found');
  }),
  http.patch(api(`${CONVERSATIONS}/:conversationId`), async ({ params, request }) =>
    json({ ...findConversation(params['conversationId']), ...(await body(request)) }),
  ),
  http.delete(api(`${CONVERSATIONS}/:conversationId`), () => new HttpResponse(null, { status: 204, headers: cors() })),

  // Newest first (created DESC), paginated: the page reverses each page and loads older ones on scroll.
  http.get(api(`${CONVERSATIONS}/:conversationId/messages`), ({ params, request }) =>
    collection([...(aiConversationMessages[params['conversationId'] as string] ?? [])].reverse(), request),
  ),
  http.post(api(`${CONVERSATIONS}/:conversationId/messages`), async ({ request }) => {
    const { message } = (await body(request)) as { message?: string };
    return new HttpResponse(sseStream(aiReplyEvents(message ?? '')), {
      headers: { ...cors(), 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
    });
  }),
];
