import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SystemFeedback, SystemFeedbackType } from '../../types';
import { MessageSquare, Plus, CheckCircle2, AlertCircle } from 'lucide-react';

export const AdminSystemFeedback: React.FC = () => {
  const { systemFeedbacks, submitSystemFeedback } = useApp();

  const [feedbackType, setFeedbackType] = useState<SystemFeedbackType>('feature_request');
  const [description, setDescription] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!description.trim()) {
      setErrorMsg('Please enter feedback details.');
      return;
    }

    const res = submitSystemFeedback(feedbackType, description);
    if (res.success) {
      setSuccessMsg('Feedback submitted successfully and logged into system table.');
      setDescription('');
      setTimeout(() => setSuccessMsg(null), 3000);
    } else {
      setErrorMsg(res.error || 'Failed to submit feedback');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          System Feedback &amp; Issues
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Submit portal bug reports or feature requests and review user suggestions across all roles
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Submit Feedback Form */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Submit New Feedback
          </h2>

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded text-xs flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded text-xs flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Feedback Type *
              </label>
              <select
                value={feedbackType}
                onChange={(e) => setFeedbackType(e.target.value as SystemFeedbackType)}
                className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-none"
              >
                <option value="feature_request">Feature Request</option>
                <option value="bug_report">Bug Report</option>
                <option value="suggestion">Suggestion</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Description &amp; Details *
              </label>
              <textarea
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                placeholder="Describe your bug report, suggestion, or system feature request in detail..."
                className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none leading-relaxed"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors"
            >
              Submit Feedback
            </button>
          </form>
        </div>

        {/* Feedback Audit Table */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <MessageSquare size={16} className="text-slate-600" />
              Received System Feedbacks ({systemFeedbacks.length})
            </h2>
            <span className="text-xs text-slate-400">Database table: system_feedback</span>
          </div>

          <div className="space-y-3">
            {systemFeedbacks.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                No system feedbacks registered yet.
              </div>
            ) : (
              systemFeedbacks.map((fb) => (
                <div key={fb.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 capitalize">
                        {fb.feedback_type.replace('_', ' ')}
                      </span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-600 capitalize">{fb.user_role} ({fb.user_name})</span>
                    </div>
                    <span className="text-[11px] text-slate-400 tabular-nums">
                      {new Date(fb.submitted_at).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-slate-700 bg-white p-2.5 rounded border border-slate-100 leading-relaxed">
                    {fb.description}
                  </p>

                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-500">Status: <strong className="text-slate-700 capitalize">{fb.status.replace('_', ' ')}</strong></span>
                    <span className="font-mono text-slate-400">ID: {fb.id}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
