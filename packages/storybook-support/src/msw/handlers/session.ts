import { http } from 'msw';
import { api, collection, json } from '../api';
import { appConfiguration, workspaces } from '../../fixtures/session';
import { scenario } from '../../scenario';

/** Who is connected, which workspace is open, the app configuration: what every screen needs. */
export const sessionHandlers = [
  http.get(api('/app-configuration'), () => json(appConfiguration)),

  // The workspace switcher: the open workspace first, then the others the user belongs to.
  http.get(api('/users/:userId/organizations'), ({ request }) => {
    const all = [scenario.workspace, workspaces.default, workspaces.other];
    return collection(all.filter((w, i) => all.findIndex((o) => o.id === w.id) === i), request);
  }),

  // Only the connected user and the known workspaces: other ids fall through to the domain handlers.
  http.get(api('/users/:userId'), ({ params }) =>
    scenario.user && params['userId'] === scenario.user.id ? json(scenario.user) : undefined,
  ),

  http.get(api('/organizations/:organizationId'), ({ params }) => {
    const known = [scenario.workspace, ...Object.values(workspaces)].find((w) => w.id === params['organizationId']);
    return known ? json(known) : undefined;
  }),
];
