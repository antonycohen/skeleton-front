type BreakDownObject<O, R = void> = {
  [K in keyof O as string]: K extends string
    ? R extends string
      ? `${R}.${K}` | ObjectDotNotation<O[K], `${R}.${K}`>
      : K | ObjectDotNotation<O[K], K>
    : never;
};

export type ObjectDotNotation<O, R = void> = string & (O extends string
  ? R extends string
    ? R
    : never
  : BreakDownObject<O, R>[keyof BreakDownObject<O, R>]);
