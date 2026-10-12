// UNIT-SOLAR: pure Chennai sunrise/sunset theme decision (SUDS 5.1, ADR-011). No DOM, no React.

/** @typedef {{lat:number, lon:number, tzOffsetHours:number}} GeoLocation */

export const DEFAULT_GEO = Object.freeze({ lat: 13.08, lon: 80.27, tzOffsetHours: 5.5 });
export const LONGITUDE_CORRECTION_H = 5.5 - 80.27 / 15;

const HOUR_MS = 3_600_000;
const DAY_MS = 86_400_000;

/**
 * IST wall clock read with UTC getters only (never local getters).
 * @returns {{ year:number, month:number, day:number, hours:number, minutes:number }} month 0-based
 */
export function toIst(date, tzOffsetHours = DEFAULT_GEO.tzOffsetHours) {
  const ist = new Date(new Date(+date).getTime() + tzOffsetHours * HOUR_MS);
  return {
    year: ist.getUTCFullYear(),
    month: ist.getUTCMonth(),
    day: ist.getUTCDate(),
    hours: ist.getUTCHours(),
    minutes: ist.getUTCMinutes(),
  };
}

/** @returns {number} 1..366 IST calendar day */
export function dayOfYear(date, tzOffsetHours = DEFAULT_GEO.tzOffsetHours) {
  const { year, month, day } = toIst(date, tzOffsetHours);
  return (Date.UTC(year, month, day) - Date.UTC(year, 0, 1)) / DAY_MS + 1;
}

/** @returns {{ sunrise:number, sunset:number }} local solar hours, no longitude correction */
export function sunriseSunsetHours(doy, latDeg = DEFAULT_GEO.lat) {
  const dec = -23.45 * Math.cos(((2 * Math.PI) / 365) * (doy + 10));
  const latRad = (latDeg * Math.PI) / 180;
  const decRad = (dec * Math.PI) / 180;
  const cosHA = -Math.tan(latRad) * Math.tan(decRad);
  const ha = Math.acos(Math.max(-1, Math.min(1, cosHA))) * (180 / Math.PI);
  return { sunrise: 12 - ha / 15, sunset: 12 + ha / 15 };
}

/**
 * Day window in IST hours including the longitude correction.
 * Chennai (80.27 E) is west of the IST meridian (82.5 E), so local solar noon is
 * about 12:09 IST: correction = tzOffset - lon/15 = about +0.1487 h.
 * @returns {{ start:number, end:number }}
 */
export function dayWindow(doy, geo = DEFAULT_GEO) {
  const { sunrise, sunset } = sunriseSunsetHours(doy, geo.lat);
  const correction = geo.tzOffsetHours - geo.lon / 15;
  // Polar day (sun never sets) must cover the whole IST day regardless of the correction;
  // otherwise shift by the correction and clamp AFTER it so the window stays inside [0, 24].
  if (sunset - sunrise >= 24) return { start: 0, end: 24 };
  return {
    start: Math.max(0, sunrise + correction),
    end: Math.min(24, sunset + correction),
  };
}

/**
 * @param {Date|number} date
 * @returns {"day"|"night"} invalid dates fail safe to "night"
 */
export function getSunPhase(date, geo = DEFAULT_GEO) {
  const t = new Date(+date).getTime();
  if (Number.isNaN(t)) return "night";
  const { hours, minutes } = toIst(t, geo.tzOffsetHours);
  // Second/millisecond resolution: sub-minute remainder of the IST wall clock.
  const subMinuteMs = (((t + geo.tzOffsetHours * HOUR_MS) % 60_000) + 60_000) % 60_000;
  const hourIST = hours + minutes / 60 + subMinuteMs / HOUR_MS;
  const { start, end } = dayWindow(dayOfYear(t, geo.tzOffsetHours), geo);
  return start <= hourIST && hourIST < end ? "day" : "night";
}
