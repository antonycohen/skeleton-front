import {matchPath} from 'react-router-dom';

export type ActiveNavigation = {
  dashboard: boolean;
  assistant: boolean;
};

/** Which sidebar item is active for a pathname — at most one. */
export function getActiveNavigation(
  pathname: string,
  workspaceBaseUrl: string,
): ActiveNavigation {
  return {
    dashboard: !!matchPath(`${workspaceBaseUrl}/dashboard/*`, pathname),
    assistant: !!matchPath(`${workspaceBaseUrl}/assistant/*`, pathname),
  };
}
