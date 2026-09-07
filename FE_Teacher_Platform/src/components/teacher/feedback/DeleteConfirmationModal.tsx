import React from 'react';
import { AlertCircle } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
        onClick={onCancel}
      />
      <div className="relative bg-white w-full max-w-sm rounded-xl shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in fade-in duration-200">
        <div className="p-6 text-center">
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="text-red-500" size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">XÃ¡c nháº­n xoÃ¡ nháº­n xÃ©t?</h3>
          <p className="text-sm text-slate-500">
            HÃ nh Ä‘á»™ng nÃ y khÃ´ng thá»ƒ hoÃ n tÃ¡c. Báº¡n cÃ³ cháº¯c cháº¯n muá»‘n xoÃ¡ nháº­n xÃ©t nÃ y khÃ´ng?
          </p>
        </div>
        <div className="p-4 bg-slate-50 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-bold text-sm hover:bg-white transition-all"
          >
            Huá»·
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-all shadow-sm"
          >
            XÃ¡c nháº­n xoÃ¡
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;

