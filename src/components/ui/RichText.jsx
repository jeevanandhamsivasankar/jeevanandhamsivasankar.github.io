import { Fragment } from "react";

export default function RichText({ segments }) {
  return (
    <>
      {segments.map((seg, i) => {
        if (seg.mark === "strong") return <strong key={i}>{seg.text}</strong>;
        if (seg.mark === "hl") return <span key={i} className="hl">{seg.text}</span>;
        return <Fragment key={i}>{seg.text}</Fragment>;
      })}
    </>
  );
}
