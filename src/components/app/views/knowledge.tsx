// Knowledge - the RAG knowledge base. Everything the agents say and do is
// grounded in the documents here. This is the management surface: add sources by
// title + URL or uploaded file, and watch them move from processing to ready.
//
// Data flows through /api/app/knowledge (GET list, POST { title, source }). The
// data layer returns DEMO docs when Supabase is unconfigured and addKnowledge
// returns a believable "processing" row even in demo mode, so a newly added doc
// appears immediately. Real ingestion/embedding runs server-side later.

"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BookOpen,
  Plus,
  Link2,
  Upload,
  Loader2,
  FileText,
} from "lucide-react";
import { ViewHead } from "./view-shell";
import "./controls.css";

type KnowledgeStatus = "processing" | "ready" | "failed";

type Doc = {
  id: string;
  title: string;
  source: string | null;
  status: KnowledgeStatus;
  chunks: number;
  created_at: string;
};

type SourceMode = "url" | "file";

export function Knowledge() {
  const [docs, setDocs] = useState<Doc[] | null>(null);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [mode, setMode] = useState<SourceMode>("url");
  const [adding, setAdding] = useState(false);

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
            Documents
          </span>
          {docs && docs.length > 0 && (
            <span className="ibx-hint">
              {docs.length} source{docs.length === 1 ? "" : "s"}
            </span>
          )}
        </div>

        {!docs ? (
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
