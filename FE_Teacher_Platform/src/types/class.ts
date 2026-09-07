// ── Class Types ────────────────────────────────────────────────────────────────

export interface ClassResponse {
  id: number;
  className: string;
  description: string | null;
  startDate: string;
  endDate: string;
  numberOfLessons: number;
  currentLevel: number;
  targetLevel: number;
  status: string;
  createdAt: string;
  teacherId: number;
  teacherName: string;
  studentCount: number;
}

export interface CreateClassRequest {
  className: string;
  description?: string;
  startDate: string;
  endDate: string;
  numberOfLessons: number;
  currentLevel: number;
  targetLevel: number;
}

export interface UpdateClassRequest {
  className?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  numberOfLessons?: number;
  currentLevel?: number;
  targetLevel?: number;
  status?: string;
}

export interface ClassItem {
  id: string;
  name: string;
  level: string;
  target: string;
  description: string;
  students: number;
  sessions: number | string;
  startDate: string;
  endDate: string;
}

export interface StudentSearchResult {
  id: number;
  displayName: string;
  email: string;
  alreadyEnrolled: boolean;
}

export interface EnrollStudentsResponse {
  enrolled: number;
  alreadyIn: number;
}

export interface EnrolledStudent {
  studentId: number;
  displayName: string;
  email: string;
  enrolledAt: string;
  averageScore: number;
  totalEssays: number;
}

export interface ClassGradingItem {
  taskHistoryId: number;
  classId: number;
  studentId: number;
  studentName: string;
  className: string;
  created: string;
  topic: string;
  taskType: string;
  questionType: string;
  aiScore: number;
  yourScore?: number | null;
  fbScore?: number | null;
  confidenceScore?: number | null;
  gradingMode?: string | null;
  reviewStatus?: 'approved' | 'rejected' | null;
  reviewComment?: string | null;
  isStarred: boolean;
}

export interface StudentScorePoint {
  studentId: number;
  studentName: string;
  averageScore: number;
  totalEssays: number;
  targetLevel: number;
}

export interface BandBucket {
  band: string;
  count: number;
  percent: number;
}

export interface ScoreOverTimePoint {
  label: string;
  averageScore: number;
  essayCount: number;
}

export interface CriterionSeries {
  taOrTr: (number | null)[];
  cc: (number | null)[];
  lr: (number | null)[];
  gra: (number | null)[];
}

export interface ClassChartDataResponse {
  labels: string[];
  overall: {
    task1: (number | null)[];
    task2: (number | null)[];
    virtualExam: (number | null)[];
  };
  criteria: {
    task1: CriterionSeries;
    task2: CriterionSeries;
  };
  studentScores?: StudentScorePoint[];
  bandDistribution?: BandBucket[];
  scoreOverTime?: ScoreOverTimePoint[];
}

export interface ClassStatsResponse {
  targetLevel: number;
  startDate: string;
  endDate: string;
  targetProgressPercent: number;
  totalWritings: number;
  totalTask1: number;
  totalTask2: number;
  classAverageScore: number;
  scoreImprovement: number;
  studentsReachedTarget: number;
  totalStudents: number;
}

export interface TaskHistoryFeedbackDetail {
  quote?: string | null;
  description?: string | null;
}

export interface TaskHistoryStrength {
  strengthDescription?: string | null;
}

export interface TaskHistoryImprovement {
  improvementDescription?: string | null;
}

export interface TaskHistoryCriteriaScore {
  criteriaName?: string | null;
  score?: number | null;
  bandReason?: string | null;
  feedbackDetails?: TaskHistoryFeedbackDetail[];
  strengths?: TaskHistoryStrength[];
  areasForImprovement?: TaskHistoryImprovement[];
}

export interface TaskHistoryEvaluation {
  overallScore?: number | null;
  overallSummary?: string | null;
  evaluatedAt?: string;
  criteriaScores?: TaskHistoryCriteriaScore[];
  suggestions?: { suggestionDescription?: string | null; description?: string | null; text?: string | null }[];
  nextSteps?: { nextStepDescription?: string | null; description?: string | null; text?: string | null }[];
}

export interface TaskHistoryWritingData {
  question?: string | null;
  imagePath?: string | null;
  answer?: string | null;
  evaluations?: TaskHistoryEvaluation[];
}

export interface TaskHistoryDetail {
  taskHistoryId: number;
  studentId: number;
  studentName: string;
  className: string;
  classId: number;
  taskType: string;
  questionType?: string | null;
  created: string;
  aiScore?: number | null;
  yourScore?: number | null;
  fbScore?: number | null;
  confidenceScore?: number | null;
  gradingMode?: string | null;
  reviewStatus?: 'approved' | 'rejected' | null;
  isStarred: boolean;
  task1?: TaskHistoryWritingData | null;
  task2?: TaskHistoryWritingData | null;
}

export interface TeacherEvaluationCriterion {
  criteriaName: string;
  score: number;
  bandReason: string;
  strengths: string[];
  areasForImprovement: string[];
  feedbackDetails: { quote: string; description: string }[];
}

export interface TeacherEvaluationPayload {
  overallScore: number;
  overallSummary: string;
  criteriaScores: TeacherEvaluationCriterion[];
  suggestions: string[];
  nextSteps: string[];
}
