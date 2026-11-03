import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Edit3, 
  Search, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Mail, 
  Building, 
  Clock,
  Sparkles,
  UserCheck
} from 'lucide-react';

export default function WhitelistTab({ onQuickLoginAs }) {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Single Add Form
  const [newEmail, setNewEmail] = useState('');
  const [newFirstName, setNewFirstName] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);
  const [adding, setAdding] = useState(false);

  // Batch Import Modal
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchText, setBatchText] = useState('');
  const [batchResult, setBatchResult] = useState(null);
  const [batchLoading, setBatchLoading] = useState(false);

  // Edit Modal
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    fetchWhitelist();
  }, []);

  const fetchWhitelist = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/whitelist');
      const data = await res.json();
      setEmails(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching authorized emails:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmail = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setAdding(true);

    try {
      const res = await fetch('/api/whitelist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newEmail.trim(),
          firstName: newFirstName.trim(),
          notes: newNotes.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to add authorized email');
      }

      setFormSuccess(`Successfully authorized ${data.email}!`);
      setNewEmail('');
      setNewFirstName('');
      setNewNotes('');
      fetchWhitelist();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleBatchImport = async (e) => {
    e.preventDefault();
    if (!batchText.trim()) return;
    setBatchLoading(true);
    setBatchResult(null);

    try {
      const res = await fetch('/api/whitelist/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails: batchText })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Batch import failed');
      }

      setBatchResult(data);
      fetchWhitelist();
    } catch (err) {
      setBatchResult({ error: err.message });
    } finally {
      setBatchLoading(false);
    }
  };

  const handleDelete = async (id, email) => {
    if (!window.confirm(`Are you sure you want to remove authorization for "${email}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/whitelist/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete email');
      fetchWhitelist();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      const res = await fetch(`/api/whitelist/${editingItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: editingItem.email,
          firstName: editingItem.firstName,
          notes: editingItem.notes
        })
      });

      if (!res.ok) throw new Error('Failed to update email record');
      setEditingItem(null);
      fetchWhitelist();
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredEmails = emails.filter((item) => {
    const q = search.toLowerCase();
    return (
      item.email.toLowerCase().includes(q) ||
      (item.firstName && item.firstName.toLowerCase().includes(q)) ||
      (item.notes && item.notes.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Authorized Team Emails
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage who is authorized to log in, take quizzes, and record assessment results.
          </p>
        </div>

        <button
          onClick={() => { setShowBatchModal(true); setBatchResult(null); setBatchText(''); }}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all"
        >
          <Upload className="w-4 h-4 text-brand-300" />
          <span>Batch Import Emails</span>
        </button>
      </div>

      {/* Add New Authorized Email Form Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
            <UserPlus className="w-4 h-4" />
          </div>
          <h3 className="font-extrabold text-slate-900 text-sm">Add New Authorized Email</h3>
        </div>

        {formError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {formSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{formSuccess}</span>
          </div>
        )}

        <form onSubmit={handleAddEmail} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-5">
            <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="colleague@company.com"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="sm:col-span-3">
            <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
              First Name
            </label>
            <input
              type="text"
              value={newFirstName}
              onChange={(e) => setNewFirstName(e.target.value)}
              placeholder="e.g. Jordan"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
              Team / Department
            </label>
            <input
              type="text"
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              placeholder="e.g. Operations"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={adding}
              className="w-full py-2 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-600/20 transition-all flex items-center justify-center space-x-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{adding ? 'Adding...' : 'Authorize'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Authorized Emails List Card */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm space-y-0">
        {/* Search header */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <h3 className="font-extrabold text-slate-900 text-sm">
              Authorized Members ({filteredEmails.length})
            </h3>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search authorized emails..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading authorized list...</div>
        ) : filteredEmails.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Mail className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-700">No authorized emails match</p>
            <p className="text-[11px] text-slate-400">Use the form above to authorize team members.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-6 font-bold">Authorized Email</th>
                  <th className="py-3 px-6 font-bold">First Name</th>
                  <th className="py-3 px-6 font-bold">Department / Role</th>
                  <th className="py-3 px-6 font-bold">Quizzes Completed</th>
                  <th className="py-3 px-6 font-bold">Avg Score</th>
                  <th className="py-3 px-6 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEmails.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-6 font-bold text-slate-900 flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span>{item.email}</span>
                    </td>
                    <td className="py-3.5 px-6 font-medium text-slate-700">
                      {item.firstName || <span className="text-slate-400 italic">Not set</span>}
                    </td>
                    <td className="py-3.5 px-6">
                      {item.notes ? (
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-600 font-medium">
                          {item.notes}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">General</span>
                      )}
                    </td>
                    <td className="py-3.5 px-6 font-semibold text-slate-800">
                      {item.completedCount || 0} quiz(zes)
                    </td>
                    <td className="py-3.5 px-6">
                      {item.avgScore !== null ? (
                        <span className="font-bold text-slate-900">{item.avgScore}%</span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {/* Quick switch to test as this member */}
                        {onQuickLoginAs && (
                          <button
                            onClick={() => onQuickLoginAs(item.email, item.firstName || 'Team Member')}
                            title="Test login as this user"
                            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setEditingItem(item)}
                          title="Edit details"
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.email)}
                          title="Revoke authorization"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Batch Import Modal */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Upload className="w-5 h-5 text-brand-600" />
                <h3 className="text-lg font-extrabold text-slate-900">Batch Authorize Emails</h3>
              </div>
              <button
                onClick={() => setShowBatchModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ×
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Paste multiple email addresses below separated by commas, semicolons, or new lines. They will all be granted access instantly.
            </p>

            <form onSubmit={handleBatchImport} className="space-y-4">
              <textarea
                rows={5}
                required
                value={batchText}
                onChange={(e) => setBatchText(e.target.value)}
                placeholder="sarah.connor@company.com&#10;john.doe@company.com&#10;alice@company.com"
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              ></textarea>

              {batchResult && (
                <div
                  className={`p-3 rounded-xl text-xs ${
                    batchResult.error
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  }`}
                >
                  {batchResult.error ? (
                    batchResult.error
                  ) : (
                    <div>
                      <p className="font-bold">
                        Successfully authorized {batchResult.added?.length || 0} new email(s)!
                      </p>
                      {batchResult.skipped?.length > 0 && (
                        <p className="mt-1 text-[11px] text-emerald-700">
                          {batchResult.skipped.length} email(s) were already authorized or invalid.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBatchModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={batchLoading}
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md"
                >
                  {batchLoading ? 'Importing...' : 'Authorize All'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-4 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-extrabold text-slate-900">Edit Authorized Member</h3>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={editingItem.email}
                  onChange={(e) => setEditingItem({ ...editingItem, email: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">First Name</label>
                <input
                  type="text"
                  value={editingItem.firstName || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, firstName: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Department / Notes</label>
                <input
                  type="text"
                  value={editingItem.notes || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, notes: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

