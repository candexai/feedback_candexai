"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CONTINUE_OPTIONS, PERFORMANCE_OPTIONS, RATING_QUESTIONS, TEXT_QUESTIONS } from "@/lib/questions";

type Ratings = {
  overallExperience?: number;
  aiCallQuality?: number;
  campaignReliability?: number;
};

const fieldClass =
  "h-11 w-full rounded-md border border-input bg-card px-3 text-base text-foreground outline-none transition placeholder:text-zinc-400 focus:border-ring focus:ring-[3px] focus:ring-ring/50 sm:text-sm";

const textAreaClass =
  "min-h-28 w-full resize-y rounded-md border border-input bg-card px-3 py-2.5 text-base leading-6 text-foreground outline-none transition placeholder:text-zinc-400 focus:border-ring focus:ring-[3px] focus:ring-ring/50 sm:text-sm";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-2 text-sm text-destructive">{message}</p>;
}

function Section({
  kicker,
  title,
  description,
  children,
}: {
  kicker: string;
  title?: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border bg-card p-4 sm:p-6">
      <p className="text-[11.5px] font-medium uppercase tracking-[0.09em] text-zinc-600">{kicker}</p>
      {title ? <h2 className="mt-1 font-heading text-2xl font-semibold tracking-tight">{title}</h2> : null}
      <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{description}</p>
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}

function Label({ htmlFor, children, hint }: { htmlFor: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-2">
      <label htmlFor={htmlFor} className="block text-sm font-medium">
        {children}
      </label>
      {hint ? <p className="mt-1 text-sm text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function FeedbackForm() {
  const router = useRouter();
  const [clientCompany, setClientCompany] = useState("");
  const [reviewerName, setReviewerName] = useState("");
  const [reviewerDesignation, setReviewerDesignation] = useState("");
  const [reviewerEmail, setReviewerEmail] = useState("");
  const [ratings, setRatings] = useState<Ratings>({});
  const [performance, setPerformance] = useState("");
  const [text, setText] = useState<Record<string, string>>({});
  const [continueEngagement, setContinueEngagement] = useState("");
  const [testimonialText, setTestimonialText] = useState("");
  const [consentToUse, setConsentToUse] = useState(false);
  const [displayIdentity, setDisplayIdentity] = useState(false);
  const [useLogo, setUseLogo] = useState(false);
  const [website, setWebsite] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setErrors({});
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientCompany,
          reviewerName,
          reviewerDesignation,
          reviewerEmail,
          overallExperience: ratings.overallExperience,
          aiCallQuality: ratings.aiCallQuality,
          campaignReliability: ratings.campaignReliability,
          performanceVsExpectations: performance,
          mostValuable: text.mostValuable ?? "",
          improvementsObserved: text.improvementsObserved ?? "",
          shouldImprove: text.shouldImprove ?? "",
          additionalFeedback: text.additionalFeedback ?? "",
          continueEngagement,
          testimonialText,
          consentToUse,
          displayIdentity,
          useLogo,
          website,
        }),
      });
      const payload = (await response.json()) as {
        submittedAt?: string;
        emailSent?: boolean;
        clientCompany?: string;
        projectCampaign?: string;
        reviewerEmail?: string;
        testimonialText?: string;
        consentToUse?: boolean;
        fields?: Record<string, string>;
        error?: string;
      };
      if (!response.ok || !payload.submittedAt) {
        const fields = payload.fields ?? { form: payload.error ?? "Could not save feedback." };
        setErrors(fields);
        const first = Object.keys(fields)[0];
        document.getElementById(first)?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
      sessionStorage.setItem("candex-feedback-confirmation", JSON.stringify(payload));
      router.push("/submitted");
    } catch {
      setErrors({ form: "Could not reach the server. Try again in a moment." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="px-1">
        <p className="text-[11.5px] font-medium uppercase tracking-[0.09em] text-zinc-600">Feedback</p>
        <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          How was your experience with CandexAI?
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
          This form is for the organization that ran a pilot or campaign. Your answers are stored as submitted,
          and a confirmation is sent to your official work email.
        </p>
      </div>

      {errors.form ? (
        <p className="rounded-md border border-destructive/30 bg-red-50 px-3 py-2 text-sm text-destructive">{errors.form}</p>
      ) : null}

      <Section
        kicker="Organization"
        title="Who this feedback is for"
        description="Use the company this review belongs to. The same form is used for every CandexAI engagement."
      >
        <div>
          <Label htmlFor="clientCompany">Company name</Label>
          <input id="clientCompany" className={fieldClass} value={clientCompany} maxLength={160} autoComplete="organization" onChange={(event) => setClientCompany(event.target.value)} />
          <FieldError message={errors.clientCompany} />
        </div>
        <div>
          <Label htmlFor="reviewerName">Reviewer name</Label>
          <input id="reviewerName" className={fieldClass} value={reviewerName} maxLength={120} autoComplete="name" onChange={(event) => setReviewerName(event.target.value)} />
          <FieldError message={errors.reviewerName} />
        </div>
        <div>
          <Label htmlFor="reviewerDesignation">Reviewer designation</Label>
          <input id="reviewerDesignation" className={fieldClass} value={reviewerDesignation} maxLength={120} autoComplete="organization-title" onChange={(event) => setReviewerDesignation(event.target.value)} />
          <FieldError message={errors.reviewerDesignation} />
        </div>
        <div>
          <Label htmlFor="reviewerEmail" hint="Use your company address. The confirmation is sent here.">Official work email</Label>
          <input id="reviewerEmail" type="email" className={fieldClass} value={reviewerEmail} maxLength={160} autoComplete="email" onChange={(event) => setReviewerEmail(event.target.value)} />
          <FieldError message={errors.reviewerEmail} />
        </div>
      </Section>

      <Section kicker="Feedback" title="Rate this engagement" description="Scores are from 1 to 5.">
        {RATING_QUESTIONS.map((question) => (
          <div key={question.id} id={question.id}>
            <p className="text-sm font-medium">{question.prompt}</p>
            <p className="mt-1 text-sm text-muted-foreground">{question.hint}</p>
            <div className="mt-3 grid grid-cols-5 gap-2" role="radiogroup" aria-label={question.prompt}>
              {[1, 2, 3, 4, 5].map((score) => {
                const selected = ratings[question.id] === score;
                return (
                  <button
                    key={score}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setRatings((current) => ({ ...current, [question.id]: score }))}
                    className={`h-11 rounded-md border text-sm font-medium transition ${
                      selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-secondary text-foreground hover:border-primary/50"
                    }`}
                  >
                    {score}
                  </button>
                );
              })}
            </div>
            <FieldError message={errors[question.id]} />
          </div>
        ))}

        <fieldset id="performanceVsExpectations">
          <legend className="text-sm font-medium">Performance vs expectations</legend>
          <div className="mt-3 space-y-2">
            {PERFORMANCE_OPTIONS.map((option) => (
              <label key={option} className={`flex cursor-pointer items-center gap-3 rounded-md border px-3 py-3 text-sm ${performance === option ? "border-primary bg-[var(--accent-tint)]" : "border-border"}`}>
                <input type="radio" name="performance" className="accent-primary" checked={performance === option} onChange={() => setPerformance(option)} />
                {option}
              </label>
            ))}
          </div>
          <FieldError message={errors.performanceVsExpectations} />
        </fieldset>

        {TEXT_QUESTIONS.map((question) => (
          <div key={question.id}>
            <Label htmlFor={question.id}>{question.prompt}{question.required ? "" : " (optional)"}</Label>
            <textarea
              id={question.id}
              className={textAreaClass}
              maxLength={question.maxLength}
              value={text[question.id] ?? ""}
              onChange={(event) => setText((current) => ({ ...current, [question.id]: event.target.value }))}
            />
            <FieldError message={errors[question.id]} />
          </div>
        ))}

        <fieldset id="continueEngagement">
          <legend className="text-sm font-medium">Would you consider continuing or expanding the engagement?</legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {CONTINUE_OPTIONS.map((option) => (
              <label key={option} className={`flex cursor-pointer items-center justify-center gap-2 rounded-md border px-3 py-3 text-sm ${continueEngagement === option ? "border-primary bg-[var(--accent-tint)]" : "border-border"}`}>
                <input type="radio" name="continue" className="accent-primary" checked={continueEngagement === option} onChange={() => setContinueEngagement(option)} />
                {option}
              </label>
            ))}
          </div>
          <FieldError message={errors.continueEngagement} />
        </fieldset>
      </Section>

      <Section
        kicker="Testimonial"
        description="Required. Write it in your own words. CandexAI will use this as a testimonial, with the name, designation, and company from above."
      >
        <div>
          <Label htmlFor="testimonialText" hint="This original text is kept unchanged.">Testimonial</Label>
          <textarea id="testimonialText" className={textAreaClass} maxLength={2000} required value={testimonialText} onChange={(event) => setTestimonialText(event.target.value)} />
          <FieldError message={errors.testimonialText} />
        </div>

        <div id="consentToUse" className="space-y-3 rounded-md border border-primary/40 bg-[var(--accent-tint)] p-4">
          <label className="flex items-start gap-3 text-sm leading-6">
            <input type="checkbox" className="mt-1 accent-primary" checked={consentToUse} onChange={(event) => setConsentToUse(event.target.checked)} />
            <span>I give CandexAI permission to use this testimonial in its website, sales presentations, investor materials and other marketing communications.</span>
          </label>
          <FieldError message={errors.consentToUse} />
          <label className="flex items-start gap-3 text-sm leading-6">
            <input type="checkbox" className="mt-1 accent-primary" checked={displayIdentity} onChange={(event) => setDisplayIdentity(event.target.checked)} />
            <span>Permission to display name, designation, and company.</span>
          </label>
          <label className="flex items-start gap-3 text-sm leading-6">
            <input type="checkbox" className="mt-1 accent-primary" checked={useLogo} onChange={(event) => setUseLogo(event.target.checked)} />
            <span>Permission to use the company logo, if applicable.</span>
          </label>
          <p className="text-xs text-muted-foreground">The time you submit is stored with each permission you check.</p>
        </div>
      </Section>

      <div className="absolute -left-[9999px] h-px overflow-hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} />
      </div>

      <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {submitting ? "Submitting…" : "Submit feedback"}
        </button>
      </div>
    </form>
  );
}
