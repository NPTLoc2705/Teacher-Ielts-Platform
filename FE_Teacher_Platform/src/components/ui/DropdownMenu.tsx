import React, { useState, useRef, useEffect, createContext, useContext } from 'react';

interface DropdownContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const DropdownContext = createContext<DropdownContextType | null>(null);

export function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <DropdownContext.Provider value={{ isOpen, setIsOpen }}>
      <div ref={containerRef} className="relative inline-block text-left">
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

export function DropdownMenuTrigger({ children }: { children: React.ReactElement<any>; asChild?: boolean }) {
  const ctx = useContext(DropdownContext);
  return React.cloneElement(children, {
    onClick: (e: React.MouseEvent) => {
      children.props?.onClick?.(e);
      ctx?.setIsOpen(!ctx.isOpen);
    },
  });
}

export function DropdownMenuContent({
  children,
  align = 'end',
  className = '',
}: {
  children: React.ReactNode;
  align?: string;
  className?: string;
}) {
  const ctx = useContext(DropdownContext);
  if (!ctx?.isOpen) return null;

  return (
    <div
      className={`absolute z-50 bg-white border border-[#e2e8f0] rounded-lg py-1 min-w-[160px] ${
        align === 'end' ? 'right-0' : 'left-0'
      } top-full mt-1 ${className}`}
    >
      {children}
    </div>
  );
}

export function DropdownMenuItem({
  children,
  onClick,
  className = '',
}: {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
}) {
  const ctx = useContext(DropdownContext);
  return (
    <button
      type="button"
      onClick={(e) => {
        onClick?.(e);
        ctx?.setIsOpen(false);
      }}
      className={`w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2 ${className}`}
    >
      {children}
    </button>
  );
}

export function DropdownMenuLabel({ children }: { children: React.ReactNode }) {
  return <div className="px-4 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">{children}</div>;
}

export function DropdownMenuSeparator() {
  return <div className="my-1 border-t border-gray-100" />;
}

export default DropdownMenu;
