import React, { useState } from 'react';
import { X } from 'lucide-react';
import { type ConfirmationRating } from './types';

interface ConfirmationModalProps {
  isOpen: boolean;
  gradingMode: 'ai' | 'self';
  onClose: () => void;
  onSubmit: (rating: ConfirmationRating, mode: 'normal' | 'prev' | 'next') => void;
  isSaving: boolean;
  submitMode: 'normal' | 'prev' | 'next';
}

const RatingScale: React.FC<{ label: string; name: string; value: number; onChange: (v: number) => void }> = ({
  label,
  name,
  value,
  onChange,
}) => (
  <div className="space-y-4">
    <p className="text-[15px] font-medium text-slate-700 leading-relaxed">{label}</p>
    <div className="flex justify-between items-center max-w-xs mx-auto">
      <span className="text-xs text-slate-400 font-medium">Tháº¥p</span>
      <div className="flex gap-4">
        {[1, 2, 3, 4, 5].map((num) => (
          <label key={num} className="flex flex-col items-center gap-2 cursor-pointer group">
            <input
              type="radio"
              name={name}
              value={num}
              checked={value === num}
              onChange={() => onChange(num)}
              className="w-5 h-5 border-slate-300 text-[#1fb2aa] focus:ring-[#1fb2aa]"
            />
            <span className="text-xs text-slate-500 font-medium group-hover:text-[#1fb2aa]">
              {num}
            </span>
          </label>
        ))}
      </div>
      <span className="text-xs text-slate-400 font-medium">Cao</span>
    </div>
  </div>
);

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  gradingMode,
  onClose,
  onSubmit,
  isSaving,
  submitMode,
}) => {
  const [aiFeedbackRating, setAiFeedbackRating] = useState(0);
  const [teacherConfidenceRating, setTeacherConfidenceRating] = useState(0);

  if (!isOpen) return null;

  const handleSubmit = () => {
    onSubmit({ aiFeedbackRating, teacherConfidenceRating }, submitMode);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-800">XÃ¡c nháº­n bÃ i cháº¥m</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>
        </div>
        <div className="p-8 space-y-10">
          <RatingScale
            label="1. Báº¡n Ä‘Ã¡nh giÃ¡ ná»™i dung feedback cá»§a AI cho bÃ i writing nÃ y Ä‘áº¡t bao nhiÃªu Ä‘iá»ƒm?"
            name="ai-feedback-rating"
            value={aiFeedbackRating}
            onChange={setAiFeedbackRating}
          />
          <RatingScale
            label="2. Báº¡n hÃ£y cho biáº¿t má»©c Ä‘á»™ tá»± tin cá»§a báº£n thÃ¢n Ä‘á»‘i vá»›i ná»™i dung sá»­a bÃ i cháº¥m AI cá»§a báº¡n?"
            name="teacher-confidence-rating"
            value={teacherConfidenceRating}
            onChange={setTeacherConfidenceRating}
          />
        </div>
        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-6 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-100 transition-all disabled:opacity-50"
          >
            Huá»·
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="px-10 py-2.5 rounded-xl bg-[#1fb2aa] text-white font-bold text-sm hover:bg-[#1a9b94] shadow-md hover:shadow-lg transform active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Äang gá»­i...' : 'Gá»­i'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;

