import { sessionHandlers } from './session';
import { usersHandlers } from './users';
import { organizationsHandlers } from './organizations';
import { paymentHandlers } from './payment';
import { aiHandlers } from './ai';
import { jobsHandlers } from './jobs';
import { fallbackHandlers } from './fallback';

/**
 * The default mock API every story starts with. Order matters: MSW uses the first match, so the
 * specific routes come before the generic ones and the fallback is always last. A story narrows or
 * replaces any of them through `parameters.msw` (see `mock` in ../api.ts).
 */
export const defaultHandlers = [
  ...sessionHandlers,
  ...paymentHandlers,
  ...usersHandlers,
  ...aiHandlers,
  ...jobsHandlers,
  ...organizationsHandlers,
  ...fallbackHandlers,
];
