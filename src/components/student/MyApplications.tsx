import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Application } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';
import { FileText, Clock, AlertTriangle, ArrowRight, Eye, Trash2 } from 'lucide-react';

export const MyApplications: React.FC = () => {
  const { applications, currentStudent, withdrawApplication, showToast } = useApp();
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [confirmWithdrawId, setConfirmWithdrawId] = useState<string | null>(null);

  // Student's applications
  const myApps = applications.filter(a => a.student_id === currentStudent?.id);

  const handleOpenDetails = (app: Application) => {
    setSelectedApp(app);
    setShowDetailModal(true);
  };

  const handleWithdraw = (appId: string) => {
    withdrawApplication(appId);
    setConfirmWithdrawId(null);
    showToast('Application withdrawn successfully.', 'info');
    if (selectedApp && selectedApp.id === appId) {
      setSelectedApp(prev => prev ? { ...prev, status: 'withdrawn' } : null);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      
      {/* Title */}
      <div className="border-b border-stone-200/80 pb-4">
        <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
          My Applications
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Track the review timeline, faculty feedback, and interview status of your submitted internship applications
        </p>
      </div>

      {/* Applications Table / Cards */}
      <div className="bg-white border border-stone-200/90 rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        {myApps.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <FileText size={32} className="mx-auto text-stone-300" />
            <h3 className="text-sm font-bold text-stone-800">No applications submitted yet</h3>
            <p className="text-xs text-stone-500">Explore opportunities and submit your profile to corporate openings.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200/80 text-stone-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-5">Internship</th>
                  <th className="py-3.5 px-5">Company</th>
                  <th className="py-3.5 px-5">Applied On</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {myApps.map((app) => (
                  <tr key={app.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-4 px-5">
                      <span className="font-bold text-stone-900 block text-xs sm:text-sm">
                        {app.internship_title}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-stone-700 font-medium">
                      {app.company_name}
                    </td>
                    <td className="py-4 px-5 text-stone-600 tabular-nums font-medium">
                      {app.applied_date}
                    </td>
                    <td className="py-4 px-5">
                      <StatusBadge status={app.status} size="sm" />
                    </td>
                    <td className="py-4 px-5 text-right space-x-2">
                      <button
                        onClick={() => handleOpenDetails(app)}
                        className="px-3 py-1.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg border border-stone-200/80 transition-colors"
                      >
                        View Details
                      </button>

                      {app.status !== 'withdrawn' && app.status !== 'rejected' && app.status !== 'accepted' && (
                        <button
                          onClick={() => setConfirmWithdrawId(app.id)}
                          className="px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors"
                        >
                          Withdraw
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedApp && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title={selectedApp.internship_title}
          subtitle={`Application details for ${selectedApp.company_name}`}
          maxWidth="lg"
        >
          <div className="space-y-5 text-xs text-stone-700">
            {/* Summary Box */}
            <div className="grid grid-cols-2 gap-3 p-4 bg-stone-50 border border-stone-200/80 rounded-xl">
              <div>
                <span className="text-stone-400 font-medium block">Current Status</span>
                <div className="mt-1">
                  <StatusBadge status={selectedApp.status} size="md" />
                </div>
              </div>
              <div>
                <span className="text-stone-400 font-medium block">Applied On</span>
                <span className="font-bold text-stone-900 block mt-1 tabular-nums">{selectedApp.applied_date}</span>
              </div>
            </div>

            {/* Cover Letter */}
            <div>
              <span className="font-bold text-stone-900 uppercase tracking-wider block mb-1.5 text-[10px]">
                Submitted Cover Letter
              </span>
              <p className="bg-stone-50 border border-stone-200/70 p-3 rounded-xl text-stone-700 leading-relaxed italic">
                "{selectedApp.cover_letter}"
              </p>
            </div>

            {/* Qualifications */}
            <div>
              <span className="font-bold text-stone-900 uppercase tracking-wider block mb-1 text-[10px]">
                Academic Qualifications
              </span>
              <p className="text-stone-700">{selectedApp.qualifications}</p>
            </div>

            {/* Resume File */}
            <div>
              <span className="font-bold text-stone-900 uppercase tracking-wider block mb-1 text-[10px]">
                Attached Resume
              </span>
              <div className="flex items-center gap-2 p-2.5 bg-stone-50 border border-stone-200 rounded-lg">
                <FileText size={16} className="text-rose-600" />
                <span className="font-semibold text-stone-800">{selectedApp.resume_filename}</span>
              </div>
            </div>

            {/* Faculty Feedback if any */}
            {selectedApp.faculty_feedback && (
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                <span className="font-bold text-emerald-900 block mb-1 text-[11px]">
                  Placement Coordinator Feedback
                </span>
                <p className="text-emerald-800 leading-relaxed">
                  {selectedApp.faculty_feedback}
                </p>
              </div>
            )}

            {/* Timeline */}
            <div>
              <span className="font-bold text-stone-900 uppercase tracking-wider block mb-2 text-[10px]">
                Application Review Timeline
              </span>
              <div className="space-y-2 border-l-2 border-emerald-600/30 pl-3 ml-1">
                {selectedApp.timeline?.map((item, idx) => (
                  <div key={idx} className="relative">
                    <span className="text-stone-400 text-[10px] block tabular-nums">{item.date}</span>
                    <span className="font-semibold text-stone-800 block text-xs">{item.note}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal actions */}
            <div className="pt-3 border-t border-stone-200 flex justify-end gap-2">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-3.5 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirmation Modal for Withdrawing */}
      {confirmWithdrawId && (
        <Modal
          isOpen={true}
          onClose={() => setConfirmWithdrawId(null)}
          title="Withdraw Application"
          subtitle="Are you sure you want to withdraw this application?"
          maxWidth="sm"
        >
          <div className="space-y-4 text-xs text-stone-600">
            <p>
              Withdrawing your application will remove you from the candidate shortlist. You may re-apply later if the posting remains open.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmWithdrawId(null)}
                className="px-3.5 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => handleWithdraw(confirmWithdrawId)}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors"
              >
                Confirm Withdrawal
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};
