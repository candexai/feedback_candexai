import { FEEDBACK_STATUSES, type FeedbackStatus } from "@/lib/types";

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function feedbackFilter(params: URLSearchParams) {
  const filter: Record<string, unknown> = {};
  const client = params.get("client")?.trim() ?? "";
  const project = params.get("project")?.trim() ?? "";
  const status = params.get("status")?.trim() ?? "";
  const from = params.get("from")?.trim() ?? "";
  const to = params.get("to")?.trim() ?? "";
  const feedbackId = params.get("feedbackId")?.trim() ?? "";

  if (client) filter.clientCompany = { $regex: escapeRegex(client).slice(0, 80), $options: "i" };
  if (project) filter.projectCampaign = { $regex: escapeRegex(project).slice(0, 80), $options: "i" };
  if (FEEDBACK_STATUSES.includes(status as FeedbackStatus)) filter.status = status;
  if (feedbackId) filter.feedbackId = feedbackId.slice(0, 32);

  const submittedAt: Record<string, Date> = {};
  if (/^\d{4}-\d{2}-\d{2}$/.test(from)) submittedAt.$gte = new Date(`${from}T00:00:00.000Z`);
  if (/^\d{4}-\d{2}-\d{2}$/.test(to)) submittedAt.$lte = new Date(`${to}T23:59:59.999Z`);
  if (Object.keys(submittedAt).length) filter.submittedAt = submittedAt;
  return filter;
}
