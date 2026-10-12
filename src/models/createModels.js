// Factory functions for every domain model (UNIT-CREATE_MODELS). No React, no config/.
// Contract (SUDS 4.1): validate object, reject unknown keys, validate in declared order,
// apply defaults, build a new object in declaration order, deep-freeze, return.
import {
  assertArray,
  assertBoolean,
  assertColor,
  assertComponent,
  assertEmail,
  assertHexColor,
  assertIconRef,
  assertKnownKeys,
  assertMsIcon,
  assertNonEmptyString,
  assertNonNegativeNumber,
  assertPositiveNumber,
  assertOneOf,
  assertPlainObject,
  assertRequired,
  assertUnique,
  assertUrl,
  deepFreeze,
  fail,
} from "./validate.js";

export const DESIGN_ART_KEYS = Object.freeze([
  "cluster",
  "medical",
  "infotainment",
  "multiplatform",
  "profile",
]);

const has = (raw, key) => raw[key] !== undefined && raw[key] !== null;

/** Common prologue: object check + unknown-key check. */
function begin(raw, model, keys) {
  assertPlainObject(raw, model);
  assertKnownKeys(raw, keys, model);
}

/** Array of non-empty strings, optionally unique; returns a fresh array. */
function stringArray(value, model, field, { unique = false } = {}) {
  assertArray(value, model, field, { minLength: 1 });
  value.forEach((v, i) => assertNonEmptyString(v, model, `${field}[${i}]`));
  if (unique) assertUnique(value, model, field);
  return [...value];
}

/** Map nested items through an inner factory, requiring a non-empty array. */
function modelArray(value, model, field, factory) {
  assertArray(value, model, field, { minLength: 1 });
  return value.map((item) => factory(item));
}

/**
 * Model "RichText". Accepts strings as shorthand for unmarked segments.
 * Throws `Invalid RichText: [i].text|[i].mark ...`.
 * @param {string|object|ReadonlyArray<string|object>} raw segments or shorthand text
 * @returns {ReadonlyArray<{text:string, mark?:"strong"|"hl"}>}
 */
export function createRichText(raw) {
  const M = "RichText";
  assertArray(raw, M, "value", { minLength: 1 });
  const out = raw.map((seg, i) => {
    if (typeof seg === "string") {
      assertNonEmptyString(seg, M, `[${i}].text`);
      return { text: seg };
    }
    assertPlainObject(seg, M, `[${i}]`);
    assertKnownKeys(seg, ["text", "mark"], M);
    assertNonEmptyString(seg.text, M, `[${i}].text`);
    if (has(seg, "mark")) {
      assertOneOf(seg.mark, ["strong", "hl"], M, `[${i}].mark`);
      return { text: seg.text, mark: seg.mark };
    }
    return { text: seg.text };
  });
  return deepFreeze(out);
}

/**
 * Model "Photo". @throws ModelValidationError `Invalid Photo: <field> <reason>`
 * @param {object} raw unvalidated input
 * @returns {Readonly<import("./types.js").Photo>} frozen model
 */
export function createPhoto(raw) {
  const M = "Photo";
  begin(raw, M, ["src", "alt", "width", "height"]);
  assertNonEmptyString(raw.src, M, "src");
  assertUrl(raw.src, M, "src");
  assertNonEmptyString(raw.alt, M, "alt");
  assertPositiveNumber(raw.width, M, "width");
  assertPositiveNumber(raw.height, M, "height");
  return deepFreeze({ src: raw.src, alt: raw.alt, width: raw.width, height: raw.height });
}

/**
 * Model "Stat". @throws `Invalid Stat: <field> <reason>`
 * @param {object} raw unvalidated input
 * @param {{requireIcon?: boolean}} [opts]
 * @returns {Readonly<import("./types.js").Stat>} frozen model
 */
export function createStat(raw, { requireIcon = false } = {}) {
  const M = "Stat";
  begin(raw, M, ["label", "num", "color", "icon"]);
  assertNonEmptyString(raw.label, M, "label");
  assertNonEmptyString(raw.num, M, "num");
  assertHexColor(raw.color, M, "color");
  if (requireIcon) assertRequired(raw.icon, M, "icon");
  const out = { label: raw.label, num: raw.num, color: raw.color };
  if (has(raw, "icon")) {
    assertMsIcon(raw.icon, M, "icon");
    out.icon = raw.icon;
  }
  return deepFreeze(out);
}

