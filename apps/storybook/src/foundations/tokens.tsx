import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Unstyled } from '@storybook/addon-docs/blocks';
// The semantic colours are read from the theme source itself: `@theme inline` maps each utility
// colour to a `--base-*` variable, `:root` gives its light value and `.dark` its dark one.
// The raw source file, not the package (which only exposes the compiled theme).
// eslint-disable-next-line @nx/enforce-module-boundaries
import modeCss from '../../../../packages/web-themes/src/mode.css?raw';

/**
 * Building blocks for the Foundations pages. Every sample is drawn with the real Tailwind utility
 * and its value is read back from the browser, so the pages always show what the theme
 * (`packages/web-themes/src/*.css`) actually produces — nothing is copied by hand.
 * Class names are written out in full on purpose: Tailwind only generates utilities it can find.
 */

/** Keeps the docs page typography (Nunito, margins on every div…) away from the samples. */
function Frame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <Unstyled>
      <div className={`my-6 font-sans text-foreground ${className ?? ''}`}>{children}</div>
    </Unstyled>
  );
}

/** Reads a computed style property of the element once it is mounted (and again when the theme flips). */
function useComputed<T extends HTMLElement>(property: string) {
  const ref = useRef<T>(null);
  const [value, setValue] = useState('');
  useEffect(() => {
    const read = () => ref.current && setValue(getComputedStyle(ref.current).getPropertyValue(property));
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, [property]);
  return [ref, value] as const;
}


const block = (selector: RegExp) => modeCss.match(selector)?.[1] ?? '';
const declarations = (css: string) =>
  Object.fromEntries([...css.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));

const themeBlock = declarations(block(/@theme inline\s*{([\s\S]*?)}/));
const lightVars = declarations(block(/:root\s*{([\s\S]*?)}/));
const darkVars = declarations(block(/\.dark\s*{([\s\S]*?)}/));
const baseOnly = (vars: Record<string, string>) =>
  Object.fromEntries(Object.entries(vars).filter(([name]) => name.startsWith('--base-'))) as CSSProperties;

/** Every semantic colour utility (`bg-primary`, `text-muted-foreground`…) and the variable behind it. */
export const semanticColors = Object.entries(themeBlock)
  .filter(([name, value]) => name.startsWith('--color-') && value.startsWith('var(--base-'))
  .map(([name, value]) => ({ name: name.replace('--color-', ''), base: value.slice(4, -1) }));

function ColorChip({ base }: { base: string }) {
  const [ref, value] = useComputed<HTMLDivElement>('background-color');
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <div ref={ref} className="h-10 rounded-md border border-black/10" style={{ background: `var(${base})` }} />
      <code className="truncate text-[10px] text-muted-foreground" title={value}>{value.trim()}</code>
    </div>
  );
}

/**
 * Each semantic colour in light and dark, side by side whatever the toolbar theme: each column
 * re-declares the `--base-*` variables with that mode's values.
 */
export function ColorTable({ filter }: { filter?: (name: string) => boolean }) {
  const tokens = semanticColors.filter((token) => !filter || filter(token.name));
  return (
    <Frame className="grid gap-2">
      <div className="grid grid-cols-[minmax(160px,1fr)_minmax(120px,180px)_minmax(120px,180px)] gap-4 text-xs font-medium text-muted-foreground">
        <span>Utility colour</span>
        <span>Light</span>
        <span>Dark</span>
      </div>
      {tokens.map((token) => (
        <div key={token.name} className="grid grid-cols-[minmax(160px,1fr)_minmax(120px,180px)_minmax(120px,180px)] items-start gap-4">
          <div className="flex flex-col pt-2">
            <code className="text-sm text-foreground">{token.name}</code>
            <code className="text-[11px] text-muted-foreground">{token.base}</code>
          </div>
          <div className="rounded-lg bg-white p-2" style={baseOnly(lightVars)}>
            <ColorChip base={token.base} />
          </div>
          <div className="rounded-lg bg-neutral-950 p-2" style={{ ...baseOnly(lightVars), ...baseOnly(darkVars) }}>
            <ColorChip base={token.base} />
          </div>
        </div>
      ))}
    </Frame>
  );
}

/** Foreground-on-background pairs, as components use them. */
export function ColorPairs({ pairs }: { pairs: { name: string; className: string }[] }) {
  return (
    <Frame className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {pairs.map((pair) => (
        <div key={pair.name} className={`flex h-20 flex-col justify-between rounded-lg border border-border p-3 ${pair.className}`}>
          <span className="text-sm font-medium">Aa</span>
          <code className="text-[11px] opacity-80">{pair.name}</code>
        </div>
      ))}
    </Frame>
  );
}

function TypeSample({ className, label, sample }: { className: string; label: string; sample: string }) {
  const [ref, size] = useComputed<HTMLSpanElement>('font-size');
  const [lineRef, lineHeight] = useComputed<HTMLSpanElement>('line-height');
  return (
    <div className="grid grid-cols-[120px_120px_1fr] items-baseline gap-4 border-b border-border py-3">
      <code className="font-mono text-xs text-muted-foreground">{label}</code>
      <code className="font-mono text-xs text-muted-foreground">
        {size} / {lineHeight}
      </code>
      <span ref={(el) => { ref.current = el; lineRef.current = el; }} className={`truncate text-foreground ${className}`}>
        {sample}
      </span>
    </div>
  );
}

