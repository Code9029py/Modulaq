type SectionHeaderProps = {
  eyebrow?: string;
  headingLevel?: "h1" | "h2";
  title: string;
  description?: string;
};

export function SectionHeader({ eyebrow, headingLevel = "h2", title, description }: SectionHeaderProps) {
  const Title = headingLevel;

  return (
    <div className="max-w-4xl">
      {eyebrow ? <p className="mb-1.5 text-sm font-semibold uppercase tracking-wide text-ink-700">{eyebrow}</p> : null}
      <Title className="text-2xl font-semibold text-ink-900 md:text-3xl">{title}</Title>
      {description ? <p className="mt-2 max-w-5xl text-base leading-7 text-ink-500">{description}</p> : null}
    </div>
  );
}
