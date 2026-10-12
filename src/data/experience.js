// UNIT-DATA_EXPERIENCE: content is byte-identical to the baseline.
import { createExperience, assertUnique, deepFreeze } from "../models/index.js";

const RAW = [
  {
    icon: "medical_services", role: "Senior Software Engineer",
    company: "PixelExpert Technology & Services Pvt. Ltd.",
    period: "SEP 2024 — JAN 2026", location: "Chennai, Tamil Nadu",
    desc: "Led HMI design & development for a medical physiotherapy laser therapy device — full ownership from UX design through Qt/QML implementation, embedded C++ backend, custom UART framework with CRC validation, and SQLite3 patient database. Safety-aware screen interactions, structured validation, and Linux-based device control integration.",
  },
  {
    icon: "directions_car", role: "Embedded Software Engineer",
    company: "PixelExpert Technology & Services Pvt. Ltd.",
    period: "APR 2022 — AUG 2024", location: "Chennai, Tamil Nadu",
    desc: "Developed automotive Instrument Cluster and Infotainment HMI across multiple OEM programs using Qt/QML, LVGL, Candera CGI Studio, and Embedded C. Worked as HCL external engineer on a SUV infotainment platform delivering Calls, Media, Settings, and Vehicle Stats modules in A-SPICE aligned Jenkins CI/CD environment.",
  },
  {
    icon: "school", role: "Graduate Engineer Trainee",
    company: "PixelExpert Technology & Services Pvt. Ltd.",
    period: "SEP 2021 — MAR 2022", location: "Chennai, Tamil Nadu",
    desc: "Hands-on embedded development training on STM32 — UART, SPI, I²C, GPIO protocols. Built TouchGFX-based Instrument Cluster prototype with speedometer, odometer, alerts, trip metres, and fuel gauge. Foundational training in structured UI graphics and embedded integration.",
  },
  {
    icon: "palette", role: "Graphics Designer Trainee",
    company: "Lapiz Digital Services Pvt. Ltd.",
    period: "MAY 2019 — SEP 2019", location: "Chennai, Tamil Nadu",
    desc: "Internship focused on visual design fundamentals, digital graphics production, and creative tooling across Adobe Creative Suite.",
  },
];

export const EXPERIENCE = deepFreeze(RAW.map(createExperience));
assertUnique(EXPERIENCE.map((e) => e.period), "Experience", "period");
