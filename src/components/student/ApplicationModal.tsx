import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Internship } from '../../types';
import { useApp } from '../../context/AppContext';
import { FileText, CheckCircle2, AlertCircle, Upload } from 'lucide-react';

interface ApplicationModalProps {
  internship: Internship | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ApplicationModal: React.FC<ApplicationModalProps> = ({
  internship,
  isOpen,
  onClose,
}) => {
  const { applyForInternship, currentStudent, showToast } = useApp();
  const [coverLetter, setCoverLetter] = useState(
    'I am keen to contribute my skills in software design, problem solving, and analytical thinking to this internship position.'
  );
  const [qualifications, setQualifications] = useState(
    currentStudent ? `${currentStudent.department} | Current GPA: ${currentStudent.gpa.toFixed(2)}` : ''
  );
  const [resumeFile, setResumeFile] = useState<{ name: string; sizeMb: number }>({
    name: currentStudent?.resume_filename || 'Bhumika_Rathod_Resume.pdf',
    sizeMb: currentStudent?.resume_size_mb || 1.4,
  });

  const [validationError, setValidationError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!internship) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValidationError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setValidationError('Resume must be a PDF file only.');
      return;
    }

    const sizeInMb = file.size / (1024 * 1024);
    if (sizeInMb > 5.0) {
      setValidationError(`Selected file is ${sizeInMb.toFixed(2)} MB. Maximum allowed size is 5.0 MB.`);
      return;
    }

    setResumeFile({
      name: file.name,
      sizeMb: parseFloat(sizeInMb.toFixed(2)),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!coverLetter.trim()) {
      setValidationError('Please enter a cover letter.');
      return;
    }

    setIsSubmitting(true);
    const res = applyForInternship(internship.id, coverLetter, qualifications, resumeFile);
    setIsSubmitting(false);

    if (!res.success) {
      setValidationError(res.error || 'Failed to submit application.');
    } else {
      setSuccessMessage('Application submitted successfully.');
      showToast('Application submitted successfully.', 'success');
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 1500);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Internship Application"
      subtitle={`${internship.title} · ${internship.company_name}`}
      maxWidth="lg"
    >
      {successMessage ? (
        <div className="py-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
            <CheckCircle2 size={28} />
          </div>
          <h4 className="text-base font-bold text-stone-900">{successMessage}</h4>
          <p className="text-xs text-stone-500">
            Your application status is now updated to <strong>Applied</strong> and forwarded to the faculty coordinator.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {validationError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Internship & Company Header */}
          <div className="p-3.5 bg-stone-50 border border-stone-200/80 rounded-xl space-y-1.5 text-stone-700">
            <div className="flex justify-between items-center">
              <span className="text-[11px] text-stone-500 font-medium">Internship Role:</span>
              <span className="font-bold text-stone-900">{internship.title}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[11px] text-stone-500 font-medium">Company:</span>
              <span className="font-semibold text-emerald-800">{internship.company_name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[11px] text-stone-500 font-medium">Student Applicant:</span>
              <span className="font-semibold text-stone-900">{currentStudent?.name || 'Student'}</span>
            </div>
          </div>

          {/* Resume Upload / Verification */}
          <div>
            <label className="block font-semibold text-stone-800 mb-1">
              Resume * (PDF only, up to 5 MB)
            </label>
            <div className="border border-stone-200 rounded-xl p-3 bg-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200/80 flex items-center justify-center text-rose-600">
                  <FileText size={16} />
                </div>
                <div>
                  <span className="font-semibold text-stone-900 block truncate max-w-[200px]">
                    {resumeFile.name}
                  </span>
                  <span className="text-[11px] text-stone-400">
                    {resumeFile.sizeMb.toFixed(2)} MB · Validated PDF
                  </span>
                </div>
              </div>

              <label className="px-3 py-1.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg cursor-pointer transition-colors flex items-center gap-1.5">
                <Upload size={13} />
                <span>Replace</span>
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Cover Letter */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block font-semibold text-stone-800">
                Cover Letter *
              </label>
              <span className="text-[10px] text-stone-400">Explain your interest &amp; fit</span>
            </div>
            <textarea
              rows={4}
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              required
              placeholder="Describe your motivation, relevant coursework, and why you are interested in this position..."
              className="w-full p-3 border border-stone-300 rounded-xl text-xs focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700 focus:outline-none"
            />
          </div>

          {/* Dialog Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 disabled:bg-emerald-700/60 rounded-lg transition-colors shadow-xs"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
