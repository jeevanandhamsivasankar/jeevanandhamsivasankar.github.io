import { useState, useEffect, useRef } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL STYLES
// ─────────────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Barlow:wght@300;400;500;600;700&family=Barlow+Condensed:wght@400;600;700;800&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap');

/* ── NIGHT (default) THEME ── */
:root {
  --bg:     #060c18;
  --bg2:    #090f1e;
  --surf:   #0d1626;
  --surf2:  #111d30;
  --bdr:    rgba(255,255,255,0.07);
  --bdr2:   rgba(255,255,255,0.13);
  --amber:  #f59e0b;
  --cyan:   #22d3ee;
  --green:  #34d399;
  --rose:   #fb7185;
  --violet: #a78bfa;
  --text:   #e2e8f0;
  --text2:  #94a3b8;
  --muted:  #475569;
  --mono:   'Share Tech Mono', monospace;
  --sans:   'Barlow', sans-serif;
  --disp:   'Barlow Condensed', sans-serif;
  --glass-bg:   rgba(13,22,38,0.55);
  --glass-bdr:  rgba(255,255,255,0.10);
  --glass-shine:rgba(255,255,255,0.06);
}

/* ── DAY THEME ── */
[data-theme="day"] {
  --bg:     #fef9f0;
  --bg2:    #fdf3e2;
  --surf:   rgba(255,255,255,0.62);
  --surf2:  rgba(255,255,255,0.48);
  --bdr:    rgba(0,0,0,0.07);
  --bdr2:   rgba(0,0,0,0.13);
  --amber:  #b45309;
  --cyan:   #0369a1;
  --green:  #15803d;
  --rose:   #be123c;
  --violet: #6d28d9;
  --text:   #1e293b;
  --text2:  #475569;
  --muted:  #94a3b8;
  --glass-bg:   rgba(255,255,255,0.52);
  --glass-bdr:  rgba(255,255,255,0.80);
  --glass-shine:rgba(255,255,255,0.95);
}

/* ── SMOOTH THEME TRANSITIONS ── */
html { transition: background-color 1.2s ease, color 0.6s ease; }
body { transition: background 1.2s ease, color 0.6s ease; }
.nav, .gauge-widget, .stat-card, .project-card, .skill-group,
.cert-card, .edu-card, .profile-info-panel, .resume-preview,
.exp-item, .badge, .btn, footer {
  transition:
    background 0.8s ease,
    background-color 0.8s ease,
    border-color 0.5s ease,
    color 0.4s ease,
    box-shadow 0.5s ease;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; font-size: 16px; }
body {
  background: var(--bg); color: var(--text);
  font-family: var(--sans); font-weight: 300; line-height: 1.7;
  overflow-x: hidden;
}
a { color: inherit; text-decoration: none; }
::selection { background: rgba(245,158,11,0.3); color: #fff; }

/* Scrollbar */
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: var(--bg); }
::-webkit-scrollbar-thumb { background: rgba(245,158,11,0.4); border-radius: 2px; }

/* Grid background */
body::before {
  content: ''; position: fixed; inset: 0; z-index: 0; pointer-events: none;
  background-image:
    linear-gradient(rgba(245,158,11,0.022) 1px, transparent 1px),
    linear-gradient(90deg, rgba(245,158,11,0.022) 1px, transparent 1px);
  background-size: 56px 56px;
  transition: opacity 1.2s ease;
}
[data-theme="day"] body::before {
  background-image:
    linear-gradient(rgba(180,83,9,0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(180,83,9,0.035) 1px, transparent 1px);
}
body::after {
  content: ''; position: fixed; inset: 0; z-index: 0; pointer-events: none;
  background: radial-gradient(ellipse 80% 60% at 70% 40%, rgba(245,158,11,0.05) 0%, transparent 65%);
  transition: background 1.2s ease;
}
[data-theme="day"] body::after {
  background: radial-gradient(ellipse 90% 70% at 30% 20%, rgba(250,204,21,0.18) 0%, transparent 60%);
}

/* ── KEYFRAMES ── */
@keyframes fadeUp   { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
@keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
@keyframes slideIn  { from { opacity:0; transform:translateX(-20px); } to { opacity:1; transform:translateX(0); } }
@keyframes rspin    { to { transform: translate(-50%,-50%) rotate(360deg); } }
@keyframes rspinRev { to { transform: translate(-50%,-50%) rotate(-360deg); } }
@keyframes pulse    { 0%,100% { box-shadow: 0 0 0 0 rgba(52,211,153,0.5); } 50% { box-shadow: 0 0 0 6px rgba(52,211,153,0); } }
@keyframes scanline { 0% { top: 0%; opacity: 0.8; } 100% { top: 100%; opacity: 0; } }
@keyframes blink    { 0%,100% { opacity:1; } 50% { opacity:0; } }
@keyframes float    { 0%,100% { transform:translateY(0px); } 50% { transform:translateY(-10px); } }
@keyframes shimmer  { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
@keyframes particleFade {
  0%   { transform: translateY(0) translateX(0) scale(1); opacity: 0.8; }
  100% { transform: translateY(-120px) translateX(var(--dx)) scale(0); opacity: 0; }
}
@keyframes glow     { 0%,100% { filter: drop-shadow(0 0 4px rgba(245,158,11,0.4)); } 50% { filter: drop-shadow(0 0 12px rgba(245,158,11,0.8)); } }
@keyframes borderTrace {
  0%   { clip-path: inset(0 100% 0 0); }
  100% { clip-path: inset(0 0 0 0); }
}
@keyframes countUp { from { opacity:0; transform:scale(0.7); } to { opacity:1; transform:scale(1); } }
@keyframes orbFloat1 { 0%,100% { transform:translate(0,0) scale(1); } 33% { transform:translate(40px,-30px) scale(1.1); } 66% { transform:translate(-25px,35px) scale(0.92); } }
@keyframes orbFloat2 { 0%,100% { transform:translate(0,0) scale(1); } 50% { transform:translate(-40px,-50px) scale(1.15); } }
@keyframes orbFloat3 { 0%,100% { transform:translate(0,0) scale(1); } 40% { transform:translate(30px,40px) scale(0.88); } 80% { transform:translate(-15px,-25px) scale(1.08); } }
@keyframes orbFloat4 { 0%,100% { transform:translate(0,0) scale(1); } 60% { transform:translate(20px,-30px) scale(1.05); } }
@keyframes cursorPulse { 0%,100% { opacity:0.6; transform:translate(-50%,-50%) scale(1); } 50% { opacity:0.3; transform:translate(-50%,-50%) scale(1.2); } }
@keyframes sunriseFade { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
@keyframes ringPop { from { opacity:0; transform:translate(-50%,-50%) scale(0.8); } to { opacity:1; transform:translate(-50%,-50%) scale(1); } }

/* ── GRADIENT ORBS ── */
.orbs-wrap { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }
.orb { position: absolute; border-radius: 50%; }
.orb-1 {
  width: 700px; height: 700px; top: -15%; right: -10%;
  background: radial-gradient(circle, rgba(167,139,250,0.22) 0%, rgba(167,139,250,0.08) 40%, transparent 70%);
  filter: blur(70px);
  animation: orbFloat1 20s ease-in-out infinite;
  transition: background 1.4s ease;
}
.orb-2 {
  width: 600px; height: 600px; bottom: 10%; left: -10%;
  background: radial-gradient(circle, rgba(34,211,238,0.18) 0%, rgba(34,211,238,0.05) 45%, transparent 70%);
  filter: blur(80px);
  animation: orbFloat2 25s ease-in-out infinite;
  transition: background 1.4s ease;
}
.orb-3 {
  width: 500px; height: 500px; top: 35%; right: 15%;
  background: radial-gradient(circle, rgba(245,158,11,0.16) 0%, rgba(245,158,11,0.04) 50%, transparent 70%);
  filter: blur(65px);
  animation: orbFloat3 18s ease-in-out infinite;
  transition: background 1.4s ease;
}
.orb-4 {
  width: 400px; height: 400px; bottom: 5%; right: 35%;
  background: radial-gradient(circle, rgba(52,211,153,0.14) 0%, transparent 70%);
  filter: blur(60px);
  animation: orbFloat4 28s ease-in-out infinite;
  transition: background 1.4s ease;
}

/* Day mode orbs — warm, vibrant, sky-like */
[data-theme="day"] .orb-1 {
  background: radial-gradient(circle, rgba(250,204,21,0.45) 0%, rgba(251,146,60,0.2) 40%, transparent 70%);
  top: -5%; left: -5%; right: auto;
}
[data-theme="day"] .orb-2 {
  background: radial-gradient(circle, rgba(244,114,182,0.30) 0%, rgba(168,85,247,0.12) 45%, transparent 70%);
  bottom: 5%; right: -8%; left: auto;
}
[data-theme="day"] .orb-3 {
  background: radial-gradient(circle, rgba(56,189,248,0.40) 0%, rgba(34,211,238,0.18) 45%, transparent 70%);
  top: 25%; right: 5%;
}
[data-theme="day"] .orb-4 {
  background: radial-gradient(circle, rgba(167,243,208,0.38) 0%, rgba(52,211,153,0.15) 50%, transparent 70%);
  bottom: 25%; left: 15%; right: auto;
}

/* ── CURSOR GLOW ── */
.cursor-glow {
  position: fixed; z-index: 9998; pointer-events: none;
  width: 380px; height: 380px; border-radius: 50%;
  background: radial-gradient(circle, rgba(245,158,11,0.07) 0%, transparent 65%);
  transform: translate(-50%, -50%);
  will-change: left, top;
  mix-blend-mode: screen;
  animation: cursorPulse 3s ease-in-out infinite;
  transition: left 0.06s linear, top 0.06s linear;
}
[data-theme="day"] .cursor-glow {
  background: radial-gradient(circle, rgba(251,191,36,0.22) 0%, rgba(249,115,22,0.08) 45%, transparent 65%);
  mix-blend-mode: multiply;
}

/* ── LIQUID GLASS BASE ── */
.glass {
  background: var(--glass-bg) !important;
  backdrop-filter: blur(28px) saturate(200%) brightness(1.12);
  -webkit-backdrop-filter: blur(28px) saturate(200%) brightness(1.12);
  border: 1px solid var(--glass-bdr) !important;
  box-shadow: 0 8px 40px rgba(0,0,0,0.18), inset 0 1.5px 0 var(--glass-shine) !important;
}

/* Glass specular highlight (top inner shine) */
.glass::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; height: 1px;
  background: var(--glass-shine);
  border-radius: inherit;
  pointer-events: none;
  z-index: 1;
}

.glass-card {
  background: var(--glass-bg);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid var(--glass-bdr);
  box-shadow: 0 4px 32px rgba(0,0,0,0.14), inset 0 1px 0 var(--glass-shine);
  position: relative; overflow: hidden;
}
.glass-card::after {
  content: '';
  position: absolute;
  top: 0; left: -100%; width: 60%; height: 100%;
  background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.07) 50%, transparent 60%);
  pointer-events: none; z-index: 0;
  transition: left 0.6s ease;
}
.glass-card:hover::after { left: 140%; }

/* ── THEME TOGGLE BUTTON ── */
.theme-btn {
  display: flex; align-items: center; gap: 6px;
  font-family: var(--mono); font-size: 10px; letter-spacing: 0.1em;
  color: var(--text2); background: var(--glass-bg);
  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-bdr); border-radius: 20px;
  padding: 6px 13px; cursor: pointer; transition: all 0.3s;
  white-space: nowrap;
}
.theme-btn:hover { color: var(--amber); border-color: var(--amber); transform: scale(1.04); }
.theme-btn .ms { font-size: 14px; transition: transform 0.4s ease; }
.theme-btn:hover .ms { transform: rotate(30deg); }

/* ── THEME BADGE ── */
.theme-badge {
  display: flex; align-items: center; gap: 5px;
  font-family: var(--mono); font-size: 9px; letter-spacing: 0.18em;
  color: var(--amber); background: rgba(245,158,11,0.08);
  border: 1px solid rgba(245,158,11,0.22);
  border-radius: 20px; padding: 4px 10px;
  animation: sunriseFade 0.5s ease both;
}
[data-theme="day"] .theme-badge {
  color: var(--amber);
  background: rgba(180,83,9,0.1);
  border-color: rgba(180,83,9,0.3);
}

/* ── NAV ── */
.nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 300;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 36px; height: 64px;
  background: var(--glass-bg);
  backdrop-filter: blur(28px) saturate(200%);
  -webkit-backdrop-filter: blur(28px) saturate(200%);
  border-bottom: 1px solid var(--glass-bdr);
  box-shadow: 0 1px 0 var(--glass-shine), 0 4px 32px rgba(0,0,0,0.12);
  transition: all 0.3s;
}
.nav.scrolled { height: 54px; }
[data-theme="day"] .nav { box-shadow: 0 1px 0 var(--glass-shine), 0 4px 24px rgba(0,0,0,0.06); }
.nav-logo { font-family: var(--mono); font-size: 11px; color: var(--amber); letter-spacing: 0.15em; display: flex; align-items: center; gap: 9px; }
.nav-links { display: flex; gap: 2px; list-style: none; }
.nav-link {
  font-family: var(--mono); font-size: 10.5px; letter-spacing: 0.1em; color: var(--text2);
  text-transform: uppercase; padding: 7px 12px; border-radius: 5px;
  display: flex; align-items: center; gap: 5px; transition: all 0.2s; cursor: pointer;
}
.nav-link:hover, .nav-link.active { color: var(--amber); background: rgba(245,158,11,0.12); }
.nav-link .ms { font-size: 13px; }
.nav-right { display: flex; align-items: center; gap: 10px; }
.hamburger { display: none; flex-direction: column; gap: 5px; background: none; border: none; cursor: pointer; padding: 4px; }
.hamburger span { display: block; width: 22px; height: 2px; background: var(--amber); border-radius: 2px; transition: all 0.3s; }
.mobile-menu {
  display: none; position: fixed; top: 64px; left: 0; right: 0;
  background: var(--glass-bg);
  backdrop-filter: blur(28px) saturate(200%);
  -webkit-backdrop-filter: blur(28px) saturate(200%);
  border-bottom: 1px solid var(--glass-bdr);
  z-index: 299; padding: 16px 24px; flex-direction: column; gap: 4px;
}
.mobile-menu.open { display: flex; }
.mobile-menu .nav-link { font-size: 12px; padding: 11px 14px; }

