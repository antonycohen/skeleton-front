import { useState } from 'react';
import { ChevronRight, Layers, Megaphone, MessageSquare } from 'lucide-react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { BadgeStatus } from './badge-status';
import { TreeList, TreeListHeader, TreeListItem } from './tree-list';

/**
 * A tree of selectable rows (projects, their sections, their tasks…). **Expandable**: a
 * row with a chevron, on the subtle background at the top level or the card one below; the checkbox
 * mirrors the selection, and a checked row is tinted. **Leaf**: a row without children, nested under
 * an expandable one. With a `TreeListHeader` and `columns`, it reads like a table: an icon per level,
 * a second line, and the status and meta lined up under their titles.
 */
const meta = {
  title: 'Components/Custom/TreeList',
  component: TreeListItem,
  parameters: { layout: 'padded' },
  render: (args) => (
    <TreeList className="max-w-[512px]">
      <TreeListItem {...args} />
    </TreeList>
  ),
  args: {
    variant: 'subtle',
    label: 'Pricing — Search',
    expanded: false,
    checked: true,
    meta: '4 of 4 selected',
    onExpandedChange: fn(),
    onCheckedChange: fn(),
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['default', 'subtle'] },
    checked: { control: 'inline-radio', options: [true, false, 'indeterminate'] },
  },
} satisfies Meta<typeof TreeListItem>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Expandable, top level (subtle), collapsed and selected. */
export const Expandable: Story = {};

export const ExpandableExpanded: Story = { name: 'Expandable — Expanded', args: { expanded: true } };

export const ExpandableNotSelected: Story = { name: 'Expandable — Not selected', args: { checked: false } };

/** Expandable, nested: the card background. */
export const Nested: Story = { args: { variant: 'default', label: 'Onboarding', meta: '1,410 tasks' } };

/** With the status slot. */
export const WithStatus: Story = {
  args: { variant: 'default', label: 'Onboarding', meta: '1,410 tasks', status: <BadgeStatus variant="primary">New</BadgeStatus> },
};

/** Leaf: a row without children, no chevron. */
export const Leaf: Story = {
  args: { variant: 'default', label: 'payroll cost', expanded: undefined, onExpandedChange: undefined, meta: '520 tasks' },
};

/** Every variant: Expanded × Selection × Variant, then the two leaves. */
export const Matrix: Story = {
  render: () => (
    <div className="flex max-w-[512px] flex-col gap-3">
      {(['subtle', 'default'] as const).flatMap((variant) =>
        [true, false].flatMap((checked) =>
          [false, true].map((expanded) => (
            <TreeList key={`${variant}-${checked}-${expanded}`}>
              <TreeListItem variant={variant} label="Pricing — Search" expanded={expanded} checked={checked} meta="4 of 4 selected" onCheckedChange={fn()} />
            </TreeList>
          )),
        ),
      )}
      {[true, false].map((checked) => (
        <TreeList key={`item-${checked}`}>
          <TreeListItem label="Pricing — Search" checked={checked} meta="4 of 4 selected" onCheckedChange={fn()} />
        </TreeList>
      ))}
    </div>
  ),
};

/** Three levels (a project, its sections, their tasks), nested with guides. Check, uncheck, expand. */
export const Tree: Story = {
  render: function Render() {
    const [open, setOpen] = useState<Set<string>>(new Set(['campaign', 'group']));
    const [checked, setChecked] = useState<Set<string>>(new Set(['group', 'kw-1']));
    const toggle = (set: Set<string>, id: string, on: boolean) => {
      const next = new Set(set);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    };
    const own = (id: string, fallback: string) =>
      checked.has(id) ? <BadgeStatus variant="primary">New</BadgeStatus> : fallback;
    return (
      <TreeList className="max-w-[640px]">
        <TreeListItem
          variant="subtle"
          label="Pricing — Search"
          expanded={open.has('campaign')}
          onExpandedChange={(on) => setOpen(toggle(open, 'campaign', on))}
          checked={checked.has('campaign')}
          onCheckedChange={(on) => setChecked(toggle(checked, 'campaign', on))}
          meta="2 sections"
        />
        {open.has('campaign') && (
          <>
            <TreeListItem
              depth={1}
              label="Onboarding"
              expanded={open.has('group')}
              onExpandedChange={(on) => setOpen(toggle(open, 'group', on))}
              checked={checked.has('group')}
              onCheckedChange={(on) => setChecked(toggle(checked, 'group', on))}
              status={own('group', 'Unchanged')}
              meta="1,410 tasks"
            />
            {open.has('group') &&
              ['payroll cost', 'payroll pricing'].map((keyword, index) => (
                <TreeListItem
                  key={keyword}
                  depth={2}
                  label={keyword}
                  checked={checked.has(`kw-${index + 1}`)}
                  onCheckedChange={(on) => setChecked(toggle(checked, `kw-${index + 1}`, on))}
                  status={own(`kw-${index + 1}`, 'Uses template')}
                  meta={index ? '380 tasks' : '520 tasks'}
                />
              ))}
            <TreeListItem depth={1} label="Free trial" expanded={false} checked={false} onCheckedChange={fn()} status="Unchanged" meta="470 tasks" />
          </>
        )}
      </TreeList>
    );
  },
};