const PROFILE_KEYS = [
  "name", "nameParts", "displayName", "title", "titleCaps", "heroTag", "location", "email",
  "phone", "roles", "bio", "badges", "gaugeLabel", "gaugeStats", "stackTags", "profileTags",
  "status", "photo", "stats", "aboutParagraphs",
];

function onlyMarks(richText, allowed, model, field) {
  richText.forEach((seg, i) => {
    if (seg.mark !== undefined) assertOneOf(seg.mark, allowed, model, `${field}[${i}].mark`);
  });
}

/**
 * Model "Profile". @throws `Invalid Profile: <field> <reason>`
 * @param {object} raw unvalidated input
 * @returns {Readonly<import("./types.js").Profile>} frozen model
 */
export function createProfile(raw) {
  const M = "Profile";
  begin(raw, M, PROFILE_KEYS);
  assertNonEmptyString(raw.name, M, "name");
  assertPlainObject(raw.nameParts, M, "nameParts");
  assertKnownKeys(raw.nameParts, ["before", "emphasis", "after"], M);
  for (const k of ["before", "emphasis", "after"]) {
    assertNonEmptyString(raw.nameParts[k], M, `nameParts.${k}`);
  }
  const nameParts = {
    before: raw.nameParts.before,
    emphasis: raw.nameParts.emphasis,
    after: raw.nameParts.after,
  };
  for (const k of ["displayName", "title", "titleCaps", "heroTag", "location"]) {
    assertNonEmptyString(raw[k], M, k);
  }
  assertEmail(raw.email, M, "email");
  assertNonEmptyString(raw.phone, M, "phone");
  const roles = stringArray(raw.roles, M, "roles", { unique: true });
  const bio = createRichText(raw.bio);
  onlyMarks(bio, ["strong"], M, "bio");
  const badges = stringArray(raw.badges, M, "badges", { unique: true });
  assertNonEmptyString(raw.gaugeLabel, M, "gaugeLabel");
  const gaugeStats = modelArray(raw.gaugeStats, M, "gaugeStats", (s) => createStat(s));
  const stackTags = stringArray(raw.stackTags, M, "stackTags", { unique: true });
  const profileTags = stringArray(raw.profileTags, M, "profileTags", { unique: true });
  assertNonEmptyString(raw.status, M, "status");
  const photo = createPhoto(raw.photo);
  assertArray(raw.stats, M, "stats", { minLength: 1 });
  const stats = raw.stats.map((s, i) => {
    assertPlainObject(s, M, `stats[${i}]`);
    assertRequired(s.icon, M, `stats[${i}].icon`);
    return createStat(s, { requireIcon: true });
  });
  assertArray(raw.aboutParagraphs, M, "aboutParagraphs", { minLength: 1 });
  const aboutParagraphs = raw.aboutParagraphs.map((p, i) => {
    const rt = createRichText(p);
    onlyMarks(rt, ["hl"], M, `aboutParagraphs[${i}]`);
    return rt;
  });
  return deepFreeze({
    name: raw.name, nameParts, displayName: raw.displayName, title: raw.title,
    titleCaps: raw.titleCaps, heroTag: raw.heroTag, location: raw.location, email: raw.email,
    phone: raw.phone, roles, bio, badges, gaugeLabel: raw.gaugeLabel, gaugeStats, stackTags,
    profileTags, status: raw.status, photo, stats, aboutParagraphs,
  });
}

/**
 * Model "ResumeSkill". @throws `Invalid ResumeSkill: <field> <reason>`
 * @param {object} raw unvalidated input
 * @returns {Readonly<import("./types.js").ResumeSkill>} frozen model
 */
export function createResumeSkill(raw) {
  const M = "ResumeSkill";
  begin(raw, M, ["label", "w", "g"]);
  assertNonEmptyString(raw.label, M, "label");
  assertRequired(raw.w, M, "w");
  if (typeof raw.w !== "string" || !/^(100|[1-9]?[0-9])%$/.test(raw.w)) {
    fail(M, "w", "must be a percentage string");
  }
  assertColor(raw.g, M, "g");
  return deepFreeze({ label: raw.label, w: raw.w, g: raw.g });
}

/**
 * Model "ResumePreview". @throws `Invalid ResumePreview: <field> <reason>`
 * @param {object} raw unvalidated input
 * @returns {Readonly<import("./types.js").ResumePreview>} frozen model
 */
