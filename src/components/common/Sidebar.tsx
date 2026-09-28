import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Calendar,
  Star,
  User,
  Users,
  Building2,
  GraduationCap,
  Award,
  BarChart3,
  MessageSquare,
  LogOut,
  BookmarkCheck,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const { currentUser, logout } = useApp();
  const role = currentUser?.role || 'student';

  const studentLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'internships', label: 'Internships', icon: Briefcase },
    { id: 'applications', label: 'My Applications', icon: FileText },
    { id: 'interviews', label: 'Interviews', icon: Calendar },
    { id: 'feedback', label: 'Feedback', icon: Star },
    { id: 'profile', label: 'My Profile', icon: User },
  ];

  const facultyLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'my-internships', label: 'Posted Internships', icon: Briefcase },
    { id: 'applications', label: 'Student Applications', icon: FileText },
    { id: 'interviews', label: 'Interviews', icon: Calendar },
    { id: 'evaluations', label: 'Evaluations', icon: Award },
    { id: 'reports', label: 'Department Reports', icon: BarChart3 },
    { id: 'profile', label: 'Faculty Profile', icon: User },
  ];

  const adminLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'Students', icon: GraduationCap },
    { id: 'faculty', label: 'Faculty Coordinators', icon: Users },
    { id: 'companies', label: 'Partner Companies', icon: Building2 },
    { id: 'internships', label: 'All Internships', icon: Briefcase },
    { id: 'applications', label: 'All Applications', icon: FileText },
    { id: 'reports', label: 'Placement Reports', icon: BarChart3 },
    { id: 'feedback', label: 'Portal Feedback', icon: MessageSquare },
  ];

  const links =
    role === 'student' ? studentLinks : role === 'faculty' ? facultyLinks : adminLinks;

  return (
    <aside className="w-58 lg:w-62 bg-white border-r border-stone-200/90 shrink-0 flex flex-col justify-between min-h-[calc(100vh-4rem)]">
      <div className="py-4">
        <div className="px-4 mb-2.5">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
            Navigation
          </span>
        </div>

        <nav className="space-y-0.5 px-2">
          {links.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-medium rounded-lg transition-colors text-left ${
                  isActive
                    ? 'bg-emerald-50/90 text-emerald-800 font-semibold border-l-3 border-emerald-700'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/70'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-emerald-700' : 'text-stone-400'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer area */}
      <div className="p-3 border-t border-stone-200/90">
        <button
          onClick={logout}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-stone-600 hover:text-rose-600 hover:bg-rose-50/80 rounded-lg transition-colors"
        >
          <LogOut size={15} className="text-stone-400 group-hover:text-rose-500" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
