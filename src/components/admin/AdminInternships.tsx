import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Internship, InternshipStatus } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';
import { PostInternshipModal } from '../faculty/PostInternshipModal';
import { InternshipDetailModal } from '../student/InternshipDetailModal';
import { Check, X, Edit2, Archive, Eye } from 'lucide-react';

export const AdminInternships: React.FC = () => {
  const { internships, setInternshipStatus, archiveInternship } = useApp();

  const [internshipToView, setInternshipToView] = useState<Internship | null>(null);
  const [internshipToEdit, setInternshipToEdit] = useState<Internship | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = internships.filter((i) => {
    if (statusFilter === 'all') return true;
    return i.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Internship Postings Control
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Admin oversight: approve, reject, modify, or archive all college internship listings
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
            <option value="all">All Postings</option>
            <option value="pending_approval">Pending Approval</option>
            <option value="approved">Approved &amp; Active</option>
            <option value="rejected">Rejected</option>
            <option value="closed">Closed</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Internship</th>
                <th className="py-3 px-4">Company</th>
                <th className="py-3 px-4">Faculty Coordinator</th>
                <th className="py-3 px-4">Deadline</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    {item.title}
                    <span className="block text-[11px] text-slate-400 font-normal">
                      {item.domain} · {item.duration} · ₹{item.stipend.toLocaleString('en-IN')}/mo
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700">
                    {item.company_name}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {item.posted_by_name}
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 tabular-nums">
                    {item.application_deadline}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={item.status} size="sm" />
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      onClick={() => setInternshipToView(item)}
                      className="px-2 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200"
                    >
                      View
                    </button>

                    {item.status !== 'approved' && item.status !== 'archived' && (
                      <button
                        onClick={() => setInternshipStatus(item.id, 'approved')}
                        className="px-2 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200"
                        title="Approve Listing"
                      >
                        Approve
                      </button>
                    )}

                    {item.status !== 'rejected' && item.status !== 'archived' && (
                      <button
                        onClick={() => setInternshipStatus(item.id, 'rejected')}
                        className="px-2 py-1 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded border border-rose-200"
                        title="Reject Listing"
                      >
                        Reject
                      </button>
                    )}

                    <button
                      onClick={() => setInternshipToEdit(item)}
                      className="px-2 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200"
                    >
                      Edit
                    </button>

                    {item.status !== 'archived' && (
                      <button
                        onClick={() => archiveInternship(item.id)}
                        className="px-2 py-1 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded border border-slate-200"
                      >
                        Archive
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {internshipToEdit && (
        <PostInternshipModal
          isOpen={true}
          onClose={() => setInternshipToEdit(null)}
          internshipToEdit={internshipToEdit}
        />
      )}

      {/* View Details Modal */}
      {internshipToView && (
        <InternshipDetailModal
          internship={internshipToView}
          isOpen={true}
          onClose={() => setInternshipToView(null)}
          onApply={() => {}}
          hasApplied={true}
        />
      )}
    </div>
  );
};
