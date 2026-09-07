import React, { useState, useRef, useEffect } from 'react';
import {
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  Star,
  Save,
  X,
  Edit2,
  Trash2,
} from 'lucide-react';
import { type FeedbackItem, type FeedbackCategory, type CriterionFeedbackBlock, type CriterionScores } from './types';
import { TASK1_ISSUES_BY_CATEGORY, TASK2_ISSUES_BY_CATEGORY, TASK1_STRENGTHS_BY_CATEGORY, TASK2_STRENGTHS_BY_CATEGORY, EMPTY_STRENGTHS_BY_CATEGORY, TASK1_BAND_REASONS_BY_CATEGORY, TASK2_BAND_REASONS_BY_CATEGORY } from './presets.ts';

// â”€â”€â”€ Constants (strengths/weaknesses moved to ./presets) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const CATEGORY_COLORS: Record<
  FeedbackCategory,
  { bg: string; text: string; border: string; accent: string }
> = {
  TR:  { bg: 'bg-[#ccf2ff]', text: 'text-[#004d66]', border: 'border-[#b3e0ff]', accent: 'bg-[#00bfff]' },
  CC:  { bg: 'bg-[#dbeafe]', text: 'text-[#1e40af]', border: 'border-[#bfdbfe]', accent: 'bg-[#3b82f6]' },
  LR:  { bg: 'bg-[#e9d5ff]', text: 'text-[#581c87]', border: 'border-[#d8b4fe]', accent: 'bg-[#a855f7]' },
  GRA: { bg: 'bg-[#fef9c3]', text: 'text-[#713f12]', border: 'border-[#fde68a]', accent: 'bg-[#eab308]' },
};

const CATEGORY_FULL_NAMES: Record<FeedbackCategory, string> = {
  TR:  'Task Response',
  CC:  'Coherence & Cohesion',
  LR:  'Lexical Resource',
  GRA: 'Grammar & Accuracy',
};

function getFontSizePx(level: number): string {
  switch (level) {
    case -2: return '10px';
    case -1: return '12px';
    case  1: return '16px';
    case  2: return '18px';
    default: return '14px';
  }
}

function getReasonText(score: number, taskType?: string, category?: FeedbackCategory): string {
  const band = Math.max(0, Math.min(9, Math.floor(score)));
  if (category) {
    if (taskType === 'task1') {
      const txt = TASK1_BAND_REASONS_BY_CATEGORY[category]?.[band];
      if (txt) return txt;
    }
    if (taskType === 'task2') {
      const txt = TASK2_BAND_REASONS_BY_CATEGORY[category]?.[band];
      if (txt) return txt;
    }
  }

 
  return 'The response barely addresses the prompt and contains significant inaccuracies.';
}

// â”€â”€â”€ Detailed feedback list (left column) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface DetailedFeedbackProps {
  items: FeedbackItem[];
  editingId: string | null;
  selectedId: string | null;
  recentId: string | null;
  isEditMode: boolean;
  isBulkEditing: boolean;
  selectedFilters: FeedbackCategory[];
  fontSizeLevel: number;
  onSelectItem: (id: string | null) => void;
  onEditRequest: (id: string) => void;
  onDeleteRequest: (id: string) => void;
  onUpdateFeedback: (id: string, text: string, example?: string, category?: FeedbackCategory) => void;
  onBulkUpdateFeedback: (newItems: FeedbackItem[]) => void;
  onCancelNew: (id: string) => void;
  onAddGeneralFeedback: () => void;
  setEditingId: (id: string | null) => void;
  setIsBulkEditing: (v: boolean) => void;
  setSelectedFilters: (f: FeedbackCategory[]) => void;
}

