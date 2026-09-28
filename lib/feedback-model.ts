import mongoose, { Schema } from "mongoose";

const AnswerSchema = new Schema(
  {
    questionId: { type: String, required: true },
    prompt: { type: String, required: true },
    value: { type: String, default: "" },
  },
  { _id: false },
);

const HistorySchema = new Schema(
  {
    status: {
      type: String,
      required: true,
      enum: ["submitted", "reviewed", "approved", "rejected"],
    },
    at: { type: Date, required: true },
    note: { type: String, default: "" },
  },
  { _id: false },
);

const FeedbackSchema = new Schema(
  {
    feedbackId: { type: String, required: true, unique: true, index: true },
    clientCompany: { type: String, required: true, index: true },
    projectCampaign: { type: String, required: true, index: true },
    campaignStart: { type: String, required: true },
    campaignEnd: { type: String, required: true },
    reviewerName: { type: String, required: true },
    reviewerDesignation: { type: String, required: true },
    reviewerEmail: { type: String, required: true, index: true },
    ratings: {
      overallExperience: { type: Number, required: true, min: 1, max: 5 },
      aiCallQuality: { type: Number, required: true, min: 1, max: 5 },
      campaignReliability: { type: Number, required: true, min: 1, max: 5 },
    },
    performanceVsExpectations: { type: String, required: true },
    continueEngagement: { type: String, required: true },
    answers: { type: [AnswerSchema], required: true },
    testimonial: {
      willing: { type: Boolean, required: true },
      originalText: { type: String, default: "" },
      name: { type: String, default: "" },
      designation: { type: String, default: "" },
      company: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      consentToUse: { type: Boolean, default: false },
      consentAt: { type: Date, default: null },
      displayIdentity: { type: Boolean, default: false },
      displayIdentityAt: { type: Date, default: null },
      useLogo: { type: Boolean, default: false },
      useLogoAt: { type: Date, default: null },
      approvedText: { type: String, default: "" },
      approvedAt: { type: Date, default: null },
    },
    status: {
      type: String,
      required: true,
      enum: ["submitted", "reviewed", "approved", "rejected"],
      index: true,
    },
    statusHistory: { type: [HistorySchema], default: [] },
    submittedAt: { type: Date, required: true, index: true },
    audit: {
      ip: { type: String, default: "" },
      userAgent: { type: String, default: "" },
      acceptLanguage: { type: String, default: "" },
      confirmationEmail: {
        sent: { type: Boolean, default: false },
        sentAt: { type: Date, default: null },
        error: { type: String, default: "" },
        messageId: { type: String, default: "" },
      },
    },
  },
  { collection: "client_feedback" },
);

export const ClientFeedback =
  mongoose.models.ClientFeedback || mongoose.model("ClientFeedback", FeedbackSchema);
