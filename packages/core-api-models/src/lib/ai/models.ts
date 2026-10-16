import * as z from 'zod';

// ============================================
// STOP REASONS
// ============================================

export const stopReasonSchema = z.enum([
  'end_turn',
  'max_tokens',
  'stop_sequence',
  'tool_use',
  'pause_turn',
  'refusal',
]);
export type StopReason = z.infer<typeof stopReasonSchema>;

// ============================================
// USAGE
// ============================================

export const usageSchema = z.object({
  inputTokens: z.number(),
  outputTokens: z.number(),
  cacheCreationInputTokens: z.number().optional(),
  cacheReadInputTokens: z.number().optional(),
  serverToolUse: z
    .object({
      webSearchRequests: z.number().optional(),
    })
    .optional(),
});
export type Usage = z.infer<typeof usageSchema>;

// ============================================
// REQUEST CONTENT BLOCKS
// ============================================

export const textContentBlockSchema = z.object({
  type: z.literal('text'),
  text: z.string(),
});
export type TextContentBlock = z.infer<typeof textContentBlockSchema>;

export const imageSourceSchema = z.object({
  type: z.enum(['base64', 'url']),
  mediaType: z.enum(['image/jpeg', 'image/png', 'image/gif', 'image/webp']).optional(),
  data: z.string().optional(),
  url: z.string().optional(),
});
export type ImageSource = z.infer<typeof imageSourceSchema>;

export const imageContentBlockSchema = z.object({
  type: z.literal('image'),
  source: imageSourceSchema,
});
export type ImageContentBlock = z.infer<typeof imageContentBlockSchema>;

export const documentSourceSchema = z.object({
  type: z.literal('base64'),
  mediaType: z.literal('application/pdf'),
  data: z.string(),
});
export type DocumentSource = z.infer<typeof documentSourceSchema>;

export const documentContentBlockSchema = z.object({
  type: z.literal('document'),
  source: documentSourceSchema,
});
export type DocumentContentBlock = z.infer<typeof documentContentBlockSchema>;

export const toolUseContentBlockSchema = z.object({
  type: z.literal('tool_use'),
  id: z.string(),
  name: z.string(),
  input: z.record(z.string(), z.unknown()),
});
export type ToolUseContentBlock = z.infer<typeof toolUseContentBlockSchema>;

export const toolResultContentBlockSchema: z.ZodType<{
  type: 'tool_result';
  toolUseId: string;
  content: string | ContentBlock[];
  isError?: boolean;
}> = z.object({
  type: z.literal('tool_result'),
  toolUseId: z.string(),
  content: z.union([z.string(), z.lazy(() => z.array(contentBlockSchema))]),
  isError: z.boolean().optional(),
});
export type ToolResultContentBlock = z.infer<typeof toolResultContentBlockSchema>;

export const thinkingContentBlockSchema = z.object({
  type: z.literal('thinking'),
  thinking: z.string(),
});
export type ThinkingContentBlock = z.infer<typeof thinkingContentBlockSchema>;

export const serverToolUseContentBlockSchema = z.object({
  type: z.literal('server_tool_use'),
  id: z.string(),
  name: z.string(),
  input: z.record(z.string(), z.unknown()),
});
export type ServerToolUseContentBlock = z.infer<typeof serverToolUseContentBlockSchema>;

export const webSearchResultSchema = z.object({
  type: z.literal('web_search_result'),
  title: z.string(),
  url: z.string(),
  encryptedContent: z.string(),
  pageAge: z.string().nullable(),
});
export type WebSearchResult = z.infer<typeof webSearchResultSchema>;

export const webSearchToolResultContentBlockSchema = z.object({
  type: z.literal('web_search_tool_result'),
  toolUseId: z.string(),
  content: z.array(webSearchResultSchema),
});
export type WebSearchToolResultContentBlock = z.infer<
  typeof webSearchToolResultContentBlockSchema
>;

// The structured selection a chat turn was scoped to (e.g. an entity the user
// picked in the UI). Stored on the USER message alongside the verbatim text
// block, and echoed ephemerally at the start of the SSE stream (right after
// message_start, as a normal content_block_start/stop pair) so the client can
// render the canonical, server-resolved chip live. The echoed copy is NOT part
// of the assistant message.
export const contextContentBlockSchema = z.object({
  type: z.literal('context'),
  // Identifier of the selected item, as sent in the request context.
  id: z.string().nullable(),
  // Human-readable chip text.
  label: z.string().nullable(),
});
export type ContextContentBlock = z.infer<typeof contextContentBlockSchema>;

// Union of all content blocks
export const contentBlockSchema: z.ZodType<ContentBlock> = z.discriminatedUnion('type', [
  textContentBlockSchema,
  imageContentBlockSchema,
  documentContentBlockSchema,
  toolUseContentBlockSchema,
  thinkingContentBlockSchema,
  serverToolUseContentBlockSchema,
  webSearchToolResultContentBlockSchema,
  contextContentBlockSchema,
  // Note: toolResultContentBlockSchema excluded from discriminated union due to recursive type
]).or(toolResultContentBlockSchema);

