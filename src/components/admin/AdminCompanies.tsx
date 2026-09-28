import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Company } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';
import { Plus, Edit2, AlertCircle, AlertTriangle, Building2 } from 'lucide-react';

export const AdminCompanies: React.FC = () => {
  const { companies, addCompany, editCompany, archiveCompany } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [viewingCompany, setViewingCompany] = useState<Company | null>(null);
  const [confirmArchiveId, setConfirmArchiveId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [location, setLocation] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [industry, setIndustry] = useState('Enterprise Software');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const resetForm = () => {
    setName('');
    setRegNumber('');
    setLocation('');
    setContactPerson('');
    setContactEmail('');
    setContactPhone('');
    setIndustry('Enterprise Software');
    setErrorMsg(null);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const res = addCompany({
      name: name.trim(),
      reg_number: regNumber.trim().toUpperCase(),
      location: location.trim(),
      contact_person: contactPerson.trim(),
      contact_email: contactEmail.trim().toLowerCase(),
      contact_phone: contactPhone.trim(),
      industry: industry.trim(),
    });

    if (!res.success) {
      setErrorMsg(res.error || 'Failed to register company');
      return;
    }

    setShowAddModal(false);
    resetForm();
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCompany) return;
    setErrorMsg(null);

    const res = editCompany(editingCompany.id, {
      name: name.trim(),
      reg_number: regNumber.trim().toUpperCase(),
      location: location.trim(),
      contact_person: contactPerson.trim(),
      contact_email: contactEmail.trim().toLowerCase(),
      contact_phone: contactPhone.trim(),
      industry: industry.trim(),
    });

    if (!res.success) {
      setErrorMsg(res.error || 'Failed to edit company');
      return;
    }

    setEditingCompany(null);
    resetForm();
  };

  const startEdit = (c: Company) => {
    setEditingCompany(c);
    setName(c.name);
    setRegNumber(c.reg_number);
    setLocation(c.location);
    setContactPerson(c.contact_person);
    setContactEmail(c.contact_email);
    setContactPhone(c.contact_phone);
    setIndustry(c.industry);
    setErrorMsg(null);
  };

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Corporate Hiring Partners
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Administer participating companies, unique tax/corporate registration IDs, and official recruiter contacts
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
          <span>Add Company</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Company</th>
                <th className="py-3 px-4">Registration Number</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Contact Person</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {companies.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    {c.name}
                    <span className="block text-[11px] text-slate-400 font-normal">
                      {c.industry}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-700">
                    {c.reg_number}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {c.location}
                  </td>
                  <td className="py-3.5 px-4 text-slate-700">
                    {c.contact_person}
                    <span className="block text-[11px] text-slate-400">
                      {c.contact_email}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={c.status} size="sm" />
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      onClick={() => setViewingCompany(c)}
                      className="px-2 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200"
                    >
                      View
                    </button>
                    <button
                      onClick={() => startEdit(c)}
                      className="px-2 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setConfirmArchiveId(c.id)}
                      className={`px-2 py-1 text-xs font-medium rounded border ${
                        c.status === 'active'
                          ? 'text-rose-700 bg-rose-50 hover:bg-rose-100 border-rose-200'
                          : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200'
                      }`}
                    >
                      {c.status === 'active' ? 'Archive Company' : 'Restore'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Company Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Hiring Partner Company"
        subtitle="Registers a hiring partner with unique business registration number"
        maxWidth="md"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-800 mb-1">Company Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. TechNova Solutions"
              className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Registration Number (Must be Unique) *
            </label>
            <input
              type="text"
              value={regNumber}
              onChange={(e) => setRegNumber(e.target.value)}
              required
              placeholder="e.g. TN-2018-8492"
              className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none uppercase font-mono"
            />
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              Checked for uniqueness against database constraint
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">Location *</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                placeholder="Bengaluru, Karnataka"
                className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">Industry Sector *</label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                required
                placeholder="Enterprise Software"
                className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-800 mb-1">Contact Person *</label>
            <input
              type="text"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              required
              placeholder="Mr. Vikram Sen"
              className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">Contact Email *</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                required
                placeholder="recruitment@company.com"
                className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">Contact Phone *</label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                required
                placeholder="9845012345"
                className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
              />
            </div>
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
              Add Company
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Company Modal */}
      {editingCompany && (
        <Modal
          isOpen={true}
          onClose={() => setEditingCompany(null)}
          title={`Edit Company — ${editingCompany.name}`}
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
              <label className="block font-semibold text-slate-800 mb-1">Company Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">Registration Number *</label>
              <input
                type="text"
                value={regNumber}
                onChange={(e) => setRegNumber(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none uppercase font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">Location *</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">Industry Sector *</label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">Contact Person *</label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">Contact Email *</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">Contact Phone *</label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setEditingCompany(null)}
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

      {/* View Company Modal */}
      {viewingCompany && (
        <Modal
          isOpen={true}
          onClose={() => setViewingCompany(null)}
          title={`Company Details — ${viewingCompany.name}`}
          maxWidth="md"
        >
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Corporate Reg Number:</span>
                <span className="font-mono text-[11px] font-semibold text-slate-900">{viewingCompany.reg_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Operating Location:</span>
                <span className="font-semibold text-slate-900">{viewingCompany.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Industry Sector:</span>
                <span className="font-semibold text-slate-900">{viewingCompany.industry}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Recruiter Contact:</span>
                <span className="font-semibold text-slate-900">{viewingCompany.contact_person}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Contact Email:</span>
                <span>{viewingCompany.contact_email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Contact Phone:</span>
                <span className="tabular-nums">{viewingCompany.contact_phone}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Partnership Status:</span>
                <StatusBadge status={viewingCompany.status} size="sm" />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewingCompany(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Archive confirmation */}
      {confirmArchiveId && (
        <Modal
          isOpen={true}
          onClose={() => setConfirmArchiveId(null)}
          title="Confirm Archive Status"
          maxWidth="sm"
        >
          <div className="space-y-3 text-xs text-slate-700">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded flex items-start gap-2">
              <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="text-amber-800">
                Are you sure you want to update the archive state for this hiring partner? Archiving will hide active postings associated with this company.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmArchiveId(null)}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  archiveCompany(confirmArchiveId);
                  setConfirmArchiveId(null);
                }}
                className="px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded"
              >
                Archive Company
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
