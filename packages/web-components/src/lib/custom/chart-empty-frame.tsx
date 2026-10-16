'use client';

import * as React from 'react';
import { LineChart, XAxis, YAxis } from 'recharts';
import { ChartContainer } from '../ui/chart';

export type ChartEmptyFrameProps = {
  dateFormatter: (date: string | Date) => string;
  children?: React.ReactNode;
};

/**
 * Empty-state chart frame: renders the axes only (Y 0/50/100, weekly date
 * ticks ending today) with the empty-state content centered on top.
 */
export function ChartEmptyFrame({
  dateFormatter,
  children,
}: ChartEmptyFrameProps) {
  const placeholderData = React.useMemo(() => {
    const points: { date: string; value: number }[] = [];
    const now = new Date();
    for (let i = 8; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i * 7);
      points.push({ date: dateFormatter(d), value: 0 });
    }
    return points;
  }, [dateFormatter]);

  return (
    <div className="relative h-full w-full">
      <ChartContainer config={{}} className="h-full w-full">
        <LineChart
          data={placeholderData}
          margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
        >
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12 }}
            interval="preserveStartEnd"
            tickMargin={8}
          />
          <YAxis
            domain={[0, 100]}
            ticks={[0, 50, 100]}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12 }}
            width={32}
          />
        </LineChart>
      </ChartContainer>
      <div className="absolute inset-0 flex items-center justify-center px-6">
        {children}
      </div>
    </div>
  );
}
