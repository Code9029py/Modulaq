import type { RouteRecord } from "vite-react-ssg";
import { tools } from "../../features/tools/data/tools";
import { ConsultationsPage } from "../../pages/Consultations/ConsultationsPage";
import { HomePage } from "../../pages/Home/HomePage";
import { NotFoundPage } from "../../pages/NotFound/NotFoundPage";
import { ToolDetailPage } from "../../pages/ToolDetail/ToolDetailPage";
import { ToolsCatalogPage } from "../../pages/ToolsCatalog/ToolsCatalogPage";
import { RootLayout } from "../layout/RootLayout";

export const routes: RouteRecord[] = [
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "herramientas", element: <ToolsCatalogPage /> },
      {
        path: "herramientas/:slug",
        element: <ToolDetailPage />,
        getStaticPaths: () => tools.map((tool) => `/herramientas/${tool.slug}`),
      },
      { path: "consultas", element: <ConsultationsPage initialType="general" /> },
      { path: "solicitar-herramienta", element: <ConsultationsPage initialType="tool-request" /> },
      { path: "contacto", element: <ConsultationsPage initialType="general" /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
];
