import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/** The theme's named text styles (web-themes custom.css, Foundations › Typography). */
const textStyles = [
  'display',
  'heading-xl',
  'heading-lg',
  'heading-md',
  'heading-sm',
  'heading-sm-dense',
  'title-lg',
  'title-lg-dense',
  'title-md',
  'title',
  'title-dense',
  'body-lg',
  'body-lg-dense',
  'body',
  'body-dense',
  'body-sm',
  'body-sm-dense',
  'label-lg',
  'label',
  'label-dense',
  'label-sm',
  'label-sm-dense',
  'code-lg',
  'code',
];

/**
 * A text style sets the family, size, line height, weight and letter spacing at once: passed after
 * them (a component's base classes, then the caller's), it replaces those classes and any other style.
 * A plain `text-xs` passed after a style only changes the size, as before.
 */
const twMerge = extendTailwindMerge<'text-style'>({
  extend: {
    classGroups: { 'text-style': textStyles },
    conflictingClassGroups: {
      'text-style': ['text-style', 'font-size', 'font-weight', 'font-family', 'leading', 'tracking'],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
