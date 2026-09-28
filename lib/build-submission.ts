import { TEXT_QUESTIONS } from "@/lib/questions";
import type { SubmissionInput } from "@/lib/validate";

export function buildSubmission(
  value: SubmissionInput,
  meta: { ip: string; userAgent: string; acceptLanguage: string },
  now: Date,
) {
  const answers = [
    { questionId: "overallExperience", prompt: "Overall experience", value: `${value.overallExperience} / 5` },
    { questionId: "aiCallQuality", prompt: "AI call quality", value: `${value.aiCallQuality} / 5` },
    {
      questionId: "campaignReliability",
      prompt: "Reliability",
      value: `${value.campaignReliability} / 5`,
    },
    {
      questionId: "performanceVsExpectations",
      prompt: "Performance vs expectations",
      value: value.performanceVsExpectations,
    },
    ...TEXT_QUESTIONS.map((question) => ({
      questionId: question.id,
      prompt: question.prompt,
      value: value[question.id],
    })),
    {
      questionId: "continueEngagement",
      prompt: "Would you consider continuing or expanding the engagement?",
      value: value.continueEngagement,
    },
  ];

  return {
    clientCompany: value.clientCompany,
    projectCampaign: value.projectCampaign,
    campaignStart: value.campaignStart,
    campaignEnd: value.campaignEnd,
    reviewerName: value.reviewerName,
    reviewerDesignation: value.reviewerDesignation,
    reviewerEmail: value.reviewerEmail,
    ratings: {
      overallExperience: value.overallExperience,
      aiCallQuality: value.aiCallQuality,
      campaignReliability: value.campaignReliability,
    },
    performanceVsExpectations: value.performanceVsExpectations,
    continueEngagement: value.continueEngagement,
    answers,
    testimonial: {
      willing: value.testimonialWilling,
      originalText: value.testimonialWilling ? value.testimonialText : "",
      name: value.testimonialWilling ? value.testimonialName : "",
      designation: value.testimonialWilling ? value.testimonialDesignation : "",
      company: value.testimonialWilling ? value.testimonialCompany : "",
      linkedin: value.testimonialWilling ? value.testimonialLinkedin : "",
      consentToUse: value.testimonialWilling && value.consentToUse,
      consentAt: value.testimonialWilling && value.consentToUse ? now : null,
      displayIdentity: value.testimonialWilling && value.displayIdentity,
      displayIdentityAt: value.testimonialWilling && value.displayIdentity ? now : null,
      useLogo: value.testimonialWilling && value.useLogo,
      useLogoAt: value.testimonialWilling && value.useLogo ? now : null,
      approvedText: "",
      approvedAt: null,
    },
    status: "submitted" as const,
    statusHistory: [{ status: "submitted" as const, at: now, note: "Submitted from the public form" }],
    submittedAt: now,
    audit: {
      ...meta,
      confirmationEmail: { sent: false, sentAt: null, error: "", messageId: "" },
    },
  };
}
