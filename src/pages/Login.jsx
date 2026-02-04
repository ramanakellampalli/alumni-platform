import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, UserPlus } from 'lucide-react';
import Footer from '../components/Footer';

export default function Login() {
  const navigate = useNavigate();
  const { login, setCurrentUser } = useAuth();
  const [formData, setFormData] = useState({
    lastName: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(formData.lastName, formData.phone);
      
      if (result.success) {
        // Store user in localStorage and context
        localStorage.setItem('alumni_user', JSON.stringify(result.user));
        setCurrentUser(result.user);
        navigate('/dashboard');
      } else {
        setError(result.error || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex flex-col">
      <div className="flex-grow flex items-center justify-center px-4">
        <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-900 mb-2">Alumni Platform</h1>
          <p className="text-gray-600">Welcome back! Please login to continue.</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
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

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="input-field"
                placeholder="123-456-7890"
                required
              />
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
              <LogIn size={20} />
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={() => navigate('/register')}
              className="btn-secondary w-full flex items-center justify-center gap-2"
            >
              <UserPlus size={20} />
              New User? Register Here
            </button>
            
            <div className="mt-4 text-center">
              <button
                onClick={() => navigate('/admin-login')}
                className="text-sm text-gray-600 hover:text-primary-600"
              >
                Admin Login →
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>

      <Footer />
    </div>
  );
}