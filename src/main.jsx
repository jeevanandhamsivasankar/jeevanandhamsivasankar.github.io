import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
import App from "./App.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import { OWNER_NAME, RESUME } from "./config/site.js";

const pageFallback = (
  <div role="alert" className="section-wrap" style={{ textAlign: "center" }}>
    <h1 className="section-title">{OWNER_NAME}</h1>
    <p>Something went wrong while loading this page.</p>
    <button type="button" className="btn btn-outline" onClick={() => window.location.reload()}>
      Reload page
    </button>{" "}
    <a className="btn btn-green" href={RESUME.href} download={RESUME.downloadName}>
      Download resume (PDF)
    </a>
  </div>
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary fallback={pageFallback}>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
