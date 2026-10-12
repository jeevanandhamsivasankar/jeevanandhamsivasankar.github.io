// Black-box expected values for the qualification tests (not imported from src/).
export const NAV = [
  { id: 'about', label: 'About', icon: 'person' },
  { id: 'experience', label: 'Experience', icon: 'work' },
  { id: 'skills', label: 'Skills', icon: 'build' },
  { id: 'projects', label: 'Projects', icon: 'rocket_launch' },
  { id: 'design', label: 'Design', icon: 'brush' },
  { id: 'education', label: 'Education', icon: 'school' },
  { id: 'certifications', label: 'Certs', icon: 'verified' },
  { id: 'resume', label: 'Resume', icon: 'description' },
  { id: 'contact', label: 'Contact', icon: 'mail' },
]
export const SECTION_IDS = ['hero', ...NAV.map((n) => n.id)]
export const ROLES = [
  'Qt / QML Developer',
  'Embedded HMI Engineer',
  'UX / UI Engineer',
  'Instrument Cluster Dev',
  'Medical Device HMI Eng',
]
export const RESUME_DOWNLOAD = 'Jeevanandham_SeniorHMIEngineer_Resume.pdf'
export const BEHANCE = 'https://behance.net/s_jeevanandham'
export const NIGHT = '2026-06-21T17:30:00Z' // 23:00 IST
export const DAY = '2026-06-21T06:30:00Z' // 12:00 IST
export const THEME_KEY = 'jsv-theme-override'
export const SECTION_LABELS = [
  '01 — About', '02 — Experience', '03 — Skills', '04 — Engineering Projects', '05 — Design Portfolio',
  '06 — Education', '07 — Certifications', '08 — Resume', '09 — Contact',
]
