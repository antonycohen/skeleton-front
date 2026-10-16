export type EmptyChartContentProps = {
  title: string;
  description: string;
};

export function EmptyChartContent({ title, description }: EmptyChartContentProps) {
  return (
    <div className="flex flex-col items-center gap-2 py-4 text-center">
      <div className="text-base font-medium leading-6 text-foreground">{title}</div>
      <div className="text-sm text-muted-foreground">{description}</div>
    </div>
  );
}
