import Icon from "./Icon.jsx";

export default function SectionLabel({ icon, text }) {
  return (
    <div className="section-label">
      <Icon name={icon} size={13} />
      {text}
    </div>
  );
}
