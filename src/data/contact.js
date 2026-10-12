// UNIT-DATA_CONTACT: content is byte-identical to the baseline.
import { assertUnique, createContactLink, deepFreeze } from "../models/index.js";
import { EMAIL, LOCATION, PHONE, PHONE_HREF, URLS } from "../config/site.js";

export const CONTACT_LINKS = deepFreeze([
  createContactLink({ kind: "email", label: EMAIL, href: `mailto:${EMAIL}`, icon: "mail", external: false, group: "primary" }),
  createContactLink({ kind: "phone", label: PHONE, href: PHONE_HREF, icon: "phone", external: false, group: "primary" }),
  createContactLink({ kind: "linkedin", label: "LinkedIn", href: URLS.linkedin, icon: "open_in_new", external: true, group: "social" }),
  createContactLink({ kind: "behance", label: "Behance Portfolio", href: URLS.behance, icon: "brush", external: true, group: "social" }),
  createContactLink({ kind: "github", label: "GitHub", href: URLS.github, icon: "terminal", external: true, group: "social" }),
]);
assertUnique(CONTACT_LINKS.map((l) => l.kind), "ContactLink", "kind");

export const CONTACT_INTRO = "Open to senior HMI engineering roles, embedded UI consulting, and collaborative automotive or medical device projects. Based in Chennai, India.";
export const CONTACT_LOCATION = LOCATION;
