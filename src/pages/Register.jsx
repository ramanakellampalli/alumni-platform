import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../config/firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { ArrowLeft, UserPlus } from 'lucide-react';
import Toast from '../components/Toast';
import Footer from '../components/Footer';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    village: '',
    alumniYear: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const digits = value.replace(/\D/g, '');
      if (digits.startsWith('0')) return;
      if (digits.length > 10) return;
      setFormData({ ...formData, phone: digits });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (formData.phone.length !== 10) {
        setError('Phone number must be exactly 10 digits.');
        setLoading(false);
        return;
      }

      const toTitleCase = str => str.trim().split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');

      const firstName = toTitleCase(formData.firstName);
      const lastName = toTitleCase(formData.lastName);

      // Check duplicate by phone
      const phoneSnap = await getDocs(query(collection(db, 'users'), where('phone', '==', formData.phone)));
      if (!phoneSnap.empty) {
        setError('A user with this phone number is already registered.');
        setLoading(false);
        return;
      }

      // Check duplicate by name + alumni year
      const nameSnap = await getDocs(query(
        collection(db, 'users'),
        where('firstName', '==', firstName),
        where('lastName', '==', lastName),
        where('alumniYear', '==', formData.alumniYear)
      ));
      if (!nameSnap.empty) {
        setError('A user with the same name and alumni year is already registered.');
        setLoading(false);
        return;
      }

      // Add user to Firestore
      await addDoc(collection(db, 'users'), {
        ...formData,
        firstName,
        lastName,
        isAdmin: false,
        createdAt: new Date().toISOString()
      });

      setToast({ message: 'Registration successful! Redirecting to login...', type: 'success' });
      
      // Delay navigation to show toast
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error('Registration error:', err);
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex flex-col">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="flex-grow py-8 px-4">
        <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 text-primary-700 hover:text-primary-800 mb-6"
        >
          <ArrowLeft size={20} />
          Back to Login
        </button>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-900 mb-2">Join Our Alumni Network</h1>
          <p className="text-gray-600">Register to stay connected with your fellow alumni</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="input-field"
                placeholder="9876543210"
                maxLength={10}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="village" className="block text-sm font-medium text-gray-700 mb-1">
                  Village
                </label>
                <input
                  type="text"
                  id="village"
                  name="village"
                  value={formData.village}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div>
                <label htmlFor="alumniYear" className="block text-sm font-medium text-gray-700 mb-1">
                  Alumni Year *
                </label>
                <input
                  type="number"
                  id="alumniYear"
                  name="alumniYear"
                  value={formData.alumniYear}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="2020"
                  min="1950"
                  max="2030"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <UserPlus size={20} />
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
        </div>
      </div>
      </div>

      <Footer />
    </div>
  );
}