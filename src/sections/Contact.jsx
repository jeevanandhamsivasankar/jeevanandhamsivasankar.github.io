import { CONTACT_LINKS, CONTACT_INTRO, CONTACT_LOCATION } from "../data/contact.js";
import Section from "../components/ui/Section.jsx";
import Icon from "../components/ui/Icon.jsx";

const ITEM_CLASS = { email: "c-email", phone: "c-phone", linkedin: "c-li", behance: "c-bh", github: "c-gh" };

function ContactItem({ link }) {
  return (
    <a href={link.href} target={link.external ? "_blank" : undefined} rel={link.external ? "noopener noreferrer" : undefined}
      className={`contact-item ${ITEM_CLASS[link.kind]}`}>
      <Icon name={link.icon} size={16} />{link.label}
    </a>
  );
}

export default function Contact() {
  const primary = CONTACT_LINKS.filter(l => l.group === "primary");
  const social = CONTACT_LINKS.filter(l => l.group === "social");
  return (
    <Section id="contact" className="section-wrap contact-wrap" label={{ icon: "mail", text: "09 — Contact" }} title="Let's Work Together">
      <p className="contact-sub">{CONTACT_INTRO}</p>
      <div className="contact-links reveal">
        {primary.map(l => <ContactItem key={l.kind} link={l} />)}
      </div>
      <div className="contact-links reveal d1" style={{ marginTop: 10 }}>
        {social.map(l => <ContactItem key={l.kind} link={l} />)}
      </div>
      <div className="contact-loc"><Icon name="location_on" size={14} />{CONTACT_LOCATION}</div>
    </Section>
  );
}
