import React, { useState, useRef, useEffect } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { type FeedbackItem, type FeedbackCategory } from './types';

// Category color palette â€” intensity levels [light, mid, strong]
const CATEGORY_COLORS: Record<FeedbackCategory, string[]> = {
  TR:  ['#ccf2ff', '#99e6ff', '#66d9ff'],
  CC:  ['#dbeafe', '#bfdbfe', '#93c5fd'],
  LR:  ['#e9d5ff', '#d8b4fe', '#c4b5fd'],
  GRA: ['#fef9c3', '#fef08a', '#fde68a'],
};

const CATEGORY_BORDER: Record<FeedbackCategory, string> = {
  TR:  'border-cyan-300',
  CC:  'border-blue-400',
  LR:  'border-purple-300',
  GRA: 'border-yellow-400',
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

function getCharOffset(
  node: Node,
  target: Node,
  targetOffset: number,
): { offset: number; found: boolean } {
  if (node === target) return { offset: targetOffset, found: true };
  if (node.nodeType === Node.TEXT_NODE) return { offset: node.textContent?.length ?? 0, found: false };
  let offset = 0;
  for (let i = 0; i < node.childNodes.length; i++) {
    const res = getCharOffset(node.childNodes[i], target, targetOffset);
    if (res.found) return { offset: offset + res.offset, found: true };
    offset += res.offset;
  }
  return { offset, found: false };
}

interface EssayViewerProps {
  essayText: string;
  feedbackItems: FeedbackItem[];
  selectedId: string | null;
  onSelectItem: (id: string | null) => void;
  onTextSelection: (start: number, end: number) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  fontSizeLevel: number;
  activeFilters: FeedbackCategory[];
  isEditMode: boolean;
  recentId?: string | null;
}

const EssayViewer: React.FC<EssayViewerProps> = ({
  essayText,
  feedbackItems,
  selectedId,
  onSelectItem,
  onTextSelection,
  onEdit,
  onDelete,
  fontSizeLevel,
  activeFilters,
  isEditMode,
  recentId,
}) => {
  const [contextMenu, setContextMenu] = useState<{
    id: string;
    x: number;
    y: number;
  } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const essayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Force font-size with !important to defeat global `.text-sm { font-size: ... !important }`
  // and `p, span, div { font-size: ... }` rules in index.css that otherwise win over inline style.
  useEffect(() => {
    const root = essayRef.current;
    if (!root) return;
    const px = getFontSizePx(fontSizeLevel);
    root.style.setProperty('font-size', px, 'important');
    root.querySelectorAll('span, p, div').forEach((el) => {
      (el as HTMLElement).style.setProperty('font-size', px, 'important');
    });
  }, [fontSizeLevel, feedbackItems, selectedId, recentId, activeFilters]);

  // Scroll essay to keep selected highlight visible
  useEffect(() => {
    if (!selectedId) return;
    const selectedItem = feedbackItems.find((item) => item.id === selectedId);
    if (selectedItem?.isNew) return;
    const el = document.getElementById(`tf-highlight-${selectedId}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
  }, [selectedId, feedbackItems]);

  const handleMouseUp = () => {
    if (!isEditMode) return;
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !essayRef.current) return;
    const range = sel.getRangeAt(0);
    if (!essayRef.current.contains(range.commonAncestorContainer)) return;

    const startRes = getCharOffset(essayRef.current, range.startContainer, range.startOffset);
    const endRes   = getCharOffset(essayRef.current, range.endContainer,   range.endOffset);
    if (startRes.found && endRes.found && endRes.offset > startRes.offset) {
      onTextSelection(startRes.offset, endRes.offset);
      window.getSelection()?.removeAllRanges();
    }
  };

  const handleHighlightClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onSelectItem(id);
    if (isEditMode) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      setContextMenu({ id, x: rect.left + rect.width / 2, y: rect.top });
    }
  };

  const renderContent = () => {
    const itemsWithRange = feedbackItems.filter((i) => i.range);
    const pointsSet = new Set<number>([0, essayText.length]);
    itemsWithRange.forEach((i) => {
      pointsSet.add(i.range!.start);
      pointsSet.add(i.range!.end);
    });
    const points = Array.from(pointsSet).sort((a, b) => a - b);
    const hasFilters = activeFilters.length > 0;

    const elements: React.ReactNode[] = [];

    for (let i = 0; i < points.length - 1; i++) {
      const start = points[i];
      const end   = points[i + 1];
      const chunk = essayText.substring(start, end);
      if (!chunk) continue;

      const active = itemsWithRange.filter(
        (item) => item.range!.start <= start && item.range!.end >= end,
      );

      const matching = hasFilters
        ? active.filter((it) => it.category && activeFilters.includes(it.category))
        : [];

      const specialRecent = (recentId || active.find((it) => it.isNew)?.id)
        ? active.find(
            (it) =>
              (it.id === recentId || it.isNew) &&
              (!hasFilters || !it.category || !activeFilters.includes(it.category)),
          )
        : null;

      if (matching.length === 0 && !specialRecent) {
        elements.push(<span key={`t-${start}`}>{chunk}</span>);
        continue;
      }

      // Compute background
      const counts: Record<string, number> = {};
      matching.forEach((it) => {
        const cat = it.category ?? 'TR';
        counts[cat] = (counts[cat] ?? 0) + 1;
      });
      const activeCats = Object.keys(counts) as FeedbackCategory[];
      let bgStyle: React.CSSProperties = {};

      if (hasFilters) {
        if (activeCats.length === 1) {
          bgStyle = { backgroundColor: CATEGORY_COLORS[activeCats[0]][Math.min(counts[activeCats[0]], 3) - 1] };
        } else if (activeCats.length > 1) {
          const stripes = activeCats.map((cat, idx) => {
            const color = CATEGORY_COLORS[cat][Math.min(counts[cat], 3) - 1];
            const s = (idx / activeCats.length) * 100;
            const e = ((idx + 1) / activeCats.length) * 100;
            return `${color} ${s}% ${e}%`;
          });
          bgStyle = { background: `linear-gradient(to bottom, ${stripes.join(', ')})` };
        }
      }

      if (matching.length === 0 && specialRecent) {
        bgStyle = { backgroundColor: CATEGORY_COLORS[specialRecent.category ?? 'TR'][0], opacity: 0.4 };
      }

      const isSelected = [...matching, specialRecent]
        .filter(Boolean)
        .some((it) => it?.id === selectedId);
      const representId = isSelected
        ? selectedId!
        : matching.length > 0
        ? matching[0].id
        : specialRecent!.id;

      const representItem =
        [...matching, specialRecent].filter(Boolean).find((it) => it?.id === representId) ??
        matching[0] ??
        specialRecent!;

      const borderClass = CATEGORY_BORDER[representItem?.category ?? 'TR'];
      const selectedClass = isSelected
        ? 'ring-2 ring-[#1fb2aa]/50 z-10 scale-[1.01] shadow-sm'
        : '';

      elements.push(
        <span
          key={`seg-${start}-${end}`}
          id={`tf-highlight-${representId}`}
          onClick={(e) => handleHighlightClick(e, representId)}
          style={bgStyle}
          className={`cursor-pointer transition-all border-b-2 px-0 rounded-sm inline whitespace-pre-wrap ${borderClass} ${selectedClass} hover:opacity-90`}
        >
          {chunk}
        </span>,
      );
    }

    return elements;
  };

  return (
    <div className="bg-white border border-slate-200 p-8 rounded-xl shadow-sm relative h-full flex flex-col">
      <h2 className="font-bold mb-4 text-slate-800">Your Essay</h2>
      <div
        onMouseUp={handleMouseUp}
        className="flex-1 rounded-xl p-6 bg-slate-50 min-h-[600px] leading-relaxed border border-slate-100 whitespace-pre-wrap select-text transition-all duration-300"
      >
        {isEditMode && (
          <p className="text-xs text-slate-500 mb-6 italic select-none">
            BÃ´i Ä‘en Ä‘oáº¡n vÄƒn Ä‘á»ƒ thÃªm nháº­n xÃ©t.
          </p>
        )}
        <div
          ref={essayRef}
          style={{ fontSize: getFontSizePx(fontSizeLevel) }}
          className="text-slate-700 transition-all duration-300"
        >
          {renderContent()}
        </div>
      </div>

      {contextMenu && (
        <div
          ref={menuRef}
          style={{ top: contextMenu.y - 10, left: contextMenu.x }}
          className="fixed z-[100] bg-white border border-slate-200 rounded-lg shadow-xl py-1 w-32 overflow-hidden transform -translate-x-1/2 -translate-y-full animate-in fade-in zoom-in duration-200"
        >
          <button
            onClick={() => { onEdit(contextMenu.id); setContextMenu(null); }}
            className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
          >
            <Edit2 size={12} className="text-[#1fb2aa]" /> Chá»‰nh sá»­a
          </button>
          <button
            onClick={() => { onDelete(contextMenu.id); setContextMenu(null); }}
            className="w-full text-left px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors border-t border-slate-100"
          >
            <Trash2 size={12} /> XoÃ¡
          </button>
        </div>
      )}
    </div>
  );
};

export default EssayViewer;

