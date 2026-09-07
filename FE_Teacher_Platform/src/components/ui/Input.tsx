import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', id, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-[#0f172a]">
          {label}
        </label>
      )}
      <input
        id={id}
        className={[
          'h-10 rounded-lg border border-[#e2e8f0] bg-white px-3 text-sm text-[#0f172a] placeholder:text-[#64748b]',
          'focus:outline-none focus:ring-2 focus:ring-[#183a68]/20 focus:border-[#183a68] transition-all duration-150',
          error ? 'border-red-400 focus:ring-red-200' : '',
          className,
        ].join(' ')}
        {...props}
      />
      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
    </div>
  );
}

export default Input;