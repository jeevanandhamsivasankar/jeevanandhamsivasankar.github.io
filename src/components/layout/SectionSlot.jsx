import { Suspense } from "react";
import ErrorBoundary from "../ErrorBoundary.jsx";

function SectionPlaceholder({ id, minHeight }) {
  return <div id={id} data-section={id} data-section-placeholder="" aria-busy="true" style={{ minHeight }} />;
}

function SectionErrorFallback({ id }) {
  return (
    <div id={id} data-section={id} className="section-wrap" role="alert">
      <p>This section failed to load.</p>
      <button type="button" className="btn btn-outline" onClick={() => window.location.reload()}>
        Reload page
      </button>
    </div>
  );
}

export default function SectionSlot({ entry }) {
  const Comp = entry.component;
  const body = <Comp meta={entry} />;
  return (
    <ErrorBoundary key={entry.id} fallback={() => <SectionErrorFallback id={entry.id} />}>
      {entry.lazy ? (
        <Suspense fallback={<SectionPlaceholder id={entry.id} minHeight={entry.minHeight} />}>{body}</Suspense>
      ) : (
        body
      )}
    </ErrorBoundary>
  );
}