/* ── HERO ── */
.hero {
  position: relative; min-height: 100vh;
  display: grid; grid-template-columns: 1fr 360px 260px;
  align-items: center; padding: 100px 44px 80px; gap: 32px; z-index: 1; overflow: hidden;
}
.hero-center {
  position: relative; z-index: 2;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px;
}
.gauge-widget {
  width: 100%;
  background: var(--glass-bg);
  backdrop-filter: blur(28px) saturate(200%);
  -webkit-backdrop-filter: blur(28px) saturate(200%);
  border: 1px solid rgba(245,158,11,0.22);
  border-radius: 20px;
  padding: 18px 20px 16px;
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  box-shadow:
    0 0 60px rgba(245,158,11,0.08),
    0 24px 48px rgba(0,0,0,0.25),
    inset 0 1.5px 0 rgba(255,255,255,0.12);
  animation: fadeIn 0.9s 0.5s both;
  position: relative; overflow: hidden;
}
/* Iridescent top shine on gauge */
.gauge-widget::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(245,158,11,0.5), rgba(34,211,238,0.4), rgba(167,139,250,0.3), transparent);
  pointer-events: none;
}
[data-theme="day"] .gauge-widget {
  border-color: rgba(180,83,9,0.28);
  box-shadow: 0 0 40px rgba(180,83,9,0.1), 0 20px 40px rgba(0,0,0,0.1), inset 0 1.5px 0 rgba(255,255,255,0.95);
}
.gauge-label-top {
  font-family: var(--mono); font-size: 9px; color: rgba(34,211,238,0.65);
  letter-spacing: 0.28em; text-transform: uppercase;
}
.gauge-stats-row { display: flex; gap: 8px; width: 100%; }
.gauge-stat {
  display: flex; flex-direction: column; align-items: center; gap: 3px;
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
  border-radius: 8px; padding: 8px 6px; flex: 1;
  backdrop-filter: blur(10px);
}
[data-theme="day"] .gauge-stat {
  background: rgba(255,255,255,0.5);
  border-color: rgba(0,0,0,0.08);
}
.gauge-stat-val { font-family: var(--disp); font-size: 17px; font-weight: 800; line-height: 1; }
.gauge-stat-lbl { font-family: var(--mono); font-size: 7.5px; color: var(--muted); letter-spacing: 0.12em; text-transform: uppercase; text-align: center; }
.gauge-divider { width: 100%; height: 1px; background: var(--bdr); }
.gauge-stack-tags { display: flex; gap: 6px; flex-wrap: wrap; justify-content: center; }
.gauge-stack-tag {
  font-family: var(--mono); font-size: 8.5px; color: rgba(34,211,238,0.6);
  border: 1px solid rgba(34,211,238,0.18); border-radius: 3px; padding: 3px 9px; letter-spacing: 0.1em;
  backdrop-filter: blur(8px);
}
[data-theme="day"] .gauge-stack-tag { color: var(--cyan); border-color: rgba(3,105,161,0.25); background: rgba(3,105,161,0.06); }
.hero-rings { position: absolute; right: -60px; top: 50%; width: 600px; height: 600px; z-index: 0; pointer-events: none; }
.hring {
  position: absolute; border-radius: 50%; border: 1px solid;
  top: 50%; left: 50%; transform: translate(-50%,-50%);
  animation: ringPop 1s ease both;
}
.hring-1 { width:580px; height:580px; border-color:rgba(245,158,11,0.04); animation: rspin 80s linear infinite; }
.hring-2 { width:440px; height:440px; border-color:rgba(245,158,11,0.07); animation: rspinRev 55s linear infinite; }
.hring-3 { width:300px; height:300px; border-color:rgba(34,211,238,0.08); border-style:dashed; animation: rspin 36s linear infinite; }
.hring-4 { width:180px; height:180px; border-color:rgba(52,211,153,0.06); animation: rspinRev 24s linear infinite; }

[data-theme="day"] .hring-1 { border-color: rgba(180,83,9,0.07); }
[data-theme="day"] .hring-2 { border-color: rgba(180,83,9,0.10); }
[data-theme="day"] .hring-3 { border-color: rgba(3,105,161,0.12); }
[data-theme="day"] .hring-4 { border-color: rgba(21,128,61,0.10); }

.hero-content { position: relative; z-index: 2; }
.hero-tag {
  font-family: var(--mono); font-size: 10.5px; color: var(--amber); letter-spacing: 0.24em; text-transform: uppercase;
  margin-bottom: 22px; display: flex; align-items: center; gap: 8px;
  opacity: 0; animation: fadeUp 0.55s 0.15s forwards;
}
.hero-tag::before { content: ''; display: inline-block; width: 24px; height: 1px; background: var(--amber); }
.hero-name {
  font-family: var(--disp); font-size: clamp(38px,5.5vw,72px);
  font-weight: 800; line-height: 1.0; letter-spacing: -0.01em; text-transform: uppercase;
  opacity: 0; animation: fadeUp 0.7s 0.28s forwards;
}
.hero-name em { color: var(--amber); font-style: normal; }
.hero-typewriter {
  margin-top: 20px; font-family: var(--mono); font-size: 13px; color: var(--cyan);
  letter-spacing: 0.06em; min-height: 22px; display: flex; align-items: center; gap: 2px;
  opacity: 0; animation: fadeUp 0.55s 0.42s forwards;
}
.cursor { animation: blink 1s infinite; color: var(--amber); }
.hero-bio {
  margin-top: 18px; font-size: 15px; color: var(--text2); max-width: 520px; line-height: 1.9;
  opacity: 0; animation: fadeUp 0.65s 0.52s forwards;
}
.hero-bio strong { color: var(--text); font-weight: 500; }
.hero-badges {
  margin-top: 26px; display: flex; gap: 7px; flex-wrap: wrap;
  opacity: 0; animation: fadeUp 0.55s 0.62s forwards;
}
.badge {
  font-family: var(--mono); font-size: 9.5px; letter-spacing: 0.1em; color: var(--text2);
  background: var(--glass-bg);
  backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--glass-bdr); border-radius: 3px; padding: 5px 11px;
  display: flex; align-items: center; gap: 5px; transition: all 0.22s; cursor: default;
}
.badge:hover {
  border-color: var(--amber); color: var(--amber); transform: translateY(-2px);
  background: rgba(245,158,11,0.1);
  box-shadow: 0 4px 16px rgba(245,158,11,0.15);
}
[data-theme="day"] .badge:hover { box-shadow: 0 4px 16px rgba(180,83,9,0.18); }
.hero-cta { margin-top: 32px; display: flex; gap: 12px; flex-wrap: wrap; opacity: 0; animation: fadeUp 0.65s 0.72s forwards; }

/* Buttons */
.btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 12px 24px; font-family: var(--mono); font-size: 11.5px;
  letter-spacing: 0.08em; border-radius: 8px; transition: all 0.25s;
  cursor: pointer; border: none; text-decoration: none; white-space: nowrap;
  position: relative; overflow: hidden;
}
.btn::before {
  content: '';
  position: absolute; top: 0; left: -100%; width: 60%; height: 100%;
  background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%);
  transition: left 0.5s ease; pointer-events: none;
}
.btn:hover::before { left: 140%; }
.btn .ms { font-size: 17px; }
.btn-amber {
  background: linear-gradient(135deg, var(--amber) 0%, #fbbf24 100%);
  color: #06080f; font-weight: 700;
  box-shadow: 0 4px 20px rgba(245,158,11,0.3);
}
.btn-amber:hover { background: linear-gradient(135deg, #fbbf24 0%, var(--amber) 100%); transform: translateY(-2px); box-shadow: 0 10px 36px rgba(245,158,11,0.4); }
.btn-outline {
  background: var(--glass-bg); color: var(--text); border: 1px solid var(--glass-bdr);
  backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
}
.btn-outline:hover { border-color: var(--amber); color: var(--amber); transform: translateY(-2px); background: rgba(245,158,11,0.08); }
.btn-green {
  background: linear-gradient(135deg, rgba(52,211,153,0.15), rgba(34,211,238,0.10));
  color: var(--green); border: 1px solid rgba(52,211,153,0.28);
  backdrop-filter: blur(16px);
}
.btn-green:hover { background: linear-gradient(135deg, rgba(52,211,153,0.28), rgba(34,211,238,0.18)); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(52,211,153,0.25); }

/* ── PROFILE CARD ── */
.hero-right { position: relative; z-index: 2; display: flex; justify-content: center; align-items: center; }
.profile-card { position: relative; width: 300px; opacity: 0; animation: fadeIn 0.9s 0.4s forwards; }
.profile-photo-frame {
  position: relative; width: 220px; height: 265px; margin: 0 auto;
  animation: float 6s ease-in-out infinite;
}
.profile-photo-frame::before {
  content: ''; position: absolute; inset: -2px; border-radius: 18px;
  background: linear-gradient(135deg, var(--amber), var(--violet) 40%, var(--cyan));
  z-index: 0; animation: glow 3s ease-in-out infinite;
}
.profile-photo-frame::after {
  content: ''; position: absolute; inset: 1px; border-radius: 16px;
  background: var(--bg); z-index: 1;
}
.profile-photo {
  position: relative; z-index: 2; width: 100%; height: 100%;
  object-fit: cover; object-position: center top;
  border-radius: 16px; display: block;
  filter: brightness(1.05) contrast(1.03) saturate(1.05);
}
.profile-photo-placeholder {
  position: relative; z-index: 2; width: 100%; height: 100%;
  border-radius: 16px; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 12px;
  background: linear-gradient(135deg, #0d1626, #111d30);
}
.scan {
  position: absolute; z-index: 3; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, transparent, var(--amber), transparent);
  animation: scanline 3s ease-in-out infinite; pointer-events: none; opacity: 0.6;
}
.corner { position: absolute; width: 16px; height: 16px; z-index: 4; }
.corner-tl { top:-4px; left:-4px; border-top:2px solid var(--amber); border-left:2px solid var(--amber); }
.corner-tr { top:-4px; right:-4px; border-top:2px solid var(--amber); border-right:2px solid var(--amber); }
.corner-bl { bottom:-4px; left:-4px; border-bottom:2px solid var(--amber); border-left:2px solid var(--amber); }
.corner-br { bottom:-4px; right:-4px; border-bottom:2px solid var(--amber); border-right:2px solid var(--amber); }

.profile-info-panel {
  margin-top: 18px;
  background: var(--glass-bg);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid var(--glass-bdr);
  border-radius: 14px; padding: 16px 18px; font-family: var(--mono);
  box-shadow: 0 4px 24px rgba(0,0,0,0.15), inset 0 1px 0 var(--glass-shine);
  position: relative; overflow: hidden;
}
.pname { font-size: 12px; color: var(--text); letter-spacing: 0.08em; margin-bottom: 3px; }
.prole { font-size: 10px; color: var(--amber); letter-spacing: 0.12em; margin-bottom: 10px; }
.status-row { display: flex; align-items: center; gap: 7px; font-size: 10px; color: var(--green); }
.status-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--green); animation: pulse 2s infinite; flex-shrink: 0; }
.profile-tags-row { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 10px; }
.ptag {
  font-size: 9px; color: var(--text2);
  background: rgba(255,255,255,0.05); border: 1px solid var(--bdr); border-radius: 2px; padding: 3px 7px;
  backdrop-filter: blur(8px);
}
[data-theme="day"] .ptag { background: rgba(255,255,255,0.6); border-color: rgba(0,0,0,0.1); }

/* ── SECTIONS ── */
.section-wrap { position: relative; z-index: 1; padding: 96px 44px; max-width: 1160px; margin: 0 auto; }
.full-band { position: relative; z-index: 1; }
.full-band .inner { max-width: 1160px; margin: 0 auto; padding: 96px 44px; }
.divider { width: 100%; height: 1px; background: var(--bdr); position: relative; z-index: 1; }
.section-label {
  font-family: var(--mono); font-size: 10px; color: var(--amber); letter-spacing: 0.3em;
  text-transform: uppercase; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;
}
.section-title {
  font-family: var(--disp); font-size: clamp(28px,4.5vw,52px);
  font-weight: 800; text-transform: uppercase; line-height: 1;
  letter-spacing: -0.01em; margin-bottom: 52px; color: var(--text);
}

/* ── REVEAL ── */
.reveal { opacity: 0; transform: translateY(30px); transition: opacity 0.7s cubic-bezier(.22,.68,0,1.2), transform 0.7s cubic-bezier(.22,.68,0,1.2); }
.reveal.visible { opacity: 1; transform: translateY(0); }
.d1 { transition-delay: 0.1s !important; }
.d2 { transition-delay: 0.2s !important; }
.d3 { transition-delay: 0.3s !important; }

/* ── ABOUT ── */
.about-grid { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 64px; align-items: start; }
.about-text p { font-size: 15px; color: var(--text2); line-height: 1.9; }
.about-text p + p { margin-top: 14px; }
.hl { color: var(--text); font-weight: 500; }
.stats { display: grid; grid-template-columns: 1fr 1fr; gap: 11px; }
.stat-card {
  background: var(--glass-bg);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid var(--glass-bdr);
  border-radius: 12px; padding: 22px 16px;
  display: flex; flex-direction: column; gap: 9px;
  cursor: default; position: relative; overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.12), inset 0 1px 0 var(--glass-shine);
  transition: all 0.3s;
}
.stat-card:hover { transform: translateY(-5px); box-shadow: 0 16px 48px rgba(0,0,0,0.2), inset 0 1px 0 var(--glass-shine); }
.stat-card::after {
  content: '';
  position: absolute; top: 0; left: -100%; width: 60%; height: 100%;
  background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.06) 50%, transparent 60%);
  transition: left 0.6s ease; pointer-events: none;
}
.stat-card:hover::after { left: 140%; }
.stat-num { font-family: var(--disp); font-size: 38px; font-weight: 800; line-height: 1; }
.stat-label { font-family: var(--mono); font-size: 9.5px; color: var(--muted); letter-spacing: 0.16em; text-transform: uppercase; }

