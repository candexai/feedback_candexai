import { CONTINUE_OPTIONS, PERFORMANCE_OPTIONS, TEXT_QUESTIONS } from "@/lib/questions";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type SubmissionInput = {
  clientCompany: string;
  projectCampaign: string;
  campaignStart: string;
  campaignEnd: string;
  reviewerName: string;
  reviewerDesignation: string;
  reviewerEmail: string;
  overallExperience: number;
  aiCallQuality: number;
  campaignReliability: number;
  performanceVsExpectations: (typeof PERFORMANCE_OPTIONS)[number];
  mostValuable: string;
  improvementsObserved: string;
  shouldImprove: string;
  additionalFeedback: string;
  continueEngagement: (typeof CONTINUE_OPTIONS)[number];
  testimonialWilling: boolean;
  testimonialText: string;
  testimonialName: string;
  testimonialDesignation: string;
  testimonialCompany: string;
  testimonialLinkedin: string;
  consentToUse: boolean;
  displayIdentity: boolean;
  useLogo: boolean;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function clean(value: unknown) {
  return typeof value === "string" ? value.replace(/\0/g, "").trim() : "";
}

function requireText(
  value: unknown,
  key: string,
  label: string,
  min: number,
  max: number,
  errors: Record<string, string>,
) {
  const text = clean(value);
  if (text.length < min) errors[key] = `Enter ${label}.`;
  else if (text.length > max) errors[key] = `Keep ${label} under ${max} characters.`;
  return text;
}

function requireScore(value: unknown, key: string, errors: Record<string, string>) {
  const score = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(score) || score < 1 || score > 5) {
    errors[key] = "Choose a score from 1 to 5.";
    return 0;
  }
  return score;
}

export function validateSubmission(body: unknown): {
  errors: Record<string, string>;
  value: SubmissionInput | null;
  spam: boolean;
} {
  const errors: Record<string, string> = {};
  if (!isRecord(body)) {
    return { errors: { form: "Send the feedback form as JSON." }, value: null, spam: false };
  }
  if (clean(body.website)) {
    return { errors: {}, value: null, spam: true };
  }

  const clientCompany = requireText(body.clientCompany, "clientCompany", "the company name", 2, 160, errors);
  const projectCampaign = "";
  const campaignStart = "";
  const campaignEnd = "";

  const reviewerName = requireText(body.reviewerName, "reviewerName", "the reviewer name", 2, 120, errors);
  const reviewerDesignation = requireText(
    body.reviewerDesignation,
    "reviewerDesignation",
    "the reviewer designation",
    2,
    120,
    errors,
  );
  const reviewerEmail = clean(body.reviewerEmail).toLowerCase();
  if (!reviewerEmail || reviewerEmail.length > 160 || !EMAIL_PATTERN.test(reviewerEmail)) {
    errors.reviewerEmail = "Enter an official work email.";
  }

  const overallExperience = requireScore(body.overallExperience, "overallExperience", errors);
  const aiCallQuality = requireScore(body.aiCallQuality, "aiCallQuality", errors);
  const campaignReliability = requireScore(body.campaignReliability, "campaignReliability", errors);

  const performance = clean(body.performanceVsExpectations);
  if (!PERFORMANCE_OPTIONS.includes(performance as (typeof PERFORMANCE_OPTIONS)[number])) {
    errors.performanceVsExpectations = "Choose how the work compared with expectations.";
  }

  const textValues: Record<string, string> = {};
  for (const question of TEXT_QUESTIONS) {
    const text = clean(body[question.id]);
    if (question.required && text.length < 2) errors[question.id] = "Write an answer.";
    else if (text.length > question.maxLength) errors[question.id] = `Keep this under ${question.maxLength} characters.`;
    textValues[question.id] = text;
  }

  const continueEngagement = clean(body.continueEngagement);
  if (!CONTINUE_OPTIONS.includes(continueEngagement as (typeof CONTINUE_OPTIONS)[number])) {
    errors.continueEngagement = "Choose Yes, Maybe, or No.";
  }

  const testimonialWilling = true;
  const testimonialText = requireText(body.testimonialText, "testimonialText", "the testimonial", 20, 2000, errors);
  const testimonialName = reviewerName;
  const testimonialDesignation = reviewerDesignation;
  const testimonialCompany = clientCompany;
  const testimonialLinkedin = "";
  const consentToUse = body.consentToUse === true;
  const displayIdentity = body.displayIdentity === true;
  const useLogo = body.useLogo === true;
  if (!consentToUse) {
    errors.consentToUse = "Consent is required before CandexAI can keep this testimonial for marketing.";
  }

  if (Object.keys(errors).length > 0) return { errors, value: null, spam: false };

  return {
    errors,
    spam: false,
    value: {
      clientCompany,
      projectCampaign,
      campaignStart,
      campaignEnd,
      reviewerName,
      reviewerDesignation,
      reviewerEmail,
      overallExperience,
      aiCallQuality,
      campaignReliability,
      performanceVsExpectations: performance as SubmissionInput["performanceVsExpectations"],
      mostValuable: textValues.mostValuable,
      improvementsObserved: textValues.improvementsObserved,
      shouldImprove: textValues.shouldImprove,
      additionalFeedback: textValues.additionalFeedback,
      continueEngagement: continueEngagement as SubmissionInput["continueEngagement"],
      testimonialWilling,
      testimonialText,
      testimonialName,
      testimonialDesignation,
      testimonialCompany,
      testimonialLinkedin,
      consentToUse,
      displayIdentity,
      useLogo,
    },
  };
}
