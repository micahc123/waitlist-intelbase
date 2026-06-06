export function Bars({ rows }: { rows: { label: string; value: number; max: number; color: string; sub?: string }[] }) {
  return (
    <div className="os-bars">
      {rows.map((r) => (
        <div className="os-bar-row" key={r.label}>
          <span className="os-bar-label">{r.label}</span>
          <div className="os-bar-track">
            <div className="os-bar-fill" style={{ width: `${Math.min(100, (r.value / r.max) * 100)}%`, background: r.color }} />
          </div>
          <span className="os-bar-val">{r.sub ?? r.value}</span>
        </div>
      ))}
    </div>
  );
}
