import React from 'react';

export function Table({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <table className={`w-full text-sm ${className}`}>{children}</table>;
}
export function TableHeader({ children }: { children: React.ReactNode }) {
  return <thead className="bg-gray-50 text-xs text-gray-600">{children}</thead>;
}
export function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-gray-50">{children}</tbody>;
}
export function TableRow({ children, className = '', onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return <tr className={`hover:bg-gray-50 transition-colors ${onClick ? 'cursor-pointer' : ''} ${className}`} onClick={onClick}>{children}</tr>;
}
export function TableHead({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-4 py-3 font-semibold text-left ${className}`}>{children}</th>;
}
export function TableCell({ children, className = '', colSpan }: { children: React.ReactNode; className?: string; colSpan?: number }) {
  return <td className={`px-4 py-3 ${className}`} colSpan={colSpan}>{children}</td>;
}
