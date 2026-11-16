import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { Organization } from '@skeleton/core-api-models';

const USER_ID = 'a1a1a1a1-0000-4000-8000-000000000001';
const FIRST_ID = 'c0c0c0c0-0000-4000-8000-000000000001';
const SECOND_ID = 'c0c0c0c0-0000-4000-8000-000000000002';

const organization = (overrides: Partial<Organization>) =>
  ({
    type: 'business',
    status: 'active',
    deleteAt: null,
    createdAt: '2026-09-01T10:00:00Z',
    ...overrides,
  }) as Organization;

const WORKSPACES = [
  organization({ id: FIRST_ID, name: 'Globex' }),
  organization({ id: SECOND_ID, name: 'Acme', deleteAt: '2026-12-01T10:00:00Z' }),
];

let response: { data: Organization[]; total: number } = { data: WORKSPACES, total: WORKSPACES.length };
const useGetUserOrganizations = vi.fn();

vi.mock('@skeleton/core-api', () => ({
  useGetUserOrganizations: (...args: unknown[]) => {
    useGetUserOrganizations(...args);
    return {
      data: { data: response.data, pagination: { count: response.total, offset: 0, limit: 10 } },
      error: null,
      isPending: false,
    };
  },
}));

const { UserWorkspacesSection } = await import('./user-workspaces-section');

const renderSection = () =>
  render(
    <MemoryRouter initialEntries={[`/users/${USER_ID}`]}>
      <Routes>
        <Route path="/users/:userId" element={<UserWorkspacesSection userId={USER_ID} />} />
      </Routes>
    </MemoryRouter>,
  );

beforeEach(() => {
  vi.clearAllMocks();
  response = { data: WORKSPACES, total: WORKSPACES.length };
});

describe('UserWorkspacesSection', () => {
  it("reads the user's own workspaces, sorted by name", () => {
    renderSection();

    const [params] = useGetUserOrganizations.mock.calls[0] as [
      { staticParams: { userId: string }; sort?: { field: string; direction: string } },
    ];
    expect(params.staticParams).toEqual({ userId: USER_ID });
    expect(params.sort).toEqual({ field: 'name', direction: 'asc' });
  });

  it('links every workspace to its back office page and shows its status', () => {
    renderSection();

    const globexLink = screen.getByRole('link', { name: 'Globex' });
    expect(globexLink.getAttribute('href')).toBe(`/workspaces/${FIRST_ID}`);
    expect(within(globexLink.closest('tr') as HTMLElement).getByText('Active')).toBeTruthy();

    const acmeRow = screen.getByRole('link', { name: 'Acme' }).closest('tr') as HTMLElement;
    expect(within(acmeRow).getByText('Deletion pending')).toBeTruthy();
  });

  it('says so when the user belongs to no workspace', () => {
    response = { data: [], total: 0 };
    renderSection();

    expect(screen.getByText('This person is not a member of any workspace.')).toBeTruthy();
    expect(screen.queryByRole('table')).toBeNull();
  });
});
