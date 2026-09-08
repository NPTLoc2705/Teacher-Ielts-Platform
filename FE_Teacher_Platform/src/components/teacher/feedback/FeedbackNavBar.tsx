import React from 'react';
import { ChevronLeft, Edit3 } from 'lucide-react';

interface FeedbackNavBarProps {
  onBack: () => void;
  backLabel?: string;
}

const FeedbackNavBar: React.FC<FeedbackNavBarProps> = ({
  onBack,
  backLabel = 'Trở lại',
}) => {
  return (
    <nav className="bg-[#183a68] text-white py-3.5 px-6 sticky top-0 z-50 border-b border-[#0f2a4a]">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img
            src="/logo w-04.png"
            alt="Wispace Logo"
            className="h-7 w-auto object-contain shrink-0"
          />
          <span className="font-bold text-lg tracking-tight">Wispace Feedback</span>
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

