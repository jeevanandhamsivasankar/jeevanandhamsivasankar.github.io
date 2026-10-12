// Single source of site-wide constants (SADS P-12). UNIT-CONFIG_SITE.
export const OWNER_NAME = "S. Jeevanandham";
export const OWNER_TITLE = "Senior HMI Engineer";
export const BRAND_TEXT = "JEEVANANDHAM";
export const LOCATION = "Chennai, Tamil Nadu, India";
export const EMAIL = "jeevanandhamsivashankaran@gmail.com";
export const PHONE = "+91 8111010315";
export const PHONE_HREF = "tel:+918111010315";
export const URLS = Object.freeze({
  linkedin: "https://linkedin.com/in/jeevanandhamsivashankaran/",
  behance: "https://behance.net/s_jeevanandham",
  github: "https://github.com/jeevanandhamsivasankar",
  canonical: "https://jeevanandhamsivasankar.github.io/",
});
export const RESUME = Object.freeze({
  href: "Jeevanandham_Resume.pdf",
  downloadName: "Jeevanandham_SeniorHMIEngineer_Resume.pdf",
  pages: 3,
});
export const THEME_STORAGE_KEY = "jsv-theme-override";
export const FOOTER_TEXT = "© 2026 S. JEEVANANDHAM — SENIOR HMI ENGINEER — BUILT WITH PRECISION";
export const THEME_GEO = Object.freeze({ lat: 13.08, lon: 80.27, tzOffsetHours: 5.5 });

/**
 * Feature flags (US-208). `intro`: ignition intro (FR-MOTION-005), enabled by the owner on 2026-10-12 (Q-S2-2).
 * Plays once per session for <= 1200 ms, skippable, never under reduced motion.
 */
export const SITE = Object.freeze({ intro: true });
