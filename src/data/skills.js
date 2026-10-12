// UNIT-DATA_SKILLS: content is byte-identical to the baseline.
import {
  assertUnique,
  createHighlight,
  createSkillCategory,
  deepFreeze,
} from "../models/index.js";

const RAW = [
  {
    label: "Primary Language",
    headerColor: "#f59e0b",
    headerBg: "rgba(245,158,11,0.14)",
    skills: [
      { name: "C++ (C++11–C++17)", icon: "si:cplusplus",  color: "#00599C" },
      { name: "Embedded C",        icon: "ms:code",        color: "#f59e0b" },
      { name: "QML",               icon: "si:qt",          color: "#41CD52" },
      { name: "Lua",               icon: "si:lua",         color: "#000080" },
      { name: "OOP",               icon: "svg:oop",        color: "#f59e0b" },
      { name: "STL",               icon: "svg:stl",        color: "#fb7185" },
      { name: "Smart Pointers",    icon: "svg:smartptr",   color: "#22d3ee" },
      { name: "Bit Manipulation",  icon: "svg:bit",        color: "#a78bfa" },
      { name: "Structures",        icon: "svg:struct",     color: "#34d399" },
    ],
  },
  {
    label: "HMI Frameworks",
    headerColor: "#22d3ee",
    headerBg: "rgba(34,211,238,0.12)",
    skills: [
      { name: "Qt / QML",          icon: "si:qt",          color: "#41CD52" },
      { name: "Qt Widgets",        icon: "si:qt",          color: "#41CD52" },
      { name: "LVGL",              icon: "svg:lvgl",       color: "#00A8E8" },
      { name: "TouchGFX",          icon: "svg:touchgfx",  color: "#22d3ee" },
      { name: "GUI Guider",        icon: "svg:guiguider",  color: "#F4A100" },
      { name: "Crank Storyboard",  icon: "svg:crank",      color: "#E8432B" },
      { name: "Candera CGI Studio",icon: "svg:candera",    color: "#00A3E0" },
      { name: "VG Lite",           icon: "svg:vglite",     color: "#22d3ee" },
      { name: "Qt 3D Studio",      icon: "si:qt",          color: "#41CD52" },
      { name: "Qt Design Studio",  icon: "si:qt",          color: "#41CD52" },
    ],
  },
  {
    label: "Embedded & OS",
    headerColor: "#34d399",
    headerBg: "rgba(52,211,153,0.12)",
    skills: [
      { name: "FreeRTOS",          icon: "svg:freertos",          color: "#34d399" },
      { name: "Embedded Linux",    icon: "si:linux",              color: "#FCC624" },
      { name: "Yocto Project",     icon: "si:yoctoproject",       color: "#9B4F96" },
      { name: "Ubuntu",            icon: "si:ubuntu",             color: "#E95420" },
      { name: "STM32",             icon: "si:stmicroelectronics", color: "#22d3ee" },
      { name: "i.MX6 / i.MX8M",   icon: "svg:nxp",               color: "#F4A100" },
      { name: "MIMXRT1170",        icon: "svg:nxp",               color: "#F4A100" },
    ],
  },
  {
    label: "Communication Interfaces",
    headerColor: "#fb7185",
    headerBg: "rgba(251,113,133,0.12)",
    skills: [
      { name: "UART / CRC",        icon: "svg:uart",      color: "#fb7185" },
      { name: "SPI",               icon: "svg:spi",       color: "#f59e0b" },
      { name: "I²C",               icon: "svg:i2c",       color: "#22d3ee" },
      { name: "CAN Bus",           icon: "svg:can",       color: "#34d399" },
      { name: "GPIO",              icon: "svg:gpio",      color: "#a78bfa" },
    ],
  },
  {
    label: "Tools & DevOps",
    headerColor: "#a78bfa",
    headerBg: "rgba(167,139,250,0.12)",
    skills: [
      { name: "Git",               icon: "si:git",                color: "#F05032" },
      { name: "Plastic SCM",       icon: "svg:plasticscm",        color: "#a78bfa" },
      { name: "Jira",              icon: "si:jira",               color: "#0052CC" },
      { name: "CMake",             icon: "si:cmake",              color: "#22d3ee" },
      { name: "Jenkins",           icon: "si:jenkins",            color: "#D24939" },
      { name: "STM32CubeIDE",      icon: "si:stmicroelectronics", color: "#22d3ee" },
      { name: "MCUXpresso",        icon: "svg:nxp",               color: "#F4A100" },
      { name: "TK Logger",         icon: "svg:tklogger",          color: "#34d399" },
      { name: "Enterprise Architect", icon: "svg:ea",             color: "#a78bfa" },
      { name: "Polarion",          icon: "svg:polarion",          color: "#1798C1" },
    ],
  },
  {
    label: "Testing & Debugging",
    headerColor: "#fb7185",
    headerBg: "rgba(251,113,133,0.10)",
    skills: [
      { name: "GDB",               icon: "svg:gdb",              color: "#fb7185" },
      { name: "DLT Viewer",        icon: "svg:dlt",              color: "#22d3ee" },
      { name: "HIL Testing",       icon: "svg:hil",              color: "#34d399" },
      { name: "ECU Verification",  icon: "svg:ecu",              color: "#f59e0b" },
      { name: "Manual Testing",    icon: "ms:fact_check",        color: "#a78bfa" },
    ],
  },
  {
    label: "Database",
    headerColor: "#34d399",
    headerBg: "rgba(52,211,153,0.12)",
    skills: [
      { name: "SQLite3",           icon: "si:sqlite",     color: "#22d3ee" },
    ],
  },
  {
    label: "Design & UX",
    headerColor: "#f59e0b",
    headerBg: "rgba(245,158,11,0.12)",
    skills: [
      { name: "Figma",             icon: "si:figma",              color: "#F24E1E" },
      { name: "Adobe Illustrator", icon: "si:adobeillustrator",   color: "#FF9A00" },
      { name: "Adobe XD",          icon: "si:adobexd",            color: "#FF61F6" },
      { name: "Photoshop",         icon: "si:adobephotoshop",     color: "#31A8FF" },
      { name: "GIMP",              icon: "si:gimp",               color: "#a78bfa" },
      { name: "FontForge",         icon: "svg:fontforge",         color: "#f59e0b" },
      { name: "Affinity",          icon: "si:affinity",           color: "#1B72BE" },
      { name: "Miro",              icon: "si:miro",               color: "#FFD02F" },
    ],
  },
  {
    label: "Methodologies",
    headerColor: "#22d3ee",
    headerBg: "rgba(34,211,238,0.10)",
    skills: [
      { name: "Agile / Scrum",     icon: "svg:agile",    color: "#22d3ee" },
      { name: "A-SPICE",           icon: "svg:aspice",   color: "#f59e0b" },
      { name: "UML",               icon: "svg:uml",      color: "#a78bfa" },
    ],
  },
];

export const SKILL_CATEGORIES = deepFreeze(RAW.map(createSkillCategory));
assertUnique(SKILL_CATEGORIES.map((c) => c.label), "SkillCategory", "label");

export const SAFETY_HIGHLIGHT = createHighlight({
  title: "ISO 26262 Awareness",
  icon: "verified_user",
  titleIcon: "shield",
  desc: "Safety-oriented HMI behavior with focus on system reliability, deterministic performance, and user-safety considerations. Practical application across automotive HMI projects — safety-aware UI interaction design, structured validation flows, and Functional Safety methodology awareness.",
  chips: ["Safety-Aware UI", "Deterministic Performance", "Structured Validation", "FMEA Awareness", "Fail-Safe Patterns"],
});
