import { ViteReactSSG } from "vite-react-ssg";
import { routes } from "./app/routes/routes";
import "./shared/styles/globals.css";

export const createRoot = ViteReactSSG({ routes });
