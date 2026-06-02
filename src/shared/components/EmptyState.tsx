type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-surface-200/80 bg-surface-50/90 p-8 text-center shadow-sm ring-1 ring-surface-50/80 backdrop-blur">
      <h3 className="text-lg font-semibold text-ink-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink-500">{description}</p>
    </div>
  );
}