export function createResumePreview(raw) {
  const M = "ResumePreview";
  begin(raw, M, [
    "heading", "intro", "fileLabel", "name", "roleLine", "contactRows", "skillsHeading", "bars",
  ]);
  for (const k of ["heading", "intro", "fileLabel", "name", "roleLine"]) {
    assertNonEmptyString(raw[k], M, k);
  }
  assertArray(raw.contactRows, M, "contactRows", { minLength: 1 });
  const contactRows = raw.contactRows.map((row, i) => {
    assertPlainObject(row, M, `contactRows[${i}]`);
    assertKnownKeys(row, ["icon", "text"], M);
    assertMsIcon(row.icon, M, `contactRows[${i}].icon`);
    assertNonEmptyString(row.text, M, `contactRows[${i}].text`);
    return { icon: row.icon, text: row.text };
  });
  assertNonEmptyString(raw.skillsHeading, M, "skillsHeading");
  const bars = modelArray(raw.bars, M, "bars", createResumeSkill);
  return deepFreeze({
    heading: raw.heading, intro: raw.intro, fileLabel: raw.fileLabel, name: raw.name,
    roleLine: raw.roleLine, contactRows, skillsHeading: raw.skillsHeading, bars,
  });
}

const SECTION_KEYS = [
  "id", "component", "lazy", "showInNav", "label", "heading", "icon", "title", "number",
  "labelText", "minHeight",
];

/**
 * Model "Section". SHALLOW freeze only: `component` may be a React.lazy object
 * whose `_payload` React mutates while resolving.
 * @throws `Invalid Section: <field> <reason>`
 * @param {object} raw unvalidated input
 * @returns {Readonly<import("./types.js").SectionEntry>} frozen model
 */
export function createSection(raw) {
  const M = "Section";
  begin(raw, M, SECTION_KEYS);
  assertNonEmptyString(raw.id, M, "id");
  if (!/^[a-z][a-z0-9-]*$/.test(raw.id)) fail(M, "id", "must be a slug (a-z, 0-9, -)");
  assertComponent(raw.component, M, "component");
  assertBoolean(raw.lazy, M, "lazy");
  assertBoolean(raw.showInNav, M, "showInNav");
  const hasHeading = has(raw, "heading");
  if (raw.showInNav) {
    assertNonEmptyString(raw.label, M, "label");
    assertNonEmptyString(raw.heading, M, "heading");
    assertMsIcon(raw.icon, M, "icon");
  } else {
    if (has(raw, "label")) assertNonEmptyString(raw.label, M, "label");
    if (hasHeading) {
      assertNonEmptyString(raw.heading, M, "heading");
      assertMsIcon(raw.icon, M, "icon");
    } else if (has(raw, "icon")) {
      assertMsIcon(raw.icon, M, "icon");
    }
  }
  if (has(raw, "title")) assertNonEmptyString(raw.title, M, "title");
  if (has(raw, "number") && !/^\d{2}$/.test(raw.number)) {
    fail(M, "number", "must be a two-digit string");
  }
  if (has(raw, "labelText")) assertNonEmptyString(raw.labelText, M, "labelText");
  if (has(raw, "minHeight")) assertNonNegativeNumber(raw.minHeight, M, "minHeight");
  return Object.freeze({
    id: raw.id,
    component: raw.component,
    lazy: raw.lazy,
    showInNav: raw.showInNav,
    label: has(raw, "label") ? raw.label : null,
    heading: hasHeading ? raw.heading : null,
    icon: has(raw, "icon") ? raw.icon : null,
    title: has(raw, "title") ? raw.title : null,
    number: has(raw, "number") ? raw.number : null,
    labelText: has(raw, "labelText") ? raw.labelText : null,
    minHeight: has(raw, "minHeight") ? raw.minHeight : 0,
  });
}

/**
 * Model "Experience". @throws `Invalid Experience: <field> <reason>`
 * @param {object} raw unvalidated input
 * @returns {Readonly<import("./types.js").Experience>} frozen model
 */
export function createExperience(raw) {
  const M = "Experience";
  begin(raw, M, ["role", "company", "period", "location", "icon", "desc"]);
  assertNonEmptyString(raw.role, M, "role");
  assertNonEmptyString(raw.company, M, "company");
  assertNonEmptyString(raw.period, M, "period");
  if (!/^[A-Z]{3} \d{4} — [A-Z]{3} \d{4}$/.test(raw.period)) {
    fail(M, "period", 'must match "MON YYYY — MON YYYY"');
  }
  assertNonEmptyString(raw.location, M, "location");
  assertMsIcon(raw.icon, M, "icon");
  assertNonEmptyString(raw.desc, M, "desc");
  return deepFreeze({
    role: raw.role, company: raw.company, period: raw.period, location: raw.location,
    icon: raw.icon, desc: raw.desc,
  });
}

