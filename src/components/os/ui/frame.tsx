export function Panel({ title, tag, children, className = "" }: { title?: string; tag?: string; children: React.ReactNode; className?: string; }) {
  return (
    <section className={`os-panel ${className}`}>
      {(title || tag) && (
        <header className="os-panel-head">
          {title && <h3>{title}</h3>}
          {tag && <span className="os-tag">{tag}</span>}
        </header>
      )}
      {children}
    </section>
  );
}

export function Dot({ color }: { color: string }) {
  return <span className="os-dot" style={{ background: color, boxShadow: `0 0 10px ${color}` }} />;
}
