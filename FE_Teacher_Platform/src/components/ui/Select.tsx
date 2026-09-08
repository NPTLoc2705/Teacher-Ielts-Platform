import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  className?: string;
}

export function Select({ value, onChange, options, placeholder = 'Chon...', label, className = '' }: SelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div className={`relative ${className}`} ref={ref}>
      {label && <label className="text-xs font-semibold text-gray-700 block mb-1">{label}</label>}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full h-10 px-3 rounded-lg border border-[#e2e8f0] bg-white text-sm text-[#0f172a] flex items-center justify-between gap-2 focus:outline-none focus:ring-2 focus:ring-[#183a68]/20 focus:border-[#183a68] transition-all"
      >
        <span className={selected ? 'text-[#0f172a]' : 'text-[#64748b]'}>{selected?.label ?? placeholder}</span>
        <ChevronDown className={`h-4 w-4 text-[#64748b] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-[#e2e8f0] rounded-lg overflow-hidden">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full px-3 py-2 text-sm text-left hover:bg-[#eaf2fd] transition-colors ${
                opt.value === value ? 'text-[#183a68] font-semibold bg-[#eaf2fd]' : 'text-[#0f172a]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default Select;