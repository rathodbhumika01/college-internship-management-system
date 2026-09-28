import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Application, ApplicationStatus } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';
import { FileText, CheckCircle, XCircle, Clock, Eye, AlertCircle } from 'lucide-react';

export const FacultyApplications: React.FC = () => {
  const { applications, updateApplicationStatus } = useApp();

  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredApps = applications.filter((app) => {
    if (statusFilter === 'all') return true;
    return app.status === statusFilter;
  });

  const handleUpdateStatus = (appId: string, newStatus: ApplicationStatus) => {
    updateApplicationStatus(appId, newStatus, feedbackText || undefined);
    if (selectedApp && selectedApp.id === appId) {
      setSelectedApp(prev => prev ? { ...prev, status: newStatus, faculty_feedback: feedbackText || prev.faculty_feedback } : null);
    }
    setFeedbackText('');
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Student Applications
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review student candidates, evaluate credentials, and update screening status
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-600">Filter Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-none"
          >
            <option value="all">All Applications</option>
            <option value="pending">Pending</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="withdrawn">Withdrawn</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        {filteredApps.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No applications found matching the current filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Internship</th>
                  <th className="py-3 px-4">Applied Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApps.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-900 block">
                        {app.student_name}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {app.student_department} · GPA: <strong className="text-slate-700 tabular-nums">{app.student_gpa.toFixed(2)}</strong>
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-900 block">
                        {app.internship_title}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {app.company_name}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 tabular-nums">
                      {app.applied_date}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={app.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200 transition-colors"
                      >
                        View
                      </button>

                      {app.status !== 'withdrawn' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(app.id, 'shortlisted')}
                            disabled={app.status === 'shortlisted' || app.status === 'accepted'}
                            className="px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors disabled:opacity-40"
                          >
                            Shortlist
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(app.id, 'accepted')}
                            disabled={app.status === 'accepted'}
                            className="px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition-colors disabled:opacity-40"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(app.id, 'rejected')}
                            disabled={app.status === 'rejected'}
                            className="px-2.5 py-1 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded border border-rose-200 transition-colors disabled:opacity-40"
                          >
                            Reject
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

      {/* Review Modal */}
      {selectedApp && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedApp(null)}
          title={`Review Application — ${selectedApp.student_name}`}
          subtitle={`${selectedApp.internship_title} (${selectedApp.company_name})`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs text-slate-700">
            {/* Student metadata */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Student Department:</span>
                <span className="font-semibold text-slate-900">{selectedApp.student_department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Academic GPA:</span>
                <span className="font-bold text-slate-900 tabular-nums">{selectedApp.student_gpa.toFixed(2)} / 4.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Official Email:</span>
                <span>{selectedApp.student_email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Applied Date:</span>
                <span className="tabular-nums">{selectedApp.applied_date}</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                <span className="text-slate-500">Current Status:</span>
                <StatusBadge status={selectedApp.status} size="sm" />
              </div>
            </div>

            {/* Resume File */}
            <div className="border border-slate-200 rounded p-3 bg-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-rose-600" />
                <div>
                  <span className="font-semibold text-slate-800 block">
                    {selectedApp.resume_filename}
                  </span>
                  <span className="text-[11px] text-slate-400">PDF Application Resume Document</span>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
                Verified File
              </span>
            </div>

            {/* Qualifications */}
            <div>
              <span className="font-semibold text-slate-800 block mb-1">Qualifications & Coursework:</span>
              <p className="text-slate-600 bg-white p-2.5 border border-slate-200 rounded">
                {selectedApp.qualifications}
              </p>
            </div>

            {/* Cover Letter */}
            <div>
              <span className="font-semibold text-slate-800 block mb-1">Cover Letter:</span>
              <p className="text-slate-600 whitespace-pre-line bg-white p-2.5 border border-slate-200 rounded leading-relaxed">
                {selectedApp.cover_letter}
              </p>
            </div>

            {/* Faculty Feedback input */}
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Faculty Assessment / Screening Comments
              </label>
              <textarea
                rows={2}
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Add comments on GPA eligibility, technical preparation, or interview recommendation..."
                className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
              />
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <div className="flex items-center gap-2">
                {selectedApp.status !== 'withdrawn' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(selectedApp.id, 'shortlisted')}
                      className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors"
                    >
                      Shortlist
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedApp.id, 'accepted')}
                      className="px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition-colors"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedApp.id, 'rejected')}
                      className="px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded border border-rose-200 transition-colors"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