/**
 * With a header and columns: a glyph per level (the header's legend spells them out), a second line
 * under each label, the status and the meta lined up under their titles. Check, uncheck, expand —
 * and sweep (`onSweep`): Shift + click, or drag with the mouse, over rows of one level.
 */
export const WithHeader: Story = {
  render: function Render() {
    const [open, setOpen] = useState<Set<string>>(new Set(['campaign', 'group']));
    const [checked, setChecked] = useState<Set<string>>(new Set(['group', 'ad-1']));
    const toggle = (set: Set<string>, id: string, on: boolean) => {
      const next = new Set(set);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    };
    const status = (id: string, fallback: string) =>
      checked.has(id) ? (
        <BadgeStatus variant="primary" appearance="plain">
          New
        </BadgeStatus>
      ) : (
        <BadgeStatus variant="neutral" appearance="plain">
          {fallback}
        </BadgeStatus>
      );
    return (
      <TreeList
        className="max-w-[640px]"
        columns
        onSweep={(ids, on) =>
          setChecked((current) => {
            let next = new Set(current);
            for (const id of ids) next = toggle(next, id, on);
            return next;
          })
        }
      >
        <TreeListHeader
          label={
            <>
              <Megaphone /> Project <ChevronRight className="text-muted-foreground/60" /> <Layers /> Section{' '}
              <ChevronRight className="text-muted-foreground/60" /> <MessageSquare /> Ad
            </>
          }
          status="Variant"
          meta="Clicks"
        />
        <TreeListItem
          value="campaign"
          variant="subtle"
          icon={<Megaphone />}
          label="Payroll — US"
          description="Tasks · 2 sections"
          expanded={open.has('campaign')}
          onExpandedChange={(on) => setOpen(toggle(open, 'campaign', on))}
          checked={checked.has('campaign')}
          onCheckedChange={(on) => setChecked(toggle(checked, 'campaign', on))}
          status={status('campaign', 'Unchanged')}
          meta="600"
        />
        {open.has('campaign') && (
          <>
            <TreeListItem
              value="group"
              depth={1}
              icon={<Layers />}
              label="Billing"
              description="How much payroll software costs · +1 hint"
              expanded={open.has('group')}
              onExpandedChange={(on) => setOpen(toggle(open, 'group', on))}
              checked={checked.has('group')}
              onCheckedChange={(on) => setChecked(toggle(checked, 'group', on))}
              status={status('group', 'Unchanged')}
              meta="420"
            />
            {open.has('group') &&
              [
                ['ad-1', 'Payroll from $6 per employee', 'One price per employee, taxes and filings included.', '260'],
                ['ad-2', 'See what Acme payroll costs', 'Transparent pricing for teams of every size.', '160'],
              ].map(([id, title, body, tasks]) => (
                <TreeListItem
                  key={id}
                  value={id}
                  depth={2}
                  icon={<MessageSquare />}
                  label={title}
                  description={body}
                  checked={checked.has(id)}
                  onCheckedChange={(on) => setChecked(toggle(checked, id, on))}
                  status={status(id, 'Uses template')}
                  meta={tasks}
                />
              ))}
            <TreeListItem
              value="budget"
              depth={1}
              icon={<Layers />}
              label="Budget"
              description="Budgeting for payroll and HR tools"
              expanded={false}
              checked={checked.has('budget')}
              onCheckedChange={(on) => setChecked(toggle(checked, 'budget', on))}
              status={status('budget', 'Unchanged')}
              meta="180"
            />
          </>
        )}
      </TreeList>
    );
  },
};