/* ── EXPERIENCE ── */
.exp-band { background: var(--surf); border-top: 1px solid var(--bdr); border-bottom: 1px solid var(--bdr); }
[data-theme="day"] .exp-band {
  background: rgba(255,255,255,0.42);
  backdrop-filter: blur(20px);
}
.exp-timeline { position: relative; padding-left: 28px; }
.exp-timeline::before {
  content: ''; position: absolute; left: 0; top: 8px; bottom: 8px;
  width: 1px;
  background: linear-gradient(to bottom, var(--amber), rgba(167,139,250,0.4), rgba(34,211,238,0.3), rgba(245,158,11,0.05));
}
.exp-item { position: relative; padding: 36px 0 36px 40px; border-bottom: 1px solid var(--bdr); }
.exp-item:last-child { border-bottom: none; }
.exp-dot {
  position: absolute; left: -35px; top: 46px; width: 10px; height: 10px;
  border-radius: 50%; background: var(--amber); box-shadow: 0 0 0 3px rgba(245,158,11,0.2), 0 0 12px rgba(245,158,11,0.3);
  transition: all 0.3s;
}
.exp-item:hover .exp-dot { box-shadow: 0 0 0 5px rgba(245,158,11,0.2), 0 0 20px rgba(245,158,11,0.5); transform: scale(1.2); }
.exp-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; margin-bottom: 14px; }
.exp-icon { width: 46px; height: 46px; border-radius: 10px; display: flex; align-items: center; justify-content: center; background: rgba(245,158,11,0.12); border: 1px solid rgba(245,158,11,0.2); flex-shrink: 0; backdrop-filter: blur(10px); }
.exp-left { display: flex; align-items: center; gap: 14px; }
.exp-right { text-align: right; flex-shrink: 0; }
.exp-period { font-family: var(--mono); font-size: 10.5px; color: var(--amber); letter-spacing: 0.1em; }
.exp-company-loc { font-family: var(--mono); font-size: 10px; color: var(--muted); margin-top: 3px; }
.exp-role { font-family: var(--disp); font-size: 21px; font-weight: 700; text-transform: uppercase; margin-bottom: 4px; }
.exp-company-name { font-size: 13px; color: var(--text); font-weight: 500; margin-bottom: 10px; }
.exp-desc { font-size: 14px; color: var(--text2); line-height: 1.85; }

/* ── SKILLS ── */
.skills-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 13px; }
.skill-group {
  background: var(--glass-bg);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid var(--glass-bdr);
  border-radius: 14px; padding: 26px 22px;
  transition: all 0.3s; position: relative; overflow: hidden; cursor: default;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1), inset 0 1px 0 var(--glass-shine);
}
.skill-group::after {
  content: ''; position: absolute; top: 0; right: 0; width: 130px; height: 130px;
  border-radius: 50%; opacity: 0.1; transform: translate(35%,-35%); transition: opacity 0.3s, transform 0.3s;
  background: var(--sg-color, var(--amber));
}
.skill-group:hover { transform: translateY(-5px); box-shadow: 0 16px 48px rgba(0,0,0,0.18), inset 0 1px 0 var(--glass-shine); }
.skill-group:hover::after { opacity: 0.22; transform: translate(28%,-28%); }
.ski { width: 50px; height: 50px; border-radius: 10px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.06); border: 1px solid var(--bdr); margin-bottom: 14px; backdrop-filter: blur(8px); }
[data-theme="day"] .ski { background: rgba(255,255,255,0.6); }
.sgt { font-family: var(--mono); font-size: 10.5px; color: var(--text); letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 13px; font-weight: 600; }
.skill-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.stag {
  font-family: var(--mono); font-size: 9.5px; color: var(--text2);
  background: rgba(255,255,255,0.05); border: 1px solid var(--bdr); border-radius: 3px; padding: 3px 8px;
  transition: all 0.2s; backdrop-filter: blur(8px);
}
[data-theme="day"] .stag { background: rgba(255,255,255,0.55); border-color: rgba(0,0,0,0.08); }
.stag:hover { background: rgba(245,158,11,0.12); border-color: rgba(245,158,11,0.35); color: var(--amber); transform: translateY(-1px); }

/* ── PROJECTS ── */
.projects-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 16px; }
.project-card {
  background: var(--glass-bg);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid var(--glass-bdr);
  border-radius: 14px; padding: 28px 26px;
  position: relative; overflow: hidden; transition: all 0.32s;
  box-shadow: 0 4px 24px rgba(0,0,0,0.12), inset 0 1px 0 var(--glass-shine);
}
.project-card.wide { grid-column: 1 / -1; }
.project-card-line {
  position: absolute; top: 0; left: 0; right: 0; height: 2px;
  transform: scaleX(0); transform-origin: left; transition: transform 0.42s ease;
}
.project-card:hover { transform: translateY(-5px); box-shadow: 0 20px 56px rgba(0,0,0,0.2), inset 0 1px 0 var(--glass-shine); }
.project-card:hover .project-card-line { transform: scaleX(1); }
.project-period { font-family: var(--mono); font-size: 10px; color: var(--muted); margin-bottom: 14px; }
.project-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 14px; }
.pico { width: 50px; height: 50px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; backdrop-filter: blur(10px); }
.project-num { font-family: var(--mono); font-size: 9.5px; letter-spacing: 0.18em; margin-bottom: 3px; }
.project-domain { font-family: var(--mono); font-size: 9.5px; color: var(--muted); }
.project-title { font-family: var(--disp); font-size: 20px; font-weight: 700; text-transform: uppercase; margin-bottom: 9px; line-height: 1.1; }
.project-desc { font-size: 13px; color: var(--text2); line-height: 1.85; }
.project-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 16px; }
.ptag2 {
  font-family: var(--mono); font-size: 9.5px; border-radius: 3px; padding: 3px 8px; border: 1px solid;
  transition: all 0.2s; backdrop-filter: blur(8px);
}

/* ── BEHANCE / DESIGN ── */
.behance-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 16px; }
.behance-card {
  position: relative; border-radius: 14px; overflow: hidden;
  border: 1px solid var(--glass-bdr); transition: all 0.35s; display: block;
  min-height: 240px; text-decoration: none;
  backdrop-filter: blur(2px);
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}
.behance-card.wide { grid-column: 1 / -1; }
.behance-card:hover { transform: translateY(-5px); border-color: var(--bdr2); box-shadow: 0 24px 64px rgba(0,0,0,0.35); }
.behance-card-bg { position: absolute; inset: 0; }
.behance-card-bg svg { width: 100%; height: 100%; object-fit: cover; }
.behance-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(6,12,24,0.95) 40%, rgba(6,12,24,0.35)); }
[data-theme="day"] .behance-overlay { background: linear-gradient(to top, rgba(15,23,42,0.92) 40%, rgba(15,23,42,0.3)); }
.behance-card-content { position: relative; z-index: 2; padding: 28px; display: flex; flex-direction: column; justify-content: flex-end; height: 100%; }
.bc-tag { font-family: var(--mono); font-size: 9.5px; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 10px; display: flex; align-items: center; gap: 6px; }
.bc-title { font-family: var(--disp); font-size: 20px; font-weight: 700; text-transform: uppercase; color: #e2e8f0; margin-bottom: 8px; line-height: 1.1; }
.bc-desc { font-size: 13px; color: rgba(148,163,184,0.9); line-height: 1.8; margin-bottom: 14px; }
.bc-cta { font-family: var(--mono); font-size: 10.5px; letter-spacing: 0.12em; display: inline-flex; align-items: center; gap: 6px; transition: gap 0.2s; }
.behance-card:hover .bc-cta { gap: 10px; }

/* ── CERTS ── */
.certs-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 13px; }
.cert-card {
  background: var(--glass-bg);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid var(--glass-bdr); border-radius: 14px;
  padding: 28px 24px; transition: all 0.3s; cursor: default;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1), inset 0 1px 0 var(--glass-shine);
  position: relative; overflow: hidden;
}
.cert-card:hover { border-color: rgba(245,158,11,0.4); transform: translateY(-4px); box-shadow: 0 16px 48px rgba(245,158,11,0.12), inset 0 1px 0 var(--glass-shine); }
.cert-ico { width: 46px; height: 46px; border-radius: 10px; display: flex; align-items: center; justify-content: center; background: rgba(245,158,11,0.12); border: 1px solid rgba(245,158,11,0.2); margin-bottom: 16px; backdrop-filter: blur(8px); }
.cert-name { font-size: 14px; font-weight: 500; color: var(--text); line-height: 1.5; margin-bottom: 10px; }
.cert-org { font-family: var(--mono); font-size: 10px; color: var(--amber); letter-spacing: 0.18em; }

/* ── EDUCATION ── */
.edu-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 16px; }
.edu-card {
  background: var(--glass-bg);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid var(--glass-bdr); border-radius: 14px;
  padding: 28px 26px; transition: all 0.3s; cursor: default; position: relative; overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1), inset 0 1px 0 var(--glass-shine);
}
.edu-card::before { content: ''; position: absolute; top:0; left:0; right:0; height:2px; background: linear-gradient(90deg, var(--amber), var(--cyan), var(--violet)); transform: scaleX(0); transform-origin: left; transition: transform 0.4s ease; }
.edu-card:hover { transform: translateY(-4px); box-shadow: 0 16px 48px rgba(0,0,0,0.18), inset 0 1px 0 var(--glass-shine); }
.edu-card:hover::before { transform: scaleX(1); }
.edu-icon { width: 50px; height: 50px; border-radius: 10px; display: flex; align-items: center; justify-content: center; background: rgba(34,211,238,0.1); border: 1px solid rgba(34,211,238,0.2); margin-bottom: 16px; backdrop-filter: blur(8px); }
.edu-degree { font-family: var(--disp); font-size: 19px; font-weight: 700; text-transform: uppercase; color: var(--text); margin-bottom: 5px; }
.edu-school { font-size: 13px; color: var(--text2); margin-bottom: 10px; line-height: 1.5; }
.edu-row { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 10px; }
.edu-tag { font-family: var(--mono); font-size: 9.5px; color: var(--cyan); background: rgba(34,211,238,0.08); border: 1px solid rgba(34,211,238,0.18); border-radius: 3px; padding: 3px 8px; backdrop-filter: blur(8px); }

