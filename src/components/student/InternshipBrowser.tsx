import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Internship } from '../../types';
import { Search, Filter, Briefcase, X, SlidersHorizontal, MapPin, Sparkles } from 'lucide-react';
import { InternshipCard } from '../common/InternshipCard';
import { InternshipDetailModal } from './InternshipDetailModal';
import { ApplicationModal } from './ApplicationModal';

export const InternshipBrowser: React.FC = () => {
  const { internships, applications, currentStudent } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedWorkMode, setSelectedWorkMode] = useState('all');
  const [selectedDuration, setSelectedDuration] = useState('all');
  const [selectedStipendRange, setSelectedStipendRange] = useState('all');
  const [selectedSkill, setSelectedSkill] = useState('all');

  const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);

  // Departments / Domains list
  const domains = useMemo(() => {
    const list = Array.from(new Set(internships.map(i => i.domain)));
    return ['all', ...list];
  }, [internships]);

  // Locations list
  const locations = useMemo(() => {
    const list = Array.from(new Set(internships.map(i => i.location.split(' ')[0])));
    return ['all', ...list];
  }, [internships]);

  // Skills list
  const allSkills = useMemo(() => {
    const set = new Set<string>();
    internships.forEach(i => i.skills?.forEach(s => set.add(s)));
    return ['all', ...Array.from(set)];
  }, [internships]);

  // Filter approved internships
  const filteredInternships = useMemo(() => {
    return internships.filter((item) => {
      // Must be approved to browse
      if (item.status !== 'approved') return false;

      // Search match
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.company_name.toLowerCase().includes(q) ||
        item.domain.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        item.skills?.some(s => s.toLowerCase().includes(q));

      // Domain/Department filter
      const matchDomain = selectedDomain === 'all' || item.domain === selectedDomain;

      // Location filter
      const matchLocation =
        selectedLocation === 'all' || item.location.toLowerCase().includes(selectedLocation.toLowerCase());

      // Work Mode filter
      const matchWorkMode = selectedWorkMode === 'all' || item.work_mode === selectedWorkMode;

      // Duration filter
      const matchDuration = selectedDuration === 'all' || item.duration.toLowerCase().includes(selectedDuration.toLowerCase());

      // Stipend range filter
      let matchStipend = true;
      if (selectedStipendRange === '20k') matchStipend = item.stipend >= 20000;
      else if (selectedStipendRange === '30k') matchStipend = item.stipend >= 30000;
      else if (selectedStipendRange === '40k') matchStipend = item.stipend >= 40000;

      // Skill filter
      const matchSkill = selectedSkill === 'all' || item.skills?.some(s => s.toLowerCase() === selectedSkill.toLowerCase());

      return matchSearch && matchDomain && matchLocation && matchWorkMode && matchDuration && matchStipend && matchSkill;
    });
  }, [
    internships,
    searchQuery,
    selectedDomain,
    selectedLocation,
    selectedWorkMode,
    selectedDuration,
    selectedStipendRange,
    selectedSkill,
  ]);

  const hasApplied = (internshipId: string) => {
    return applications.some(
      a => a.student_id === currentStudent?.id && a.internship_id === internshipId && a.status !== 'withdrawn'
    );
  };

  const handleOpenDetail = (internship: Internship) => {
    setSelectedInternship(internship);
    setShowDetailModal(true);
  };

  const handleOpenApply = (internship: Internship) => {
    setSelectedInternship(internship);
    setShowApplyModal(true);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedDomain('all');
    setSelectedLocation('all');
    setSelectedWorkMode('all');
    setSelectedDuration('all');
    setSelectedStipendRange('all');
    setSelectedSkill('all');
  };

  const hasActiveFilters =
    searchQuery ||
    selectedDomain !== 'all' ||
    selectedLocation !== 'all' ||
    selectedWorkMode !== 'all' ||
    selectedDuration !== 'all' ||
    selectedStipendRange !== 'all' ||
    selectedSkill !== 'all';

  return (
    <div className="space-y-6 max-w-6xl">
      
      {/* Heading */}
      <div className="border-b border-stone-200/80 pb-4">
        <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
          Find Your Next Internship
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Explore and apply for verified corporate internships approved by college placement coordinators
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-4">
        
        {/* Search Bar */}
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search internships by role, company, skill or location..."
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

        {/* Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
          {/* Department / Domain */}
          <div>
            <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">
              Department
            </label>
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-xs text-stone-700 focus:ring-1 focus:ring-emerald-700 focus:outline-none"
            >
              <option value="all">All Departments</option>
              {domains.filter(d => d !== 'all').map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">
              Location
            </label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-xs text-stone-700 focus:ring-1 focus:ring-emerald-700 focus:outline-none"
            >
              <option value="all">All Locations</option>
              {locations.filter(l => l !== 'all').map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          {/* Remote / On-site / Hybrid */}
          <div>
            <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">
              Work Mode
            </label>
            <select
              value={selectedWorkMode}
              onChange={(e) => setSelectedWorkMode(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-xs text-stone-700 focus:ring-1 focus:ring-emerald-700 focus:outline-none"
            >
              <option value="all">All Modes</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="On-site">On-site</option>
            </select>
          </div>

          {/* Internship duration */}
          <div>
            <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">
              Duration
            </label>
            <select
              value={selectedDuration}
              onChange={(e) => setSelectedDuration(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-xs text-stone-700 focus:ring-1 focus:ring-emerald-700 focus:outline-none"
            >
              <option value="all">Any Duration</option>
              <option value="3 Months">3 Months</option>
              <option value="4 Months">4 Months</option>
              <option value="6 Months">6 Months</option>
            </select>
          </div>

          {/* Stipend range */}
          <div>
            <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">
              Stipend Range
            </label>
            <select
              value={selectedStipendRange}
              onChange={(e) => setSelectedStipendRange(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-xs text-stone-700 focus:ring-1 focus:ring-emerald-700 focus:outline-none"
            >
              <option value="all">All Ranges</option>
              <option value="20k">₹20,000+/mo</option>
              <option value="30k">₹30,000+/mo</option>
              <option value="40k">₹40,000+/mo</option>
            </select>
          </div>

          {/* Skills */}
          <div>
            <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">
              Skills
            </label>
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-xs text-stone-700 focus:ring-1 focus:ring-emerald-700 focus:outline-none"
            >
              <option value="all">All Skills</option>
              {allSkills.filter(s => s !== 'all').map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-1 border-t border-stone-100 text-xs">
            <span className="text-stone-500">
              Showing {filteredInternships.length} of {internships.filter(i => i.status === 'approved').length} verified internships
            </span>
            <button
              onClick={clearFilters}
              className="text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Internship Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-stone-500 px-1">
          <span>Active Postings ({filteredInternships.length})</span>
          <span>Updated today</span>
        </div>

        {filteredInternships.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center space-y-2">
            <Briefcase size={32} className="mx-auto text-stone-300" />
            <h3 className="text-sm font-bold text-stone-800">No internships match your filter criteria</h3>
            <p className="text-xs text-stone-500">Try loosening your search terms or resetting filters.</p>
            <button
              onClick={clearFilters}
              className="mt-2 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredInternships.map((internship) => (
              <InternshipCard
                key={internship.id}
                internship={internship}
                onViewDetails={handleOpenDetail}
                onApply={handleOpenApply}
                hasApplied={hasApplied(internship.id)}
              />
            ))}
          </div>
        )}
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
