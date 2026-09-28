import React from 'react';
import { useApp } from '../../context/AppContext';
import { GraduationCap, Users, Building2, Briefcase, FileText, Activity, Clock, CheckCircle2 } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

interface AdminDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateTab }) => {
  const { students, faculty, companies, internships, applications, recentActivities, users } = useApp();

  // 5 stats
  const totalStudents = students.length;
  const totalFaculty = faculty.length;
  const totalCompanies = companies.length;
  const activeInternships = internships.filter(i => i.status === 'approved').length;
  const totalApplications = applications.length;

  // Recent registrations (students + faculty combined)
  const recentRegistrations = [...users]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  // Recent internship posts
  const recentInternshipPosts = [...internships]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 4);

  return (
    <div className="space-y-6 max-w-6xl">
      
      {/* Header */}
      <div className="border-b border-stone-200/80 pb-4">
        <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
          Admin Dashboard
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Centralized administrative management of students, faculty mentors, recruiting companies, and placement metrics
        </p>
      </div>

      {/* 5 Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        
        {/* Total Students */}
        <div
          onClick={() => onNavigateTab('students')}
          className="bg-white border border-stone-200/90 rounded-2xl p-4.5 cursor-pointer hover:border-emerald-600/40 hover:shadow-xs transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500">Total Students</span>
            <GraduationCap size={16} className="text-emerald-700" />
          </div>
          <div className="text-2xl font-extrabold text-stone-900 mt-2 tabular-nums">
            {totalStudents}
          </div>
          <span className="text-[11px] text-stone-400 block mt-0.5">Enrolled candidates</span>
        </div>

        {/* Total Faculty */}
        <div
          onClick={() => onNavigateTab('faculty')}
          className="bg-white border border-stone-200/90 rounded-2xl p-4.5 cursor-pointer hover:border-emerald-600/40 hover:shadow-xs transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500">Total Faculty</span>
            <Users size={16} className="text-sky-600" />
          </div>
          <div className="text-2xl font-extrabold text-stone-900 mt-2 tabular-nums">
            {totalFaculty}
          </div>
          <span className="text-[11px] text-stone-400 block mt-0.5">Dept coordinators</span>
        </div>

        {/* Total Companies */}
        <div
          onClick={() => onNavigateTab('companies')}
          className="bg-white border border-stone-200/90 rounded-2xl p-4.5 cursor-pointer hover:border-emerald-600/40 hover:shadow-xs transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500">Total Companies</span>
            <Building2 size={16} className="text-stone-500" />
          </div>
          <div className="text-2xl font-extrabold text-stone-900 mt-2 tabular-nums">
            {totalCompanies}
          </div>
          <span className="text-[11px] text-stone-400 block mt-0.5">Corporate partners</span>
        </div>

        {/* Active Internships */}
        <div
          onClick={() => onNavigateTab('internships')}
          className="bg-white border border-stone-200/90 rounded-2xl p-4.5 cursor-pointer hover:border-emerald-600/40 hover:shadow-xs transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500">Active Internships</span>
            <Briefcase size={16} className="text-emerald-700" />
          </div>
          <div className="text-2xl font-extrabold text-stone-900 mt-2 tabular-nums">
            {activeInternships}
          </div>
          <span className="text-[11px] text-stone-400 block mt-0.5">Approved openings</span>
        </div>

        {/* Total Applications */}
        <div
          onClick={() => onNavigateTab('applications')}
          className="bg-white border border-stone-200/90 rounded-2xl p-4.5 cursor-pointer hover:border-emerald-600/40 hover:shadow-xs transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500">Total Applications</span>
            <FileText size={16} className="text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-stone-900 mt-2 tabular-nums">
            {totalApplications}
          </div>
          <span className="text-[11px] text-stone-400 block mt-0.5">Campus submissions</span>
        </div>

      </div>

      {/* 2-Column Section Layout: Recent Registrations & Recent Internship Posts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Section 1: Recent Registrations */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-stone-900 tracking-tight flex items-center gap-2">
              <Users size={16} className="text-emerald-700" />
              <span>Recent Registrations</span>
            </h2>
            <button
              onClick={() => onNavigateTab('students')}
              className="text-xs font-semibold text-emerald-800 hover:text-emerald-900 cursor-pointer"
            >
              Manage Users
            </button>
          </div>

          <div className="bg-white border border-stone-200/90 rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
            <div className="divide-y divide-stone-100">
              {recentRegistrations.map((user) => (
                <div key={user.id} className="p-3.5 hover:bg-stone-50/70 transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                      user.role === 'student' ? 'bg-emerald-50 text-emerald-800' : 'bg-stone-100 text-stone-800'
                    }`}>
                      {user.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-stone-900 block">
                        {user.name}
                      </span>
                      <span className="text-[11px] text-stone-400 block">
                        {user.email}
                      </span>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[11px] font-semibold capitalize ${
                    user.role === 'student'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/70'
                      : user.role === 'faculty'
                      ? 'bg-sky-50 text-sky-800 border border-sky-200/70'
                      : 'bg-stone-100 text-stone-700'
                  }`}>
                    {user.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 2: Recent Internship Posts */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-stone-900 tracking-tight flex items-center gap-2">
              <Briefcase size={16} className="text-emerald-700" />
              <span>Recent Internship Posts</span>
            </h2>
            <button
              onClick={() => onNavigateTab('internships')}
              className="text-xs font-semibold text-emerald-800 hover:text-emerald-900 cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="bg-white border border-stone-200/90 rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
            <div className="divide-y divide-stone-100">
              {recentInternshipPosts.map((intn) => (
                <div key={intn.id} className="p-3.5 hover:bg-stone-50/70 transition-colors flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-stone-900 block truncate">
                      {intn.title}
                    </span>
                    <span className="text-[11px] text-stone-500 block truncate">
                      {intn.company_name} · {intn.duration} · ₹{intn.stipend.toLocaleString('en-IN')}/mo
                    </span>
                  </div>
                  <StatusBadge status={intn.status} size="sm" />
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>

      {/* Section 3: Application Activity */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-stone-900 tracking-tight flex items-center gap-2">
            <Activity size={16} className="text-emerald-700" />
            <span>Application Activity</span>
          </h2>
          <span className="text-xs text-stone-400">Live operational stream</span>
        </div>

        <div className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <div className="space-y-3">
            {recentActivities.map((act) => (
              <div key={act.id} className="flex items-start gap-3 pb-3 border-b border-stone-100 last:border-b-0 last:pb-0">
                <div className="w-2 h-2 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                <div className="flex-1 text-xs">
                  <span className="font-semibold text-stone-900 block">
                    {act.title}
                  </span>
                  <div className="flex items-center gap-2 text-[11px] text-stone-400 mt-0.5">
                    <span>{act.actor}</span>
                    <span>·</span>
                    <span>{act.timestamp}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};
