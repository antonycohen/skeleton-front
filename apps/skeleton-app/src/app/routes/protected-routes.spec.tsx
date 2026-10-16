import {beforeEach, describe, expect, it, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import {MemoryRouter, Route, Routes, useLocation} from 'react-router-dom';
import {PropsWithChildren} from 'react';
import {ApiError} from '@skeleton/core-api';
import {ProtectedRoutes} from './protected-routes';

const userOrganizations = vi.fn();
const organizationById = vi.fn();

vi.mock('@skeleton/core-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@skeleton/core-api')>()),
  useGetUserOrganizations: () => userOrganizations(),
  useGetOrganizationById: (params: {id: string}) => organizationById(params),
}));

vi.mock('@skeleton/core-store-session', () => ({
  useConnectedUser: () => ({id: 'user-1'}),
}));

vi.mock('@skeleton/web-layout', () => ({
  JobAlertProvider: ({children}: PropsWithChildren) => <>{children}</>,
}));

vi.mock('./workspace-routes', () => ({
  WorkspaceRoutes: () => <p>workspace pages</p>,
}));

const refused = (httpCode: number) =>
  new ApiError({httpCode, statusCode: httpCode, errorCode: 0, error: 'refused', parametersErrors: {}});

const workspaces = (...ids: string[]) => ({data: {data: ids.map((id) => ({id, name: id}))}});

const Location = () => <p data-testid="location">{useLocation().pathname}</p>;

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/w/:organizationId/dispatch" element={<Location />} />
        <Route path="*" element={<ProtectedRoutes />} />
      </Routes>
    </MemoryRouter>,
  );

beforeEach(() => {
  vi.clearAllMocks();
  organizationById.mockReturnValue({data: {id: 'ws-a', name: 'A'}, isFetched: true, error: null});
});

describe('ProtectedRoutes', () => {
  it('tells a person who belongs to no workspace, and lets them sign out, instead of a blank page', () => {
    userOrganizations.mockReturnValue(workspaces());

    renderAt('/w/ws-a/settings/teams');

    expect(screen.getByText("You don't have access to any workspace")).toBeTruthy();
    expect(screen.getByRole('button', {name: 'Sign out'})).toBeTruthy();
  });

  it('opens the workspace of the URL when it is readable', () => {
    userOrganizations.mockReturnValue(workspaces('ws-a', 'ws-b'));

    renderAt('/w/ws-a/settings/teams');

    expect(screen.getByText('workspace pages')).toBeTruthy();
  });

  it.each([403, 404])('sends a person refused a workspace (%s) to another one they still have', (httpCode) => {
    userOrganizations.mockReturnValue(workspaces('ws-a', 'ws-b'));
    organizationById.mockReturnValue({data: undefined, isFetched: true, error: refused(httpCode)});

    renderAt('/w/ws-a/settings/teams');

    expect(screen.getByTestId('location').textContent).toBe('/w/ws-b/dispatch');
  });

  it('tries every listed workspace instead of bouncing between two refused ones', () => {
    userOrganizations.mockReturnValue(workspaces('ws-a', 'ws-b', 'ws-c'));
    organizationById.mockImplementation(({id}: {id: string}) =>
      id === 'ws-c'
        ? {data: {id, name: 'C'}, isFetched: true, error: null}
        : {data: undefined, isFetched: true, error: refused(403)},
    );

    render(
      <MemoryRouter initialEntries={['/w/ws-a/settings/teams']}>
        <ProtectedRoutes />
        <Location />
      </MemoryRouter>,
    );

    expect(screen.getByTestId('location').textContent).toBe('/w/ws-c/dispatch');
    expect(screen.getByText('workspace pages')).toBeTruthy();
  });

  it('tells a person refused every workspace they are listed in', () => {
    userOrganizations.mockReturnValue(workspaces('ws-a', 'ws-b'));
    organizationById.mockReturnValue({data: undefined, isFetched: true, error: refused(403)});

    render(
      <MemoryRouter initialEntries={['/w/ws-a/settings/teams']}>
        <ProtectedRoutes />
      </MemoryRouter>,
    );

    expect(screen.getByText("You don't have access to any workspace")).toBeTruthy();
  });

  it('tells a person refused the only workspace they are listed in', () => {
    userOrganizations.mockReturnValue(workspaces('ws-a'));
    organizationById.mockReturnValue({data: undefined, isFetched: true, error: refused(403)});

    renderAt('/w/ws-a/settings/teams');

    expect(screen.getByText("You don't have access to any workspace")).toBeTruthy();
  });

  it('does not leave a workspace on any other error', () => {
    userOrganizations.mockReturnValue(workspaces('ws-a', 'ws-b'));
    organizationById.mockReturnValue({data: undefined, isFetched: true, error: refused(500)});

    renderAt('/w/ws-a/settings/teams');

    expect(screen.getByText('workspace pages')).toBeTruthy();
  });
});
