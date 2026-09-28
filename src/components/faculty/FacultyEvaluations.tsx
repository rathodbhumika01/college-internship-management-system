import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StarRating } from '../common/StarRating';
import { Award, CheckCircle2, AlertCircle, Plus } from 'lucide-react';
import { Modal } from '../common/Modal';

export const FacultyEvaluations: React.FC = () => {
  const { students, internships, evaluations, submitEvaluation } = useApp();

  const [showModal, setShowModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');
  const [selectedInternshipId, setSelectedInternshipId] = useState(internships[0]?.id || '');

  // 1-5 ratings
  const [techSkills, setTechSkills] = useState(5);
  const [softSkills, setSoftSkills] = useState(4);
  const [punctuality, setPunctuality] = useState(5);
  const [responsibility, setResponsibility] = useState(5);
  const [teamwork, setTeamwork] = useState(4);
  const [learningAbility, setLearningAbility] = useState(5);

  const [comments, setComments] = useState('');
  const [hireLikelihood, setHireLikelihood] = useState<'high' | 'moderate' | 'low'>('high');

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const student = students.find(s => s.id === selectedStudentId);
    const internship = internships.find(i => i.id === selectedInternshipId);

    if (!student || !internship) {
      setErrorMsg('Please select a student and internship.');
      return;
    }

    if (!comments.trim()) {
      setErrorMsg('Please enter evaluation comments.');
      return;
    }

    const res = submitEvaluation({
      student_id: student.id,
      student_name: student.name,
      internship_id: internship.id,
      internship_title: internship.title,
      company_name: internship.company_name,
      technical_skills: techSkills,
      soft_skills: softSkills,
      punctuality,
      responsibility,
      teamwork,
      learning_ability: learningAbility,
      comments: comments.trim(),
      hire_likelihood: hireLikelihood,
    });

    if (res.success) {
      setSuccessMsg(`Evaluation recorded successfully for ${student.name}.`);
      setShowModal(false);
      setComments('');
      setTimeout(() => setSuccessMsg(null), 3000);
    } else {
      setErrorMsg(res.error || 'Failed to submit evaluation.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Student Performance Evaluations
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Conduct formal faculty assessments on intern competency, professional conduct, and hiring likelihood
          </p>
        </div>
        <button
          onClick={() => {
            setErrorMsg(null);
            setShowModal(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors"
        >
          <Plus size={14} />
          <span>New Evaluation</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded text-xs flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Evaluations Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        {evaluations.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No student evaluations recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Internship & Company</th>
                  <th className="py-3 px-4">Average Rating</th>
                  <th className="py-3 px-4">Hire Likelihood</th>
                  <th className="py-3 px-4">Comments</th>
                  <th className="py-3 px-4">Evaluated By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {evaluations.map((evalItem) => (
                  <tr key={evalItem.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {evalItem.student_name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      <span className="font-medium block">{evalItem.internship_title}</span>
                      <span className="text-[11px] text-slate-500">{evalItem.company_name}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <StarRating value={evalItem.average_score} readOnly size="sm" />
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block font-semibold px-2 py-0.5 rounded text-[11px] capitalize ${
                          evalItem.hire_likelihood === 'high'
                            ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                            : evalItem.hire_likelihood === 'moderate'
                            ? 'text-amber-800 bg-amber-50 border border-amber-200'
                            : 'text-slate-600 bg-slate-100 border border-slate-200'
                        }`}
                      >
                        {evalItem.hire_likelihood}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate" title={evalItem.comments}>
                      {evalItem.comments}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {evalItem.faculty_name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Evaluation Modal Form */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Student Performance Evaluation Form"
        subtitle="Grade the student across 6 core competency rubrics"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Select Student *
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-none"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.department})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Internship Program *
              </label>
              <select
                value={selectedInternshipId}
                onChange={(e) => setSelectedInternshipId(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-none"
              >
                {internships.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.title} — {i.company_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 6 Criteria: Technical Skills, Soft Skills / Communication, Punctuality, Responsibility, Teamwork, Learning Ability */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100">
            <span className="font-semibold text-slate-800 block text-xs">
              Performance Criteria (1–5 Stars):
            </span>

            <div className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded">
              <span className="font-medium text-slate-700">1. Technical Skills</span>
              <StarRating value={techSkills} onChange={setTechSkills} size="sm" />
            </div>

            <div className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded">
              <span className="font-medium text-slate-700">2. Soft Skills / Communication</span>
              <StarRating value={softSkills} onChange={setSoftSkills} size="sm" />
            </div>

            <div className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded">
              <span className="font-medium text-slate-700">3. Punctuality</span>
              <StarRating value={punctuality} onChange={setPunctuality} size="sm" />
            </div>

            <div className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded">
              <span className="font-medium text-slate-700">4. Responsibility</span>
              <StarRating value={responsibility} onChange={setResponsibility} size="sm" />
            </div>

            <div className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded">
              <span className="font-medium text-slate-700">5. Teamwork</span>
              <StarRating value={teamwork} onChange={setTeamwork} size="sm" />
            </div>

            <div className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded">
              <span className="font-medium text-slate-700">6. Learning Ability</span>
              <StarRating value={learningAbility} onChange={setLearningAbility} size="sm" />
            </div>
          </div>

          {/* Likelihood to hire full time */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Likelihood to Hire Full-Time *
            </label>
            <select
              value={hireLikelihood}
              onChange={(e) => setHireLikelihood(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-none"
            >
              <option value="high">High — Recommended for PPO (Pre-Placement Offer)</option>
              <option value="moderate">Moderate — Satisfactory performance, potential candidate</option>
              <option value="low">Low — Requires further technical skill development</option>
            </select>
          </div>

          {/* Comments */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Comments & Summary Remarks *
            </label>
            <textarea
              rows={3}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              required
              placeholder="Provide constructive assessment comments on the student's project contributions..."
              className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded"
            >
              Submit Evaluation
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
