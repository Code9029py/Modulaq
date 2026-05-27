export const routePaths = {
  home: "/",
  tools: "/herramientas",
  toolDetail: "/herramientas/:slug",
  consultations: "/consultas",
  requestTool: "/solicitar-herramienta",
  contact: "/contacto",
};

export function buildToolPath(slug: string) {
  return `/herramientas/${slug}`;
}
