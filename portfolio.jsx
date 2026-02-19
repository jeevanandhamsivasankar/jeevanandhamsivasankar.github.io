import { useState, useEffect, useRef, useCallback } from "react";

// ── HOOKS ──────────────────────────────────────────────────────────────────────

function useInView(threshold = 0.07) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.unobserve(el); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

function useActiveSection() {
  const [active, setActive] = useState("hero");
  useEffect(() => {
    const handler = () => {
      let cur = "hero";
      document.querySelectorAll("[data-section]").forEach((s) => {
        if (window.scrollY >= s.offsetTop - 140) cur = s.dataset.section;
      });
      setActive(cur);
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);
  return active;
}

function useMouseParallax(factor = 0.015) {
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => {
      if (!ref.current) return;
      const { innerWidth: w, innerHeight: h } = window;
      const x = ((e.clientX / w) - 0.5) * factor * 100;
      const y = ((e.clientY / h) - 0.5) * factor * 100;
      ref.current.style.transform = `perspective(900px) rotateY(${x}deg) rotateX(${-y}deg) translateZ(6px)`;
    };
    window.addEventListener("mousemove", handler, { passive: true });
    return () => window.removeEventListener("mousemove", handler);
  }, [factor]);
  return ref;
}

// ── DATA ───────────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { id: "about", icon: "person", label: "About" },
  { id: "experience", icon: "work", label: "Experience" },
  { id: "skills", icon: "build", label: "Skills" },
  { id: "projects", icon: "rocket_launch", label: "Projects" },
  { id: "design", icon: "brush", label: "Design" },
  { id: "certifications", icon: "verified", label: "Certs" },
  { id: "resume", icon: "description", label: "Resume" },
  { id: "contact", icon: "mail", label: "Contact" },
];

const STATS = [
  { icon: "schedule", num: "4.9+", label: "Years Experience", color: "amber" },
  { icon: "rocket_launch", num: "8+", label: "Projects Shipped", color: "cyan" },
  { icon: "devices", num: "2", label: "Domains — Auto & Med", color: "green" },
  { icon: "code", num: "C++", label: "Primary Language", color: "violet" },
];

const EXPERIENCE = [
  {
    icon: "medical_services",
    role: "Senior Software Engineer",
    company: "PixelExpert Technology & Services Pvt. Ltd.",
    period: "SEP 2024 — JAN 2026",
    location: "Chennai, Tamil Nadu",
    desc: "Led HMI design & development for a medical physiotherapy laser therapy device — full ownership from UX design through Qt/QML implementation, embedded C++ backend, custom UART framework with CRC validation, and SQLite3 patient database. Safety-aware screen interactions, structured validation, and Linux-based device control integration.",
  },
  {
    icon: "directions_car",
    role: "Embedded Software Engineer",
    company: "PixelExpert Technology & Services Pvt. Ltd.",
    period: "APR 2022 — AUG 2024",
    location: "Chennai, Tamil Nadu",
    desc: "Developed automotive Instrument Cluster and Infotainment HMI across multiple OEM programs using Qt/QML, LVGL, Candera CGI Studio, and Embedded C. Worked as HCL external engineer on a SUV infotainment platform delivering Calls, Media, Settings, and Vehicle Stats modules in A-SPICE aligned Jenkins CI/CD environment.",
  },
  {
    icon: "school",
    role: "Graduate Engineer Trainee",
    company: "PixelExpert Technology & Services Pvt. Ltd.",
    period: "SEP 2021 — MAR 2022",
    location: "Chennai, Tamil Nadu",
    desc: "Hands-on embedded development training on STM32 — UART, SPI, I²C, GPIO protocols. Built TouchGFX-based Instrument Cluster prototype with speedometer, odometer, alerts, trip metres, and fuel gauge. Foundational training in structured UI graphics and embedded integration.",
  },
  {
    icon: "palette",
    role: "Graphics Designer Trainee",
    company: "Lapiz Digital Services Pvt. Ltd.",
    period: "MAY 2019 — SEP 2019",
    location: "Chennai, Tamil Nadu",
    desc: "Internship focused on visual design fundamentals, digital graphics production, and creative tooling across Adobe Creative Suite.",
  },
];

const SKILLS = [
  {
    icon: "code", color: "amber", title: "Languages",
    tags: ["C++ (C++11–C++17)", "Embedded C", "QML", "Lua", "SCML", "OOP / STL", "Smart Pointers"],
  },
  {
    icon: "layers", color: "cyan", title: "HMI Frameworks",
    tags: ["Qt/QML", "Qt Widgets", "LVGL", "TouchGFX", "Candera CGI Studio", "Crank Storyboard", "GUI Guider", "VG Lite", "Qt 3D Studio"],
  },
  {
    icon: "memory", color: "green", title: "Embedded & OS",
    tags: ["FreeRTOS", "Embedded Linux", "Yocto", "Ubuntu", "STM32", "i.MX6", "MIMXRT1170", "i.MX8M"],
  },
  {
    icon: "cable", color: "rose", title: "Communication",
    tags: ["CAN Bus", "UART / CRC", "SPI", "I²C", "GPIO"],
  },
  {
    icon: "settings", color: "violet", title: "Tools & DevOps",
    tags: ["Git", "Plastic SCM", "Jenkins", "CMake", "Jira", "Polarion", "STM32CubeIDE", "MCUXpresso", "GDB", "DLT Viewer"],
  },
  {
    icon: "palette", color: "amber", title: "Design & UX",
    tags: ["Figma", "Adobe Illustrator", "Adobe XD", "Photoshop", "GIMP", "FontForge", "Affinity", "Miro"],
  },
];