/* ── RESUME ── */
.resume-inner { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: start; }
.resume-info h3 { font-family: var(--disp); font-size: 28px; font-weight: 700; text-transform: uppercase; margin-bottom: 16px; }
.resume-info p { font-size: 15px; color: var(--text2); line-height: 1.85; margin-bottom: 28px; }
.resume-preview {
  background: var(--glass-bg);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid var(--glass-bdr); border-radius: 14px; padding: 24px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.12), inset 0 1px 0 var(--glass-shine);
}
.resume-preview-header { font-family: var(--mono); font-size: 10px; color: var(--text2); letter-spacing: 0.15em; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }
.rdp-name { font-family: var(--disp); font-size: 20px; font-weight: 700; margin-bottom: 4px; }
.rdp-role { font-family: var(--mono); font-size: 9px; color: var(--amber); letter-spacing: 0.1em; margin-bottom: 16px; line-height: 1.6; }
.rdp-line { border-top: 1px solid var(--bdr); margin: 14px 0; }
.rdp-skill-row { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.rdp-label { font-family: var(--mono); font-size: 9.5px; color: var(--text2); min-width: 80px; }
.rdp-bar { flex: 1; height: 5px; background: rgba(255,255,255,0.07); border-radius: 3px; overflow: hidden; }
[data-theme="day"] .rdp-bar { background: rgba(0,0,0,0.07); }
.rdp-bar-fill { height: 100%; border-radius: 3px; transition: width 1s cubic-bezier(.22,.68,0,1.2); }

/* ── CONTACT ── */
.contact-wrap { text-align: center; }
.contact-sub { font-size: 15px; color: var(--text2); max-width: 600px; margin: 0 auto 42px; line-height: 1.85; }
.contact-links { display: flex; justify-content: center; gap: 10px; flex-wrap: wrap; }
.contact-item {
  display: inline-flex; align-items: center; gap: 9px;
  font-family: var(--mono); font-size: 11.5px; letter-spacing: 0.06em;
  background: var(--glass-bg);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid var(--glass-bdr);
  border-radius: 8px; padding: 13px 20px;
  transition: all 0.25s; cursor: pointer;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1), inset 0 1px 0 var(--glass-shine);
}
.c-email { color: var(--amber); }
.c-phone { color: var(--green); }
.c-li    { color: #38bdf8; }
.c-bh    { color: var(--violet); }
.c-gh    { color: var(--green); }
.c-email:hover { background: rgba(245,158,11,0.12); border-color:rgba(245,158,11,0.35); transform:translateY(-2px); box-shadow: 0 8px 28px rgba(245,158,11,0.2); }
.c-phone:hover { background: rgba(52,211,153,0.12); border-color:rgba(52,211,153,0.35); transform:translateY(-2px); box-shadow: 0 8px 28px rgba(52,211,153,0.2); }
.c-li:hover    { background: rgba(56,189,248,0.12);  border-color:rgba(56,189,248,0.35);  transform:translateY(-2px); box-shadow: 0 8px 28px rgba(56,189,248,0.2); }
.c-bh:hover    { background: rgba(167,139,250,0.12); border-color:rgba(167,139,250,0.35); transform:translateY(-2px); box-shadow: 0 8px 28px rgba(167,139,250,0.2); }
.c-gh:hover    { background: rgba(52,211,153,0.12);  border-color:rgba(52,211,153,0.35);  transform:translateY(-2px); box-shadow: 0 8px 28px rgba(52,211,153,0.2); }
.contact-loc { font-family: var(--mono); font-size: 10.5px; color: var(--muted); margin-top: 22px; display: flex; align-items: center; justify-content: center; gap: 6px; }

/* ── FOOTER ── */
footer {
  border-top: 1px solid var(--bdr); padding: 28px 44px;
  display: flex; align-items: center; justify-content: center; gap: 12px;
  font-family: var(--mono); font-size: 10px; color: var(--muted); letter-spacing: 0.1em; z-index: 1; position: relative;
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

/* ── PARTICLES ── */
.particle {
  position: fixed; border-radius: 50%; pointer-events: none; z-index: 0;
  animation: particleFade var(--dur, 4s) ease-out var(--delay, 0s) infinite;
}

/* ── SKILLS CHIP SYSTEM ── */
.skills-categories { display: flex; flex-direction: column; gap: 32px; }

.skill-cat { }

.cat-header {
  display: flex; align-items: center; gap: 12px;
  margin-bottom: 14px;
}
.cat-badge {
  display: inline-flex; align-items: center; gap: 6px;
  font-family: var(--mono); font-size: 9.5px; letter-spacing: 0.22em; text-transform: uppercase;
  padding: 5px 14px; border-radius: 20px; font-weight: 600; white-space: nowrap;
  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
}
.cat-line { flex: 1; height: 1px; }

.skill-chips { display: flex; flex-wrap: wrap; gap: 8px; }

.skill-chip {
  display: inline-flex; align-items: center; gap: 8px;
  background: var(--glass-bg);
  backdrop-filter: blur(18px) saturate(180%);
  -webkit-backdrop-filter: blur(18px) saturate(180%);
  border: 1px solid var(--glass-bdr);
  border-radius: 8px; padding: 7px 12px;
  cursor: default; transition: all 0.22s cubic-bezier(.22,.68,0,1.2);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1), inset 0 1px 0 var(--glass-shine);
  position: relative; overflow: hidden;
}
.skill-chip::before {
  content: '';
  position: absolute; top: 0; left: -100%; width: 50%; height: 100%;
  background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.07) 50%, transparent 60%);
  transition: left 0.5s ease; pointer-events: none;
}
.skill-chip:hover::before { left: 140%; }
.skill-chip:hover {
  transform: translateY(-2px) scale(1.02);
}

.chip-icon-wrap {
  width: 22px; height: 22px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.chip-icon-wrap img {
  width: 22px; height: 22px; object-fit: contain; display: block;
  transition: filter 0.3s;
}
/* Boost dark icons in night mode */
[data-theme="night"] .chip-icon-wrap img {
  filter: brightness(1.5) saturate(1.1);
}
/* Boost light icons in day mode */
[data-theme="day"] .chip-icon-wrap img {
  filter: brightness(0.85) saturate(1.05);
}
.chip-label {
  font-family: var(--mono); font-size: 10.5px; color: var(--text2);
  letter-spacing: 0.03em; white-space: nowrap; transition: color 0.2s;
  line-height: 1;
}

/* ── ISO STRIP ── */
.iso-strip {
  display: flex; gap: 18px; align-items: flex-start; margin-top: 8px;
  background: var(--glass-bg);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid rgba(245,158,11,0.25);
  border-radius: 14px; padding: 22px 24px;
  box-shadow: 0 4px 24px rgba(245,158,11,0.07), inset 0 1px 0 var(--glass-shine);
  position: relative; overflow: hidden;
}
.iso-strip::before {
  content: ''; position: absolute; top:0; left:0; right:0; height:2px;
  background: linear-gradient(90deg, #f59e0b, #22d3ee, #a78bfa, #f59e0b);
}
.iso-strip-icon {
  width: 52px; height: 52px; flex-shrink: 0; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  background: rgba(245,158,11,0.12); border: 1px solid rgba(245,158,11,0.28);
  backdrop-filter: blur(10px);
}
.iso-strip-body { flex: 1; }
.iso-strip-title {
  font-family: var(--mono); font-size: 11px; font-weight: 700;
  letter-spacing: 0.18em; text-transform: uppercase; color: var(--amber);
  display: flex; align-items: center; margin-bottom: 10px;
}
.iso-strip-desc {
  font-size: 13.5px; color: var(--text2); line-height: 1.8; margin-bottom: 14px;
}
.iso-chips { display: flex; flex-wrap: wrap; gap: 7px; }
.iso-chip {
  font-family: var(--mono); font-size: 9px; letter-spacing: 0.12em;
  color: var(--amber); background: rgba(245,158,11,0.08);
  border: 1px solid rgba(245,158,11,0.22); border-radius: 3px; padding: 4px 9px;
  backdrop-filter: blur(8px);
}

/* ── RESPONSIVE ── */
@media (max-width: 900px) {
  .nav-links { display: none !important; }
  .hamburger { display: flex !important; }
  .hero { grid-template-columns: 1fr !important; padding: 80px 24px 60px !important; }
  .hero-center { display: none; }
  .hero-right { display: none; }
  .about-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
  .skills-grid { grid-template-columns: 1fr 1fr !important; }
  .projects-grid, .behance-grid, .edu-grid { grid-template-columns: 1fr !important; }
  .project-card.wide, .behance-card.wide { grid-column: 1 !important; }
  .resume-inner { grid-template-columns: 1fr !important; }
  .certs-grid { grid-template-columns: 1fr 1fr !important; }
  .nav { padding: 0 20px; }
  .section-wrap, .full-band .inner { padding-left: 24px !important; padding-right: 24px !important; }
  .theme-badge { display: none; }
}
@media (max-width: 540px) {
  .skills-grid, .certs-grid { grid-template-columns: 1fr !important; }
  .hero-cta { flex-direction: column; }
  .btn { width: 100%; justify-content: center; }
  .nav-right { gap: 6px; }
}
`;

// ─────────────────────────────────────────────────────────────────────────────
// HOOKS
// ─────────────────────────────────────────────────────────────────────────────

// Calculates sunrise/sunset for Chennai (13.08°N, 80.27°E) using IST (UTC+5:30)
function useTheme() {
  const getSunPhase = () => {
    const now = new Date();
    // Convert to IST (UTC+5:30)
    const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
    const istDate = new Date(utcMs + 5.5 * 3600000);
    const localH = istDate.getHours() + istDate.getMinutes() / 60;
    const start = new Date(istDate.getFullYear(), 0, 0);
    const dayOfYear = Math.round((istDate - start) / 86400000);
    // Seasonal sunrise/sunset approximation for Chennai latitude (13.08°N)
    const dec = -23.45 * Math.cos((2 * Math.PI / 365) * (dayOfYear + 10));
    const latRad = 13.08 * Math.PI / 180;
    const decRad = dec * Math.PI / 180;
    const cosHA = -Math.tan(latRad) * Math.tan(decRad);
    const hourAngle = Math.acos(Math.max(-1, Math.min(1, cosHA))) * (180 / Math.PI);
    const sunriseH = 12 - hourAngle / 15; // local solar noon offset
    const sunsetH  = 12 + hourAngle / 15;
    // IST offset from local solar time for Chennai (80.27°E → +0.35h from UTC+5.5)
    const correction = (80.27 / 15) - 5.5; // ≈ +0.18h
    return localH >= (sunriseH + correction) && localH < (sunsetH + correction) ? "day" : "night";
  };

  const [theme, setTheme] = useState(getSunPhase);
  const [manual, setManual] = useState(false);

  useEffect(() => {
    if (manual) return;
    const interval = setInterval(() => setTheme(getSunPhase()), 60000);
    return () => clearInterval(interval);
  }, [manual]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggle = () => {
    setManual(true);
    setTheme(t => t === "day" ? "night" : "day");
  };

  return [theme, toggle];
}

function useReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("visible"); obs.unobserve(e.target); } }),
      { threshold: 0.06 }
    );
    document.querySelectorAll(".reveal").forEach(el => obs.observe(el));
    return () => obs.disconnect();
  });
}

function useActiveSection() {
  const [active, setActive] = useState("hero");
  useEffect(() => {
    const h = () => {
      let cur = "hero";
      document.querySelectorAll("[data-section]").forEach(s => {
        if (window.scrollY >= s.offsetTop - 140) cur = s.dataset.section;
      });
      setActive(cur);
    };
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  return active;
}

function useScrolled() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  return scrolled;
}

function useTypewriter(words, speed = 65, deleteSpeed = 35, pause = 1800) {
  const [display, setDisplay] = useState("");
  const state = useRef({ wi: 0, ci: 0, deleting: false });
  useEffect(() => {
    let t;
    const tick = () => {
      const { wi, ci, deleting } = state.current;
      const word = words[wi];
      if (!deleting) {
        if (ci < word.length) {
          setDisplay(word.slice(0, ci + 1));
          state.current.ci++;
          t = setTimeout(tick, speed + Math.random() * 30);
        } else {
          t = setTimeout(() => { state.current.deleting = true; tick(); }, pause);
        }
      } else {
        if (ci > 0) {
          setDisplay(word.slice(0, ci - 1));
          state.current.ci--;
          t = setTimeout(tick, deleteSpeed);
        } else {
          state.current.wi = (wi + 1) % words.length;
          state.current.deleting = false;
          t = setTimeout(tick, 300);
        }
      }
    };
    t = setTimeout(tick, 900);
    return () => clearTimeout(t);
  }, []);
  return display;
}

function useParallax() {
  const ref = useRef(null);
  useEffect(() => {
    const h = e => {
      if (!ref.current) return;
      const x = ((e.clientX / window.innerWidth) - 0.5) * 14;
      const y = ((e.clientY / window.innerHeight) - 0.5) * 14;
      ref.current.style.transform = `perspective(900px) rotateY(${x}deg) rotateX(${-y}deg) translateZ(8px)`;
    };
    window.addEventListener("mousemove", h, { passive: true });
    return () => window.removeEventListener("mousemove", h);
  }, []);
  return ref;
}

// ─────────────────────────────────────────────────────────────────────────────
// PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────
const Ms = ({ icon, size = 18, fill = 0, wght = 300, style = {} }) => (
  <span style={{
    fontFamily: "'Material Symbols Outlined'",
    fontVariationSettings: `'FILL' ${fill},'wght' ${wght},'GRAD' -25,'opsz' 48`,
    fontSize: size, lineHeight: 1, display: "inline-block", verticalAlign: "middle",
    userSelect: "none", ...style,
  }}>{icon}</span>
);

const SL = ({ icon, text }) => (
  <div className="section-label"><Ms icon={icon} size={13} />{text}</div>
);

const ST = ({ children }) => <h2 className="section-title">{children}</h2>;

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────
const NAV = [
  { id: "about",          icon: "person",        label: "About"      },
  { id: "experience",     icon: "work",           label: "Experience" },
  { id: "skills",         icon: "build",          label: "Skills"     },
  { id: "projects",       icon: "rocket_launch",  label: "Projects"   },
  { id: "design",         icon: "brush",          label: "Design"     },
  { id: "education",      icon: "school",         label: "Education"  },
  { id: "certifications", icon: "verified",       label: "Certs"      },
  { id: "resume",         icon: "description",    label: "Resume"     },
  { id: "contact",        icon: "mail",           label: "Contact"    },
];

const STATS = [
  { icon: "schedule",      num: "4.9+", label: "Years Experience",       color: "#f59e0b" },
  { icon: "rocket_launch", num: "8+",   label: "Projects Shipped",        color: "#22d3ee" },
  { icon: "devices",       num: "2",    label: "Domains — Auto & Med",    color: "#34d399" },
  { icon: "code",          num: "C++",  label: "Primary Language",        color: "#a78bfa" },
];

const EXPERIENCE = [
  {
    icon: "medical_services", role: "Senior Software Engineer",
    company: "PixelExpert Technology & Services Pvt. Ltd.",
    period: "SEP 2024 — JAN 2026", location: "Chennai, Tamil Nadu",
    desc: "Led HMI design & development for a medical physiotherapy laser therapy device — full ownership from UX design through Qt/QML implementation, embedded C++ backend, custom UART framework with CRC validation, and SQLite3 patient database. Safety-aware screen interactions, structured validation, and Linux-based device control integration.",
  },
  {
    icon: "directions_car", role: "Embedded Software Engineer",
    company: "PixelExpert Technology & Services Pvt. Ltd.",
    period: "APR 2022 — AUG 2024", location: "Chennai, Tamil Nadu",
    desc: "Developed automotive Instrument Cluster and Infotainment HMI across multiple OEM programs using Qt/QML, LVGL, Candera CGI Studio, and Embedded C. Worked as HCL external engineer on a SUV infotainment platform delivering Calls, Media, Settings, and Vehicle Stats modules in A-SPICE aligned Jenkins CI/CD environment.",
  },
  {
    icon: "school", role: "Graduate Engineer Trainee",
    company: "PixelExpert Technology & Services Pvt. Ltd.",
    period: "SEP 2021 — MAR 2022", location: "Chennai, Tamil Nadu",
    desc: "Hands-on embedded development training on STM32 — UART, SPI, I²C, GPIO protocols. Built TouchGFX-based Instrument Cluster prototype with speedometer, odometer, alerts, trip metres, and fuel gauge. Foundational training in structured UI graphics and embedded integration.",
  },
  {
    icon: "palette", role: "Graphics Designer Trainee",
    company: "Lapiz Digital Services Pvt. Ltd.",
    period: "MAY 2019 — SEP 2019", location: "Chennai, Tamil Nadu",
    desc: "Internship focused on visual design fundamentals, digital graphics production, and creative tooling across Adobe Creative Suite.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// TECH ICON SYSTEM
// ─────────────────────────────────────────────────────────────────────────────

// Custom SVG icons for tools without a Simple Icons entry
// Each receives (color, size) and returns JSX
const CUSTOM_SVGS = {
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
};

// TechIcon — resolves "si:slug" | "ms:icon" | "svg:key"
function TechIcon({ icon, color, size = 22 }) {
  const [err, setErr] = useState(false);

  if (icon.startsWith("si:")) {
    const slug = icon.slice(3);
    if (!err) {
      return (
        <img
          src={`https://cdn.simpleicons.org/${slug}`}
          width={size} height={size}
          style={{ display: "block", objectFit: "contain", borderRadius: 2 }}
          onError={() => setErr(true)}
          alt={slug}
        />
      );
    }
    return <Ms icon="code" size={size} style={{ color }} />;
  }
  if (icon.startsWith("svg:")) {
    const key = icon.slice(4);
    return CUSTOM_SVGS[key]?.(color, size) ?? <Ms icon="code" size={size} style={{ color }} />;
  }
  if (icon.startsWith("ms:")) {
    return <Ms icon={icon.slice(3)} size={size} style={{ color }} />;
  }
  return <Ms icon="code" size={size} style={{ color }} />;
}

