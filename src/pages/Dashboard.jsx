import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { LogOut, Calendar, IndianRupee, FileText, User, Video, Menu, X } from 'lucide-react';
import Footer from '../components/Footer';

export default function Dashboard() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [donations, setDonations] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('meetings');
  
  // Pagination states
  const [donationPage, setDonationPage] = useState(1);
  const [expensePage, setExpensePage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
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
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
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
            <div className="bg-primary-100 p-3 rounded-full">
              <User size={24} className="text-primary-700" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">
                Welcome, {currentUser?.firstName || 'Alumni'}!
              </h2>
              <p className="text-gray-600 text-sm">
                {currentUser?.village && `${currentUser.village} • `}
                Class of {currentUser?.alumniYear}
              </p>
            </div>
          </div>
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
              <Calendar size={20} className="text-purple-600" />
              <h3 className="font-semibold text-gray-700">Total Meetings</h3>
            </div>
            <p className="text-3xl font-bold text-purple-600">{meetings.length}</p>
            <p className="text-sm text-gray-500 mt-1">Events scheduled</p>
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
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200 overflow-x-auto">
            <nav className="flex space-x-4 sm:space-x-8 px-4 sm:px-6 min-w-max" aria-label="Tabs">
              {['meetings', 'donations', 'expenses', 'reports'].map((tab) => (
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
                      {meeting.zoomLink && (
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
                  <p className="text-sm text-gray-600">
                    Showing {((donationPage - 1) * itemsPerPage) + 1} to {Math.min(donationPage * itemsPerPage, donations.length)} of {donations.length} donations
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDonationPage(p => Math.max(1, p - 1))}
                      disabled={donationPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1 text-sm">
                      Page {donationPage} of {totalDonationPages}
                    </span>
                    <button
                      onClick={() => setDonationPage(p => Math.min(totalDonationPages, p + 1))}
                      disabled={donationPage === totalDonationPages}
                      className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
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
                  <p className="text-sm text-gray-600">
                    Showing {((expensePage - 1) * itemsPerPage) + 1} to {Math.min(expensePage * itemsPerPage, expenses.length)} of {expenses.length} expenses
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setExpensePage(p => Math.max(1, p - 1))}
                      disabled={expensePage === 1}
                      className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1 text-sm">
                      Page {expensePage} of {totalExpensePages}
                    </span>
                    <button
                      onClick={() => setExpensePage(p => Math.min(totalExpensePages, p + 1))}
                      disabled={expensePage === totalExpensePages}
                      className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
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

            {/* Reports Tab */}
            {activeTab === 'reports' && (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                  <FileText size={40} className="text-gray-400" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">Reports Coming Soon</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  We're working on detailed analytics and reports. This feature will be available soon with insights on donations, expenses, and member activity.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}