import type { Meta, StoryObj } from '@storybook/react-vite';
import { Checkbox } from './checkbox';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from './field';
import { Input } from './input';
import { RadioGroup, RadioGroupItem } from './radio-group';
import { Switch } from './switch';
import { Textarea } from './textarea';

const ORIENTATIONS = ['vertical', 'horizontal', 'responsive'] as const;

const meta = {
  title: 'Components/UI/Field',
  component: Field,
  parameters: { layout: 'padded' },
  argTypes: { orientation: { control: 'inline-radio', options: ORIENTATIONS } },
  render: (args) => (
    <Field {...args} className="max-w-sm">
      <FieldLabel htmlFor="project-name">Project name</FieldLabel>
      <Input id="project-name" placeholder="Q4 Roadmap" />
      <FieldDescription>Only visible to your team.</FieldDescription>
    </Field>
  ),
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Vertical: Story = {};

export const Horizontal: Story = {
  args: { orientation: 'horizontal' },
  render: (args) => (
    <Field {...args} className="max-w-sm">
      <FieldContent>
        <FieldLabel htmlFor="exclude">Weekly digest</FieldLabel>
        <FieldDescription>A summary of your workspace activity every Monday.</FieldDescription>
      </FieldContent>
      <Switch id="exclude" defaultChecked />
    </Field>
  ),
};

export const Invalid: Story = {
  render: (args) => (
    <Field {...args} data-invalid className="max-w-sm">
      <FieldLabel htmlFor="website-url">Website URL</FieldLabel>
      <Input id="website-url" defaultValue="acme pricing" aria-invalid />
      <FieldError errors={[{ message: 'Enter a full URL, starting with https://' }]} />
    </Field>
  ),
};

export const Disabled: Story = {
  render: (args) => (
    <Field {...args} data-disabled className="max-w-sm">
      <FieldLabel htmlFor="workspace-id">Workspace ID</FieldLabel>
      <Input id="workspace-id" defaultValue="ws_acme_7f3a" disabled />
    </Field>
  ),
};

/** A complete form section: fieldset, legend, groups, choice cards. */
export const FieldSetExample: Story = {
  name: 'Field set',
  render: () => (
    <FieldSet className="max-w-md">
      <FieldLegend>Project</FieldLegend>
      <FieldDescription>How the project is set up and shared.</FieldDescription>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="name">Name</FieldLabel>
          <Input id="name" defaultValue="Q4 Roadmap" />
        </Field>
        <Field>
          <FieldLabel htmlFor="brief">Brief</FieldLabel>
          <Textarea id="brief" placeholder="What is this project about?" />
          <FieldDescription>Shown to everyone who joins the project.</FieldDescription>
        </Field>
        <FieldSeparator>Access</FieldSeparator>
        <RadioGroup defaultValue="members">
          <FieldLabel htmlFor="access-members">
            <Field orientation="horizontal">
              <FieldContent>
                <FieldTitle>Selected members</FieldTitle>
                <FieldDescription>Camille, Hugo, Léa…</FieldDescription>
              </FieldContent>
              <RadioGroupItem value="members" id="access-members" />
            </Field>
          </FieldLabel>
          <FieldLabel htmlFor="access-workspace">
            <Field orientation="horizontal">
              <FieldContent>
                <FieldTitle>Whole workspace</FieldTitle>
                <FieldDescription>Every member of the workspace.</FieldDescription>
              </FieldContent>
              <RadioGroupItem value="workspace" id="access-workspace" />
            </Field>
          </FieldLabel>
        </RadioGroup>
        <Field orientation="horizontal">
          <Checkbox id="notify" defaultChecked />
          <FieldLabel htmlFor="notify">Notify me when someone joins</FieldLabel>
        </Field>
      </FieldGroup>
    </FieldSet>
  ),
};

/** Every orientation. */
export const Matrix: Story = {
  render: (args) => (
    <FieldGroup className="max-w-xl">
      {ORIENTATIONS.map((orientation) => (
        <Field key={orientation} {...args} orientation={orientation}>
          <FieldLabel htmlFor={`domain-${orientation}`}>{orientation}</FieldLabel>
          <Input id={`domain-${orientation}`} defaultValue="acme.com" />
        </Field>
      ))}
    </FieldGroup>
  ),
};
