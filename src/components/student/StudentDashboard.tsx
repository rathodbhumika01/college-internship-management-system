import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Internship, Application, Interview } from '../../types';
import {
  Search,
  Filter,
  Calendar,
  FileText,
  Clock,
  ArrowRight,
  ExternalLink,
  MapPin,
  CheckCircle2,
  X,
} from 'lucide-react';
import { InternshipCard } from '../common/InternshipCard';
import { InternshipDetailModal } from './InternshipDetailModal';
import { ApplicationModal } from './ApplicationModal';
import { StatusBadge } from '../common/StatusBadge';

interface StudentDashboardProps {
  onNavigateToInternships: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigateToInternships }) => {
  const { currentStudent, internships, applications, interviews } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  const [filterWorkMode, setFilterWorkMode] = useState('all');
  const [filterDuration, setFilterDuration] = useState('all');
  const [filterStipend, setFilterStipend] = useState('all');
  const [filterSkill, setFilterSkill] = useState('all');

  const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);

  // Student specific data
  const studentApps = useMemo(() => {
    return applications.filter(a => a.student_id === currentStudent?.id);
  }, [applications, currentStudent]);

  const upcomingInterviews = useMemo(() => {
    return interviews.filter(
      i => i.student_id === currentStudent?.id && (i.status === 'scheduled' || i.status === 'rescheduled')
    );
  }, [interviews, currentStudent]);

  const hasApplied = (internshipId: string) => {
    return studentApps.some(a => a.internship_id === internshipId && a.status !== 'withdrawn');
  };

  // Student's first name for personal greeting
  const studentFirstName = currentStudent?.name?.split(' ')[0] || 'Bhumika';

  // Approved internships
  const activeInternships = useMemo(() => {
    return internships.filter(i => i.status === 'approved');
  }, [internships]);

  // Apply search & filters
  const filteredList = useMemo(() => {
    return activeInternships.filter((item) => {
      // Search query across role, company, skill, location
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesRole = item.title.toLowerCase().includes(q);
        const matchesCompany = item.company_name.toLowerCase().includes(q);
        const matchesLocation = item.location.toLowerCase().includes(q);
        const matchesSkill = item.skills?.some(s => s.toLowerCase().includes(q));
        if (!matchesRole && !matchesCompany && !matchesLocation && !matchesSkill) {
          return false;
        }
      }

      // Filter: Type
      if (filterType !== 'all' && item.internship_type !== filterType) {
        return false;
      }

      // Filter: Location
      if (filterLocation !== 'all' && !item.location.toLowerCase().includes(filterLocation.toLowerCase())) {
        return false;
      }

      // Filter: Work Mode
      if (filterWorkMode !== 'all' && item.work_mode !== filterWorkMode) {
        return false;
      }

      // Filter: Duration
      if (filterDuration !== 'all' && !item.duration.toLowerCase().includes(filterDuration.toLowerCase())) {
        return false;
      }

      // Filter: Stipend
      if (filterStipend !== 'all') {
        const minVal = parseInt(filterStipend, 10);
        if (item.stipend < minVal) return false;
      }

      // Filter: Skills
      if (filterSkill !== 'all' && !item.skills?.some(s => s.toLowerCase() === filterSkill.toLowerCase())) {
        return false;
      }

      return true;
    });
  }, [
    activeInternships,
    searchQuery,
    filterType,
    filterLocation,
    filterWorkMode,
    filterDuration,
    filterStipend,
    filterSkill,
  ]);

  // Section 1: "Recommended for You" (top match algorithm based on student skills/department)
  const recommendedInternships = useMemo(() => {
    const studentSkills = currentStudent?.skills || ['Python', 'TypeScript', 'Machine Learning'];
    return [...filteredList]
      .sort((a, b) => {
        const aScore = a.skills?.filter(s => studentSkills.some(sk => sk.toLowerCase().includes(s.toLowerCase()))).length || 0;
        const bScore = b.skills?.filter(s => studentSkills.some(sk => sk.toLowerCase().includes(s.toLowerCase()))).length || 0;
        return bScore - aScore;
      })
      .slice(0, 2);
  }, [filteredList, currentStudent]);

  // Section 2: "Recently Added"
  const recentlyAddedInternships = useMemo(() => {
    return [...filteredList]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 2);
  }, [filteredList]);

  const handleOpenDetail = (internship: Internship) => {
    setSelectedInternship(internship);
    setShowDetailModal(true);
  };

  const handleOpenApply = (internship: Internship) => {
    setSelectedInternship(internship);
    setShowApplyModal(true);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setFilterType('all');
    setFilterLocation('all');
    setFilterWorkMode('all');
    setFilterDuration('all');
    setFilterStipend('all');
    setFilterSkill('all');
  };

  const hasActiveFilters =
    searchQuery ||
    filterType !== 'all' ||
    filterLocation !== 'all' ||
    filterWorkMode !== 'all' ||
    filterDuration !== 'all' ||
    filterStipend !== 'all' ||
    filterSkill !== 'all';

  return (
    <div className="space-y-8 max-w-6xl">
      
      {/* ========================================================= */}
      {/* TOP SECTION: GREETING & PURPOSE                           */}
      {/* ========================================================= */}
      <div>
        <h1 className="text-2xl sm:text-[26px] font-semibold text-stone-900 tracking-tight leading-tight">
          Good morning, {studentFirstName}
        </h1>
        <p className="mt-1 text-sm sm:text-[15px] text-stone-500 font-normal leading-relaxed">
          Find internship opportunities that match your skills and interests.
        </p>
      </div>

      {/* ========================================================= */}
      {/* MAIN SEARCH BAR & REFINED FILTER CONTROLS                 */}
      {/* ========================================================= */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-4">
        
        {/* Main Search Input */}
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search internships by role, company, skill or location"
            className="w-full pl-11 pr-4 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:bg-white focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700 focus:outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
          {/* Filter: Internship Type */}
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1.5">
              Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-xs text-stone-700 focus:ring-1 focus:ring-emerald-700 focus:outline-none"
            >
              <option value="all">All Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Summer">Summer</option>
            </select>
          </div>

          {/* Filter: Location */}
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1.5">
              Location
            </label>
            <select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-xs text-stone-700 focus:ring-1 focus:ring-emerald-700 focus:outline-none"
            >
              <option value="all">All Locations</option>
              <option value="Bengaluru">Bengaluru</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Pune">Pune</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Remote">Remote</option>
            </select>
          </div>

          {/* Filter: Work Mode */}
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1.5">
              Work Mode
            </label>
            <select
              value={filterWorkMode}
              onChange={(e) => setFilterWorkMode(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-xs text-stone-700 focus:ring-1 focus:ring-emerald-700 focus:outline-none"
            >
              <option value="all">All Modes</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="On-site">On-site</option>
            </select>
          </div>

          {/* Filter: Duration */}
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1.5">
              Duration
            </label>
            <select
              value={filterDuration}
              onChange={(e) => setFilterDuration(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-xs text-stone-700 focus:ring-1 focus:ring-emerald-700 focus:outline-none"
            >
              <option value="all">Any Duration</option>
              <option value="3 Months">3 Months</option>
              <option value="4 Months">4 Months</option>
              <option value="6 Months">6 Months</option>
            </select>
          </div>

          {/* Filter: Stipend */}
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1.5">
              Min Stipend
            </label>
            <select
              value={filterStipend}
              onChange={(e) => setFilterStipend(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-xs text-stone-700 focus:ring-1 focus:ring-emerald-700 focus:outline-none"
            >
              <option value="all">Any Stipend</option>
              <option value="20000">₹20,000+/mo</option>
              <option value="30000">₹30,000+/mo</option>
              <option value="40000">₹40,000+/mo</option>
            </select>
          </div>

          {/* Filter: Skills */}
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1.5">
              Skill
            </label>
            <select
              value={filterSkill}
              onChange={(e) => setFilterSkill(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-xs text-stone-700 focus:ring-1 focus:ring-emerald-700 focus:outline-none"
            >
              <option value="all">All Skills</option>
              <option value="Python">Python</option>
              <option value="Machine Learning">Machine Learning</option>
              <option value="React">React</option>
              <option value="SQL">SQL</option>
              <option value="TypeScript">TypeScript</option>
              <option value="AWS">Cloud / AWS</option>
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-1 border-t border-stone-100 text-xs">
            <span className="text-stone-500">
              Showing {filteredList.length} matching positions
            </span>
            <button
              onClick={clearAllFilters}
              className="text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* SECTION 1: RECOMMENDED FOR YOU                            */}
      {/* ========================================================= */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-semibold text-stone-900 tracking-tight">
            Recommended for You
          </h2>
          <button
            onClick={onNavigateToInternships}
            className="text-xs font-medium text-emerald-800 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
          >
            <span>Browse All ({activeInternships.length})</span>
            <ArrowRight size={13} />
          </button>
        </div>

        {recommendedInternships.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendedInternships.map((internship) => (
              <InternshipCard
                key={`rec-${internship.id}`}
                internship={internship}
                onViewDetails={handleOpenDetail}
                onApply={handleOpenApply}
                hasApplied={hasApplied(internship.id)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-stone-200 rounded-xl p-6 text-center text-xs text-stone-500 font-normal">
            No internships match your current active filters.
          </div>
        )}
      </section>

      {/* ========================================================= */}
      {/* SECTION 2: RECENTLY ADDED                                 */}
      {/* ========================================================= */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-semibold text-stone-900 tracking-tight">
            Recently Added
          </h2>
          <button
            onClick={onNavigateToInternships}
            className="text-xs font-medium text-stone-600 hover:text-stone-900"
          >
            View More
          </button>
        </div>

        {recentlyAddedInternships.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentlyAddedInternships.map((internship) => (
              <InternshipCard
                key={`recent-${internship.id}`}
                internship={internship}
                onViewDetails={handleOpenDetail}
                onApply={handleOpenApply}
                hasApplied={hasApplied(internship.id)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-stone-200 rounded-xl p-6 text-center text-xs text-stone-500 font-normal">
            No recently added openings.
          </div>
        )}
      </section>

      {/* ========================================================= */}
      {/* SECTION 3 & 4: YOUR APPLICATIONS & UPCOMING INTERVIEWS   */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Section 3: "Your Applications" */}
        <section className="space-y-3.5">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-[17px] font-semibold text-stone-900 tracking-tight">
              Your Applications
            </h2>
            <span className="text-xs font-normal text-stone-500">
              {studentApps.length} Submitted
            </span>
          </div>

          <div className="bg-white border border-stone-200/90 rounded-xl overflow-hidden shadow-xs">
            {studentApps.length === 0 ? (
              <div className="p-6 text-center text-xs text-stone-500 font-normal">
                You haven't submitted any internship applications yet.
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {studentApps.slice(0, 3).map((app) => (
                  <div key={app.id} className="p-4 hover:bg-stone-50/70 transition-colors flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="text-sm font-semibold text-stone-900 block truncate">
                        {app.internship_title}
                      </span>
                      <span className="text-xs text-stone-500 font-normal block truncate mt-0.5">
                        {app.company_name} · Applied on {app.applied_date}
                      </span>
                    </div>
                    <StatusBadge status={app.status} size="sm" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Section 4: "Upcoming Interviews" */}
        <section className="space-y-3.5">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-[17px] font-semibold text-stone-900 tracking-tight">
              Upcoming Interviews
            </h2>
            <span className="text-xs font-normal text-stone-500">
              {upcomingInterviews.length} Scheduled
            </span>
          </div>

          <div className="bg-white border border-stone-200/90 rounded-xl overflow-hidden shadow-xs">
            {upcomingInterviews.length === 0 ? (
              <div className="p-6 text-center text-xs text-stone-500 font-normal">
                No technical interviews scheduled at this time.
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {upcomingInterviews.map((iv) => (
                  <div key={iv.id} className="p-4 hover:bg-stone-50/70 transition-colors space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-stone-900">
                        {iv.internship_title}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200/80">
                        {iv.time}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-stone-500 font-normal">
                      <span>{iv.company_name} · {iv.interviewer}</span>
                      <span className="font-medium text-stone-700 tabular-nums">{iv.date}</span>
                    </div>

                    {iv.comments && (
                      <p className="text-xs text-stone-500 font-normal bg-stone-50 p-2 rounded border border-stone-100">
                        {iv.comments}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

      </div>

      {/* Modals */}
      <InternshipDetailModal
        internship={selectedInternship}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        onApply={(intn) => {
          setSelectedInternship(intn);
          setShowApplyModal(true);
        }}
        hasApplied={selectedInternship ? hasApplied(selectedInternship.id) : false}
      />

      <ApplicationModal
        internship={selectedInternship}
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
      />

    </div>
  );
};
