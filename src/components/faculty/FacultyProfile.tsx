import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, Mail, Phone, GraduationCap, Building2, Check, AlertCircle } from 'lucide-react';

export const FacultyProfile: React.FC = () => {
  const { currentFaculty, editFaculty } = useApp();

  const [name, setName] = useState(currentFaculty?.name || '');
  const [phone, setPhone] = useState(currentFaculty?.phone || '');
  const [department, setDepartment] = useState(currentFaculty?.department || '');
  const [designation, setDesignation] = useState(currentFaculty?.designation || '');

  const [isEditing, setIsEditing] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!currentFaculty) return <div className="text-xs text-slate-500">Faculty profile not found.</div>;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    editFaculty(currentFaculty.id, {
      name: name.trim(),
      phone: phone.trim(),
      department: department.trim(),
      designation: designation.trim(),
    });
    setSuccessMsg('Faculty profile updated successfully.');
    setIsEditing(false);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Faculty Profile
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Faculty Coordinator &amp; Internship Supervisor details
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded"
          >
            Edit Profile
          </button>
        )}
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded text-xs flex items-center gap-2">
          <Check size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-lg p-6">
        {!isEditing ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <span className="text-[11px] text-slate-500 block mb-0.5">Faculty Name</span>
              <span className="font-semibold text-slate-900 text-sm">{currentFaculty.name}</span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <span className="text-[11px] text-slate-500 block mb-0.5">Institutional Email</span>
              <span className="font-semibold text-slate-900 text-sm">{currentFaculty.email}</span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <span className="text-[11px] text-slate-500 block mb-0.5">Contact Phone</span>
              <span className="font-semibold text-slate-900 text-sm tabular-nums">{currentFaculty.phone}</span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <span className="text-[11px] text-slate-500 block mb-0.5">Department</span>
              <span className="font-semibold text-slate-900 text-sm">{currentFaculty.department}</span>
            </div>

            <div className="sm:col-span-2 p-3 bg-slate-50 border border-slate-200 rounded">
              <span className="text-[11px] text-slate-500 block mb-0.5">Academic Designation</span>
              <span className="font-semibold text-slate-900 text-sm">{currentFaculty.designation}</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-500 mb-1">Email (Read-only)</label>
                <input
                  type="email"
                  value={currentFaculty.email}
                  disabled
                  className="w-full px-3 py-2 border border-slate-200 bg-slate-100 text-slate-500 rounded text-xs cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">Contact Phone *</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">Department *</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-800 mb-1">Designation *</label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
