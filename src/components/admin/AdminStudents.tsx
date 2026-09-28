import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Student } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';
import { Plus, Edit2, UserX, UserCheck, Eye, AlertCircle, AlertTriangle } from 'lucide-react';

export const AdminStudents: React.FC = () => {
  const { students, addStudent, editStudent, deactivateStudent } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [confirmDeactivateId, setConfirmDeactivateId] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [gpa, setGpa] = useState('3.75');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setDepartment('Computer Science & Engineering');
    setGpa('3.75');
    setErrorMsg(null);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const parsedGpa = parseFloat(gpa);
    if (isNaN(parsedGpa) || parsedGpa < 0.0 || parsedGpa > 10.0) {
      setErrorMsg('GPA must be between 0.00 and 10.00');
      return;
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      setErrorMsg('Phone number must be between 10 and 15 digits');
      return;
    }

    const res = addStudent({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: cleanPhone,
      department: department.trim(),
      gpa: parsedGpa,
      resume_filename: `${name.replace(/\s+/g, '_')}_Resume.pdf`,
      resume_size_mb: 1.2,
    });

    if (!res.success) {
      setErrorMsg(res.error || 'Failed to add student');
      return;
    }

    setShowAddModal(false);
    resetForm();
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    setErrorMsg(null);

    const parsedGpa = parseFloat(gpa);
    if (isNaN(parsedGpa) || parsedGpa < 0.0 || parsedGpa > 10.0) {
      setErrorMsg('GPA must be between 0.00 and 10.00');
      return;
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      setErrorMsg('Phone must be 10–15 digits');
      return;
    }

    const res = editStudent(editingStudent.id, {
      name: name.trim(),
      phone: cleanPhone,
      department: department.trim(),
      gpa: parsedGpa,
    });

    if (!res.success) {
      setErrorMsg(res.error || 'Failed to update student');
      return;
    }

    setEditingStudent(null);
    resetForm();
  };

  const startEdit = (student: Student) => {
    setEditingStudent(student);
    setName(student.name);
    setEmail(student.email);
    setPhone(student.phone);
    setDepartment(student.department);
    setGpa(student.gpa.toString());
    setErrorMsg(null);
  };

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Student Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Administer enrolled student records, academic GPAs, credentials, and account activation states
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors"
        >
          <Plus size={14} />
          <span>Register Student</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">GPA</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((std) => (
                <tr key={std.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    {std.name}
                    {std.placed && (
                      <span className="block text-[11px] text-emerald-700 font-normal">
                        Placed: {std.placed_company}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {std.email}
                  </td>
                  <td className="py-3.5 px-4 text-slate-700">
                    {std.department}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 tabular-nums">
                    {std.gpa.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={std.status} size="sm" />
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      onClick={() => setViewingStudent(std)}
                      className="px-2 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200"
                    >
                      View
                    </button>
                    <button
                      onClick={() => startEdit(std)}
                      className="px-2 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setConfirmDeactivateId(std.id)}
                      className={`px-2 py-1 text-xs font-medium rounded border ${
                        std.status === 'active'
                          ? 'text-rose-700 bg-rose-50 hover:bg-rose-100 border-rose-200'
                          : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200'
                      }`}
                    >
                      {std.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Register New Student"
        subtitle="Add a student account to the relational database"
        maxWidth="md"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-800 mb-1">Student Full Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Bhumika Rathod"
              className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-800 mb-1">College Email Address *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="student.name@college.edu"
              className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">Phone (10–15 digits) *</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                placeholder="9876543210"
                className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">GPA / CGPA (0.00 to 10.00) *</label>
              <input
                type="number"
                step="0.01"
                min="0.0"
                max="10.0"
                value={gpa}
                onChange={(e) => setGpa(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none tabular-nums"
              />
            </div>
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

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded"
            >
              Register Student
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Student Modal */}
      {editingStudent && (
        <Modal
          isOpen={true}
          onClose={() => setEditingStudent(null)}
          title={`Edit Student — ${editingStudent.name}`}
          maxWidth="md"
        >
          <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-800 mb-1">Student Full Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-500 mb-1">Email (Primary Key)</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-3 py-2 border border-slate-200 bg-slate-100 text-slate-500 rounded text-xs cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">Phone *</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">GPA / CGPA (0.00 to 10.00) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.0"
                  max="10.0"
                  value={gpa}
                  onChange={(e) => setGpa(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none tabular-nums"
                />
              </div>
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

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setEditingStudent(null)}
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
        </Modal>
      )}

      {/* View Student Details Modal */}
      {viewingStudent && (
        <Modal
          isOpen={true}
          onClose={() => setViewingStudent(null)}
          title={`Student Profile — ${viewingStudent.name}`}
          maxWidth="md"
        >
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Official Email:</span>
                <span className="font-semibold text-slate-900">{viewingStudent.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Contact Phone:</span>
                <span className="font-semibold text-slate-900 tabular-nums">{viewingStudent.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Academic Department:</span>
                <span className="font-semibold text-slate-900">{viewingStudent.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Cumulative GPA:</span>
                <span className="font-bold text-slate-900 tabular-nums">{viewingStudent.gpa.toFixed(2)} / 4.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Account Status:</span>
                <StatusBadge status={viewingStudent.status} size="sm" />
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Placement Offer:</span>
                <span className="font-semibold text-slate-800">
                  {viewingStudent.placed ? `Yes (${viewingStudent.placed_company})` : 'In Progress'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Verified Resume:</span>
                <span className="font-mono text-[11px] text-slate-700">{viewingStudent.resume_filename}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewingStudent(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirmation for Deactivate */}
      {confirmDeactivateId && (
        <Modal
          isOpen={true}
          onClose={() => setConfirmDeactivateId(null)}
          title="Confirm Account Status Change"
          maxWidth="sm"
        >
          <div className="space-y-3 text-xs text-slate-700">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded flex items-start gap-2">
              <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="text-amber-800">
                Are you sure you want to change the status of this student account? Deactivating will prevent future logins and freeze active applications.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmDeactivateId(null)}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deactivateStudent(confirmDeactivateId);
                  setConfirmDeactivateId(null);
                }}
                className="px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded"
              >
                Confirm Status Change
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
