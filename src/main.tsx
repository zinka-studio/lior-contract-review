import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Self-hosted fonts — Hebrew subset first (priority), then full latin
import "@fontsource/frank-ruhl-libre/hebrew-300.css";
import "@fontsource/frank-ruhl-libre/hebrew-400.css";
import "@fontsource/frank-ruhl-libre/hebrew-500.css";
import "@fontsource/frank-ruhl-libre/hebrew-700.css";
import "@fontsource/frank-ruhl-libre/hebrew-900.css";
import "@fontsource/rubik/hebrew-300.css";
import "@fontsource/rubik/hebrew-400.css";
import "@fontsource/rubik/hebrew-500.css";
import "@fontsource/rubik/hebrew-600.css";
import "@fontsource/rubik/hebrew-700.css";

createRoot(document.getElementById("root")!).render(<App />);
