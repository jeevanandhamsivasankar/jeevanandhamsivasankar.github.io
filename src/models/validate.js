// Assertion helpers, error type and deepFreeze (UNIT-VALIDATE). No dependencies.

export class ModelValidationError extends Error {
  /**
   * @param {string} model
   * @param {string} field
   * @param {string} reason
   */
  constructor(model, field, reason) {
    super(`Invalid ${model}: ${field} ${reason}`);
    this.name = "ModelValidationError";
    this.model = model;
    this.field = field;
    this.reason = reason;
  }
}

/** @returns {never} */
export function fail(model, field, reason) {
  throw new ModelValidationError(model, field, reason);
}

export function assertRequired(value, model, field) {
  if (value === undefined || value === null) fail(model, field, "is required");
}

export function assertPlainObject(value, model, field = "value") {
  assertRequired(value, model, field);
  if (typeof value !== "object" || Array.isArray(value)) {
    fail(model, field, "must be an object");
  }
  const proto = Object.getPrototypeOf(value);
  if (proto !== Object.prototype && proto !== null) fail(model, field, "must be an object");
}

export function assertString(value, model, field) {
  assertRequired(value, model, field);
  if (typeof value !== "string") fail(model, field, "must be a string");
}

export function assertNonEmptyString(value, model, field) {
  assertRequired(value, model, field);
  if (typeof value !== "string" || value.trim() === "") {
    fail(model, field, "must be a non-empty string");
  }
}

export function assertBoolean(value, model, field) {
  assertRequired(value, model, field);
  if (typeof value !== "boolean") fail(model, field, "must be a boolean");
}

export function assertNonNegativeNumber(value, model, field) {
  assertRequired(value, model, field);
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    fail(model, field, "must be a non-negative number");
  }
}

export function assertPositiveNumber(value, model, field) {
  assertRequired(value, model, field);
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    fail(model, field, "must be a positive number");
  }
}

export function assertArray(value, model, field, { minLength = 0 } = {}) {
  assertRequired(value, model, field);
  if (!Array.isArray(value)) fail(model, field, "must be an array");
  if (minLength >= 1 && value.length < minLength) fail(model, field, "must be a non-empty array");
}

const HEX_RE = /^#[0-9a-fA-F]{6}$/;
const RGB_RE = /^rgba?\(\s*[\d.\s,%]+\)$/;
const GRADIENT_RE = /^linear-gradient\(.+\)$/;
const MS_RE = /^[a-z0-9_]+$/;
const ICON_REF_RE = /^(si|ms|svg):[a-z0-9_]+$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function assertHexColor(value, model, field) {
  assertRequired(value, model, field);
  if (typeof value !== "string" || !HEX_RE.test(value)) {
    fail(model, field, "must be a hex colour (#rrggbb)");
  }
}

export function assertColor(value, model, field) {
  assertRequired(value, model, field);
  if (
    typeof value !== "string" ||
    !(HEX_RE.test(value) || RGB_RE.test(value) || GRADIENT_RE.test(value))
  ) {
    fail(model, field, "must be a CSS colour");
  }
}

export function assertMsIcon(value, model, field) {
  assertRequired(value, model, field);
  if (typeof value !== "string" || !MS_RE.test(value)) {
    fail(model, field, "must be a Material Symbols name");
  }
}

export function assertIconRef(value, model, field) {
  assertRequired(value, model, field);
  if (typeof value !== "string" || !ICON_REF_RE.test(value)) {
    fail(model, field, "must be an icon reference (si:|ms:|svg:)");
  }
}

export function assertOneOf(value, allowed, model, field) {
  assertRequired(value, model, field);
  if (!allowed.includes(value)) fail(model, field, `must be one of: ${allowed.join(", ")}`);
}

const URL_REASON = "must be a safe URL (https:, mailto:, tel:, #anchor or relative path)";

export function assertUrl(value, model, field) {
  assertRequired(value, model, field);
  // eslint-disable-next-line no-control-regex
  if (typeof value !== "string" || value === "" || /[\s\u0000-\u001f]/.test(value)) {
    fail(model, field, URL_REASON);
  }
  const ok =
    value.startsWith("https://") ||
    (value.startsWith("mailto:") && /^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) ||
    (value.startsWith("tel:") && /^tel:\+?[0-9]+$/.test(value)) ||
    (value.startsWith("#") && /^#[A-Za-z][\w-]*$/.test(value)) ||
    (!/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(value) && !value.startsWith("//"));
  if (!ok) fail(model, field, URL_REASON);
}

export function assertEmail(value, model, field) {
  assertRequired(value, model, field);
  if (typeof value !== "string" || !EMAIL_RE.test(value)) {
    fail(model, field, "must be a valid email address");
  }
}

export function assertUnique(values, model, field) {
  const seen = new Set();
  for (const v of values) {
    if (seen.has(v)) fail(model, field, `must be unique (duplicate "${v}")`);
    seen.add(v);
  }
}

export function assertComponent(value, model, field) {
  assertRequired(value, model, field);
  const ok =
    typeof value === "function" ||
    (typeof value === "object" && value !== null && "$$typeof" in value);
  if (!ok) fail(model, field, "must be a component");
}

export function assertKnownKeys(raw, allowedKeys, model) {
  for (const key of Object.keys(raw)) {
    if (!allowedKeys.includes(key)) fail(model, key, "is not a known field");
  }
}

export function deepFreeze(value) {
  if (value === null || typeof value !== "object") return value;
  const proto = Object.getPrototypeOf(value);
  if (!Array.isArray(value) && proto !== Object.prototype && proto !== null) return value;
  Object.freeze(value);
  for (const v of Object.values(value)) deepFreeze(v);
  return value;
}
