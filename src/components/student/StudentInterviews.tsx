import React from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';
import { Calendar, Clock, User, CheckCircle, MessageSquare } from 'lucide-react';

export const StudentInterviews: React.FC = () => {
  const { interviews, currentStudent } = useApp();

  const studentInterviews = interviews.filter(i => i.student_id === currentStudent?.id);

  // Separate upcoming vs past
  const upcomingInterviews = studentInterviews.filter(
    i => i.status === 'scheduled' || i.status === 'rescheduled'
  );

  const pastInterviews = studentInterviews.filter(
    i => i.status === 'completed' || i.status === 'cancelled'
  );

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          My Interviews
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          View scheduled company technical interviews and past interview results
        </p>
      </div>

      {/* Section 1: Upcoming Interviews */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-slate-700" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Upcoming Interviews ({upcomingInterviews.length})
          </h2>
        </div>

        {upcomingInterviews.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-lg p-6 text-center text-xs text-slate-500">
            No upcoming interviews scheduled at this time.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingInterviews.map((interview) => (
              <div
                key={interview.id}
                className="bg-white border border-slate-200 rounded-lg p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                      {interview.company_name}
                    </span>
                    <h3 className="text-sm font-semibold text-slate-900">
                      {interview.internship_title}
                    </h3>
                  </div>
                  <StatusBadge status={interview.status} size="sm" />
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs space-y-1.5">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Calendar size={13} className="text-slate-400" />
                    <span>Date: <strong className="tabular-nums">{interview.date}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Clock size={13} className="text-slate-400" />
                    <span>Time: <strong className="tabular-nums">{interview.time}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <User size={13} className="text-slate-400" />
                    <span>Interviewer: <strong>{interview.interviewer}</strong></span>
                  </div>
                </div>

                {interview.comments && (
                  <p className="text-xs text-slate-600 bg-white p-2 border border-slate-100 rounded">
                    {interview.comments}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Past Interviews */}
      <div className="space-y-3 pt-4 border-t border-slate-200">
        <div className="flex items-center gap-2">
          <CheckCircle size={16} className="text-slate-700" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Past Interviews ({pastInterviews.length})
          </h2>
        </div>

        {pastInterviews.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-lg p-6 text-center text-xs text-slate-500">
            No completed or past interviews recorded yet.
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Internship</th>
                    <th className="py-3 px-4">Company</th>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Interviewer</th>
                    <th className="py-3 px-4">Result</th>
                    <th className="py-3 px-4">Feedback</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pastInterviews.map((interview) => (
                    <tr key={interview.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {interview.internship_title}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {interview.company_name}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 tabular-nums">
                        {interview.date} · {interview.time}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        {interview.interviewer}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={interview.result} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {interview.feedback || interview.comments || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
