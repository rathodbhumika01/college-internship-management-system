import React from 'react';
import { Modal } from '../common/Modal';
import { Internship } from '../../types';
import { MapPin, Calendar, Clock, Bookmark, BookmarkCheck, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface InternshipDetailModalProps {
  internship: Internship | null;
  isOpen: boolean;
  onClose: () => void;
  onApply: (internship: Internship) => void;
  hasApplied?: boolean;
}

export const InternshipDetailModal: React.FC<InternshipDetailModalProps> = ({
  internship,
  isOpen,
  onClose,
  onApply,
  hasApplied = false,
}) => {
  const { toggleBookmarkInternship } = useApp();

  if (!internship) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={internship.title}
      subtitle={internship.company_name}
      maxWidth="2xl"
    >
      <div className="space-y-6 text-xs sm:text-sm text-stone-700">
        
        {/* Core Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-stone-50/80 border border-stone-200/80 rounded-xl">
          <div>
            <span className="text-[11px] text-stone-500 font-medium block mb-0.5">Location &amp; Mode</span>
            <span className="font-semibold text-stone-900">{internship.location} ({internship.work_mode})</span>
          </div>

          <div>
            <span className="text-[11px] text-stone-500 font-medium block mb-0.5">Duration</span>
            <span className="font-semibold text-stone-900">{internship.duration}</span>
          </div>

          <div>
            <span className="text-[11px] text-stone-500 font-medium block mb-0.5">Monthly Stipend</span>
            <span className="font-semibold text-stone-900 tabular-nums">
              ₹{internship.stipend.toLocaleString('en-IN')}/month
            </span>
          </div>

          <div>
            <span className="text-[11px] text-stone-500 font-medium block mb-0.5">Application Deadline</span>
            <span className="font-semibold text-amber-800 tabular-nums">
              {internship.application_deadline}
            </span>
          </div>
        </div>

        {/* Section 1: About the Internship */}
        <div>
          <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-2">
            About the Internship
          </h4>
          <p className="text-stone-600 leading-relaxed">
            {internship.description}
          </p>
        </div>

        {/* Section 2: Responsibilities */}
        <div>
          <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-2">
            Key Responsibilities
          </h4>
          <ul className="space-y-1.5 text-stone-600">
            {internship.responsibilities && internship.responsibilities.length > 0 ? (
              internship.responsibilities.map((resp, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-700 mt-2 shrink-0" />
                  <span className="leading-relaxed">{resp}</span>
                </li>
              ))
            ) : (
              <>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-700 mt-2 shrink-0" />
                  <span>Participate in core development, testing, and production deployment cycles.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-700 mt-2 shrink-0" />
                  <span>Work alongside senior mentors on code reviews, design documentation, and sprint goals.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-700 mt-2 shrink-0" />
                  <span>Prepare end-of-internship project presentation and deliverable metrics.</span>
                </li>
              </>
            )}
          </ul>
        </div>

        {/* Section 3: Required Skills */}
        <div>
          <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-2">
            Required Skills
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {internship.skills?.map((skill) => (
              <span
                key={skill}
                className="px-2.5 py-1 bg-stone-100 border border-stone-200/80 rounded-md text-xs font-medium text-stone-700"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Section 4: Eligibility */}
        <div>
          <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-2">
            Eligibility
          </h4>
          <p className="text-stone-600 leading-relaxed bg-stone-50 border border-stone-200/70 p-3 rounded-lg">
            {internship.eligibility || 'Open to pre-final and final year students enrolled in approved engineering departments with minimum CGPA 7.0 / GPA 3.0.'}
          </p>
        </div>

        {/* Section 5: About the Company */}
        <div className="border-t border-stone-200/80 pt-4">
          <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-2">
            About {internship.company_name}
          </h4>
          <p className="text-stone-600 leading-relaxed">
            {internship.company_info || `${internship.company_name} is a leading industry partner actively collaborating with the university for technical recruitment and career advancement.`}
          </p>
        </div>

        {/* CTAs */}
        <div className="border-t border-stone-200 pt-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => toggleBookmarkInternship(internship.id)}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors ${
              internship.bookmarked
                ? 'bg-amber-50 border-amber-200 text-amber-700'
                : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
          >
            {internship.bookmarked ? (
              <>
                <BookmarkCheck size={15} />
                <span>Saved</span>
              </>
            ) : (
              <>
                <Bookmark size={15} />
                <span>Save Internship</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
            >
              Close
            </button>

            {hasApplied ? (
              <span className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 rounded-lg border border-emerald-200">
                <CheckCircle2 size={14} />
                <span>Already Applied</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onApply(internship);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors shadow-xs"
              >
                Apply Now
              </button>
            )}
          </div>
        </div>

      </div>
    </Modal>
  );
};
