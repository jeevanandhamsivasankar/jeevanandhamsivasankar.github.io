// Section Registry (UNIT-CONFIG_SECTIONS): order, nav membership, labels, loading strategy.
import { lazy } from "react";
import { createSection } from "../models/createModels.js";
import { assertUnique } from "../models/validate.js";
import Hero from "../sections/Hero.jsx";

const About = lazy(() => import("../sections/About.jsx"));
const Experience = lazy(() => import("../sections/Experience.jsx"));
const Skills = lazy(() => import("../sections/Skills.jsx"));
const Projects = lazy(() => import("../sections/Projects.jsx"));
const Design = lazy(() => import("../sections/Design.jsx"));
const Education = lazy(() => import("../sections/Education.jsx"));
const Certifications = lazy(() => import("../sections/Certifications.jsx"));
const Resume = lazy(() => import("../sections/Resume.jsx"));
const Contact = lazy(() => import("../sections/Contact.jsx"));

/**
 * Builds the frozen registry: numbers headed entries 01.. and derives labelText.
 * @param {ReadonlyArray<object>} raw entries without `number` and `labelText`
 * @returns {ReadonlyArray<import("../models/types.js").SectionEntry>}
 */
export function defineSections(raw) {
  let n = 0;
  const entries = raw.map((entry) => {
    let number = null;
    let labelText = null;
    if (entry.heading !== null && entry.heading !== undefined) {
      n += 1;
      number = String(n).padStart(2, "0");
      labelText = `${number} — ${entry.heading}`;
    }
    return createSection({ ...entry, number, labelText });
  });
  assertUnique(entries.map((e) => e.id), "Section", "id");
  return Object.freeze(entries);
}

const nav = (id, component, label, heading, icon, title, minHeight) => ({
  id, component, lazy: true, showInNav: true, label, heading, icon, title, minHeight,
});

export const SECTIONS = defineSections([
  { id: "hero", component: Hero, lazy: false, showInNav: false, label: null, heading: null, icon: null, title: null, minHeight: 0 },
  nav("about", About, "About", "About", "person", "Who I Am", 900),
  nav("experience", Experience, "Experience", "Experience", "work", "Career", 1400),
  nav("skills", Skills, "Skills", "Skills", "build", "Toolbox", 1700),
  nav("projects", Projects, "Projects", "Engineering Projects", "rocket_launch", "Selected Work", 1500),
  nav("design", Design, "Design", "Design Portfolio", "brush", "Creative Work", 1100),
  nav("education", Education, "Education", "Education", "school", "Academic Background", 600),
  nav("certifications", Certifications, "Certs", "Certifications", "verified", "Credentials", 500),
  nav("resume", Resume, "Resume", "Resume", "description", null, 750),
  nav("contact", Contact, "Contact", "Contact", "mail", "Let's Work Together", 500),
]);

export const NAV_ITEMS = Object.freeze(SECTIONS.filter((s) => s.showInNav));
