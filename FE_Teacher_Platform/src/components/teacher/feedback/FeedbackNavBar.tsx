import React from 'react';
import { ChevronLeft, Edit3 } from 'lucide-react';

interface FeedbackNavBarProps {
  onBack: () => void;
  backLabel?: string;
}

const FeedbackNavBar: React.FC<FeedbackNavBarProps> = ({
  onBack,
  backLabel = 'Trá»Ÿ láº¡i',
}) => {
  return (
    <nav className="bg-[#004d4d] text-white py-4 px-6 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Edit3 className="text-[#1fb2aa] w-8 h-8" />
          <span className="font-bold text-xl tracking-tight">Writing AI-Hub</span>
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors group"
        >
          <ChevronLeft className="group-hover:-translate-x-1 transition-transform" size={18} />
          <span className="font-medium text-sm">{backLabel}</span>
        </button>
      </div>
    </nav>
  );
};

export default FeedbackNavBar;

