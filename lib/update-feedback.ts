import { FEEDBACK_STATUSES, type FeedbackStatus } from "@/lib/types";

const STATUS_NOTES: Record<FeedbackStatus, string> = {
  submitted: "Returned to submitted",
  reviewed: "Marked reviewed",
  approved: "Marked approved",
  rejected: "Marked rejected",
};

export function adminUpdate(body: unknown) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { error: "Send a JSON object." as const };
  }
  const record = body as Record<string, unknown>;
  const set: Record<string, unknown> = {};
  const push: Record<string, unknown> = {};

  if ("status" in record) {
    const status = record.status;
    if (typeof status !== "string" || !FEEDBACK_STATUSES.includes(status as FeedbackStatus)) {
      return { error: "Choose a valid status." as const };
    }
    const now = new Date();
    set.status = status;
    push.statusHistory = {
      status,
      at: now,
      note: STATUS_NOTES[status as FeedbackStatus],
    };
  }

  if ("approvedText" in record) {
    if (typeof record.approvedText !== "string") {
      return { error: "The approved testimonial must be text." as const };
    }
    const approvedText = record.approvedText.replace(/\0/g, "").trim();
    if (approvedText.length > 2000) {
      return { error: "Keep the approved testimonial under 2000 characters." as const };
    }
    set["testimonial.approvedText"] = approvedText;
    set["testimonial.approvedAt"] = approvedText ? new Date() : null;
  }

  if (!Object.keys(set).length) {
    return { error: "Nothing to update." as const };
  }

  const update: Record<string, unknown> = { $set: set };
  if (Object.keys(push).length) update.$push = push;
  return { update };
}
