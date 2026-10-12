// UNIT-DATA_DESIGN: content is byte-identical to the baseline (art replaced by artKey).
import { assertUnique, createDesignCard, deepFreeze } from "../models/index.js";
import { URLS } from "../config/site.js";

const RAW = [
  {
    tag: "AUTOMOTIVE", icon: "directions_car", color: "#f59e0b",
    title: "Automotive Instrument Clusters",
    desc: "HMI design work for two-wheeler and four-wheeler instrument clusters — from low-fidelity wireframes to final pixel-perfect UI assets for embedded deployment.",
    wide: false, artKey: "cluster",
  },
  {
    tag: "MEDICAL HMI", icon: "medical_services", color: "#34d399",
    title: "Medical Device HMI Design",
    desc: "UX/UI design for physiotherapy laser therapy control systems — treatment workflows, patient record interfaces, and safety-oriented screen interaction patterns.",
    wide: false, artKey: "medical",
  },
  {
    tag: "INFOTAINMENT · OEM", icon: "radio", color: "#22d3ee",
    title: "Infotainment UI Modules",
    desc: "Design assets and interaction models for SUV infotainment — Calls, Media, Settings, and Vehicle Statistics screens designed in Figma Enterprise for production deployment.",
    wide: true, artKey: "infotainment",
  },
  {
    tag: "MULTI-PLATFORM", icon: "devices", color: "#a78bfa",
    title: "Multi-Platform UI/UX Designs",
    desc: "Adaptive UI/UX design systems spanning desktop, mobile, and embedded display platforms — consistent design language across different form factors and interaction models.",
    wide: false, artKey: "multiplatform",
  },
  {
    tag: "DESIGNER PROFILE", icon: "person", color: "#fb7185",
    title: "Jeevanandham S — Full Design Portfolio",
    desc: "4.9+ years engineering & designing HMI systems across automotive, medical, and embedded platforms. View all projects, case studies, and visual design work on Behance.",
    wide: false, artKey: "profile",
  },
];

export const DESIGN_CARDS = deepFreeze(
  RAW.map((card) => createDesignCard({ ...card, href: URLS.behance })),
);
assertUnique(DESIGN_CARDS.map((c) => c.title), "DesignCard", "title");
