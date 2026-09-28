export const PERFORMANCE_OPTIONS = [
  "Below expectations",
  "Met expectations",
  "Exceeded expectations",
] as const;

export const CONTINUE_OPTIONS = ["Yes", "Maybe", "No"] as const;

export const RATING_QUESTIONS = [
  {
    id: "overallExperience",
    prompt: "Overall experience",
    hint: "1 is poor. 5 is excellent.",
  },
  {
    id: "aiCallQuality",
    prompt: "AI call quality",
    hint: "1 is not usable. 5 is ready for your customers.",
  },
  {
    id: "campaignReliability",
    prompt: "Campaign execution / reliability",
    hint: "1 is unreliable. 5 is consistently reliable.",
  },
] as const;

export const TEXT_QUESTIONS = [
  {
    id: "mostValuable",
    prompt: "What did you find most valuable?",
    required: true,
    maxLength: 2000,
  },
  {
    id: "improvementsObserved",
    prompt: "What improvements did you observe?",
    required: true,
    maxLength: 2000,
  },
  {
    id: "shouldImprove",
    prompt: "What should CandexAI improve?",
    required: true,
    maxLength: 2000,
  },
  {
    id: "additionalFeedback",
    prompt: "Any additional feedback?",
    required: false,
    maxLength: 2000,
  },
] as const;
