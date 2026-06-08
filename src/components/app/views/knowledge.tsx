// Knowledge - the RAG knowledge base. Everything the agents say and do is
// grounded in the documents here. This is the management surface: add sources by
// title + URL or uploaded file, and watch them move from processing to ready.
//
// Data flows through /api/app/knowledge (GET list, POST { title, source }). The
// data layer returns DEMO docs when Supabase is unconfigured and addKnowledge
// returns a believable "processing" row even in demo mode, so a newly added doc
// appears immediately. Real ingestion/embedding runs server-side later.

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Plus,
  Link2,
  Upload,
  Loader2,
  FileText,
  List,
  Network,
  Tag,
  X,
} from "lucide-react";
import { ViewHead } from "./view-shell";
import { ForceGraph, type GraphNode, type GraphLink } from "../graph/force-graph";
import "./controls.css";

type KnowledgeStatus = "processing" | "ready" | "failed";

type Doc = {
  id: string;
  title: string;
  source: string | null;
  status: KnowledgeStatus;
  chunks: number;
  created_at: string;
  tags?: string[];
};

type ViewMode = "list" | "graph";

type SourceMode = "url" | "file";

export function Knowledge() {
  const [docs, setDocs] = useState<Doc[] | null>(null);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [mode, setMode] = useState<SourceMode>("url");
  const [adding, setAdding] = useState(false);
  const [view, setView] = useState<ViewMode>("graph");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/app/knowledge", { credentials: "include" });
      const data = (await res.json()) as { docs?: Doc[] };
      setDocs(data.docs ?? []);
    } catch {
      setDocs([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const canAdd = title.trim().length > 0 && (mode === "url" ? url.trim().length > 0 : fileName.length > 0);

  const handleAdd = useCallback(async () => {
    if (!canAdd) return;
    setAdding(true);
    const source = mode === "url" ? url.trim() : `upload: ${fileName}`;
    try {
      const res = await fetch("/api/app/knowledge", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), source }),
      });
      const data = (await res.json()) as { ok?: boolean; doc?: Doc };
      if (data.doc) {
        // Insert the processing row at the top immediately.
        setDocs((prev) => [data.doc as Doc, ...(prev ?? [])]);
      }
      setTitle("");
      setUrl("");
      setFileName("");
    } catch {
      // ignore; the list simply will not change
    } finally {
      setAdding(false);
    }
  }, [canAdd, mode, url, fileName, title]);

  const graph = useMemo(() => buildKnowledgeGraph(docs ?? []), [docs]);
  const selectedDoc = useMemo(
    () => (docs ?? []).find((d) => d.id === selectedId) ?? null,
    [docs, selectedId],
  );

  return (
    <div className="ibx">
      <ViewHead
        title="Knowledge"
        subtitle="Your agents answer and act from this knowledge base. Add the facts, policies, and pages they should ground every reply in."
      />

      <div className="kn-banner">
        <div className="kn-banner-icon">
          <BookOpen size={18} />
        </div>
        <div className="kn-banner-body">
          When a visitor asks a question or an agent drafts a reply, it retrieves the
          most relevant passages from these sources first. Keep this current and your
          agents stay accurate. Nothing here is invented.
        </div>
      </div>

      <div className="ibx-panel" style={{ marginBottom: "var(--ib-4)" }}>
        <div className="ibx-panel-head">
          <span style={{ fontSize: "var(--ib-fs-sm)", fontWeight: 600 }}>
            Add knowledge
          </span>
        </div>
        <div className="kn-add">
          <div className="kn-add-field">
            <label className="ibx-field-label" htmlFor="kn-title">
              Title
            </label>
            <input
              id="kn-title"
              className="ibx-input"
              placeholder="e.g. Services and pricing"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="kn-add-field">
            <span className="ibx-field-label">Source</span>
            <div className="kn-source-tabs ibx-seg" role="group" aria-label="Source type">
              <button
                type="button"
                className={`ibx-seg-opt${mode === "url" ? " is-active" : ""}`}
                aria-pressed={mode === "url"}
                onClick={() => setMode("url")}
              >
                <Link2 size={12} style={{ marginRight: 4, verticalAlign: "-2px" }} />
                URL
              </button>
              <button
                type="button"
                className={`ibx-seg-opt${mode === "file" ? " is-active" : ""}`}
                aria-pressed={mode === "file"}
                onClick={() => setMode("file")}
              >
                <Upload size={12} style={{ marginRight: 4, verticalAlign: "-2px" }} />
                File
              </button>
            </div>
            {mode === "url" ? (
              <input
                className="ibx-input"
                type="url"
                placeholder="https://yoursite.com/pricing"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                aria-label="Source URL"
              />
            ) : (
              <label className="kn-file">
                <Upload size={14} />
                {fileName || "Choose a file (PDF, DOCX, TXT)"}
                <input
                  type="file"
                  style={{ display: "none" }}
                  onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
                />
              </label>
            )}
          </div>

          <div className="kn-add-actions">
            <button
              type="button"
              className="ibx-btn ibx-btn-primary"
              disabled={!canAdd || adding}
              onClick={handleAdd}
            >
              {adding ? <Loader2 size={15} className="ibx-spin" /> : <Plus size={15} />}
              Add
            </button>
          </div>
        </div>
      </div>

      <div className="ibx-panel">
        <div className="ibx-panel-head">
          <span style={{ fontSize: "var(--ib-fs-sm)", fontWeight: 600 }}>
            {view === "graph" ? "Knowledge graph" : "Documents"}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--ib-3)" }}>
            {docs && docs.length > 0 && (
              <span className="ibx-hint">
                {docs.length} source{docs.length === 1 ? "" : "s"}
              </span>
            )}
            <div className="ibx-seg" role="group" aria-label="View mode">
              <button
                type="button"
                className={`ibx-seg-opt${view === "list" ? " is-active" : ""}`}
                aria-pressed={view === "list"}
                onClick={() => setView("list")}
              >
                <List size={13} style={{ marginRight: 5, verticalAlign: "-2px" }} />
                List
              </button>
              <button
                type="button"
                className={`ibx-seg-opt${view === "graph" ? " is-active" : ""}`}
                aria-pressed={view === "graph"}
                onClick={() => setView("graph")}
              >
                <Network size={13} style={{ marginRight: 5, verticalAlign: "-2px" }} />
                Graph
              </button>
            </div>
          </div>
        </div>

        {view === "graph" ? (
          !docs ? (
            <div className="ibx-empty">
              <Loader2 size={20} className="ibx-spin" />
              <div>Loading knowledge base...</div>
            </div>
          ) : docs.length === 0 ? (
            <div className="ibx-empty">
              <div className="ibx-empty-icon">
                <Network size={22} />
              </div>
              <div style={{ fontWeight: 600, color: "var(--ib-text-2)" }}>
                Nothing to map yet
              </div>
              <div style={{ maxWidth: "42ch" }}>
                Add sources above and they will appear here as an interconnected web,
                linked by the topics they share.
              </div>
            </div>
          ) : (
            <div className="kn-graph">
              <ForceGraph
                nodes={graph.nodes}
                links={graph.links}
                selectedId={selectedId}
                onSelect={(id) => {
                  // Only doc nodes select; topic nodes just re-centre interest.
                  if (id.startsWith("doc:")) {
                    setSelectedId(id.slice(4));
                  }
                }}
                height={480}
                idleSpin
              />
              <div className="kn-graph-side">
                {selectedDoc ? (
                  <div className="kn-doc-card">
                    <div className="kn-doc-card-head">
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 8,
                          minWidth: 0,
                        }}
                      >
                        <FileText size={15} style={{ color: "var(--ib-mint)" }} />
                        <span style={{ fontWeight: 600 }}>{selectedDoc.title}</span>
                      </span>
                      <button
                        type="button"
                        className="ibx-btn ibx-btn-ghost kn-doc-close"
                        aria-label="Clear selection"
                        onClick={() => setSelectedId(null)}
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <div className="kn-doc-meta">
                      <StatusChip status={selectedDoc.status} />
                      <span className="ibx-hint">
                        {prettySource(selectedDoc.source)}
                      </span>
                    </div>
                    <div className="kn-doc-stats">
                      <div>
                        <div className="kn-doc-stat-num ibx-mono">
                          {selectedDoc.status === "ready" ? selectedDoc.chunks : "·"}
                        </div>
                        <div className="kn-doc-stat-lbl">chunks</div>
                      </div>
                      <div>
                        <div className="kn-doc-stat-num ibx-mono">
                          {relTime(selectedDoc.created_at)}
                        </div>
                        <div className="kn-doc-stat-lbl">added</div>
                      </div>
                    </div>
                    <div className="kn-doc-tags">
                      {topicsFor(selectedDoc).map((t) => (
                        <span key={t} className="ibx-chip">
                          <Tag size={10} style={{ marginRight: 2 }} />
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="kn-doc-card kn-doc-empty">
                    <Network size={18} style={{ color: "var(--ib-text-3)" }} />
                    <div style={{ fontWeight: 600, color: "var(--ib-text-2)" }}>
                      Your knowledge web
                    </div>
                    <div className="ibx-hint" style={{ lineHeight: 1.5 }}>
                      Each document links to the topics it covers, so related sources
                      cluster together. Click a document node to inspect it. Drag to
                      rearrange, scroll to zoom.
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        ) : !docs ? (
          <div className="ibx-empty">
            <Loader2 size={20} className="ibx-spin" />
            <div>Loading knowledge base...</div>
          </div>
        ) : docs.length === 0 ? (
          <div className="ibx-empty">
            <div className="ibx-empty-icon">
              <BookOpen size={22} />
            </div>
            <div style={{ fontWeight: 600, color: "var(--ib-text-2)" }}>
              Your knowledge base is empty
            </div>
            <div style={{ maxWidth: "42ch" }}>
              Add your first source above. Once it is processed, your agents will
              answer from it.
            </div>
          </div>
        ) : (
          <table className="ibx-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Source</th>
                <th>Status</th>
                <th className="ibx-td-num">Chunks</th>
                <th>Added</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((d) => (
                <tr key={d.id}>
                  <td>
                    <span
                      style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
                    >
                      <FileText size={14} style={{ color: "var(--ib-text-3)" }} />
                      <span style={{ fontWeight: 600 }}>{d.title}</span>
                    </span>
                  </td>
                  <td style={{ color: "var(--ib-text-3)" }}>{prettySource(d.source)}</td>
                  <td>
                    <StatusChip status={d.status} />
                  </td>
                  <td className="ibx-td-num ibx-mono">
                    {d.status === "ready" ? d.chunks : "·"}
                  </td>
                  <td style={{ color: "var(--ib-text-3)" }}>{relTime(d.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// Keyword map for deriving topics when a doc has no explicit tags. Each entry is
// a topic label keyed to substrings that, if present in the title or source,
// imply that topic. Order matters only for stable output.
const TOPIC_KEYWORDS: Array<{ topic: string; match: string[] }> = [
  { topic: "Pricing", match: ["pric", "cost", "fee", "rate", "quote"] },
  { topic: "Services", match: ["service", "treatment", "package", "menu"] },
  { topic: "Booking", match: ["book", "appointment", "schedul", "reserv"] },
  { topic: "Policy", match: ["policy", "cancel", "refund", "terms"] },
  { topic: "Support", match: ["faq", "question", "help", "support"] },
  { topic: "Brand", match: ["brand", "voice", "tone", "style", "website", "page"] },
  { topic: "Sales", match: ["sale", "offer", "promo", "deal"] },
];

// Derive 1-3 topics for a doc: prefer explicit tags, else keyword-map the title
// + source, else fall back to a single "General" topic so it still connects.
function topicsFor(doc: Doc): string[] {
  if (doc.tags && doc.tags.length > 0) return doc.tags.slice(0, 3);
  const hay = `${doc.title} ${doc.source ?? ""}`.toLowerCase();
  const found: string[] = [];
  for (const { topic, match } of TOPIC_KEYWORDS) {
    if (match.some((m) => hay.includes(m))) found.push(topic);
    if (found.length >= 3) break;
  }
  return found.length > 0 ? found : ["General"];
}

// Build the Obsidian-style knowledge graph: each doc is an accent-coloured node,
// each distinct topic is a smaller muted node, and a doc links to every topic it
// covers. Docs that share a topic therefore cluster around it.
function buildKnowledgeGraph(docs: Doc[]): {
  nodes: GraphNode[];
  links: GraphLink[];
} {
  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];
  const topicSeen = new Map<string, number>(); // topic -> doc count (for sizing)

  for (const d of docs) {
    nodes.push({
      id: `doc:${d.id}`,
      label: d.title,
      kind: "doc",
      color: "#7df5c8", // --ib-mint
      size: 9,
    });
    for (const t of topicsFor(d)) {
      const key = `topic:${t}`;
      topicSeen.set(key, (topicSeen.get(key) ?? 0) + 1);
      links.push({ source: `doc:${d.id}`, target: key });
    }
  }

  for (const [id, count] of topicSeen) {
    nodes.push({
      id,
      label: id.slice(6),
      kind: "topic",
      color: "#7e879d", // muted --ib-text-3
      size: 5 + Math.min(count, 4) * 1.4,
    });
  }

  return { nodes, links };
}

function StatusChip({ status }: { status: KnowledgeStatus }) {
  if (status === "ready")
    return (
      <span className="ibx-chip ibx-chip-success">
        <span className="ibx-chip-dot" /> Ready
      </span>
    );
  if (status === "failed")
    return (
      <span className="ibx-chip ibx-chip-danger">
        <span className="ibx-chip-dot" /> Failed
      </span>
    );
  return (
    <span className="ibx-chip ibx-chip-warning">
      <Loader2 size={11} className="ibx-spin" /> Processing
    </span>
  );
}

function prettySource(source: string | null): string {
  if (!source) return "Upload";
  if (source.startsWith("upload")) return "Uploaded file";
  if (source === "faq") return "FAQ";
  if (source === "url") return "Crawled pages";
  if (source.startsWith("http")) {
    try {
      return new URL(source).hostname.replace(/^www\./, "");
    } catch {
      return source;
    }
  }
  return source;
}

function relTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "just now";
  const diff = Date.now() - then;
  const min = Math.round(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  return `${day}d ago`;
}