const PROJECTS = [
  {
    period: "OCT 2024 — JAN 2026", num: "PROJECT_01", domain: "Medical Device",
    icon: "medical_services", color: "green", wide: false,
    title: "Physiotherapy Laser Therapy HMI",
    desc: "Full-ownership HMI for a medical laser therapy device — treatment workflows, safety-aware UI logic, SQLite3 patient records, and a custom UART framework with CRC validation and secure response handling. Linux-based device control integration.",
    tags: ["Qt/QML", "C++", "SQLite3", "UART/CRC", "Linux"],
  },
  {
    period: "NOV 2023 — SEP 2024", num: "PROJECT_02", domain: "Automotive",
    icon: "speed", color: "amber", wide: false,
    title: "LVGL Cluster — MIMXRT1170",
    desc: "High-performance next-gen instrument cluster using Embedded C, LVGL, and VG Lite on MIMXRT1170 EVKB. ADAS-style visualisation widgets and low-level GPU rendering optimisations for smooth real-time gauge rendering.",
    tags: ["LVGL", "VG Lite", "Embedded C", "MIMXRT1170", "ADAS"],
  },
  {
    period: "MAR 2023 — SEP 2023", num: "PROJECT_03", domain: "Automotive · Infotainment · OEM",
    icon: "radio", color: "cyan", wide: true,
    title: "SUV In-Vehicle Infotainment System",
    desc: "HMI developer on a production SUV infotainment platform (HCL external assignment). Delivered Calls, Media, Settings, Vehicle Statistics, Steering Controls & Bezel Button modules. Full A-SPICE Agile sprints via Jira, Polarion, Plastic SCM, Jenkins CI/CD. Validation via TK Logger for latency control and reliability assurance.",
    tags: ["Qt/QML", "C++", "Jenkins", "Plastic SCM", "A-SPICE", "Figma Enterprise", "Polarion", "Linux"],
  },
  {
    period: "NOV 2022 — MAR 2023", num: "PROJECT_04", domain: "Automotive",
    icon: "two_wheeler", color: "amber", wide: false,
    title: "Sports Bike Cluster — i.MX6",
    desc: "Advanced cluster on i.MX6 with Qt/QML and Linux. 5-button navigation, theme switching, customisable widgets, structured UART framework, and performance-optimised 2D/2.5D graphical animations.",
    tags: ["Qt/QML", "C++", "i.MX6", "Linux", "SQLite3"],
  },
  {
    period: "JAN 2022 — SEP 2022", num: "PROJECT_05", domain: "Automotive · OEM (NDA)",
    icon: "two_wheeler", color: "amber", wide: false,
    title: "Two-Wheeler OEM Cluster — CGI Studio",
    desc: "Production Instrument Cluster for a leading two-wheeler OEM. State machines, structured UI navigation, core functional workflows with driver readability & safety principles. Performance-optimised 2D/2.5D animations. CMake build and automotive documentation standards.",
    tags: ["Candera CGI Studio", "Lua", "SCML", "CMake", "Photoshop"],
  },
  {
    period: "R&D / INTERNAL CAPABILITY WORK", num: "PROJECT_R&D", domain: "Internal",
    icon: "sensors", color: "violet", wide: true,
    title: "ADAS 3D Demonstrator & R&D Projects",
    desc: "Collision visualisation and parking assist UI demonstrator built with Qt 3D Studio and Blender on i.MX8M. Includes a TouchGFX-based STM32F469G prototype with speedometer, odometer, trip meters, alerts, and fuel gauge — structured UI graphics and embedded integration for capability development.",
    tags: ["Qt 3D Studio", "Blender", "i.MX8M", "TouchGFX", "STM32F469G", "ADAS"],
  },
];

const CERTS = [
  { icon: "school", name: "Qt 6 Core — Beginner, Intermediate & Advanced", org: "UDEMY" },
  { icon: "school", name: "QML for Beginners", org: "UDEMY" },
  { icon: "verified_user", name: "Google UX Design Professional Certificate", org: "COURSERA — CREDLY VERIFIED" },
];

const COLOR_MAP = {
  amber: { border: "rgba(245,158,11,0.35)", bg: "rgba(245,158,11,0.1)", text: "#f59e0b", tag_bg: "rgba(245,158,11,0.1)", tag_border: "rgba(245,158,11,0.2)" },
  cyan:  { border: "rgba(34,211,238,0.35)",  bg: "rgba(34,211,238,0.1)",  text: "#22d3ee", tag_bg: "rgba(34,211,238,0.1)",  tag_border: "rgba(34,211,238,0.2)"  },
  green: { border: "rgba(52,211,153,0.35)",  bg: "rgba(52,211,153,0.1)",  text: "#34d399", tag_bg: "rgba(52,211,153,0.1)",  tag_border: "rgba(52,211,153,0.2)"  },
  rose:  { border: "rgba(251,113,133,0.35)", bg: "rgba(251,113,133,0.1)", text: "#fb7185", tag_bg: "rgba(251,113,133,0.1)", tag_border: "rgba(251,113,133,0.2)"  },
  violet:{ border: "rgba(167,139,250,0.35)", bg: "rgba(167,139,250,0.1)", text: "#a78bfa", tag_bg: "rgba(167,139,250,0.1)", tag_border: "rgba(167,139,250,0.2)"  },
};

// ── PRIMITIVE COMPONENTS ────────────────────────────────────────────────────────

const Ms = ({ icon, size = 18, fill = 0, wght = 300 }) => (
  <span
    style={{
      fontFamily: "'Material Symbols Outlined'",
      fontVariationSettings: `'FILL' ${fill},'wght' ${wght},'GRAD' -25,'opsz' 48`,
      fontSize: size,
      lineHeight: 1,
      display: "inline-block",
      verticalAlign: "middle",
    }}
  >
    {icon}
  </span>
);

function Reveal({ children, delay = 0, className = "", style = {} }) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.65s ${delay}s cubic-bezier(.22,.68,0,1.2), transform 0.65s ${delay}s cubic-bezier(.22,.68,0,1.2)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function SectionLabel({ icon, text }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "'Share Tech Mono',monospace", fontSize: 10, color: "#f59e0b", letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 10 }}>
      <Ms icon={icon} size={13} />
      {text}
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <h2 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "clamp(28px,4.5vw,50px)", fontWeight: 800, textTransform: "uppercase", lineHeight: 1, letterSpacing: "-0.01em", marginBottom: 48, color: "#e2e8f0" }}>
      {children}
    </h2>
  );
}

// ── NAV ────────────────────────────────────────────────────────────────────────

