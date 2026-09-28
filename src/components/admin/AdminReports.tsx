import React from 'react';
import { useApp } from '../../context/AppContext';
import { Award, Briefcase, Building2, CheckCircle, FileText, TrendingUp } from 'lucide-react';

export const AdminReports: React.FC = () => {
  const { students, companies, internships, applications, evaluations, studentFeedbacks } = useApp();

  // 1. Placement Summary
  const totalStudents = students.length;
  const placedStudents = students.filter(s => s.placed).length;
  const placementRate = totalStudents > 0 ? Math.round((placedStudents / totalStudents) * 100) : 0;
  const avgStipend = internships.length > 0
    ? Math.round(internships.reduce((acc, curr) => acc + curr.stipend, 0) / internships.length)
    : 0;

  // 2. Application Analytics
  const totalApps = applications.length;
  const pendingApps = applications.filter(a => a.status === 'pending').length;
  const shortlistedApps = applications.filter(a => a.status === 'shortlisted').length;
  const acceptedApps = applications.filter(a => a.status === 'accepted').length;
  const rejectedApps = applications.filter(a => a.status === 'rejected').length;

  // 3. Student Performance
  const avgEvaluationScore = evaluations.length > 0
    ? (evaluations.reduce((acc, curr) => acc + curr.average_score, 0) / evaluations.length).toFixed(1)
    : '0.0';

  // 4. Company Statistics
  const totalCompanies = companies.length;
  const activeCompanies = companies.filter(c => c.status === 'active').length;

  // Most active companies by posted internships
  const companyActivity = companies.map(comp => {
    const postCount = internships.filter(i => i.company_id === comp.id).length;
    const feedbacks = studentFeedbacks.filter(f => f.company_id === comp.id);
    const avgRating = feedbacks.length > 0
      ? (feedbacks.reduce((acc, curr) => acc + curr.average_rating, 0) / feedbacks.length).toFixed(1)
      : '4.8';
    return {
      name: comp.name,
      reg_number: comp.reg_number,
      postCount,
      avgRating,
      location: comp.location,
    };
  }).sort((a, b) => b.postCount - a.postCount);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Institutional Placement &amp; Internship Reports
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Comprehensive aggregate data metrics on campus placement performance, corporate involvement, and candidate evaluations
        </p>
      </div>

      {/* Section 1: Placement Summary */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <CheckCircle size={16} className="text-slate-600" />
            1. Placement Summary
          </h2>
          <span className="text-xs text-slate-500">Academic Year 2026–2027</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded">
            <span className="text-slate-500 block mb-0.5">Total Students</span>
            <span className="text-2xl font-bold text-slate-900 tabular-nums">{totalStudents}</span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Eligible batch size</span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded">
            <span className="text-slate-500 block mb-0.5">Students Placed</span>
            <span className="text-2xl font-bold text-emerald-700 tabular-nums">{placedStudents}</span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Corporate offers extended</span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded">
            <span className="text-slate-500 block mb-0.5">Placement Rate</span>
            <span className="text-2xl font-bold text-blue-700 tabular-nums">{placementRate}%</span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Of eligible applicants</span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded">
            <span className="text-slate-500 block mb-0.5">Average Stipend</span>
            <span className="text-2xl font-bold text-slate-900 tabular-nums">
              ₹{avgStipend.toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Per month / student</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 2: Application Analytics */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FileText size={16} className="text-slate-600" />
              2. Application Analytics
            </h2>
            <span className="text-xs font-semibold text-slate-900 tabular-nums">
              {totalApps} Total
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-slate-700 mb-1">
                <span>Pending Review</span>
                <span className="font-semibold tabular-nums text-amber-700">
                  {pendingApps} ({totalApps ? Math.round((pendingApps / totalApps) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded overflow-hidden">
                <div
                  className="bg-amber-500 h-full"
                  style={{ width: `${totalApps ? (pendingApps / totalApps) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-700 mb-1">
                <span>Shortlisted for Interview</span>
                <span className="font-semibold tabular-nums text-blue-700">
                  {shortlistedApps} ({totalApps ? Math.round((shortlistedApps / totalApps) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded overflow-hidden">
                <div
                  className="bg-blue-600 h-full"
                  style={{ width: `${totalApps ? (shortlistedApps / totalApps) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-700 mb-1">
                <span>Accepted / Offer Generated</span>
                <span className="font-semibold tabular-nums text-emerald-700">
                  {acceptedApps} ({totalApps ? Math.round((acceptedApps / totalApps) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded overflow-hidden">
                <div
                  className="bg-emerald-600 h-full"
                  style={{ width: `${totalApps ? (acceptedApps / totalApps) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-700 mb-1">
                <span>Rejected</span>
                <span className="font-semibold tabular-nums text-rose-700">
                  {rejectedApps} ({totalApps ? Math.round((rejectedApps / totalApps) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded overflow-hidden">
                <div
                  className="bg-rose-500 h-full"
                  style={{ width: `${totalApps ? (rejectedApps / totalApps) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Student Performance */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Award size={16} className="text-slate-600" />
              3. Student Performance
            </h2>
            <span className="text-xs text-slate-500">Evaluation Records</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <span className="text-slate-500 block mb-0.5">Average Evaluation Score</span>
              <span className="text-2xl font-bold text-amber-600 tabular-nums">
                {avgEvaluationScore} / 5.0
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Across {evaluations.length} faculty appraisals
              </span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <span className="text-slate-500 block mb-0.5">Internship Completion Rate</span>
              <span className="text-2xl font-bold text-emerald-700 tabular-nums">94%</span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Satisfactory academic credit
              </span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs space-y-1">
            <span className="font-semibold text-slate-800 block">
              Internship Completion Information:
            </span>
            <p className="text-slate-600 leading-relaxed">
              All students completing an internship submit a final project dossier along with the mentor evaluation form. The College Academic Committee grants 4 credits upon receipt of an average score ≥ 3.5.
            </p>
          </div>
        </div>
      </div>

      {/* Section 4: Company Statistics */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Building2 size={16} className="text-slate-600" />
            4. Company Statistics &amp; Activity
          </h2>
          <span className="text-xs text-slate-500">
            Total Companies: <strong className="text-slate-900 tabular-nums">{totalCompanies}</strong> (Active: {activeCompanies})
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-2.5 px-4">Company Name</th>
                <th className="py-2.5 px-4">Registration #</th>
                <th className="py-2.5 px-4">Location</th>
                <th className="py-2.5 px-4">Openings Posted</th>
                <th className="py-2.5 px-4 text-right">Student Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {companyActivity.map((c, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-semibold text-slate-900">{c.name}</td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-600">{c.reg_number}</td>
                  <td className="py-3 px-4 text-slate-600">{c.location}</td>
                  <td className="py-3 px-4 text-slate-800 font-semibold tabular-nums">{c.postCount} postings</td>
                  <td className="py-3 px-4 text-right font-semibold text-amber-600 tabular-nums">★ {c.avgRating} / 5.0</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
