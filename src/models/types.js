// UNIT-TYPES: JSDoc typedefs for every domain model (SUDS section 4). No runtime exports.
// Use: /** @typedef {import("../models/types.js").Project} Project */

/** @typedef {string} MsIcon        Material Symbols ligature, /^[a-z0-9_]+$/ */
/** @typedef {string} IconRef       /^(si|ms|svg):[a-z0-9_]+$/ */
/** @typedef {string} HexColor      /^#[0-9a-fA-F]{6}$/ */
/** @typedef {string} CssColor      HexColor | rgb(a)(...) | linear-gradient(...) */
/** @typedef {string} SafeUrl       https:, mailto:, tel:, #anchor or relative path */
/** @typedef {{ text: string, mark?: "strong" | "hl" }} TextSegment */
/** @typedef {ReadonlyArray<TextSegment>} RichText */

/** @typedef {{ src: SafeUrl, alt: string, width: number, height: number }} Photo */
/** @typedef {{ label: string, num: string, color: HexColor, icon?: MsIcon }} Stat */
/**
 * @typedef {Object} Profile
 * @property {string} name
 * @property {{before: string, emphasis: string, after: string}} nameParts
 * @property {string} displayName
 * @property {string} title
 * @property {string} titleCaps
 * @property {string} heroTag
 * @property {string} location
 * @property {string} email
 * @property {string} phone
 * @property {ReadonlyArray<string>} roles
 * @property {RichText} bio
 * @property {ReadonlyArray<string>} badges
 * @property {string} gaugeLabel
 * @property {ReadonlyArray<Stat>} gaugeStats
 * @property {ReadonlyArray<string>} stackTags
 * @property {ReadonlyArray<string>} profileTags
 * @property {string} status
 * @property {Photo} photo
 * @property {ReadonlyArray<Stat>} stats
 * @property {ReadonlyArray<RichText>} aboutParagraphs
 */
/** @typedef {{ label: string, w: string, g: CssColor }} ResumeSkill */
/**
 * @typedef {Object} ResumePreview
 * @property {string} heading
 * @property {string} intro
 * @property {string} fileLabel
 * @property {string} name
 * @property {string} roleLine
 * @property {ReadonlyArray<{icon: MsIcon, text: string}>} contactRows
 * @property {string} skillsHeading
 * @property {ReadonlyArray<ResumeSkill>} bars
 */
/**
 * @typedef {Object} SectionEntry
 * @property {string} id
 * @property {Function|object} component
 * @property {boolean} lazy
 * @property {boolean} showInNav
 * @property {string|null} label
 * @property {string|null} heading
 * @property {MsIcon|null} icon
 * @property {string|null} [title]
 * @property {string|null} [number]
 * @property {string|null} [labelText]
 * @property {number} [minHeight]
 */
/** @typedef {Stat} GaugeStat      Hero gauge stat (icon omitted) */
/** @typedef {SectionEntry} Section  Alias of SectionEntry (SRS name) */
/** @typedef {ResumePreview} ResumeInfo  Alias of ResumePreview (SRS name) */
/** @typedef {{ id: string, label: string, icon: MsIcon }} NavItem */
/** @typedef {{ role: string, company: string, period: string, location: string, icon: MsIcon, desc: string }} Experience */
/** @typedef {{ name: string, icon: IconRef, color?: HexColor }} Skill */
/** @typedef {{ label: string, headerColor: HexColor, headerBg: CssColor, skills: ReadonlyArray<Skill> }} SkillCategory */
/** @typedef {{ title: string, icon: MsIcon, titleIcon: MsIcon, desc: string, chips: ReadonlyArray<string> }} Highlight */
/**
 * @typedef {Object} Project
 * @property {string} title
 * @property {string} num
 * @property {string} period
 * @property {string} domain
 * @property {MsIcon} icon
 * @property {HexColor} color
 * @property {CssColor} bg
 * @property {CssColor} border
 * @property {boolean} [wide]
 * @property {string} desc
 * @property {ReadonlyArray<string>} tags
 * @property {CssColor} line
 */
/** @typedef {{ title: string, tag: string, icon: MsIcon, color: HexColor, desc: string, wide?: boolean, artKey: "cluster"|"medical"|"infotainment"|"multiplatform"|"profile", href: SafeUrl }} DesignCard */
/** @typedef {{ title: string, subtitle: string, icon: MsIcon, iconColor: HexColor, tags: ReadonlyArray<string>, tagVariant: "edu"|"domain" }} Education */
/** @typedef {{ name: string, org: string, icon: MsIcon }} Certification */
/** @typedef {{ kind: "email"|"phone"|"linkedin"|"behance"|"github", label: string, href: SafeUrl, icon: MsIcon, external: boolean, group: "primary"|"social" }} ContactLink */
/** @typedef {{id:number,x:number,y:number,size:number,dur:number,delay:number,dx:string,color:string,opacity:number}} Particle */
/** @typedef {{ speed: number, rpm: number }} GaugeFrame */
/** @typedef {{ lat: number, lon: number, tzOffsetHours: number }} GeoLocation */

export {};
