import type { RouteRecord } from "vite-react-ssg";
import { tools } from "../../features/tools/data/tools";
import { getGuidesByLanguage } from "../../features/guides/utils/getGuides";
import { ConsultationsPage } from "../../pages/Consultations/ConsultationsPage";
import { GuideDetailPage } from "../../pages/Guides/GuideDetailPage";
import { GuidesIndexPage } from "../../pages/Guides/GuidesIndexPage";
import { HomePage } from "../../pages/Home/HomePage";
import { NotFoundPage } from "../../pages/NotFound/NotFoundPage";
import { PrivacyPage } from "../../pages/Privacy/PrivacyPage";
import { ToolDetailPage } from "../../pages/ToolDetail/ToolDetailPage";
import { ToolsCatalogPage } from "../../pages/ToolsCatalog/ToolsCatalogPage";
import { RootLayout } from "../layout/RootLayout";

export const routes: RouteRecord[] = [
  {
    path: "/",
    element: <RootLayout />,
    children: [
      // --- Spanish (default) ---
      { index: true, element: <HomePage /> },
      { path: "herramientas", element: <ToolsCatalogPage /> },
      {
        path: "herramientas/:slug",
        element: <ToolDetailPage />,
        getStaticPaths: () => tools.map((tool) => `/herramientas/${tool.slug}`),
      },
      { path: "guias", element: <GuidesIndexPage /> },
      {
        path: "guias/:slug",
        element: <GuideDetailPage />,
        getStaticPaths: () => getGuidesByLanguage("es").map((guide) => `/guias/${guide.slug}`),
      },
      { path: "privacidad", element: <PrivacyPage /> },
      { path: "consultas", element: <ConsultationsPage initialType="general" /> },
      { path: "solicitar-herramienta", element: <ConsultationsPage initialType="tool-request" /> },
      { path: "contacto", element: <ConsultationsPage initialType="general" /> },

      // --- English (/en/*) ---
      { path: "en", element: <HomePage /> },
      { path: "en/tools", element: <ToolsCatalogPage /> },
      {
        path: "en/tools/:slug",
        element: <ToolDetailPage />,
        getStaticPaths: () => tools.map((tool) => `/en/tools/${tool.slugEn ?? tool.slug}`),
      },
      { path: "en/guides", element: <GuidesIndexPage /> },
      {
        path: "en/guides/:slug",
        element: <GuideDetailPage />,
        getStaticPaths: () => getGuidesByLanguage("en").map((guide) => `/en/guides/${guide.slug}`),
      },
      { path: "en/privacy", element: <PrivacyPage /> },
      { path: "en/contact", element: <ConsultationsPage initialType="general" /> },
      { path: "en/request-tool", element: <ConsultationsPage initialType="tool-request" /> },

      { path: "*", element: <NotFoundPage /> },
    ],
  },
];
