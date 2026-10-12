import { useRef } from "react";
import { useReveal } from "../../hooks/useReveal.js";
import SectionLabel from "./SectionLabel.jsx";
import SectionTitle from "./SectionTitle.jsx";

export default function Section({
  as = "section",
  id,
  className,
  style,
  label,
  title,
  inner = false,
  children,
}) {
  const As = as;
  const ref = useRef(null);
  useReveal(ref);
  const content = (
    <>
      {label && <SectionLabel icon={label.icon} text={label.text} />}
      {title && <SectionTitle>{title}</SectionTitle>}
      {children}
    </>
  );
  return (
    <As ref={ref} id={id} data-section={id} className={className} style={style}>
      {inner ? <div className="inner">{content}</div> : content}
    </As>
  );
}
