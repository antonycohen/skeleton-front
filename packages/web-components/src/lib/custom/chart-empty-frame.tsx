'use client';

import * as React from 'react';

export type ChartEmptyFrameProps = {
  children?: React.ReactNode;
};

/**
 * Empty-state chart frame: the chart's room, its empty-state content centered in it. No axes: dates
 * and values with nothing on them read as a broken chart, and they would be made up (no period has
 * data yet). A period that has data at zero is a chart, not this: a flat line on its real dates.
 */
export function ChartEmptyFrame({ children }: ChartEmptyFrameProps) {
  return <div className="flex h-full w-full items-center justify-center px-6">{children}</div>;
}
