import type { ReadOrganization, User } from '@skeleton/core-api-models';
import { connectedUser, workspaces, type WorkspaceVariant } from './fixtures/session';

/**
 * What the current story runs as. Set by the global loader from the story's parameters before it
 * renders, read by the session handlers — so `parameters.workspace = 'free'` is all a story needs
 * to see the app on the free plan.
 */
export const scenario: { workspace: ReadOrganization; user: User | null } = {
  workspace: workspaces.default,
  user: connectedUser,
};

export type ScenarioParameters = {
  /** Which workspace the story runs in (default: a business on a paid plan). */
  workspace?: WorkspaceVariant | ReadOrganization;
  /** `anonymous` for logged-out screens (login, signup…). */
  session?: 'connected' | 'anonymous';
};

export function applyScenario(parameters: ScenarioParameters) {
  scenario.workspace =
    typeof parameters.workspace === 'object' ? parameters.workspace : workspaces[parameters.workspace ?? 'default'];
  scenario.user = parameters.session === 'anonymous' ? null : connectedUser;
}
