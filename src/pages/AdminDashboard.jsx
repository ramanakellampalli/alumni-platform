import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../config/firebase';
import { collection, addDoc, getDocs, query, orderBy, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { LogOut, Plus, Calendar, IndianRupee, FileText, Users, Trash2, User, Shield, UserPlus, Menu, X, Eye, EyeOff } from 'lucide-react';
import Toast from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';
import Footer from '../components/Footer';
import Reports from '../components/Reports';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [activeTab, setActiveTab] = useState('meetings');
  const [meetings, setMeetings] = useState([]);
  const [donations, setDonations] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  
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
    zoomLink: ''
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
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMeeting = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'meetings'), meetingForm);
      showToast('Meeting added successfully!');
      setMeetingForm({ title: '', date: '', timeFrom: '', timeTo: '', description: '', zoomLink: '' });
      fetchData();
    } catch (error) {
      console.error('Error adding meeting:', error);
      showToast('Failed to add meeting', 'error');
    }
  };

  const handleAddDonation = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'donations'), donationForm);
      showToast('Donation recorded successfully!');
      setDonationForm({ date: '', donorName: '', amount: '', phone: '', alumniYear: '', village: '', notes: '' });
      fetchData();
    } catch (error) {
      console.error('Error adding donation:', error);
      showToast('Failed to record donation', 'error');
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'expenses'), expenseForm);
      showToast('Expense recorded successfully!');
      setExpenseForm({ date: '', description: '', amount: '', category: '', notes: '' });
      fetchData();
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
          showToast('Meeting deleted successfully!');
          fetchData();
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

      // Add to admins collection
      await setDoc(doc(db, 'admins', uid), {
        email: adminForm.email,
        name: adminForm.name,
        isAdmin: true,
        isSuperAdmin: false,
        createdAt: new Date().toISOString(),
        createdBy: currentAdmin.uid
      });

      showToast('Admin added successfully!');
      setAdminForm({ email: '', password: '', name: '' });
      fetchData();
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
          showToast('Admin removed successfully!');
          fetchData();
        } catch (error) {
          console.error('Error removing admin:', error);
          showToast('Failed to remove admin', 'error');
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

  // Helper function to format date in Indian format (dd/mm/yyyy)
  const formatIndianDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
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
    <div className="min-h-screen bg-gray-50">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
      />

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-primary-900">Admin Dashboard</h1>
              <p className="text-xs sm:text-sm text-gray-600">Platform Management</p>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <User size={18} />
                User Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 px-4 py-2"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 py-4 border-t border-gray-200 space-y-2">
              <button
                onClick={() => {
                  navigate('/dashboard');
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <User size={20} />
                <span className="font-medium">User Dashboard</span>
              </button>
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut size={20} />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center gap-2 mb-2">
              <Users size={20} className="text-primary-600" />
              <h3 className="font-semibold text-gray-700">Total Users</h3>
            </div>
            <p className="text-3xl font-bold text-primary-600">{users.length}</p>
          </div>

          <div className="card">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={20} className="text-blue-600" />
              <h3 className="font-semibold text-gray-700">Meetings</h3>
            </div>
            <p className="text-3xl font-bold text-blue-600">{meetings.length}</p>
          </div>

          <div className="card">
            <div className="flex items-center gap-2 mb-2">
              <IndianRupee size={20} className="text-green-600" />
              <h3 className="font-semibold text-gray-700">Donations</h3>
            </div>
            <p className="text-3xl font-bold text-green-600">₹{totalDonations.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>

          <div className="card">
            <div className="flex items-center gap-2 mb-2">
              <FileText size={20} className="text-orange-600" />
              <h3 className="font-semibold text-gray-700">Expenses</h3>
            </div>
            <p className="text-3xl font-bold text-orange-600">₹{totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>

          <div className="card">
            <div className="flex items-center gap-2 mb-2">
              <IndianRupee size={20} className="text-teal-600" />
              <h3 className="font-semibold text-gray-700">Remaining Cash</h3>
            </div>
            <p className={`text-3xl font-bold ${totalDonations - totalExpenses >= 0 ? 'text-teal-600' : 'text-red-600'}`}>
              ₹{(totalDonations - totalExpenses).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200 overflow-x-auto">
            <nav className="flex space-x-4 sm:space-x-8 px-4 sm:px-6 min-w-max" aria-label="Tabs">
              {['meetings', 'donations', 'expenses', 'users', ...(currentAdmin?.isSuperAdmin ? ['admins'] : []), 'reports'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm capitalize whitespace-nowrap ${
                    activeTab === tab
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Meetings Tab */}
            {activeTab === 'meetings' && (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Plus size={20} />
                  Add New Meeting
                </h2>
                <form onSubmit={handleAddMeeting} className="space-y-4 mb-8">
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
                  <input
                    type="url"
                    placeholder="Meeting Link (Zoom, Google Meet, etc.)"
                    value={meetingForm.zoomLink}
                    onChange={(e) => setMeetingForm({...meetingForm, zoomLink: e.target.value})}
                    className="input-field"
                  />
                  <button type="submit" className="btn-primary">Add Meeting</button>
                </form>

                <h3 className="text-lg font-semibold mb-4">All Meetings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                        🕐 {meeting.timeFrom || meeting.time} - {meeting.timeTo || ''}
                      </p>
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
            )}

            {/* Donations Tab */}
            {activeTab === 'donations' && (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Plus size={20} />
                  Record New Donation
                </h2>
                <form onSubmit={handleAddDonation} className="space-y-4 mb-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="date"
                      value={donationForm.date}
                      onChange={(e) => setDonationForm({...donationForm, date: e.target.value})}
                      className="input-field"
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
                      </tr>
                    </thead>
                    <tbody>
                      {donations.map((donation) => (
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Expenses Tab */}
            {activeTab === 'expenses' && (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Plus size={20} />
                  Record New Expense
                </h2>
                <form onSubmit={handleAddExpense} className="space-y-4 mb-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="date"
                      value={expenseForm.date}
                      onChange={(e) => setExpenseForm({...expenseForm, date: e.target.value})}
                      className="input-field"
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
                      </tr>
                    </thead>
                    <tbody>
                      {expenses.map((expense) => (
                        <tr key={expense.id} className="border-b border-gray-100">
                          <td className="py-3 text-xs sm:text-sm">{formatIndianDate(expense.date)}</td>
                          <td className="py-3 text-xs sm:text-sm">{expense.description}</td>
                          <td className="py-3 font-semibold text-orange-600 text-xs sm:text-sm whitespace-nowrap">
                            ₹{parseFloat(expense.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 text-xs sm:text-sm">{expense.category || '-'}</td>
                          <td className="py-3 text-xs sm:text-sm">{expense.notes || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
                        <th className="pb-3 text-xs sm:text-sm">Email</th>
                        <th className="pb-3 text-xs sm:text-sm">Phone</th>
                        <th className="pb-3 text-xs sm:text-sm">Village</th>
                        <th className="pb-3 text-xs sm:text-sm">Year</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b border-gray-100">
                          <td className="py-3 text-xs sm:text-sm">{user.firstName} {user.lastName}</td>
                          <td className="py-3 text-xs sm:text-sm">{user.email}</td>
                          <td className="py-3 text-xs sm:text-sm">{user.phone}</td>
                          <td className="py-3 text-xs sm:text-sm">{user.village || '-'}</td>
                          <td className="py-3 text-xs sm:text-sm">{user.alumniYear}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Admins Tab (Super Admin Only) */}
            {activeTab === 'admins' && currentAdmin?.isSuperAdmin && (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Shield size={20} />
                  Manage Administrators
                </h2>
                
                {/* Add New Admin Form */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-8">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <UserPlus size={20} />
                    Add New Admin
                  </h3>
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

                {/* Admins List */}
                <h3 className="text-lg font-semibold mb-4">All Administrators ({admins.length})</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-gray-200">
                      <tr className="text-left">
                        <th className="pb-3">Name</th>
                        <th className="pb-3">Email</th>
                        <th className="pb-3">Role</th>
                        <th className="pb-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {admins.map((admin) => (
                        <tr key={admin.id} className="border-b border-gray-100">
                          <td className="py-3">{admin.name || '-'}</td>
                          <td className="py-3">{admin.email}</td>
                          <td className="py-3">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              admin.isSuperAdmin 
                                ? 'bg-orange-100 text-orange-700' 
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {admin.isSuperAdmin ? 'Super Admin' : 'Admin'}
                            </span>
                          </td>
                          <td className="py-3">
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
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}