function Nav() {
  const active = useActiveSection();
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 44px", height: 64,
        background: "rgba(6,12,24,0.92)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}>
        <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 11, color: "#f59e0b", letterSpacing: "0.14em", display: "flex", alignItems: "center", gap: 9 }}>
          <Ms icon="developer_board" size={17} />
          JEEVANANDHAM
        </div>
        <ul style={{ display: "flex", gap: 2, listStyle: "none", margin: 0, padding: 0 }} className="nav-list">
          {NAV_LINKS.map(({ id, icon, label }) => (
            <li key={id}>
              <a
                href={`#${id}`}
                style={{
                  fontFamily: "'Share Tech Mono',monospace", fontSize: 10.5, letterSpacing: "0.1em",
                  color: active === id ? "#f59e0b" : "#94a3b8", textTransform: "uppercase",
                  padding: "7px 13px", borderRadius: 5, display: "flex", alignItems: "center", gap: 5,
                  background: active === id ? "rgba(245,158,11,0.12)" : "transparent",
                  transition: "all 0.2s", textDecoration: "none",
                }}
              >
                <Ms icon={icon} size={13} />
                {label}
              </a>
            </li>
          ))}
        </ul>
        <button
          onClick={() => setOpen(!open)}
          style={{ display: "none", flexDirection: "column", gap: 5, background: "none", border: "none", cursor: "pointer", padding: 4 }}
          className="hamburger"
        >
          {[0,1,2].map(i => <span key={i} style={{ display: "block", width: 22, height: 2, background: "#f59e0b", borderRadius: 2 }} />)}
        </button>
      </nav>
      {open && (
        <div style={{
          position: "fixed", top: 64, left: 0, right: 0,
          background: "rgba(6,12,24,0.98)", borderBottom: "1px solid rgba(255,255,255,0.07)",
          zIndex: 199, padding: "16px 24px", display: "flex", flexDirection: "column", gap: 4,
        }}>
          {NAV_LINKS.map(({ id, icon, label }) => (
            <a key={id} href={`#${id}`} onClick={() => setOpen(false)}
              style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 12, color: "#94a3b8", textTransform: "uppercase", padding: "10px 14px", borderRadius: 5, display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
              <Ms icon={icon} size={15} />
              {label}
            </a>
          ))}
        </div>
      )}
    </>
  );
}

// ── HERO ───────────────────────────────────────────────────────────────────────