// SkillChip — glass pill with icon + label
function SkillChip({ skill, catColor }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      className="skill-chip"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        borderColor: hov ? catColor + "66" : "",
        boxShadow: hov ? `0 6px 24px ${catColor}18, inset 0 1px 0 var(--glass-shine)` : "",
      }}
    >
      <div className="chip-icon-wrap">
        <TechIcon icon={skill.icon} color={skill.color || catColor} size={22} />
      </div>
      <span className="chip-label" style={{ color: hov ? (skill.color || catColor) : "" }}>
        {skill.name}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SKILL CATEGORIES DATA
// ─────────────────────────────────────────────────────────────────────────────
const SKILL_CATEGORIES = [
  {
    label: "Primary Language",
    headerColor: "#f59e0b",
    headerBg: "rgba(245,158,11,0.14)",
    skills: [
      { name: "C++ (C++11–C++17)", icon: "si:cplusplus",  color: "#00599C" },
      { name: "Embedded C",        icon: "ms:code",        color: "#f59e0b" },
      { name: "QML",               icon: "si:qt",          color: "#41CD52" },
      { name: "Lua",               icon: "si:lua",         color: "#000080" },
      { name: "OOP",               icon: "svg:oop",        color: "#f59e0b" },
      { name: "STL",               icon: "svg:stl",        color: "#fb7185" },
      { name: "Smart Pointers",    icon: "svg:smartptr",   color: "#22d3ee" },
      { name: "Bit Manipulation",  icon: "svg:bit",        color: "#a78bfa" },
      { name: "Structures",        icon: "svg:struct",     color: "#34d399" },
    ],
  },
  {
    label: "HMI Frameworks",
    headerColor: "#22d3ee",
    headerBg: "rgba(34,211,238,0.12)",
    skills: [
      { name: "Qt / QML",          icon: "si:qt",          color: "#41CD52" },
      { name: "Qt Widgets",        icon: "si:qt",          color: "#41CD52" },
      { name: "LVGL",              icon: "svg:lvgl",       color: "#00A8E8" },
      { name: "TouchGFX",          icon: "svg:touchgfx",  color: "#22d3ee" },
      { name: "GUI Guider",        icon: "svg:guiguider",  color: "#F4A100" },
      { name: "Crank Storyboard",  icon: "svg:crank",      color: "#E8432B" },
      { name: "Candera CGI Studio",icon: "svg:candera",    color: "#00A3E0" },
      { name: "VG Lite",           icon: "svg:vglite",     color: "#22d3ee" },
      { name: "Qt 3D Studio",      icon: "si:qt",          color: "#41CD52" },
      { name: "Qt Design Studio",  icon: "si:qt",          color: "#41CD52" },
    ],
  },
  {
    label: "Embedded & OS",
    headerColor: "#34d399",
    headerBg: "rgba(52,211,153,0.12)",
    skills: [
      { name: "FreeRTOS",          icon: "svg:freertos",          color: "#34d399" },
      { name: "Embedded Linux",    icon: "si:linux",              color: "#FCC624" },
      { name: "Yocto Project",     icon: "si:yoctoproject",       color: "#9B4F96" },
      { name: "Ubuntu",            icon: "si:ubuntu",             color: "#E95420" },
      { name: "STM32",             icon: "si:stmicroelectronics", color: "#22d3ee" },
      { name: "i.MX6 / i.MX8M",   icon: "svg:nxp",               color: "#F4A100" },
      { name: "MIMXRT1170",        icon: "svg:nxp",               color: "#F4A100" },
    ],
  },
  {
    label: "Communication Interfaces",
    headerColor: "#fb7185",
    headerBg: "rgba(251,113,133,0.12)",
    skills: [
      { name: "UART / CRC",        icon: "svg:uart",      color: "#fb7185" },
      { name: "SPI",               icon: "svg:spi",       color: "#f59e0b" },
      { name: "I²C",               icon: "svg:i2c",       color: "#22d3ee" },
      { name: "CAN Bus",           icon: "svg:can",       color: "#34d399" },
      { name: "GPIO",              icon: "svg:gpio",      color: "#a78bfa" },
    ],
  },
  {
    label: "Tools & DevOps",
    headerColor: "#a78bfa",
    headerBg: "rgba(167,139,250,0.12)",
    skills: [
      { name: "Git",               icon: "si:git",                color: "#F05032" },
      { name: "Plastic SCM",       icon: "svg:plasticscm",        color: "#a78bfa" },
      { name: "Jira",              icon: "si:jira",               color: "#0052CC" },
      { name: "CMake",             icon: "si:cmake",              color: "#22d3ee" },
      { name: "Jenkins",           icon: "si:jenkins",            color: "#D24939" },
      { name: "STM32CubeIDE",      icon: "si:stmicroelectronics", color: "#22d3ee" },
      { name: "MCUXpresso",        icon: "svg:nxp",               color: "#F4A100" },
      { name: "TK Logger",         icon: "svg:tklogger",          color: "#34d399" },
      { name: "Enterprise Architect", icon: "svg:ea",             color: "#a78bfa" },
      { name: "Polarion",          icon: "svg:polarion",          color: "#1798C1" },
    ],
  },
  {
    label: "Testing & Debugging",
    headerColor: "#fb7185",
    headerBg: "rgba(251,113,133,0.10)",
    skills: [
      { name: "GDB",               icon: "svg:gdb",              color: "#fb7185" },
      { name: "DLT Viewer",        icon: "svg:dlt",              color: "#22d3ee" },
      { name: "HIL Testing",       icon: "svg:hil",              color: "#34d399" },
      { name: "ECU Verification",  icon: "svg:ecu",              color: "#f59e0b" },
      { name: "Manual Testing",    icon: "ms:fact_check",        color: "#a78bfa" },
    ],
  },
  {
    label: "Database",
    headerColor: "#34d399",
    headerBg: "rgba(52,211,153,0.12)",
    skills: [
      { name: "SQLite3",           icon: "si:sqlite",     color: "#22d3ee" },
    ],
  },
  {
    label: "Design & UX",
    headerColor: "#f59e0b",
    headerBg: "rgba(245,158,11,0.12)",
    skills: [
      { name: "Figma",             icon: "si:figma",              color: "#F24E1E" },
      { name: "Adobe Illustrator", icon: "si:adobeillustrator",   color: "#FF9A00" },
      { name: "Adobe XD",          icon: "si:adobexd",            color: "#FF61F6" },
      { name: "Photoshop",         icon: "si:adobephotoshop",     color: "#31A8FF" },
      { name: "GIMP",              icon: "si:gimp",               color: "#a78bfa" },
      { name: "FontForge",         icon: "svg:fontforge",         color: "#f59e0b" },
      { name: "Affinity",          icon: "si:affinity",           color: "#1B72BE" },
      { name: "Miro",              icon: "si:miro",               color: "#FFD02F" },
    ],
  },
  {
    label: "Methodologies",
    headerColor: "#22d3ee",
    headerBg: "rgba(34,211,238,0.10)",
    skills: [
      { name: "Agile / Scrum",     icon: "svg:agile",    color: "#22d3ee" },
      { name: "A-SPICE",           icon: "svg:aspice",   color: "#f59e0b" },
      { name: "UML",               icon: "svg:uml",      color: "#a78bfa" },
    ],
  },
];

const PROJECTS = [
  {
    period: "OCT 2024 — JAN 2026", num: "PROJECT_01", domain: "Medical Device",
    icon: "medical_services", color: "#34d399", bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.2)", wide: false,
    title: "Physiotherapy Laser Therapy HMI",
    desc: "Full-ownership HMI for a medical laser therapy device — treatment workflows, safety-aware UI logic, SQLite3 patient records, and a custom UART framework with CRC validation and secure response handling. Linux-based device control integration.",
    tags: ["Qt/QML", "C++", "SQLite3", "UART/CRC", "Linux"],
    line: "linear-gradient(90deg,#34d399,#22d3ee)",
  },
  {
    period: "NOV 2023 — SEP 2024", num: "PROJECT_02", domain: "Automotive",
    icon: "speed", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.2)", wide: false,
    title: "LVGL Cluster — MIMXRT1170",
    desc: "High-performance next-gen instrument cluster using Embedded C, LVGL, and VG Lite on MIMXRT1170 EVKB. ADAS-style visualisation widgets and low-level GPU rendering optimisations for smooth real-time gauge rendering.",
    tags: ["LVGL", "VG Lite", "Embedded C", "MIMXRT1170", "ADAS"],
    line: "linear-gradient(90deg,#f59e0b,#fb7185)",
  },
  {
    period: "MAR 2023 — SEP 2023", num: "PROJECT_03", domain: "Automotive · Infotainment · OEM",
    icon: "radio", color: "#22d3ee", bg: "rgba(34,211,238,0.1)", border: "rgba(34,211,238,0.2)", wide: true,
    title: "SUV In-Vehicle Infotainment System",
    desc: "HMI developer on a production SUV infotainment platform (HCL external assignment). Delivered Calls, Media, Settings, Vehicle Statistics, Steering Controls & Bezel Button modules. Full A-SPICE Agile sprints via Jira, Polarion, Plastic SCM, Jenkins CI/CD. Validation via TK Logger for latency control and reliability assurance.",
    tags: ["Qt/QML", "C++", "Jenkins", "Plastic SCM", "A-SPICE", "Figma Enterprise", "Polarion", "Linux"],
    line: "linear-gradient(90deg,#22d3ee,#a78bfa)",
  },
  {
    period: "NOV 2022 — MAR 2023", num: "PROJECT_04", domain: "Automotive",
    icon: "two_wheeler", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.2)", wide: false,
    title: "Sports Bike Cluster — i.MX6",
    desc: "Advanced cluster on i.MX6 with Qt/QML and Linux. 5-button navigation, theme switching, customisable widgets, structured UART framework, and performance-optimised 2D/2.5D graphical animations.",
    tags: ["Qt/QML", "C++", "i.MX6", "Linux", "SQLite3"],
    line: "linear-gradient(90deg,#f59e0b,#22d3ee)",
  },
  {
    period: "JAN 2022 — SEP 2022", num: "PROJECT_05", domain: "Automotive · OEM (NDA)",
    icon: "two_wheeler", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.2)", wide: false,
    title: "Two-Wheeler OEM Cluster — CGI Studio",
    desc: "Production Instrument Cluster for a leading two-wheeler OEM. State machines, structured UI navigation, core functional workflows with driver readability & safety principles. CMake build and automotive documentation standards.",
    tags: ["Candera CGI Studio", "Lua", "SCML", "CMake", "Photoshop"],
    line: "linear-gradient(90deg,#f59e0b,#fb7185)",
  },
  {
    period: "R&D / INTERNAL", num: "R&D", domain: "Internal · Capability Work",
    icon: "sensors", color: "#a78bfa", bg: "rgba(167,139,250,0.1)", border: "rgba(167,139,250,0.2)", wide: true,
    title: "ADAS 3D Demonstrator & R&D Projects",
    desc: "Collision visualisation and parking assist UI demonstrator built with Qt 3D Studio and Blender on i.MX8M. Includes a TouchGFX-based STM32F469G prototype with speedometer, odometer, trip meters, alerts, and fuel gauge — structured UI graphics and embedded integration for capability development.",
    tags: ["Qt 3D Studio", "Blender", "i.MX8M", "TouchGFX", "STM32F469G", "ADAS"],
    line: "linear-gradient(90deg,#a78bfa,#fb7185)",
  },
];

