import { useState } from 'react';
import { db } from '../config/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { BedDouble, Clock, CheckCircle, XCircle, MapPin, Phone, FileText } from 'lucide-react';
import Toast from './Toast';

export default function AccommodationRequest({ currentUser, request, onRequestSubmitted }) {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleRequest = async () => {
    setLoading(true);
    try {
      const newRequest = {
        userId: currentUser.id,
        userName: `${currentUser.firstName} ${currentUser.lastName}`,
        userPhone: currentUser.phone,
        userVillage: currentUser.village || '',
        userAlumniYear: currentUser.alumniYear || '',
        status: 'pending',
        requestedAt: Timestamp.now(),
        location: '',
        contactNumber: '',
        notes: '',
        reviewedAt: null,
        reviewedBy: ''
      };
      const docRef = await addDoc(collection(db, 'accommodation_requests'), newRequest);
      onRequestSubmitted({ id: docRef.id, ...newRequest });
      setToast({ message: 'Accommodation request submitted!', type: 'success' });
    } catch (err) {
      console.error('Error submitting accommodation request:', err);
      setToast({ message: 'Failed to submit request. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const toastEl = toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />;

  // No request yet
  if (!request) {
    return (
      <>
      {toastEl}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
            <BedDouble size={18} className="text-primary-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900 text-sm">Need Accommodation?</p>
            <p className="text-xs text-gray-500">Request a stay arrangement for the event</p>
          </div>
        </div>
        <button
          onClick={handleRequest}
          disabled={loading}
          className="shrink-0 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Submitting...' : 'Request Accommodation'}
        </button>
      </div>
      </>
    );
  }

  // Pending
  if (request.status === 'pending') {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-center gap-3">
        <Clock size={18} className="text-amber-600 shrink-0" />
        <div>
          <p className="font-medium text-amber-800 text-sm">Accommodation Request Sent</p>
          <p className="text-xs text-amber-600 mt-0.5">Awaiting admin response — we'll update you once a decision is made.</p>
        </div>
      </div>
    );
  }

  // Approved
  if (request.status === 'approved') {
    return (
      <div className="bg-white border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle size={18} className="text-green-600" />
          <p className="font-semibold text-green-800 text-sm">Accommodation Confirmed</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {request.location && (
            <div className="flex items-start gap-2">
              <MapPin size={14} className="text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Location</p>
                <p className="text-sm font-medium text-gray-900">{request.location}</p>
              </div>
            </div>
          )}
          {request.contactNumber && (
            <div className="flex items-start gap-2">
              <Phone size={14} className="text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Contact</p>
                <p className="text-sm font-medium text-gray-900">{request.contactNumber}</p>
              </div>
            </div>
          )}
          {request.notes && (
            <div className="flex items-start gap-2">
              <FileText size={14} className="text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Notes</p>
                <p className="text-sm font-medium text-gray-900">{request.notes}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Rejected
  if (request.status === 'rejected') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
        <XCircle size={18} className="text-red-500 shrink-0" />
        <div>
          <p className="font-medium text-red-800 text-sm">Accommodation Request Declined</p>
          <p className="text-xs text-red-500 mt-0.5">Your request was not approved. Please contact the admin for more info.</p>
        </div>
      </div>
    );
  }

  return null;
}
