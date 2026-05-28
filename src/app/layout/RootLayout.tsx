import { Outlet } from "react-router-dom";
import { ScrollToTop } from "../routes/ScrollToTop";
import { Footer } from "./Footer";
import { Header } from "./Header";

export function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
