import { useState, useEffect, useCallback } from 'react';
import { classService as ClassService } from '../../../services/classService'; // Import the real API service
import type { FeedbackCategory, FeedbackItem, CriterionScores, CriterionFeedbackBlock, OverallAssessment, TeacherFeedbackData, ConfirmationRating } from './types';

// ---------------------------------------------------------------------------
// IELTS band rounding: x.00â€“x.24 â†’ x.0 | x.25â€“x.74 â†’ x.5 | x.75â€“x.99 â†’ x+1
// ---------------------------------------------------------------------------
export function roundIeltsBand(avg: number): number {
  const floor = Math.floor(avg);
  const frac = avg - floor;
  if (frac < 0.25) return floor;
  if (frac < 0.75) return floor + 0.5;
  return floor + 1;
}

// Use the older virtual-exam rounding rules: >=0.75 -> +1, >0.3 -> +0.5, else floor
function calculateOverallBandFromScores(scores: CriterionScores): number {
  const avg = (scores.TR + scores.CC + scores.LR + scores.GRA) / 4;
  const intPart = Math.floor(avg);
  const decimalPart = avg - intPart;

  if (decimalPart >= 0.75) return intPart + 1;
  if (decimalPart > 0.3) return intPart + 0.5;
  return intPart;
}

function normalizeTextList(items: unknown, keys: string[]): string[] {
  if (!Array.isArray(items)) return [];

  return items
    .map((item) => {
      if (typeof item === 'string') {
        return item.trim();
      }

      if (item && typeof item === 'object') {
        const record = item as Record<string, unknown>;
        for (const key of keys) {
          const value = record[key];
          if (typeof value === 'string' && value.trim()) {
            return value.trim();
          }
        }
      }

      return '';
    })
    .filter((value): value is string => value.length > 0);
}

function mapCriterionCategory(criteriaName: unknown, index: number): FeedbackCategory {
  const raw = String(criteriaName ?? '').trim();
  const normalized = raw.toLowerCase().replace(/[\_\s]+/g, '-');

  if (raw === 'TR' || raw === 'CC' || raw === 'LR' || raw === 'GRA') {
    return raw as FeedbackCategory;
  }

  if (normalized.includes('task-response') || normalized.includes('task-achievement') || normalized.includes('task')) {
    return 'TR';
  }
  if (normalized.includes('coherence-cohesion') || normalized.includes('coherence')) {
    return 'CC';
  }
  if (normalized.includes('lexical-resource') || normalized.includes('lexical') || normalized.includes('vocabulary')) {
    return 'LR';
  }
  if (normalized.includes('grammar-accuracy') || normalized.includes('grammatical') || normalized.includes('grammar')) {
    return 'GRA';
  }

  return (['TR', 'CC', 'LR', 'GRA'][Math.min(index, 3)] as FeedbackCategory);
}

function readCriterionScore(value: any): number {
  const rawScore = value?.score ?? value?.bandScore ?? value?.BandScore ?? value?.band_score ?? 0;
  const parsed = Number(rawScore);
  return Number.isFinite(parsed) ? parsed : 0;
}

const CRITERION_ORDER: FeedbackCategory[] = ['TR', 'CC', 'LR', 'GRA'];

// ---------------------------------------------------------------------------
// Mock data â€” replace the useEffect body below with an API call when ready.
// ---------------------------------------------------------------------------
const MOCK_ESSAY_TEXT = `Today, technology is very popular in our life. But people have different ideas about how technology affect our communication. Some think it makes us more sociable, others think it makes us less. This essay will talk about both sides.

On the one hand, technology can help people to be more sociable. For example, with social media like Facebook or Instagram, we can talk to friends from many very easy. Also, we can see their photos and know about their life. Also, we can make new friends online from different countries. This is a good way to be more open and connect with many people.

On the other hand, technology can make people less sociable. Many people, especially young people, spend too much time on their phones. They always look at their screen and do not talk to people around them. For example, in a family, everyone is on their own device and they don't have real conversation. This can make relationships become weak.

In my opinion, I think technology can make us less sociable in real life. Because when we use technology too much, we might forget how to talk to people face-to-face. This is not good for our social skills. We should use technology in a smart way and remember to spend time with family and friends in person.

In conclusion, technology has both good and bad effects on our social life. But I believe we should not let it control our life and remember to communicate in real life.`;

