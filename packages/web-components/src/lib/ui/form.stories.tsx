import { useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from './button';
import { Checkbox } from './checkbox';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from './form';
import { Input } from './input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

const schema = z.object({
  name: z.string().min(3, 'At least 3 characters.'),
  websiteUrl: z.url('Enter a full URL, starting with https://'),
  team: z.string().min(1, 'Choose a team.'),
  notifyMembers: z.boolean(),
});

type Values = z.infer<typeof schema>;

const EMPTY: Values = { name: '', websiteUrl: '', team: '', notifyMembers: true };

function ProjectForm({ defaultValues, onSubmit, validateOnMount }: {
  defaultValues: Values;
  onSubmit: (values: Values) => void;
  validateOnMount?: boolean;
}) {
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues });
  useEffect(() => {
    if (validateOnMount) void form.trigger();
  }, [form, validateOnMount]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-96 flex-col gap-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project name</FormLabel>
              <FormControl><Input placeholder="Q4 Roadmap" {...field} /></FormControl>
              <FormDescription>Only visible to your team.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="websiteUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website URL</FormLabel>
              <FormControl><Input placeholder="https://acme.com" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="team"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Team</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Choose a team" /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="product">Product (Camille, Hugo, Léa)</SelectItem>
                  <SelectItem value="success">Customer Success – EMEA</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notifyMembers"
          render={({ field }) => (
            <FormItem className="flex items-center gap-2">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(checked === true)} />
              </FormControl>
              <FormLabel>Notify the team's members</FormLabel>
            </FormItem>
          )}
        />
        <Button type="submit" className="self-start">Create project</Button>
      </form>
    </Form>
  );
}

const meta = {
  title: 'Components/UI/Form',
  component: ProjectForm,
  parameters: { layout: 'centered' },
  args: { defaultValues: EMPTY, onSubmit: fn() },
} satisfies Meta<typeof ProjectForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/** react-hook-form + zod; submit with empty fields to see the messages. */
export const Default: Story = {};

export const Filled: Story = {
  args: {
    defaultValues: {
      name: 'Q4 Roadmap',
      websiteUrl: 'https://acme.com',
      team: 'product',
      notifyMembers: true,
    },
  },
};

/** Validated on mount: every message shows. */
export const WithErrors: Story = {
  args: { defaultValues: { ...EMPTY, name: 'Q4', websiteUrl: 'acme pricing' }, validateOnMount: true },
};