function HeroSpeedometer() {
  const [speed, setSpeed] = useState(0);
  const raf = useRef(null);
  useEffect(() => {
    let t = 0;
    const tick = () => {
      t += 0.008;
      setSpeed(Math.sin(t * 0.6) * 40 + 85 + Math.sin(t * 1.3) * 20);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, []);

  const cx = 130, cy = 130, r = 100;
  const minAngle = -210, maxAngle = 30;
  const angle = minAngle + ((speed / 180) * (maxAngle - minAngle));
  const toRad = (d) => (d * Math.PI) / 180;
  const arcStart = { x: cx + r * Math.cos(toRad(minAngle)), y: cy + r * Math.sin(toRad(minAngle)) };
  const arcEnd   = { x: cx + r * Math.cos(toRad(maxAngle)), y: cy + r * Math.sin(toRad(maxAngle)) };
  const fillEnd  = { x: cx + r * Math.cos(toRad(angle)), y: cy + r * Math.sin(toRad(angle)) };
  const largeArc = (maxAngle - minAngle) > 180 ? 1 : 0;
  const fillLarge = (angle - minAngle) > 180 ? 1 : 0;
  const needleX = cx + 85 * Math.cos(toRad(angle));
  const needleY = cy + 85 * Math.sin(toRad(angle));
  const ticks = Array.from({ length: 19 }, (_, i) => {
    const a = minAngle + (i / 18) * (maxAngle - minAngle);
    const major = i % 3 === 0;
    const ri = major ? r - 18 : r - 10;
    return {
      x1: cx + r * Math.cos(toRad(a)), y1: cy + r * Math.sin(toRad(a)),
      x2: cx + ri * Math.cos(toRad(a)), y2: cy + ri * Math.sin(toRad(a)),
      major,
    };
  });

  return (
    <svg viewBox="0 0 260 260" style={{ width: 260, height: 260 }}>
      <defs>
        <radialGradient id="gaugeBg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#111d30" />
          <stop offset="100%" stopColor="#060c18" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {/* Outer ring */}
      <circle cx={cx} cy={cy} r={118} fill="url(#gaugeBg)" stroke="rgba(245,158,11,0.15)" strokeWidth="1.5" />
      <circle cx={cx} cy={cy} r={108} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
      {/* Track */}
      <path d={`M ${arcStart.x} ${arcStart.y} A ${r} ${r} 0 ${largeArc} 1 ${arcEnd.x} ${arcEnd.y}`}
        fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="8" strokeLinecap="round" />
      {/* Fill */}
      <path d={`M ${arcStart.x} ${arcStart.y} A ${r} ${r} 0 ${fillLarge} 1 ${fillEnd.x} ${fillEnd.y}`}
        fill="none" stroke="url(#needleGrad)" strokeWidth="8" strokeLinecap="round" filter="url(#glow)" />
      <defs>
        <linearGradient id="needleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      {/* Ticks */}
      {ticks.map((tk, i) => (
        <line key={i} x1={tk.x1} y1={tk.y1} x2={tk.x2} y2={tk.y2}
          stroke={tk.major ? "rgba(245,158,11,0.5)" : "rgba(255,255,255,0.15)"}
          strokeWidth={tk.major ? 2 : 1} />
      ))}
      {/* Needle */}
      <line x1={cx} y1={cy} x2={needleX} y2={needleY}
        stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" filter="url(#glow)" />
      <circle cx={cx} cy={cy} r={7} fill="#f59e0b" />
      <circle cx={cx} cy={cy} r={3} fill="#060c18" />
      {/* Speed value */}
      <text x={cx} y={cy + 32} textAnchor="middle" fill="#e2e8f0"
        fontFamily="'Share Tech Mono',monospace" fontSize="28" fontWeight="bold">
        {Math.round(speed)}
      </text>
      <text x={cx} y={cy + 48} textAnchor="middle" fill="rgba(245,158,11,0.7)"
        fontFamily="'Share Tech Mono',monospace" fontSize="10" letterSpacing="0.15em">
        km/h
      </text>
      {/* Label */}
      <text x={cx} y={cy - 36} textAnchor="middle" fill="rgba(34,211,238,0.6)"
        fontFamily="'Share Tech Mono',monospace" fontSize="9" letterSpacing="0.18em">
        HMI CLUSTER DEMO
      </text>
    </svg>
  );
}

function Hero() {
  const cardRef = useMouseParallax(0.012);
  const [typed, setTyped] = useState("");
  const roles = ["Qt / QML Developer", "Embedded HMI Engineer", "UX / UI Engineer", "Instrument Cluster Dev"];
  const roleRef = useRef({ ri: 0, ci: 0, deleting: false });
  useEffect(() => {
    let timeout;
    const tick = () => {
      const { ri, ci, deleting } = roleRef.current;
      const word = roles[ri];
      if (!deleting) {
        if (ci < word.length) {
          setTyped(word.slice(0, ci + 1));
          roleRef.current.ci++;
          timeout = setTimeout(tick, 60);
        } else {
          timeout = setTimeout(() => { roleRef.current.deleting = true; tick(); }, 1800);
        }
      } else {
        if (ci > 0) {
          setTyped(word.slice(0, ci - 1));
          roleRef.current.ci--;
          timeout = setTimeout(tick, 35);
        } else {
          roleRef.current.ri = (ri + 1) % roles.length;
          roleRef.current.deleting = false;
          timeout = setTimeout(tick, 300);
        }
      }
    };
    timeout = setTimeout(tick, 800);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <section id="hero" data-section="hero" style={{
      position: "relative", minHeight: "100vh", display: "grid",
      gridTemplateColumns: "1fr 420px", alignItems: "center",
      padding: "100px 44px 80px", overflow: "hidden", zIndex: 1, gap: 48,
    }}>
      {/* Animated rings */}
      <div style={{ position: "absolute", right: -80, top: "50%", transform: "translateY(-50%)", width: 600, height: 600, zIndex: 0, opacity: 0.6, pointerEvents: "none" }}>
        {[580, 440, 300].map((sz, i) => (
          <div key={i} style={{
            position: "absolute", borderRadius: "50%", border: `1px solid ${["rgba(245,158,11,0.04)","rgba(245,158,11,0.06)","rgba(34,211,238,0.07)"][i]}`,
            borderStyle: i === 2 ? "dashed" : "solid",
            width: sz, height: sz, top: "50%", left: "50%",
            transform: "translate(-50%,-50%)",
            animation: `spin ${[80,55,36][i]}s linear infinite ${i === 1 ? "reverse" : ""}`,
          }} />
        ))}
      </div>

      {/* Content */}
      <div style={{ position: "relative", zIndex: 2 }}>
        <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 10.5, color: "#f59e0b", letterSpacing: "0.24em", textTransform: "uppercase", marginBottom: 22, opacity: 0, animation: "fadeUp 0.55s 0.15s forwards", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ display: "inline-block", width: 24, height: 1, background: "#f59e0b" }} />
          <Ms icon="developer_board" size={15} />
          Senior HMI Engineer · Chennai, India
        </div>
        <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "clamp(50px,8.5vw,100px)", fontWeight: 800, lineHeight: 0.9, letterSpacing: "-0.02em", textTransform: "uppercase", opacity: 0, animation: "fadeUp 0.65s 0.28s forwards", color: "#e2e8f0" }}>
          Er.<br /><em style={{ color: "#f59e0b", fontStyle: "normal" }}>Jeevanandham</em><br />Sivasankar
        </h1>
        <div style={{ marginTop: 22, fontFamily: "'Share Tech Mono',monospace", fontSize: 13, color: "#22d3ee", letterSpacing: "0.06em", opacity: 0, animation: "fadeUp 0.55s 0.42s forwards", minHeight: 22 }}>
          {typed}<span style={{ animation: "blink 1s infinite", opacity: 1 }}>|</span>
        </div>
        <p style={{ marginTop: 18, fontSize: 15, fontWeight: 300, color: "#94a3b8", maxWidth: 520, lineHeight: 1.85, opacity: 0, animation: "fadeUp 0.65s 0.52s forwards" }}>
          Senior Software Engineer with <span style={{ color: "#e2e8f0", fontWeight: 500 }}>4.9+ years</span> in Automotive HMI, Infotainment Systems, Instrument Clusters, and Medical Device HMI. Specialising in <span style={{ color: "#e2e8f0", fontWeight: 500 }}>Qt/QML, Embedded C++, and real-time UI engineering</span>.
        </p>
        <div style={{ marginTop: 28, display: "flex", gap: 7, flexWrap: "wrap", opacity: 0, animation: "fadeUp 0.55s 0.62s forwards" }}>
          {["Qt / QML", "Embedded C++", "LVGL", "CAN Bus", "A-SPICE", "Linux HMI"].map(b => (
            <span key={b} style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9.5, letterSpacing: "0.1em", color: "#94a3b8", background: "#0d1626", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 3, padding: "5px 11px" }}>
              {b}
            </span>
          ))}
        </div>
        <div style={{ marginTop: 34, display: "flex", gap: 12, flexWrap: "wrap", opacity: 0, animation: "fadeUp 0.65s 0.72s forwards" }}>
          <a href="#projects" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", fontFamily: "'Share Tech Mono',monospace", fontSize: 11.5, letterSpacing: "0.08em", borderRadius: 5, background: "#f59e0b", color: "#06080f", fontWeight: 700, textDecoration: "none", transition: "all 0.25s" }}
            onMouseOver={e => { e.currentTarget.style.background="#fbbf24"; e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 8px 28px rgba(245,158,11,0.25)"; }}
            onMouseOut={e => { e.currentTarget.style.background="#f59e0b"; e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow=""; }}>
            <Ms icon="rocket_launch" size={17} /> View Projects
          </a>
          <a href="#contact" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", fontFamily: "'Share Tech Mono',monospace", fontSize: 11.5, letterSpacing: "0.08em", borderRadius: 5, background: "transparent", color: "#e2e8f0", border: "1px solid rgba(255,255,255,0.12)", textDecoration: "none", transition: "all 0.25s" }}
            onMouseOver={e => { e.currentTarget.style.borderColor="#f59e0b"; e.currentTarget.style.color="#f59e0b"; e.currentTarget.style.transform="translateY(-2px)"; }}
            onMouseOut={e => { e.currentTarget.style.borderColor="rgba(255,255,255,0.12)"; e.currentTarget.style.color="#e2e8f0"; e.currentTarget.style.transform=""; }}>
            <Ms icon="mail" size={17} /> Get In Touch
          </a>
          <a href="Jeevanandham_Resume.pdf" download style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", fontFamily: "'Share Tech Mono',monospace", fontSize: 11.5, letterSpacing: "0.08em", borderRadius: 5, background: "rgba(52,211,153,0.11)", color: "#34d399", border: "1px solid rgba(52,211,153,0.25)", textDecoration: "none", transition: "all 0.25s" }}
            onMouseOver={e => { e.currentTarget.style.background="rgba(52,211,153,0.2)"; e.currentTarget.style.transform="translateY(-2px)"; }}
            onMouseOut={e => { e.currentTarget.style.background="rgba(52,211,153,0.11)"; e.currentTarget.style.transform=""; }}>
            <Ms icon="download" size={17} /> Resume
          </a>
        </div>
      </div>

      {/* Profile card */}
      <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div ref={cardRef} style={{ opacity: 0, animation: "fadeIn 0.9s 0.4s forwards", willChange: "transform", transition: "transform 0.15s ease-out" }}>
          {/* Speedometer */}
          <div style={{ position: "relative", display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <HeroSpeedometer />
          </div>
          {/* Info panel */}
          <div style={{ background: "#0d1626", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "16px 18px", fontFamily: "'Share Tech Mono',monospace" }}>
            <div style={{ fontSize: 12, color: "#e2e8f0", letterSpacing: "0.08em", marginBottom: 4 }}>S. JEEVANANDHAM</div>
            <div style={{ fontSize: 10, color: "#f59e0b", letterSpacing: "0.12em", marginBottom: 10 }}>SENIOR HMI ENGINEER</div>
            <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 10, color: "#34d399" }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#34d399", animation: "pulse 2s infinite", flexShrink: 0, display: "inline-block" }} />
              OPEN TO OPPORTUNITIES
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
              {["Automotive HMI", "Medical HMI", "Qt/QML"].map(t => (
                <span key={t} style={{ fontSize: 9, color: "#94a3b8", background: "#111d30", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 2, padding: "3px 7px" }}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── ABOUT ──────────────────────────────────────────────────────────────────────

function About() {
  return (
    <section id="about" data-section="about" style={{ position: "relative", zIndex: 1, padding: "96px 44px", maxWidth: 1160, margin: "0 auto" }}>
      <SectionLabel icon="person" text="01 — About" />
      <SectionTitle>Who I Am</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 64, alignItems: "start" }}>
        <Reveal>
          <div>
            <p style={{ fontSize: 15, color: "#94a3b8", lineHeight: 1.9 }}>
              I'm a <span style={{ color: "#e2e8f0", fontWeight: 500 }}>Senior Software Engineer</span> with deep expertise in Human Machine Interface development for the <span style={{ color: "#e2e8f0", fontWeight: 500 }}>automotive and medical device industries</span>. Over 4.9 years, I've shipped production-grade HMIs for instrument clusters, infotainment systems, and medical therapy devices.
            </p>
            <p style={{ fontSize: 15, color: "#94a3b8", lineHeight: 1.9, marginTop: 14 }}>
              My stack centres on <span style={{ color: "#e2e8f0", fontWeight: 500 }}>Qt/QML and Embedded C++</span>, complemented by LVGL, Candera CGI Studio, and TouchGFX. I've worked across STM32, i.MX6, i.MX8M, and MIMXRT1170 platforms, building everything from low-level driver integrations to polished, safety-aware UI layers.
            </p>
            <p style={{ fontSize: 15, color: "#94a3b8", lineHeight: 1.9, marginTop: 14 }}>
              I bring an unusual combination of <span style={{ color: "#e2e8f0", fontWeight: 500 }}>engineering rigour and UX design sensibility</span> — holding a Google UX Design Professional Certificate and contributing to visual design work via Figma and Adobe tools across all my projects.
            </p>
          </div>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 }}>
          {STATS.map(({ icon, num, label, color }, i) => {
            const c = COLOR_MAP[color];
            return (
              <Reveal key={label} delay={i * 0.1}>
                <div style={{
                  background: "#0d1626", border: `1px solid rgba(255,255,255,0.07)`, borderRadius: 10,
                  padding: "22px 16px", display: "flex", flexDirection: "column", gap: 9,
                  transition: "all 0.28s", cursor: "default",
                }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = c.border; e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 8px 32px ${c.tag_bg}`; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
                  <Ms icon={icon} size={26} fill={0} wght={200} />
                  <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 36, fontWeight: 800, color: c.text, lineHeight: 1 }}>{num}</div>
                  <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9.5, color: "#475569", letterSpacing: "0.16em", textTransform: "uppercase" }}>{label}</div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── EXPERIENCE ─────────────────────────────────────────────────────────────────

function Experience() {
  return (
    <div id="experience" data-section="experience" style={{ background: "#0d1626", borderTop: "1px solid rgba(255,255,255,0.07)", borderBottom: "1px solid rgba(255,255,255,0.07)", position: "relative", zIndex: 1 }}>
      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "96px 44px" }}>
        <SectionLabel icon="work" text="02 — Experience" />
        <SectionTitle>Career</SectionTitle>
        <div style={{ position: "relative", paddingLeft: 28 }}>
          {/* Timeline line */}
          <div style={{ position: "absolute", left: 0, top: 8, bottom: 8, width: 1, background: "linear-gradient(to bottom, #f59e0b, rgba(245,158,11,0.1))" }} />
          {EXPERIENCE.map((exp, i) => (
            <Reveal key={i} delay={i * 0.07}>
              <div style={{ position: "relative", padding: "36px 0 36px 40px", borderBottom: i < EXPERIENCE.length - 1 ? "1px solid rgba(255,255,255,0.07)" : "none" }}>
                {/* Dot */}
                <div style={{ position: "absolute", left: -35, top: 46, width: 9, height: 9, borderRadius: "50%", background: "#f59e0b", boxShadow: "0 0 0 3px rgba(245,158,11,0.2)" }} />
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 46, height: 46, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.2)", flexShrink: 0 }}>
                      <Ms icon={exp.icon} size={22} fill={0} wght={300} />
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 21, fontWeight: 700, textTransform: "uppercase", marginBottom: 4, color: "#e2e8f0" }}>{exp.role}</div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "#e2e8f0" }}>{exp.company}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 10.5, color: "#f59e0b", letterSpacing: "0.1em" }}>{exp.period}</div>
                    <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 10, color: "#475569", marginTop: 3 }}>{exp.location}</div>
                  </div>
                </div>
                <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.85 }}>{exp.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── SKILLS ─────────────────────────────────────────────────────────────────────

function Skills() {
  return (
    <section id="skills" data-section="skills" style={{ position: "relative", zIndex: 1, padding: "96px 44px", maxWidth: 1160, margin: "0 auto" }}>
      <SectionLabel icon="build" text="03 — Skills" />
      <SectionTitle>Toolbox</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 13 }}>
        {SKILLS.map((sg, i) => {
          const c = COLOR_MAP[sg.color];
          return (
            <Reveal key={sg.title} delay={(i % 3) * 0.1}>
              <div style={{
                background: "#0d1626", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12,
                padding: "26px 22px", transition: "all 0.28s", position: "relative", overflow: "hidden",
              }}
                onMouseOver={e => { e.currentTarget.style.borderColor = c.border; e.currentTarget.style.transform = "translateY(-4px)"; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.transform = ""; }}>
                <div style={{ width: 50, height: 50, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: "#111d30", border: "1px solid rgba(255,255,255,0.07)", marginBottom: 14 }}>
                  <span style={{ fontFamily: "'Material Symbols Outlined'", fontVariationSettings: `'FILL' 0,'wght' 200,'GRAD' -25,'opsz' 48`, fontSize: 26, color: c.text, lineHeight: 1 }}>{sg.icon}</span>
                </div>
                <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 10.5, color: "#e2e8f0", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 13, fontWeight: 600 }}>{sg.title}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {sg.tags.map(t => (
                    <span key={t} style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9.5, color: "#94a3b8", background: "#111d30", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 3, padding: "3px 8px" }}>{t}</span>
                  ))}
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

// ── PROJECTS ───────────────────────────────────────────────────────────────────

function Projects() {
  return (
    <section id="projects" data-section="projects" style={{ position: "relative", zIndex: 1, padding: "96px 44px", maxWidth: 1160, margin: "0 auto" }}>
      <SectionLabel icon="rocket_launch" text="04 — Engineering Projects" />
      <SectionTitle>Selected Work</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16 }}>
        {PROJECTS.map((p, i) => {
          const c = COLOR_MAP[p.color];
          return (
            <Reveal key={p.num} delay={(i % 2) * 0.1} style={p.wide ? { gridColumn: "1/-1" } : {}}>
              <div style={{
                background: "#0d1626", border: `1px solid ${c.tag_border}`, borderRadius: 12,
                padding: "28px 26px", position: "relative", overflow: "hidden", transition: "all 0.3s",
              }}
                onMouseOver={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.borderColor = c.border; e.currentTarget.children[0].style.transform = "scaleX(1)"; }}
                onMouseOut={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.borderColor = c.tag_border; e.currentTarget.children[0].style.transform = "scaleX(0)"; }}>
                {/* Top accent line */}
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${c.text},transparent)`, transform: "scaleX(0)", transformOrigin: "left", transition: "transform 0.4s ease" }} />
                <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 10, color: "#475569", marginBottom: 14 }}>{p.period}</div>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 50, height: 50, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: c.bg, border: `1px solid ${c.tag_border}`, flexShrink: 0 }}>
                    <span style={{ fontFamily: "'Material Symbols Outlined'", fontVariationSettings: `'FILL' 0,'wght' 200,'GRAD' -25,'opsz' 48`, fontSize: 26, color: c.text, lineHeight: 1 }}>{p.icon}</span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9.5, color: c.text, letterSpacing: "0.18em", marginBottom: 3 }}>{p.num}</div>
                    <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9.5, color: "#475569", letterSpacing: "0.1em" }}>{p.domain}</div>
                  </div>
                </div>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 19, fontWeight: 700, textTransform: "uppercase", marginBottom: 9, lineHeight: 1.1, color: "#e2e8f0" }}>{p.title}</div>
                <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.85 }}>{p.desc}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 16 }}>
                  {p.tags.map(t => (
                    <span key={t} style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9.5, color: c.text, background: c.bg, border: `1px solid ${c.tag_border}`, borderRadius: 3, padding: "3px 8px" }}>{t}</span>
                  ))}
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