export type ContentBlock =
  | TextContentBlock
  | ImageContentBlock
  | DocumentContentBlock
  | ToolUseContentBlock
  | ToolResultContentBlock
  | ThinkingContentBlock
  | ServerToolUseContentBlock
  | WebSearchToolResultContentBlock
  | ContextContentBlock;

// ============================================
// SYSTEM CONTENT BLOCK
// ============================================

export const cacheControlSchema = z.object({
  type: z.literal('ephemeral'),
});
export type CacheControl = z.infer<typeof cacheControlSchema>;

export const systemContentBlockSchema = z.object({
  type: z.literal('text'),
  text: z.string(),
  cacheControl: cacheControlSchema.optional(),
});
export type SystemContentBlock = z.infer<typeof systemContentBlockSchema>;

// ============================================
// TOOL DEFINITIONS
// ============================================

export const toolInputSchemaSchema = z.object({
  type: z.literal('object'),
  properties: z.record(z.string(), z.unknown()),
  required: z.array(z.string()).optional(),
});
export type ToolInputSchema = z.infer<typeof toolInputSchemaSchema>;

export const toolSchema = z.object({
  name: z.string(),
  description: z.string(),
  inputSchema: toolInputSchemaSchema,
});
export type Tool = z.infer<typeof toolSchema>;

export const toolChoiceAutoSchema = z.object({
  type: z.literal('auto'),
});
export const toolChoiceAnySchema = z.object({
  type: z.literal('any'),
});
export const toolChoiceNoneSchema = z.object({
  type: z.literal('none'),
});
export const toolChoiceToolSchema = z.object({
  type: z.literal('tool'),
  name: z.string(),
});

export const toolChoiceSchema = z.discriminatedUnion('type', [
  toolChoiceAutoSchema,
  toolChoiceAnySchema,
  toolChoiceNoneSchema,
  toolChoiceToolSchema,
]);
export type ToolChoice = z.infer<typeof toolChoiceSchema>;

// ============================================
// THINKING CONFIG
// ============================================

export const thinkingConfigSchema = z.object({
  type: z.literal('enabled'),
  budgetTokens: z.number(),
});
export type ThinkingConfig = z.infer<typeof thinkingConfigSchema>;

// ============================================
// MESSAGE
// ============================================

export const messageRoleSchema = z.enum(['user', 'assistant']);
export type MessageRole = z.infer<typeof messageRoleSchema>;

export const messageSchema = z.object({
  role: messageRoleSchema,
  content: z.union([z.string(), z.array(contentBlockSchema)]),
});
export type Message = z.infer<typeof messageSchema>;

// ============================================
// MESSAGES REQUEST
// ============================================

export const messagesRequestMetadataSchema = z.object({
  userId: z.string().optional(),
});
export type MessagesRequestMetadata = z.infer<typeof messagesRequestMetadataSchema>;

export const messagesRequestSchema = z.object({
  // Required
  model: z.string(),
  maxTokens: z.number(),
  messages: z.array(messageSchema),
  // Optional
  stream: z.boolean().optional(),
  system: z.union([z.string(), z.array(systemContentBlockSchema)]).optional(),
  temperature: z.number().optional(),
  topP: z.number().optional(),
  topK: z.number().optional(),
  stopSequences: z.array(z.string()).optional(),
  metadata: messagesRequestMetadataSchema.optional(),
  tools: z.array(toolSchema).optional(),
  toolChoice: toolChoiceSchema.optional(),
  thinking: thinkingConfigSchema.optional(),
});
export type MessagesRequest = z.infer<typeof messagesRequestSchema>;

// ============================================
// DELTA TYPES
// ============================================

export const textDeltaSchema = z.object({
  type: z.literal('text_delta'),
  text: z.string(),
});
export type TextDelta = z.infer<typeof textDeltaSchema>;

export const thinkingDeltaSchema = z.object({
  type: z.literal('thinking_delta'),
  thinking: z.string(),
});
export type ThinkingDelta = z.infer<typeof thinkingDeltaSchema>;

export const signatureDeltaSchema = z.object({
  type: z.literal('signature_delta'),
  signature: z.string(),
});
export type SignatureDelta = z.infer<typeof signatureDeltaSchema>;

export const inputJsonDeltaSchema = z.object({
  type: z.literal('input_json_delta'),
  partialJson: z.string(),
});
export type InputJsonDelta = z.infer<typeof inputJsonDeltaSchema>;

export const deltaSchema = z.discriminatedUnion('type', [
  textDeltaSchema,
  thinkingDeltaSchema,
  signatureDeltaSchema,
  inputJsonDeltaSchema,
]);
export type Delta = z.infer<typeof deltaSchema>;

// ============================================
// MESSAGE RESPONSE (from message_start)
// ============================================