const CERTS = [
  { icon: "school",         name: "Qt 6 Core — Beginner, Intermediate & Advanced", org: "UDEMY" },
  { icon: "school",         name: "QML for Beginners",                              org: "UDEMY" },
  { icon: "verified_user",  name: "Google UX Design Professional Certificate",      org: "COURSERA — CREDLY VERIFIED" },
];

// ─────────────────────────────────────────────────────────────────────────────
// GRADIENT ORBS — floating liquid backdrop
// ─────────────────────────────────────────────────────────────────────────────
function GradientOrbs() {
  return (
    <div className="orbs-wrap" aria-hidden="true">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <div className="orb orb-4" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CURSOR GLOW
// ─────────────────────────────────────────────────────────────────────────────
function CursorGlow() {
  const [pos, setPos] = useState({ x: -500, y: -500 });
  useEffect(() => {
    const h = e => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", h, { passive: true });
    return () => window.removeEventListener("mousemove", h);
  }, []);
  return (
    <div
      className="cursor-glow"
      style={{ left: pos.x, top: pos.y }}
      aria-hidden="true"
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PARTICLES
// ─────────────────────────────────────────────────────────────────────────────
function Particles() {
  const particles = useRef(Array.from({ length: 18 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: 20 + Math.random() * 70,
    size: 1.5 + Math.random() * 2.5,
    dur: 4 + Math.random() * 5,
    delay: Math.random() * 6,
    dx: (Math.random() - 0.5) * 60 + "px",
    color: ["#f59e0b","#22d3ee","#34d399","#a78bfa","#fb7185"][Math.floor(Math.random() * 5)],
    opacity: 0.3 + Math.random() * 0.5,
  }))).current;

  return (
    <>
      {particles.map(p => (
        <div key={p.id} className="particle" style={{
          left: `${p.x}%`, top: `${p.y}%`,
          width: p.size, height: p.size,
          background: p.color, opacity: p.opacity,
          "--dur": `${p.dur}s`, "--delay": `${p.delay}s`, "--dx": p.dx,
        }} />
      ))}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATED SPEEDOMETER (Hero widget)
// ─────────────────────────────────────────────────────────────────────────────
function Speedometer() {
  const [speed, setSpeed] = useState(0);
  const [rpm, setRpm] = useState(0);
  const raf = useRef(null);
  useEffect(() => {
    let t = 0;
    const tick = () => {
      t += 0.006;
      setSpeed(Math.sin(t * 0.5) * 45 + 88 + Math.sin(t * 1.4) * 22);
      setRpm(Math.sin(t * 0.7 + 1) * 1200 + 2800 + Math.cos(t * 1.1) * 500);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, []);

  const arc = (cx, cy, r, from, to) => {
    const rad = d => (d * Math.PI) / 180;
    const s = { x: cx + r * Math.cos(rad(from)), y: cy + r * Math.sin(rad(from)) };
    const e = { x: cx + r * Math.cos(rad(to)),   y: cy + r * Math.sin(rad(to))   };
    const lg = (to - from) > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${lg} 1 ${e.x} ${e.y}`;
  };

  const minA = -215, maxA = 35;
  const sAngle = minA + (Math.min(speed, 180) / 180) * (maxA - minA);
  const rAngle = -215 + (Math.min(rpm, 8000) / 8000) * 250;
  const cx = 130, cy = 130, r = 100;
  const nx = cx + 84 * Math.cos((sAngle * Math.PI) / 180);
  const ny = cy + 84 * Math.sin((sAngle * Math.PI) / 180);
  const ticks = Array.from({ length: 19 }, (_, i) => {
    const a = minA + (i / 18) * (maxA - minA);
    const major = i % 3 === 0;
    return {
      x1: cx + r * Math.cos((a * Math.PI) / 180), y1: cy + r * Math.sin((a * Math.PI) / 180),
      x2: cx + (r - (major ? 18 : 10)) * Math.cos((a * Math.PI) / 180), y2: cy + (r - (major ? 18 : 10)) * Math.sin((a * Math.PI) / 180),
      major,
    };
  });

  return (
    <svg viewBox="0 0 260 260" style={{ width: "100%", maxWidth: 320, height: "auto" }}>
      <defs>
        <radialGradient id="gbg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#111d30" /><stop offset="100%" stopColor="#060c18" />
        </radialGradient>
        <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#34d399" /><stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
        <linearGradient id="rpmGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f59e0b" /><stop offset="100%" stopColor="#fb7185" />
        </linearGradient>
        <linearGradient id="needleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" /><stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <filter id="glow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="softGlow"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <circle cx={cx} cy={cy} r={122} fill="url(#gbg)" stroke="rgba(245,158,11,0.15)" strokeWidth="1.5" />
      <circle cx={cx} cy={cy} r={112} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
      <path d={arc(cx, cy, 112, -215, 35)} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5" strokeLinecap="round" />
      <path d={arc(cx, cy, 112, -215, rAngle)} fill="none" stroke="url(#rpmGrad)" strokeWidth="5" strokeLinecap="round" filter="url(#glow)" />
      <path d={arc(cx, cy, r, minA, maxA)} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="9" strokeLinecap="round" />
      <path d={arc(cx, cy, r, minA, sAngle)} fill="none" stroke="url(#arcGrad)" strokeWidth="9" strokeLinecap="round" filter="url(#glow)" />
      {ticks.map((tk, i) => (
        <line key={i} x1={tk.x1} y1={tk.y1} x2={tk.x2} y2={tk.y2}
          stroke={tk.major ? "rgba(245,158,11,0.55)" : "rgba(255,255,255,0.14)"} strokeWidth={tk.major ? 2 : 1} />
      ))}
      <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="url(#needleGrad)" strokeWidth="2.5" strokeLinecap="round" filter="url(#softGlow)" />
      <circle cx={cx} cy={cy} r={8} fill="#f59e0b" filter="url(#glow)" />
      <circle cx={cx} cy={cy} r={3.5} fill="#060c18" />
      <text x={cx} y={cy + 30} textAnchor="middle" fill="#e2e8f0" fontFamily="'Share Tech Mono',monospace" fontSize="30" fontWeight="bold">{Math.round(speed)}</text>
      <text x={cx} y={cy + 47} textAnchor="middle" fill="rgba(245,158,11,0.7)" fontFamily="'Share Tech Mono',monospace" fontSize="10" letterSpacing="0.2em">km/h</text>
      <text x={cx} y={cy - 30} textAnchor="middle" fill="rgba(34,211,238,0.6)" fontFamily="'Share Tech Mono',monospace" fontSize="8.5" letterSpacing="0.2em">HMI CLUSTER DEMO</text>
      <text x={cx} y={cy + 66} textAnchor="middle" fill="rgba(251,113,133,0.6)" fontFamily="'Share Tech Mono',monospace" fontSize="8">{Math.round(rpm)} RPM</text>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NAV
// ─────────────────────────────────────────────────────────────────────────────
function Nav({ theme, onToggle }) {
  const active = useActiveSection();
  const scrolled = useScrolled();
  const [open, setOpen] = useState(false);

  const isDay = theme === "day";
  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

  return (
    <>
      <nav className={`nav${scrolled ? " scrolled" : ""}`}>
        <div className="nav-logo">
          <Ms icon="developer_board" size={17} />JEEVANANDHAM
        </div>
        <ul className="nav-links" style={{ listStyle: "none", display: "flex", gap: 2, margin: 0, padding: 0 }}>
          {NAV.map(({ id, icon, label }) => (
            <li key={id}>
              <a href={`#${id}`} className={`nav-link${active === id ? " active" : ""}`}>
                <Ms icon={icon} size={13} className="ms" />{label}
              </a>
            </li>
          ))}
        </ul>
        <div className="nav-right">
          {/* Theme badge */}
          <div className="theme-badge">
            <Ms icon={isDay ? "wb_sunny" : "nights_stay"} size={12} />
            {isDay ? "DAY" : "NIGHT"} · {timeStr}
          </div>
          {/* Theme toggle */}
          <button className="theme-btn" onClick={onToggle} title="Toggle day/night theme">
            <Ms icon={isDay ? "dark_mode" : "light_mode"} size={14} />
            {isDay ? "Night" : "Day"}
          </button>
          <button className="hamburger" onClick={() => setOpen(!open)} aria-label="Menu">
            <span /><span /><span />
          </button>
        </div>
      </nav>
      <div className={`mobile-menu${open ? " open" : ""}`}>
        {NAV.map(({ id, icon, label }) => (
          <a key={id} href={`#${id}`} className="nav-link" onClick={() => setOpen(false)}>
            <Ms icon={icon} size={15} />{label}
          </a>
        ))}
        <button className="theme-btn" onClick={() => { onToggle(); setOpen(false); }} style={{ marginTop: 8, width: "100%", justifyContent: "center" }}>
          <Ms icon={isDay ? "dark_mode" : "light_mode"} size={14} />
          Switch to {isDay ? "Night" : "Day"} Mode
        </button>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HERO
// ─────────────────────────────────────────────────────────────────────────────
function Hero() {
  const cardRef = useParallax();
  const typed = useTypewriter(["Qt / QML Developer","Embedded HMI Engineer","UX / UI Engineer","Instrument Cluster Dev","Medical Device HMI Eng"]);

  return (
    <section id="hero" data-section="hero" className="hero">
      <Particles />
      <div className="hero-rings">
        <div className="hring hring-1" /><div className="hring hring-2" />
        <div className="hring hring-3" /><div className="hring hring-4" />
      </div>

      {/* ── LEFT: Text content ── */}
      <div className="hero-content">
        <div className="hero-tag"><Ms icon="developer_board" size={15} />Senior HMI Engineer · Chennai, India</div>
        <h1 className="hero-name">
          S. <em>Jeevanandham</em><br />B.ECE
        </h1>
        <div className="hero-typewriter">
          <span style={{ color: "var(--cyan)" }}>{typed}</span>
          <span className="cursor">|</span>
        </div>
        <p className="hero-bio">
          Senior Software Engineer with <strong>4.9+ years</strong> in Automotive HMI, Infotainment Systems, Instrument Clusters, and Medical Device HMI. Specialising in <strong>Qt/QML, Embedded C++, and real-time UI engineering</strong> across production-grade OEM programs.
        </p>
        <div className="hero-badges">
          {["Qt / QML","Embedded C++","LVGL","CAN Bus","A-SPICE","Linux HMI","SQLite3","FreeRTOS"].map(b => (
            <span key={b} className="badge">{b}</span>
          ))}
        </div>
        <div className="hero-cta">
          <a href="#projects" className="btn btn-amber"><Ms icon="rocket_launch" size={17} />View Projects</a>
          <a href="#contact"  className="btn btn-outline"><Ms icon="mail" size={17} />Get In Touch</a>
          <a href="Jeevanandham_Resume.pdf" download className="btn btn-green"><Ms icon="download" size={17} />Resume</a>
        </div>
      </div>

      {/* ── CENTRE: Big animated speedometer ── */}
      <div className="hero-center">
        <div className="gauge-widget">
          <div className="gauge-label-top">⚡ Live HMI Cluster Demo</div>
          <Speedometer />
          <div className="gauge-divider" />
          <div className="gauge-stats-row">
            <div className="gauge-stat">
              <span className="gauge-stat-val" style={{ color:"#f59e0b" }}>4.9+</span>
              <span className="gauge-stat-lbl">Yrs Exp</span>
            </div>
            <div className="gauge-stat">
              <span className="gauge-stat-val" style={{ color:"#22d3ee" }}>8+</span>
              <span className="gauge-stat-lbl">Projects</span>
            </div>
            <div className="gauge-stat">
              <span className="gauge-stat-val" style={{ color:"#34d399" }}>2</span>
              <span className="gauge-stat-lbl">Domains</span>
            </div>
          </div>
          <div className="gauge-divider" />
          <div className="gauge-stack-tags">
            {["Qt/QML","LVGL","C++","CAN","UART"].map(t => (
              <span key={t} className="gauge-stack-tag">{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT: Profile photo card ── */}
      <div className="hero-right">
        <div className="profile-card" ref={cardRef} style={{ transition: "transform 0.15s ease-out", willChange: "transform" }}>
          <div className="profile-photo-frame">
            <div className="scan" />
            <div className="corner corner-tl" /><div className="corner corner-tr" />
            <div className="corner corner-bl" /><div className="corner corner-br" />
            <img
              src="profile.png"
              alt="S. Jeevanandham"
              className="profile-photo"
              onError={e => { e.target.style.display = "none"; }}
            />
          </div>
          <div className="profile-info-panel">
            <div className="pname">S. JEEVANANDHAM</div>
            <div className="prole">SENIOR HMI ENGINEER</div>
            <div className="status-row"><span className="status-dot" />OPEN TO OPPORTUNITIES</div>
            <div className="profile-tags-row">
              {["Automotive HMI","Medical HMI","Qt/QML","UX Design"].map(t => (
                <span key={t} className="ptag">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ABOUT
// ─────────────────────────────────────────────────────────────────────────────
function About() {
  return (
    <section id="about" data-section="about" className="section-wrap">
      <SL icon="person" text="01 — About" />
      <ST>Who I Am</ST>
      <div className="about-grid">
        <div className="about-text reveal">
          <p>I'm a <span className="hl">Senior Software Engineer</span> with deep expertise in Human Machine Interface development for the <span className="hl">automotive and medical device industries</span>. Over 4.9 years, I've shipped production-grade HMIs for instrument clusters, infotainment systems, and medical therapy devices.</p>
          <p style={{ marginTop: 14 }}>My stack centres on <span className="hl">Qt/QML and Embedded C++</span>, complemented by LVGL, Candera CGI Studio, and TouchGFX. I've worked across STM32, i.MX6, i.MX8M, and MIMXRT1170 platforms, building everything from low-level driver integrations to polished, safety-aware UI layers.</p>
          <p style={{ marginTop: 14 }}>I bring an unusual combination of <span className="hl">engineering rigour and UX design sensibility</span> — holding a Google UX Design Professional Certificate and contributing to visual design work across all my projects using Figma and Adobe tooling.</p>
          <p style={{ marginTop: 14 }}>Experienced in <span className="hl">A-SPICE aligned development</span>, Agile execution, CI/CD pipelines, documentation discipline, UART communication frameworks (structured byte framing + CRC), SQLite3 database integration, and Linux-based system development.</p>
        </div>
        <div className="stats">
          {STATS.map(({ icon, num, label, color }, i) => (
            <div key={label} className={`stat-card reveal d${i}`}
              onMouseOver={e => { e.currentTarget.style.borderColor = color + "66"; e.currentTarget.style.boxShadow = `0 16px 48px ${color}22, inset 0 1px 0 var(--glass-shine)`; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = ""; e.currentTarget.style.boxShadow = ""; }}>
              <Ms icon={icon} size={27} fill={0} wght={200} style={{ color }} />
              <div className="stat-num" style={{ color }}>{num}</div>
              <div className="stat-label">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPERIENCE
// ─────────────────────────────────────────────────────────────────────────────
function Experience() {
  return (
    <div id="experience" data-section="experience" className="exp-band full-band">
      <div className="inner">
        <SL icon="work" text="02 — Experience" />
        <ST>Career</ST>
        <div className="exp-timeline">
          {EXPERIENCE.map((exp, i) => (
            <div key={i} className={`exp-item reveal d${Math.min(i, 3)}`}>
              <div className="exp-dot" />
              <div className="exp-header">
                <div className="exp-left">
                  <div className="exp-icon"><Ms icon={exp.icon} size={22} fill={0} wght={300} style={{ color: "#f59e0b" }} /></div>
                  <div>
                    <div className="exp-role">{exp.role}</div>
                    <div className="exp-company-name">{exp.company}</div>
                  </div>
                </div>
                <div className="exp-right">
                  <div className="exp-period">{exp.period}</div>
                  <div className="exp-company-loc">{exp.location}</div>
                </div>
              </div>
              <p className="exp-desc">{exp.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SKILLS
// ─────────────────────────────────────────────────────────────────────────────
function Skills() {
  return (
    <section id="skills" data-section="skills" className="section-wrap">
      <SL icon="build" text="03 — Skills" />
      <ST>Toolbox</ST>

      <div className="skills-categories">
        {SKILL_CATEGORIES.map((cat, ci) => (
          <div key={cat.label} className={`skill-cat reveal d${ci % 3}`}>
            <div className="cat-header">
              <span className="cat-badge" style={{
                color: cat.headerColor,
                background: cat.headerBg,
                border: `1px solid ${cat.headerColor}44`,
              }}>
                {cat.label}
              </span>
              <div className="cat-line" style={{
                background: `linear-gradient(to right, ${cat.headerColor}55, transparent)`,
              }} />
            </div>
            <div className="skill-chips">
              {cat.skills.map(skill => (
                <SkillChip key={skill.name} skill={skill} catColor={cat.headerColor} />
              ))}
            </div>
          </div>
        ))}

        {/* ISO 26262 Feature Strip */}
        <div className="iso-strip reveal">
          <div className="iso-strip-icon">
            <Ms icon="verified_user" size={26} fill={1} style={{ color: "#f59e0b" }} />
          </div>
          <div className="iso-strip-body">
            <div className="iso-strip-title">
              <Ms icon="shield" size={14} fill={1} style={{ color:"#f59e0b", marginRight:5 }} />
              ISO 26262 Awareness
            </div>
            <p className="iso-strip-desc">
              Safety-oriented HMI behavior with focus on system reliability, deterministic performance, and user-safety considerations.
              Practical application across automotive HMI projects — safety-aware UI interaction design, structured validation flows, and Functional Safety methodology awareness.
            </p>
            <div className="iso-chips">
              {["Safety-Aware UI","Deterministic Performance","Structured Validation","FMEA Awareness","Fail-Safe Patterns"].map(t => (
                <span key={t} className="iso-chip">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROJECTS
// ─────────────────────────────────────────────────────────────────────────────
function Projects() {
  return (
    <section id="projects" data-section="projects" className="section-wrap" style={{ background: "var(--bg2)" }}>
      <SL icon="rocket_launch" text="04 — Engineering Projects" />
      <ST>Selected Work</ST>
      <div className="projects-grid">
        {PROJECTS.map((p, i) => (
          <div key={p.num} className={`project-card reveal${p.wide ? " wide" : ""} d${i % 2}`}
            style={{ borderColor: p.border }}
            onMouseOver={e => { e.currentTarget.style.borderColor = p.color + "99"; }}
            onMouseOut={e => { e.currentTarget.style.borderColor = p.border; }}>
            <div className="project-card-line" style={{ background: p.line }} />
            <div className="project-period">{p.period}</div>
            <div className="project-top">
              <div className="pico" style={{ background: p.bg, border: `1px solid ${p.border}` }}>
                <Ms icon={p.icon} size={26} fill={0} wght={200} style={{ color: p.color }} />
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="project-num" style={{ color: p.color }}>{p.num}</div>
                <div className="project-domain">{p.domain}</div>
              </div>
            </div>
            <div className="project-title">{p.title}</div>
            <p className="project-desc">{p.desc}</p>
            <div className="project-tags">
              {p.tags.map(t => (
                <span key={t} className="ptag2" style={{ color: p.color, background: p.bg, borderColor: p.border }}>{t}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN / BEHANCE
// ─────────────────────────────────────────────────────────────────────────────
const DESIGN_CARDS = [
  {
    tag: "AUTOMOTIVE", icon: "directions_car", color: "#f59e0b",
    title: "Automotive Instrument Clusters",
    desc: "HMI design work for two-wheeler and four-wheeler instrument clusters — from low-fidelity wireframes to final pixel-perfect UI assets for embedded deployment.",
    wide: false,
    art: (
      <svg viewBox="0 0 580 280" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width:"100%", height:"100%" }}>
        <rect width="580" height="280" fill="#060c18"/>
        <circle cx="290" cy="140" r="100" fill="none" stroke="rgba(245,158,11,0.15)" strokeWidth="1.5"/>
        <circle cx="290" cy="140" r="80" fill="none" stroke="rgba(245,158,11,0.1)" strokeWidth="1" strokeDasharray="4 6"/>
        <circle cx="290" cy="140" r="60" fill="rgba(245,158,11,0.05)" stroke="rgba(245,158,11,0.2)" strokeWidth="1"/>
        {Array.from({length:12},(_,i)=>{const a=(i/12)*360*(Math.PI/180);const r1=80,r2=i%3===0?68:74;return <line key={i} x1={290+r1*Math.cos(a)} y1={140+r1*Math.sin(a)} x2={290+r2*Math.cos(a)} y2={140+r2*Math.sin(a)} stroke="rgba(245,158,11,0.5)" strokeWidth={i%3===0?2:1}/>})}
        <line x1="290" y1="140" x2="290" y2="80" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="290" cy="140" r="6" fill="#f59e0b"/>
        <text x="290" y="165" textAnchor="middle" fill="rgba(245,158,11,0.6)" fontFamily="monospace" fontSize="9" letterSpacing="3">km/h</text>
        <rect x="30" y="60" width="160" height="160" rx="12" fill="none" stroke="rgba(34,211,238,0.15)" strokeWidth="1"/>
        <text x="110" y="130" textAnchor="middle" fill="rgba(34,211,238,0.4)" fontFamily="monospace" fontSize="10">FUEL</text>
        <rect x="60" y="140" width="100" height="6" rx="3" fill="rgba(34,211,238,0.1)" stroke="rgba(34,211,238,0.2)" strokeWidth="1"/>
        <rect x="60" y="140" width="72" height="6" rx="3" fill="rgba(34,211,238,0.4)"/>
        <rect x="390" y="60" width="160" height="160" rx="12" fill="none" stroke="rgba(167,139,250,0.15)" strokeWidth="1"/>
        <text x="470" y="125" textAnchor="middle" fill="rgba(167,139,250,0.4)" fontFamily="monospace" fontSize="10">RPM</text>
        <text x="470" y="155" textAnchor="middle" fill="rgba(167,139,250,0.7)" fontFamily="monospace" fontSize="22" fontWeight="bold">3200</text>
      </svg>
    ),
  },
  {
    tag: "MEDICAL HMI", icon: "medical_services", color: "#34d399",
    title: "Medical Device HMI Design",
    desc: "UX/UI design for physiotherapy laser therapy control systems — treatment workflows, patient record interfaces, and safety-oriented screen interaction patterns.",
    wide: false,
    art: (
      <svg viewBox="0 0 580 280" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width:"100%", height:"100%" }}>
        <rect width="580" height="280" fill="#060c18"/>
        <rect x="40" y="40" width="200" height="200" rx="16" fill="rgba(52,211,153,0.05)" stroke="rgba(52,211,153,0.2)" strokeWidth="1"/>
        <text x="140" y="90" textAnchor="middle" fill="rgba(52,211,153,0.5)" fontFamily="monospace" fontSize="9" letterSpacing="2">PATIENT</text>
        {[["Name","Rajesh Kumar"],["Age","45"],["Session","#12"],["Duration","20 min"]].map(([l,v],i)=>(
          <g key={l}>
            <text x="60" y={120+i*28} fill="rgba(52,211,153,0.4)" fontFamily="monospace" fontSize="9">{l}:</text>
            <text x="130" y={120+i*28} fill="rgba(52,211,153,0.8)" fontFamily="monospace" fontSize="9">{v}</text>
          </g>
        ))}
        <rect x="280" y="40" width="260" height="90" rx="12" fill="rgba(52,211,153,0.06)" stroke="rgba(52,211,153,0.15)" strokeWidth="1"/>
        <text x="300" y="70" fill="rgba(52,211,153,0.5)" fontFamily="monospace" fontSize="9" letterSpacing="2">LASER POWER</text>
        <rect x="300" y="80" width="220" height="8" rx="4" fill="rgba(52,211,153,0.1)" stroke="rgba(52,211,153,0.2)" strokeWidth="1"/>
        <rect x="300" y="80" width="154" height="8" rx="4" fill="rgba(52,211,153,0.5)"/>
        <text x="300" y="112" fill="rgba(52,211,153,0.7)" fontFamily="monospace" fontSize="18" fontWeight="bold">70%</text>
        <rect x="280" y="150" width="120" height="52" rx="10" fill="rgba(52,211,153,0.12)" stroke="rgba(52,211,153,0.3)" strokeWidth="1.5"/>
        <text x="340" y="180" textAnchor="middle" fill="#34d399" fontFamily="monospace" fontSize="10" fontWeight="bold">START</text>
        <rect x="420" y="150" width="120" height="52" rx="10" fill="rgba(251,113,133,0.08)" stroke="rgba(251,113,133,0.2)" strokeWidth="1"/>
        <text x="480" y="180" textAnchor="middle" fill="#fb7185" fontFamily="monospace" fontSize="10">STOP</text>
      </svg>
    ),
  },
  {
    tag: "INFOTAINMENT · OEM", icon: "radio", color: "#22d3ee",
    title: "Infotainment UI Modules",
    desc: "Design assets and interaction models for SUV infotainment — Calls, Media, Settings, and Vehicle Statistics screens designed in Figma Enterprise for production deployment.",
    wide: true,
    art: (
      <svg viewBox="0 0 1160 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width:"100%", height:"100%" }}>
        <rect width="1160" height="300" fill="#060c18"/>
        {[["CALLS","call","#34d399",60],["MEDIA","music_note","#22d3ee",280],["SETTINGS","settings","#a78bfa",500],["VEHICLE","directions_car","#f59e0b",720],["NAV","map","#fb7185",940]].map(([l,,c,x])=>(
          <g key={l}>
            <rect x={x} y="60" width="160" height="180" rx="12" fill={`${c}08`} stroke={`${c}22`} strokeWidth="1"/>
            <circle cx={x+80} cy="130" r="30" fill={`${c}15`} stroke={`${c}33`} strokeWidth="1.5"/>
            <text x={x+80} y="185" textAnchor="middle" fill={`${c}80`} fontFamily="monospace" fontSize="10" letterSpacing="2">{l}</text>
          </g>
        ))}
      </svg>
    ),
  },
  {
    tag: "MULTI-PLATFORM", icon: "devices", color: "#a78bfa",
    title: "Multi-Platform UI/UX Designs",
    desc: "Adaptive UI/UX design systems spanning desktop, mobile, and embedded display platforms — consistent design language across different form factors and interaction models.",
    wide: false,
    art: (
      <svg viewBox="0 0 580 280" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width:"100%", height:"100%" }}>
        <rect width="580" height="280" fill="#060c18"/>
        <rect x="40" y="60" width="220" height="160" rx="10" fill="rgba(167,139,250,0.05)" stroke="rgba(167,139,250,0.2)" strokeWidth="1"/>
        <text x="150" y="150" textAnchor="middle" fill="rgba(167,139,250,0.3)" fontFamily="monospace" fontSize="9" letterSpacing="2">DESKTOP</text>
        <rect x="300" y="90" width="100" height="160" rx="12" fill="rgba(34,211,238,0.05)" stroke="rgba(34,211,238,0.2)" strokeWidth="1"/>
        <circle cx="350" cy="236" r="6" fill="none" stroke="rgba(34,211,238,0.3)" strokeWidth="1"/>
        <text x="350" y="150" textAnchor="middle" fill="rgba(34,211,238,0.3)" fontFamily="monospace" fontSize="8" letterSpacing="1">MOBILE</text>
        <rect x="430" y="100" width="120" height="90" rx="8" fill="rgba(52,211,153,0.05)" stroke="rgba(52,211,153,0.2)" strokeWidth="1"/>
        <text x="490" y="150" textAnchor="middle" fill="rgba(52,211,153,0.3)" fontFamily="monospace" fontSize="8" letterSpacing="1">TABLET</text>
      </svg>
    ),
  },
  {
    tag: "DESIGNER PROFILE", icon: "person", color: "#fb7185",
    title: "Jeevanandham S — Full Design Portfolio",
    desc: "4.9+ years engineering & designing HMI systems across automotive, medical, and embedded platforms. View all projects, case studies, and visual design work on Behance.",
    wide: false,
    art: (
      <svg viewBox="0 0 580 280" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width:"100%", height:"100%" }}>
        <rect width="580" height="280" fill="#060c18"/>
        <circle cx="290" cy="140" r="70" fill="rgba(245,158,11,0.06)" stroke="rgba(245,158,11,0.2)" strokeWidth="1.5"/>
        <text x="290" y="135" textAnchor="middle" fill="#f59e0b" fontFamily="monospace" fontSize="12">HMI</text>
        <text x="290" y="152" textAnchor="middle" fill="#f59e0b" fontFamily="monospace" fontSize="12">ENGINEER</text>
        {[["Qt/QML","#22d3ee",160,80],["Embedded","#34d399",160,200],["A-SPICE","#a78bfa",420,80],["Figma/UX","#fb7185",420,200]].map(([l,c,x,y])=>(
          <g key={l}>
            <circle cx={x} cy={y} r="32" fill={`${c}08`} stroke={`${c}22`} strokeWidth="1"/>
            <text x={x} y={y+4} textAnchor="middle" fill={`${c}cc`} fontFamily="monospace" fontSize="9">{l}</text>
            <line x1={x+(x<290?32:-32)} y1={y} x2={290+(x<290?-70:70)} y2={140+(y<140?-28:28)} stroke={`${c}22`} strokeWidth="1"/>
          </g>
        ))}
      </svg>
    ),
  },
];

function Design() {
  return (
    <div id="design" data-section="design" className="full-band" style={{ background: "var(--bg2)", borderTop: "1px solid var(--bdr)" }}>
      <div className="inner">
        <SL icon="brush" text="05 — Design Portfolio" />
        <ST>Creative Work</ST>
        <div className="behance-grid">
          {DESIGN_CARDS.map((card, i) => (
            <a key={card.title} href="https://behance.net/s_jeevanandham" target="_blank" rel="noopener noreferrer"
              className={`behance-card reveal d${i % 2}${card.wide ? " wide" : ""}`}>
              <div className="behance-card-bg">{card.art}</div>
              <div className="behance-overlay" />
              <div className="behance-card-content">
                <div className="bc-tag" style={{ color: card.color }}><Ms icon={card.icon} size={13} />{card.tag}</div>
                <div className="bc-title">{card.title}</div>
                <div className="bc-desc">{card.desc}</div>
                <div className="bc-cta" style={{ color: card.color }}><Ms icon="open_in_new" size={14} />View on Behance</div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EDUCATION
// ─────────────────────────────────────────────────────────────────────────────
function Education() {
  return (
    <section id="education" data-section="education" className="section-wrap">
      <SL icon="school" text="06 — Education" />
      <ST>Academic Background</ST>
      <div className="edu-grid">
        <div className="edu-card reveal">
          <div className="edu-icon"><Ms icon="school" size={26} fill={0} wght={200} style={{ color: "#22d3ee" }} /></div>
          <div className="edu-degree">B.E. — Electronics & Communication Engineering</div>
          <div className="edu-school">Adhiparasakthi College of Engineering (Anna University), Tamil Nadu</div>
          <div className="edu-row">
            <span className="edu-tag">2015 – 2020</span>
            <span className="edu-tag">CGPA: 6.34 / 10</span>
            <span className="edu-tag">ECE</span>
          </div>
        </div>
        <div className="edu-card reveal d1">
          <div className="edu-icon"><Ms icon="military_tech" size={26} fill={0} wght={200} style={{ color: "#f59e0b" }} /></div>
          <div className="edu-degree">Key Domain Expertise</div>
          <div className="edu-school">4.9+ years of production-grade specialisation in HMI engineering across Automotive and Medical device industries</div>
          <div className="edu-row">
            {["Automotive HMI","Medical Device HMI","Instrument Clusters","Infotainment","ADAS / 3D Viz"].map(d => (
              <span key={d} style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:9.5, color:"var(--amber)", background:"rgba(245,158,11,0.08)", border:"1px solid rgba(245,158,11,0.18)", borderRadius:3, padding:"3px 8px" }}>{d}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CERTIFICATIONS
// ─────────────────────────────────────────────────────────────────────────────
function Certifications() {
  return (
    <div id="certifications" data-section="certifications" className="full-band" style={{ background: "var(--surf)", borderTop: "1px solid var(--bdr)", borderBottom: "1px solid var(--bdr)" }}>
      <div className="inner">
        <SL icon="verified" text="07 — Certifications" />
        <ST>Credentials</ST>
        <div className="certs-grid">
          {CERTS.map((cert, i) => (
            <div key={cert.name} className={`cert-card reveal d${i}`}>
              <div className="cert-ico"><Ms icon={cert.icon} size={24} style={{ color: "#f59e0b" }} /></div>
              <div className="cert-name">{cert.name}</div>
              <div className="cert-org">{cert.org}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RESUME
// ─────────────────────────────────────────────────────────────────────────────
function Resume() {
  const BARS = [
    { label: "Qt / QML",    w: "92%", g: "linear-gradient(90deg,#f59e0b,#22d3ee)" },
    { label: "Embedded C++",w: "88%", g: "linear-gradient(90deg,#34d399,#22d3ee)" },
    { label: "LVGL / HMI",  w: "85%", g: "linear-gradient(90deg,#a78bfa,#fb7185)" },
    { label: "UX / Figma",  w: "78%", g: "linear-gradient(90deg,#fb7185,#f59e0b)" },
  ];
  return (
    <div id="resume" data-section="resume" className="full-band">
      <div className="inner">
        <SL icon="description" text="08 — Resume" />
        <div className="resume-inner">
          <div className="resume-info reveal">
            <h3>Download My Resume</h3>
            <p>Full details on experience, projects, skills, certifications, and education — available as a PDF for your review or ATS systems.</p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a href="Jeevanandham_Resume.pdf" download="Jeevanandham_SeniorHMIEngineer_Resume.pdf" className="btn btn-green">
                <Ms icon="download" size={17} />Download PDF
              </a>
              <a href="Jeevanandham_Resume.pdf" target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                <Ms icon="open_in_new" size={17} />View Online
              </a>
            </div>
          </div>
          <div className="resume-preview reveal d1">
            <div className="resume-preview-header"><Ms icon="picture_as_pdf" size={14} />JEEVANANDHAM_RESUME.PDF &nbsp;·&nbsp; 3 PAGES</div>
            <div className="rdp-name">S. JEEVANANDHAM</div>
            <div className="rdp-role">SENIOR SOFTWARE ENGINEER – AUTOMOTIVE & MEDICAL HMI | UI/UX | QT/QML | EMBEDDED C++</div>
            <div className="rdp-line" />
            {[{ ms: "location_on", t: "Chennai, Tamil Nadu, India" },{ ms: "mail", t: "jeevanandhamsivashankaran@gmail.com" },{ ms: "phone", t: "+91 8111010315" }].map(({ ms, t }) => (
              <div key={t} style={{ display:"flex", alignItems:"center", gap:6, fontFamily:"'Share Tech Mono',monospace", fontSize:9, color:"var(--muted)", marginBottom:5 }}>
                <Ms icon={ms} size={11} style={{ color:"var(--amber)" }} />{t}
              </div>
            ))}
            <div className="rdp-line" />
            <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:9.5, color:"var(--text2)", marginBottom:10, letterSpacing:"0.12em" }}>KEY SKILLS</div>
            {BARS.map(({ label, w, g }) => (
              <div key={label} className="rdp-skill-row">
                <span className="rdp-label">{label}</span>
                <div className="rdp-bar"><div className="rdp-bar-fill" style={{ width: w, background: g }} /></div>
              </div>
            ))}
            <div className="rdp-line" />
            <div style={{ display:"flex", gap:10 }}>
              <a href="Jeevanandham_Resume.pdf" download style={{ display:"inline-flex", alignItems:"center", gap:4, fontFamily:"'Share Tech Mono',monospace", fontSize:9, color:"var(--green)", border:"1px solid rgba(52,211,153,0.25)", borderRadius:3, padding:"5px 10px", transition:"all 0.2s", textDecoration:"none" }}
                onMouseOver={e => e.currentTarget.style.background="rgba(52,211,153,0.1)"} onMouseOut={e => e.currentTarget.style.background="transparent"}>
                <Ms icon="download" size={12} />Download
              </a>
              <a href="Jeevanandham_Resume.pdf" target="_blank" rel="noopener noreferrer" style={{ display:"inline-flex", alignItems:"center", gap:4, fontFamily:"'Share Tech Mono',monospace", fontSize:9, color:"var(--amber)", border:"1px solid rgba(245,158,11,0.25)", borderRadius:3, padding:"5px 10px", transition:"all 0.2s", textDecoration:"none" }}
                onMouseOver={e => e.currentTarget.style.background="rgba(245,158,11,0.1)"} onMouseOut={e => e.currentTarget.style.background="transparent"}>
                <Ms icon="open_in_new" size={12} />View
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTACT
// ─────────────────────────────────────────────────────────────────────────────
function Contact() {
  return (
    <section id="contact" data-section="contact" className="section-wrap contact-wrap">
      <SL icon="mail" text="09 — Contact" />
      <ST>Let's Work Together</ST>
      <p className="contact-sub">Open to senior HMI engineering roles, embedded UI consulting, and collaborative automotive or medical device projects. Based in Chennai, India.</p>
      <div className="contact-links reveal">
        <a href="mailto:jeevanandhamsivashankaran@gmail.com" className="contact-item c-email"><Ms icon="mail" size={16} />jeevanandhamsivashankaran@gmail.com</a>
        <a href="tel:+918111010315" className="contact-item c-phone"><Ms icon="phone" size={16} />+91 8111010315</a>
      </div>
      <div className="contact-links reveal d1" style={{ marginTop: 10 }}>
        <a href="https://linkedin.com/in/jeevanandhamsivashankaran/" target="_blank" rel="noopener noreferrer" className="contact-item c-li"><Ms icon="open_in_new" size={16} />LinkedIn</a>
        <a href="https://behance.net/s_jeevanandham" target="_blank" rel="noopener noreferrer" className="contact-item c-bh"><Ms icon="brush" size={16} />Behance Portfolio</a>
        <a href="https://github.com/jeevanandhamsivasankar" target="_blank" rel="noopener noreferrer" className="contact-item c-gh"><Ms icon="terminal" size={16} />GitHub</a>
      </div>
      <div className="contact-loc"><Ms icon="location_on" size={14} />Chennai, Tamil Nadu, India</div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// APP
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const [theme, toggleTheme] = useTheme();
  useReveal();

  return (
    <>
      <style>{CSS}</style>
      <GradientOrbs />
      <CursorGlow />
      <Nav theme={theme} onToggle={toggleTheme} />
      <main>
        <Hero />
        <div className="divider" />
        <About />
        <div className="divider" />
        <Experience />
        <div className="divider" />
        <Skills />
        <div className="divider" />
        <Projects />
        <div className="divider" />
        <Design />
        <div className="divider" />
        <Education />
        <div className="divider" />
        <Certifications />
        <div className="divider" />
        <Resume />
        <div className="divider" />
        <Contact />
      </main>
      <footer>
        <Ms icon="developer_board" size={14} />
        © 2026 S. JEEVANANDHAM — SENIOR HMI ENGINEER — BUILT WITH PRECISION
        <Ms icon="developer_board" size={14} />
      </footer>
    </>
  );
}