// ── DESIGN / BEHANCE ───────────────────────────────────────────────────────────

function Design() {
  const cards = [
    {
      tag: "automotive", icon: "directions_car", title: "Automotive Instrument Clusters",
      desc: "HMI design work for two-wheeler and four-wheeler instrument clusters — from low-fidelity wireframes to final pixel-perfect UI assets for embedded deployment.",
      color: "amber", wide: false,
    },
    {
      tag: "medical hmi", icon: "medical_services", title: "Medical Device HMI Design",
      desc: "UX/UI design for physiotherapy laser therapy control systems — treatment workflows, patient record interfaces, and safety-oriented screen interaction patterns.",
      color: "green", wide: false,
    },
    {
      tag: "infotainment", icon: "radio", title: "Infotainment UI Modules",
      desc: "Design assets and interaction models for SUV infotainment — Calls, Media, Settings, and Vehicle Statistics screens designed in Figma Enterprise.",
      color: "cyan", wide: true,
    },
    {
      tag: "multi-platform", icon: "devices", title: "Multi-Platform UI/UX Designs",
      desc: "Adaptive UI/UX design systems spanning desktop, mobile, and embedded display platforms — consistent design language across different form factors.",
      color: "violet", wide: false,
    },
    {
      tag: "designer profile", icon: "person", title: "Jeevanandham S — Full Design Portfolio",
      desc: "4.9+ years engineering & designing HMI systems across automotive, medical, and embedded platforms. View all projects on Behance.",
      color: "rose", wide: false,
    },
  ];
  return (
    <div id="design" data-section="design" style={{ background: "#090f1e", borderTop: "1px solid rgba(255,255,255,0.07)", position: "relative", zIndex: 1 }}>
      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "96px 44px" }}>
        <SectionLabel icon="brush" text="05 — Design Portfolio" />
        <SectionTitle>Creative Work</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16 }}>
          {cards.map((card, i) => {
            const c = COLOR_MAP[card.color];
            return (
              <Reveal key={card.title} delay={(i % 2) * 0.1} style={card.wide ? { gridColumn: "1/-1" } : {}}>
                <a href="https://behance.net/s_jeevanandham" target="_blank" rel="noopener noreferrer"
                  style={{ display: "block", background: "#0d1626", border: `1px solid ${c.tag_border}`, borderRadius: 12, padding: "32px 28px", textDecoration: "none", transition: "all 0.3s", position: "relative", overflow: "hidden" }}
                  onMouseOver={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.borderColor = c.border; e.currentTarget.style.boxShadow = `0 12px 40px ${c.bg}`; }}
                  onMouseOut={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.borderColor = c.tag_border; e.currentTarget.style.boxShadow = ""; }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: c.bg, border: `1px solid ${c.tag_border}`, flexShrink: 0 }}>
                      <span style={{ fontFamily: "'Material Symbols Outlined'", fontVariationSettings: `'FILL' 0,'wght' 200,'GRAD' -25,'opsz' 48`, fontSize: 22, color: c.text, lineHeight: 1 }}>{card.icon}</span>
                    </div>
                    <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9.5, color: c.text, letterSpacing: "0.18em", textTransform: "uppercase" }}>{card.tag}</div>
                  </div>
                  <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 19, fontWeight: 700, textTransform: "uppercase", color: "#e2e8f0", marginBottom: 10, lineHeight: 1.1 }}>{card.title}</div>
                  <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.85, marginBottom: 16 }}>{card.desc}</p>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "'Share Tech Mono',monospace", fontSize: 10.5, color: c.text, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                    <Ms icon="open_in_new" size={14} /> View on Behance
                  </div>
                </a>
              </Reveal>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── CERTIFICATIONS ─────────────────────────────────────────────────────────────

