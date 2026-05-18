const names = [
  "FindYourCareer",
  "VIA Tech",
  "BizGenius",
  "Northwind",
  "Lumen Labs",
  "Helix Co.",
];

export function Logos() {
  return (
    <div className="logos">
      <div className="logos-inner">
        <div className="logos-label">Trusted by founders at</div>
        {names.map((n) => (
          <span className="logo-chip" key={n}>
            <span className="l-dot">●</span>
            {n}
          </span>
        ))}
      </div>
    </div>
  );
}