export function TypeScale({ steps }: { steps: { label: string; className: string }[] }) {
  return (
    <Frame>
      {steps.map((step) => (
        <TypeSample key={step.label} {...step} sample="Ship your SaaS faster" />
      ))}
    </Frame>
  );
}

export function FontFamilies({ families }: { families: { name: string; className: string; usage: string }[] }) {
  return (
    <Frame className="grid gap-4 md:grid-cols-3">
      {families.map((family) => (
        <FamilyCard key={family.name} {...family} />
      ))}
    </Frame>
  );
}

function FamilyCard({ name, className, usage }: { name: string; className: string; usage: string }) {
  const [ref, stack] = useComputed<HTMLDivElement>('font-family');
  return (
    <div className="rounded-xl border border-border bg-card p-5 text-card-foreground">
      <div ref={ref} className={`text-4xl ${className}`}>Aa Gg 123</div>
      <div className="mt-4 text-sm font-medium">{name}</div>
      <code className="text-xs text-muted-foreground">{className}</code>
      <p className="mt-2 text-xs text-muted-foreground">{usage}</p>
      <p className="mt-1 truncate text-[11px] text-muted-foreground" title={stack}>{stack.split(',')[0]}</p>
    </div>
  );
}

export function Weights({ weights }: { weights: { label: string; className: string }[] }) {
  return (
    <Frame className="grid grid-cols-3 gap-3 md:grid-cols-5">
      {weights.map((weight) => (
        <WeightCard key={weight.label} {...weight} />
      ))}
    </Frame>
  );
}

function WeightCard({ label, className }: { label: string; className: string }) {
  const [ref, value] = useComputed<HTMLDivElement>('font-weight');
  return (
    <div className="rounded-lg border border-border p-3">
      <div ref={ref} className={`text-2xl ${className}`}>Aa</div>
      <code className="text-xs text-muted-foreground">{label} · {value}</code>
    </div>
  );
}

export function Radii({ steps }: { steps: { label: string; className: string }[] }) {
  return (
    <Frame className="grid grid-cols-3 gap-4 md:grid-cols-5">
      {steps.map((step) => (
        <RadiusCard key={step.label} {...step} />
      ))}
    </Frame>
  );
}

function RadiusCard({ label, className }: { label: string; className: string }) {
  const [ref, value] = useComputed<HTMLDivElement>('border-top-left-radius');
  return (
    <div className="flex flex-col items-center gap-2">
      <div ref={ref} className={`size-20 border-2 border-primary bg-primary/10 ${className}`} />
      <code className="text-xs text-muted-foreground">{label} · {value}</code>
    </div>
  );
}

export function Shadows({ steps }: { steps: { label: string; className: string }[] }) {
  return (
    <Frame className="grid grid-cols-2 gap-6 rounded-xl bg-muted/40 p-6 md:grid-cols-4">
      {steps.map((step) => (
        <div key={step.label} className="flex flex-col items-center gap-3">
          <div className={`size-24 rounded-lg bg-card ${step.className}`} />
          <code className="text-xs text-muted-foreground">{step.label}</code>
        </div>
      ))}
    </Frame>
  );
}

export function Spacing({ steps }: { steps: { label: string; className: string }[] }) {
  return (
    <Frame className="grid gap-2">
      {steps.map((step) => (
        <SpacingRow key={step.label} {...step} />
      ))}
    </Frame>
  );
}

function SpacingRow({ label, className }: { label: string; className: string }) {
  const [ref, value] = useComputed<HTMLDivElement>('width');
  return (
    <div className="grid grid-cols-[80px_80px_1fr] items-center gap-4">
      <code className="text-xs text-muted-foreground">{label}</code>
      <code className="text-xs text-muted-foreground">{value && `${Math.round(parseFloat(value))}px`}</code>
      <div ref={ref} className={`h-3 rounded-sm bg-primary ${className}`} />
    </div>
  );
}

/** Reads a CSS custom property from :root (layout variables of custom.css). */
export function VariableTable({ variables }: { variables: { name: string; description: string }[] }) {
  const values = useMemo(() => {
    const style = getComputedStyle(document.documentElement);
    return Object.fromEntries(variables.map((v) => [v.name, style.getPropertyValue(v.name).trim()]));
  }, [variables]);
  return (
    <Frame>
      <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-border text-left text-xs text-muted-foreground">
          <th className="py-2 font-medium">Variable</th>
          <th className="py-2 font-medium">Value</th>
          <th className="py-2 font-medium">Usage</th>
        </tr>
      </thead>
      <tbody>
        {variables.map((v) => (
          <tr key={v.name} className="border-b border-border">
            <td className="py-2"><code>{v.name}</code></td>
            <td className="py-2"><code className="text-muted-foreground">{values[v.name] || '—'}</code></td>
            <td className="py-2 text-muted-foreground">{v.description}</td>
          </tr>
        ))}
      </tbody>
      </table>
    </Frame>
  );
}

export function Grid({ children }: { children: ReactNode }) {
  return <Frame className="grid grid-cols-2 gap-4 md:grid-cols-4">{children}</Frame>;
}

export function IconTile({ name, children }: { name: string; children: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-card p-4 text-card-foreground">
      <div className="flex h-10 items-center justify-center [&_svg]:size-8">{children}</div>
      <code className="text-xs text-muted-foreground">{name}</code>
    </div>
  );
}