function Certifications() {
  return (
    <div id="certifications" data-section="certifications" style={{ background: "#0d1626", borderTop: "1px solid rgba(255,255,255,0.07)", borderBottom: "1px solid rgba(255,255,255,0.07)", position: "relative", zIndex: 1 }}>
      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "96px 44px" }}>
        <SectionLabel icon="verified" text="06 — Certifications" />
        <SectionTitle>Credentials</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 13 }}>
          {CERTS.map((cert, i) => (
            <Reveal key={cert.name} delay={i * 0.1}>
              <div style={{ background: "#060c18", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "28px 24px", transition: "all 0.28s" }}
                onMouseOver={e => { e.currentTarget.style.borderColor = "rgba(245,158,11,0.35)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.transform = ""; }}>
                <div style={{ width: 46, height: 46, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.2)", marginBottom: 16 }}>
                  <Ms icon={cert.icon} size={24} />
                </div>
                <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: 14, fontWeight: 500, color: "#e2e8f0", lineHeight: 1.5, marginBottom: 10 }}>{cert.name}</div>
                <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 10, color: "#f59e0b", letterSpacing: "0.18em" }}>{cert.org}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── RESUME ─────────────────────────────────────────────────────────────────────

function Resume() {
  return (
    <div id="resume" data-section="resume" style={{ position: "relative", zIndex: 1 }}>
      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "96px 44px" }}>
        <SectionLabel icon="description" text="07 — Resume" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "start" }}>
          <Reveal>
            <div>
              <h3 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 28, fontWeight: 700, textTransform: "uppercase", color: "#e2e8f0", marginBottom: 16 }}>Download My Resume</h3>
              <p style={{ fontSize: 15, color: "#94a3b8", lineHeight: 1.85, marginBottom: 28 }}>
                Full details on experience, projects, skills, certifications, and education — available as a PDF for your review or ATS systems.
              </p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <a href="Jeevanandham_Resume.pdf" download="Jeevanandham_SeniorHMIEngineer_Resume.pdf"
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", fontFamily: "'Share Tech Mono',monospace", fontSize: 11.5, letterSpacing: "0.08em", borderRadius: 5, background: "rgba(52,211,153,0.11)", color: "#34d399", border: "1px solid rgba(52,211,153,0.25)", textDecoration: "none", transition: "all 0.25s" }}
                  onMouseOver={e => { e.currentTarget.style.background = "rgba(52,211,153,0.2)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseOut={e => { e.currentTarget.style.background = "rgba(52,211,153,0.11)"; e.currentTarget.style.transform = ""; }}>
                  <Ms icon="download" size={17} /> Download PDF
                </a>
                <a href="Jeevanandham_Resume.pdf" target="_blank" rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", fontFamily: "'Share Tech Mono',monospace", fontSize: 11.5, letterSpacing: "0.08em", borderRadius: 5, background: "transparent", color: "#e2e8f0", border: "1px solid rgba(255,255,255,0.12)", textDecoration: "none", transition: "all 0.25s" }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = "#f59e0b"; e.currentTarget.style.color = "#f59e0b"; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "#e2e8f0"; }}>
                  <Ms icon="open_in_new" size={17} /> View Online
                </a>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div style={{ background: "#0d1626", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: "24px" }}>
              <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 10, color: "#94a3b8", letterSpacing: "0.15em", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                <Ms icon="picture_as_pdf" size={14} /> JEEVANANDHAM_RESUME.PDF &nbsp;·&nbsp; 3 PAGES
              </div>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 18, fontWeight: 700, color: "#e2e8f0", marginBottom: 4 }}>S. JEEVANANDHAM</div>
              <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: "#f59e0b", letterSpacing: "0.1em", marginBottom: 16, lineHeight: 1.5 }}>SENIOR SOFTWARE ENGINEER – AUTOMOTIVE & MEDICAL HMI | UI/UX | QT/QML | EMBEDDED C++</div>
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", margin: "16px 0" }} />
              {[
                { label: "Qt / QML", w: "92%", g: "linear-gradient(90deg,#f59e0b,#22d3ee)" },
                { label: "Embedded C++", w: "88%", g: "linear-gradient(90deg,#34d399,#22d3ee)" },
                { label: "LVGL / HMI", w: "85%", g: "linear-gradient(90deg,#a78bfa,#fb7185)" },
                { label: "UX / Figma", w: "78%", g: "linear-gradient(90deg,#fb7185,#f59e0b)" },
              ].map(({ label, w, g }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: "#475569", width: 90 }}>{label}</span>
                  <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2 }}>
                    <div style={{ width: w, height: "100%", borderRadius: 2, background: g }} />
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}

