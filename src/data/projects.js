// UNIT-DATA_PROJECTS: content is byte-identical to the baseline.
import { assertUnique, createProject, deepFreeze } from "../models/index.js";

const RAW = [
  {
    period: "OCT 2024 — JAN 2026", num: "PROJECT_01", domain: "Medical Device",
    icon: "medical_services", color: "#34d399", bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.2)", wide: false,
    title: "Physiotherapy Laser Therapy HMI",
    desc: "Full-ownership HMI for a medical laser therapy device — treatment workflows, safety-aware UI logic, SQLite3 patient records, and a custom UART framework with CRC validation and secure response handling. Linux-based device control integration.",
    tags: ["Qt/QML", "C++", "SQLite3", "UART/CRC", "Linux"],
    line: "linear-gradient(90deg,#34d399,#22d3ee)",
  },
  {
    period: "NOV 2023 — SEP 2024", num: "PROJECT_02", domain: "Automotive",
    icon: "speed", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.2)", wide: false,
    title: "LVGL Cluster — MIMXRT1170",
    desc: "High-performance next-gen instrument cluster using Embedded C, LVGL, and VG Lite on MIMXRT1170 EVKB. ADAS-style visualisation widgets and low-level GPU rendering optimisations for smooth real-time gauge rendering.",
    tags: ["LVGL", "VG Lite", "Embedded C", "MIMXRT1170", "ADAS"],
    line: "linear-gradient(90deg,#f59e0b,#fb7185)",
  },
  {
    period: "MAR 2023 — SEP 2023", num: "PROJECT_03", domain: "Automotive · Infotainment · OEM",
    icon: "radio", color: "#22d3ee", bg: "rgba(34,211,238,0.1)", border: "rgba(34,211,238,0.2)", wide: true,
    title: "SUV In-Vehicle Infotainment System",
    desc: "HMI developer on a production SUV infotainment platform (HCL external assignment). Delivered Calls, Media, Settings, Vehicle Statistics, Steering Controls & Bezel Button modules. Full A-SPICE Agile sprints via Jira, Polarion, Plastic SCM, Jenkins CI/CD. Validation via TK Logger for latency control and reliability assurance.",
    tags: ["Qt/QML", "C++", "Jenkins", "Plastic SCM", "A-SPICE", "Figma Enterprise", "Polarion", "Linux"],
    line: "linear-gradient(90deg,#22d3ee,#a78bfa)",
  },
  {
    period: "NOV 2022 — MAR 2023", num: "PROJECT_04", domain: "Automotive",
    icon: "two_wheeler", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.2)", wide: false,
    title: "Sports Bike Cluster — i.MX6",
    desc: "Advanced cluster on i.MX6 with Qt/QML and Linux. 5-button navigation, theme switching, customisable widgets, structured UART framework, and performance-optimised 2D/2.5D graphical animations.",
    tags: ["Qt/QML", "C++", "i.MX6", "Linux", "SQLite3"],
    line: "linear-gradient(90deg,#f59e0b,#22d3ee)",
  },
  {
    period: "JAN 2022 — SEP 2022", num: "PROJECT_05", domain: "Automotive · OEM (NDA)",
    icon: "two_wheeler", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.2)", wide: false,
    title: "Two-Wheeler OEM Cluster — CGI Studio",
    desc: "Production Instrument Cluster for a leading two-wheeler OEM. State machines, structured UI navigation, core functional workflows with driver readability & safety principles. CMake build and automotive documentation standards.",
    tags: ["Candera CGI Studio", "Lua", "SCML", "CMake", "Photoshop"],
    line: "linear-gradient(90deg,#f59e0b,#fb7185)",
  },
  {
    period: "R&D / INTERNAL", num: "R&D", domain: "Internal · Capability Work",
    icon: "sensors", color: "#a78bfa", bg: "rgba(167,139,250,0.1)", border: "rgba(167,139,250,0.2)", wide: true,
    title: "ADAS 3D Demonstrator & R&D Projects",
    desc: "Collision visualisation and parking assist UI demonstrator built with Qt 3D Studio and Blender on i.MX8M. Includes a TouchGFX-based STM32F469G prototype with speedometer, odometer, trip meters, alerts, and fuel gauge — structured UI graphics and embedded integration for capability development.",
    tags: ["Qt 3D Studio", "Blender", "i.MX8M", "TouchGFX", "STM32F469G", "ADAS"],
    line: "linear-gradient(90deg,#a78bfa,#fb7185)",
  },
];

export const PROJECTS = deepFreeze(RAW.map(createProject));
assertUnique(PROJECTS.map((p) => p.num), "Project", "num");
