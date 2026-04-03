import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../config/firebase';
import { collection, addDoc, getDocs, query, orderBy, deleteDoc, doc, setDoc, updateDoc, where } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { Plus, Calendar, IndianRupee, FileText, Users, Trash2, User, Shield, UserPlus, Eye, EyeOff, Briefcase, UserMinus, Pencil, X } from 'lucide-react';
import Toast from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';
import Footer from '../components/Footer';
import Reports from '../components/Reports';
import BankingDetails from '../components/BankingDetails';
import BulkOperations from '../components/BulkOperations';
import Header from '../components/Header';
import StatsOverview from '../components/StatsOverview';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [activeTab, setActiveTab] = useState('meetings');
  const [meetings, setMeetings] = useState([]);
  const [donations, setDonations] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [committees, setCommittees] = useState([]);
  const [selectedCommittee, setSelectedCommittee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Pagination states
  const [donationPage, setDonationPage] = useState(1);
  const [expensePage, setExpensePage] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const itemsPerPage = 10;

  // Toast state
  const [toast, setToast] = useState(null);
  
  // Confirm modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  // Form states
  const [meetingForm, setMeetingForm] = useState({
    title: '',
    date: '',
    timeFrom: '',
    timeTo: '',
    description: '',
    zoomLink: '',
    committeeIds: []
  });
  const [donationForm, setDonationForm] = useState({
    date: '',
    donorName: '',
    amount: '',
    phone: '',
    alumniYear: '',
    village: '',
    notes: ''
  });
  const [expenseForm, setExpenseForm] = useState({
    date: '',
    description: '',
    amount: '',
    category: '',
    notes: ''
  });
  const [adminForm, setAdminForm] = useState({
    email: '', password: '', name: ''
  });
  const [committeeForm, setCommitteeForm] = useState({
    name: '', description: ''
  });
  const [memberForm, setMemberForm] = useState({
    firstName: '', lastName: '', phone: '', alumniYear: '', village: ''
  });
  const [showCreateCommitteeForm, setShowCreateCommitteeForm] = useState(false);
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [showAddAdminForm, setShowAddAdminForm] = useState(false);
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showMeetingForm, setShowMeetingForm] = useState(false);
  const [editDonation, setEditDonation] = useState(null);
  const [deleteDonationTarget, setDeleteDonationTarget] = useState(null);
  const [editExpense, setEditExpense] = useState(null);
  const [accommodationRequests, setAccommodationRequests] = useState([]);

  useEffect(() => {
    // Check if admin is logged in via Firebase Auth
    const adminData = localStorage.getItem('alumni_admin');
    if (!adminData) {
      navigate('/admin-login');
      return;
    }
    
    const admin = JSON.parse(adminData);
    setCurrentAdmin(admin);
    fetchData();
  }, [navigate]);

  // Helper function to show toast
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const fetchData = async () => {
    try {
      // Fetch meetings
      const meetingsQuery = query(collection(db, 'meetings'), orderBy('date', 'desc'));
      const meetingsSnapshot = await getDocs(meetingsQuery);
      setMeetings(meetingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // Fetch donations
      const donationsQuery = query(collection(db, 'donations'), orderBy('date', 'desc'));
      const donationsSnapshot = await getDocs(donationsQuery);
      setDonations(donationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // Fetch expenses
      const expensesQuery = query(collection(db, 'expenses'), orderBy('date', 'desc'));
      const expensesSnapshot = await getDocs(expensesQuery);
      setExpenses(expensesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // Fetch users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      setUsers(usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // Fetch admins
      const adminsSnapshot = await getDocs(collection(db, 'admins'));
      setAdmins(adminsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // Fetch committees
      const committeesSnapshot = await getDocs(collection(db, 'committees'));
      const committeesData = committeesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCommittees(committeesData);

      // Auto-select first committee if available
      if (committeesData.length > 0 && !selectedCommittee) {
        setSelectedCommittee(committeesData[0]);
      }

      // Fetch accommodation requests
      const accomSnapshot = await getDocs(collection(db, 'accommodation_requests'));
      setAccommodationRequests(accomSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMeeting = async (e) => {
    e.preventDefault();

    if (meetingForm.committeeIds.length === 0) {
      showToast('Please select at least one committee for this meeting', 'error');
      return;
    }

    try {
      const docRef = await addDoc(collection(db, 'meetings'), meetingForm);
      const newMeeting = { id: docRef.id, ...meetingForm };
      setMeetings(prev => [newMeeting, ...prev].sort((a, b) => new Date(b.date) - new Date(a.date)));
      showToast('Meeting added successfully!');
      setMeetingForm({ title: '', date: '', timeFrom: '', timeTo: '', description: '', zoomLink: '', committeeIds: [] });
    } catch (error) {
      console.error('Error adding meeting:', error);
      showToast('Failed to add meeting', 'error');
    }
  };

  const handleAddDonation = async (e) => {
    e.preventDefault();
    try {
      const newData = {
        ...donationForm,
        createdBy: currentAdmin?.name || currentAdmin?.email || 'Unknown',
        createdAt: new Date().toISOString()
      };
      const docRef = await addDoc(collection(db, 'donations'), newData);
      setDonations(prev => [{ id: docRef.id, ...newData }, ...prev].sort((a, b) => new Date(b.date) - new Date(a.date)));
      showToast('Donation recorded successfully!');
      setDonationForm({ date: '', donorName: '', amount: '', phone: '', alumniYear: '', village: '', notes: '' });
    } catch (error) {
      console.error('Error adding donation:', error);
      showToast('Failed to record donation', 'error');
    }
  };

  const handleEditDonation = async (e) => {
    e.preventDefault();
    try {
      const updated = {
        ...editDonation,
        modifiedBy: currentAdmin?.name || currentAdmin?.email || 'Unknown',
        modifiedAt: new Date().toISOString()
      };
      await updateDoc(doc(db, 'donations', editDonation.id), updated);
      setDonations(prev => prev.map(d => d.id === editDonation.id ? updated : d));
      showToast('Donation updated successfully!');
      setEditDonation(null);
    } catch (error) {
      console.error('Error updating donation:', error);
      showToast('Failed to update donation', 'error');
    }
  };

  const handleDeleteDonation = async () => {
    try {
      await deleteDoc(doc(db, 'donations', deleteDonationTarget.id));
      setDonations(prev => prev.filter(d => d.id !== deleteDonationTarget.id));
      showToast('Donation deleted.');
      setDeleteDonationTarget(null);
    } catch (error) {
      console.error('Error deleting donation:', error);
      showToast('Failed to delete donation', 'error');
    }
  };

  const handleEditExpense = async (e) => {
    e.preventDefault();
    try {
      const updated = {
        ...editExpense,
        modifiedBy: currentAdmin?.name || currentAdmin?.email || 'Unknown',
        modifiedAt: new Date().toISOString()
      };
      await updateDoc(doc(db, 'expenses', editExpense.id), updated);
      setExpenses(prev => prev.map(ex => ex.id === editExpense.id ? updated : ex));
      showToast('Expense updated successfully!');
      setEditExpense(null);
    } catch (error) {
      console.error('Error updating expense:', error);
      showToast('Failed to update expense', 'error');
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      const newData = {
        ...expenseForm,
        createdBy: currentAdmin?.name || currentAdmin?.email || 'Unknown',
        createdAt: new Date().toISOString()
      };
      const docRef = await addDoc(collection(db, 'expenses'), newData);
      setExpenses(prev => [{ id: docRef.id, ...newData }, ...prev].sort((a, b) => new Date(b.date) - new Date(a.date)));
      showToast('Expense recorded successfully!');
      setExpenseForm({ date: '', description: '', amount: '', category: '', notes: '' });
    } catch (error) {
      console.error('Error adding expense:', error);
      showToast('Failed to record expense', 'error');
    }
  };

  const handleDeleteMeeting = async (meetingId) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Meeting',
      message: 'Are you sure you want to delete this meeting? This action cannot be undone.',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'meetings', meetingId));
          setMeetings(prev => prev.filter(m => m.id !== meetingId));
          showToast('Meeting deleted successfully!');
        } catch (error) {
          console.error('Error deleting meeting:', error);
          showToast('Failed to delete meeting', 'error');
        }
      }
    });
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    
    if (!currentAdmin?.isSuperAdmin) {
      showToast('Only super admins can add new admins');
      return;
    }

    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        adminForm.email,
        adminForm.password
      );

      const uid = userCredential.user.uid;

      const newAdmin = {
        email: adminForm.email,
        name: adminForm.name,
        isAdmin: true,
        isSuperAdmin: false,
        createdAt: new Date().toISOString(),
        createdBy: currentAdmin.uid
      };
      await setDoc(doc(db, 'admins', uid), newAdmin);
      setAdmins(prev => [...prev, { id: uid, uid, ...newAdmin }]);
      showToast('Admin added successfully!');
      setAdminForm({ email: '', password: '', name: '' });
    } catch (error) {
      console.error('Error adding admin:', error);
      if (error.code === 'auth/email-already-in-use') {
        showToast('This email is already registered');
      } else if (error.code === 'auth/weak-password') {
        showToast('Password should be at least 6 characters');
      } else {
        showToast('Failed to add admin', 'error');
      }
    }
  };

  const handleRemoveAdmin = async (adminId) => {
    if (!currentAdmin?.isSuperAdmin) {
      showToast('Only super admins can remove admins', 'error');
      return;
    }

    if (adminId === currentAdmin.uid) {
      showToast('You cannot remove yourself!', 'error');
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: 'Remove Admin',
      message: 'Are you sure you want to remove this admin? They will lose all admin privileges.',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'admins', adminId));
          setAdmins(prev => prev.filter(a => a.id !== adminId));
          showToast('Admin removed successfully!');
        } catch (error) {
          console.error('Error removing admin:', error);
          showToast('Failed to remove admin', 'error');
        }
      }
    });
  };

  // Committee Management Functions
  const handleCreateCommittee = async (e) => {
    e.preventDefault();
    try {
      const newData = {
        ...committeeForm,
        createdAt: new Date().toISOString(),
        createdBy: currentAdmin.uid
      };
      const docRef = await addDoc(collection(db, 'committees'), newData);
      const newCommittee = { id: docRef.id, ...newData };
      setCommittees(prev => [...prev, newCommittee]);
      if (!selectedCommittee) setSelectedCommittee(newCommittee);
      showToast('Committee created successfully!');
      setCommitteeForm({ name: '', description: '' });
    } catch (error) {
      console.error('Error creating committee:', error);
      showToast('Failed to create committee', 'error');
    }
  };

  const handleDeleteCommittee = async (committeeId) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Committee',
      message: 'Are you sure you want to delete this committee? All members will be removed from this committee.',
      onConfirm: async () => {
        try {
          // Remove all members from this committee
          const usersInCommittee = users.filter(u => u.committeeId === committeeId);
          for (const user of usersInCommittee) {
            await updateDoc(doc(db, 'users', user.id), { committeeId: null });
          }

          await deleteDoc(doc(db, 'committees', committeeId));
          setCommittees(prev => prev.filter(c => c.id !== committeeId));
          setUsers(prev => prev.map(u => u.committeeId === committeeId ? { ...u, committeeId: null } : u));
          setSelectedCommittee(null);
          showToast('Committee deleted successfully!');
        } catch (error) {
          console.error('Error deleting committee:', error);
          showToast('Failed to delete committee', 'error');
        }
      }
    });
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedCommittee) {
      showToast('Please select a committee first', 'error');
      return;
    }

    try {
      // Check if user exists by phone number
      const userQuery = query(collection(db, 'users'), where('phone', '==', memberForm.phone));
      const userSnapshot = await getDocs(userQuery);

      if (!userSnapshot.empty) {
        const existingUser = userSnapshot.docs[0];
        await updateDoc(doc(db, 'users', existingUser.id), { committeeId: selectedCommittee.id });
        setUsers(prev => prev.map(u => u.id === existingUser.id ? { ...u, committeeId: selectedCommittee.id } : u));
        showToast(`${existingUser.data().firstName} ${existingUser.data().lastName} added to committee!`);
      } else {
        const newData = {
          ...memberForm,
          committeeId: selectedCommittee.id,
          email: null,
          isAdmin: false,
          createdAt: new Date().toISOString()
        };
        const docRef = await addDoc(collection(db, 'users'), newData);
        setUsers(prev => [...prev, { id: docRef.id, ...newData }]);
        showToast('New member added to committee!');
      }

      setMemberForm({ firstName: '', lastName: '', phone: '', alumniYear: '', village: '' });
    } catch (error) {
      console.error('Error adding member:', error);
      showToast('Failed to add member', 'error');
    }
  };

  const handleRemoveMember = async (userId) => {
    setConfirmModal({
      isOpen: true,
      title: 'Remove Member',
      message: 'Are you sure you want to remove this member from the committee? They will remain as a registered user.',
      onConfirm: async () => {
        try {
          await updateDoc(doc(db, 'users', userId), { committeeId: null });
          setUsers(prev => prev.map(u => u.id === userId ? { ...u, committeeId: null } : u));
          showToast('Member removed from committee!');
        } catch (error) {
          console.error('Error removing member:', error);
          showToast('Failed to remove member', 'error');
        }
      }
    });
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem('alumni_admin');
      navigate('/admin-login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Pagination helpers
  const getPaginatedData = (data, page) => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  const getTotalPages = (data) => {
    return Math.ceil(data.length / itemsPerPage);
  };

  const paginatedDonations = getPaginatedData(donations, donationPage);
  const paginatedExpenses = getPaginatedData(expenses, expensePage);
  const paginatedUsers = getPaginatedData(users, userPage);
  const totalDonationPages = getTotalPages(donations);
  const totalExpensePages = getTotalPages(expenses);
  const totalUserPages = getTotalPages(users);

  // Helper function to format date in Indian format (dd/mm/yyyy)
  const formatIndianDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Helper function to convert 24-hour time to 12-hour format with AM/PM
  const formatTime12Hour = (time24) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  const totalDonations = donations.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Edit Donation Modal */}
      {editDonation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Edit Donation</h3>
              <button onClick={() => setEditDonation(null)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditDonation} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
                  <input type="date" className="input-field" value={editDonation.date} onChange={(e) => setEditDonation({ ...editDonation, date: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Donor Name</label>
                  <input type="text" className="input-field" value={editDonation.donorName} onChange={(e) => setEditDonation({ ...editDonation, donorName: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Amount (₹)</label>
                  <input type="number" step="0.01" className="input-field" value={editDonation.amount} onChange={(e) => setEditDonation({ ...editDonation, amount: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
                  <input type="tel" className="input-field" value={editDonation.phone || ''} maxLength={10} onChange={(e) => setEditDonation({ ...editDonation, phone: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Passed Out Year</label>
                  <input type="number" className="input-field" value={editDonation.alumniYear || ''} min="1950" max="2030" onChange={(e) => setEditDonation({ ...editDonation, alumniYear: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Village</label>
                  <input type="text" className="input-field" value={editDonation.village || ''} onChange={(e) => setEditDonation({ ...editDonation, village: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                <textarea className="input-field" rows="2" value={editDonation.notes || ''} onChange={(e) => setEditDonation({ ...editDonation, notes: e.target.value })} />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setEditDonation(null)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Expense Modal */}
      {editExpense && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Edit Expense</h3>
              <button onClick={() => setEditExpense(null)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditExpense} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
                  <input type="date" className="input-field" value={editExpense.date} onChange={(e) => setEditExpense({ ...editExpense, date: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                  <input type="text" className="input-field" value={editExpense.description} onChange={(e) => setEditExpense({ ...editExpense, description: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Amount (₹)</label>
                  <input type="number" step="0.01" className="input-field" value={editExpense.amount} onChange={(e) => setEditExpense({ ...editExpense, amount: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                  <input type="text" className="input-field" value={editExpense.category || ''} onChange={(e) => setEditExpense({ ...editExpense, category: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                <textarea className="input-field" rows="2" value={editExpense.notes || ''} onChange={(e) => setEditExpense({ ...editExpense, notes: e.target.value })} />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setEditExpense(null)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Donation Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteDonationTarget}
        onClose={() => setDeleteDonationTarget(null)}
        onConfirm={handleDeleteDonation}
        title="Delete Donation"
        message={deleteDonationTarget ? `Are you sure you want to delete the donation from ${deleteDonationTarget.donorName} — ₹${parseFloat(deleteDonationTarget.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}?` : ''}
        confirmText="Yes, Delete"
        cancelText="No, Close"
        type="danger"
      />

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
      />

      <Header
        user={currentAdmin}
        userType="admin"
        onLogout={handleLogout}
        onNavigate={navigate}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StatsOverview
          donations={donations}
          expenses={expenses}
          users={users}
        />

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200 overflow-x-auto">
            <nav className="flex space-x-4 sm:space-x-8 px-4 sm:px-6 min-w-max" aria-label="Tabs">
              {['meetings', 'donations', 'expenses', 'users', 'committee', ...(currentAdmin?.isSuperAdmin ? ['admins'] : []), 'reports', 'banking', 'operations'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm capitalize whitespace-nowrap ${
                    activeTab === tab
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab === 'banking' ? 'Donate Now' : tab}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Meetings Tab */}
            {activeTab === 'meetings' && (
              <div>
                {/* Add New Meeting Form (Collapsible) */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg mb-6 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowMeetingForm(!showMeetingForm)}
                    className="w-full px-5 py-3 flex items-center justify-between hover:bg-purple-100 transition-colors"
                  >
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <Plus size={18} />
                      Add New Meeting
                    </h2>
                    <span className="text-purple-700 font-medium">
                      {showMeetingForm ? '▼' : '>'}
                    </span>
                  </button>

                  {showMeetingForm && (
                    <div className="px-5 pb-5 pt-2">
                      <form onSubmit={handleAddMeeting} className="space-y-4">
                        <input
                          type="text"
                          placeholder="Meeting Title"
                          value={meetingForm.title}
                          onChange={(e) => setMeetingForm({...meetingForm, title: e.target.value})}
                          className="input-field"
                          required
                        />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <input
                            type="date"
                            value={meetingForm.date}
                            onChange={(e) => setMeetingForm({...meetingForm, date: e.target.value})}
                            className="input-field"
                            required
                          />
                          <input
                            type="time"
                            placeholder="From"
                            value={meetingForm.timeFrom}
                            onChange={(e) => setMeetingForm({...meetingForm, timeFrom: e.target.value})}
                            className="input-field"
                            required
                          />
                          <input
                            type="time"
                            placeholder="To"
                            value={meetingForm.timeTo}
                            onChange={(e) => setMeetingForm({...meetingForm, timeTo: e.target.value})}
                            className="input-field"
                            required
                          />
                        </div>
                        <textarea
                          placeholder="Description"
                          value={meetingForm.description}
                          onChange={(e) => setMeetingForm({...meetingForm, description: e.target.value})}
                          className="input-field"
                          rows="3"
                          required
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input
                            type="url"
                            placeholder="Meeting Link (Zoom, Google Meet, etc.)"
                            value={meetingForm.zoomLink}
                            onChange={(e) => setMeetingForm({...meetingForm, zoomLink: e.target.value})}
                            className="input-field"
                          />

                          <select
                            value={meetingForm.committeeIds[0] || ''}
                            onChange={(e) => setMeetingForm({...meetingForm, committeeIds: e.target.value ? [e.target.value] : []})}
                            className="input-field"
                            required
                          >
                            <option value="">Select Committee</option>
                            {committees.map((committee) => (
                              <option key={committee.id} value={committee.id}>
                                {committee.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <button type="submit" className="btn-primary">Add Meeting</button>
                      </form>
                    </div>
                  )}
                </div>

                <h3 className="text-lg font-semibold mb-4">All Meetings</h3>
                <div className="max-h-[600px] overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-2">
                    {meetings.map((meeting) => (
                    <div key={meeting.id} className="border border-gray-200 rounded-lg p-4 relative hover:border-primary-300 transition-colors">
                      <button
                        onClick={() => handleDeleteMeeting(meeting.id)}
                        className="absolute top-2 right-2 p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete meeting"
                      >
                        <Trash2 size={18} />
                      </button>
                      <h4 className="font-semibold pr-8 mb-1">{meeting.title}</h4>
                      <p className="text-sm text-gray-600 mb-2" style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>{meeting.description}</p>
                      <p className="text-sm text-gray-500 mb-2">
                        📅 {formatIndianDate(meeting.date)}
                      </p>
                      <p className="text-sm text-gray-500 mb-2">
                        🕐 {formatTime12Hour(meeting.timeFrom || meeting.time)} - {formatTime12Hour(meeting.timeTo)}
                      </p>
                      {meeting.committeeIds && meeting.committeeIds.length > 0 && (
                        <p className="text-xs text-gray-600 mb-2">
                          🏢 {meeting.committeeIds.map(id => committees.find(c => c.id === id)?.name || 'Unknown').join(', ')}
                        </p>
                      )}
                      {meeting.zoomLink && (
                        <a
                          href={meeting.zoomLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary-600 hover:underline block truncate"
                        >
                          Zoom Link
                        </a>
                      )}
                    </div>
                  ))}
                  </div>
                </div>
              </div>
            )}

            {/* Donations Tab */}
            {activeTab === 'donations' && (
              <div>
                {/* Record New Donation Form (Collapsible) */}
                <div className="bg-green-50 border border-green-200 rounded-lg mb-6 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowDonationForm(!showDonationForm)}
                    className="w-full px-5 py-3 flex items-center justify-between hover:bg-green-100 transition-colors"
                  >
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <Plus size={18} />
                      Record New Donation
                    </h2>
                    <span className="text-green-700 font-medium">
                      {showDonationForm ? '▼' : '>'}
                    </span>
                  </button>

                  {showDonationForm && (
                    <div className="px-5 pb-5 pt-2">
                      <form onSubmit={handleAddDonation} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <input
                            type="date"
                            value={donationForm.date}
                            onChange={(e) => setDonationForm({...donationForm, date: e.target.value})}
                            className="input-field"
                            max={new Date().toISOString().split('T')[0]}
                            required
                          />
                          <input
                            type="text"
                            placeholder="Donor Name"
                            value={donationForm.donorName}
                            onChange={(e) => setDonationForm({...donationForm, donorName: e.target.value})}
                            className="input-field"
                            required
                          />
                          <input
                            type="number"
                            step="0.01"
                            placeholder="Amount"
                            value={donationForm.amount}
                            onChange={(e) => setDonationForm({...donationForm, amount: e.target.value})}
                            className="input-field"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <input
                            type="tel"
                            placeholder="Phone Number"
                            value={donationForm.phone}
                            onChange={(e) => setDonationForm({...donationForm, phone: e.target.value})}
                            className="input-field"
                            maxLength={10}
                            required
                          />
                          <input
                            type="number"
                            placeholder="Passed Out Year"
                            value={donationForm.alumniYear}
                            onChange={(e) => setDonationForm({...donationForm, alumniYear: e.target.value})}
                            className="input-field"
                            min="1950"
                            max="2030"
                            required
                          />
                          <input
                            type="text"
                            placeholder="Village"
                            value={donationForm.village}
                            onChange={(e) => setDonationForm({...donationForm, village: e.target.value})}
                            className="input-field"
                            required
                          />
                        </div>
                        <textarea
                          placeholder="Notes (optional)"
                          value={donationForm.notes}
                          onChange={(e) => setDonationForm({...donationForm, notes: e.target.value})}
                          className="input-field"
                          rows="2"
                        />
                        <button type="submit" className="btn-primary">Record Donation</button>
                      </form>
                    </div>
                  )}
                </div>

                <h3 className="text-lg font-semibold mb-4">All Donations (₹{totalDonations.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})</h3>
                <div className="overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0">
                  <table className="w-full min-w-[800px]">
                    <thead className="border-b border-gray-200">
                      <tr className="text-left">
                        <th className="pb-3 text-xs sm:text-sm">Date</th>
                        <th className="pb-3 text-xs sm:text-sm">Donor</th>
                        <th className="pb-3 text-xs sm:text-sm">Amount</th>
                        <th className="pb-3 text-xs sm:text-sm">Phone</th>
                        <th className="pb-3 text-xs sm:text-sm">Year</th>
                        <th className="pb-3 text-xs sm:text-sm">Village</th>
                        <th className="pb-3 text-xs sm:text-sm">Notes</th>
                        <th className="pb-3 text-xs sm:text-sm">Recorded By</th>
                        {currentAdmin?.isSuperAdmin && <th className="pb-3 text-xs sm:text-sm">Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedDonations.map((donation) => (
                        <tr key={donation.id} className="border-b border-gray-100">
                          <td className="py-3 text-xs sm:text-sm">{formatIndianDate(donation.date)}</td>
                          <td className="py-3 text-xs sm:text-sm">{donation.donorName}</td>
                          <td className="py-3 font-semibold text-green-600 text-xs sm:text-sm whitespace-nowrap">
                            ₹{parseFloat(donation.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 text-xs sm:text-sm">{donation.phone || '-'}</td>
                          <td className="py-3 text-xs sm:text-sm">{donation.alumniYear || '-'}</td>
                          <td className="py-3 text-xs sm:text-sm">{donation.village || '-'}</td>
                          <td className="py-3 text-xs sm:text-sm">{donation.notes || '-'}</td>
                          <td className="py-3 text-xs sm:text-sm text-gray-500">
                            <span>{donation.createdBy || '-'}</span>
                            {donation.modifiedBy && (
                              <div className="text-xs text-amber-600 mt-0.5">
                                <div>Modified by {donation.modifiedBy}</div>
                                <div className="text-gray-400">
                                  {new Date(donation.modifiedAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>
                            )}
                          </td>
                          {currentAdmin?.isSuperAdmin && (
                            <td className="py-3">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setEditDonation({ ...donation })}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Edit"
                                >
                                  <Pencil size={14} />
                                </button>
                                <button
                                  onClick={() => setDeleteDonationTarget(donation)}
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {totalDonationPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs sm:text-sm text-gray-500">
                      {((donationPage - 1) * itemsPerPage) + 1}–{Math.min(donationPage * itemsPerPage, donations.length)} of {donations.length}
                    </p>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setDonationPage(p => Math.max(1, p - 1))}
                        disabled={donationPage === 1}
                        className="px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        Prev
                      </button>
                      <span className="px-2 py-1.5 text-xs sm:text-sm font-medium text-gray-900">
                        {donationPage} / {totalDonationPages}
                      </span>
                      <button
                        onClick={() => setDonationPage(p => Math.min(totalDonationPages, p + 1))}
                        disabled={donationPage === totalDonationPages}
                        className="px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Expenses Tab */}
            {activeTab === 'expenses' && (
              <div>
                {/* Record New Expense Form (Collapsible) */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg mb-6 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowExpenseForm(!showExpenseForm)}
                    className="w-full px-5 py-3 flex items-center justify-between hover:bg-orange-100 transition-colors"
                  >
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <Plus size={18} />
                      Record New Expense
                    </h2>
                    <span className="text-orange-700 font-medium">
                      {showExpenseForm ? '▼' : '>'}
                    </span>
                  </button>

                  {showExpenseForm && (
                    <div className="px-5 pb-5 pt-2">
                      <form onSubmit={handleAddExpense} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <input
                            type="date"
                            value={expenseForm.date}
                            onChange={(e) => setExpenseForm({...expenseForm, date: e.target.value})}
                            className="input-field"
                            max={new Date().toISOString().split('T')[0]}
                            required
                          />
                          <input
                            type="text"
                            placeholder="Description"
                            value={expenseForm.description}
                            onChange={(e) => setExpenseForm({...expenseForm, description: e.target.value})}
                            className="input-field"
                            required
                          />
                          <input
                            type="number"
                            step="0.01"
                            placeholder="Amount"
                            value={expenseForm.amount}
                            onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})}
                            className="input-field"
                            required
                          />
                        </div>
                        <select
                          value={expenseForm.category}
                          onChange={(e) => setExpenseForm({...expenseForm, category: e.target.value})}
                          className="input-field"
                          required
                        >
                          <option value="">Select Category</option>
                          <option value="Venue">Venue</option>
                          <option value="Food">Food</option>
                          <option value="Entertainment">Entertainment</option>
                          <option value="Marketing">Marketing</option>
                          <option value="Decorations">Decorations</option>
                          <option value="Travel">Travel</option>
                          <option value="Gifts">Gifts</option>
                          <option value="Miscellaneous">Miscellaneous</option>
                        </select>
                        <textarea
                          placeholder="Notes (optional)"
                          value={expenseForm.notes}
                          onChange={(e) => setExpenseForm({...expenseForm, notes: e.target.value})}
                          className="input-field"
                          rows="2"
                        />
                        <button type="submit" className="btn-primary">Record Expense</button>
                      </form>
                    </div>
                  )}
                </div>

                <h3 className="text-lg font-semibold mb-4">All Expenses (₹{totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})</h3>
                <div className="overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0">
                  <table className="w-full min-w-[700px]">
                    <thead className="border-b border-gray-200">
                      <tr className="text-left">
                        <th className="pb-3 text-xs sm:text-sm">Date</th>
                        <th className="pb-3 text-xs sm:text-sm">Description</th>
                        <th className="pb-3 text-xs sm:text-sm">Amount</th>
                        <th className="pb-3 text-xs sm:text-sm">Category</th>
                        <th className="pb-3 text-xs sm:text-sm">Notes</th>
                        <th className="pb-3 text-xs sm:text-sm">Recorded By</th>
                        {currentAdmin?.isSuperAdmin && <th className="pb-3 text-xs sm:text-sm">Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedExpenses.map((expense) => (
                        <tr key={expense.id} className="border-b border-gray-100">
                          <td className="py-3 text-xs sm:text-sm">{formatIndianDate(expense.date)}</td>
                          <td className="py-3 text-xs sm:text-sm">{expense.description}</td>
                          <td className="py-3 font-semibold text-orange-600 text-xs sm:text-sm whitespace-nowrap">
                            ₹{parseFloat(expense.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 text-xs sm:text-sm">{expense.category || '-'}</td>
                          <td className="py-3 text-xs sm:text-sm">{expense.notes || '-'}</td>
                          <td className="py-3 text-xs sm:text-sm">
                            <div className="text-gray-500">{expense.createdBy || '-'}</div>
                            {expense.modifiedBy && (
                              <div className="text-xs text-amber-600 mt-0.5">
                                <div>Modified by {expense.modifiedBy}</div>
                                <div className="text-gray-400">
                                  {new Date(expense.modifiedAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>
                            )}
                          </td>
                          {currentAdmin?.isSuperAdmin && (
                            <td className="py-3">
                              <button
                                onClick={() => setEditExpense({ ...expense })}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Pencil size={14} />
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {totalExpensePages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs sm:text-sm text-gray-500">
                      {((expensePage - 1) * itemsPerPage) + 1}–{Math.min(expensePage * itemsPerPage, expenses.length)} of {expenses.length}
                    </p>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setExpensePage(p => Math.max(1, p - 1))}
                        disabled={expensePage === 1}
                        className="px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        Prev
                      </button>
                      <span className="px-2 py-1.5 text-xs sm:text-sm font-medium text-gray-900">
                        {expensePage} / {totalExpensePages}
                      </span>
                      <button
                        onClick={() => setExpensePage(p => Math.min(totalExpensePages, p + 1))}
                        disabled={expensePage === totalExpensePages}
                        className="px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">All Users ({users.length})</h3>
                <div className="overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0">
                  <table className="w-full min-w-[600px]">
                    <thead className="border-b border-gray-200">
                      <tr className="text-left">
                        <th className="pb-3 text-xs sm:text-sm">Name</th>
                        <th className="pb-3 text-xs sm:text-sm">Phone</th>
                        <th className="pb-3 text-xs sm:text-sm">Village</th>
                        <th className="pb-3 text-xs sm:text-sm">Year</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedUsers.map((user) => (
                        <tr key={user.id} className="border-b border-gray-100">
                          <td className="py-3 text-xs sm:text-sm">{user.firstName} {user.lastName}</td>
                          <td className="py-3 text-xs sm:text-sm">{user.phone}</td>
                          <td className="py-3 text-xs sm:text-sm">{user.village || '-'}</td>
                          <td className="py-3 text-xs sm:text-sm">{user.alumniYear}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {totalUserPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs sm:text-sm text-gray-500">
                      {((userPage - 1) * itemsPerPage) + 1}–{Math.min(userPage * itemsPerPage, users.length)} of {users.length}
                    </p>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setUserPage(p => Math.max(1, p - 1))}
                        disabled={userPage === 1}
                        className="px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        Prev
                      </button>
                      <span className="px-2 py-1.5 text-xs sm:text-sm font-medium text-gray-900">
                        {userPage} / {totalUserPages}
                      </span>
                      <button
                        onClick={() => setUserPage(p => Math.min(totalUserPages, p + 1))}
                        disabled={userPage === totalUserPages}
                        className="px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Committee Tab */}
            {activeTab === 'committee' && (
              <div>
                {/* Create New Committee Form (Collapsible) - Super Admin Only */}
                {currentAdmin?.isSuperAdmin && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg mb-6 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setShowCreateCommitteeForm(!showCreateCommitteeForm)}
                      className="w-full px-5 py-3 flex items-center justify-between hover:bg-blue-100 transition-colors"
                    >
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Plus size={18} />
                        Create New Committee
                      </h3>
                      <span className="text-blue-700 font-medium">
                        {showCreateCommitteeForm ? '▼' : '>'}
                      </span>
                    </button>

                    {showCreateCommitteeForm && (
                      <div className="px-5 pb-5 pt-2">
                        <form onSubmit={handleCreateCommittee} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                              type="text"
                              placeholder="Committee Name"
                              value={committeeForm.name}
                              onChange={(e) => setCommitteeForm({...committeeForm, name: e.target.value})}
                              className="input-field"
                              required
                            />
                            <input
                              type="text"
                              placeholder="Description (optional)"
                              value={committeeForm.description}
                              onChange={(e) => setCommitteeForm({...committeeForm, description: e.target.value})}
                              className="input-field"
                            />
                          </div>
                          <button type="submit" className="btn-primary">
                            <Plus size={18} className="inline mr-2" />
                            Create Committee
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                )}

                {committees.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    {currentAdmin?.isSuperAdmin
                      ? 'No committees created yet. Create one above to get started!'
                      : 'No committees available yet.'}
                  </p>
                ) : (
                  <>
                    {/* Desktop Layout: 2-Column */}
                    <div className="hidden md:grid md:grid-cols-4 gap-6">
                      {/* Left Panel: Committee List (25%) */}
                      <div className="md:col-span-1">
                        <h3 className="font-semibold text-gray-700 mb-3 text-sm">Committees ({committees.length})</h3>
                        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                          {committees.map((committee, index) => {
                            const memberCount = users.filter(u => u.committeeId === committee.id).length;
                            return (
                              <button
                                key={committee.id}
                                onClick={() => setSelectedCommittee(committee)}
                                className={`w-full text-left px-4 py-3 transition-colors ${
                                  index !== committees.length - 1 ? 'border-b border-gray-200' : ''
                                } ${
                                  selectedCommittee?.id === committee.id
                                    ? 'bg-primary-50 text-primary-900 border-l-4 border-l-primary-600'
                                    : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium">{committee.name}</span>
                                  <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <Users size={14} />
                                    <span>{memberCount}</span>
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Right Panel: Committee Details (75%) */}
                      <div className="md:col-span-3">
                        {selectedCommittee ? (
                          <div>
                            {/* Committee Header */}
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h3 className="text-lg font-semibold">{selectedCommittee.name}</h3>
                                {selectedCommittee.description && (
                                  <p className="text-sm text-gray-600">{selectedCommittee.description}</p>
                                )}
                              </div>
                              {currentAdmin?.isSuperAdmin && (
                                <button
                                  onClick={() => handleDeleteCommittee(selectedCommittee.id)}
                                  className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1"
                                >
                                  <Trash2 size={16} />
                                  Delete Committee
                                </button>
                              )}
                            </div>

                            {/* Add Member Form (Collapsible) */}
                            <div className="bg-green-50 border border-green-200 rounded-lg mb-4 overflow-hidden">
                              <button
                                type="button"
                                onClick={() => setShowAddMemberForm(!showAddMemberForm)}
                                className="w-full px-5 py-3 flex items-center justify-between hover:bg-green-100 transition-colors"
                              >
                                <h4 className="font-semibold flex items-center gap-2">
                                  <UserPlus size={18} />
                                  Add Member
                                </h4>
                                <span className="text-green-700 font-medium">
                                  {showAddMemberForm ? '▼' : '>'}
                                </span>
                              </button>

                              {showAddMemberForm && (
                                <div className="px-5 pb-5 pt-2">
                                  <form onSubmit={handleAddMember} className="space-y-3">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                      <input
                                        type="text"
                                        placeholder="First Name"
                                        value={memberForm.firstName}
                                        onChange={(e) => setMemberForm({...memberForm, firstName: e.target.value})}
                                        className="input-field"
                                        required
                                      />
                                      <input
                                        type="text"
                                        placeholder="Last Name"
                                        value={memberForm.lastName}
                                        onChange={(e) => setMemberForm({...memberForm, lastName: e.target.value})}
                                        className="input-field"
                                        required
                                      />
                                      <input
                                        type="tel"
                                        placeholder="Phone Number"
                                        value={memberForm.phone}
                                        onChange={(e) => setMemberForm({...memberForm, phone: e.target.value})}
                                        className="input-field"
                                        required
                                      />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      <input
                                        type="number"
                                        placeholder="Passed Out Year"
                                        value={memberForm.alumniYear}
                                        onChange={(e) => setMemberForm({...memberForm, alumniYear: e.target.value})}
                                        className="input-field"
                                        min="1950"
                                        max="2030"
                                        required
                                      />
                                      <input
                                        type="text"
                                        placeholder="Village"
                                        value={memberForm.village}
                                        onChange={(e) => setMemberForm({...memberForm, village: e.target.value})}
                                        className="input-field"
                                        required
                                      />
                                    </div>
                                    <button type="submit" className="btn-primary">
                                      <UserPlus size={16} className="inline mr-2" />
                                      Add Member
                                    </button>
                                  </form>
                                </div>
                              )}
                            </div>

                            {/* Members Table */}
                            <div>
                              {users.filter(u => u.committeeId === selectedCommittee.id).length === 0 ? (
                                <p className="text-gray-500 text-center py-6">No members in this committee yet.</p>
                              ) : (
                                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                  <table className="w-full">
                                    <thead className="bg-gray-50">
                                      <tr className="text-left">
                                        <th className="px-4 py-3.5 text-sm font-semibold text-gray-700">Name</th>
                                        <th className="px-4 py-3.5 text-sm font-semibold text-gray-700">Phone</th>
                                        <th className="px-4 py-3.5 text-sm font-semibold text-gray-700">Year</th>
                                        <th className="px-4 py-3.5 text-sm font-semibold text-gray-700">Village</th>
                                        <th className="px-4 py-3.5 text-sm font-semibold text-gray-700">Actions</th>
                                      </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                      {users
                                        .filter(u => u.committeeId === selectedCommittee.id)
                                        .map((member) => (
                                          <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3.5 text-sm font-medium text-gray-900">{member.firstName} {member.lastName}</td>
                                            <td className="px-4 py-3.5 text-sm text-gray-600">{member.phone}</td>
                                            <td className="px-4 py-3.5 text-sm text-gray-600">{member.alumniYear}</td>
                                            <td className="px-4 py-3.5 text-sm text-gray-600">{member.village || '-'}</td>
                                            <td className="px-4 py-3.5 text-sm">
                                              {currentAdmin?.isSuperAdmin ? (
                                                <button
                                                  onClick={() => handleRemoveMember(member.id)}
                                                  className="inline-flex items-center gap-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                                                >
                                                  <UserMinus size={16} />
                                                  <span className="font-medium">Remove</span>
                                                </button>
                                              ) : (
                                                <button
                                                  disabled
                                                  title="Restricted - Super Admin Only"
                                                  className="inline-flex items-center gap-1.5 text-gray-400 px-2 py-1 rounded cursor-not-allowed"
                                                  style={{ pointerEvents: 'auto' }}
                                                >
                                                  <UserMinus size={16} />
                                                  <span className="font-medium select-none">Remove</span>
                                                </button>
                                              )}
                                            </td>
                                          </tr>
                                        ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-500 text-center py-8">Select a committee to view and manage members</p>
                        )}
                      </div>
                    </div>

                    {/* Mobile Layout: Accordion */}
                    <div className="md:hidden space-y-2">
                      {committees.map((committee) => {
                        const committeeMembers = users.filter(u => u.committeeId === committee.id);
                        const isExpanded = selectedCommittee?.id === committee.id;

                        return (
                          <div key={committee.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                            {/* Committee Header (Accordion Toggle) */}
                            <button
                              onClick={() => setSelectedCommittee(isExpanded ? null : committee)}
                              className={`w-full px-4 py-3 transition-colors flex items-center justify-between ${
                                isExpanded ? 'bg-primary-50' : 'bg-white hover:bg-gray-50'
                              }`}
                            >
                              <div className="text-left flex-1">
                                <div className="font-medium text-sm text-gray-800 flex items-center justify-between">
                                  <span>{committee.name}</span>
                                  <div className="flex items-center gap-1 text-xs text-gray-500 mr-2">
                                    <Users size={14} />
                                    <span>{committeeMembers.length}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {currentAdmin?.isSuperAdmin && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteCommittee(committee.id);
                                    }}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                )}
                                <span className="text-gray-500 text-sm">{isExpanded ? '▼' : '>'}</span>
                              </div>
                            </button>

                            {/* Expanded Content */}
                            {isExpanded && (
                              <div className="p-4 space-y-4">
                                {/* Add Member Form (Collapsible) */}
                                <div className="bg-green-50 border border-green-200 rounded-lg overflow-hidden">
                                  <button
                                    type="button"
                                    onClick={() => setShowAddMemberForm(!showAddMemberForm)}
                                    className="w-full px-5 py-3 flex items-center justify-between hover:bg-green-100 transition-colors"
                                  >
                                    <h4 className="font-semibold text-sm flex items-center gap-2">
                                      <UserPlus size={16} />
                                      Add Member
                                    </h4>
                                    <span className="text-green-700 font-medium">
                                      {showAddMemberForm ? '▼' : '>'}
                                    </span>
                                  </button>

                                  {showAddMemberForm && (
                                    <div className="px-5 pb-5 pt-2">
                                      <form onSubmit={handleAddMember} className="space-y-2">
                                        <input
                                          type="text"
                                          placeholder="First Name"
                                          value={memberForm.firstName}
                                          onChange={(e) => setMemberForm({...memberForm, firstName: e.target.value})}
                                          className="input-field text-sm"
                                          required
                                        />
                                        <input
                                          type="text"
                                          placeholder="Last Name"
                                          value={memberForm.lastName}
                                          onChange={(e) => setMemberForm({...memberForm, lastName: e.target.value})}
                                          className="input-field text-sm"
                                          required
                                        />
                                        <input
                                          type="tel"
                                          placeholder="Phone Number"
                                          value={memberForm.phone}
                                          onChange={(e) => setMemberForm({...memberForm, phone: e.target.value})}
                                          className="input-field text-sm"
                                          required
                                        />
                                        <input
                                          type="number"
                                          placeholder="Passed Out Year"
                                          value={memberForm.alumniYear}
                                          onChange={(e) => setMemberForm({...memberForm, alumniYear: e.target.value})}
                                          className="input-field text-sm"
                                          min="1950"
                                          max="2030"
                                          required
                                        />
                                        <input
                                          type="text"
                                          placeholder="Village"
                                          value={memberForm.village}
                                          onChange={(e) => setMemberForm({...memberForm, village: e.target.value})}
                                          className="input-field text-sm"
                                          required
                                        />
                                        <button type="submit" className="btn-primary w-full text-sm">
                                          <UserPlus size={14} className="inline mr-2" />
                                          Add Member
                                        </button>
                                      </form>
                                    </div>
                                  )}
                                </div>

                                {/* Members List (Cards) */}
                                <div>
                                  {committeeMembers.length === 0 ? (
                                    <p className="text-gray-500 text-sm text-center py-4">No members yet</p>
                                  ) : (
                                    <div className="space-y-2">
                                      {committeeMembers.map((member) => (
                                        <div key={member.id} className="bg-white border border-gray-200 rounded-lg p-3">
                                          <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                              <div className="font-medium text-sm">{member.firstName} {member.lastName}</div>
                                              <div className="text-xs text-gray-600 mt-1">
                                                {member.alumniYear} • {member.village || 'N/A'}
                                              </div>
                                              <div className="text-xs text-gray-500 mt-1">📞 {member.phone}</div>
                                            </div>
                                            {currentAdmin?.isSuperAdmin ? (
                                              <button
                                                onClick={() => handleRemoveMember(member.id)}
                                                className="text-red-600 hover:text-red-800 p-1"
                                              >
                                                <UserMinus size={16} />
                                              </button>
                                            ) : (
                                              <button
                                                disabled
                                                title="Restricted"
                                                className="text-gray-400 p-1 cursor-not-allowed"
                                                style={{ pointerEvents: 'auto' }}
                                              >
                                                <UserMinus size={16} />
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Admins Tab (Super Admin Only) */}
            {activeTab === 'admins' && currentAdmin?.isSuperAdmin && (
              <div>
                {/* Add New Admin Form (Collapsible) */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg mb-8 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowAddAdminForm(!showAddAdminForm)}
                    className="w-full px-5 py-3 flex items-center justify-between hover:bg-orange-100 transition-colors"
                  >
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <UserPlus size={18} />
                      Add New Admin
                    </h3>
                    <span className="text-orange-700 font-medium">
                      {showAddAdminForm ? '▼' : '>'}
                    </span>
                  </button>

                  {showAddAdminForm && (
                    <div className="px-5 pb-5 pt-2">
                      <form onSubmit={handleAddAdmin} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <input
                            type="text"
                            placeholder="Admin Name"
                            value={adminForm.name}
                            onChange={(e) => setAdminForm({...adminForm, name: e.target.value})}
                            className="input-field"
                            required
                          />
                          <input
                            type="email"
                            placeholder="Email Address"
                            value={adminForm.email}
                            onChange={(e) => setAdminForm({...adminForm, email: e.target.value})}
                            className="input-field"
                            required
                          />
                          <div className="relative">
                            <input
                              type={showAdminPassword ? "text" : "password"}
                              placeholder="Password (min 6 characters)"
                              value={adminForm.password}
                              onChange={(e) => setAdminForm({...adminForm, password: e.target.value})}
                              className="input-field pr-10"
                              minLength="6"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowAdminPassword(!showAdminPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                              {showAdminPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                        </div>
                        <button type="submit" className="btn-primary">
                          <UserPlus size={18} className="inline mr-2" />
                          Add Admin
                        </button>
                        <p className="text-sm text-gray-600 mt-2">
                          💡 Share the email and password with the new admin securely
                        </p>
                      </form>
                    </div>
                  )}
                </div>

                {/* Admins List */}
                <h3 className="text-lg font-semibold mb-4">All Administrators ({admins.length})</h3>
                <div className="overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0">
                  <table className="w-full min-w-[600px]">
                    <thead className="border-b border-gray-200">
                      <tr className="text-left">
                        <th className="pb-3 text-xs sm:text-sm">Name</th>
                        <th className="pb-3 text-xs sm:text-sm">Email</th>
                        <th className="pb-3 text-xs sm:text-sm">Role</th>
                        <th className="pb-3 text-xs sm:text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {admins.map((admin) => (
                        <tr key={admin.id} className="border-b border-gray-100">
                          <td className="py-3 text-xs sm:text-sm">{admin.name || '-'}</td>
                          <td className="py-3 text-xs sm:text-sm">{admin.email}</td>
                          <td className="py-3 text-xs sm:text-sm">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              admin.isSuperAdmin
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {admin.isSuperAdmin ? 'Super Admin' : 'Admin'}
                            </span>
                          </td>
                          <td className="py-3 text-xs sm:text-sm">
                            {!admin.isSuperAdmin && (
                              <button
                                onClick={() => handleRemoveAdmin(admin.id)}
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                Remove
                              </button>
                            )}
                            {admin.isSuperAdmin && admin.id === currentAdmin.uid && (
                              <span className="text-green-600 text-sm">You</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Reports Tab */}
            {activeTab === 'reports' && (
              <Reports donations={donations} expenses={expenses} />
            )}

            {/* Banking Tab */}
            {activeTab === 'banking' && (
              <BankingDetails />
            )}

            {/* Operations Tab */}
            {activeTab === 'operations' && (
              <BulkOperations
                accommodationRequests={accommodationRequests}
                currentAdmin={currentAdmin}
                onUpdate={fetchData}
              />
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}