import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, LogOut, Check, ExternalLink, Calendar, Briefcase, UserCheck, Menu } from 'lucide-react';

interface NavbarProps {
  currentTab?: string;
  onSelectTab?: (tab: string) => void;
  onToggleMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab, onToggleMobileMenu }) => {
  const { currentUser, logout } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      title: 'Interview Scheduled',
      message: 'Microsoft technical interview confirmed for Oct 02 at 11:00 AM.',
      time: '10m ago',
      read: false,
      type: 'interview',
    },
    {
      id: 'notif-2',
      title: 'Application Update',
      message: 'TechNova Solutions moved your AI/ML Engineering application to Under Review.',
      time: '1h ago',
      read: false,
      type: 'application',
    },
    {
      id: 'notif-3',
      title: 'Drive Announcement',
      message: 'Campus Recruitment Cell opened 3 new verified corporate openings.',
      time: '1d ago',
      read: true,
      type: 'announcement',
    },
  ]);

  const notifRef = useRef<HTMLDivElement>(null);

  // Close notifications on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // User initials
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return (parts[0]?.slice(0, 2) || 'CI').toUpperCase();
  };

  const roleDisplay = currentUser
    ? currentUser.role === 'student'
      ? 'Student'
      : currentUser.role === 'faculty'
      ? 'Faculty'
      : 'Admin'
    : '';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xs border-b border-stone-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* LEFT: Logo & Portal Branding */}
        <div 
          onClick={() => onSelectTab && onSelectTab('dashboard')}
          className="flex items-center gap-3 shrink-0 cursor-pointer select-none group"
        >
          {/* Minimal modern [CI] icon */}
          <div className="w-9 h-9 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-bold text-sm tracking-tight shadow-xs group-hover:bg-emerald-900 transition-colors">
            CI
          </div>
          <div>
            <span className="text-sm sm:text-base font-bold text-stone-900 tracking-tight leading-tight block">
              College Internship Management System
            </span>
            <span className="text-[11px] text-stone-500 font-medium hidden sm:block leading-tight">
              Connect students with meaningful internship opportunities.
            </span>
          </div>
        </div>

        {/* RIGHT: Notifications, Profile, Role, Logout */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Mobile Navigation Toggle (Small screens only) */}
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="md:hidden p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
              title="Toggle Menu"
              aria-label="Toggle menu"
            >
              <Menu size={19} />
            </button>
          )}

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-colors"
              title="Notifications"
              aria-label="View notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-white" />
              )}
            </button>

            {/* Notification Popover */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white border border-stone-200 rounded-xl shadow-xl p-3 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-100 px-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-stone-900">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-800 rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-[11px] font-medium text-emerald-700 hover:text-emerald-800 transition-colors flex items-center gap-1"
                    >
                      <Check size={12} />
                      <span>Mark all read</span>
                    </button>
                  )}
                </div>

                <div className="space-y-1.5 max-h-72 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-2.5 rounded-lg text-xs transition-colors ${
                        n.read ? 'bg-transparent text-stone-600' : 'bg-stone-50 border border-stone-100 text-stone-900'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className={`font-semibold text-xs ${n.read ? 'text-stone-700' : 'text-emerald-900'}`}>
                          {n.title}
                        </span>
                        <span className="text-[10px] text-stone-400">{n.time}</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-stone-600">
                        {n.message}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Info */}
          {currentUser && (
            <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-stone-200">
              <div 
                onClick={() => onSelectTab?.('profile')}
                className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold tracking-tight cursor-pointer hover:ring-2 hover:ring-emerald-700/20 transition-all select-none"
                title="View My Profile"
              >
                {getInitials(currentUser.name)}
              </div>

              <div 
                onClick={() => onSelectTab?.('profile')}
                className="hidden sm:block text-left cursor-pointer"
              >
                <span className="text-xs font-bold text-stone-900 block leading-tight truncate max-w-[130px]">
                  {currentUser.name}
                </span>
                <span className="text-[11px] font-medium text-emerald-700 capitalize block leading-tight">
                  {roleDisplay}
                </span>
              </div>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-stone-100 rounded-lg transition-colors ml-1"
                title="Sign out of portal"
                aria-label="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}

        </div>
      </div>
    </header>
  );
};
