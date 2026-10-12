/* Custom SVG icons for tools without a Simple Icons entry. Each renderer receives (color, size). */
export const CUSTOM_SVGS = Object.freeze({
  oop: (c, s) => (
    <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke={c} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" style={{display:"block"}}>
      <rect x="7" y="2" width="10" height="6" rx="1.5"/>
      <line x1="12" y1="8" x2="12" y2="11"/>
      <line x1="12" y1="11" x2="5" y2="11"/>
      <line x1="12" y1="11" x2="19" y2="11"/>
      <rect x="1" y="11" width="8" height="5" rx="1"/>
      <rect x="15" y="11" width="8" height="5" rx="1"/>
    </svg>
  ),
  stl: (c, s) => (
    <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke={c} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" style={{display:"block"}}>
      <rect x="2" y="5" width="20" height="14" rx="2"/>
      <line x1="7" y1="5" x2="7" y2="19"/>
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="17" y1="5" x2="17" y2="19"/>
      <rect x="7.5" y="9" width="4" height="2" rx="0.5" fill={c} strokeWidth="0"/>
      <rect x="12.5" y="11.5" width="4" height="2" rx="0.5" fill={c} strokeWidth="0" opacity="0.6"/>
    </svg>
  ),
  smartptr: (c, s) => (
    <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke={c} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" style={{display:"block"}}>
      <circle cx="16" cy="8" r="4"/>
      <path d="M13 11 L4 20"/>
      <path d="M14 4 h4 v4"/>
      <circle cx="16" cy="8" r="1.5" fill={c} strokeWidth="0"/>
    </svg>
  ),
  bit: (c, s) => (
    <svg viewBox="0 0 24 24" width={s} height={s} fill="none" style={{display:"block"}}>
      <rect x="2"  y="9"  width="3.5" height="9" rx="0.75" fill={c} opacity="0.35"/>
      <rect x="6.5" y="6"  width="3.5" height="12" rx="0.75" fill={c}/>
      <rect x="11" y="9"  width="3.5" height="9" rx="0.75" fill={c} opacity="0.35"/>
      <rect x="15.5" y="6"  width="3.5" height="12" rx="0.75" fill={c}/>
      <rect x="20" y="9"  width="2.5" height="9" rx="0.75" fill={c} opacity="0.35"/>
    </svg>
  ),
  struct: (c, s) => (
    <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke={c} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" style={{display:"block"}}>
      <rect x="2" y="3" width="20" height="18" rx="2"/>
      <line x1="2" y1="9" x2="22" y2="9"/>
      <line x1="2" y1="14.5" x2="22" y2="14.5"/>
      <circle cx="5.5" cy="6" r="1" fill={c} strokeWidth="0"/>
      <line x1="8" y1="6" x2="18" y2="6"/>
      <circle cx="5.5" cy="11.75" r="1" fill={c} strokeWidth="0"/>
      <line x1="8" y1="11.75" x2="15" y2="11.75"/>
    </svg>
  ),
  lvgl: (c, s) => (
    <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke={c} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" style={{display:"block"}}>
      <rect x="1" y="3" width="22" height="15" rx="2"/>
      <circle cx="8.5" cy="10.5" r="3" fill={c} opacity="0.2" strokeWidth="0"/>
      <circle cx="8.5" cy="10.5" r="1.5" fill={c} strokeWidth="0"/>
      <rect x="14" y="7" width="6" height="2" rx="0.5" fill={c} strokeWidth="0" opacity="0.8"/>
      <rect x="14" y="10.5" width="4.5" height="1.5" rx="0.5" fill={c} strokeWidth="0" opacity="0.55"/>
      <rect x="14" y="13.5" width="5.5" height="1.5" rx="0.5" fill={c} strokeWidth="0" opacity="0.3"/>
      <rect x="9.5" y="18" width="5" height="1.5" rx="0.75" fill={c} strokeWidth="0"/>
      <line x1="12" y1="19.5" x2="12" y2="21"/>
      <line x1="9" y1="21" x2="15" y2="21"/>
    </svg>
  ),
  touchgfx: (c, s) => (
    <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke={c} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" style={{display:"block"}}>
      <rect x="2" y="3" width="20" height="14" rx="2"/>
      <rect x="7" y="17" width="10" height="2" rx="1" fill={c} opacity="0.4" strokeWidth="0"/>
      <circle cx="12" cy="10" r="3.5" strokeWidth="1.5"/>
      <path d="M15 12.5 L18 16" strokeWidth="2"/>
      <circle cx="12" cy="10" r="1.2" fill={c} strokeWidth="0"/>
    </svg>
  ),
  guiguider: (c, s) => (
    <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke={c} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" style={{display:"block"}}>
      <rect x="2"  y="2"  width="9" height="7" rx="1.5"/>
      <rect x="13" y="2"  width="9" height="7" rx="1.5"/>
      <rect x="2"  y="15" width="9" height="7" rx="1.5"/>
      <rect x="13" y="15" width="9" height="7" rx="1.5" fill={c} opacity="0.15"/>
      <path d="M11 5.5 h2 M11 18.5 h2"/>
      <path d="M12 9 v6" strokeDasharray="1.5 1.5"/>
    </svg>
  ),
  crank: (c, s) => (
    <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke={c} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" style={{display:"block"}}>
      <rect x="2" y="5"  width="14" height="10" rx="1.5"/>
      <rect x="5" y="8"  width="14" height="10" rx="1.5" opacity="0.7"/>
      <rect x="8" y="11" width="14" height="10" rx="1.5" opacity="0.45"/>
      <line x1="5"  y1="8"  x2="2"  y2="5"/>
      <line x1="19" y1="8"  x2="16" y2="5"/>
    </svg>
  ),
  candera: (c, s) => (
    <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke={c} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" style={{display:"block"}}>
      <path d="M12 2 L22 7 L22 17 L12 22 L2 17 L2 7 Z"/>
      <line x1="12" y1="2"  x2="12" y2="22"/>
      <line x1="2"  y1="12" x2="22" y2="12"/>
      <line x1="2"  y1="7"  x2="22" y2="17"/>
    </svg>
  ),
  vglite: (c, s) => (
    <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke={c} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" style={{display:"block"}}>
      <path d="M3 18 C5 12 9 5 12 5 C15 5 19 12 21 18"/>
      <circle cx="12" cy="5"  r="2"   fill={c} strokeWidth="0"/>
      <circle cx="7.5" cy="13" r="1.5" fill={c} strokeWidth="0" opacity="0.5"/>
      <circle cx="16.5" cy="13" r="1.5" fill={c} strokeWidth="0" opacity="0.5"/>
      <line x1="12" y1="5" x2="7.5"  y2="13" strokeWidth="1" strokeDasharray="2 1.5"/>
      <line x1="12" y1="5" x2="16.5" y2="13" strokeWidth="1" strokeDasharray="2 1.5"/>
    </svg>
  ),
  freertos: (c, s) => (
    <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke={c} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" style={{display:"block"}}>
      <circle cx="12" cy="12" r="8"/>
      <path d="M12 7 v5 l3.5 2.5"/>
      <path d="M5 4.5 A10 10 0 0 1 19 4.5" strokeWidth="1.2" strokeDasharray="2 2"/>
      <path d="M3.5 9 L5 4.5 L9 5.5" strokeWidth="1.2"/>
    </svg>
  ),
  nxp: (c, s) => (
    <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke={c} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" style={{display:"block"}}>
      <rect x="6" y="6" width="12" height="12" rx="1.5" fill={c} opacity="0.15" strokeWidth="0"/>
      <rect x="6" y="6" width="12" height="12" rx="1.5"/>
      <line x1="9"  y1="1.5" x2="9"  y2="6"/>
      <line x1="12" y1="1.5" x2="12" y2="6"/>
      <line x1="15" y1="1.5" x2="15" y2="6"/>
      <line x1="9"  y1="18" x2="9"  y2="22.5"/>
      <line x1="12" y1="18" x2="12" y2="22.5"/>
      <line x1="15" y1="18" x2="15" y2="22.5"/>
      <line x1="1.5" y1="9"  x2="6"  y2="9"/>
      <line x1="1.5" y1="12" x2="6"  y2="12"/>
      <line x1="1.5" y1="15" x2="6"  y2="15"/>
      <line x1="18" y1="9"  x2="22.5" y2="9"/>
      <line x1="18" y1="12" x2="22.5" y2="12"/>
      <line x1="18" y1="15" x2="22.5" y2="15"/>
    </svg>
  ),
  uart: (c, s) => (
    <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke={c} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" style={{display:"block"}}>
      <path d="M2 14 h2 v-8 h2.5 v8 h2.5 v-8 h2.5 v8 h2.5 v-8 h2.5 v8 h2.5 v-8 h2.5 v8 h1"/>
      <line x1="2" y1="17.5" x2="22" y2="17.5" strokeWidth="0.75" strokeDasharray="2 2" opacity="0.4"/>
    </svg>
  ),
  spi: (c, s) => (
    <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke={c} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" style={{display:"block"}}>
      <rect x="1" y="8"  width="6" height="8" rx="1"/>
      <rect x="17" y="8" width="6" height="8" rx="1"/>
      <path d="M7 10 h2.5 v-3.5 h5 v3.5 h2.5"/>
      <path d="M7 13.5 h9.5"/>
      <path d="M7 17 h2.5 v3.5 h5 v-3.5 h2.5"/>
    </svg>
  ),
  i2c: (c, s) => (
    <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke={c} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" style={{display:"block"}}>
      <line x1="2" y1="9"  x2="22" y2="9"/>
      <line x1="2" y1="15" x2="22" y2="15"/>
      <line x1="7"  y1="4" x2="7"  y2="9"/>
      <line x1="17" y1="4" x2="17" y2="9"/>
      <circle cx="7"  cy="9"  r="2" fill={c} opacity="0.25" strokeWidth="0.75"/>
      <circle cx="17" cy="9"  r="2" fill={c} opacity="0.25" strokeWidth="0.75"/>
      <rect x="10" y="6" width="4" height="3" rx="0.5" fill={c} opacity="0.5" strokeWidth="0"/>
    </svg>
  ),
  can: (c, s) => (
    <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke={c} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" style={{display:"block"}}>
      <circle cx="4"  cy="12" r="2.5"/>
      <circle cx="20" cy="12" r="2.5"/>
      <path d="M6.5 12 C9 7 15 7 17.5 12"/>
      <path d="M6.5 12 C9 17 15 17 17.5 12"/>
      <line x1="10" y1="12" x2="14" y2="12" strokeWidth="2.5" strokeDasharray="2 1.5"/>
    </svg>
  ),
  gpio: (c, s) => (
    <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke={c} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" style={{display:"block"}}>
      <rect x="7" y="7" width="10" height="10" rx="1.5"/>
      <line x1="2"  y1="9"  x2="7"  y2="9"/>
      <line x1="2"  y1="12" x2="7"  y2="12"/>
      <line x1="2"  y1="15" x2="7"  y2="15"/>
      <line x1="17" y1="9"  x2="22" y2="9"/>
      <line x1="17" y1="12" x2="22" y2="12"/>
      <line x1="17" y1="15" x2="22" y2="15"/>
      <circle cx="12" cy="12" r="1.5" fill={c} strokeWidth="0" opacity="0.8"/>
    </svg>
  ),
  plasticscm: (c, s) => (
    <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke={c} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" style={{display:"block"}}>
      <circle cx="5"  cy="5"  r="2.5"/>
      <circle cx="5"  cy="20" r="2.5"/>
      <circle cx="19" cy="12" r="2.5"/>
      <line x1="5" y1="7.5" x2="5" y2="17.5"/>
      <path d="M5 8 Q5 12 16.5 12"/>
      <path d="M5 17 Q5 12 16.5 12"/>
    </svg>
  ),
  tklogger: (c, s) => (
    <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke={c} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" style={{display:"block"}}>
      <rect x="3" y="2" width="14" height="18" rx="1.5"/>
      <line x1="7"  y1="7"  x2="13" y2="7"/>
      <line x1="7"  y1="10" x2="15" y2="10"/>
      <line x1="7"  y1="13" x2="11" y2="13"/>
      <circle cx="18" cy="17" r="4.5" fill="var(--bg)" strokeWidth="1.5"/>
      <line x1="16" y1="15" x2="20" y2="19" strokeWidth="2.5"/>
      <circle cx="15.5" cy="14.5" r="1.5" fill={c} strokeWidth="0"/>
    </svg>
  ),
  ea: (c, s) => (
    <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke={c} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" style={{display:"block"}}>
      <rect x="1"  y="3"  width="10" height="7" rx="1"/>
      <rect x="1"  y="14" width="10" height="7" rx="1"/>
      <rect x="13" y="8"  width="10" height="7" rx="1" fill={c} opacity="0.1"/>
      <rect x="13" y="8"  width="10" height="7" rx="1"/>
      <line x1="11" y1="6.5"  x2="13" y2="11.5"/>
      <line x1="11" y1="17.5" x2="13" y2="11.5"/>
    </svg>
  ),
  polarion: (c, s) => (
    <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke={c} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" style={{display:"block"}}>
      <rect x="2"  y="3"  width="20" height="4.5" rx="1"/>
      <rect x="2"  y="10" width="20" height="4"   rx="1" opacity="0.7"/>
      <rect x="2"  y="17" width="20" height="4"   rx="1" opacity="0.45"/>
      <line x1="6" y1="7.5"  x2="6"  y2="10"/>
      <line x1="12" y1="7.5" x2="12" y2="10"/>
      <line x1="8" y1="14"   x2="8"  y2="17"/>
    </svg>
  ),
  gdb: (c, s) => (
    <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke={c} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" style={{display:"block"}}>
      <circle cx="12" cy="13" r="7"/>
      <circle cx="12" cy="13" r="3" fill={c} opacity="0.2" strokeWidth="0"/>
      <circle cx="12" cy="13" r="1.2" fill={c} strokeWidth="0"/>
      <line x1="12" y1="6"  x2="12" y2="3"  strokeWidth="2"/>
      <circle cx="12" cy="3" r="1.8" fill={c} strokeWidth="0"/>
      <line x1="9"  y1="4" x2="12" y2="6"/>
      <line x1="15" y1="4" x2="12" y2="6"/>
    </svg>
  ),
  dlt: (c, s) => (
    <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke={c} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" style={{display:"block"}}>
      <rect x="2" y="2" width="20" height="20" rx="1.5"/>
      <rect x="5" y="6"  width="5" height="3" rx="0.5" fill={c} opacity="0.7" strokeWidth="0"/>
      <line x1="12" y1="7.5" x2="19" y2="7.5"/>
      <rect x="5" y="11" width="3" height="3" rx="0.5" fill={c} opacity="0.5" strokeWidth="0"/>
      <line x1="10" y1="12.5" x2="19" y2="12.5"/>
      <rect x="5" y="16" width="8" height="3" rx="0.5" fill={c} opacity="0.3" strokeWidth="0"/>
    </svg>
  ),
  hil: (c, s) => (
    <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke={c} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" style={{display:"block"}}>
      <path d="M12 3 A9 9 0 1 1 3 12" strokeDasharray="4 2" strokeWidth="1.5"/>
      <path d="M3 7 L3 12 L8 12" strokeWidth="1.5"/>
      <rect x="8"  y="8"  width="8" height="8" rx="1" fill={c} opacity="0.15"/>
      <rect x="8"  y="8"  width="8" height="8" rx="1"/>
      <line x1="3"  y1="12" x2="8"  y2="12"/>
      <line x1="16" y1="12" x2="21" y2="12"/>
    </svg>
  ),
  ecu: (c, s) => (
    <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke={c} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" style={{display:"block"}}>
      <rect x="4" y="6" width="16" height="12" rx="2" fill={c} opacity="0.08"/>
      <rect x="4" y="6" width="16" height="12" rx="2"/>
      <line x1="8"  y1="4" x2="8"  y2="6"/>
      <line x1="12" y1="4" x2="12" y2="6"/>
      <line x1="16" y1="4" x2="16" y2="6"/>
      <line x1="8"  y1="18" x2="8"  y2="20"/>
      <line x1="12" y1="18" x2="12" y2="20"/>
      <line x1="16" y1="18" x2="16" y2="20"/>
      <circle cx="12" cy="12" r="2.5"/>
      <circle cx="12" cy="12" r="1" fill={c} strokeWidth="0"/>
    </svg>
  ),
  fontforge: (c, s) => (
    <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke={c} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" style={{display:"block"}}>
      <path d="M5 21 L10 3 L19 3 L19 8 L12 8 L11 12 L18 12 L18 16 L11 16" strokeLinejoin="round"/>
      <circle cx="5"  cy="21" r="2"   fill={c} strokeWidth="0"/>
      <circle cx="19" cy="3"  r="1.5" fill={c} strokeWidth="0" opacity="0.5"/>
      <circle cx="10" cy="3"  r="1.5" fill={c} strokeWidth="0" opacity="0.3"/>
    </svg>
  ),
  agile: (c, s) => (
    <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke={c} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" style={{display:"block"}}>
      <path d="M12 4 A8 8 0 0 1 20 12"/>
      <path d="M20 12 A8 8 0 0 1 12 20"/>
      <path d="M12 20 A8 8 0 0 1 4 12"/>
      <path d="M4 12 A8 8 0 0 1 12 4"/>
      <path d="M9.5 1.5 L12 4 L9.5 6.5" fill={c} strokeWidth="1.5"/>
      <circle cx="12" cy="12" r="2" fill={c} opacity="0.3" strokeWidth="0"/>
    </svg>
  ),
  aspice: (c, s) => (
    <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke={c} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" style={{display:"block"}}>
      <path d="M2 5 L12 21 L22 5"/>
      <circle cx="2"  cy="5"  r="2" fill={c} strokeWidth="0"/>
      <circle cx="22" cy="5"  r="2" fill={c} strokeWidth="0"/>
      <circle cx="12" cy="21" r="2" fill={c} strokeWidth="0"/>
      <path d="M6 11 L10 11" strokeWidth="1.2"/>
      <path d="M14 11 L18 11" strokeWidth="1.2"/>
      <circle cx="7"  cy="11" r="1" fill={c} strokeWidth="0" opacity="0.7"/>
      <circle cx="17" cy="11" r="1" fill={c} strokeWidth="0" opacity="0.7"/>
    </svg>
  ),
  uml: (c, s) => (
    <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke={c} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" style={{display:"block"}}>
      <rect x="1"  y="2"  width="10" height="8" rx="1"/>
      <line x1="1"  y1="5.5" x2="11" y2="5.5"/>
      <rect x="13" y="14" width="10" height="8" rx="1" fill={c} opacity="0.1"/>
      <rect x="13" y="14" width="10" height="8" rx="1"/>
      <line x1="13" y1="17.5" x2="23" y2="17.5"/>
      <path d="M11 6 L18 17.5" strokeWidth="1.5"/>
      <path d="M16 14.5 L18 17.5 L15 18" strokeWidth="1.2" fill={c}/>
    </svg>
  ),
});