const MOCK_DATA: TeacherFeedbackData = {
  studentName: 'Nguyá»…n VÄƒn A',
  className: 'IELTS Advanced 01',
  taskType: 'task2',
  question: 'Some people believe that unpaid community service should be a compulsory part of high school programs. To what extent do you agree or disagree?',
  submittedAt: '2025-05-14T13:30:00Z',
  wordCount: 307,
  completionTimeSeconds: 2122,
  essayText: MOCK_ESSAY_TEXT,
  scores: { TR: 7, CC: 8, LR: 7, GRA: 7 },
  overallAssessment: {
    summary:
      'The essay addresses the prompt but lacks depth in argumentation. Both views are mentioned but not sufficiently developed with evidence or analysis.',
    specificSuggestions: [
      'Develop each body paragraph with a clear topic sentence, explanation, and concrete example.',
      'Use more sophisticated cohesive devices beyond "also" and "for example".',
      'Strengthen the conclusion by synthesising the discussion rather than restating it.',
    ],
    nextSteps: [
      'Practice expanding supporting ideas with the PEEL structure.',
      'Review advanced discourse markers for academic writing.',
    ],
  },
  criteria: {
    TR: {
      strengths: ['The essay addresses both views of the topic as required.'],
      improvements: [
        'The essay lacks detailed development of each view, with explanations too brief.',
      ],
      bandReason:
        'Main ideas are presented but lack sufficient development, explanation, and supporting evidence, leading to a limited response to the task.',
      selectedIssues: [],
    },
    CC: {
      strengths: [
        'Some examples like Facebook and Instagram are provided to illustrate points.',
      ],
      improvements: [
        'The conclusion does not effectively summarise or synthesise the discussion.',
      ],
      bandReason:
        'Very strong performance. All parts of the task are well-covered with clear development and relevant supporting evidence.',
      selectedIssues: [],
    },
    LR: {
      strengths: [],
      improvements: ['Main ideas are not clearly presented with topic sentences.'],
      bandReason:
        'Main ideas are presented but lack sufficient development, explanation, and supporting evidence, leading to a limited response to the task.',
      selectedIssues: [],
    },
    GRA: {
      strengths: [],
      improvements: [],
      bandReason:
        'Main ideas are presented but lack sufficient development, explanation, and supporting evidence, leading to a limited response to the task.',
      selectedIssues: [],
    },
  },
  feedbackItems: [
    {
      id: '1',
      text: 'The sentence is too vague and lacks development; it does not clearly address how technology affects communication, which is the main topic.',
      improvementExample:
        'For instance, social media allows people to connect instantly across continents, enhancing global interaction.',
      category: 'TR',
      checked: true,
      isAiGenerated: true,
      range: { start: 0, end: 43 },
    },
    {
      id: '2',
      text: 'The essay mentions both views but does not fully develop or compare them in depth, and lacks a clear, balanced discussion.',
      improvementExample:
        'While digital tools offer convenience, face-to-face interactions remain essential for deep emotional connection.',
      category: 'CC',
      checked: false,
      isAiGenerated: true,
      range: { start: 190, end: 231 },
    },
    {
      id: '3',
      text: 'The opinion is expressed, but the explanation is weak and not supported with detailed examples or analysis.',
      improvementExample:
        'In my view, technology is a double-edged sword that requires careful management to remain beneficial.',
      category: 'LR',
      checked: false,
      isAiGenerated: true,
      range: { start: 500, end: 574 },
    },
  ],
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export interface UseTeacherFeedbackParams {
  classId: number;
  taskHistoryId: number;
  gradingMode: 'ai' | 'self';
  taskTypeOverride?: 'task1' | 'task2';
}

export interface UseTeacherFeedbackReturn {
  // loading
  isLoading: boolean;
  error: string | null;
  data: TeacherFeedbackData | null;

  // editable data
  feedbackItems: FeedbackItem[];
  scores: CriterionScores;
  overallAssessment: OverallAssessment;
  criteria: Record<FeedbackCategory, CriterionFeedbackBlock>;

  // selection / inline-edit
  editingId: string | null;
  selectedId: string | null;
  recentId: string | null;
  isBulkEditing: boolean;

  // display
  fontSizeLevel: number;
  selectedFilters: FeedbackCategory[];
  isEditMode: boolean;

  // notifications / modals
  toast: { message: string; visible: boolean };
  deletingId: string | null;
  isConfirmationModalOpen: boolean;
  confirmationMode: 'normal' | 'prev' | 'next';
  isSaving: boolean;

  // computed
  overallBand: number;
  virtualExamSummary: {
    overallScore: number;
    task1Score: number;
    task2Score: number;
    completionTimeMinutes: string;
  } | null;

  // actions â€” feedback items
  handleEditRequest: (id: string) => void;
  handleDeleteRequest: (id: string) => void;
  confirmDelete: () => void;
  cancelDelete: () => void;
  handleUpdateFeedback: (
    id: string,
    text: string,
    example?: string,
    category?: FeedbackCategory,
  ) => void;
  handleBulkUpdateFeedback: (newItems: FeedbackItem[]) => void;
  handleAddNewFeedback: (start: number, end: number) => void;
  handleCancelNew: (id: string) => void;
  handleAddGeneralFeedback: () => void;
  setIsBulkEditing: (v: boolean) => void;

  // actions â€” scores / assessment
  handleScoreUpdate: (key: FeedbackCategory, value: number) => void;
  handleStrengthsUpdate: (category: FeedbackCategory, values: string[]) => void;
  handleImprovementsUpdate: (category: FeedbackCategory, values: string[]) => void;
  handleIssuesUpdate: (category: FeedbackCategory, issues: string[]) => void;
  handleAssessmentUpdate: (updated: OverallAssessment) => void;

  // actions â€” UI
  setSelectedId: (id: string | null) => void;
  setSelectedFilters: (filters: FeedbackCategory[]) => void;
  setIsEditMode: (on: boolean) => void;
  handleFontSizeChange: (delta: number) => void;
  setEditingId: (id: string | null) => void;

  // actions â€” submission
  openConfirmationModal: (mode: 'normal' | 'prev' | 'next') => void;
  closeConfirmationModal: () => void;
  handleSubmission: (rating: ConfirmationRating) => Promise<void>;
}

export function useTeacherFeedback(
  params: UseTeacherFeedbackParams,
): UseTeacherFeedbackReturn {
  const { classId, taskHistoryId, gradingMode, taskTypeOverride } = params;

  // â”€â”€ server state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TeacherFeedbackData | null>(null);
  const [taskHistoryResponse, setTaskHistoryResponse] = useState<any | null>(null);
  const [gradingItem, setGradingItem] = useState<any | null>(null);
  const [virtualExamSummary, setVirtualExamSummary] = useState<{
    overallScore: number;
    task1Score: number;
    task2Score: number;
    completionTimeMinutes: string;
  } | null>(null);

  // â”€â”€ editable data (initialised from data) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([]);
  const [scores, setScores] = useState<CriterionScores>({ TR: 6, CC: 6, LR: 6, GRA: 6 });
  const [overallAssessment, setOverallAssessment] = useState<OverallAssessment>({
    summary: '',
    specificSuggestions: [],
    nextSteps: [],
  });
  const [criteria, setCriteria] = useState<Record<FeedbackCategory, CriterionFeedbackBlock>>({
    TR: { strengths: [], improvements: [], bandReason: '', selectedIssues: [] },
    CC: { strengths: [], improvements: [], bandReason: '', selectedIssues: [] },
    LR: { strengths: [], improvements: [], bandReason: '', selectedIssues: [] },
    GRA: { strengths: [], improvements: [], bandReason: '', selectedIssues: [] },
  });

  // â”€â”€ selection / inline-edit â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [recentId, setRecentId] = useState<string | null>(null);
  const [isBulkEditing, setIsBulkEditing] = useState(false);

  // â”€â”€ display â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [fontSizeLevel, setFontSizeLevel] = useState(0);
  const [selectedFilters, setSelectedFilters] = useState<FeedbackCategory[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);

  // â”€â”€ notifications / modals â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({
    message: '',
    visible: false,
  });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [confirmationMode, setConfirmationMode] = useState<'normal' | 'prev' | 'next'>('normal');
  const [isSaving, setIsSaving] = useState(false);

  // â”€â”€ computed â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // For virtual exam (both tasks present), use legacy rounding; otherwise use IELTS standard
  const overallBand = taskHistoryResponse?.writingTask1 && taskHistoryResponse?.writingTask2
    ? calculateOverallBandFromScores(scores)
    : roundIeltsBand((scores.TR + scores.CC + scores.LR + scores.GRA) / 4);

  const deriveLoadedState = useCallback(
    (response: any, item: any, selectedTaskType?: 'task1' | 'task2') => {
      if (!response) return;

      let essayText = '';
      let taskTypeStr = 'task1';
      let wordCount = 0;
      let completionTimeSeconds = 0;
      let evaluations: any = [];
      let questionText = '';
      let imageUrl = '';

      const loadTask1 = () => {
        if (!response.writingTask1) return false;
        essayText = response.writingTask1.answer || '';
        questionText = response.writingTask1.question || '';
        imageUrl = (response.writingTask1 as any).imagePath || (response.writingTask1 as any).ImagePath || '';
        taskTypeStr = 'task1';
        wordCount = essayText.split(/\s+/).filter(Boolean).length;
        evaluations = response.writingTask1.evaluations || [];
        return true;
      };

      const loadTask2 = () => {
        if (!response.writingTask2) return false;
        essayText = response.writingTask2.answer || '';
        questionText = response.writingTask2.question || '';
        imageUrl = ''; // Task 2 has no image
        taskTypeStr = 'task2';
        wordCount = essayText.split(/\s+/).filter(Boolean).length;
        evaluations = response.writingTask2.evaluations || [];
        return true;
      };

      if (selectedTaskType === 'task1') {
        loadTask1() || loadTask2();
      } else if (selectedTaskType === 'task2') {
        loadTask2() || loadTask1();
      } else if (response.writingTask2) {
        loadTask2();
      } else if (response.writingTask1) {
        loadTask1();
      }

      const evaluation = evaluations.length > 0 ? evaluations[0] : null;

      if (response.completionTimeMinutes) {
        const timeParts = response.completionTimeMinutes.split(':');
        if (timeParts.length === 2 && !isNaN(Number(timeParts[0])) && !isNaN(Number(timeParts[1]))) {
          completionTimeSeconds = Number(timeParts[0]) * 60 + Number(timeParts[1]);
        } else if (!isNaN(Number(response.completionTimeMinutes))) {
          completionTimeSeconds = Number(response.completionTimeMinutes);
        }
      }

      const serverScores: CriterionScores = { TR: 0, CC: 0, LR: 0, GRA: 0 };
      const serverCriteria: Record<FeedbackCategory, CriterionFeedbackBlock> = {
        TR: { strengths: [], improvements: [], bandReason: '', selectedIssues: [] },
        CC: { strengths: [], improvements: [], bandReason: '', selectedIssues: [] },
        LR: { strengths: [], improvements: [], bandReason: '', selectedIssues: [] },
        GRA: { strengths: [], improvements: [], bandReason: '', selectedIssues: [] },
      };
      const serverFeedbackItems: FeedbackItem[] = [];

      if (evaluation?.criteriaScores) {
        evaluation.criteriaScores.forEach((cs: any, index: number) => {
          const orderedCat = CRITERION_ORDER[index];
          const cat = orderedCat ?? mapCriterionCategory(cs.criteriaName, index);

          serverScores[cat] = readCriterionScore(cs);
          serverCriteria[cat].bandReason = cs.bandReason || '';
          serverCriteria[cat].strengths = cs.strengths?.map((s: any) => s.strengthDescription) || [];
          serverCriteria[cat].improvements = cs.areasForImprovement?.map((i: any) => i.improvementDescription || i) || [];
          serverCriteria[cat].selectedIssues = [...serverCriteria[cat].improvements];

          if (cs.feedbackDetails) {
            cs.feedbackDetails.forEach((fd: any, i: number) => {
              let resolvedQuote = (fd.quote || '').trim();
              let parsedText = (fd.description || '').trim();
              let parsedExample = '';

              // Task 1 stores the excerpt inside description as `'quoted text' -> explanation`.
              // Task 2 uses a real fd.quote field. Handle both cases.
              if (!resolvedQuote && parsedText.includes(' -> ')) {
                const arrowIdx = parsedText.indexOf(' -> ');
                const beforeArrow = parsedText.slice(0, arrowIdx).trim();
                const afterArrow  = parsedText.slice(arrowIdx + 4).trim();

                // If the left side is a quoted excerpt (wrapped in single quotes or looks like
                // an essay snippet), use it as the highlight anchor.
                const isQuotedExcerpt =
                  (beforeArrow.startsWith("'") && beforeArrow.endsWith("'")) ||
                  essayText.includes(beforeArrow.replace(/^'+|'+$/g, ''));

                if (isQuotedExcerpt) {
                  // Strip surrounding single-quotes to get the raw excerpt
                  resolvedQuote = beforeArrow.replace(/^'+|'+$/g, '');
                  parsedText    = afterArrow;
                } else {
                  // Normal format: text -> improvement example
                  parsedText    = beforeArrow;
                  parsedExample = afterArrow;
                }
              } else if (parsedText.includes(' -> ')) {
                // fd.quote already set; description may still have an improvement hint
                const parts = parsedText.split(' -> ');
                parsedText    = parts[0].trim();
                parsedExample = parts.slice(1).join(' -> ').trim();
              }

              // Locate the highlight range from the resolved quote.
              // Use a more robust matching strategy (sentence-level and
              // normalized matching) so minor punctuation/whitespace
              // differences won't prevent highlights from appearing.
              let sIdx = 0;
              let eIdx = 0;
              const findRangeForQuote = (quote: string | undefined) => {
                if (!quote) return null;
                const trimmed = quote.trim();
                if (!trimmed) return null;

                // 0) Exact substring match
                const exact = essayText.indexOf(trimmed);
                if (exact !== -1) return { start: exact, end: exact + trimmed.length };

                // Build sentence list from essayText (lightweight, same approach as student view)
                const sentences = [] as { start: number; end: number; text: string; normalized: string }[];
                const paragraphs = essayText.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
                let globalOffset = 0;
                paragraphs.forEach((paragraph) => {
                  const paraIndex = essayText.indexOf(paragraph, globalOffset);
                  const actualOffset = paraIndex !== -1 ? paraIndex : globalOffset;
                  const parts = paragraph.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [paragraph];
                  let sentenceOffset = 0;
                  parts.forEach((raw) => {
                    const sentence = raw.trim();
                    if (!sentence) return;
                    const sentIndex = paragraph.indexOf(sentence, sentenceOffset);
                    const start = actualOffset + (sentIndex !== -1 ? sentIndex : sentenceOffset);
                    const end = start + sentence.length;
                    sentenceOffset = (sentIndex !== -1 ? sentIndex + sentence.length : sentenceOffset + sentence.length);
                    const normalized = sentence
                      .toLowerCase()
                      .replace(/[â€œâ€\"'`]/g, "")
                      .replace(/[^a-z0-9\s]/gi, " ")
                      .replace(/\s+/g, " ")
                      .trim();
                    sentences.push({ start, end, text: sentence, normalized });
                  });
                  globalOffset = actualOffset + paragraph.length;
                });

                // 1) Literal inclusion in a sentence
                const literal = sentences.find((s) => s.text.includes(trimmed));
                if (literal) return { start: literal.start, end: literal.end };

                // 2) Normalized exact match
                const normalizedQuote = trimmed
                  .toLowerCase()
                  .replace(/[â€œâ€\"'`]/g, "")
                  .replace(/[^a-z0-9\s]/gi, " ")
                  .replace(/\s+/g, " ")
                  .trim();
                if (normalizedQuote) {
                  const normExact = sentences.find((s) => s.normalized === normalizedQuote);
                  if (normExact) return { start: normExact.start, end: normExact.end };

                  const normContains = sentences.find((s) => s.normalized.includes(normalizedQuote));
                  if (normContains) return { start: normContains.start, end: normContains.end };

                  // 3) Fallback: find best overlap by words for longer quotes
                  const words = normalizedQuote.split(" ").filter(Boolean);
                  if (words.length > 5) {
                    let best: { sentence?: typeof sentences[0]; overlap: number } = { overlap: 0 } as any;
                    sentences.forEach((s) => {
                      const sWords = s.normalized.split(" ").filter(Boolean);
                      const overlap = words.filter((w) => sWords.includes(w)).length;
                      if (overlap > (best.overlap || 0)) best = { sentence: s, overlap } as any;
                    });
                    if (best && best.sentence && best.overlap >= Math.floor(words.length * 0.5)) {
                      return { start: best.sentence.start, end: best.sentence.end };
                    }
                  }
                }

                return null;
              };

              const found = findRangeForQuote(resolvedQuote);
              if (found) {
                sIdx = found.start;
                eIdx = found.end;
              }

              serverFeedbackItems.push({
                id: `server-${cat}-${i}`,
                text: parsedText,
                improvementExample: parsedExample || undefined,
                quote: resolvedQuote,
                category: cat,
                checked: false,
                isAiGenerated: true,
                range: sIdx !== eIdx ? { start: sIdx, end: eIdx } : undefined,
              });
            });
          }
        });
      }

      const mappedData: TeacherFeedbackData = {
        studentName: item?.studentName || 'Unknown Student',
        className: item?.className || 'Unknown Class',
        taskType: taskTypeStr as any,
        question: questionText,
        imageUrl,
        submittedAt: response.created || new Date().toISOString(),
        wordCount,
        completionTimeSeconds,
        essayText,
        scores: serverScores,
        overallAssessment: {
          summary: evaluation?.overallSummary || '',
          specificSuggestions: normalizeTextList(evaluation?.suggestions, [
            'suggestionDescription',
            'SuggestionDescription',
            'description',
            'text',
          ]),
          nextSteps: normalizeTextList(evaluation?.nextSteps, [
            'nextStepDescription',
            'NextStepDescription',
            'description',
            'text',
          ]),
        },
        criteria: serverCriteria,
        feedbackItems: serverFeedbackItems,
      };

      setData(mappedData);
      setFeedbackItems(mappedData.feedbackItems);
      setScores(mappedData.scores);
      setOverallAssessment(mappedData.overallAssessment);
      setCriteria(mappedData.criteria);

      if (response.writingTask1 && response.writingTask2) {
        const task1Score = response.score1 ?? response.writingTask1.evaluations?.[0]?.overallScore ?? 0;
        const task2Score = response.score2 ?? response.writingTask2.evaluations?.[0]?.overallScore ?? 0;
        const overall = calculateOverallBandFromScores(serverScores);

        setVirtualExamSummary({
          overallScore: overall,
          task1Score,
          task2Score,
          completionTimeMinutes: response.completionTimeMinutes || '00:00',
        });
      } else {
        setVirtualExamSummary(null);
      }
    },
    [],
  );

  // â”€â”€ load data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await ClassService.getTaskHistoryDetail(taskHistoryId);
        if (!isMounted) return;

        // Fetch graded items to get user info if possible (or default values)
        let item;
        try {
          const items = await ClassService.getClassGradingItems(classId);
          item = items.find((itm) => itm.taskHistoryId === taskHistoryId);
        } catch {
          // Ignore error finding grading item
        }
        setTaskHistoryResponse(response);
        setGradingItem(item ?? null);
        deriveLoadedState(
          response,
          item,
          taskTypeOverride,
        );

      } catch (e: any) {
        console.error(e);
        setError('KhÃ´ng thá»ƒ táº£i dá»¯ liá»‡u bÃ i viáº¿t tá»« mÃ¡y chá»§.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    
    loadData();

    return () => {
      isMounted = false;
    };
  }, [taskHistoryId, classId, deriveLoadedState]);

  useEffect(() => {
    if (!taskHistoryResponse) return;
    deriveLoadedState(taskHistoryResponse, gradingItem, taskTypeOverride);
  }, [taskHistoryResponse, gradingItem, taskTypeOverride, deriveLoadedState]);

  // clear recentId after 10s
  useEffect(() => {
    if (!recentId) return;
    const t = setTimeout(() => setRecentId(null), 10000);
    return () => clearTimeout(t);
  }, [recentId]);

  // â”€â”€ helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const showToast = useCallback((message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => setToast((p) => ({ ...p, visible: false })), 4000);
  }, []);

  // â”€â”€ feedback item actions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleEditRequest = useCallback((id: string) => {
    setEditingId(id);
    setSelectedId(id);
  }, []);

  const handleDeleteRequest = useCallback((id: string) => {
    setDeletingId(id);
  }, []);

  const confirmDelete = useCallback(() => {
    if (!deletingId) return;
    setFeedbackItems((prev) => prev.filter((i) => i.id !== deletingId));
    setSelectedId((prev) => (prev === deletingId ? null : prev));
    setEditingId((prev) => (prev === deletingId ? null : prev));
    setDeletingId(null);
  }, [deletingId]);

  const cancelDelete = useCallback(() => setDeletingId(null), []);

  const handleUpdateFeedback = useCallback(
    (id: string, text: string, example?: string, category?: FeedbackCategory) => {
      setFeedbackItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                text,
                improvementExample: example,
                category,
                isNew: false,
                checked: true,
                isAiGenerated: false,
              }
            : item,
        ),
      );
      setEditingId(null);
      if (category && selectedFilters.length > 0 && !selectedFilters.includes(category)) {
        setRecentId(id);
        showToast(
          `Nháº­n xÃ©t nÃ y thuá»™c tiÃªu chÃ­ ${category}. HÃ£y Ä‘iá»u chá»‰nh bá»™ lá»c Ä‘á»ƒ xem táº¥t cáº£ cÃ¡c má»¥c liÃªn quan.`,
        );
      }
    },
    [selectedFilters, showToast],
  );

  const handleBulkUpdateFeedback = useCallback((newItems: FeedbackItem[]) => {
    setFeedbackItems(newItems);
  }, []);

  const handleAddNewFeedback = useCallback((start: number, end: number) => {
    const newId = `new-${Date.now()}`;
    const quote = data?.essayText.substring(start, end) || '';
    const newItem: FeedbackItem = {
      id: newId,
      text: '',
      checked: false,
      isNew: true,
      isManual: true,
      isAiGenerated: false,
      range: { start, end },
      quote,
    };
    setFeedbackItems((prev) =>
      [...prev, newItem].sort((a, b) => (a.range?.start ?? 0) - (b.range?.start ?? 0)),
    );
    setEditingId(newId);
    setSelectedId(newId);
  }, []);

  const handleCancelNew = useCallback((id: string) => {
    setFeedbackItems((prev) => prev.filter((i) => i.id !== id));
    setEditingId(null);
    setSelectedId((prev) => (prev === id ? null : prev));
  }, []);

  const handleAddGeneralFeedback = useCallback(() => {
    const newId = `gen-${Date.now()}`;
    const newItem: FeedbackItem = {
      id: newId,
      text: '',
      checked: false,
      isNew: true,
      isManual: true,
      isAiGenerated: false,
    };
    setFeedbackItems((prev) => [newItem, ...prev]);
    setEditingId(newId);
    setSelectedId(newId);
  }, []);

  // â”€â”€ scores / assessment actions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleScoreUpdate = useCallback((key: FeedbackCategory, value: number) => {
    setScores((prev) => ({ ...prev, [key]: Math.floor(value) }));
  }, []);

  const handleStrengthsUpdate = useCallback(
    (category: FeedbackCategory, values: string[]) => {
      setCriteria((prev) => ({
        ...prev,
        [category]: { ...prev[category], strengths: values },
      }));
    },
    [],
  );

  const handleImprovementsUpdate = useCallback(
    (category: FeedbackCategory, values: string[]) => {
      setCriteria((prev) => ({
        ...prev,
        [category]: { ...prev[category], improvements: values },
      }));
    },
    [],
  );

  const handleIssuesUpdate = useCallback(
    (category: FeedbackCategory, issues: string[]) => {
      setCriteria((prev) => ({
        ...prev,
        [category]: {
          ...prev[category],
          selectedIssues: issues,
          // Keep improvements in sync so all student feedback screens read the same saved data.
          improvements: issues,
        },
      }));
    },
    [],
  );

  const handleAssessmentUpdate = useCallback((updated: OverallAssessment) => {
    setOverallAssessment(updated);
  }, []);

  // â”€â”€ UI actions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleFontSizeChange = useCallback((delta: number) => {
    setFontSizeLevel((prev) => Math.max(-2, Math.min(2, prev + delta)));
  }, []);

  // â”€â”€ submission â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const openConfirmationModal = useCallback((mode: 'normal' | 'prev' | 'next') => {
    setConfirmationMode(mode);
    setIsConfirmationModalOpen(true);
  }, []);

  const closeConfirmationModal = useCallback(() => {
    setIsConfirmationModalOpen(false);
  }, []);

  const handleSubmission = useCallback(
    async (rating: ConfirmationRating) => {
      setIsSaving(true);
      try {
        const targetTaskType = (data?.taskType ?? 'task2') as 'task1' | 'task2';
        
        const payload = {
          overallBand,
          criteria: {
            TR: {
              bandScore: scores.TR,
              feedbackDetail: feedbackItems.filter(i => i.category === 'TR').map(i => ({ quote: i.quote || (i.range && data?.essayText ? data.essayText.substring(i.range.start, i.range.end) : ''), description: i.improvementExample ? `${i.text} -> ${i.improvementExample}` : i.text })),
              strengths: criteria.TR.strengths,
              areasForImprovement: criteria.TR.improvements,
              bandReason: criteria.TR.bandReason,
            },
            CC: {
              bandScore: scores.CC,
              feedbackDetail: feedbackItems.filter(i => i.category === 'CC').map(i => ({ quote: i.quote || (i.range && data?.essayText ? data.essayText.substring(i.range.start, i.range.end) : ''), description: i.improvementExample ? `${i.text} -> ${i.improvementExample}` : i.text })),
              strengths: criteria.CC.strengths,
              areasForImprovement: criteria.CC.improvements,
              bandReason: criteria.CC.bandReason,
            },
            LR: {
              bandScore: scores.LR,
              feedbackDetail: feedbackItems.filter(i => i.category === 'LR').map(i => ({ quote: i.quote || (i.range && data?.essayText ? data.essayText.substring(i.range.start, i.range.end) : ''), description: i.improvementExample ? `${i.text} -> ${i.improvementExample}` : i.text })),
              strengths: criteria.LR.strengths,
              areasForImprovement: criteria.LR.improvements,
              bandReason: criteria.LR.bandReason,
            },
            GRA: {
              bandScore: scores.GRA,
              feedbackDetail: feedbackItems.filter(i => i.category === 'GRA').map(i => ({ quote: i.quote || (i.range && data?.essayText ? data.essayText.substring(i.range.start, i.range.end) : ''), description: i.improvementExample ? `${i.text} -> ${i.improvementExample}` : i.text })),
              strengths: criteria.GRA.strengths,
              areasForImprovement: criteria.GRA.improvements,
              bandReason: criteria.GRA.bandReason,
            },
          },
          overallAssessment: {
            summary: overallAssessment.summary,
            specificSuggestions: overallAssessment.specificSuggestions,
            nextSteps: overallAssessment.nextSteps,
          }
        };

        if (data?.taskType) {
          await ClassService.updateTeacherGradingEvaluation(
            classId,
            taskHistoryId,
            targetTaskType,
            payload as any
          );
        }
        
        /* Submit AI rating if collected - currently not fully integrated in ClassService
        if (gradingMode === 'ai' && (rating.aiScore > 0 || rating.teacherConfidence > 0)) {
           await ClassService.submitAiRatingAsync(taskHistoryId, {
              aiFeedbackRating: rating.aiScore,
              teacherConfidenceRating: rating.teacherConfidence
           }).catch(() => null); 
        }
        */

        showToast('ÄÃ£ lÆ°u Ä‘Ã¡nh giÃ¡ thÃ nh cÃ´ng!');
        setIsConfirmationModalOpen(false);
      } catch {
        showToast('CÃ³ lá»—i xáº£y ra, vui lÃ²ng thá»­ láº¡i.');
      } finally {
        setIsSaving(false);
      }
    },
    [classId, taskHistoryId, data?.taskType, gradingMode, showToast, overallBand, scores, criteria, overallAssessment, feedbackItems],
  );

  return {
    virtualExamSummary,
    isLoading,
    error,
    data,
    feedbackItems,
    scores,
    overallAssessment,
    criteria,
    editingId,
    selectedId,
    recentId,
    isBulkEditing,
    fontSizeLevel,
    selectedFilters,
    isEditMode,
    toast,
    deletingId,
    isConfirmationModalOpen,
    confirmationMode,
    isSaving,
    overallBand,
    handleEditRequest,
    handleDeleteRequest,
    confirmDelete,
    cancelDelete,
    handleUpdateFeedback,
    handleBulkUpdateFeedback,
    handleAddNewFeedback,
    handleCancelNew,
    handleAddGeneralFeedback,
    setIsBulkEditing,
    handleScoreUpdate,
    handleStrengthsUpdate,
    handleImprovementsUpdate,
    handleIssuesUpdate,
    handleAssessmentUpdate,
    setSelectedId,
    setSelectedFilters,
    setIsEditMode,
    handleFontSizeChange,
    setEditingId,
    openConfirmationModal,
    closeConfirmationModal,
    handleSubmission,
  };
}


