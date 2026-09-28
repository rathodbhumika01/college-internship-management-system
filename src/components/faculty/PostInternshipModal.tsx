import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Internship, Company } from '../../types';
import { useApp } from '../../context/AppContext';
import { AlertCircle } from 'lucide-react';

interface PostInternshipModalProps {
  isOpen: boolean;
  onClose: () => void;
  internshipToEdit?: Internship | null;
}

export const PostInternshipModal: React.FC<PostInternshipModalProps> = ({
  isOpen,
  onClose,
  internshipToEdit,
}) => {
  const { companies, createInternship, updateInternship } = useApp();

  const [title, setTitle] = useState(internshipToEdit?.title || '');
  const [companyId, setCompanyId] = useState(internshipToEdit?.company_id || companies[0]?.id || '');
  const [description, setDescription] = useState(internshipToEdit?.description || '');
  const [domain, setDomain] = useState(internshipToEdit?.domain || 'Software Engineering');
  const [durationWeeks, setDurationWeeks] = useState<number>(internshipToEdit?.duration_weeks || 12);
  const [stipend, setStipend] = useState<number>(internshipToEdit?.stipend || 25000);
  const [location, setLocation] = useState(internshipToEdit?.location || 'Bengaluru');
  const [workMode, setWorkMode] = useState<'Remote' | 'Hybrid' | 'On-site'>(internshipToEdit?.work_mode || 'Hybrid');
  const [skillsInput, setSkillsInput] = useState<string>(internshipToEdit?.skills?.join(', ') || 'Python, React, REST APIs');
  const [startDate, setStartDate] = useState(internshipToEdit?.start_date || '2026-11-01');
  const [endDate, setEndDate] = useState(internshipToEdit?.end_date || '2027-02-01');
  const [deadline, setDeadline] = useState(internshipToEdit?.application_deadline || '2026-10-20');
  const [status, setStatus] = useState<Internship['status']>(internshipToEdit?.status || 'approved');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation: Start Date must be before End Date
    if (new Date(startDate) >= new Date(endDate)) {
      setErrorMsg('Start date must be strictly before end date.');
      return;
    }

    // Validation: Minimum 4 weeks, Maximum 6 months (~26 weeks)
    if (durationWeeks < 4 || durationWeeks > 26) {
      setErrorMsg('Internship duration must be between 4 weeks (minimum) and 26 weeks / 6 months (maximum).');
      return;
    }

    // Validation: Deadline must be before or on Start Date
    if (new Date(deadline) > new Date(startDate)) {
      setErrorMsg('Application deadline cannot be after the internship start date.');
      return;
    }

    const company = companies.find(c => c.id === companyId);
    const companyName = company ? company.name : 'Corporate Partner';

    const durationLabel = `${Math.round(durationWeeks / 4)} months (${durationWeeks} weeks)`;
    const skillsList = skillsInput.split(',').map(s => s.trim()).filter(Boolean);

    if (internshipToEdit) {
      const res = updateInternship(internshipToEdit.id, {
        title,
        company_id: companyId,
        company_name: companyName,
        description,
        domain,
        duration: durationLabel,
        duration_weeks: durationWeeks,
        stipend,
        location,
        work_mode: workMode,
        skills: skillsList,
        start_date: startDate,
        end_date: endDate,
        application_deadline: deadline,
        status,
      });

      if (!res.success) {
        setErrorMsg(res.error || 'Failed to update internship');
        return;
      }
    } else {
      const res = createInternship({
        title,
        company_id: companyId,
        company_name: companyName,
        description,
        domain,
        duration: durationLabel,
        duration_weeks: durationWeeks,
        stipend,
        location,
        work_mode: workMode,
        skills: skillsList,
        start_date: startDate,
        end_date: endDate,
        application_deadline: deadline,
        status,
        company_info: `${companyName} is an active corporate placement partner.`,
      });

      if (!res.success) {
        setErrorMsg(res.error || 'Failed to create internship');
        return;
      }
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={internshipToEdit ? 'Edit Internship Posting' : 'Post New Internship'}
      subtitle="Publish an verified student internship opportunity with corporate partner specs"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Internship Title */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Internship Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g. Software Development Intern"
              className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
            />
          </div>

          {/* Company */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Hiring Company *
            </label>
            <select
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-none"
            >
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.reg_number})
                </option>
              ))}
            </select>
          </div>

          {/* Domain */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Domain / Specialization *
            </label>
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-none"
            >
              <option value="Software Engineering">Software Engineering</option>
              <option value="AI / Machine Learning">AI / Machine Learning</option>
              <option value="Data Analytics">Data Analytics</option>
              <option value="Web Development">Web Development</option>
              <option value="Cloud & Infrastructure">Cloud & Infrastructure</option>
              <option value="Cybersecurity">Cybersecurity</option>
              <option value="Embedded Systems">Embedded Systems</option>
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Work Location & Mode *
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              placeholder="e.g. Pune (Hybrid) or Bengaluru (On-site)"
              className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
            />
          </div>

          {/* Duration (Weeks) */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Duration in Weeks (4 to 26 weeks) *
            </label>
            <input
              type="number"
              min="4"
              max="26"
              value={durationWeeks}
              onChange={(e) => setDurationWeeks(Number(e.target.value))}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none tabular-nums"
            />
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              Min 4 weeks, Max 6 months (26 weeks)
            </span>
          </div>

          {/* Stipend */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Monthly Stipend (INR) *
            </label>
            <input
              type="number"
              min="0"
              step="1000"
              value={stipend}
              onChange={(e) => setStipend(Number(e.target.value))}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none tabular-nums"
            />
          </div>

          {/* Start Date */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Start Date *
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none tabular-nums"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              End Date (Must be after Start Date) *
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none tabular-nums"
            />
          </div>

          {/* Application Deadline */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Application Deadline *
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none tabular-nums"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Status *
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Internship['status'])}
              className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-none"
            >
              <option value="approved">Approved & Active</option>
              <option value="pending_approval">Pending Approval</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block font-semibold text-slate-800 mb-1">
            Job Description & Responsibilities *
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            placeholder="Outline daily duties, technical stack, learning outcomes, and expectations..."
            className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none leading-relaxed"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors"
          >
            {internshipToEdit ? 'Save Changes' : 'Post Internship'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