// ── CONTACT ────────────────────────────────────────────────────────────────────

function Contact() {
  return (
    <section id="contact" data-section="contact" style={{ position: "relative", zIndex: 1, padding: "96px 44px", maxWidth: 1160, margin: "0 auto", textAlign: "center" }}>
      <SectionLabel icon="mail" text="08 — Contact" />
      <SectionTitle>Let's Work Together</SectionTitle>
      <p style={{ fontSize: 15, color: "#94a3b8", lineHeight: 1.85, marginBottom: 40, maxWidth: 600, margin: "0 auto 40px" }}>
        Open to senior HMI engineering roles, embedded UI consulting, and collaborative automotive or medical device projects. Based in Chennai, India.
      </p>
      <Reveal>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", marginBottom: 10 }}>
          {[
            { href: "mailto:jeevanandhamsivashankaran@gmail.com", icon: "mail", label: "jeevanandhamsivashankaran@gmail.com", color: "#22d3ee" },
            { href: "tel:+918111010315", icon: "phone", label: "+91 8111010315", color: "#f59e0b" },
          ].map(({ href, icon, label, color }) => (
            <a key={label} href={href} style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "14px 24px", fontFamily: "'Share Tech Mono',monospace", fontSize: 12, color, background: "#0d1626", border: `1px solid ${color}33`, borderRadius: 8, textDecoration: "none", transition: "all 0.25s", letterSpacing: "0.06em" }}
              onMouseOver={e => { e.currentTarget.style.background = `${color}18`; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseOut={e => { e.currentTarget.style.background = "#0d1626"; e.currentTarget.style.transform = ""; }}>
              <Ms icon={icon} size={16} /> {label}
            </a>
          ))}
        </div>
      </Reveal>
      <Reveal delay={0.1}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", marginTop: 10 }}>
          {[
            { href: "https://linkedin.com/in/jeevanandhamsivashankaran/", icon: "open_in_new", label: "LinkedIn", color: "#0ea5e9" },
            { href: "https://behance.net/s_jeevanandham", icon: "brush", label: "Behance Portfolio", color: "#a78bfa" },
            { href: "https://github.com/jeevanandhamsivasankar", icon: "terminal", label: "GitHub", color: "#34d399" },
          ].map(({ href, icon, label, color }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "12px 20px", fontFamily: "'Share Tech Mono',monospace", fontSize: 11, color, background: "#0d1626", border: `1px solid ${color}33`, borderRadius: 8, textDecoration: "none", transition: "all 0.25s" }}
              onMouseOver={e => { e.currentTarget.style.background = `${color}18`; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseOut={e => { e.currentTarget.style.background = "#0d1626"; e.currentTarget.style.transform = ""; }}>
              <Ms icon={icon} size={15} /> {label}
            </a>
          ))}
        </div>
      </Reveal>
      <div style={{ marginTop: 24, fontFamily: "'Share Tech Mono',monospace", fontSize: 10.5, color: "#475569", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <Ms icon="location_on" size={13} /> Chennai, Tamil Nadu, India
      </div>
    </section>
  );
}

// ── FOOTER ─────────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer style={{ borderTop: "1px solid rgba(255,255,255,0.07)", padding: "28px 44px", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, fontFamily: "'Share Tech Mono',monospace", fontSize: 10, color: "#475569", letterSpacing: "0.1em", position: "relative", zIndex: 1 }}>
      <Ms icon="developer_board" size={14} />
      © 2026 S. JEEVANANDHAM — SENIOR HMI ENGINEER — BUILT WITH PRECISION
      <Ms icon="developer_board" size={14} />
    </footer>
  );
}

