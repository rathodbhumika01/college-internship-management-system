import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Internship, Application } from '../../types';
import { Briefcase, FileText, Clock, Calendar, Plus, Users, CheckCircle, ExternalLink, Eye } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { PostInternshipModal } from './PostInternshipModal';
import { InternshipDetailModal } from '../student/InternshipDetailModal';
import { Modal } from '../common/Modal';

export const FacultyDashboard: React.FC = () => {
  const { currentFaculty, students, internships, applications, interviews, updateApplicationStatus, showToast } = useApp();

  const [showPostModal, setShowPostModal] = useState(false);
  const [internshipToEdit, setInternshipToEdit] = useState<Internship | null>(null);
  const [internshipToView, setInternshipToView] = useState<Internship | null>(null);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  // Stats calculation
  const totalStudentsCount = students.length;
  const activeInternshipsCount = internships.filter(i => i.status === 'approved').length;
  const pendingApplicationsCount = applications.filter(a => a.status === 'pending').length;
  const upcomingInterviewsCount = interviews.filter(
    i => i.status === 'scheduled' || i.status === 'rescheduled'
  ).length;

  // Recent applications (first 5)
  const recentApplications = applications.slice(0, 5);

  // Active internships
  const activeInternshipsList = internships.filter(i => i.status === 'approved').slice(0, 4);

  const handleQuickStatusChange = (appId: string, status: 'shortlisted' | 'rejected') => {
    updateApplicationStatus(appId, status);
    showToast(`Application marked as ${status === 'shortlisted' ? 'Shortlisted' : 'Rejected'}.`, 'success');
  };

  return (
    <div className="space-y-6 max-w-6xl">
      
      {/* Header */}
      <div className="border-b border-stone-200/80 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
            Faculty Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            {currentFaculty?.name} · {currentFaculty?.department} · {currentFaculty?.designation}
          </p>
        </div>

        <button
          onClick={() => {
            setInternshipToEdit(null);
            setShowPostModal(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors shadow-xs self-start sm:self-auto cursor-pointer"
        >
          <Plus size={15} />
          <span>Post Internship</span>
        </button>
      </div>

      {/* 4 Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Students */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-4.5 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500">Total Students</span>
            <Users size={16} className="text-stone-400" />
          </div>
          <div className="text-2xl font-extrabold text-stone-900 mt-2 tabular-nums">
            {totalStudentsCount}
          </div>
          <span className="text-[11px] text-stone-400 mt-1 block">Registered in department</span>
        </div>

        {/* Active Internships */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-4.5 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500">Active Internships</span>
            <Briefcase size={16} className="text-emerald-700" />
          </div>
          <div className="text-2xl font-extrabold text-stone-900 mt-2 tabular-nums">
            {activeInternshipsCount}
          </div>
          <span className="text-[11px] text-stone-400 mt-1 block">Approved corporate openings</span>
        </div>

        {/* Pending Applications */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-4.5 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500">Pending Applications</span>
            <Clock size={16} className="text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-stone-900 mt-2 tabular-nums">
            {pendingApplicationsCount}
          </div>
          <span className="text-[11px] text-stone-400 mt-1 block">Awaiting review</span>
        </div>

        {/* Upcoming Interviews */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-4.5 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500">Upcoming Interviews</span>
            <Calendar size={16} className="text-sky-600" />
          </div>
          <div className="text-2xl font-extrabold text-stone-900 mt-2 tabular-nums">
            {upcomingInterviewsCount}
          </div>
          <span className="text-[11px] text-stone-400 mt-1 block">Scheduled technical rounds</span>
        </div>

      </div>

      {/* Section 1: Recent Student Applications */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-stone-900 tracking-tight flex items-center gap-2">
            <FileText size={16} className="text-emerald-700" />
            <span>Recent Student Applications</span>
          </h2>
          <span className="text-xs text-stone-400">Showing latest submissions</span>
        </div>

        <div className="bg-white border border-stone-200/90 rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Department &amp; GPA</th>
                  <th className="py-3 px-4">Applied Internship</th>
                  <th className="py-3 px-4">Company</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {recentApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-stone-900">
                      {app.student_name}
                    </td>
                    <td className="py-3.5 px-4 text-stone-600">
                      <span>{app.student_department}</span>
                      <span className="text-stone-400 block tabular-nums">GPA: {app.student_gpa.toFixed(2)}</span>
                    </td>
                    <td className="py-3.5 px-4 text-stone-800 font-medium">
                      {app.internship_title}
                    </td>
                    <td className="py-3.5 px-4 text-stone-600">
                      {app.company_name}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={app.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="px-2.5 py-1 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
                      >
                        Review
                      </button>

                      {app.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleQuickStatusChange(app.id, 'shortlisted')}
                            className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
                          >
                            Shortlist
                          </button>
                          <button
                            onClick={() => handleQuickStatusChange(app.id, 'rejected')}
                            className="px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors cursor-pointer"
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
        </div>
      </section>

      {/* Section 2: Internship Opportunities */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-stone-900 tracking-tight flex items-center gap-2">
            <Briefcase size={16} className="text-emerald-700" />
            <span>Internship Opportunities</span>
          </h2>
          <span className="text-xs text-stone-400">Approved university-partner listings</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeInternshipsList.map((internship) => (
            <div
              key={internship.id}
              className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div>
                    <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">
                      {internship.company_name}
                    </span>
                    <h3 className="text-base font-bold text-stone-900">
                      {internship.title}
                    </h3>
                  </div>
                  <StatusBadge status={internship.status} size="sm" />
                </div>

                <p className="text-xs text-stone-600 line-clamp-2 mb-3">
                  {internship.description}
                </p>

                <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 pt-2 border-t border-stone-100">
                  <span className="font-semibold text-stone-800">{internship.location}</span>
                  <span>·</span>
                  <span>{internship.work_mode}</span>
                  <span>·</span>
                  <span>{internship.duration}</span>
                  <span>·</span>
                  <span className="font-bold text-emerald-800 tabular-nums">₹{internship.stipend.toLocaleString('en-IN')}/mo</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 mt-3 border-t border-stone-100">
                <span className="text-[11px] text-stone-400">
                  Deadline: <strong className="text-stone-700">{internship.application_deadline}</strong>
                </span>
                <button
                  onClick={() => setInternshipToView(internship)}
                  className="px-3 py-1.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 3: Student Internship Status */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-stone-900 tracking-tight flex items-center gap-2">
            <Users size={16} className="text-emerald-700" />
            <span>Student Internship Status</span>
          </h2>
          <span className="text-xs text-stone-400">Candidate placement status overview</span>
        </div>

        <div className="bg-white border border-stone-200/90 rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Cumulative GPA</th>
                  <th className="py-3 px-4">Current Status</th>
                  <th className="py-3 px-4">Assigned Company</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {students.map((std) => (
                  <tr key={std.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3 px-4 font-bold text-stone-900">
                      {std.name}
                    </td>
                    <td className="py-3 px-4 text-stone-600">
                      {std.department}
                    </td>
                    <td className="py-3 px-4 font-medium text-stone-800 tabular-nums">
                      {std.gpa.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      {std.placed ? (
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          Placed
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-stone-100 text-stone-600 border border-stone-200">
                          In Progress
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-medium text-stone-700">
                      {std.placed_company || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Review Modal */}
      {selectedApp && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedApp(null)}
          title={`Review Application: ${selectedApp.student_name}`}
          subtitle={`${selectedApp.internship_title} · ${selectedApp.company_name}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs text-stone-700">
            <div className="p-3 bg-stone-50 rounded-xl space-y-1">
              <div className="flex justify-between">
                <span className="text-stone-400">Applicant:</span>
                <span className="font-bold text-stone-900">{selectedApp.student_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Department & GPA:</span>
                <span>{selectedApp.student_department} · {selectedApp.student_gpa.toFixed(2)} GPA</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Current Status:</span>
                <StatusBadge status={selectedApp.status} size="sm" />
              </div>
            </div>

            <div>
              <span className="font-bold text-stone-900 block mb-1">Cover Letter</span>
              <p className="bg-stone-50 p-3 rounded-lg text-stone-700 italic border border-stone-100">
                "{selectedApp.cover_letter}"
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-stone-200">
              <button
                onClick={() => setSelectedApp(null)}
                className="px-3 py-1.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleQuickStatusChange(selectedApp.id, 'shortlisted');
                  setSelectedApp(null);
                }}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg shadow-xs"
              >
                Approve &amp; Shortlist
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Post Internship Modal */}
      <PostInternshipModal
        isOpen={showPostModal}
        onClose={() => setShowPostModal(false)}
        internshipToEdit={internshipToEdit}
      />

      {/* Internship View Detail Modal */}
      <InternshipDetailModal
        internship={internshipToView}
        isOpen={!!internshipToView}
        onClose={() => setInternshipToView(null)}
        onApply={() => {}}
        hasApplied={true}
      />

    </div>
  );
};
