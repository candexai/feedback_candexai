import type { FeedbackRecord, FeedbackStatus, FeedbackSummary } from "@/lib/types";

function iso(value: Date | string | null | undefined) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

export function toRecord(doc: Record<string, any>): FeedbackRecord {
  const testimonial = doc.testimonial ?? {};
  return {
    feedbackId: doc.feedbackId,
    clientCompany: doc.clientCompany,
    projectCampaign: doc.projectCampaign,
    campaignStart: doc.campaignStart,
    campaignEnd: doc.campaignEnd,
    reviewerName: doc.reviewerName,
    reviewerDesignation: doc.reviewerDesignation,
    reviewerEmail: doc.reviewerEmail,
    ratings: {
      overallExperience: doc.ratings?.overallExperience,
      aiCallQuality: doc.ratings?.aiCallQuality,
      campaignReliability: doc.ratings?.campaignReliability,
    },
    performanceVsExpectations: doc.performanceVsExpectations,
    continueEngagement: doc.continueEngagement,
    answers: doc.answers ?? [],
    testimonial: {
      willing: Boolean(testimonial.willing),
      originalText: testimonial.originalText ?? "",
      name: testimonial.name ?? "",
      designation: testimonial.designation ?? "",
      company: testimonial.company ?? "",
      linkedin: testimonial.linkedin ?? "",
      consentToUse: Boolean(testimonial.consentToUse),
      consentAt: iso(testimonial.consentAt),
      displayIdentity: Boolean(testimonial.displayIdentity),
      displayIdentityAt: iso(testimonial.displayIdentityAt),
      useLogo: Boolean(testimonial.useLogo),
      useLogoAt: iso(testimonial.useLogoAt),
      approvedText: testimonial.approvedText ?? "",
      approvedAt: iso(testimonial.approvedAt),
    },
    status: doc.status as FeedbackStatus,
    statusHistory: (doc.statusHistory ?? []).map((entry: { status: FeedbackStatus; at: Date; note?: string }) => ({
      status: entry.status,
      at: iso(entry.at) ?? "",
      note: entry.note ?? "",
    })),
    submittedAt: iso(doc.submittedAt) ?? "",
    audit: {
      ip: doc.audit?.ip ?? "",
      userAgent: doc.audit?.userAgent ?? "",
      acceptLanguage: doc.audit?.acceptLanguage ?? "",
      confirmationEmail: {
        sent: Boolean(doc.audit?.confirmationEmail?.sent),
        sentAt: iso(doc.audit?.confirmationEmail?.sentAt),
        error: doc.audit?.confirmationEmail?.error ?? "",
      },
    },
  };
}

export function toSummary(doc: Record<string, any>): FeedbackSummary {
  return {
    feedbackId: doc.feedbackId,
    clientCompany: doc.clientCompany,
    projectCampaign: doc.projectCampaign,
    campaignStart: doc.campaignStart,
    campaignEnd: doc.campaignEnd,
    reviewerName: doc.reviewerName,
    reviewerDesignation: doc.reviewerDesignation,
    reviewerEmail: doc.reviewerEmail,
    overallExperience: doc.ratings?.overallExperience,
    aiCallQuality: doc.ratings?.aiCallQuality,
    campaignReliability: doc.ratings?.campaignReliability,
    status: doc.status,
    submittedAt: iso(doc.submittedAt) ?? "",
    testimonialWilling: Boolean(doc.testimonial?.willing),
    consentToUse: Boolean(doc.testimonial?.consentToUse),
  };
}
