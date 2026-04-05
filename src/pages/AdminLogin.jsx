import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { LogIn, ArrowLeft, Shield, Eye, EyeOff } from 'lucide-react';
import { saveSession, loadSession } from '../utils/session';
import Footer from '../components/Footer';

export default function AdminLogin() {
  const navigate = useNavigate();

  useEffect(() => {
    if (loadSession('alumni_admin')) { navigate('/admin', { replace: true }); return; }
    if (loadSession('alumni_user')) { navigate('/dashboard', { replace: true }); return; }
  }, []);

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      // Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const uid = userCredential.user.uid;

      // Check if user is admin in Firestore
      const adminDoc = await getDoc(doc(db, 'admins', uid));

      if (!adminDoc.exists() || !adminDoc.data().isAdmin) {
        // Not an admin - sign them out
        await auth.signOut();
        setError('You do not have admin privileges.');
        setLoading(false);
        return;
      }

      // Get admin details
      const adminData = {
        uid,
        email: userCredential.user.email,
        isAdmin: true,
        isSuperAdmin: adminDoc.data().isSuperAdmin || false,
        ...adminDoc.data()
      };

      saveSession('alumni_admin', adminData);

      // Navigate to admin dashboard
      navigate('/admin');
    } catch (err) {
      console.error('Admin login error:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email format.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 flex flex-col">
      <div className="flex-grow flex items-center justify-center px-4">
        <div className="max-w-md w-full">
        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={20} />
          Back to Login
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
            <Shield size={32} className="text-orange-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Access</h1>
          <p className="text-gray-600">Secure login for platform administrators</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                placeholder="admin@example.com"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pr-10"
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
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
              <LogIn size={20} />
              {loading ? 'Logging in...' : 'Login as Admin'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600">
              Regular user? <button onClick={() => navigate('/login')} className="text-primary-600 hover:underline">Login here</button>
            </p>
          </div>
        </div>
      </div>
      </div>

      <Footer />
    </div>
  );
}