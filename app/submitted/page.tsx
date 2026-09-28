"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { formatStamp } from "@/lib/format";

type Confirmation = {
  feedbackId: string;
  submittedAt: string;
  emailSent: boolean;
  clientCompany: string;
  projectCampaign: string;
  reviewerEmail: string;
  testimonialText: string;
  consentToUse: boolean;
};

export default function SubmittedPage() {
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [ready, setReady] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("candex-feedback-confirmation");
    if (raw) {
      try {
        setConfirmation(JSON.parse(raw) as Confirmation);
      } catch {
        setConfirmation(null);
      }
    }
    setReady(true);
  }, []);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10">
        {!ready ? <p className="text-sm text-muted-foreground">Loading…</p> : null}
        {ready && !confirmation ? (
          <div className="rounded-lg border border-border bg-card px-6 py-12 text-center">
            <h1 className="font-heading text-3xl font-semibold tracking-tight">No submission on this device</h1>
            <p className="mt-3 text-sm text-muted-foreground">Return to the form to send feedback.</p>
            <Link href="/" className="mt-6 inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground">
              Open the form
            </Link>
          </div>
        ) : null}
        {confirmation ? (
          <div className="rounded-lg border border-border bg-card px-5 py-8 sm:px-8">
            <p className="text-[11.5px] font-medium uppercase tracking-[0.09em] text-zinc-600">Submitted</p>
            <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              Thank you. Your feedback has been successfully submitted.
            </h1>
            <p className="mt-4 text-sm text-muted-foreground">Feedback ID</p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <p className="rounded-md bg-[var(--accent-tint)] px-3 py-2 font-heading text-2xl font-semibold tracking-tight">
                {confirmation.feedbackId}
              </p>
              <button
                type="button"
                onClick={() => {
                  void navigator.clipboard.writeText(confirmation.feedbackId).then(() => {
                    setCopied(true);
                  });
                }}
                className="h-9 rounded-lg border border-border px-3 text-sm"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <dl className="mt-6 space-y-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Company / project</dt>
                <dd>{confirmation.clientCompany} — {confirmation.projectCampaign}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Submission date</dt>
                <dd>{formatStamp(confirmation.submittedAt)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Confirmation email</dt>
                <dd>
                  {confirmation.emailSent
                    ? `Sent to ${confirmation.reviewerEmail}.`
                    : `Saved, but the email to ${confirmation.reviewerEmail} could not be sent. Keep this feedback ID.`}
                </dd>
              </div>
            </dl>
          </div>
        ) : null}
      </main>
    </>
  );
}
