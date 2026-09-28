import { csvCell, formatStamp } from "@/lib/format";
import type { FeedbackRecord } from "@/lib/types";

const COLUMNS: { header: string; value: (row: FeedbackRecord) => unknown }[] = [
  { header: "Feedback ID", value: (row) => row.feedbackId },
  { header: "Submitted at", value: (row) => formatStamp(row.submittedAt) },
  { header: "Status", value: (row) => row.status },
  { header: "Company", value: (row) => row.clientCompany },
  { header: "Project / campaign", value: (row) => row.projectCampaign },
  { header: "Campaign start", value: (row) => row.campaignStart },
  { header: "Campaign end", value: (row) => row.campaignEnd },
  { header: "Reviewer name", value: (row) => row.reviewerName },
  { header: "Reviewer designation", value: (row) => row.reviewerDesignation },
  { header: "Official email", value: (row) => row.reviewerEmail },
  { header: "Overall experience", value: (row) => row.ratings.overallExperience },
  { header: "AI call quality", value: (row) => row.ratings.aiCallQuality },
  { header: "Campaign reliability", value: (row) => row.ratings.campaignReliability },
  { header: "Performance vs expectations", value: (row) => row.performanceVsExpectations },
  { header: "Most valuable", value: (row) => row.answers.find((answer) => answer.questionId === "mostValuable")?.value ?? "" },
  { header: "Improvements observed", value: (row) => row.answers.find((answer) => answer.questionId === "improvementsObserved")?.value ?? "" },
  { header: "What CandexAI should improve", value: (row) => row.answers.find((answer) => answer.questionId === "shouldImprove")?.value ?? "" },
  { header: "Additional feedback", value: (row) => row.answers.find((answer) => answer.questionId === "additionalFeedback")?.value ?? "" },
  { header: "Continue or expand", value: (row) => row.continueEngagement },
  { header: "Testimonial provided", value: (row) => (row.testimonial.willing ? "Yes" : "No") },
  { header: "Original testimonial", value: (row) => row.testimonial.originalText },
  { header: "Testimonial name", value: (row) => row.testimonial.name },
  { header: "Testimonial designation", value: (row) => row.testimonial.designation },
  { header: "Testimonial company", value: (row) => row.testimonial.company },
  { header: "LinkedIn", value: (row) => row.testimonial.linkedin },
  { header: "Marketing consent", value: (row) => (row.testimonial.consentToUse ? "Yes" : "No") },
  { header: "Consent timestamp", value: (row) => formatStamp(row.testimonial.consentAt) },
  { header: "Display name permission", value: (row) => (row.testimonial.displayIdentity ? "Yes" : "No") },
  { header: "Display name timestamp", value: (row) => formatStamp(row.testimonial.displayIdentityAt) },
  { header: "Logo permission", value: (row) => (row.testimonial.useLogo ? "Yes" : "No") },
  { header: "Logo permission timestamp", value: (row) => formatStamp(row.testimonial.useLogoAt) },
  { header: "Approved testimonial", value: (row) => row.testimonial.approvedText },
  { header: "Approved at", value: (row) => formatStamp(row.testimonial.approvedAt) },
  { header: "Confirmation email sent", value: (row) => (row.audit.confirmationEmail.sent ? "Yes" : "No") },
  { header: "IP", value: (row) => row.audit.ip },
  { header: "User agent", value: (row) => row.audit.userAgent },
];

export function feedbackToCsv(rows: FeedbackRecord[]) {
  const header = COLUMNS.map((column) => csvCell(column.header)).join(",");
  const body = rows.map((row) => COLUMNS.map((column) => csvCell(column.value(row))).join(","));
  return `\uFEFF${[header, ...body].join("\n")}\n`;
}