/**
 * Model "Skill". @throws `Invalid Skill: <field> <reason>`
 * @param {object} raw unvalidated input
 * @returns {Readonly<import("./types.js").Skill>} frozen model
 */
export function createSkill(raw) {
  const M = "Skill";
  begin(raw, M, ["name", "icon", "color"]);
  assertNonEmptyString(raw.name, M, "name");
  assertIconRef(raw.icon, M, "icon");
  const out = { name: raw.name, icon: raw.icon };
  if (has(raw, "color")) {
    assertHexColor(raw.color, M, "color");
    out.color = raw.color;
  }
  return deepFreeze(out);
}

/**
 * Model "SkillCategory". @throws `Invalid SkillCategory: <field> <reason>`
 * @param {object} raw unvalidated input
 * @returns {Readonly<import("./types.js").SkillCategory>} frozen model
 */
export function createSkillCategory(raw) {
  const M = "SkillCategory";
  begin(raw, M, ["label", "headerColor", "headerBg", "skills"]);
  assertNonEmptyString(raw.label, M, "label");
  assertHexColor(raw.headerColor, M, "headerColor");
  assertColor(raw.headerBg, M, "headerBg");
  assertArray(raw.skills, M, "skills", { minLength: 1 });
  const skills = raw.skills.map((s) => createSkill(s));
  const seen = new Set();
  skills.forEach((s, i) => {
    if (seen.has(s.name)) fail(M, `skills[${i}].name`, `must be unique (duplicate "${s.name}")`);
    seen.add(s.name);
  });
  return deepFreeze({
    label: raw.label, headerColor: raw.headerColor, headerBg: raw.headerBg, skills,
  });
}

/**
 * Model "Highlight". @throws `Invalid Highlight: <field> <reason>`
 * @param {object} raw unvalidated input
 * @returns {Readonly<import("./types.js").Highlight>} frozen model
 */
export function createHighlight(raw) {
  const M = "Highlight";
  begin(raw, M, ["title", "icon", "titleIcon", "desc", "chips"]);
  assertNonEmptyString(raw.title, M, "title");
  assertMsIcon(raw.icon, M, "icon");
  assertMsIcon(raw.titleIcon, M, "titleIcon");
  assertNonEmptyString(raw.desc, M, "desc");
  const chips = stringArray(raw.chips, M, "chips", { unique: true });
  return deepFreeze({
    title: raw.title, icon: raw.icon, titleIcon: raw.titleIcon, desc: raw.desc, chips,
  });
}

/** Keys of a case study, in display order (US-211). */
export const CASE_STUDY_KEYS = Object.freeze(["problem", "role", "solution", "impact"]);

/**
 * Model "CaseStudy" (US-211). Every row is optional but at least one must be present;
 * rows without a supporting fact in the project text are simply absent.
 * @throws `Invalid CaseStudy: <field> <reason>`
 * @param {object} raw unvalidated input
 * @returns {Readonly<import("./types.js").CaseStudy>} frozen model
 */
export function createCaseStudy(raw) {
  const M = "CaseStudy";
  begin(raw, M, CASE_STUDY_KEYS);
  const out = {};
  for (const k of CASE_STUDY_KEYS) {
    if (has(raw, k)) {
      assertNonEmptyString(raw[k], M, k);
      out[k] = raw[k];
    }
  }
  if (Object.keys(out).length === 0) fail(M, "value", "must contain at least one row");
  return deepFreeze(out);
}

/**
 * Model "Project". @throws `Invalid Project: <field> <reason>` (createProject({}) -> title is required)
 * @param {object} raw unvalidated input
 * @returns {Readonly<import("./types.js").Project>} frozen model
 */
export function createProject(raw) {
  const M = "Project";
  begin(raw, M, [
    "title", "num", "period", "domain", "icon", "color", "bg", "border", "wide", "desc", "tags",
    "line", "caseStudy", "nda",
  ]);
  assertNonEmptyString(raw.title, M, "title");
  assertNonEmptyString(raw.num, M, "num");
  assertNonEmptyString(raw.period, M, "period");
  assertNonEmptyString(raw.domain, M, "domain");
  assertMsIcon(raw.icon, M, "icon");
  assertHexColor(raw.color, M, "color");
  assertColor(raw.bg, M, "bg");
  assertColor(raw.border, M, "border");
  if (has(raw, "wide")) assertBoolean(raw.wide, M, "wide");
  assertNonEmptyString(raw.desc, M, "desc");
  const tags = stringArray(raw.tags, M, "tags", { unique: true });
  assertColor(raw.line, M, "line");
  const out = {
    title: raw.title, num: raw.num, period: raw.period, domain: raw.domain, icon: raw.icon,
    color: raw.color, bg: raw.bg, border: raw.border, wide: has(raw, "wide") ? raw.wide : false,
    desc: raw.desc, tags, line: raw.line,
  };
  if (has(raw, "caseStudy")) out.caseStudy = createCaseStudy(raw.caseStudy);
  if (has(raw, "nda")) {
    assertBoolean(raw.nda, M, "nda");
    out.nda = raw.nda;
  }
  return deepFreeze(out);
}

