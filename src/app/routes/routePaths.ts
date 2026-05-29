export const routePaths = {
  home: "/",
  tools: "/herramientas",
  toolDetail: "/herramientas/:slug",
  consultations: "/consultas",
  requestTool: "/solicitar-herramienta",
  contact: "/contacto",
  privacy: "/privacidad",
};

export function buildToolPath(slug: string) {
  return `/herramientas/${slug}`;
}
