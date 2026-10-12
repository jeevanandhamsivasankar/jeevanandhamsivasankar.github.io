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
import InstrumentCluster from "../components/widgets/InstrumentCluster.jsx";

const srcset = ext => [300, 450, 600, 900].map(w => `/img/profile-${w}.${ext} ${w}w`).join(", ");
/** Responsive profile candidates (FR-MEDIA-001). 1px at <=900px where the card is hidden (FR-MEDIA-002). */
const PROFILE_SRCSET = { avif: srcset("avif"), webp: srcset("webp") };
const PROFILE_SIZES = "(max-width: 900px) 1px, 220px";

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
        {/* US-206: one primary + one secondary CTA; Resume is a quiet tertiary link. */}
        <div className="hero-cta">
          <Button variant="primary" href="#projects" icon="rocket_launch">View Projects</Button>
          <Button variant="secondary" href="#contact" icon="mail">Get In Touch</Button>
          <Button variant="ghost" href={RESUME.href} download={RESUME.downloadName} icon="download">Resume</Button>
        </div>
        <div className="hero-status"><span className="status-dot" />{PROFILE.status}</div>
        <div className="hero-badges">
          {HERO_BADGES.map(b => (
            <Badge key={b}>{b}</Badge>
          ))}
        </div>
      </div>

      {/* ── CENTRE: Big animated speedometer ── */}
      <div className="hero-center">
        <div className="gauge-widget">
          <div className="gauge-label-top">{PROFILE.gaugeLabel}</div>
          <InstrumentCluster />
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
            <picture>
              <source type="image/avif" srcSet={PROFILE_SRCSET.avif} sizes={PROFILE_SIZES} />
              <source type="image/webp" srcSet={PROFILE_SRCSET.webp} sizes={PROFILE_SIZES} />
              <img
                src="/img/profile-600.webp"
                width={PROFILE.photo.width} height={PROFILE.photo.height}
                decoding="async"
                alt={PROFILE.photo.alt}
                className="profile-photo"
                onError={e => { e.target.style.display = "none"; }}
              />
            </picture>
          </div>
          <div className="profile-info-panel">
            <div className="pname">{PROFILE.displayName}</div>
            <div className="prole">{PROFILE.titleCaps}</div>
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
