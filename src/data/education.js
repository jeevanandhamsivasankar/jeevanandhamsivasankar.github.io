// UNIT-DATA_EDUCATION: content is byte-identical to the baseline.
import { createEducation, deepFreeze } from "../models/index.js";

export const EDUCATION = deepFreeze([
  createEducation({
    title: "B.E. — Electronics & Communication Engineering",
    subtitle: "Adhiparasakthi College of Engineering (Anna University), Tamil Nadu",
    icon: "school",
    iconColor: "#22d3ee",
    tags: ["2015 – 2020", "CGPA: 6.34 / 10", "ECE"],
    tagVariant: "edu",
  }),
  createEducation({
    title: "Key Domain Expertise",
    subtitle: "4.9+ years of production-grade specialisation in HMI engineering across Automotive and Medical device industries",
    icon: "military_tech",
    iconColor: "#f59e0b",
    tags: ["Automotive HMI", "Medical Device HMI", "Instrument Clusters", "Infotainment", "ADAS / 3D Viz"],
    tagVariant: "domain",
  }),
]);
