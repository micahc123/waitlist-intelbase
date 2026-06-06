import { Sparkline } from "./sparkline";

export function Kpi({ label, value, unit, series, color }: { label: string; value: number; unit: string; series: number[]; color: string; }) {
  const display = unit === "x" ? value.toFixed(1) : Math.round(value).toLocaleString();
  return (
    <div className="os-kpi">
      <div className="os-kpi-top"><span className="os-kpi-val">{display}{unit}</span></div>
      <div className="os-kpi-label">{label}</div>
      <Sparkline points={series} color={color} />
    </div>
  );
}
