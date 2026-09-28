import { NextResponse } from "next/server";
import { buildSubmission } from "@/lib/build-submission";
import { connectDb } from "@/lib/db";
import { sendConfirmationEmail } from "@/lib/email";
import { ClientFeedback } from "@/lib/feedback-model";
import { createFeedbackId } from "@/lib/ids";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp, requestMeta, sameOrigin } from "@/lib/security";
import { validateSubmission } from "@/lib/validate";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function tooLarge(request: Request) {
  const length = Number(request.headers.get("content-length") || 0);
  return Number.isFinite(length) && length > 100_000;
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ error: "Submit the form from the CandexAI feedback page." }, { status: 403 });
  }
  if (tooLarge(request)) {
    return NextResponse.json({ error: "That submission is too large." }, { status: 413 });
  }

  const limit = rateLimit(`feedback:${clientIp(request)}`, 5, 30 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many submissions from this network. Please wait and try again." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Send the feedback form as JSON." }, { status: 400 });
  }

  const { errors, value, spam } = validateSubmission(body);
  if (spam) {
    return NextResponse.json({ error: "Could not submit the form." }, { status: 400 });
  }
  if (!value) {
    return NextResponse.json({ error: "Check the highlighted fields.", fields: errors }, { status: 400 });
  }

  const now = new Date();
  const document = buildSubmission(value, requestMeta(request), now);

  try {
    await connectDb();
    let saved = null;
    for (let attempt = 0; attempt < 5; attempt += 1) {
      try {
        saved = await ClientFeedback.create({ ...document, feedbackId: createFeedbackId() });
        break;
      } catch (error) {
        const code = (error as { code?: number }).code;
        if (code === 11000 && attempt < 4) continue;
        throw error;
      }
    }
    if (!saved) throw new Error("Could not assign a feedback ID.");

    const email = await sendConfirmationEmail({
      to: value.reviewerEmail,
      feedbackId: saved.feedbackId,
      clientCompany: value.clientCompany,
      projectCampaign: value.projectCampaign,
      submittedAt: now,
      testimonialText: document.testimonial.originalText,
      consentToUse: document.testimonial.consentToUse,
      displayIdentity: document.testimonial.displayIdentity,
      useLogo: document.testimonial.useLogo,
    });

    await ClientFeedback.updateOne(
      { _id: saved._id },
      {
        $set: {
          "audit.confirmationEmail": {
            sent: email.sent,
            sentAt: email.sent ? new Date() : null,
            error: email.error ?? "",
            messageId: email.messageId ?? "",
          },
        },
      },
    );

    return NextResponse.json(
      {
        feedbackId: saved.feedbackId,
        submittedAt: now.toISOString(),
        emailSent: email.sent,
        clientCompany: value.clientCompany,
        projectCampaign: value.projectCampaign,
        reviewerEmail: value.reviewerEmail,
        testimonialText: document.testimonial.originalText,
        consentToUse: document.testimonial.consentToUse,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to save client feedback", error instanceof Error ? error.message : "unknown");
    return NextResponse.json(
      { error: "Could not save feedback. Try again in a moment." },
      { status: 500 },
    );
  }
}
