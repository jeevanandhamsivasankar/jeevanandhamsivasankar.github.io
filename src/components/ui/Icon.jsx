export default function Icon({ name, size = 18, fill = 0, wght = 300, style = {}, label }) {
  return (
    <span
      aria-hidden={label ? undefined : "true"}
      role={label ? "img" : undefined}
      aria-label={label}
      style={{
        fontFamily: "'Material Symbols Outlined'",
        fontVariationSettings: `'FILL' ${fill},'wght' ${wght},'GRAD' -25,'opsz' 48`,
        fontSize: size,
        lineHeight: 1,
        display: "inline-block",
        width: size,
        height: size,
        overflow: "hidden",
        whiteSpace: "nowrap",
        verticalAlign: "middle",
        userSelect: "none",
        ...style,
      }}
    >
      {name}
    </span>
  );
}
