import { tools } from "../data/tools";

export function getToolBySlug(slug: string | undefined) {
  if (!slug) {
    return undefined;
  }

  return tools.find((tool) => tool.slug === slug);
}
