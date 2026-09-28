import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  User,
  Phone,
  Mail,
  GraduationCap,
  Award,
  FileText,
  Check,
  AlertCircle,
  Edit2,
  Upload,
  Briefcase,
  MapPin,
  Laptop,
  DollarSign,
  Plus,
  X,
} from 'lucide-react';
import { Modal } from '../common/Modal';

export const StudentProfile: React.FC = () => {
  const { currentStudent, updateStudentProfile, showToast } = useApp();

  const [isEditing, setIsEditing] = useState(false);

  // Edit form state
  const [name, setName] = useState(currentStudent?.name || '');
  const [phone, setPhone] = useState(currentStudent?.phone || '');
  const [department, setDepartment] = useState(currentStudent?.department || '');
  const [gpa, setGpa] = useState<string>(currentStudent?.gpa.toString() || '3.85');
  const [degree, setDegree] = useState(currentStudent?.academic_info?.degree || 'Bachelor of Technology (B.Tech)');
  const [college, setCollege] = useState(currentStudent?.academic_info?.college || 'College of Engineering & Technology');
  const [semester, setSemester] = useState(currentStudent?.academic_info?.semester || '7th Semester');
  const [gradYear, setGradYear] = useState(currentStudent?.academic_info?.graduation_year || '2027');

  const [skills, setSkills] = useState<string[]>(
    currentStudent?.skills || ['Python', 'TypeScript', 'React', 'Machine Learning', 'SQL Databases', 'REST APIs', 'Git']
  );
  const [newSkillInput, setNewSkillInput] = useState('');

  const [preferredRoles, setPreferredRoles] = useState<string>(
    currentStudent?.preferences?.preferred_roles?.join(', ') || 'Software Engineering Intern, AI/ML Intern'
  );
  const [preferredMode, setPreferredMode] = useState<string>(
    currentStudent?.preferences?.preferred_work_mode || 'Hybrid'
  );
  const [preferredLocations, setPreferredLocations] = useState<string>(
    currentStudent?.preferences?.preferred_locations?.join(', ') || 'Bengaluru, Pune, Remote'
  );
  const [minStipend, setMinStipend] = useState<string>(
    currentStudent?.preferences?.min_stipend?.toString() || '25000'
  );

  const [resumeFilename, setResumeFilename] = useState(currentStudent?.resume_filename || 'Bhumika_Rathod_Resume.pdf');
  const [resumeSizeMb, setResumeSizeMb] = useState(currentStudent?.resume_size_mb || 1.4);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!currentStudent) {
    return <div className="text-xs text-stone-500">Student profile not found.</div>;
  }

  const handleAddSkill = () => {
    if (newSkillInput.trim() && !skills.includes(newSkillInput.trim())) {
      setSkills(prev => [...prev, newSkillInput.trim()]);
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(prev => prev.filter(s => s !== skillToRemove));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('Resume must be a PDF file only.');
      return;
    }

    const sizeInMb = file.size / (1024 * 1024);
    if (sizeInMb > 5.0) {
      setErrorMsg(`File size ${sizeInMb.toFixed(2)} MB exceeds 5.0 MB limit.`);
      return;
    }

    setResumeFilename(file.name);
    setResumeSizeMb(parseFloat(sizeInMb.toFixed(2)));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validate GPA
    const parsedGpa = parseFloat(gpa);
    if (isNaN(parsedGpa) || parsedGpa < 0.0 || parsedGpa > 10.0) {
      setErrorMsg('GPA must be a numerical value between 0.00 and 10.00.');
      return;
    }

    // Validate Phone
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      setErrorMsg('Phone number must contain between 10 and 15 digits.');
      return;
    }

    const res = updateStudentProfile(currentStudent.id, {
      name: name.trim(),
      phone: phone.trim(),
      department: department.trim(),
      gpa: parsedGpa,
      resume_filename: resumeFilename,
      resume_size_mb: resumeSizeMb,
      academic_info: {
        degree: degree.trim(),
        college: college.trim(),
        semester: semester.trim(),
        graduation_year: gradYear.trim(),
      },
      skills,
      preferences: {
        preferred_roles: preferredRoles.split(',').map(r => r.trim()).filter(Boolean),
        preferred_work_mode: preferredMode,
        preferred_locations: preferredLocations.split(',').map(l => l.trim()).filter(Boolean),
        min_stipend: parseInt(minStipend, 10) || 0,
      },
    });

    if (!res.success) {
      setErrorMsg(res.error || 'Failed to update profile.');
    } else {
      showToast('Profile updated successfully.', 'success');
      setIsEditing(false);
    }
  };

  const initials = currentStudent.name
    .split(' ')
    .map(p => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* Page Header */}
      <div className="border-b border-stone-200/80 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
            Student Profile
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Manage your registered student information, academic credentials, and official resume
          </p>
        </div>

        <button
          onClick={() => setIsEditing(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors shadow-xs cursor-pointer"
        >
          <Edit2 size={13} />
          <span>Edit Profile</span>
        </button>
      </div>

      {/* Main Profile Header Card */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row items-start sm:items-center gap-5">
        {/* Profile photo/avatar */}
        <div className="w-18 h-18 rounded-2xl bg-emerald-800 text-white font-extrabold text-2xl flex items-center justify-center shrink-0 shadow-xs ring-4 ring-emerald-50">
          {initials}
        </div>

        <div className="flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold text-stone-900">{currentStudent.name}</h2>
            <span className="px-2 py-0.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/80 rounded-md">
              Student ID: {currentStudent.id}
            </span>
          </div>

          <p className="text-xs font-medium text-stone-600">
            {currentStudent.department}
          </p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-xs text-stone-500">
            <span className="flex items-center gap-1.5">
              <Mail size={13} className="text-stone-400" />
              <span>{currentStudent.email}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Phone size={13} className="text-stone-400" />
              <span>{currentStudent.phone}</span>
            </span>
            <span className="flex items-center gap-1.5 font-bold text-stone-800">
              <Award size={13} className="text-amber-500" />
              <span>GPA: {currentStudent.gpa.toFixed(2)}</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2-Column Information Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Section 1: Academic Information */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-3.5">
          <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
            <GraduationCap size={17} className="text-emerald-700" />
            <h3 className="text-sm font-bold text-stone-900 tracking-tight">Academic Information</h3>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-stone-400 font-medium">Degree:</span>
              <span className="font-semibold text-stone-900">
                {currentStudent.academic_info?.degree || 'Bachelor of Technology (B.Tech)'}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-stone-400 font-medium">College:</span>
              <span className="font-semibold text-stone-900">
                {currentStudent.academic_info?.college || 'College of Engineering & Technology'}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-stone-400 font-medium">Department:</span>
              <span className="font-semibold text-stone-900">{currentStudent.department}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-stone-400 font-medium">Current Semester:</span>
              <span className="font-semibold text-stone-900">
                {currentStudent.academic_info?.semester || '7th Semester'}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-stone-400 font-medium">Expected Graduation:</span>
              <span className="font-semibold text-stone-900 tabular-nums">
                {currentStudent.academic_info?.graduation_year || '2027'}
              </span>
            </div>

            <div className="flex justify-between pt-1 border-t border-stone-100">
              <span className="text-stone-400 font-medium">Cumulative GPA:</span>
              <span className="font-bold text-emerald-800 tabular-nums">
                {currentStudent.gpa.toFixed(2)} / 10.00
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Resume */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-3.5">
          <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
            <FileText size={17} className="text-rose-600" />
            <h3 className="text-sm font-bold text-stone-900 tracking-tight">Official Resume</h3>
          </div>

          <div className="p-3.5 bg-stone-50 border border-stone-200/80 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-rose-50 border border-rose-200/80 flex items-center justify-center text-rose-600 shrink-0">
                <FileText size={18} />
              </div>
              <div>
                <span className="text-xs font-bold text-stone-900 block truncate max-w-[180px]">
                  {currentStudent.resume_filename || 'Bhumika_Rathod_Resume.pdf'}
                </span>
                <span className="text-[10px] text-stone-400 block">
                  {currentStudent.resume_size_mb || 1.4} MB · Verified PDF
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsEditing(true)}
              className="px-2.5 py-1 text-xs font-semibold text-stone-700 bg-white hover:bg-stone-100 border border-stone-200 rounded-lg transition-colors cursor-pointer"
            >
              Update
            </button>
          </div>

          <p className="text-[11px] text-stone-500 leading-relaxed">
            This resume is automatically attached to your company internship applications upon submission.
          </p>
        </div>

      </div>

      {/* Section 3: Skills */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-stone-100">
          <h3 className="text-sm font-bold text-stone-900 tracking-tight">Verified Skills</h3>
          <span className="text-xs text-stone-400 font-medium">
            {currentStudent.skills?.length || 0} skills added
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {currentStudent.skills?.map((skill) => (
            <span
              key={skill}
              className="px-3 py-1 bg-stone-100 border border-stone-200/80 rounded-lg text-xs font-semibold text-stone-700"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Section 4: Internship Preferences */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-3.5">
        <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
          <Briefcase size={17} className="text-emerald-700" />
          <h3 className="text-sm font-bold text-stone-900 tracking-tight">Internship Preferences</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/70">
            <span className="text-stone-400 font-medium block mb-1">Preferred Roles</span>
            <span className="font-bold text-stone-900 block">
              {currentStudent.preferences?.preferred_roles?.join(', ') || 'Software Engineering, AI/ML'}
            </span>
          </div>

          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/70">
            <span className="text-stone-400 font-medium block mb-1">Work Mode</span>
            <span className="font-bold text-stone-900 block">
              {currentStudent.preferences?.preferred_work_mode || 'Hybrid'}
            </span>
          </div>

          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/70">
            <span className="text-stone-400 font-medium block mb-1">Preferred Locations</span>
            <span className="font-bold text-stone-900 block">
              {currentStudent.preferences?.preferred_locations?.join(', ') || 'Bengaluru, Pune, Remote'}
            </span>
          </div>

          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/70">
            <span className="text-stone-400 font-medium block mb-1">Minimum Expected Stipend</span>
            <span className="font-bold text-stone-900 block tabular-nums">
              ₹{(currentStudent.preferences?.min_stipend || 25000).toLocaleString('en-IN')}/month
            </span>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        title="Edit Student Profile"
        subtitle="Update your student record, resume, skills, and preferences"
        maxWidth="xl"
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg flex items-center gap-2">
              <AlertCircle size={15} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Basic Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Full Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-1 focus:ring-emerald-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Phone Number *</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-1 focus:ring-emerald-700 focus:outline-none"
              />
            </div>
          </div>

          {/* Academic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Department *</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                required
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-1 focus:ring-emerald-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Semester *</label>
              <input
                type="text"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                required
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-1 focus:ring-emerald-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">GPA / CGPA (0-10) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={gpa}
                onChange={(e) => setGpa(e.target.value)}
                required
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-1 focus:ring-emerald-700 focus:outline-none"
              />
            </div>
          </div>

          {/* Skills Tag Management */}
          <div>
            <label className="block font-semibold text-stone-700 mb-1">Skills</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                placeholder="Type a skill and click Add..."
                className="flex-1 px-3 py-2 border border-stone-300 rounded-lg text-xs focus:ring-1 focus:ring-emerald-700 focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-lg text-xs transition-colors flex items-center gap-1"
              >
                <Plus size={14} />
                <span>Add</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 p-2 bg-stone-50 border border-stone-200 rounded-lg min-h-12 items-center">
              {skills.map((s) => (
                <span
                  key={s}
                  className="px-2 py-0.5 bg-white border border-stone-200 rounded-md text-xs font-semibold text-stone-700 flex items-center gap-1"
                >
                  <span>{s}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(s)}
                    className="text-stone-400 hover:text-rose-600"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Preferences */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Preferred Roles</label>
              <input
                type="text"
                value={preferredRoles}
                onChange={(e) => setPreferredRoles(e.target.value)}
                placeholder="e.g. Software Engineer, AI Intern"
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-1 focus:ring-emerald-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Preferred Work Mode</label>
              <select
                value={preferredMode}
                onChange={(e) => setPreferredMode(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-1 focus:ring-emerald-700 focus:outline-none bg-white"
              >
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
              </select>
            </div>
          </div>

          {/* Resume Upload in Edit */}
          <div>
            <label className="block font-semibold text-stone-700 mb-1">
              Upload New Resume (PDF only, max 5 MB)
            </label>
            <div className="flex items-center justify-between border border-stone-300 rounded-lg p-3 bg-stone-50">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-rose-600" />
                <span className="font-semibold text-stone-800">{resumeFilename}</span>
                <span className="text-[10px] text-stone-400">({resumeSizeMb} MB)</span>
              </div>
              <label className="px-3 py-1 bg-white border border-stone-200 hover:bg-stone-100 rounded text-xs font-semibold cursor-pointer">
                Browse PDF
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3.5 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors shadow-xs"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
