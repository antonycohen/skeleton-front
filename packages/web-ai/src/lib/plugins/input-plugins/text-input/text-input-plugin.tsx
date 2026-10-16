'use client';

import type { AiChatInputPlugin, AiChatInputPluginContext } from '../types';
import { TextInputField } from './text-input-field';
import type { TextInputPayload } from '../../instruction-plugins/instruction-text-input-plugin/types';

/**
 * Input plugin for rendering a structured text input from <assistant-instruction> tags.
 *
 * When the AI sends a message containing:
 * <assistant-instruction name="text-input" label="Your page" placeholder="www.example.com" validators="url" prefix="https://"></assistant-instruction>
 *
 * This plugin:
 * 1. Detects the instruction in the last assistant message
 * 2. Replaces the default textarea with a structured input (label, prefix, validation)
 * 3. Validates and sends the value on submit
 */
export const textInputPlugin: AiChatInputPlugin = {
  id: 'text-input',
  priority: 20,
  replaceDefaultInput: true,

  shouldActivate(lastMessage, _messages, instructions) {
    if (!lastMessage || lastMessage.role !== 'assistant') return false;
    if (lastMessage.isStreaming) return false;
    return instructions.some((i) => i.type === 'text-input');
  },

  render(ctx: AiChatInputPluginContext) {
    const instruction = ctx.instructions.find((i) => i.type === 'text-input');
    if (!instruction) return null;

    const payload = instruction.payload as TextInputPayload;
    return <TextInputField payload={payload} ctx={ctx} />;
  },
};
