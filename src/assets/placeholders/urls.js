// Dev/preview-only placeholder URLs. Only ever reached through a dynamic import guarded by
// `import.meta.env.DEV` in MediaSlot, so production builds neither emit nor reference these files.
import screenshot from "./placeholder-project-screenshot.webp";
import video from "./placeholder-hmi-demo-video.webp";

export default { screenshot, video };