export const messageResponseSchema = z.object({
  id: z.string(),
  type: z.literal('message'),
  role: z.literal('assistant'),
  content: z.array(contentBlockSchema),
  model: z.string(),
  stopReason: stopReasonSchema.nullable(),
  stopSequence: z.string().nullable(),
  usage: usageSchema,
});
export type MessageResponse = z.infer<typeof messageResponseSchema>;

// ============================================
// STREAMING EVENT TYPES
// ============================================

export const messageStartEventSchema = z.object({
  type: z.literal('message_start'),
  message: messageResponseSchema,
});
export type MessageStartEvent = z.infer<typeof messageStartEventSchema>;

export const contentBlockStartEventSchema = z.object({
  type: z.literal('content_block_start'),
  index: z.number(),
  contentBlock: contentBlockSchema,
});
export type ContentBlockStartEvent = z.infer<typeof contentBlockStartEventSchema>;

export const contentBlockDeltaEventSchema = z.object({
  type: z.literal('content_block_delta'),
  index: z.number(),
  delta: deltaSchema,
});
export type ContentBlockDeltaEvent = z.infer<typeof contentBlockDeltaEventSchema>;

export const contentBlockStopEventSchema = z.object({
  type: z.literal('content_block_stop'),
  index: z.number(),
});
export type ContentBlockStopEvent = z.infer<typeof contentBlockStopEventSchema>;

export const messageDeltaEventSchema = z.object({
  type: z.literal('message_delta'),
  delta: z.object({
    stopReason: stopReasonSchema,
    stopSequence: z.string().nullable(),
  }),
  usage: z.object({
    outputTokens: z.number(),
  }),
});
export type MessageDeltaEvent = z.infer<typeof messageDeltaEventSchema>;

export const messageStopEventSchema = z.object({
  type: z.literal('message_stop'),
});
export type MessageStopEvent = z.infer<typeof messageStopEventSchema>;

export const pingEventSchema = z.object({
  type: z.literal('ping'),
});
export type PingEvent = z.infer<typeof pingEventSchema>;

export const streamErrorEventSchema = z.object({
  type: z.literal('error'),
  error: z.object({
    type: z.string(),
    message: z.string(),
  }),
});
export type StreamErrorEvent = z.infer<typeof streamErrorEventSchema>;

// Union of all stream events
export const streamEventSchema = z.discriminatedUnion('type', [
  messageStartEventSchema,
  contentBlockStartEventSchema,
  contentBlockDeltaEventSchema,
  contentBlockStopEventSchema,
  messageDeltaEventSchema,
  messageStopEventSchema,
  pingEventSchema,
  streamErrorEventSchema,
]);
export type StreamEvent = z.infer<typeof streamEventSchema>;

// ============================================
// EVENT TYPE ENUM (for type-safe event names)
// ============================================

export const streamEventTypeSchema = z.enum([
  'message_start',
  'content_block_start',
  'content_block_delta',
  'content_block_stop',
  'message_delta',
  'message_stop',
  'ping',
  'error',
]);
export type StreamEventType = z.infer<typeof streamEventTypeSchema>;

// ============================================
// HELPER TYPE FOR EVENT CALLBACKS
// ============================================

export type StreamEventHandler<T extends StreamEventType = StreamEventType> = (
  event: Extract<StreamEvent, { type: T }>
) => void;

// Type-safe event map for handlers
export interface StreamEventMap {
  message_start: MessageStartEvent;
  content_block_start: ContentBlockStartEvent;
  content_block_delta: ContentBlockDeltaEvent;
  content_block_stop: ContentBlockStopEvent;
  message_delta: MessageDeltaEvent;
  message_stop: MessageStopEvent;
  ping: PingEvent;
  error: StreamErrorEvent;
}

// ============================================
// STREAMING METADATA
// ============================================

export const streamingMetadataSchema = z.object({
  /** Block index in the message */
  index: z.number(),
  /** Whether streaming has completed for this block */
  isComplete: z.boolean(),
  /** Accumulated partial JSON (for tool_use blocks during streaming) */
  partialJson: z.string().optional(),
  /** Signature (for thinking blocks) */
  signature: z.string().optional(),
});
export type StreamingMetadata = z.infer<typeof streamingMetadataSchema>;

/** Helper type to augment any content block with streaming metadata */
export type WithStreamingMetadata<T> = T & StreamingMetadata;

// ============================================
// CHAT MESSAGE
// ============================================

export const chatMessageSchema = z.object({
  id: z.string(),
  role: messageRoleSchema,
  content: z.array(contentBlockSchema),
  createdAt: z.coerce.date(),
  isStreaming: z.boolean().optional(),
});
export type ChatMessage = z.infer<typeof chatMessageSchema>;

// ============================================
// CHAT AGENT REQUEST CONTEXT
// ============================================

/**
 * Free-form context sent alongside a chat turn (e.g. the id of the entity the
 * user is looking at). The backend decides how to use it.
 */
export const chatAgentContextSchema = z.record(z.string(), z.unknown());
export type ChatAgentContext = z.infer<typeof chatAgentContextSchema>;
