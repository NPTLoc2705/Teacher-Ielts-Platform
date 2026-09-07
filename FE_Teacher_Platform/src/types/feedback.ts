export type FeedbackCategory = 'TR' | 'CC' | 'LR' | 'GRA';

export interface FeedbackItem {
  id: string;
  text: string;
  improvementExample?: string;
  category?: FeedbackCategory;
  checked: boolean;
  isNew?: boolean;
  isManual?: boolean;
  isAiGenerated?: boolean;
  range?: { start: number; end: number };
  quote?: string;
}

export interface CriterionScores {
  TR: number;
  CC: number;
  LR: number;
  GRA: number;
}

export interface CriterionFeedbackBlock {
  strengths: string[];
  improvements: string[];
  bandReason: string;
  selectedIssues: string[];
}

export interface OverallAssessment {
  summary: string;
  specificSuggestions: string[];
  nextSteps: string[];
}

export interface TeacherFeedbackData {
  studentName: string;
  className: string;
  taskType: string;
  question: string;
  imageUrl?: string;
  submittedAt: string;
  wordCount: number;
  completionTimeSeconds: number;
  essayText: string;
  scores: CriterionScores;
  criteria: Record<FeedbackCategory, CriterionFeedbackBlock>;
  overallAssessment: OverallAssessment;
  feedbackItems: FeedbackItem[];
}

export interface ConfirmationRating {
  aiFeedbackRating: number;
  teacherConfidenceRating: number;
}
