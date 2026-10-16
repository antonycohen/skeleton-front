'use client';

import * as React from 'react';
import { Line, LineChart, XAxis, YAxis, CartesianGrid } from 'recharts';
import { cn } from '@skeleton/core-utils';
import { useTranslation } from '@skeleton/core-translations';
import { Card } from '../ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '../ui/chart';
import { ChartEmptyFrame } from './chart-empty-frame';

export type LineChartCardSeries = {
  key: string;
  label: string;
  color: string;
};

export type LineChartCardDataPoint = {
  date: string | Date;
  [key: string]: string | number | Date;
};

export type LineChartCardProps = {
  className?: string;
  headerIcon?: React.ReactNode;
  headerLabel?: string;
  title?: string;
  description?: string;
  data?: LineChartCardDataPoint[];
  series?: LineChartCardSeries[];
  emptyMessage?: string;
  emptyState?: React.ReactNode;
  dateFormatter?: (date: string | Date) => string;
  valueFormatter?: (value: number) => string;
};

const defaultDateFormatter = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const defaultValueFormatter = (value: number): string => {
  return value.toLocaleString();
};

export function LineChartCard({
  className,
  headerIcon,
  headerLabel,
  title,
  description,
  data = [],
  series = [],
  emptyMessage,
  emptyState,
  dateFormatter = defaultDateFormatter,
  valueFormatter = defaultValueFormatter,
}: LineChartCardProps) {
  const { t } = useTranslation();
  const chartConfig: ChartConfig = Object.fromEntries(
    series.map((s) => [s.key, { label: s.label, color: s.color }])
  );

  const chartData = React.useMemo(() => {
    return data.map((point) => ({
      ...point,
      date: dateFormatter(point.date),
    }));
  }, [data, dateFormatter]);

  const hasData = chartData.length > 0;

  return (
    <Card
      data-slot="line-chart-card"
      className={cn('gap-0 overflow-hidden p-0', className)}
    >
      {/* Header bar */}
      {headerLabel && (
        <div className="flex items-center gap-1.5 border-b border-border px-3 py-2.5">
          {headerIcon && (
            <div className="flex size-4 items-center justify-center text-foreground">
              {headerIcon}
            </div>
          )}
          <span className="text-sm text-muted-foreground">{headerLabel}</span>
        </div>
      )}

      {/* Title section */}
      <div className="flex flex-col gap-1.5 px-6 pt-6">
        <h3 className="text-xl font-semibold tracking-tight text-foreground">
          {title ?? t('components.lineChart.title')}
        </h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>

      {/* Chart */}
      <div className="h-[264px] w-full px-2 pb-4 pt-4">
        {hasData ? (
          <ChartContainer config={chartConfig} className="h-full w-full">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
                tickMargin={8}
              />
              <YAxis hide />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => (
                      <span className="font-medium">
                        {valueFormatter(value as number)}
                      </span>
                    )}
                  />
                }
              />
              {series.map((s) => (
                <Line
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  stroke={s.color}
                  strokeWidth={2}
                  dot={{ r: 4, fill: s.color, strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
              ))}
              <ChartLegend content={<ChartLegendContent />} />
            </LineChart>
          </ChartContainer>
        ) : (
          <ChartEmptyFrame dateFormatter={dateFormatter}>
            {emptyState ?? (
              <p className="text-sm text-muted-foreground">{emptyMessage ?? t('components.chart.noData')}</p>
            )}
          </ChartEmptyFrame>
        )}
      </div>
    </Card>
  );
}
