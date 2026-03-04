import { useState } from 'react';
import { db } from '../config/firebase';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { BedDouble, CheckCircle, XCircle, Clock, MapPin, Phone, FileText, ChevronDown, ChevronUp } from 'lucide-react';

export default function BulkOperations({ accommodationRequests = [], currentAdmin, onUpdate }) {
  const [approveModal, setApproveModal] = useState(null);
  const [approveForm, setApproveForm] = useState({ location: '', contactNumber: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [expandedSection, setExpandedSection] = useState('pending');

  const pending = accommodationRequests.filter(r => r.status === 'pending');
  const approved = accommodationRequests.filter(r => r.status === 'approved');
  const rejected = accommodationRequests.filter(r => r.status === 'rejected');

  const handleApprove = async () => {
    if (!approveForm.location.trim()) return;
    setSubmitting(true);
    try {
      await updateDoc(doc(db, 'accommodation_requests', approveModal.id), {
        status: 'approved',
        location: approveForm.location.trim(),
        contactNumber: approveForm.contactNumber.trim(),
        notes: approveForm.notes.trim(),
        reviewedAt: Timestamp.now(),
        reviewedBy: currentAdmin?.name || 'Admin'
      });
      setApproveModal(null);
      setApproveForm({ location: '', contactNumber: '', notes: '' });
      onUpdate();
    } catch (err) {
      console.error('Error approving request:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async (request) => {
    try {
      await updateDoc(doc(db, 'accommodation_requests', request.id), {
        status: 'rejected',
        reviewedAt: Timestamp.now(),
        reviewedBy: currentAdmin?.name || 'Admin'
      });
      onUpdate();
    } catch (err) {
      console.error('Error rejecting request:', err);
    }
  };

  const Section = ({ title, icon, count, color, id, children }) => (
    <div className="border border-gray-200 rounded-lg overflow-hidden mb-4">
      <button
        onClick={() => setExpandedSection(expandedSection === id ? null : id)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-medium text-gray-800 text-sm">{title}</span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${color}`}>{count}</span>
        </div>
        {expandedSection === id ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
      </button>
      {expandedSection === id && <div className="p-4">{children}</div>}
    </div>
  );

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Operations</h2>
        <p className="text-sm text-gray-500 mt-0.5">Manage accommodation requests and other platform operations.</p>
      </div>

      {/* Accommodation Requests */}
      <div className="flex items-center gap-2 mb-3">
        <BedDouble size={18} className="text-primary-600" />
        <h3 className="font-semibold text-gray-800">Accommodation Requests</h3>
        {pending.length > 0 && (
          <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
            {pending.length} pending
          </span>
        )}
      </div>

      {accommodationRequests.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-10">No accommodation requests yet.</p>
      ) : (
        <>
          <Section
            id="pending"
            title="Pending"
            icon={<Clock size={15} className="text-amber-500" />}
            count={pending.length}
            color="bg-amber-100 text-amber-700"
          >
            {pending.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No pending requests.</p>
            ) : (
              <div className="space-y-3">
                {pending.map(req => (
                  <div key={req.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-amber-50 border border-amber-100 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{req.userName}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {req.userAlumniYear && `Class of ${req.userAlumniYear}`}
                        {req.userVillage && ` · ${req.userVillage}`}
                        {req.userPhone && ` · ${req.userPhone}`}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => { setApproveModal(req); setApproveForm({ location: '', contactNumber: '', notes: '' }); }}
                        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(req)}
                        className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-medium rounded-lg transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>

          <Section
            id="approved"
            title="Approved"
            icon={<CheckCircle size={15} className="text-green-500" />}
            count={approved.length}
            color="bg-green-100 text-green-700"
          >
            {approved.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No approved requests.</p>
            ) : (
              <div className="space-y-3">
                {approved.map(req => (
                  <div key={req.id} className="p-3 bg-green-50 border border-green-100 rounded-lg">
                    <p className="font-medium text-gray-900 text-sm">{req.userName}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {req.userAlumniYear && `Class of ${req.userAlumniYear}`}
                      {req.userVillage && ` · ${req.userVillage}`}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-600">
                      {req.location && <span className="flex items-center gap-1"><MapPin size={12} />{req.location}</span>}
                      {req.contactNumber && <span className="flex items-center gap-1"><Phone size={12} />{req.contactNumber}</span>}
                      {req.notes && <span className="flex items-center gap-1"><FileText size={12} />{req.notes}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>

          <Section
            id="rejected"
            title="Rejected"
            icon={<XCircle size={15} className="text-red-400" />}
            count={rejected.length}
            color="bg-red-100 text-red-600"
          >
            {rejected.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No rejected requests.</p>
            ) : (
              <div className="space-y-2">
                {rejected.map(req => (
                  <div key={req.id} className="p-3 bg-red-50 border border-red-100 rounded-lg">
                    <p className="font-medium text-gray-900 text-sm">{req.userName}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {req.userAlumniYear && `Class of ${req.userAlumniYear}`}
                      {req.userVillage && ` · ${req.userVillage}`}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </>
      )}

      {/* Approve Modal */}
      {approveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-5 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Approve Accommodation</h3>
              <p className="text-sm text-gray-500 mt-0.5">
                Enter stay details for <span className="font-medium text-gray-700">{approveModal.userName}</span>
              </p>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={approveForm.location}
                  onChange={e => setApproveForm(f => ({ ...f, location: e.target.value }))}
                  placeholder="e.g. Village community hall, Room 3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                <input
                  type="tel"
                  value={approveForm.contactNumber}
                  onChange={e => setApproveForm(f => ({ ...f, contactNumber: e.target.value }))}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={approveForm.notes}
                  onChange={e => setApproveForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Any additional instructions..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none resize-none"
                />
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 flex gap-3 justify-end">
              <button
                onClick={() => setApproveModal(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={submitting || !approveForm.location.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Saving...' : 'Confirm Approval'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
