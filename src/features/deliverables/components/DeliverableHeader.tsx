interface DeliverableHeaderProps {
  title: string;
  description: string;
}

export function DeliverableHeader({ title, description }: DeliverableHeaderProps) {
  return (
    <div className="border-b border-border pb-5">
      <h2 className="text-h1 truncate text-foreground">{title}</h2>
      <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
