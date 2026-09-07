import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'navy' | 'teal' | 'success' | 'amber' | 'warning' | 'neutral' | 'danger' | 'info';
  className?: string;
}

const variants: Record<string, string> = {
  default: 'bg-[#eaf2fd] text-[#183a68] border border-[#c6dcfa]',
  navy: 'bg-[#eaf2fd] text-[#183a68] border border-[#c6dcfa]',
  teal: 'bg-[#e3faf7] text-[#0d746f] border border-[#a7f0e6]',
  success: 'bg-[#e3faf7] text-[#0d746f] border border-[#a7f0e6]',
  amber: 'bg-[#fef3d6] text-[#b45309] border border-[#fde68a]',
  warning: 'bg-[#fef3d6] text-[#b45309] border border-[#fde68a]',
  neutral: 'bg-[#f1f5f9] text-[#475569] border border-[#e2e8f0]',
  danger: 'bg-red-50 text-red-700 border border-red-200',
  info: 'bg-[#eaf2fd] text-[#183a68] border border-[#c6dcfa]',
};

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const variantClass = variants[variant] || variants.default;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-[4px] text-xs font-semibold tracking-wide ${variantClass} ${className}`}>
      {children}
    </span>
  );
}

export default Badge;