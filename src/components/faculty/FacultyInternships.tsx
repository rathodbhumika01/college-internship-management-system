import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, MapPin, Wallet, CalendarClock, Users } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { PostInternshipModal } from './PostInternshipModal';

export const FacultyInternships: React.FC = () => {
  const { currentFaculty, internships, applications, archiveInternship } = useApp();
  const [showPostModal, setShowPostModal] = useState(false);

  // only the internships this faculty member posted, newest first
  const myInternships = internships.filter(i => i.posted_by_faculty_id === currentFaculty?.id);

  const applicantCount = (internshipId: string) =>
    applications.filter(a => a.internship_id === internshipId && a.status !== 'withdrawn').length;

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="border-b border-stone-200/80 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">Posted Internships</h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Every internship you have posted, with its approval status and the number of applicants.
          </p>
        </div>

        <button
          onClick={() => setShowPostModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors shadow-xs self-start sm:self-auto cursor-pointer"
        >
          <Plus size={15} />
          <span>Post Internship</span>
        </button>
      </div>

      {myInternships.length === 0 ? (
        <div className="bg-white border border-stone-200/90 rounded-2xl p-10 text-center text-sm text-stone-500">
          You have not posted any internships yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myInternships.map(internship => (
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
                    <h3 className="text-base font-bold text-stone-900">{internship.title}</h3>
                  </div>
                  <StatusBadge status={internship.status} size="sm" />
                </div>

                <p className="text-xs text-stone-600 line-clamp-2 mb-3">{internship.description}</p>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-stone-500 pt-2 border-t border-stone-100">
                  <span className="flex items-center gap-1">
                    <MapPin size={13} />
                    {internship.location} · {internship.work_mode}
                  </span>
                  <span className="flex items-center gap-1">
                    <Wallet size={13} />
                    ₹{(internship.stipend || 0).toLocaleString('en-IN')}/mo · {internship.duration_weeks} weeks
                  </span>
                  <span className="flex items-center gap-1">
                    <CalendarClock size={13} />
                    Apply by {internship.application_deadline || 'not set'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={13} />
                    {applicantCount(internship.id)} applicants
                  </span>
                </div>
              </div>

              {internship.status === 'pending_approval' && (
                <p className="text-[11px] text-amber-700 mt-3">Waiting for admin approval. Students cannot see it yet.</p>
              )}
              {internship.status === 'rejected' && (
                <p className="text-[11px] text-rose-700 mt-3">The admin did not approve this internship.</p>
              )}

              {internship.status !== 'archived' && (
                <div className="flex justify-end mt-4">
                  <button
                    onClick={() => archiveInternship(internship.id)}
                    className="px-3 py-1.5 text-xs font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
                  >
                    Archive
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <PostInternshipModal isOpen={showPostModal} onClose={() => setShowPostModal(false)} internshipToEdit={null} />
    </div>
  );
};