import { GraduationCap, LayoutDashboard, Folder, FileText, LogOut } from 'lucide-react';
import { useLocation } from 'wouter';
import { useState } from 'react';
import { useAuth } from '../../hooks/use-auth';

type TeacherShellProps = {
  children: React.ReactNode;
  contentClassName?: string;
};

export default function TeacherShell({ children, contentClassName = '' }: TeacherShellProps) {
  const [location, setLocation] = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { user, logout } = useAuth();

  const teacherName = (user?.name || user?.displayName || 'Giao vien').trim();
  const teacherEmail = (user?.email || '').trim();
  const teacherInitials =
    teacherName
      .split(/\s+/)
      .filter(Boolean)
      .slice(-2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('') || 'GV';

  return (
    <div className="flex min-h-screen bg-[#f1f3fc]">
      <aside
        className={`${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        } bg-white border-r border-[#e2e8f0] flex flex-col transition-all duration-200 ease-in-out z-20`}
      >
        <div className={`p-5 flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} border-b border-[#e2e8f0]/60 mb-3`}>
          <div className="flex items-center gap-2.5">
            <div className="bg-[#183a68] p-2 rounded-lg text-white shrink-0">
              <GraduationCap className="h-5 w-5" />
            </div>
            {!isSidebarCollapsed && (
              <div className="overflow-hidden whitespace-nowrap">
                <h1 className="font-bold text-[#183a68] text-base leading-tight tracking-tight">Wispace</h1>
                <p className="text-[10px] text-[#64748b] font-semibold uppercase tracking-wider">Teacher Platform</p>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="h-8 w-8 flex items-center justify-center rounded-lg text-[#64748b] hover:text-[#183a68] hover:bg-[#eaf2fd] transition-colors cursor-pointer"
            title={isSidebarCollapsed ? 'Mo rong sidebar' : 'Thu gon sidebar'}
          >
            <LayoutDashboard className={`h-4 w-4 transition-transform duration-200 ${isSidebarCollapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-hidden py-2">
          {!isSidebarCollapsed && (
            <div className="text-[10px] font-bold text-[#64748b] px-3 mb-2 tracking-wider uppercase whitespace-nowrap">
              Quan ly giang day
            </div>
          )}
          <NavItem
            icon={<GraduationCap className="h-4 w-4" />}
            label="Lop cua ban"
            active={location === '/teacher'}
            collapsed={isSidebarCollapsed}
            onClick={() => setLocation('/teacher')}
          />
          <NavItem
            icon={<Folder className="h-4 w-4" />}
            label="Trung tam cham bai"
            active={location === '/teacher/grading-center'}
            collapsed={isSidebarCollapsed}
            onClick={() => setLocation('/teacher/grading-center')}
          />
        </nav>

        <div className="p-3 border-t border-[#e2e8f0]">
          <div className={`flex items-center gap-2.5 ${isSidebarCollapsed ? 'justify-center' : 'p-2'} mb-2 rounded-lg`}>
            <div className="h-9 w-9 rounded-lg bg-[#183a68] flex items-center justify-center text-white font-bold text-xs shrink-0">
              {teacherInitials}
            </div>
            {!isSidebarCollapsed && (
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-[#0f172a] truncate">{teacherName}</p>
                <p className="text-[11px] text-[#64748b] truncate">{teacherEmail || 'Khong xac dinh'}</p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              logout();
              setLocation('/login');
            }}
            className={`w-full flex items-center gap-2 h-9 rounded-lg border border-[#e2e8f0] text-[#64748b] hover:text-[#183a68] hover:bg-[#eaf2fd] font-medium text-xs transition-colors px-3 cursor-pointer ${
              isSidebarCollapsed ? 'justify-center' : ''
            }`}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!isSidebarCollapsed && 'Dang xuat'}
          </button>
        </div>
      </aside>

      <main className={`flex-1 overflow-y-auto ${contentClassName}`}>{children}</main>
    </div>
  );
}

function NavItem({
  icon,
  label,
  active = false,
  collapsed = false,
  onClick,
}: {
  icon: React.ReactElement;
  label: string;
  active?: boolean;
  collapsed?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`
        flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-150 cursor-pointer select-none
        ${
          active
            ? 'bg-[#eaf2fd] text-[#183a68] font-bold border-l-3 border-[#183a68]'
            : 'text-[#64748b] hover:bg-white hover:text-[#183a68] font-medium'
        }
        ${collapsed ? 'justify-center' : ''}
      `}
    >
      <div className="shrink-0">{icon}</div>
      {!collapsed && <span className="text-xs tracking-normal whitespace-nowrap">{label}</span>}
      {!collapsed && active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#183a68]" />}
    </div>
  );
}
