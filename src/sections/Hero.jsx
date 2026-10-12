import { PROFILE, HERO_ROLES, HERO_BADGES, GAUGE_STATS, GAUGE_STACK_TAGS, PROFILE_TAGS } from "../data/profile.js";
import { RESUME } from "../config/site.js";
import { useTypewriter } from "../hooks/useTypewriter.js";
import { useParallax } from "../hooks/useParallax.js";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion.js";
import Icon from "../components/ui/Icon.jsx";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import RichText from "../components/ui/RichText.jsx";
import Particles from "../components/effects/Particles.jsx";
import Speedometer from "../components/widgets/Speedometer.jsx";

export default function Hero() {
  const reduced = usePrefersReducedMotion();
  const cardRef = useParallax({ enabled: !reduced });
  const typed = useTypewriter(HERO_ROLES, { enabled: !reduced });
  const { nameParts } = PROFILE;

  return (
    <section id="hero" data-section="hero" className="hero">
      <Particles />
      <div className="hero-rings" aria-hidden="true">
        <div className="hring hring-1" /><div className="hring hring-2" />
        <div className="hring hring-3" /><div className="hring hring-4" />
      </div>

      {/* ── LEFT: Text content ── */}
      <div className="hero-content">
        <div className="hero-tag"><Icon name="developer_board" size={15} />{PROFILE.heroTag}</div>
        <h1 className="hero-name">
          {nameParts.before}<em>{nameParts.emphasis}</em><br />{nameParts.after}
        </h1>
        <div className="hero-typewriter">
          <span style={{ color: "var(--cyan)" }}>{typed}</span>
          <span className="cursor">|</span>
        </div>
        <p className="hero-bio">
          <RichText segments={PROFILE.bio} />
        </p>
        <div className="hero-badges">
          {HERO_BADGES.map(b => (
            <Badge key={b}>{b}</Badge>
          ))}
        </div>
        <div className="hero-cta">
          <Button variant="amber" href="#projects" icon="rocket_launch">View Projects</Button>
          <Button variant="outline" href="#contact" icon="mail">Get In Touch</Button>
          <Button variant="green" href={RESUME.href} download={RESUME.downloadName} icon="download">Resume</Button>
        </div>
      </div>

      {/* ── CENTRE: Big animated speedometer ── */}
      <div className="hero-center">
        <div className="gauge-widget">
          <div className="gauge-label-top">{PROFILE.gaugeLabel}</div>
          <Speedometer />
          <div className="gauge-divider" />
          <div className="gauge-stats-row">
            {GAUGE_STATS.map(s => (
              <div key={s.label} className="gauge-stat">
                <span className="gauge-stat-val" style={{ color: s.color }}>{s.num}</span>
                <span className="gauge-stat-lbl">{s.label}</span>
              </div>
            ))}
          </div>
          <div className="gauge-divider" />
          <div className="gauge-stack-tags">
            {GAUGE_STACK_TAGS.map(t => (
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
              src={PROFILE.photo.src}
              width={PROFILE.photo.width} height={PROFILE.photo.height}
              decoding="async"
              alt={PROFILE.photo.alt}
              className="profile-photo"
              onError={e => { e.target.style.display = "none"; }}
            />
          </div>
          <div className="profile-info-panel">
            <div className="pname">{PROFILE.displayName}</div>
            <div className="prole">{PROFILE.titleCaps}</div>
            <div className="status-row"><span className="status-dot" />{PROFILE.status}</div>
            <div className="profile-tags-row">
              {PROFILE_TAGS.map(t => (
                <span key={t} className="ptag">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}
