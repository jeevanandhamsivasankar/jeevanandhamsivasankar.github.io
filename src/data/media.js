// Owner-media manifest (US-212). Initially empty: until the owner supplies media and confirms
// publication rights (VISUAL_MEDIA_SPEC 2.6), every slot falls back to the existing SVG art.
// Add items only with rightsConfirmed: true; createMediaItem rejects anything else.
import { createMediaItem, deepFreeze } from "../models/index.js";
import { assertUnique } from "../models/validate.js";

const RAW = [];

export const MEDIA = deepFreeze(RAW.map(createMediaItem));
assertUnique(MEDIA.map((m) => m.id), "MediaItem", "id");

/**
 * Find a manifest item by id (e.g. "project-PROJECT_01", "design-cluster").
 * @param {string} id
 * @returns {Readonly<object> | undefined}
 */
export const getMedia = (id) => MEDIA.find((m) => m.id === id);
