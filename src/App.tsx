import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { LoginPage } from './components/auth/LoginPage';

// Student Components
import { StudentDashboard } from './components/student/StudentDashboard';
import { InternshipBrowser } from './components/student/InternshipBrowser';
import { MyApplications } from './components/student/MyApplications';
import { StudentInterviews } from './components/student/StudentInterviews';
import { StudentFeedback } from './components/student/StudentFeedback';
import { StudentProfile } from './components/student/StudentProfile';

// Faculty Components
import { FacultyDashboard } from './components/faculty/FacultyDashboard';
import { FacultyApplications } from './components/faculty/FacultyApplications';
import { FacultyInterviews } from './components/faculty/FacultyInterviews';
import { FacultyEvaluations } from './components/faculty/FacultyEvaluations';
import { FacultyReports } from './components/faculty/FacultyReports';
import { FacultyProfile } from './components/faculty/FacultyProfile';

// Admin Components
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminStudents } from './components/admin/AdminStudents';
import { AdminFaculty } from './components/admin/AdminFaculty';
import { AdminCompanies } from './components/admin/AdminCompanies';
import { AdminInternships } from './components/admin/AdminInternships';
import { AdminApplications } from './components/admin/AdminApplications';
import { AdminReports } from './components/admin/AdminReports';
import { AdminSystemFeedback } from './components/admin/AdminSystemFeedback';

import { Menu, X } from 'lucide-react';
import { ToastNotification } from './components/common/ToastNotification';

const MainPortal: React.FC = () => {
  const { currentUser } = useApp();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // When role changes, reset tab to 'dashboard'
  useEffect(() => {
    setCurrentTab('dashboard');
  }, [currentUser?.role]);

  if (!currentUser) {
    return <LoginPage />;
  }

  const renderContent = () => {
    const role = currentUser.role;

    if (role === 'student') {
      switch (currentTab) {
        case 'dashboard':
          return <StudentDashboard onNavigateToInternships={() => setCurrentTab('internships')} />;
        case 'internships':
          return <InternshipBrowser />;
        case 'applications':
          return <MyApplications />;
        case 'interviews':
          return <StudentInterviews />;
        case 'feedback':
          return <StudentFeedback />;
        case 'profile':
          return <StudentProfile />;
        default:
          return <StudentDashboard onNavigateToInternships={() => setCurrentTab('internships')} />;
      }
    }

    if (role === 'faculty') {
      switch (currentTab) {
        case 'dashboard':
        case 'my-internships':
          return <FacultyDashboard />;
        case 'applications':
          return <FacultyApplications />;
        case 'interviews':
          return <FacultyInterviews />;
        case 'evaluations':
          return <FacultyEvaluations />;
        case 'reports':
          return <FacultyReports />;
        case 'profile':
          return <FacultyProfile />;
        default:
          return <FacultyDashboard />;
      }
    }

    if (role === 'admin') {
      switch (currentTab) {
        case 'dashboard':
          return <AdminDashboard onNavigateTab={(tab) => setCurrentTab(tab)} />;
        case 'students':
          return <AdminStudents />;
        case 'faculty':
          return <AdminFaculty />;
        case 'companies':
          return <AdminCompanies />;
        case 'internships':
          return <AdminInternships />;
        case 'applications':
          return <AdminApplications />;
        case 'reports':
          return <AdminReports />;
        case 'feedback':
          return <AdminSystemFeedback />;
        default:
          return <AdminDashboard onNavigateTab={(tab) => setCurrentTab(tab)} />;
      }
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-[#fafaf8] flex flex-col text-stone-900">
      <Navbar 
        currentTab={currentTab} 
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onToggleMobileMenu={() => setMobileMenuOpen(prev => !prev)}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar
            currentTab={currentTab}
            onSelectTab={(tab) => {
              setCurrentTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </div>

        {/* Mobile Dropdown Sidebar */}
        {mobileMenuOpen && (
          <div 
            className="md:hidden fixed inset-0 top-16 z-50 bg-stone-900/40 backdrop-blur-xs flex"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div 
              className="bg-white w-64 h-full shadow-2xl flex flex-col animate-in slide-in-from-left duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-3 border-b border-stone-200 flex items-center justify-between">
                <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">Navigation Menu</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-stone-400 hover:text-stone-700 rounded-md"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <Sidebar
                  currentTab={currentTab}
                  onSelectTab={(tab) => {
                    setCurrentTab(tab);
                    setMobileMenuOpen(false);
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {renderContent()}
        </main>
      </div>

      <ToastNotification />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainPortal />
    </AppProvider>
  );
}
