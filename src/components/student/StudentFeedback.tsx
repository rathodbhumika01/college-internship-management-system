import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StarRating } from '../common/StarRating';
import { Star, CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react';

export const StudentFeedback: React.FC = () => {
  const { currentStudent, internships, applications, studentFeedbacks, submitStudentFeedback } = useApp();

  // Find internships student has applied for or accepted
  const eligibleApps = applications.filter(
    a => a.student_id === currentStudent?.id && (a.status === 'accepted' || a.status === 'shortlisted')
  );

  const eligibleInternships = internships.filter(i =>
    eligibleApps.some(a => a.internship_id === i.id)
  );

  const [selectedInternshipId, setSelectedInternshipId] = useState<string>(
    eligibleInternships[0]?.id || ''
  );

  // 1 to 5 ratings
  const [companyCulture, setCompanyCulture] = useState<number>(5);
  const [mentorshipQuality, setMentorshipQuality] = useState<number>(5);
  const [technicalLearning, setTechnicalLearning] = useState<number>(5);
  const [workEnvironment, setWorkEnvironment] = useState<number>(5);
  const [overallExperience, setOverallExperience] = useState<number>(5);
  const [comments, setComments] = useState<string>('');

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Student's previous feedbacks
  const myFeedbacks = studentFeedbacks.filter(f => f.student_id === currentStudent?.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!selectedInternshipId) {
      setErrorMsg('Please select an internship to review.');
      return;
    }

    if (!comments.trim()) {
      setErrorMsg('Please enter your comments or suggestions.');
      return;
    }

    const selectedInternship = internships.find(i => i.id === selectedInternshipId);
    if (!selectedInternship) return;

    const res = submitStudentFeedback(selectedInternshipId, {
      company_id: selectedInternship.company_id,
      company_culture: companyCulture,
      mentorship_quality: mentorshipQuality,
      technical_learning: technicalLearning,
      work_environment: workEnvironment,
      overall_experience: overallExperience,
      comments: comments.trim(),
    });

    if (res.success) {
      setSuccessMsg('Thank you! Your feedback has been recorded in the database.');
      setComments('');
      setTimeout(() => setSuccessMsg(null), 4000);
    } else {
      setErrorMsg(res.error || 'Failed to submit feedback.');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Title */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Internship Feedback
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Submit your post-internship evaluation to help faculty assess hiring partners and guide juniors
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-start gap-2.5">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block">{successMsg}</span>
            <span className="text-[11px] text-emerald-700">
              Your evaluation has been recorded and submitted to the placement coordinators.
            </span>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded text-xs flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
          Submit New Evaluation
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {/* Select Internship */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Select Completed / Active Internship *
            </label>
            <select
              value={selectedInternshipId}
              onChange={(e) => setSelectedInternshipId(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              {eligibleInternships.length === 0 ? (
                <option value="">No completed or accepted internships found</option>
              ) : (
                eligibleInternships.map(i => (
                  <option key={i.id} value={i.id}>
                    {i.title} — {i.company_name} ({i.domain})
                  </option>
                ))
              )}
            </select>
          </div>

          {/* 5 Rating Criteria */}
          <div className="space-y-3.5 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded">
              <div>
                <span className="font-semibold text-slate-800 block text-xs">Company Culture</span>
                <span className="text-[11px] text-slate-500">Inclusivity, ethics, and team collaboration</span>
              </div>
              <StarRating value={companyCulture} onChange={setCompanyCulture} />
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded">
              <div>
                <span className="font-semibold text-slate-800 block text-xs">Mentorship Quality</span>
                <span className="text-[11px] text-slate-500">Guidance, feedback, and technical support from senior engineers</span>
              </div>
              <StarRating value={mentorshipQuality} onChange={setMentorshipQuality} />
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded">
              <div>
                <span className="font-semibold text-slate-800 block text-xs">Technical Learning</span>
                <span className="text-[11px] text-slate-500">Relevance to DBMS, modern stacks, and practical industry engineering</span>
              </div>
              <StarRating value={technicalLearning} onChange={setTechnicalLearning} />
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded">
              <div>
                <span className="font-semibold text-slate-800 block text-xs">Work Environment</span>
                <span className="text-[11px] text-slate-500">Work-life balance, tool access, and infrastructure</span>
              </div>
              <StarRating value={workEnvironment} onChange={setWorkEnvironment} />
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded">
              <div>
                <span className="font-semibold text-slate-800 block text-xs">Overall Experience</span>
                <span className="text-[11px] text-slate-500">General satisfaction with the overall internship tenure</span>
              </div>
              <StarRating value={overallExperience} onChange={setOverallExperience} />
            </div>
          </div>

          {/* Comments / Suggestions */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Comments / Suggestions *
            </label>
            <textarea
              rows={4}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              required
              placeholder="Share specific insights, project highlights, or recommendations for future students..."
              className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Submit */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors"
            >
              Submit Feedback
            </button>
          </div>
        </form>
      </div>

      {/* Submitted Feedbacks List */}
      <div className="space-y-3 pt-4 border-t border-slate-200">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Previously Submitted Feedbacks ({myFeedbacks.length})
        </h2>

        {myFeedbacks.length === 0 ? (
          <div className="p-4 bg-white border border-slate-200 rounded text-xs text-slate-500 text-center">
            No previous feedback records found for your account.
          </div>
        ) : (
          <div className="space-y-3">
            {myFeedbacks.map((fb) => (
              <div key={fb.id} className="bg-white border border-slate-200 rounded-lg p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 text-sm">
                    {fb.company_name}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500">Average:</span>
                    <StarRating value={fb.average_rating} readOnly size="sm" />
                  </div>
                </div>

                <p className="text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-100 italic">
                  "{fb.comments}"
                </p>

                <div className="text-[11px] text-slate-400 tabular-nums">
                  Submitted: {new Date(fb.submitted_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