// ── GLOBAL STYLES ──────────────────────────────────────────────────────────────

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Barlow:wght@300;400;500;600;700&family=Barlow+Condensed:wght@600;700;800&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { background: #060c18; color: #e2e8f0; font-family: 'Barlow', sans-serif; font-weight: 300; line-height: 1.7; overflow-x: hidden; }
  a { color: inherit; text-decoration: none; }

  body::before {
    content: '';
    position: fixed; inset: 0;
    background-image: linear-gradient(rgba(245,158,11,0.018) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(245,158,11,0.018) 1px, transparent 1px);
    background-size: 56px 56px;
    pointer-events: none; z-index: 0;
  }
  body::after {
    content: '';
    position: fixed; inset: 0;
    background: radial-gradient(ellipse 80% 60% at 70% 40%, rgba(245,158,11,0.04) 0%, transparent 65%);
    pointer-events: none; z-index: 0;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes spin {
    from { transform: translate(-50%, -50%) rotate(0deg); }
    to   { transform: translate(-50%, -50%) rotate(360deg); }
  }
  @keyframes pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(52,211,153,0.4); }
    50% { box-shadow: 0 0 0 5px rgba(52,211,153,0); }
  }
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }

  .nav-list { display: flex; }
  .hamburger { display: none; }

  @media (max-width: 900px) {
    .nav-list { display: none !important; }
    .hamburger { display: flex !important; }
    #hero { grid-template-columns: 1fr !important; padding: 80px 24px 60px !important; }
    .hero-profile-col { display: none; }
  }
  @media (max-width: 768px) {
    section, .full-band .inner { padding-left: 24px !important; padding-right: 24px !important; }
    .about-grid { grid-template-columns: 1fr !important; }
    .skills-grid { grid-template-columns: 1fr 1fr !important; }
    .projects-grid { grid-template-columns: 1fr !important; }
  }
`;

// ── APP ────────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <Nav />
      <main>
        <Hero />
        <div style={{ width: "100%", height: 1, background: "rgba(255,255,255,0.07)" }} />
        <About />
        <div style={{ width: "100%", height: 1, background: "rgba(255,255,255,0.07)" }} />
        <Experience />
        <div style={{ width: "100%", height: 1, background: "rgba(255,255,255,0.07)" }} />
        <Skills />
        <div style={{ width: "100%", height: 1, background: "rgba(255,255,255,0.07)" }} />
        <Projects />
        <div style={{ width: "100%", height: 1, background: "rgba(255,255,255,0.07)" }} />
        <Design />
        <div style={{ width: "100%", height: 1, background: "rgba(255,255,255,0.07)" }} />
        <Certifications />
        <div style={{ width: "100%", height: 1, background: "rgba(255,255,255,0.07)" }} />
        <Resume />
        <div style={{ width: "100%", height: 1, background: "rgba(255,255,255,0.07)" }} />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
