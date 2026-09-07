import React, { useState } from "react";
import Dialog from '../ui/Dialog';
import Button from '../ui/Button';
import { X } from "lucide-react";
import { classService as ClassService } from '../../services/classService';
import { useToast } from '../ui/Toast';

interface TeacherAiRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  gradingMode?: "ai" | "self";
  onSubmit: (data: { aiFeedbackRating: number; teacherConfidenceRating: number; isNextTask: boolean }) => void;
}

export function TeacherAiRatingModal({
  isOpen,
  onClose,
  gradingMode = "ai",
  onSubmit,
}: TeacherAiRatingModalProps) {
  const [aiFeedbackRating, setAiFeedbackRating] = useState<number>(0);
  const [teacherConfidenceRating, setTeacherConfidenceRating] = useState<number>(0);
  const isSelfGrading = gradingMode === "self";

  React.useEffect(() => {
    if (!isOpen) {
      return;
    }

    setAiFeedbackRating(0);
    setTeacherConfidenceRating(0);
  }, [isOpen, gradingMode]);

  const handleRatingSubmit = (isNextTask: boolean) => {
    if (isSelfGrading) {
      if (teacherConfidenceRating === 0) {
        alert("Vui lÃ²ng chá»n má»©c Ä‘á»™ tá»± tin trÆ°á»›c khi gá»­i.");
        return;
      }
    } else if (aiFeedbackRating === 0 || teacherConfidenceRating === 0) {
      alert("Vui lÃ²ng Ä‘Ã¡nh giÃ¡ cáº£ hai má»¥c trÆ°á»›c khi gá»­i.");
      return;
    }

    onSubmit({
      aiFeedbackRating: isSelfGrading ? 0 : aiFeedbackRating,
      teacherConfidenceRating,
      isNextTask,
    });
  };

  const RatingCircles = ({
    value,
    onChange
  }: {
    value: number;
    onChange: (val: number) => void
  }) => (
    <div className="flex items-center justify-center gap-4 sm:gap-6 py-4">
      {[1, 2, 3, 4, 5].map((num) => (
        <div key={num} className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => onChange(num)}
            className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 transition-all flex items-center justify-center ${value === num
                ? "border-[#1fb2aa] bg-[#1fb2aa]/10 ring-2 ring-[#1fb2aa]/20"
                : "border-gray-400 hover:border-[#1fb2aa]/50"
              }`}
          >
            {value === num && (
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-[#1fb2aa]" />
            )}
          </button>
          <span className="text-xs font-medium text-gray-600">{num}</span>
        </div>
      ))}
    </div>
  );

  return (
    <Dialog open={isOpen} onClose={() => {}}>
      
        <div className="bg-[#f3f4f6] px-6 py-4 flex items-center justify-between border-b">
          <h3 className="text-base font-bold">
            XÃ¡c nháº­n bÃ i cháº¥m
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 space-y-8 bg-white">
          <div className="space-y-4">
            <p className="text-[17px] font-bold text-slate-800 leading-relaxed italic">
              {isSelfGrading
                ? "1. Báº¡n hÃ£y cho biáº¿t má»©c Ä‘á»™ tá»± tin cá»§a báº£n thÃ¢n Ä‘á»‘i vá»›i ná»™i dung tá»± cháº¥m cá»§a báº¡n?"
                : "1. Báº¡n Ä‘Ã¡nh giÃ¡ ná»™i dung feedback cá»§a AI cho bÃ i writing nÃ y Ä‘áº¡t bao nhiÃªu Ä‘iá»ƒm?"}
            </p>
            <div className="relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-bold italic">Tháº¥p</div>
              <div className="px-10">
                <RatingCircles
                  value={isSelfGrading ? teacherConfidenceRating : aiFeedbackRating}
                  onChange={isSelfGrading ? setTeacherConfidenceRating : setAiFeedbackRating}
                />
              </div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-bold italic">Cao</div>
            </div>
          </div>

          {!isSelfGrading && (
            <div className="space-y-4">
              <p className="text-[17px] font-bold text-slate-800 leading-relaxed italic">
                2. Báº¡n hÃ£y cho biáº¿t má»©c Ä‘á»™ tá»± tin cá»§a báº£n thÃ¢n Ä‘á»‘i vá»›i ná»™i dung sá»­a bÃ i cháº¥m AI cá»§a báº¡n?
              </p>
              <div className="relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-bold italic">Tháº¥p</div>
                <div className="px-10">
                  <RatingCircles value={teacherConfidenceRating} onChange={setTeacherConfidenceRating} />
                </div>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-bold italic">Cao</div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-[#f3f4f6] px-6 py-6 flex flex-wrap items-center justify-end gap-3 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            className="h-12 px-8 bg-transparent border-gray-300 text-gray-700 hover:bg-gray-100 font-bold rounded-lg shadow-sm"
          >
            Huá»·
          </Button>
          <Button
            variant="outline"
            onClick={() => handleRatingSubmit(false)}
            className="h-12 px-8 bg-transparent border-[#1fb2aa] text-[#1fb2aa] hover:bg-[#1fb2aa]/5 font-bold rounded-lg shadow-sm"
          >
            Gá»­i
          </Button>
          <Button
            onClick={() => handleRatingSubmit(true)}
            className="h-12 px-8 bg-[#1fb2aa] hover:bg-[#18958f] text-white font-bold rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 active:scale-95"
          >
            Gá»­i & BÃ i káº¿ tiáº¿p
          </Button>
        </div>
      
    </Dialog>
  );
}

interface TeacherCompletionSectionProps {
  taskHistoryId: number;
  gradingMode?: "ai" | "self";
  onNextTask?: () => void;
  onBeforeSubmit?: () => Promise<void> | void;
  className?: string;
}

export function TeacherCompletionSection({
  taskHistoryId,
  gradingMode = "ai",
  onNextTask,
  onBeforeSubmit,
  className = "",
}: TeacherCompletionSectionProps) {
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const { toast } = useToast();

  const handleRatingSubmit = async (data: {
    aiFeedbackRating: number;
    teacherConfidenceRating: number;
    isNextTask: boolean;
  }) => {
    try {
      if (onBeforeSubmit) {
        await onBeforeSubmit();
      }

      await ClassService.submitAiRating(taskHistoryId, {
        aiFeedbackRating: data.aiFeedbackRating,
        teacherConfidenceRating: data.teacherConfidenceRating,
      });

      const successMessage = gradingMode === "self"
        ? "ÄÃ£ lÆ°u Ä‘Ã¡nh giÃ¡ thÃ nh cÃ´ng."
        : "ÄÃ£ lÆ°u Ä‘Ã¡nh giÃ¡ AI thÃ nh cÃ´ng.";

      toast({
        title: "ThÃ nh cÃ´ng",
        description: successMessage,
      });

      setIsRatingModalOpen(false);

      if (data.isNextTask && onNextTask) {
        onNextTask();
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast({
        variant: "destructive",
        title: "Lá»—i",
        description: "KhÃ´ng thá»ƒ gá»­i Ä‘Ã¡nh giÃ¡. Vui lÃ²ng thá»­ láº¡i sau.",
      });
    }
  };

  return (
    <div className={`flex flex-col items-center py-16 mt-8 border-t border-gray-100 ${className}`}>
      <Button
        onClick={() => setIsRatingModalOpen(true)}
        className="bg-[#1fb2aa] hover:bg-[#18958f] text-white px-16 py-8 text-xl font-extrabold rounded-xl shadow-[0_10px_20px_-5px_rgba(31,178,170,0.3)] hover:shadow-[0_15px_25px_-5px_rgba(31,178,170,0.4)] transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0 active:scale-95"
      >
        HoÃ n thÃ nh
      </Button>

      <TeacherAiRatingModal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        gradingMode={gradingMode}
        onSubmit={handleRatingSubmit}
      />
    </div>
  );
}


