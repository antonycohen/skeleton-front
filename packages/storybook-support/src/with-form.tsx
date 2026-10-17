import { useEffect, type ReactNode } from 'react';
import type { Decorator } from '@storybook/react-vite';
import { FormProvider, useForm } from 'react-hook-form';

/** `parameters.form`: the form's starting values and the errors to show (as if returned by the API). */
export type FormParameters = { defaultValues?: Record<string, unknown>; errors?: Record<string, string> };

/** The input inside a small react-hook-form; the form's values print under it. */
function FormFrame({ defaultValues, errors, children }: FormParameters & { children: ReactNode }) {
  const form = useForm({ defaultValues });
  useEffect(() => {
    Object.entries(errors ?? {}).forEach(([name, message]) => form.setError(name, { type: 'server', message }));
  }, [form, errors]);
  const values = form.watch();
  return (
    <FormProvider {...form}>
      <form className="flex w-[420px] flex-col gap-4" onSubmit={(event) => event.preventDefault()}>
        {children}
        <pre className="rounded-md bg-muted p-3 text-xs text-muted-foreground">{JSON.stringify(values, null, 2)}</pre>
      </form>
    </FormProvider>
  );
}

/** Decorator for controlled inputs (`web-form`): renders the story inside a form set by `parameters.form`. */
export const withForm: Decorator = (Story, { parameters }) => (
  <FormFrame {...(parameters['form'] as FormParameters | undefined)}>
    <Story />
  </FormFrame>
);
