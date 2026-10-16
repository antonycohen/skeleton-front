import * as z from 'zod';
import { readOrganizationRefSchema } from '../organizations';

// 1. Reference schema with label field (for dropdowns, selects, links)
export const readAiConversationRefSchema = z.object({
  id: z.uuid(),
  title: z.string(),
});
export type ReadAiConversationRef = z.infer<typeof readAiConversationRefSchema>;

// 2. Minimal reference schema (for foreign keys)
export const aiConversationRefSchema = z.object({
  id: z.uuid(),
});
export type AiConversationRef = z.infer<typeof aiConversationRefSchema>;

// 3. Read schema - all properties nullable (API response)
export const readAiConversationSchema = z.object({
  id: z.uuid().nullable(),
  title: z.string().nullable(),
  organization: z.lazy(() => readOrganizationRefSchema).nullable(),
  createdBy: z.uuid().nullable(),
  messagesCount: z.number().nullable(),
  lastMessageAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime().nullable(),
  updatedAt: z.iso.datetime().nullable(),
});
export type ReadAiConversation = z.infer<typeof readAiConversationSchema>;

// 4. Create schema - based on DTO serialization groups
export const createAiConversationSchema = z.object({
  title: z.string().max(255, 'validation.aiConversation.titleTooLong').nullish(),
});
export type CreateAiConversation = z.infer<typeof createAiConversationSchema>;

// 5. Update schema
export const updateAiConversationSchema = z.object({
  title: z
    .string()
    .min(1, 'validation.aiConversation.titleRequired')
    .max(255, 'validation.aiConversation.titleTooLong'),
});
export type UpdateAiConversation = z.infer<typeof updateAiConversationSchema>;

// Request body of a chat turn (streamed answer).
export const postAiConversationMessageSchema = z.object({
  message: z.string().min(1),
  context: z.record(z.string(), z.unknown()).nullish(),
});
export type PostAiConversationMessage = z.infer<typeof postAiConversationMessageSchema>;

// Legacy export for backward compatibility
export const aiConversationSchema = readAiConversationSchema;
export type AiConversation = ReadAiConversation;
