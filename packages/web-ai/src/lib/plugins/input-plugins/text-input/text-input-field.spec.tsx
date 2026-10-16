import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { AiChatInputPluginContext } from '../types';

/**
 * VITE_ALLOW_INSECURE_URLS is read when @skeleton/core-api-models loads: each case stubs the
 * environment, then imports a fresh copy of the field (and of the models it relies on).
 */
const renderField = async (allowInsecure: string | undefined) => {
  vi.resetModules();
  vi.stubEnv('VITE_ALLOW_INSECURE_URLS', allowInsecure);
  const { TextInputField } = await import('./text-input-field');
  const sendMessageContent = vi.fn();
  const ctx = { sendMessageContent, isStreaming: false } as unknown as AiChatInputPluginContext;
  render(
    <TextInputField
      payload={{ label: 'Your page', prefix: 'https://', validators: ['url'] }}
      ctx={ctx}
    />,
  );
  const submit = (typed: string) => {
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: typed } });
    fireEvent.keyDown(input, { key: 'Enter' });
  };
  return { submit, sendMessageContent };
};

describe('TextInputField with an https:// prefix (a website address)', () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllEnvs();
  });

  describe('by default', () => {
    it('sends a bare host with https://', async () => {
      const { submit, sendMessageContent } = await renderField(undefined);

      submit('acme.com/pricing');

      expect(sendMessageContent).toHaveBeenCalledWith('https://acme.com/pricing');
    });

    it('does not take an explicit http:// address', async () => {
      const { submit, sendMessageContent } = await renderField(undefined);

      submit('http://acme.com/pricing');

      expect(sendMessageContent).not.toHaveBeenCalled();
      expect(screen.getByText('Please enter a valid URL with a domain')).toBeTruthy();
    });
  });

  describe('on a dev server with VITE_ALLOW_INSECURE_URLS=true', () => {
    it('keeps an explicit http:// the user typed', async () => {
      const { submit, sendMessageContent } = await renderField('true');

      submit('http://test-site.e2e:8080/pricing');

      expect(sendMessageContent).toHaveBeenCalledWith('http://test-site.e2e:8080/pricing');
    });

    it('still sends a bare host with https://', async () => {
      const { submit, sendMessageContent } = await renderField('true');

      submit('acme.com');

      expect(sendMessageContent).toHaveBeenCalledWith('https://acme.com');
    });
  });

  it('keeps https only in a production build, whatever the flag says', async () => {
    vi.stubEnv('DEV', false);
    const { submit, sendMessageContent } = await renderField('true');

    submit('http://acme.com/pricing');

    expect(sendMessageContent).not.toHaveBeenCalled();
  });
});
