import { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import {
  SAML_ATTRIBUTE_PRESETS,
  SsoSamlConnectionFormValues,
} from '@skeleton/core-api-models';
import { SsoSamlFields } from './sso-saml-fields';

// The form holds Radix selects, which measure themselves through an API jsdom has not.
class ResizeObserverStub {
  observe(): void {/* nothing reacts to a resize in these tests */}
  unobserve(): void {/* nothing was observed */}
  disconnect(): void {/* nothing was observed */}
}

const EMPTY: SsoSamlConnectionFormValues = {
  protocol: 'saml',
  source: 'metadata_url',
  idpMetadataUrl: '',
  idpMetadataXml: '',
  idpEntityId: '',
  idpSsoUrl: '',
  idpCertificate: '',
  idpSsoBinding: 'redirect',
  allowIdpInitiated: false,
  attributeEmail: '',
  attributeGivenName: '',
  attributeFamilyName: '',
  hasRegisteredCertificate: false,
};

let formValues: SsoSamlConnectionFormValues = EMPTY;

const Harness = ({
  initial,
  children,
}: {
  initial: Partial<SsoSamlConnectionFormValues>;
  children: ReactNode;
}) => {
  const form = useForm<SsoSamlConnectionFormValues>({
    defaultValues: { ...EMPTY, ...initial },
  });
  formValues = form.watch();

  return <FormProvider {...form}>{children}</FormProvider>;
};

const renderFields = (initial: Partial<SsoSamlConnectionFormValues> = {}) =>
  render(
    <Harness initial={initial}>
      <SsoSamlFields />
    </Harness>,
  );

beforeEach(() => {
  vi.clearAllMocks();
  formValues = EMPTY;
  (globalThis as { ResizeObserver?: unknown }).ResizeObserver = ResizeObserverStub;
});

describe('SsoSamlFields', () => {
  // The API takes exactly one of the three descriptions, so only one is ever asked for.
  it('asks for the metadata address, and nothing else, on the first source', () => {
    renderFields();

    expect(screen.getByText(/Read once when you save it, then watched/)).toBeTruthy();
    expect(screen.queryByText('Choose a file')).toBeNull();
    expect(screen.queryByText('Identity provider entity ID')).toBeNull();
    expect(screen.queryByText('Signing certificate')).toBeNull();
  });

  it('asks for the document when the admin has one to paste', () => {
    renderFields({ source: 'metadata_xml' });

    expect(screen.getByText(/Read once and not stored/)).toBeTruthy();
    expect(screen.getByText('Choose a file')).toBeTruthy();
    expect(screen.queryByText('Identity provider entity ID')).toBeNull();
  });

  it('asks for the three values by hand, certificate included', () => {
    renderFields({ source: 'manual' });

    expect(screen.getByText('Identity provider entity ID')).toBeTruthy();
    expect(screen.getByText('Sign-on URL')).toBeTruthy();
    expect(screen.getByText('Signing certificate')).toBeTruthy();
    expect(screen.queryByText(/Read once and not stored/)).toBeNull();
  });

  it('switches the fields when another source is picked', () => {
    renderFields();

    fireEvent.click(screen.getByRole('radio', { name: 'By hand' }));

    expect(formValues.source).toBe('manual');
    expect(screen.getByText('Identity provider entity ID')).toBeTruthy();
  });

  it('always asks for the attribute names and the identity-provider-initiated choice', () => {
    renderFields();

    expect(screen.getByText('Attribute names')).toBeTruthy();
    expect(
      screen.getByText('Allow sign-in started from the identity provider'),
    ).toBeTruthy();
  });

  // Reading a metadata document sets the binding from what it announces: a control beside it would
  // promise what it cannot keep, so the metadata modes only report it.
  it('offers the binding as a choice by hand, and as a statement otherwise', () => {
    renderFields({ source: 'manual' });
    expect(screen.getByText(/Redirect suits every common provider/)).toBeTruthy();

    renderFields({ source: 'metadata_url', idpSsoBinding: 'post' });
    expect(screen.getByText(/POST, from your provider's metadata/)).toBeTruthy();
  });

  it('shows the preset the stored attribute names are', () => {
    renderFields(SAML_ATTRIBUTE_PRESETS.entra.values);

    expect(screen.getByText('Microsoft Entra ID')).toBeTruthy();
  });

  it('says the names are custom when they are nobody preset', () => {
    renderFields({ attributeEmail: 'mail' });

    expect(screen.getByText('Custom')).toBeTruthy();
  });

  // The API's trust-continuity rule (SsoCertificateService.afterChange): the status stands while a
  // certificate that was valid before a change is still registered after it.
  it('says an added certificate keeps the status, and only losing every valid one returns to draft', () => {
    renderFields();

    const notice = screen.getByText(/sends the connection back to draft/);
    expect(notice.textContent).toContain('adding one keeps the status');
    expect(notice.textContent).toContain('leaves none of the previously valid certificates');
    expect(notice.textContent).not.toMatch(/or the certificates sends/);
  });
});
