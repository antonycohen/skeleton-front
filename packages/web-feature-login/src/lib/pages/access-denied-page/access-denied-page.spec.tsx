import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AccessDeniedPage } from './access-denied-page';

const renderDenied = (search: string) =>
  render(
    <MemoryRouter initialEntries={[`/login/denied${search}`]}>
      <Routes>
        <Route path="/login/denied" element={<AccessDeniedPage />} />
      </Routes>
    </MemoryRouter>
  );

describe('AccessDeniedPage', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_STATIC_ASSETS_URL', 'https://static.example/frontend');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("shows the server's error description and a sign-out link", () => {
    renderDenied('?error=access_denied&error_description=Back-office%20access%20required');

    expect(screen.getByText('You are not authorized to access this application')).toBeTruthy();
    expect(screen.getByText('Back-office access required')).toBeTruthy();
    expect(screen.getByText('Sign out').closest('a')?.getAttribute('href')).toBe('/logout');
    expect(document.querySelector('img')?.getAttribute('src')).toBe(
      'https://static.example/frontend/error-illustration.svg'
    );
  });

  it('describes a failed session set-up itself', () => {
    renderDenied('?error=session_unavailable');

    expect(screen.getByText('Your account could not be loaded for this application.')).toBeTruthy();
  });

  // The callback page settles these on the login; one that lands here anyway must not show the
  // server's token to the person.
  it('says a single sign-on refusal in plain words', () => {
    renderDenied('?error=access_denied&error_description=sso_required');

    expect(
      screen.getByText(
        'This workspace signs its members in through its own identity provider. Sign in there to continue.'
      )
    ).toBeTruthy();

    renderDenied('?error=access_denied&error_description=session_revoked');

    expect(screen.getByText('Your session was ended. Sign in again to continue.')).toBeTruthy();
  });

  it('falls back to a generic description', () => {
    renderDenied('?error=server_error');

    expect(
      screen.getByText('Sign in with an account that has access to this application.')
    ).toBeTruthy();
  });
});