const DetailedFeedbackPanel: React.FC<DetailedFeedbackProps> = ({
  items, editingId, selectedId, recentId, isEditMode, isBulkEditing,
  selectedFilters, fontSizeLevel,
  onSelectItem, onEditRequest, onDeleteRequest, onUpdateFeedback,
  onBulkUpdateFeedback, onCancelNew, onAddGeneralFeedback,
  setEditingId, setIsBulkEditing, setSelectedFilters,
}) => {
  const [editDraft, setEditDraft] = useState<{ text: string; example: string; category?: FeedbackCategory }>({ text: '', example: '' });
  const [bulkDrafts, setBulkDrafts] = useState<Record<string, { text: string; example: string; category?: FeedbackCategory }>>({});
  const [contextMenu, setContextMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Force font-size on text elements with !important â€” defeats global
  // `p, span, div { font-size: 0.92rem }` and `.text-sm/.text-xs { ... !important }`
  // rules in index.css. Only nodes flagged with data-fs-target are scaled,
  // so labels, badges, and chips keep their natural Tailwind sizes.
  useEffect(() => {
    const root = panelRef.current;
    if (!root) return;
    const px = getFontSizePx(fontSizeLevel);
    root.querySelectorAll<HTMLElement>('[data-fs-target]').forEach((el) => {
      el.style.setProperty('font-size', px, 'important');
    });
  }, [fontSizeLevel, items, editingId, isBulkEditing, selectedFilters]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setContextMenu(null);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => {
    if (editingId) {
      const item = items.find((i) => i.id === editingId);
      if (item) setEditDraft({ text: item.text, example: item.improvementExample ?? '', category: item.category });
    }
  }, [editingId, items]);

  useEffect(() => {
    if (selectedId) {
      const selectedItem = items.find((item) => item.id === selectedId);
      if (selectedItem?.isNew) return;
      const el = document.getElementById(`tf-feedback-${selectedId}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
  }, [selectedId, items]);

  const startBulkEdit = () => {
    const drafts: typeof bulkDrafts = {};
    items.forEach((i) => { drafts[i.id] = { text: i.text, example: i.improvementExample ?? '', category: i.category }; });
    setBulkDrafts(drafts);
    setIsBulkEditing(true);
  };

  const cancelBulkEdit = () => { setIsBulkEditing(false); setBulkDrafts({}); setEditingId(null); };

  const saveBulkEdit = () => {
    const allHaveCat = items.every((item) => !!(bulkDrafts[item.id]?.category ?? item.category));
    if (!allHaveCat) { alert('Vui lÃ²ng chá»n tiÃªu chÃ­ cho táº¥t cáº£ cÃ¡c nháº­n xÃ©t.'); return; }
    const updated = items.map((item) => {
      const draft = bulkDrafts[item.id];
      const changed = draft && (draft.text !== item.text || draft.example !== (item.improvementExample ?? '') || draft.category !== item.category);
      return { ...item, text: draft?.text ?? item.text, improvementExample: draft?.example ?? item.improvementExample, category: draft?.category ?? item.category, checked: true, isAiGenerated: changed ? false : item.isAiGenerated };
    });
    onBulkUpdateFeedback(updated);
    setIsBulkEditing(false);
  };

  const handleSingleSave = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const text = isBulkEditing ? bulkDrafts[id]?.text : editDraft.text;
    const example = isBulkEditing ? bulkDrafts[id]?.example : editDraft.example;
    const category = isBulkEditing ? bulkDrafts[id]?.category : editDraft.category;
    if (!category) { alert('Vui lÃ²ng chá»n má»™t tiÃªu chÃ­ (TR, CC, LR, GRA).'); return; }
    if (!text?.trim()) { alert('TrÆ°á»ng "Nháº­n xÃ©t" lÃ  báº¯t buá»™c.'); return; }
    onUpdateFeedback(id, text, example, category);
  };

  const toggleFilter = (cat: FeedbackCategory) => {
    setSelectedFilters(
      selectedFilters.includes(cat)
        ? selectedFilters.filter((f) => f !== cat)
        : [...selectedFilters, cat],
    );
  };

  const filteredItems = items.filter((item) => {
    if (item.id === recentId || item.isNew) return true;
    if (selectedFilters.length === 0) return false;
    return item.category && selectedFilters.includes(item.category);
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (a.id === recentId) return -1;
    if (b.id === recentId) return 1;
    return 0;
  });

  const handleCardClick = (e: React.MouseEvent, id: string) => {
    if (isBulkEditing) return;
    const item = items.find((i) => i.id === id);
    if (item?.isNew) return;
    e.stopPropagation();
    onSelectItem(id);
    const el = document.getElementById(`tf-highlight-${id}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    if (isEditMode) setContextMenu({ id, x: e.clientX, y: e.clientY });
  };

  return (
    <div ref={panelRef} className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2 text-[#1fb2aa] font-bold">
          <ClipboardCheck size={20} />
          Detailed Feedback
        </div>
        {isEditMode && (
          <div className="flex items-center gap-2">
            {!isBulkEditing ? (
              <>
                <button onClick={onAddGeneralFeedback} className="bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-500 px-3 py-1 rounded-md text-[10px] font-bold transition-all">
                  Nháº­n xÃ©t cáº£ bÃ i
                </button>
                <button onClick={startBulkEdit} className="text-[#1fb2aa] hover:bg-teal-50 border border-[#1fb2aa] px-3 py-1 rounded-md text-[10px] font-bold transition-all">
                  Chá»‰nh sá»­a
                </button>
              </>
            ) : (
              <div className="flex gap-2">
                <button onClick={cancelBulkEdit} className="text-slate-500 hover:bg-slate-50 border border-slate-200 px-3 py-1 rounded-md text-[10px] font-bold transition-all flex items-center gap-1.5">
                  <X size={14} /> Huá»·
                </button>
                <button onClick={saveBulkEdit} className="bg-[#1fb2aa] hover:bg-[#1a9b94] text-white px-3 py-1 rounded-md text-[10px] font-bold transition-all flex items-center gap-1.5 shadow-sm">
                  <Save size={14} /> LÆ°u
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {(['TR', 'CC', 'LR', 'GRA'] as FeedbackCategory[]).map((cat) => {
          const isSelected = selectedFilters.includes(cat);
          const colors = CATEGORY_COLORS[cat];
          return (
            <button
              key={cat}
              onClick={() => toggleFilter(cat)}
              className={`px-4 py-1 rounded-full text-xs font-bold transition-all border ${
                isSelected
                  ? `${colors.bg} ${colors.text} ${colors.border} shadow-sm scale-105`
                  : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600'
              }`}
            >
              {cat}
            </button>
          );
        })}
        {selectedFilters.length > 0 && (
          <button
            onClick={() => setSelectedFilters([])}
            className="text-[10px] text-slate-400 hover:text-red-500 font-medium ml-2 transition-colors uppercase tracking-wider h-7 flex items-center"
          >
            XoÃ¡ lá»c
          </button>
        )}
      </div>

      <div className="space-y-6 flex-1 overflow-y-auto pr-1 no-scrollbar">
        {sortedItems.length === 0 ? (
          <p className="text-sm text-slate-400 italic text-center py-8 px-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 mt-4">
            {selectedFilters.length === 0
              ? 'Chá»n Ã­t nháº¥t má»™t tiÃªu chÃ­ bÃªn trÃªn Ä‘á»ƒ xem nháº­n xÃ©t chi tiáº¿t.'
              : 'KhÃ´ng cÃ³ nháº­n xÃ©t nÃ o phÃ¹ há»£p vá»›i bá»™ lá»c Ä‘Ã£ chá»n.'}
          </p>
        ) : (
          sortedItems.map((item) => {
            const isEditing = isBulkEditing || editingId === item.id || !!item.isNew;
            const isSelected = selectedId === item.id;
            const colors = CATEGORY_COLORS[item.category ?? 'TR'];

            return (
              <div
                key={item.id}
                id={`tf-feedback-${item.id}`}
                onClick={(e) => handleCardClick(e, item.id)}
                className={`bg-white relative p-5 rounded-lg border transition-all flex flex-col scroll-mt-2 ${
                  isEditing || isSelected
                    ? `border-[#1fb2aa] shadow-lg ${isSelected && !editingId && !isBulkEditing ? 'ring-4 ring-teal-100 z-10' : 'ring-4 ring-teal-50'}`
                    : 'border-slate-100 hover:border-teal-200 cursor-pointer'
                } ${item.id === recentId ? 'ring-2 ring-amber-400/30' : ''}`}
              >
                {(item.category || (item.isAiGenerated && !isEditing)) && (
                  <div className="flex items-center gap-2 mb-3">
                    {item.category && (
                      <div className={`px-2.5 py-0.5 rounded-full border ${colors.bg} ${colors.text} ${colors.border} text-[10px] font-black uppercase tracking-wider shadow-sm shrink-0`}>
                        {item.category}
                      </div>
                    )}
                    {item.isAiGenerated && !isEditing && (
                      <div className="px-2.5 py-0.5 rounded-full border border-teal-200 bg-[#ccfbf1] text-[#0f766e] text-[10px] font-bold uppercase tracking-wider shadow-sm shrink-0">
                        AI
                      </div>
                    )}
                  </div>
                )}

                {isEditing ? (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nháº­n xÃ©t</label>
                      <textarea
                        autoFocus={editingId === item.id || !!item.isNew}
                        value={isBulkEditing ? (bulkDrafts[item.id]?.text ?? item.text) : editDraft.text}
                        onChange={(e) => {
                          if (isBulkEditing) setBulkDrafts((p) => ({ ...p, [item.id]: { ...p[item.id], text: e.target.value } }));
                          else setEditDraft((p) => ({ ...p, text: e.target.value }));
                        }}
                        onClick={(e) => e.stopPropagation()}
                        data-fs-target
                        className="w-full min-h-[60px] text-slate-700 bg-transparent focus:outline-none resize-none border-b border-slate-200 p-0 pb-1 tf-fs-text"
                        placeholder="Nháº­p ná»™i dung nháº­n xÃ©t..."
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">VÃ­ dá»¥ cáº£i thiá»‡n</label>
                      <textarea
                        value={isBulkEditing ? (bulkDrafts[item.id]?.example ?? item.improvementExample ?? '') : editDraft.example}
                        onChange={(e) => {
                          if (isBulkEditing) setBulkDrafts((p) => ({ ...p, [item.id]: { ...p[item.id], example: e.target.value } }));
                          else setEditDraft((p) => ({ ...p, example: e.target.value }));
                        }}
                        onClick={(e) => e.stopPropagation()}
                        data-fs-target
                        className="w-full min-h-[40px] text-slate-700 bg-transparent focus:outline-none resize-none border-b border-slate-200 p-0 pb-1 tf-fs-text"
                        placeholder="should/can/might..."
                      />

                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TiÃªu chÃ­</label>
                      <div className="flex gap-4">
                        {(['TR', 'CC', 'LR', 'GRA'] as FeedbackCategory[]).map((cat) => {
                          const cols = CATEGORY_COLORS[cat];
                          const checked = (isBulkEditing ? bulkDrafts[item.id]?.category : editDraft.category) === cat;
                          return (
                            <label key={cat} className="flex items-center gap-1.5 cursor-pointer group">
                              <input
                                type="radio"
                                name={`category-${item.id}`}
                                checked={checked}
                                onChange={() => {
                                  if (isBulkEditing) setBulkDrafts((p) => ({ ...p, [item.id]: { ...p[item.id], category: cat } }));
                                  else setEditDraft((p) => ({ ...p, category: cat }));
                                }}
                                className={`w-3.5 h-3.5 ${cols.text} focus:ring-[#1fb2aa] border-slate-300`}
                              />
                              <span className={`text-xs font-medium transition-colors ${checked ? cols.text : 'text-slate-600'}`}>{cat}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {(editingId === item.id || item.isNew) && !isBulkEditing && (
                      <div className="flex justify-end gap-2 pt-2 border-t border-slate-50">
                        <button
                          onClick={(e) => { e.stopPropagation(); item.isNew ? onCancelNew(item.id) : setEditingId(null); }}
                          className="text-slate-500 hover:bg-slate-50 border border-slate-200 px-3 py-1 rounded-md text-xs font-bold transition-all"
                        >
                          Huá»·
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleSingleSave(item.id); }}
                          className="bg-[#1fb2aa] hover:bg-[#1a9b94] text-white px-3 py-1 rounded-md text-xs font-bold transition-all"
                        >
                          LÆ°u
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p data-fs-target className="text-slate-700 leading-relaxed tf-fs-text">
                      {item.text}
                    </p>
                    {item.improvementExample && (
                      <p data-fs-target className="text-slate-600 opacity-80 italic leading-relaxed tf-fs-text">
                        <span className="font-semibold not-italic">VÃ­ dá»¥ cáº£i thiá»‡n:</span>{' '}
                        {item.improvementExample}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {contextMenu && (
        <div
          ref={menuRef}
          style={{ top: contextMenu.y - 10, left: contextMenu.x }}
          className="fixed z-[120] bg-white border border-slate-200 rounded-lg shadow-xl py-1 w-32 overflow-hidden transform -translate-x-1/2 -translate-y-full animate-in fade-in zoom-in duration-150"
        >
          <button onClick={() => { setEditingId(contextMenu.id); setContextMenu(null); }} className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors">
            <Edit2 size={12} className="text-[#1fb2aa]" /> Chá»‰nh sá»­a
          </button>
          <button onClick={() => { onDeleteRequest(contextMenu.id); setContextMenu(null); }} className="w-full text-left px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors border-t border-slate-100">
            <Trash2 size={12} /> XoÃ¡
          </button>
        </div>
      )}
    </div>
  );
};

// â”€â”€â”€ Per-criterion assessment section (full width) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface AssessmentPanelProps {
  category: FeedbackCategory;
  taskType?: string;
  score: number;
  criteria: CriterionFeedbackBlock;
  isEditMode: boolean;
  fontSizeLevel: number;
  onScoreUpdate: (key: FeedbackCategory, value: number) => void;
  onStrengthsUpdate: (category: FeedbackCategory, values: string[]) => void;
  onImprovementsUpdate: (category: FeedbackCategory, values: string[]) => void;
  onIssuesUpdate: (category: FeedbackCategory, issues: string[]) => void;
}

const AssessmentPanel: React.FC<AssessmentPanelProps> = ({
  category, taskType, score, criteria, isEditMode, fontSizeLevel,
  onScoreUpdate, onStrengthsUpdate, onImprovementsUpdate, onIssuesUpdate,
}) => {
  const [isAddingOtherStrength, setIsAddingOtherStrength] = useState(false);
  const [otherStrengthText, setOtherStrengthText] = useState('');
  const [editingScore, setEditingScore] = useState(false);
  const [scoreDraft, setScoreDraft] = useState(score);
  const [isAddingOther, setIsAddingOther] = useState(false);
  const [otherText, setOtherText] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = panelRef.current;
    if (!root) return;
    const px = getFontSizePx(fontSizeLevel);
    root.querySelectorAll<HTMLElement>('[data-fs-target]').forEach((el) => {
      el.style.setProperty('font-size', px, 'important');
    });
  }, [fontSizeLevel, criteria, isEditMode, isAddingOther, isAddingOtherStrength]);

  const colors = CATEGORY_COLORS[category];
  const strengthTemplatesByCategory: Partial<Record<FeedbackCategory, string[]>> =
    taskType === 'task1'
      ? TASK1_STRENGTHS_BY_CATEGORY
      : taskType === 'task2'
      ? TASK2_STRENGTHS_BY_CATEGORY
      : EMPTY_STRENGTHS_BY_CATEGORY;
  const categoryStrengths = strengthTemplatesByCategory[category] ?? [];
  const strengthOptions = [
    ...categoryStrengths,
    ...criteria.strengths.filter((s) => !categoryStrengths.includes(s)),
  ];
  const issuesByCategory = taskType === 'task1' ? TASK1_ISSUES_BY_CATEGORY : TASK2_ISSUES_BY_CATEGORY;
  const categoryIssues = issuesByCategory[category] ?? [];
  const issueOptions = [
    ...categoryIssues,
    ...criteria.selectedIssues.filter((i) => !categoryIssues.includes(i)),
  ];
  const sectionId = CATEGORY_FULL_NAMES[category].toLowerCase().replace(/ & /g, '-').replace(/\s+/g, '-');

  const saveOther = () => {
    if (otherText.trim() && !criteria.selectedIssues.includes(otherText.trim())) {
      onIssuesUpdate(category, [...criteria.selectedIssues, otherText.trim()]);
    }
    setOtherText('');
    setIsAddingOther(false);
  };

  const saveOtherStrength = () => {
    if (otherStrengthText.trim() && !criteria.strengths.includes(otherStrengthText.trim())) {
      onStrengthsUpdate(category, [...criteria.strengths, otherStrengthText.trim()]);
    }
    setOtherStrengthText('');
    setIsAddingOtherStrength(false);
  };

  return (
    <div ref={panelRef} id={sectionId} className="scroll-mt-64 space-y-8">
      <div className="flex items-center gap-4 mb-4">
        <div className={`h-10 w-2 rounded-full ${colors.accent}`} />
        <h2 className="text-2xl font-bold text-slate-800">{CATEGORY_FULL_NAMES[category]}</h2>
      </div>

      {/* Strengths */}
      <div className="bg-green-50/50 border border-green-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 text-green-600 font-bold mb-4">
          <CheckCircle2 size={20} /> Strengths
        </div>
        <div className="space-y-3">
          {strengthOptions.map((strength, idx) => {
            const isChecked = criteria.strengths.includes(strength);
            return (
              <label key={idx} className="flex items-center gap-3 transition-all cursor-pointer group">
                <input
                  type="checkbox"
                  checked={isChecked}
                  disabled={!isEditMode}
                  onChange={() =>
                    onStrengthsUpdate(
                      category,
                      isChecked
                        ? criteria.strengths.filter((s) => s !== strength)
                        : [...criteria.strengths, strength],
                    )
                  }
                  className="h-4 w-4 shrink-0 rounded border-slate-300 text-green-600 focus:ring-green-500 cursor-pointer"
                />
                <span style={{ fontSize: getFontSizePx(fontSizeLevel) }} className={`leading-relaxed ${isChecked ? 'text-green-700 font-medium' : 'text-slate-700 group-hover:text-slate-900'}`}>
                  {strength}
                </span>
              </label>
            );
          })}

          <div className="flex flex-col gap-2">
            <div className="flex items-center flex-wrap gap-4">
              <label className="flex items-center gap-3 cursor-pointer group shrink-0">
                <input
                  type="checkbox"
                  checked={isAddingOtherStrength}
                  disabled={!isEditMode}
                  onChange={(e) => { if (e.target.checked) setIsAddingOtherStrength(true); else { setOtherStrengthText(''); setIsAddingOtherStrength(false); } }}
                  className={`h-4 w-4 rounded border-slate-300 text-green-600 focus:ring-green-500 ${!isEditMode ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                />
                <span style={{ fontSize: getFontSizePx(fontSizeLevel) }} className="text-slate-700">KhÃ¡c</span>
              </label>
              {isAddingOtherStrength && (
                <div className="flex-1 min-w-[200px] flex items-center gap-2">
                  <input
                    autoFocus
                    type="text"
                    value={otherStrengthText}
                    onChange={(e) => setOtherStrengthText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') saveOtherStrength(); if (e.key === 'Escape') { setOtherStrengthText(''); setIsAddingOtherStrength(false); } }}
                    placeholder="Nháº­p Ä‘iá»ƒm cá»™ng khÃ¡c..."
                    className="flex-1 bg-white border border-green-200 rounded-lg px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-green-500/20"
                  />
                  <button onClick={saveOtherStrength} className="bg-[#1fb2aa] text-white px-3 py-1 rounded-lg text-xs font-bold shadow-sm hover:bg-[#1a9b94] transition-all">LÆ°u</button>
                  <button onClick={() => { setOtherStrengthText(''); setIsAddingOtherStrength(false); }} className="bg-white border border-slate-200 text-slate-500 px-3 py-1 rounded-lg text-xs font-bold hover:bg-slate-50 transition-all">Huá»·</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Weaknesses */}
      <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 text-amber-600 font-bold mb-6">
          <AlertTriangle size={20} /> Weaknesses
        </div>
        <div className="space-y-3">
          {issueOptions.map(
            (issue, idx) => {
              const isChecked = criteria.selectedIssues.includes(issue);
              return (
                <label key={idx} className="flex items-center gap-3 transition-all cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    disabled={!isEditMode}
                    onChange={() =>
                      onIssuesUpdate(
                        category,
                        isChecked
                          ? criteria.selectedIssues.filter((i) => i !== issue)
                          : [...criteria.selectedIssues, issue],
                      )
                    }
                    className="h-4 w-4 shrink-0 rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                  />
                  <span style={{ fontSize: getFontSizePx(fontSizeLevel) }} className={`leading-relaxed ${isChecked ? 'text-amber-600 font-medium' : 'text-slate-700 group-hover:text-slate-900'}`}>
                    {issue}
                  </span>
                </label>
              );
            },
          )}

          {/* Custom issue */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center flex-wrap gap-4">
              <label className="flex items-center gap-3 cursor-pointer group shrink-0">
                <input
                  type="checkbox"
                  checked={isAddingOther}
                  disabled={!isEditMode}
                  onChange={(e) => { if (e.target.checked) setIsAddingOther(true); else { setOtherText(''); setIsAddingOther(false); } }}
                  className={`h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500 ${!isEditMode ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                />
                <span style={{ fontSize: getFontSizePx(fontSizeLevel) }} className="text-slate-700">KhÃ¡c</span>
              </label>
              {isAddingOther && (
                <div className="flex-1 min-w-[200px] flex items-center gap-2">
                  <input
                    autoFocus
                    type="text"
                    value={otherText}
                    onChange={(e) => setOtherText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') saveOther(); if (e.key === 'Escape') { setOtherText(''); setIsAddingOther(false); } }}
                    placeholder="Nháº­p lÃ½ do khÃ¡c..."
                    className="flex-1 bg-white border border-amber-200 rounded-lg px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                  <button onClick={saveOther} className="bg-[#1fb2aa] text-white px-3 py-1 rounded-lg text-xs font-bold shadow-sm hover:bg-[#1a9b94] transition-all">LÆ°u</button>
                  <button onClick={() => { setOtherText(''); setIsAddingOther(false); }} className="bg-white border border-slate-200 text-slate-500 px-3 py-1 rounded-lg text-xs font-bold hover:bg-slate-50 transition-all">Huá»·</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Band Reason */}
      <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 text-blue-600 font-bold mb-4">
          <Star size={20} />
          Reason for Band{' '}
          {isEditMode ? (
            <input
              type="number"
              step="1" min="0" max="9"
              value={editingScore ? scoreDraft : score}
              onFocus={() => { setScoreDraft(score); setEditingScore(true); }}
              onBlur={() => setEditingScore(false)}
              onChange={(e) => {
                const raw = e.target.value;
                if (raw === '') { setScoreDraft(0); onScoreUpdate(category, 0); return; }
                let val = parseInt(raw, 10);
                if (isNaN(val)) return;
                val = Math.max(0, Math.min(9, Math.floor(val)));
                setScoreDraft(val);
                onScoreUpdate(category, val);
              }}
              className="w-14 px-1 bg-white border border-blue-300 rounded text-center text-blue-600 font-bold outline-none ring-2 ring-blue-100"
            />
          ) : (
            score.toFixed(0)
          )}
        </div>
        <p style={{ fontSize: getFontSizePx(fontSizeLevel) }} className="leading-relaxed italic text-slate-700 whitespace-pre-line">
          {getReasonText(editingScore ? scoreDraft : score, taskType, category)}
        </p>
      </div>
    </div>
  );
};

// â”€â”€â”€ Public export: two-mode component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface FeedbackSectionProps {
  // Detailed feedback list (left column mode)
  items: FeedbackItem[];
  editingId: string | null;
  selectedId: string | null;
  recentId: string | null;
  isEditMode: boolean;
  isBulkEditing: boolean;
  selectedFilters: FeedbackCategory[];
  fontSizeLevel: number;
  onSelectItem: (id: string | null) => void;
  onEditRequest: (id: string) => void;
  onDeleteRequest: (id: string) => void;
  onUpdateFeedback: (id: string, text: string, example?: string, category?: FeedbackCategory) => void;
  onBulkUpdateFeedback: (newItems: FeedbackItem[]) => void;
  onCancelNew: (id: string) => void;
  onAddGeneralFeedback: () => void;
  setEditingId: (id: string | null) => void;
  setIsBulkEditing: (v: boolean) => void;
  setSelectedFilters: (f: FeedbackCategory[]) => void;

  // Assessment view (full width mode) â€” only used when viewMode === 'assessment'
  scores?: CriterionScores;
  criteria?: Record<FeedbackCategory, CriterionFeedbackBlock>;
  onScoreUpdate?: (key: FeedbackCategory, value: number) => void;
  onStrengthsUpdate?: (category: FeedbackCategory, values: string[]) => void;
  onImprovementsUpdate?: (category: FeedbackCategory, values: string[]) => void;
  onIssuesUpdate?: (category: FeedbackCategory, issues: string[]) => void;
  taskType?: string;

  /** 'detailed' = left-column card list; 'assessment' = full-width per-criterion breakdown */
  viewMode: 'detailed' | 'assessment';
}

const CATEGORIES: FeedbackCategory[] = ['TR', 'CC', 'LR', 'GRA'];

const FeedbackSection: React.FC<FeedbackSectionProps> = (props) => {
  const [activeTab, setActiveTab] = useState<FeedbackCategory>('TR');

  if (props.viewMode === 'detailed') {
    return (
      <DetailedFeedbackPanel
        items={props.items}
        editingId={props.editingId}
        selectedId={props.selectedId}
        recentId={props.recentId}
        isEditMode={props.isEditMode}
        isBulkEditing={props.isBulkEditing}
        selectedFilters={props.selectedFilters}
        fontSizeLevel={props.fontSizeLevel}
        onSelectItem={props.onSelectItem}
        onEditRequest={props.onEditRequest}
        onDeleteRequest={props.onDeleteRequest}
        onUpdateFeedback={props.onUpdateFeedback}
        onBulkUpdateFeedback={props.onBulkUpdateFeedback}
        onCancelNew={props.onCancelNew}
        onAddGeneralFeedback={props.onAddGeneralFeedback}
        setEditingId={props.setEditingId}
        setIsBulkEditing={props.setIsBulkEditing}
        setSelectedFilters={props.setSelectedFilters}
      />
    );
  }

  // Assessment view
  const { scores, criteria, onScoreUpdate, onStrengthsUpdate, onImprovementsUpdate, onIssuesUpdate } = props;
  if (!scores || !criteria) return null;

  return (
    <div className="space-y-12">
      {/* Sticky tabs */}
      <div className="sticky top-[148px] z-20 bg-[#f8fafc] py-4 -mx-4 px-4 mb-4 shadow-sm border-b border-slate-100">
        <div className="flex flex-nowrap gap-2 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveTab(cat);
                const id = CATEGORY_FULL_NAMES[cat].toLowerCase().replace(/ & /g, '-').replace(/\s+/g, '-');
                document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className={`flex-1 min-w-fit px-6 py-3 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === cat
                  ? 'bg-[#1fb2aa] text-white shadow-md'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {CATEGORY_FULL_NAMES[cat]}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-16">
        {CATEGORIES.map((cat) => (
          <AssessmentPanel
            key={cat}
            category={cat}
            taskType={props.taskType}
            score={scores[cat]}
            criteria={criteria[cat]}
            isEditMode={props.isEditMode}
            fontSizeLevel={props.fontSizeLevel}
            onScoreUpdate={onScoreUpdate!}
            onStrengthsUpdate={onStrengthsUpdate!}
            onImprovementsUpdate={onImprovementsUpdate!}
            onIssuesUpdate={onIssuesUpdate!}
          />
        ))}
      </div>
    </div>
  );
};

export default FeedbackSection;

