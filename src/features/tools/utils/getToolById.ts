import { tools } from "../data/tools";

export function getToolById(id: string | undefined) {
  if (!id) {
    return undefined;
  }

  return tools.find((tool) => tool.id === id);
}
