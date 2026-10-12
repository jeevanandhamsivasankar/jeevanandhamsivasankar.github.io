const ART = {
  cluster: () => (
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
  medical: () => (
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
  infotainment: () => (
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
  multiplatform: () => (
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
  profile: () => (
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
};

export default function DesignArt({ artKey }) {
  return Object.hasOwn(ART, artKey) ? ART[artKey]() : null;
}
