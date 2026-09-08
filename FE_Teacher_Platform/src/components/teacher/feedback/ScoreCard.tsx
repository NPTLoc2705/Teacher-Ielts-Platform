import React from 'react';
import { type CriterionScores, type FeedbackCategory } from './types';

interface ScoreItemProps {
  label: string;
  score: number;
  isEditable: boolean;
  onScoreChange: (val: number) => void;
}

const ScoreItem: React.FC<ScoreItemProps> = ({ label, score, isEditable, onScoreChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === '' || raw.includes('.')) return;
    let val = parseInt(raw, 10);
    if (isNaN(val)) return;
    val = Math.max(0, Math.min(9, Math.floor(val)));
    onScoreChange(val);
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="font-semibold text-sm text-slate-700">{label}</span>
        {isEditable ? (
          <input
            type="number"
            step="1"
            min="0"
            max="9"
            value={score}
            onChange={handleChange}
            onKeyDown={(e) => {
              if (e.key === '.' || e.key === ',') e.preventDefault();
            }}
            className="w-16 h-8 text-center text-[#1fb2aa] font-bold border border-slate-200 rounded-md focus:ring-1 focus:ring-[#1fb2aa] outline-none"
          />
        ) : (
          <span className="text-[#1fb2aa] font-bold">{score.toFixed(0)}</span>
        )}
      </div>
      <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#1fb2aa] transition-all duration-500 ease-out"
          style={{ width: `${(score / 9) * 100}%` }}
        />
      </div>
    </div>
  );
};

const SCORE_LABELS: Array<{ key: FeedbackCategory; label: string }> = [
  { key: 'TR', label: 'Task Response' },
  { key: 'CC', label: 'Coherence & Cohesion' },
  { key: 'LR', label: 'Lexical Resource' },
  { key: 'GRA', label: 'Grammatical Range & Accuracy' },
];

interface ScoreCardProps {
  scores: CriterionScores;
  overallBand: number;
  onScoreUpdate: (key: FeedbackCategory, value: number) => void;
  isEditable: boolean;
}

const ScoreCard: React.FC<ScoreCardProps> = ({ scores, overallBand, onScoreUpdate, isEditable }) => {
  return (
    <div className="bg-white border border-slate-200 p-6 rounded-lg h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-slate-800">Score Breakdown</h2>
      </div>
      <div className="space-y-6">
        {SCORE_LABELS.map(({ key, label }) => (
          <ScoreItem
            key={key}
            label={label}
            score={scores[key]}
            isEditable={isEditable}
            onScoreChange={(v) => onScoreUpdate(key, v)}
          />
        ))}
      </div>
      <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center">
        <div className="flex flex-col">
          <span className="text-xl font-bold text-slate-800">Overall Band Score</span>
          <span className="text-[10px] text-slate-400 uppercase font-semibold">
            IELTS Rounding Applied
          </span>
        </div>
        <span className="text-4xl font-bold text-[#183a68]">{overallBand.toFixed(1)}</span>
      </div>
    </div>
  );
};

export default ScoreCard;

