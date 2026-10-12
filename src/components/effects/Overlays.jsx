import { Suspense, lazy } from "react";
import { useIntro } from "../../hooks/useIntro.js";
import ThemeIllumination from "./ThemeIllumination.jsx";

const IgnitionIntro = lazy(() => import("./IgnitionIntro.jsx"));

/** Mounts the optional ignition intro (lazy, flag-guarded) and the theme illumination wash. */
export default function Overlays({ introEnabled = false }) {
  const [introOn, endIntro] = useIntro(introEnabled);
  return (
    <>
      {introOn && (
        <Suspense fallback={null}>
          <IgnitionIntro onDone={endIntro} />
        </Suspense>
      )}
      <ThemeIllumination />
    </>
  );
}
