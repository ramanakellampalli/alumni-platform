import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { LogOut, Calendar, IndianRupee, FileText, User, Video, Menu, X, Briefcase } from 'lucide-react';
import Footer from '../components/Footer';
import Reports from '../components/Reports';
import BankingDetails from '../components/BankingDetails';

export default function Dashboard() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [donations, setDonations] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [users, setUsers] = useState([]);
  const [committees, setCommittees] = useState([]);
  const [userCommittee, setUserCommittee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('meetings');
  
  // Pagination states
  const [donationPage, setDonationPage] = useState(1);
  const [expensePage, setExpensePage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [currentUser, navigate]);

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

      // Fetch committees
      const committeesSnapshot = await getDocs(collection(db, 'committees'));
      const committeesData = committeesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCommittees(committeesData);

      // Find user's committee
      if (currentUser?.committeeId) {
        const committee = committeesData.find(c => c.id === currentUser.committeeId);
        setUserCommittee(committee || null);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const totalDonations = donations.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

  // Helper function to format date in Indian format (dd/mm/yyyy)
  const formatIndianDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Helper function to check if meeting is currently active
  const isMeetingActive = (meeting) => {
    const now = new Date();
    const [year, month, day] = meeting.date.split('-');
    const timeFrom = meeting.timeFrom || meeting.time; // Backward compatible
    const timeTo = meeting.timeTo;
    
    if (!timeFrom) return false;
    
    const [hoursFrom, minutesFrom] = timeFrom.split(':');
    const meetingStart = new Date(year, month - 1, day, hoursFrom, minutesFrom);
    
    let meetingEnd;
    if (timeTo) {
      const [hoursTo, minutesTo] = timeTo.split(':');
      meetingEnd = new Date(year, month - 1, day, hoursTo, minutesTo);
    } else {
      // Default 2 hours if no end time
      meetingEnd = new Date(meetingStart.getTime() + (2 * 60 * 60 * 1000));
    }
    
    return now >= meetingStart && now <= meetingEnd;
  };

  // Helper function to check if meeting is in the past
  const isMeetingPast = (meeting) => {
    const now = new Date();
    const [year, month, day] = meeting.date.split('-');
    const timeTo = meeting.timeTo || meeting.time;
    
    if (!timeTo) return false;
    
    const [hours, minutes] = timeTo.split(':');
    const meetingEnd = new Date(year, month - 1, day, hours, minutes);
    
    if (!meeting.timeTo && meeting.time) {
      // Backward compatible: add 2 hours to old meetings
      meetingEnd.setHours(meetingEnd.getHours() + 2);
    }
    
    return now > meetingEnd;
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
  const totalDonationPages = getTotalPages(donations);
  const totalExpensePages = getTotalPages(expenses);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl sm:text-2xl font-bold text-primary-900">Alumni Platform</h1>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-4">
              {currentUser?.isAdmin && (
                <button
                  onClick={() => navigate('/admin')}
                  className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <User size={20} />
                  Admin Panel
                </button>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
              >
                <LogOut size={20} />
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
              {currentUser?.isAdmin && (
                <button
                  onClick={() => {
                    navigate('/admin');
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-left text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                >
                  <User size={20} />
                  <span className="font-medium">Admin Panel</span>
                </button>
              )}
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
        {/* User Info Card */}
        <div className="card mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary-700 flex items-center justify-center text-white font-bold text-lg">
              {(currentUser?.firstName?.[0] || '').toUpperCase()}{(currentUser?.lastName?.[0] || '').toUpperCase()}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold">
                Welcome, {currentUser?.firstName || 'Alumni'}!
              </h2>
              <p className="text-gray-600 text-sm">
                {currentUser?.village && `${currentUser.village} • `}
                Class of {currentUser?.alumniYear}
              </p>
            </div>
            {userCommittee && (
              <div className="hidden sm:block">
                <div className="flex items-center gap-2 bg-primary-50 border border-primary-200 px-3 py-2 rounded-lg">
                  <Briefcase size={16} className="text-primary-600" />
                  <span className="text-sm font-medium text-primary-900">{userCommittee.name}</span>
                </div>
              </div>
            )}
          </div>
          {userCommittee && (
            <div className="sm:hidden mt-2">
              <div className="flex items-center gap-2 bg-primary-50 border border-primary-200 px-3 py-2 rounded-lg w-fit">
                <Briefcase size={16} className="text-primary-600" />
                <span className="text-sm font-medium text-primary-900">{userCommittee.name}</span>
              </div>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center gap-3 mb-2">
              <User size={20} className="text-blue-600" />
              <h3 className="font-semibold text-gray-700">Total Users</h3>
            </div>
            <p className="text-3xl font-bold text-blue-600">{users.length}</p>
            <p className="text-sm text-gray-500 mt-1">Registered alumni</p>
          </div>

          <div className="card">
            <div className="flex items-center gap-3 mb-2">
              <IndianRupee size={20} className="text-green-600" />
              <h3 className="font-semibold text-gray-700">Total Donations</h3>
            </div>
            <p className="text-3xl font-bold text-green-600">
              ₹{totalDonations.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-gray-500 mt-1">{donations.length} contributions</p>
          </div>

          <div className="card">
            <div className="flex items-center gap-3 mb-2">
              <FileText size={20} className="text-orange-600" />
              <h3 className="font-semibold text-gray-700">Total Expenses</h3>
            </div>
            <p className="text-3xl font-bold text-orange-600">
              ₹{totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-gray-500 mt-1">{expenses.length} transactions</p>
          </div>

          <div className="card">
            <div className="flex items-center gap-3 mb-2">
              <IndianRupee size={20} className="text-teal-600" />
              <h3 className="font-semibold text-gray-700">Remaining Cash</h3>
            </div>
            <p className={`text-3xl font-bold ${totalDonations - totalExpenses >= 0 ? 'text-teal-600' : 'text-red-600'}`}>
              ₹{(totalDonations - totalExpenses).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-gray-500 mt-1">Available balance</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200 overflow-x-auto">
            <nav className="flex space-x-4 sm:space-x-8 px-4 sm:px-6 min-w-max" aria-label="Tabs">
              {['meetings', 'donations', 'expenses', 'committee', 'reports', 'banking'].map((tab) => (
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
                {/* Upcoming Meetings */}

          {meetings.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No upcoming meetings scheduled</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {meetings.map((meeting) => {
                const isActive = isMeetingActive(meeting);
                const isPast = isMeetingPast(meeting);

                // Check if user has access to this meeting
                const hasAccess = meeting.committeeIds && meeting.committeeIds.length > 0
                  ? meeting.committeeIds.includes(currentUser?.committeeId)
                  : false;

                // Get committee names for this meeting
                const meetingCommittees = meeting.committeeIds
                  ? committees.filter(c => meeting.committeeIds.includes(c.id))
                  : [];

                return (
                  <div key={meeting.id} className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors">
                    <div className="mb-2">
                      <h3 className="font-semibold text-base">{meeting.title}</h3>
                    </div>
                    <p className="text-gray-600 text-sm mb-3" style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>{meeting.description}</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar size={14} />
                        <span>{formatIndianDate(meeting.date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span className="font-medium">Time:</span>
                        <span>{meeting.timeFrom || meeting.time} - {meeting.timeTo || 'TBD'}</span>
                      </div>

                      {/* Committee Badge */}
                      {meetingCommittees.length > 0 && (
                        <div className="flex items-start gap-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                          <Briefcase size={12} className="mt-0.5 flex-shrink-0" />
                          <span className="flex-1">
                            {meetingCommittees.map(c => c.name).join(', ')}
                          </span>
                        </div>
                      )}

                      {meeting.zoomLink && (
                        <>
                          {hasAccess ? (
                            <a
                              href={isPast ? '#' : meeting.zoomLink}
                              target={isPast ? '' : '_blank'}
                              rel="noopener noreferrer"
                              className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full ${
                                isPast
                                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                  : isActive
                                  ? 'bg-green-600 text-white hover:bg-green-700 animate-pulse'
                                  : 'bg-primary-600 text-white hover:bg-primary-700'
                              }`}
                              onClick={(e) => isPast && e.preventDefault()}
                            >
                              <Video size={16} />
                              {isPast ? 'Meeting Ended' : isActive ? 'Join Now (Live)' : 'Join Meeting'}
                            </a>
                          ) : (
                            <div className="space-y-1">
                              <button
                                disabled
                                className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium w-full bg-gray-200 text-gray-400 cursor-not-allowed"
                                title="This meeting is restricted to specific committees"
                              >
                                <Video size={16} />
                                Meeting Restricted
                              </button>
                              <p className="text-xs text-gray-500 text-center">
                                This meeting is for {meetingCommittees.map(c => c.name).join(', ')} only
                              </p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
              </div>
            )}

            {/* Donations Tab */}
            {activeTab === 'donations' && (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <IndianRupee size={24} className="text-green-600" />
                  All Donations
                </h2>

          {donations.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No donations recorded yet</p>
          ) : (
            <>
              <div className="overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0">
                <table className="w-full min-w-[800px]">
                  <thead className="border-b border-gray-200">
                    <tr className="text-left">
                      <th className="pb-3 font-semibold text-gray-700 text-xs sm:text-sm">Date</th>
                      <th className="pb-3 font-semibold text-gray-700 text-xs sm:text-sm">Donor</th>
                      <th className="pb-3 font-semibold text-gray-700 text-xs sm:text-sm">Amount</th>
                      <th className="pb-3 font-semibold text-gray-700 text-xs sm:text-sm">Phone</th>
                      <th className="pb-3 font-semibold text-gray-700 text-xs sm:text-sm">Year</th>
                      <th className="pb-3 font-semibold text-gray-700 text-xs sm:text-sm">Village</th>
                      <th className="pb-3 font-semibold text-gray-700 text-xs sm:text-sm">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedDonations.map((donation) => (
                      <tr key={donation.id} className="border-b border-gray-100">
                        <td className="py-3 text-gray-600 text-xs sm:text-sm">{formatIndianDate(donation.date)}</td>
                        <td className="py-3 text-xs sm:text-sm">{donation.donorName}</td>
                        <td className="py-3 font-semibold text-green-600 text-xs sm:text-sm whitespace-nowrap">
                          ₹{parseFloat(donation.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 text-gray-600 text-xs sm:text-sm">{donation.phone || '-'}</td>
                        <td className="py-3 text-gray-600 text-xs sm:text-sm">{donation.alumniYear || '-'}</td>
                        <td className="py-3 text-gray-600 text-xs sm:text-sm">{donation.village || '-'}</td>
                        <td className="py-3 text-gray-600 text-xs sm:text-sm">{donation.notes || '-'}</td>
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
            </>
          )}
              </div>
            )}

            {/* Expenses Tab */}
            {activeTab === 'expenses' && (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <FileText size={24} className="text-orange-600" />
                  All Expenses
                </h2>

          {expenses.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No expenses recorded yet</p>
          ) : (
            <>
              <div className="overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0">
                <table className="w-full min-w-[700px]">
                  <thead className="border-b border-gray-200">
                    <tr className="text-left">
                      <th className="pb-3 font-semibold text-gray-700 text-xs sm:text-sm">Date</th>
                      <th className="pb-3 font-semibold text-gray-700 text-xs sm:text-sm">Description</th>
                      <th className="pb-3 font-semibold text-gray-700 text-xs sm:text-sm">Amount</th>
                      <th className="pb-3 font-semibold text-gray-700 text-xs sm:text-sm">Category</th>
                      <th className="pb-3 font-semibold text-gray-700 text-xs sm:text-sm">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedExpenses.map((expense) => (
                      <tr key={expense.id} className="border-b border-gray-100">
                        <td className="py-3 text-gray-600 text-xs sm:text-sm">
                          {formatIndianDate(expense.date)}
                        </td>
                        <td className="py-3 text-xs sm:text-sm">{expense.description}</td>
                        <td className="py-3 font-semibold text-orange-600 text-xs sm:text-sm whitespace-nowrap">
                          ₹{parseFloat(expense.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 text-gray-600 text-xs sm:text-sm">{expense.category || '-'}</td>
                        <td className="py-3 text-gray-600 text-xs sm:text-sm">{expense.notes || '-'}</td>
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
            </>
          )}
              </div>
            )}

            {/* Committee Tab */}
            {activeTab === 'committee' && (
              <div>
                {committees.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No committees available yet.</p>
                ) : (
                  <>
                    {/* Desktop Layout: 2-Column */}
                    <div className="hidden md:grid md:grid-cols-4 gap-6">
                      {/* Left Panel: Committee List (25%) */}
                      <div className="md:col-span-1">
                        <h3 className="font-semibold text-gray-700 mb-3 text-sm">Committees ({committees.length})</h3>
                        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                          {committees.map((committee, index) => {
                            const isUserCommittee = committee.id === currentUser?.committeeId;
                            const memberCount = users.filter(u => u.committeeId === committee.id).length;
                            return (
                              <button
                                key={committee.id}
                                onClick={() => {
                                  const selectedComm = committees.find(c => c.id === committee.id);
                                  setUserCommittee(selectedComm);
                                }}
                                className={`w-full text-left px-4 py-3 transition-colors ${
                                  index !== committees.length - 1 ? 'border-b border-gray-200' : ''
                                } ${
                                  userCommittee?.id === committee.id
                                    ? 'bg-primary-50 text-primary-900 border-l-4 border-l-primary-600'
                                    : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                <div className="text-sm font-medium">
                                  <div className="flex items-center justify-between">
                                    <span>{committee.name}</span>
                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                      <User size={14} />
                                      <span>{memberCount}</span>
                                    </div>
                                  </div>
                                  {isUserCommittee && (
                                    <span className="text-xs text-primary-600 mt-1 block">(Your Committee)</span>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Right Panel: Committee Details (75%) */}
                      <div className="md:col-span-3">
                        {userCommittee ? (
                          <div>
                            {/* Committee Header */}
                            <div className="mb-4">
                              <h3 className="text-lg font-semibold">{userCommittee.name}</h3>
                              {userCommittee.description && (
                                <p className="text-sm text-gray-600">{userCommittee.description}</p>
                              )}
                            </div>

                            {/* Members Table */}
                            <div>
                              {users.filter(u => u.committeeId === userCommittee.id).length === 0 ? (
                                <p className="text-gray-500 text-center py-6">No members in this committee.</p>
                              ) : (
                                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                  <table className="w-full">
                                    <thead className="bg-gray-50">
                                      <tr className="text-left">
                                        <th className="px-4 py-3.5 text-sm font-semibold text-gray-700">Name</th>
                                        <th className="px-4 py-3.5 text-sm font-semibold text-gray-700">Phone</th>
                                        <th className="px-4 py-3.5 text-sm font-semibold text-gray-700">Year</th>
                                        <th className="px-4 py-3.5 text-sm font-semibold text-gray-700">Village</th>
                                      </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                      {users
                                        .filter(u => u.committeeId === userCommittee.id)
                                        .map((member) => (
                                          <tr key={member.id} className={`transition-colors ${member.id === currentUser?.id ? 'bg-primary-50 hover:bg-primary-100' : 'hover:bg-gray-50'}`}>
                                            <td className="px-4 py-3.5 text-sm font-medium text-gray-900">
                                              {member.firstName} {member.lastName}
                                              {member.id === currentUser?.id && (
                                                <span className="ml-2 text-xs font-semibold text-primary-700 bg-primary-100 px-2 py-0.5 rounded">(You)</span>
                                              )}
                                            </td>
                                            <td className="px-4 py-3.5 text-sm text-gray-600">{member.phone}</td>
                                            <td className="px-4 py-3.5 text-sm text-gray-600">{member.alumniYear}</td>
                                            <td className="px-4 py-3.5 text-sm text-gray-600">{member.village || '-'}</td>
                                          </tr>
                                        ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-500 text-center py-8">Select a committee to view members</p>
                        )}
                      </div>
                    </div>

                    {/* Mobile Layout: Accordion */}
                    <div className="md:hidden space-y-2">
                      {committees.map((committee) => {
                        const committeeMembers = users.filter(u => u.committeeId === committee.id);
                        const isExpanded = userCommittee?.id === committee.id;
                        const isUserCommittee = committee.id === currentUser?.committeeId;

                        return (
                          <div key={committee.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                            {/* Committee Header (Accordion Toggle) */}
                            <button
                              onClick={() => {
                                const selectedComm = isExpanded ? null : committees.find(c => c.id === committee.id);
                                setUserCommittee(selectedComm);
                              }}
                              className={`w-full px-4 py-3 transition-colors flex items-center justify-between ${
                                isExpanded ? 'bg-primary-50' : 'bg-white hover:bg-gray-50'
                              }`}
                            >
                              <div className="text-left flex-1">
                                <div className="font-medium text-sm text-gray-800">
                                  <div className="flex items-center justify-between">
                                    <span>{committee.name}</span>
                                    <div className="flex items-center gap-1 text-xs text-gray-500 mr-2">
                                      <User size={14} />
                                      <span>{committeeMembers.length}</span>
                                    </div>
                                  </div>
                                  {isUserCommittee && (
                                    <span className="text-xs text-primary-600 mt-1 block">(Your Committee)</span>
                                  )}
                                </div>
                              </div>
                              <span className="text-gray-500 text-sm">{isExpanded ? '▼' : '►'}</span>
                            </button>

                            {/* Expanded Content */}
                            {isExpanded && (
                              <div className="p-4">
                                {/* Members List (Cards) */}
                                <div>
                                  {committeeMembers.length === 0 ? (
                                    <p className="text-gray-500 text-sm text-center py-4">No members yet</p>
                                  ) : (
                                    <div className="space-y-2">
                                      {committeeMembers.map((member) => (
                                        <div key={member.id} className={`border border-gray-200 rounded-lg p-3 ${member.id === currentUser?.id ? 'bg-primary-50 border-primary-200' : 'bg-white'}`}>
                                          <div className="font-medium text-sm">
                                            {member.firstName} {member.lastName}
                                            {member.id === currentUser?.id && (
                                              <span className="ml-2 text-xs font-medium text-primary-600">(You)</span>
                                            )}
                                          </div>
                                          <div className="text-xs text-gray-600 mt-1">
                                            {member.alumniYear} • {member.village || 'N/A'}
                                          </div>
                                          <div className="text-xs text-gray-500 mt-1">📞 {member.phone}</div>
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

            {/* Reports Tab */}
            {activeTab === 'reports' && (
              <Reports donations={donations} expenses={expenses} />
            )}

            {/* Banking Tab */}
            {activeTab === 'banking' && (
              <BankingDetails />
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}