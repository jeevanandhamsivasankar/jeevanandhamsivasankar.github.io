import Icon from "./Icon.jsx";

export default function Button({ variant = "amber", href, icon, download, external = false, children }) {
  return (
    <a
      href={href}
      download={download}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={`btn btn-${variant}`}
    >
      <Icon name={icon} size={17} />
      {children}
    </a>
  );
}