/**
 * Model "DesignCard". @throws `Invalid DesignCard: <field> <reason>`
 * @param {object} raw unvalidated input
 * @returns {Readonly<import("./types.js").DesignCard>} frozen model
 */
export function createDesignCard(raw) {
  const M = "DesignCard";
  begin(raw, M, ["title", "tag", "icon", "color", "desc", "wide", "artKey", "href"]);
  assertNonEmptyString(raw.title, M, "title");
  assertNonEmptyString(raw.tag, M, "tag");
  assertMsIcon(raw.icon, M, "icon");
  assertHexColor(raw.color, M, "color");
  assertNonEmptyString(raw.desc, M, "desc");
  if (has(raw, "wide")) assertBoolean(raw.wide, M, "wide");
  assertOneOf(raw.artKey, DESIGN_ART_KEYS, M, "artKey");
  assertUrl(raw.href, M, "href");
  if (!raw.href.startsWith("https:")) fail(M, "href", "must be an https URL");
  return deepFreeze({
    title: raw.title, tag: raw.tag, icon: raw.icon, color: raw.color, desc: raw.desc,
    wide: has(raw, "wide") ? raw.wide : false, artKey: raw.artKey, href: raw.href,
  });
}

/**
 * Model "Education". @throws `Invalid Education: <field> <reason>`
 * @param {object} raw unvalidated input
 * @returns {Readonly<import("./types.js").Education>} frozen model
 */
export function createEducation(raw) {
  const M = "Education";
  begin(raw, M, ["title", "subtitle", "icon", "iconColor", "tags", "tagVariant"]);
  assertNonEmptyString(raw.title, M, "title");
  assertNonEmptyString(raw.subtitle, M, "subtitle");
  assertMsIcon(raw.icon, M, "icon");
  assertHexColor(raw.iconColor, M, "iconColor");
  const tags = stringArray(raw.tags, M, "tags", { unique: true });
  assertOneOf(raw.tagVariant, ["edu", "domain"], M, "tagVariant");
  return deepFreeze({
    title: raw.title, subtitle: raw.subtitle, icon: raw.icon, iconColor: raw.iconColor, tags,
    tagVariant: raw.tagVariant,
  });
}

/**
 * Model "Certification". @throws `Invalid Certification: <field> <reason>`
 * @param {object} raw unvalidated input
 * @returns {Readonly<import("./types.js").Certification>} frozen model
 */
export function createCertification(raw) {
  const M = "Certification";
  begin(raw, M, ["name", "org", "icon"]);
  assertNonEmptyString(raw.name, M, "name");
  assertNonEmptyString(raw.org, M, "org");
  assertMsIcon(raw.icon, M, "icon");
  return deepFreeze({ name: raw.name, org: raw.org, icon: raw.icon });
}

/**
 * Model "ContactLink". @throws `Invalid ContactLink: <field> <reason>`
 * @param {object} raw unvalidated input
 * @returns {Readonly<import("./types.js").ContactLink>} frozen model
 */
export function createContactLink(raw) {
  const M = "ContactLink";
  begin(raw, M, ["kind", "label", "href", "icon", "external", "group"]);
  assertOneOf(raw.kind, ["email", "phone", "linkedin", "behance", "github"], M, "kind");
  assertNonEmptyString(raw.label, M, "label");
  assertUrl(raw.href, M, "href");
  assertMsIcon(raw.icon, M, "icon");
  assertBoolean(raw.external, M, "external");
  if (raw.external !== raw.href.startsWith("https:")) {
    fail(M, "external", "must be true exactly for https: links");
  }
  assertOneOf(raw.group, ["primary", "social"], M, "group");
  return deepFreeze({
    kind: raw.kind, label: raw.label, href: raw.href, icon: raw.icon, external: raw.external,
    group: raw.group,
  });
}
