export type EmptyChartContentProps = {
  title: string;
  description: string;
};

export function EmptyChartContent({ title, description }: EmptyChartContentProps) {
  return (
    <div className="flex flex-col items-center gap-1 py-4 text-center">
      <div className="title text-foreground">{title}</div>
      <div className="body text-muted-foreground">{description}</div>
    </div>
  );
}
