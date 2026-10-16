import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

const openPaywall = vi.fn();

vi.mock('@skeleton/web-feature-payment', () => ({
  useOpenPaywall: () => ({ openPaywall }),
}));

const { SsoUpsellCard } = await import('./sso-upsell-card');

describe('SsoUpsellCard', () => {
  it('opens the paywall on the single sign-on reason', () => {
    render(<SsoUpsellCard />);

    expect(screen.getByText('Enterprise')).toBeTruthy();
    fireEvent.click(screen.getByText('Talk to sales'));

    expect(openPaywall).toHaveBeenCalledWith('sso');
  });
});
