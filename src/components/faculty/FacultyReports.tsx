import React from 'react';
import { useApp } from '../../context/AppContext';
import { Briefcase, FileText, Award, Calendar, CheckCircle2, TrendingUp } from 'lucide-react';

export const FacultyReports: React.FC = () => {
  const { internships, applications, evaluations, interviews } = useApp();

  // 1. Posted Internships Stats
  const totalPostings = internships.length;
  const approvedPostings = internships.filter(i => i.status === 'approved').length;
  const pendingPostings = internships.filter(i => i.status === 'pending_approval').length;
  const closedPostings = internships.filter(i => i.status === 'closed' || i.status === 'archived').length;

  // 2. Application Review Stats
  const totalApps = applications.length;
  const pendingApps = applications.filter(a => a.status === 'pending').length;
  const shortlistedApps = applications.filter(a => a.status === 'shortlisted').length;
  const acceptedApps = applications.filter(a => a.status === 'accepted').length;
  const rejectedApps = applications.filter(a => a.status === 'rejected').length;
  const reviewedApps = totalApps - pendingApps;

  // 3. Student Evaluations Stats
  const evaluatedStudentsCount = evaluations.length;
  const avgRating = evaluatedStudentsCount > 0
    ? (evaluations.reduce((acc, curr) => acc + curr.average_score, 0) / evaluatedStudentsCount).toFixed(1)
    : '0.0';

  // 4. Interview Statistics
  const totalInterviews = interviews.length;
  const completedInterviews = interviews.filter(i => i.status === 'completed').length;
  const scheduledInterviews = interviews.filter(i => i.status === 'scheduled' || i.status === 'rescheduled').length;
  const selectedInterviews = interviews.filter(i => i.result === 'selected').length;
  const interviewSuccessRate = completedInterviews > 0
    ? Math.round((selectedInterviews / completedInterviews) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Faculty Internship Reports
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Consolidated statistical reports on postings, application screening throughput, evaluations, and interview results
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 1: Posted Internships */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Briefcase size={16} className="text-slate-600" />
              Posted Internships
            </h2>
            <span className="text-xs font-semibold text-slate-900 tabular-nums">
              Total: {totalPostings}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-700">
              <span>Approved &amp; Active</span>
              <span className="font-semibold tabular-nums text-emerald-700">{approvedPostings}</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded overflow-hidden">
              <div
                className="bg-emerald-600 h-full"
                style={{ width: `${totalPostings ? (approvedPostings / totalPostings) * 100 : 0}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-slate-700 pt-1">
              <span>Pending Approval</span>
              <span className="font-semibold tabular-nums text-amber-700">{pendingPostings}</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded overflow-hidden">
              <div
                className="bg-amber-500 h-full"
                style={{ width: `${totalPostings ? (pendingPostings / totalPostings) * 100 : 0}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-slate-700 pt-1">
              <span>Closed / Archived</span>
              <span className="font-semibold tabular-nums text-slate-600">{closedPostings}</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded overflow-hidden">
              <div
                className="bg-slate-400 h-full"
                style={{ width: `${totalPostings ? (closedPostings / totalPostings) * 100 : 0}%` }}
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              Applications per Internship:
            </span>
            <div className="space-y-1.5 text-xs">
              {internships.slice(0, 4).map(i => {
                const count = applications.filter(a => a.internship_id === i.id).length;
                return (
                  <div key={i.id} className="flex justify-between items-center text-slate-700">
                    <span className="truncate max-w-[200px]">{i.title}</span>
                    <span className="font-semibold tabular-nums text-slate-900">{count} apps</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section 2: Application Review */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FileText size={16} className="text-slate-600" />
              Application Review
            </h2>
            <span className="text-xs font-semibold text-slate-900 tabular-nums">
              Total: {totalApps}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <span className="text-slate-500 block mb-0.5">Reviewed</span>
              <span className="text-xl font-bold text-slate-900 tabular-nums">{reviewedApps}</span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                {totalApps ? Math.round((reviewedApps / totalApps) * 100) : 0}% review progress
              </span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <span className="text-slate-500 block mb-0.5">Pending</span>
              <span className="text-xl font-bold text-amber-700 tabular-nums">{pendingApps}</span>
              <span className="text-[11px] text-slate-400 block mt-0.5">In faculty queue</span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <span className="text-slate-500 block mb-0.5">Shortlisted</span>
              <span className="text-xl font-bold text-blue-700 tabular-nums">{shortlistedApps}</span>
              <span className="text-[11px] text-slate-400 block mt-0.5">Approved for test/interview</span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <span className="text-slate-500 block mb-0.5">Accepted</span>
              <span className="text-xl font-bold text-emerald-700 tabular-nums">{acceptedApps}</span>
              <span className="text-[11px] text-slate-400 block mt-0.5">Final selection</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Rejected / Withdrawn Applications:</span>
            <span className="font-semibold tabular-nums text-slate-800">
              {rejectedApps + applications.filter(a => a.status === 'withdrawn').length}
            </span>
          </div>
        </div>

        {/* Section 3: Student Evaluations */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Award size={16} className="text-slate-600" />
              Student Evaluations
            </h2>
            <span className="text-xs font-semibold text-slate-900 tabular-nums">
              Evaluated: {evaluatedStudentsCount}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <span className="text-slate-500 block mb-0.5">Evaluated Students</span>
              <span className="text-xl font-bold text-slate-900 tabular-nums">{evaluatedStudentsCount}</span>
              <span className="text-[11px] text-slate-400 block mt-0.5">Formal rubric completed</span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <span className="text-slate-500 block mb-0.5">Average Rating</span>
              <span className="text-xl font-bold text-amber-600 tabular-nums">{avgRating} / 5.0</span>
              <span className="text-[11px] text-slate-400 block mt-0.5">Across all rubrics</span>
            </div>
          </div>

          <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-100">
            Ratings assess Technical Skills, Soft Skills, Punctuality, Responsibility, Teamwork, and Learning Ability.
          </p>
        </div>

        {/* Section 4: Interview Statistics */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Calendar size={16} className="text-slate-600" />
              Interview Statistics
            </h2>
            <span className="text-xs font-semibold text-slate-900 tabular-nums">
              Total: {totalInterviews}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
              <span className="text-slate-500 block text-[11px]">Scheduled</span>
              <span className="text-lg font-bold text-blue-700 tabular-nums">{scheduledInterviews}</span>
            </div>

            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
              <span className="text-slate-500 block text-[11px]">Completed</span>
              <span className="text-lg font-bold text-slate-900 tabular-nums">{completedInterviews}</span>
            </div>

            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
              <span className="text-slate-500 block text-[11px]">Success Rate</span>
              <span className="text-lg font-bold text-emerald-700 tabular-nums">{interviewSuccessRate}%</span>
            </div>
          </div>

          <div className="text-xs text-slate-600 pt-2 border-t border-slate-100 flex justify-between">
            <span>Candidates Selected through Interviews:</span>
            <span className="font-semibold text-slate-900 tabular-nums">{selectedInterviews}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
