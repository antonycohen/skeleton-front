import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReadQuota } from '@skeleton/core-api-models';
import { PaywallAlert } from './paywall-alert';

const renderAlert = (reason: string) =>
  render(
    <PaywallAlert
      hashParams={{ reason, quota: 'seats' }}
      // As usePaywallHash classifies them
      isQuotaExceeded={reason === 'quota_exceeded'}
      quota={{ featureKey: 'seats', feature: null, remainingQuota: 0 } as unknown as ReadQuota}
    />,
  );

// Only the destructive alert has role="alert", the other tones are role="status": find it by its slot.
const alert = () => document.querySelector('[data-slot="alert"]');
// The tone comes from the Alert variant, whose colours are a recipe, not Tailwind classes.
const alertVariant = () => alert()?.getAttribute('data-variant');

describe('PaywallAlert', () => {
  // A feature of another plan is offered, not refused: never in the red of an error.
  it.each(['sso', 'role'])('shows the %s upsell as information, in the brand colour', (reason) => {
    renderAlert(reason);

    expect(alertVariant()).toBe('important');
  });

  it('names the Enterprise feature on the single sign-on upsell', () => {
    renderAlert('sso');

    expect(screen.getByText('Single sign-on is an Enterprise feature')).toBeTruthy();
  });

  it('keeps an exhausted quota in red: it blocks what the workspace was doing', () => {
    renderAlert('quota_exceeded');

    expect(screen.getByText('You have reached your seats limit')).toBeTruthy();
    expect(alertVariant()).toBe('destructive');
  });

  it('shows nothing for an unknown reason', () => {
    const { container } = renderAlert('something-else');

    expect(container.firstChild).toBeNull();
  });
});
