"use client";

import { useEffect, useState } from "react";
import { formatStamp } from "@/lib/format";
import type { FeedbackRecord, FeedbackStatus, FeedbackSummary } from "@/lib/types";

const STATUSES: FeedbackStatus[] = ["submitted", "reviewed", "approved", "rejected"];

function badge(status: FeedbackStatus) {
  if (status === "approved") return "bg-green-50 text-success";
  if (status === "rejected") return "bg-red-50 text-destructive";
  if (status === "reviewed") return "bg-amber-50 text-warning";
  return "bg-secondary text-foreground";
}

export function AdminDashboard() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rows, setRows] = useState<FeedbackSummary[]>([]);
  const [filters, setFilters] = useState({ client: "", project: "", from: "", to: "", status: "" });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<FeedbackRecord | null>(null);
  const [approvedText, setApprovedText] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  function queryString() {
    const params = new URLSearchParams();
    if (filters.client.trim()) params.set("client", filters.client.trim());
    if (filters.project.trim()) params.set("project", filters.project.trim());
    if (filters.from) params.set("from", filters.from);
    if (filters.to) params.set("to", filters.to);
    if (filters.status) params.set("status", filters.status);
    const text = params.toString();
    return text ? `?${text}` : "";
  }

  async function load(next = queryString()) {
    const response = await fetch(`/api/admin/responses${next}`, { cache: "no-store" });
    if (response.status === 401) {
      setAuthed(false);
      setLoading(false);
      return;
    }
    const payload = (await response.json()) as { responses?: FeedbackSummary[]; error?: string };
    if (!response.ok) {
      setError(payload.error ?? "Could not load responses.");
      setLoading(false);
      return;
    }
    setRows(payload.responses ?? []);
    setAuthed(true);
    setLoading(false);
  }

  useEffect(() => {
    void load("");
    // Initial load only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function login(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!response.ok) {
      const payload = (await response.json()) as { error?: string };
      setError(payload.error ?? "That password is not correct.");
      return;
    }
    setPassword("");
    setLoading(true);
    await load("");
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthed(false);
    setRows([]);
    setDetail(null);
  }

  async function openRow(feedbackId: string) {
    setSelectedId(feedbackId);
    setNotice("");
    const response = await fetch(`/api/admin/responses/${feedbackId}`, { cache: "no-store" });
    const payload = (await response.json()) as { response?: FeedbackRecord; error?: string };
    if (!response.ok || !payload.response) {
      setError(payload.error ?? "Could not open that submission.");
      return;
    }
    setDetail(payload.response);
    setApprovedText(payload.response.testimonial.approvedText);
  }

  async function patch(body: Record<string, unknown>) {
    if (!detail) return;
    setSaving(true);
    setNotice("");
    const response = await fetch(`/api/admin/responses/${detail.feedbackId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const payload = (await response.json()) as { response?: FeedbackRecord; error?: string };
    setSaving(false);
    if (!response.ok || !payload.response) {
      setNotice(payload.error ?? "Could not save.");
      return;
    }
    setDetail(payload.response);
    setApprovedText(payload.response.testimonial.approvedText);
    setNotice("Saved. The original testimonial was left unchanged.");
    await load();
  }

  async function download(format: "csv" | "pdf", feedbackId?: string) {
    const params = new URLSearchParams(queryString().replace(/^\?/, ""));
    params.set("format", format);
    if (feedbackId) params.set("feedbackId", feedbackId);
    const response = await fetch(`/api/admin/export?${params.toString()}`);
    if (!response.ok) {
      setNotice("Could not export.");
      return;
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = feedbackId ? `${feedbackId}.${format}` : `candexai-feedback.${format}`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  if (loading) return <p className="text-sm text-muted-foreground">Loading responses…</p>;

  if (!authed) {
    return (
      <form onSubmit={login} className="mx-auto max-w-md rounded-lg border border-border bg-card p-6">
        <p className="text-[11.5px] font-medium uppercase tracking-[0.09em] text-zinc-600">Admin</p>
        <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight">Feedback inbox</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Client submissions stay on this side of the portal. The public form cannot list them.
        </p>
        <label htmlFor="password" className="mt-5 block text-sm font-medium">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-2 h-11 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus:border-ring focus:ring-[3px] focus:ring-ring/50"
        />
        {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
        <button type="submit" className="mt-4 inline-flex h-10 items-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-[var(--primary-hover)]">
          Sign in
        </button>
      </form>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11.5px] font-medium uppercase tracking-[0.09em] text-zinc-600">Admin</p>
          <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight">Client feedback</h1>
        </div>
        <button type="button" onClick={() => void logout()} className="h-9 rounded-lg border border-border bg-card px-3 text-sm">
          Sign out
        </button>
      </div>

      <form
        className="grid gap-3 rounded-lg border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-6"
        onSubmit={(event) => {
          event.preventDefault();
          void load();
        }}
      >
        <input className="h-10 rounded-md border border-input px-3 text-sm lg:col-span-1" placeholder="Client" value={filters.client} onChange={(event) => setFilters({ ...filters, client: event.target.value })} />
        <input className="h-10 rounded-md border border-input px-3 text-sm" placeholder="Project" value={filters.project} onChange={(event) => setFilters({ ...filters, project: event.target.value })} />
        <input type="date" className="h-10 rounded-md border border-input px-3 text-sm" value={filters.from} onChange={(event) => setFilters({ ...filters, from: event.target.value })} />
        <input type="date" className="h-10 rounded-md border border-input px-3 text-sm" value={filters.to} onChange={(event) => setFilters({ ...filters, to: event.target.value })} />
        <select className="h-10 rounded-md border border-input bg-card px-3 text-sm" value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}>
          <option value="">All statuses</option>
          {STATUSES.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
        <button type="submit" className="h-10 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground">Filter</button>
      </form>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{rows.length} submission{rows.length === 1 ? "" : "s"}</p>
        <div className="flex gap-2">
          <button type="button" onClick={() => void download("csv")} className="h-9 rounded-lg border border-border bg-card px-3 text-sm">Export CSV</button>
          <button type="button" onClick={() => void download("pdf")} className="h-9 rounded-lg border border-border bg-card px-3 text-sm">Export PDF</button>
        </div>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="space-y-2">
          {rows.length === 0 ? (
            <p className="rounded-lg border border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground">No submissions match these filters.</p>
          ) : rows.map((row) => (
            <button
              key={row.feedbackId}
              type="button"
              onClick={() => void openRow(row.feedbackId)}
              className={`w-full rounded-lg border bg-card px-4 py-3 text-left ${selectedId === row.feedbackId ? "border-primary" : "border-border"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-heading text-lg font-semibold tracking-tight">{row.clientCompany}</p>
                  <p className="text-sm text-muted-foreground">{row.projectCampaign}</p>
                  <p className="mt-1 text-sm">{row.reviewerName} · {row.reviewerDesignation}</p>
                  <p className="mt-1 text-xs text-zinc-500">{row.feedbackId} · {formatStamp(row.submittedAt)}</p>
                </div>
                <span className={`rounded-md px-2 py-1 text-xs font-medium capitalize ${badge(row.status)}`}>{row.status}</span>
              </div>
              <p className="mt-2 text-sm">
                Overall {row.overallExperience}/5 · Calls {row.aiCallQuality}/5 · Reliability {row.campaignReliability}/5
              </p>
            </button>
          ))}
        </div>

        {detail ? (
          <article className="rounded-lg border border-border bg-card p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-heading text-2xl font-semibold tracking-tight">{detail.feedbackId}</p>
                <p className="mt-1 text-sm text-muted-foreground">{detail.clientCompany} · {detail.projectCampaign}</p>
                <p className="text-sm text-muted-foreground">{detail.campaignStart} to {detail.campaignEnd}</p>
              </div>
              <button type="button" onClick={() => void download("pdf", detail.feedbackId)} className="h-9 rounded-lg border border-border px-3 text-sm">PDF</button>
            </div>

            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div><dt className="text-muted-foreground">Reviewer</dt><dd>{detail.reviewerName}</dd></div>
              <div><dt className="text-muted-foreground">Designation</dt><dd>{detail.reviewerDesignation}</dd></div>
              <div className="sm:col-span-2"><dt className="text-muted-foreground">Official email</dt><dd>{detail.reviewerEmail}</dd></div>
              <div><dt className="text-muted-foreground">Submitted</dt><dd>{formatStamp(detail.submittedAt)}</dd></div>
              <div><dt className="text-muted-foreground">Confirmation email</dt><dd>{detail.audit.confirmationEmail.sent ? `Sent ${formatStamp(detail.audit.confirmationEmail.sentAt)}` : detail.audit.confirmationEmail.error || "Not sent"}</dd></div>
            </dl>

            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <Score label="Overall" value={detail.ratings.overallExperience} />
              <Score label="AI calls" value={detail.ratings.aiCallQuality} />
              <Score label="Reliability" value={detail.ratings.campaignReliability} />
            </div>

            <div className="mt-5 space-y-3">
              {detail.answers.map((answer) => (
                <div key={answer.questionId}>
                  <p className="text-sm font-medium">{answer.prompt}</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{answer.value || "—"}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-md border border-border bg-secondary/60 p-3">
              <p className="text-sm font-medium">Original testimonial</p>
              <p className="mt-1 text-xs text-muted-foreground">Stored exactly as submitted. This field is not editable.</p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{detail.testimonial.willing ? detail.testimonial.originalText : "No testimonial submitted."}</p>
              {detail.testimonial.willing ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  {detail.testimonial.name}, {detail.testimonial.designation}, {detail.testimonial.company}
                  {detail.testimonial.linkedin ? ` · ${detail.testimonial.linkedin}` : ""}
                </p>
              ) : null}
            </div>

            <ul className="mt-4 space-y-1 text-sm">
              <Consent label="Marketing consent" on={detail.testimonial.consentToUse} at={detail.testimonial.consentAt} />
              <Consent label="Display name, designation, and company" on={detail.testimonial.displayIdentity} at={detail.testimonial.displayIdentityAt} />
              <Consent label="Company logo" on={detail.testimonial.useLogo} at={detail.testimonial.useLogoAt} />
            </ul>

            <div className="mt-4 text-xs leading-5 text-zinc-500">
              <p>Audit IP {detail.audit.ip || "—"}</p>
              <p className="break-all">User agent {detail.audit.userAgent || "—"}</p>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {STATUSES.map((status) => (
                <button
                  key={status}
                  type="button"
                  disabled={saving || detail.status === status}
                  onClick={() => void patch({ status })}
                  className={`h-9 rounded-lg px-3 text-sm capitalize ${detail.status === status ? "bg-primary text-primary-foreground" : "border border-border"}`}
                >
                  {status}
                </button>
              ))}
            </div>

            <label htmlFor="approvedText" className="mt-5 block text-sm font-medium">Approved / edited testimonial</label>
            <p className="mt-1 text-xs text-muted-foreground">Saved separately from the original.</p>
            <textarea
              id="approvedText"
              className="mt-2 min-h-28 w-full rounded-md border border-input px-3 py-2 text-sm leading-6 outline-none focus:border-ring focus:ring-[3px] focus:ring-ring/50"
              maxLength={2000}
              value={approvedText}
              onChange={(event) => setApprovedText(event.target.value)}
            />
            <button
              type="button"
              disabled={saving}
              onClick={() => void patch({ approvedText })}
              className="mt-3 inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              Save edited version
            </button>
            {notice ? <p className="mt-3 text-sm text-muted-foreground">{notice}</p> : null}
          </article>
        ) : (
          <p className="rounded-lg border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
            Select a submission to review the original testimonial, consent, and status.
          </p>
        )}
      </div>
    </div>
  );
}

function Score({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md bg-[var(--accent-tint)] px-2 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-heading text-2xl font-semibold">{value}/5</p>
    </div>
  );
}

function Consent({ label, on, at }: { label: string; on: boolean; at: string | null }) {
  return (
    <li>
      {label}: <span className="font-medium">{on ? "Yes" : "No"}</span>
      {on && at ? ` · ${formatStamp(at)}` : ""}
    </li>
  );
}
