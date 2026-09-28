import React from 'react';
import { ApplicationStatus, InternshipStatus, InterviewStatus } from '../../types';

interface StatusBadgeProps {
  status: ApplicationStatus | InternshipStatus | InterviewStatus | 'active' | 'deactivated' | 'selected' | 'on_hold';
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getStyle = () => {
    switch (status) {
      case 'accepted':
      case 'selected':
      case 'approved':
      case 'active':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'shortlisted':
      case 'scheduled':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'pending':
      case 'pending_approval':
      case 'rescheduled':
      case 'on_hold':
        return 'text-amber-800 bg-amber-50 border-amber-200';
      case 'rejected':
      case 'cancelled':
      case 'deactivated':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      case 'withdrawn':
      case 'archived':
      case 'closed':
      case 'completed':
      default:
        return 'text-slate-600 bg-slate-100 border-slate-200';
    }
  };

  const getLabel = () => {
    switch (status) {
      case 'pending':
        return 'Under Review';
      case 'accepted':
      case 'selected':
        return 'Selected';
      case 'pending_approval':
        return 'Pending Approval';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center font-medium rounded border ${getStyle()} ${padding} whitespace-nowrap`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-80" />
      {getLabel()}
    </span>
  );
};
