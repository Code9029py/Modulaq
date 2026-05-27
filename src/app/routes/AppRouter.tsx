import { Navigate, Route, Routes } from "react-router-dom";
import { RootLayout } from "../layout/RootLayout";
import { ContactPage } from "../../pages/Contact/ContactPage";
import { HomePage } from "../../pages/Home/HomePage";
import { NotFoundPage } from "../../pages/NotFound/NotFoundPage";
import { RequestToolPage } from "../../pages/RequestTool/RequestToolPage";
import { ConsultationsPage } from "../../pages/Consultations/ConsultationsPage";
import { ToolDetailPage } from "../../pages/ToolDetail/ToolDetailPage";
import { ToolsCatalogPage } from "../../pages/ToolsCatalog/ToolsCatalogPage";
import { routePaths } from "./routePaths";
import { ScrollToTop } from "./ScrollToTop";

export function AppRouter() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<RootLayout />}>
          <Route path={routePaths.home} element={<HomePage />} />
          <Route path={routePaths.tools} element={<ToolsCatalogPage />} />
          <Route path={routePaths.toolDetail} element={<ToolDetailPage />} />
          <Route path={routePaths.consultations} element={<ConsultationsPage initialType="general" />} />
          <Route path={routePaths.requestTool} element={<RequestToolPage />} />
          <Route path={routePaths.contact} element={<ContactPage />} />
          <Route path="/catalogo" element={<Navigate to={routePaths.tools} replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  );
}
