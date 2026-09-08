import React, { useState } from 'react';
import { Info, ChevronDown } from 'lucide-react';
import { type OverallAssessment } from './types';

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function getFontSizePx(level: number): string {
  switch (level) {
    case -2: return '10px';
    case -1: return '12px';
    case  1: return '16px';
    case  2: return '18px';
    default: return '14px';
  }
}

interface AssessmentCardProps {
  assessment: OverallAssessment;
  wordCount: number;
  completionTimeSeconds: number;
  onAssessmentChange: (updated: OverallAssessment) => void;
  isEditable: boolean;
  fontSizeLevel: number;
}

const AssessmentCard: React.FC<AssessmentCardProps> = ({
  assessment,
  wordCount,
  completionTimeSeconds,
  onAssessmentChange,
  isEditable,
  fontSizeLevel,
}) => {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (key: string) => {
    setOpenSection((prev) => (prev === key ? null : key));
  };

  const sections: Array<{ key: keyof OverallAssessment; label: string }> = [
    { key: 'summary', label: 'Summary' },
    { key: 'specificSuggestions', label: 'Specific Suggestions' },
    { key: 'nextSteps', label: 'Next Steps' },
  ];

  const fs = getFontSizePx(fontSizeLevel);

  const renderContent = (key: keyof OverallAssessment) => {
    const value = assessment[key];
    if (typeof value === 'string') {
      if (isEditable) {
        return (
          <textarea
            value={value}
            onChange={(e) => onAssessmentChange({ ...assessment, [key]: e.target.value })}
            style={{ fontSize: fs }}
            className="w-full min-h-[80px] text-slate-600 bg-white border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-[#1fb2aa] resize-none"
          />
        );
      }
      return <p style={{ fontSize: fs }} className="text-slate-600 leading-relaxed">{value}</p>;
    }

    // array
    if (isEditable) {
      return (
        <textarea
          value={(value as string[]).join('\n')}
          onChange={(e) =>
            onAssessmentChange({
              ...assessment,
              [key]: e.target.value.split('\n').filter((l) => l.trim() !== ''),
            })
          }
          style={{ fontSize: fs }}
          className="w-full min-h-[80px] text-slate-600 bg-white border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-[#1fb2aa] resize-none"
          placeholder="Má»—i dÃ²ng má»™t má»¥c..."
        />
      );
    }
    return (
      <ul className="list-disc list-inside space-y-1">
        {(value as string[]).map((item, i) => (
          <li key={i} style={{ fontSize: fs }} className="text-slate-600 leading-relaxed">
            {item}
          </li>
        ))}
        {(value as string[]).length === 0 && (
          <li style={{ fontSize: fs }} className="text-slate-400 italic">ChÆ°a cÃ³ ná»™i dung.</li>
        )}
      </ul>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 p-6 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-slate-800">Overall Assessment:</h2>
          <span className="text-slate-400 text-xs flex items-center gap-1 italic">
            <Info size={14} /> KhÃ´ng thá»ƒ chá»‰nh sá»­a ná»™i dung nÃ y
          </span>
        </div>
        <div className="space-y-3">
          {sections.map(({ key, label }) => (
            <details
              key={key}
              open={openSection === key}
              onToggle={(e) => {
                if ((e.target as HTMLDetailsElement).open) {
                  setOpenSection(key);
                } else if (openSection === key) {
                  setOpenSection(null);
                }
              }}
              className="group border border-slate-100 rounded-lg"
            >
              <summary className="p-3 cursor-pointer flex justify-between items-center text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors list-none">
                {label}
                <ChevronDown className="w-4 h-4 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="p-3 pt-0">{renderContent(key)}</div>
            </details>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200 p-6 rounded-lg">
        <h2 className="text-lg font-bold text-center mb-6 text-slate-800">Writing Statistic</h2>
        <div className="flex justify-around items-center">
          <div className="text-center">
            <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider font-semibold">
              Word Count
            </p>
            <p className="text-3xl font-bold text-slate-800">{wordCount}</p>
          </div>
          <div className="w-px h-12 bg-slate-200" />
          <div className="text-center">
            <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider font-semibold">
              Completion Time
            </p>
            <p className="text-3xl font-bold text-slate-800">
              {formatTime(completionTimeSeconds)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentCard;

