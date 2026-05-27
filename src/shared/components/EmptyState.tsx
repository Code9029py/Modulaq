type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed border-surface-200 bg-surface-50/70 p-8 text-center">
      <h3 className="text-lg font-semibold text-ink-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink-500">{description}</p>
    </div>
  );
}
