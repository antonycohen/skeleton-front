'use client';

import * as React from 'react';
import { Bar, BarChart, XAxis, YAxis } from 'recharts';
import { cn } from '@skeleton/core-utils';
import { useTranslation } from '@skeleton/core-translations';
import { Card } from '../ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '../ui/chart';
import { ChartEmptyFrame } from './chart-empty-frame';

export type BarChartCardDataPoint = {
  name: string;
  date: string | Date;
  value: number;
};

export type BarChartCardProps = {
  className?: string;
  title?: string;
  description?: string;
  data?: BarChartCardDataPoint[];
  barColor?: string;
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

export function BarChartCard({
  className,
  title,
  description,
  data = [],
  barColor = '#6366F1',
  emptyMessage,
  emptyState,
  dateFormatter = defaultDateFormatter,
  valueFormatter = defaultValueFormatter,
}: BarChartCardProps) {
  const { t } = useTranslation();
  const chartConfig: ChartConfig = {
    value: {
      label: t('components.chart.value'),
      color: barColor,
    },
  };

  const chartData = React.useMemo(() => {
    return data.map((point) => ({
      name: point.name,
      date: dateFormatter(point.date),
      value: point.value,
    }));
  }, [data, dateFormatter]);

  const hasData = chartData.length > 0;

  return (
    <Card
      data-slot="bar-chart-card"
      className={cn('gap-2 overflow-hidden p-0 shadow-none', className)}
    >
      {/* Header */}
      <div className="flex flex-col gap-1.5 px-6 pt-6">
        <h3 className="text-xl font-semibold tracking-tight text-foreground">
          {title ?? t('components.barChart.title')}
        </h3>
        {hasData && description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>

      {/* Chart */}
      <div className="h-[212px] w-full px-2 pb-6">
        {hasData ? (
          <ChartContainer config={chartConfig} className="h-full w-full">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
            >
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
              <Bar
                dataKey="value"
                fill={barColor}
                radius={[2, 2, 0, 0]}
                maxBarSize={8}
              />
            </BarChart>
          </ChartContainer>
        ) : (
          <ChartEmptyFrame dateFormatter={dateFormatter}>
            {emptyState ?? (
              <div className="flex flex-col items-center gap-2 text-center">
                <p className="text-base font-medium text-foreground">
                  {t('components.chart.noDataYet')}
                </p>
                <p className="text-sm text-muted-foreground">{emptyMessage ?? t('components.chart.noData')}</p>
              </div>
            )}
          </ChartEmptyFrame>
        )}
      </div>
    </Card>
  );
}
