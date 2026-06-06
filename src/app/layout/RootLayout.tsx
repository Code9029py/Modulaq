import { Outlet } from "react-router-dom";
import { ToolPrefsProvider } from "../../features/tools/context/ToolPrefsProvider";
import { I18nProvider } from "../../shared/i18n/I18nProvider";
import { ScrollToTop } from "../routes/ScrollToTop";
import { Footer } from "./Footer";
import { Header } from "./Header";

export function RootLayout() {
  return (
    <I18nProvider>
      <ToolPrefsProvider>
        <div className="flex min-h-screen flex-col">
          <ScrollToTop />
          <Header />
          <main className="flex-1">
            <Outlet />
          </main>
          <Footer />
        </div>
      </ToolPrefsProvider>
    </I18nProvider>
  );
}
