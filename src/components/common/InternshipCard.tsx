import React from 'react';
import { Internship } from '../../types';
import { MapPin, Clock, DollarSign, Bookmark, BookmarkCheck, Building2, Calendar } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface InternshipCardProps {
  internship: Internship;
  onViewDetails: (internship: Internship) => void;
  onApply: (internship: Internship) => void;
  hasApplied?: boolean;
}

export const InternshipCard: React.FC<InternshipCardProps> = ({
  internship,
  onViewDetails,
  onApply,
  hasApplied = false,
}) => {
  const { toggleBookmarkInternship } = useApp();

  // Mode badge styling
  const getWorkModeBadge = (mode: string) => {
    switch (mode) {
      case 'Remote':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200/80';
      case 'Hybrid':
        return 'bg-sky-50 text-sky-800 border-sky-200/80';
      case 'On-site':
      default:
        return 'bg-stone-100 text-stone-700 border-stone-200';
    }
  };

  // Format posted date
  const formatPostedDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white border border-stone-200/80 rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-emerald-700/30 transition-all flex flex-col justify-between group">
      <div>
        {/* Top Header: Company + Bookmark */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-stone-100 border border-stone-200/70 flex items-center justify-center text-stone-700 font-semibold text-xs shrink-0 group-hover:border-emerald-600/40 transition-colors">
              {internship.company_name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <span className="text-xs font-medium text-stone-500 tracking-tight block">
                {internship.company_name}
              </span>
              <h3 className="text-[15px] sm:text-base font-semibold text-stone-900 leading-snug group-hover:text-emerald-800 transition-colors line-clamp-1">
                {internship.title}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleBookmarkInternship(internship.id);
            }}
            className={`p-1.5 rounded-lg border transition-colors ${
              internship.bookmarked
                ? 'bg-amber-50 border-amber-200 text-amber-600'
                : 'bg-white border-stone-200 text-stone-400 hover:text-stone-700 hover:bg-stone-50'
            }`}
            title={internship.bookmarked ? 'Remove bookmark' : 'Save internship'}
            aria-label="Save internship"
          >
            {internship.bookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
          </button>
        </div>

        {/* Core Metadata pills */}
        <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
          <span className={`px-2 py-0.5 rounded-md border font-medium text-[11px] ${getWorkModeBadge(internship.work_mode)}`}>
            {internship.work_mode}
          </span>
          <span className="flex items-center gap-1 text-stone-600 font-medium">
            <MapPin size={12} className="text-stone-400" />
            <span>{internship.location}</span>
          </span>
          <span className="text-stone-300">·</span>
          <span className="flex items-center gap-1 text-stone-600 font-medium">
            <Clock size={12} className="text-stone-400" />
            <span>{internship.duration}</span>
          </span>
          <span className="text-stone-300">·</span>
          <span className="font-semibold text-stone-900 tabular-nums">
            ₹{internship.stipend.toLocaleString('en-IN')}/mo
          </span>
        </div>

        {/* Skills Tagline */}
        <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-stone-100">
          {internship.skills?.slice(0, 4).map((skill) => (
            <span
              key={skill}
              className="px-2 py-0.5 bg-stone-50 border border-stone-200/60 rounded text-[11px] font-medium text-stone-600"
            >
              {skill}
            </span>
          ))}
          {internship.skills && internship.skills.length > 4 && (
            <span className="text-[10px] text-stone-400 font-medium">
              +{internship.skills.length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* Footer: Posted date & Action Buttons */}
      <div className="pt-4 mt-3 border-t border-stone-100 flex items-center justify-between gap-2">
        <span className="text-[11px] text-stone-400">
          Posted {formatPostedDate(internship.created_at)}
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onViewDetails(internship)}
            className="px-3 py-1.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors border border-stone-200/80 cursor-pointer"
          >
            View Details
          </button>

          {hasApplied ? (
            <span className="px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 rounded-lg border border-emerald-200/90 select-none">
              Applied
            </span>
          ) : (
            <button
              type="button"
              onClick={() => onApply(internship)}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors shadow-2xs cursor-pointer"
            >
              Apply Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
