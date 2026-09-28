export const FEEDBACK_STATUSES = ["submitted", "reviewed", "approved", "rejected"] as const;

export type FeedbackStatus = (typeof FEEDBACK_STATUSES)[number];

export type AnswerSnapshot = {
  questionId: string;
  prompt: string;
  value: string;
};

export type TestimonialRecord = {
  willing: boolean;
  originalText: string;
  name: string;
  designation: string;
  company: string;
  linkedin: string;
  consentToUse: boolean;
  consentAt: string | null;
  displayIdentity: boolean;
  displayIdentityAt: string | null;
  useLogo: boolean;
  useLogoAt: string | null;
  approvedText: string;
  approvedAt: string | null;
};

export type FeedbackRecord = {
  feedbackId: string;
  clientCompany: string;
  projectCampaign: string;
  campaignStart: string;
  campaignEnd: string;
  reviewerName: string;
  reviewerDesignation: string;
  reviewerEmail: string;
  ratings: {
    overallExperience: number;
    aiCallQuality: number;
    campaignReliability: number;
  };
  performanceVsExpectations: string;
  continueEngagement: string;
  answers: AnswerSnapshot[];
  testimonial: TestimonialRecord;
  status: FeedbackStatus;
  statusHistory: { status: FeedbackStatus; at: string; note: string }[];
  submittedAt: string;
  audit: {
    ip: string;
    userAgent: string;
    acceptLanguage: string;
    confirmationEmail: {
      sent: boolean;
      sentAt: string | null;
      error: string;
    };
  };
};

export type FeedbackSummary = {
  feedbackId: string;
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
  status: FeedbackStatus;
  submittedAt: string;
  testimonialWilling: boolean;
  consentToUse: boolean;
};
