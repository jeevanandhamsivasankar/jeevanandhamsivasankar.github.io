// UNIT-DATA_PROFILE: content is byte-identical to the baseline.
import { createProfile, createResumePreview } from "../models/index.js";
import { EMAIL, LOCATION, OWNER_NAME, OWNER_TITLE, PHONE } from "../config/site.js";

const hl = (text) => ({ text, mark: "hl" });

export const PROFILE = createProfile({
  name: OWNER_NAME,
  nameParts: { before: "S. ", emphasis: "Jeevanandham", after: "B.ECE" },
  displayName: "S. JEEVANANDHAM",
  title: OWNER_TITLE,
  titleCaps: "SENIOR HMI ENGINEER",
  heroTag: "Senior HMI Engineer · Chennai, India",
  location: LOCATION,
  email: EMAIL,
  phone: PHONE,
  roles: [
    "Qt / QML Developer",
    "Embedded HMI Engineer",
    "UX / UI Engineer",
    "Instrument Cluster Dev",
    "Medical Device HMI Eng",
  ],
  bio: [
    "Senior Software Engineer with ",
    { text: "4.9+ years", mark: "strong" },
    " in Automotive HMI, Infotainment Systems, Instrument Clusters, and Medical Device HMI. Specialising in ",
    { text: "Qt/QML, Embedded C++, and real-time UI engineering", mark: "strong" },
    " across production-grade OEM programs.",
  ],
  badges: ["Qt / QML", "Embedded C++", "LVGL", "CAN Bus", "A-SPICE", "Linux HMI", "SQLite3", "FreeRTOS"],
  gaugeLabel: "⚡ Live HMI Cluster Demo",
  gaugeStats: [
    { num: "4.9+", label: "Yrs Exp", color: "#f59e0b" },
    { num: "8+", label: "Projects", color: "#22d3ee" },
    { num: "2", label: "Domains", color: "#34d399" },
  ],
  stackTags: ["Qt/QML", "LVGL", "C++", "CAN", "UART"],
  profileTags: ["Automotive HMI", "Medical HMI", "Qt/QML", "UX Design"],
  status: "OPEN TO OPPORTUNITIES",
  photo: { src: "/img/profile-600.webp", alt: "S. Jeevanandham", width: 600, height: 900 },
  stats: [
    { icon: "schedule", num: "4.9+", label: "Years Experience", color: "#f59e0b" },
    { icon: "rocket_launch", num: "8+", label: "Projects Shipped", color: "#22d3ee" },
    { icon: "devices", num: "2", label: "Domains — Auto & Med", color: "#34d399" },
    { icon: "code", num: "C++", label: "Primary Language", color: "#a78bfa" },
  ],
  aboutParagraphs: [
    [
      "I'm a ",
      hl("Senior Software Engineer"),
      " with deep expertise in Human Machine Interface development for the ",
      hl("automotive and medical device industries"),
      ". Over 4.9 years, I've shipped production-grade HMIs for instrument clusters, infotainment systems, and medical therapy devices.",
    ],
    [
      "My stack centres on ",
      hl("Qt/QML and Embedded C++"),
      ", complemented by LVGL, Candera CGI Studio, and TouchGFX. I've worked across STM32, i.MX6, i.MX8M, and MIMXRT1170 platforms, building everything from low-level driver integrations to polished, safety-aware UI layers.",
    ],
    [
      "I bring an unusual combination of ",
      hl("engineering rigour and UX design sensibility"),
      " — holding a Google UX Design Professional Certificate and contributing to visual design work across all my projects using Figma and Adobe tooling.",
    ],
    [
      "Experienced in ",
      hl("A-SPICE aligned development"),
      ", Agile execution, CI/CD pipelines, documentation discipline, UART communication frameworks (structured byte framing + CRC), SQLite3 database integration, and Linux-based system development.",
    ],
  ],
});

export const HERO_ROLES = PROFILE.roles;
export const HERO_BADGES = PROFILE.badges;
export const GAUGE_STATS = PROFILE.gaugeStats;
export const GAUGE_STACK_TAGS = PROFILE.stackTags;
export const PROFILE_TAGS = PROFILE.profileTags;
export const STATS = PROFILE.stats;
export const ABOUT_PARAGRAPHS = PROFILE.aboutParagraphs;

export const RESUME_PREVIEW = createResumePreview({
  heading: "Download My Resume",
  intro: "Full details on experience, projects, skills, certifications, and education — available as a PDF for your review or ATS systems.",
  fileLabel: "JEEVANANDHAM_RESUME.PDF",
  name: "S. JEEVANANDHAM",
  roleLine: "SENIOR SOFTWARE ENGINEER – AUTOMOTIVE & MEDICAL HMI | UI/UX | QT/QML | EMBEDDED C++",
  contactRows: [
    { icon: "location_on", text: LOCATION },
    { icon: "mail", text: EMAIL },
    { icon: "phone", text: PHONE },
  ],
  skillsHeading: "KEY SKILLS",
  bars: [
    { label: "Qt / QML", w: "92%", g: "linear-gradient(90deg,#f59e0b,#22d3ee)" },
    { label: "Embedded C++", w: "88%", g: "linear-gradient(90deg,#34d399,#22d3ee)" },
    { label: "LVGL / HMI", w: "85%", g: "linear-gradient(90deg,#a78bfa,#fb7185)" },
    { label: "UX / Figma", w: "78%", g: "linear-gradient(90deg,#fb7185,#f59e0b)" },
  ],
});
