import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter, Route, Routes } from "react-router";
import { ThemeProvider } from "./components/theme-provider.tsx";
import WarpDisplay from "./WarpDisplay.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider forcedTheme="dark" storageKey="vite-ui-theme">
        <a href="https://github.com/EnderKill98/perf-test-pwarps" className="absolute top-0 right-0">
          <img
            id="github-corner"
            src="https://raw.githubusercontent.com/tholman/github-corners/a86239c4ad0c3079d365520d924a826a4b9a30b7/svg/github-corner-right.svg"
          />
        </a>

        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/warp/:warpName" element={<WarpDisplay />} />
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);
