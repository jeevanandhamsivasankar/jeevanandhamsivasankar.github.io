// UNIT-DATA_CERTIFICATIONS: content is byte-identical to the baseline.
import { assertUnique, createCertification, deepFreeze } from "../models/index.js";

const RAW = [
  { icon: "school",         name: "Qt 6 Core — Beginner, Intermediate & Advanced", org: "UDEMY" },
  { icon: "school",         name: "QML for Beginners",                              org: "UDEMY" },
  { icon: "verified_user",  name: "Google UX Design Professional Certificate",      org: "COURSERA — CREDLY VERIFIED" },
];

export const CERTIFICATIONS = deepFreeze(RAW.map(createCertification));
assertUnique(CERTIFICATIONS.map((c) => c.name), "Certification", "name");
