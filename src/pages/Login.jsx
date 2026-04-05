import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { saveSession, loadSession } from '../utils/session';
import { LogIn, UserPlus } from 'lucide-react';
import Footer from '../components/Footer';
import EventCountdown from '../components/EventCountdown';

function AnimatedCounter({ target, duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    let start = null;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) {
        ref.current = requestAnimationFrame(step);
      }
    };
    ref.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(ref.current);
  }, [target, duration]);

  return count;
}

const CONFETTI_COLORS = [
  '#ffd700', '#ffb800', '#0ea5e9', '#38bdf8',
  '#f59e0b', '#ffffff', '#fbbf24', '#7dd3fc',
];

function Confetti() {
  const pieces = useMemo(() =>
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      delay: Math.random() * 4,
      duration: 4 + Math.random() * 4,
      size: 6 + Math.random() * 6,
      rotation: Math.random() * 360,
      sway: -30 + Math.random() * 60,
    })),
  []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: p.left,
            width: `${p.size}px`,
            height: `${p.size * 1.6}px`,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotation}deg) translateX(${p.sway}px)`,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          }}
        />
      ))}
    </div>
  );
}

function Sparkles() {
  const stars = useMemo(() =>
    Array.from({ length: 25 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: Math.random() * 6,
      duration: 1.5 + Math.random() * 2.5,
      size: 2 + Math.random() * 4,
    })),
  []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((s) => (
        <div
          key={s.id}
          className="sparkle"
          style={{
            left: s.left,
            top: s.top,
            width: `${s.size}px`,
            height: `${s.size}px`,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const { login, setCurrentUser } = useAuth();
  const [formData, setFormData] = useState({
    lastName: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (loadSession('alumni_admin')) { navigate('/admin', { replace: true }); return; }
    if (loadSession('alumni_user')) { navigate('/dashboard', { replace: true }); return; }
  }, []);

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
        saveSession('alumni_user', result.user);
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
    <div className="min-h-screen bg-gray-950 flex flex-col overflow-hidden relative">
      <div className="flex-grow flex flex-col lg:flex-row">

      {/* ===== LHS: Celebration showcase (hidden on mobile, full left panel on desktop) ===== */}
      <div className="hidden lg:flex lg:w-1/2 flex-col relative overflow-hidden">
        {/* Orbs — LHS only on desktop */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="orb" style={{ width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(14,165,233,0.4), transparent 70%)', top: '-10%', left: '-10%', animationDuration: '14s' }} />
          <div className="orb" style={{ width: '350px', height: '350px', background: 'radial-gradient(circle, rgba(255,215,0,0.3), transparent 70%)', top: '20%', right: '-8%', animationDelay: '-4s', animationDuration: '16s' }} />
          <div className="orb" style={{ width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(14,165,233,0.25), transparent 70%)', bottom: '5%', left: '20%', animationDelay: '-8s', animationDuration: '18s' }} />
          <div className="orb" style={{ width: '250px', height: '250px', background: 'radial-gradient(circle, rgba(255,215,0,0.2), transparent 70%)', bottom: '15%', right: '15%', animationDelay: '-2s', animationDuration: '13s' }} />
        </div>
        <Sparkles />
        <Confetti />

        {/* EventCountdown at top of LHS */}
        <div className="relative z-10 p-6 pb-0">
          <EventCountdown />
        </div>

        {/* Hero content */}
        <div className="flex-1 flex flex-col items-center justify-center relative z-10 text-center px-12">
          <div className="animate-rise" style={{ animationDelay: '0.1s' }}>
            <span className="text-shimmer glow-text text-9xl xl:text-[10rem] font-black tracking-tight leading-none">
              <AnimatedCounter target={75} duration={2200} />
            </span>
          </div>
          <div className="animate-rise" style={{ animationDelay: '0.4s' }}>
            <p className="text-amber-400/80 text-sm font-semibold tracking-[0.25em] uppercase mt-4">
              Years of Excellence
            </p>
          </div>
          <div className="animate-rise" style={{ animationDelay: '0.65s' }}>
            <h1 className="text-3xl xl:text-4xl font-bold text-white mt-5">
              ZPHS Valaparla
            </h1>
          </div>
          <div className="animate-rise" style={{ animationDelay: '0.85s' }}>
            <p className="text-gray-300 mt-2 font-medium">Platinum Jubilee Celebrations</p>
            <p className="mt-1.5 flex items-center justify-center gap-3 text-sm">
              <span className="date-badge">
                <span className="date-badge-day">Saturday</span>
                <span className="date-badge-date">May 9th</span>
              </span>
              <span className="text-amber-400/60 text-xs">&amp;</span>
              <span className="date-badge">
                <span className="date-badge-day">Sunday</span>
                <span className="date-badge-date">May 10th</span>
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* ===== RHS: Login form (full screen on mobile, right panel on desktop) ===== */}
      <div className="flex-1 flex flex-col relative">

        {/* Mobile-only: effects behind form */}
        <div className="lg:hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="orb" style={{ width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(14,165,233,0.35), transparent 70%)', top: '-10%', left: '-10%', animationDuration: '14s' }} />
            <div className="orb" style={{ width: '250px', height: '250px', background: 'radial-gradient(circle, rgba(255,215,0,0.25), transparent 70%)', top: '30%', right: '-8%', animationDelay: '-4s', animationDuration: '16s' }} />
          </div>
          <Sparkles />
          <Confetti />
        </div>

        {/* Mobile: EventCountdown full-width above form */}
        <div className="lg:hidden px-6 pt-6 relative z-10">
          <EventCountdown />
        </div>

        {/* Form area */}
        <div className="flex-grow flex items-center justify-center px-6 pt-2 pb-10 lg:py-12 relative z-10">
          <div className="max-w-md w-full">

            {/* Mobile-only: hero above card */}
            <div className="lg:hidden text-center mb-8">
              <div className="animate-rise" style={{ animationDelay: '0.1s' }}>
                <span className="text-shimmer glow-text text-8xl sm:text-9xl font-black tracking-tight leading-none">
                  <AnimatedCounter target={75} duration={2200} />
                </span>
              </div>
              <div className="animate-rise" style={{ animationDelay: '0.4s' }}>
                <p className="text-amber-400/80 text-sm font-semibold tracking-[0.25em] uppercase mt-3">
                  Years of Excellence
                </p>
              </div>
              <div className="animate-rise" style={{ animationDelay: '0.65s' }}>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mt-4">
                  ZPHS Valaparla
                </h1>
              </div>
              <div className="animate-rise" style={{ animationDelay: '0.85s' }}>
                <p className="text-gray-300 text-sm mt-1.5 font-medium">Platinum Jubilee Celebrations</p>
                <p className="mt-1.5 flex items-center justify-center gap-3 text-sm">
                  <span className="date-badge">
                    <span className="date-badge-day">Saturday</span>
                    <span className="date-badge-date">May 9th</span>
                  </span>
                  <span className="text-amber-400/60 text-xs">&amp;</span>
                  <span className="date-badge">
                    <span className="date-badge-day">Sunday</span>
                    <span className="date-badge-date">May 10th</span>
                  </span>
                </p>
              </div>
            </div>

            {/* Desktop: small welcome text above card */}
            <div className="hidden lg:block mb-8 animate-rise" style={{ animationDelay: '0.3s' }}>
              <h2 className="text-2xl font-bold text-white">Welcome back</h2>
              <p className="text-gray-400 text-sm mt-1">Sign in to your alumni account</p>
            </div>

            {/* Login card */}
            <div
              className="bg-white/[0.07] backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-white/10 shadow-2xl animate-rise"
              style={{ animationDelay: '1.1s' }}
            >
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="animate-rise" style={{ animationDelay: '1.3s' }}>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-1.5">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white/[0.08] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-400/50 focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>

                <div className="animate-rise" style={{ animationDelay: '1.45s' }}>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white/[0.08] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-400/50 focus:border-transparent outline-none transition-all"
                    placeholder="000-000-0000"
                    maxLength={10}
                    required
                  />
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div className="animate-rise" style={{ animationDelay: '1.6s' }}>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-gray-950 font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/20"
                  >
                    <LogIn size={18} />
                    {loading ? 'Logging in...' : 'Login'}
                  </button>
                </div>
              </form>

              <div className="animate-rise" style={{ animationDelay: '1.75s' }}>
                <div className="mt-6 pt-6 border-t border-white/10">
                  <button
                    onClick={() => navigate('/register')}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white/[0.08] hover:bg-white/[0.12] text-gray-200 font-medium rounded-lg transition-all border border-white/10"
                  >
                    <UserPlus size={18} />
                    New User? Register Here
                  </button>

                  <div className="mt-4 text-center">
                    <button
                      onClick={() => navigate('/admin-login')}
                      className="text-sm text-gray-500 hover:text-amber-400 transition-colors"
                    >
                      Admin Login &rarr;
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
      </div>

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}
