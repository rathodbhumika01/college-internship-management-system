import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Interview } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';
import { Calendar, Plus, Clock, User, AlertCircle, Edit2, XCircle } from 'lucide-react';

export const FacultyInterviews: React.FC = () => {
  const {
    interviews,
    applications,
    internships,
    scheduleInterview,
    rescheduleInterview,
    cancelInterview,
    updateInterviewResult,
  } = useApp();

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState('');
  const [date, setDate] = useState('2026-10-04');
  const [time, setTime] = useState('11:00 AM');
  const [interviewer, setInterviewer] = useState('Mr. Vikram Sen (Engineering Lead)');
  const [comments, setComments] = useState('');

  // Reschedule state
  const [rescheduleInterviewId, setRescheduleInterviewId] = useState<string | null>(null);
  const [newDate, setNewDate] = useState('2026-10-05');
  const [newTime, setNewTime] = useState('02:00 PM');

  // Result state
  const [resultInterviewId, setResultInterviewId] = useState<string | null>(null);
  const [interviewResult, setInterviewResult] = useState<'selected' | 'rejected' | 'on_hold'>('selected');
  const [resultFeedback, setResultFeedback] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Eligible applications to schedule (pending or shortlisted)
  const eligibleApplications = applications.filter(
    a => a.status === 'pending' || a.status === 'shortlisted'
  );

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const app = applications.find(a => a.id === selectedAppId);
    if (!app) {
      setErrorMsg('Please select an applicant.');
      return;
    }

    const res = scheduleInterview({
      applicationId: app.id,
      studentId: app.student_id,
      internshipId: app.internship_id,
      date,
      time,
      interviewer,
      comments,
    });

    if (!res.success) {
      setErrorMsg(res.error || 'Failed to schedule interview.');
      return;
    }

    setShowScheduleModal(false);
    setSelectedAppId('');
    setComments('');
  };

  const handleRescheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!rescheduleInterviewId) return;
    const res = rescheduleInterview(rescheduleInterviewId, newDate, newTime);
    if (!res.success) {
      setErrorMsg(res.error || 'Failed to reschedule.');
      return;
    }

    setRescheduleInterviewId(null);
  };

  const handleResultSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resultInterviewId) return;
    updateInterviewResult(resultInterviewId, interviewResult, resultFeedback);
    setResultInterviewId(null);
    setResultFeedback('');
  };

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Interview Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Coordinate student technical screening, schedule interviewer panels, and update selection results
          </p>
        </div>
        <button
          onClick={() => {
            setErrorMsg(null);
            if (eligibleApplications.length > 0) {
              setSelectedAppId(eligibleApplications[0].id);
            }
            setShowScheduleModal(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors"
        >
          <Plus size={14} />
          <span>Schedule Interview</span>
        </button>
      </div>

      {/* Interviews Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        {interviews.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No interviews scheduled in database.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Internship</th>
                  <th className="py-3 px-4">Company</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Interviewer</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Result</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {interviews.map((intv) => (
                  <tr key={intv.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {intv.student_name}
                      <span className="block text-[11px] text-slate-400 font-normal">
                        {intv.student_email}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {intv.internship_title}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {intv.company_name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 tabular-nums">
                      {intv.date} · {intv.time}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {intv.interviewer}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={intv.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={intv.result} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                      {intv.status !== 'cancelled' && (
                        <>
                          <button
                            onClick={() => {
                              setErrorMsg(null);
                              setRescheduleInterviewId(intv.id);
                              setNewDate(intv.date);
                              setNewTime(intv.time);
                            }}
                            className="px-2 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200"
                            title="Reschedule"
                          >
                            Reschedule
                          </button>
                          <button
                            onClick={() => {
                              setResultInterviewId(intv.id);
                              setResultFeedback(intv.feedback || '');
                            }}
                            className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200"
                            title="Update Result"
                          >
                            Result
                          </button>
                          <button
                            onClick={() => cancelInterview(intv.id)}
                            className="px-2 py-1 text-xs font-medium text-rose-700 hover:bg-rose-50 rounded border border-rose-200"
                            title="Cancel Interview"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Schedule Modal with strict validations */}
      <Modal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        title="Schedule Student Interview"
        subtitle="Enforces minimum 24 hours notice and deadline boundaries"
        maxWidth="md"
      >
        <form onSubmit={handleScheduleSubmit} className="space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Select Applicant & Internship *
            </label>
            <select
              value={selectedAppId}
              onChange={(e) => setSelectedAppId(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-none"
            >
              {eligibleApplications.map(a => (
                <option key={a.id} value={a.id}>
                  {a.student_name} — {a.internship_title} ({a.company_name})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Interview Date *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none tabular-nums"
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Must be at least 24h away
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Time (e.g. 11:00 AM) *
              </label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                placeholder="11:00 AM"
                className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Interviewer / Panel Name *
            </label>
            <input
              type="text"
              value={interviewer}
              onChange={(e) => setInterviewer(e.target.value)}
              required
              placeholder="e.g. Dr. Ramanathan or Tech Lead"
              className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Instructions or Comments
            </label>
            <textarea
              rows={2}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Specify round agenda (e.g., Coding test, DBMS schema normalization, or behavioral)..."
              className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setShowScheduleModal(false)}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded"
            >
              Schedule Interview
            </button>
          </div>
        </form>
      </Modal>

      {/* Reschedule Modal */}
      {rescheduleInterviewId && (
        <Modal
          isOpen={true}
          onClose={() => setRescheduleInterviewId(null)}
          title="Reschedule Interview"
          maxWidth="sm"
        >
          <form onSubmit={handleRescheduleSubmit} className="space-y-4 text-xs">
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-800 mb-1">New Date *</label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none tabular-nums"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">New Time *</label>
              <input
                type="text"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setRescheduleInterviewId(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded"
              >
                Confirm Reschedule
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Result Modal */}
      {resultInterviewId && (
        <Modal
          isOpen={true}
          onClose={() => setResultInterviewId(null)}
          title="Record Interview Result"
          maxWidth="sm"
        >
          <form onSubmit={handleResultSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Candidate Outcome *
              </label>
              <select
                value={interviewResult}
                onChange={(e) => setInterviewResult(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-none"
              >
                <option value="selected">Selected (Offer Candidate)</option>
                <option value="rejected">Rejected (Not Selected)</option>
                <option value="on_hold">On Hold / Awaiting Review</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Feedback & Notes
              </label>
              <textarea
                rows={3}
                value={resultFeedback}
                onChange={(e) => setResultFeedback(e.target.value)}
                placeholder="Candidate feedback from technical panel..."
                className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setResultInterviewId(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded"
              >
                Save Result
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
