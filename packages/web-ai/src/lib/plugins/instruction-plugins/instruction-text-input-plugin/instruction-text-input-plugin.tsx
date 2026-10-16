import type { InstructionPlugin } from '../types';
import {
  parseTextInputPayload,
  isValidTextInputPayload,
} from './parse-text-input';
import type { TextInputPayload } from './types';

export const instructionTextInputPlugin: InstructionPlugin<TextInputPayload> = {
  id: 'instruction-text-input',
  instructionType: 'text-input',
  priority: 10,
  parsePayload: parseTextInputPayload,
  shouldActivate: (payload) => isValidTextInputPayload(payload),
};
