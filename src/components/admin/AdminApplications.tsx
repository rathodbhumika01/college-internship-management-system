import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Application, ApplicationStatus } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';
import { Search, FileText } from 'lucide-react';

export const AdminApplications: React.FC = () => {
  const { applications, updateApplicationStatus } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  const filtered = applications.filter((app) => {
    if (statusFilter !== 'all' && app.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        app.student_name.toLowerCase().includes(q) ||
        app.internship_title.toLowerCase().includes(q) ||
        app.company_name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            All Student Applications
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit candidate pipelines, status distribution, and faculty reviewer feedback
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search student or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-none"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-none"
          >
            <option value="all">All Statuses</option>
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
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Internship</th>
                <th className="py-3 px-4">Company</th>
                <th className="py-3 px-4">Applied Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-900 block">{app.student_name}</span>
                    <span className="text-[11px] text-slate-400">{app.student_department}</span>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-800">
                    {app.internship_title}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {app.company_name}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 tabular-nums">
                    {app.applied_date}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={app.status} size="sm" />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedApp(app)}
                      className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details modal */}
      {selectedApp && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedApp(null)}
          title={`Application Details — ${selectedApp.student_name}`}
          subtitle={`${selectedApp.internship_title} at ${selectedApp.company_name}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs text-slate-700">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Student:</span>
                <span className="font-semibold text-slate-900">{selectedApp.student_name} ({selectedApp.student_email})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Department &amp; GPA:</span>
                <span>{selectedApp.student_department} · GPA {selectedApp.student_gpa.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Current Status:</span>
                <StatusBadge status={selectedApp.status} size="sm" />
              </div>
            </div>

            <div>
              <span className="font-semibold text-slate-800 block mb-1">Qualifications:</span>
              <p className="bg-white p-2.5 border border-slate-200 rounded text-slate-600">
                {selectedApp.qualifications}
              </p>
            </div>

            <div>
              <span className="font-semibold text-slate-800 block mb-1">Cover Letter:</span>
              <p className="bg-white p-2.5 border border-slate-200 rounded text-slate-600 whitespace-pre-line leading-relaxed">
                {selectedApp.cover_letter}
              </p>
            </div>

            {selectedApp.faculty_feedback && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                <span className="font-semibold text-blue-900 block mb-0.5">Faculty Feedback:</span>
                <p className="text-blue-800">{selectedApp.faculty_feedback}</p>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-200">
              <button
                onClick={() => setSelectedApp(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded"
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
