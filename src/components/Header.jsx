import { LogOut, User, Menu, X, Briefcase, Heart } from 'lucide-react';

export default function Header({
  user,
  userType = 'user', // 'user' or 'admin'
  userCommittee = null,
  onLogout,
  onNavigate,
  mobileMenuOpen,
  setMobileMenuOpen,
  onDonateNow = null,
}) {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          {/* Left side - Welcome message */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-700 flex items-center justify-center text-white text-sm font-semibold">
              {(user?.firstName?.[0] || user?.name?.[0] || '').toUpperCase()}
              {(user?.lastName?.[0] || user?.email?.[0] || '').toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-primary-900">
                  Welcome, {user?.firstName || user?.name || 'User'}!
                </h1>
                {userType === 'admin' && (
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    user?.isSuperAdmin
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {user?.isSuperAdmin ? 'Super Admin' : 'Admin'}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-gray-600">
                {userType === 'user' ? (
                  <>
                    {user?.village && `${user.village} • `}
                    Class of {user?.alumniYear}
                    {userCommittee && (
                      <span className="hidden sm:inline">
                        {' • '}
                        <span className="inline-flex items-center gap-1">
                          <Briefcase size={12} className="text-primary-600" />
                          <span className="text-primary-900 font-medium">{userCommittee.name}</span>
                        </span>
                      </span>
                    )}
                  </>
                ) : (
                  'Platform Management'
                )}
              </p>
              {userType === 'user' && userCommittee && (
                <p className="text-xs text-gray-600 sm:hidden mt-0.5">
                  <span className="inline-flex items-center gap-1">
                    <Briefcase size={12} className="text-primary-600" />
                    <span className="text-primary-900 font-medium">{userCommittee.name}</span>
                  </span>
                </p>
              )}
            </div>
          </div>

          {/* Right side - Desktop Menu */}
          <div className="hidden md:flex items-center gap-4">
            {userType === 'user' && onDonateNow && (
              <button
                onClick={onDonateNow}
                className="flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors font-medium"
              >
                <Heart size={18} />
                Donate Now
              </button>
            )}
            {userType === 'user' && user?.isAdmin && (
              <button
                onClick={() => onNavigate('/admin')}
                className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                <User size={20} />
                Admin Panel
              </button>
            )}
            {userType === 'admin' && (
              <button
                onClick={() => onNavigate('/dashboard')}
                className="flex items-center gap-2 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <User size={18} />
                User Dashboard
              </button>
            )}
            <button
              onClick={onLogout}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 px-4 py-2"
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
          <div className="md:hidden mt-4 py-2 border-t border-gray-200 space-y-2">
            {userType === 'user' && onDonateNow && (
              <button
                onClick={() => {
                  onDonateNow();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 w-full px-4 py-2 text-left text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
              >
                <Heart size={20} />
                <span className="font-medium">Donate Now</span>
              </button>
            )}
            {userType === 'user' && user?.isAdmin && (
              <button
                onClick={() => {
                  onNavigate('/admin');
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 w-full px-4 py-2 text-left text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
              >
                <User size={20} />
                <span className="font-medium">Admin Panel</span>
              </button>
            )}
            {userType === 'admin' && (
              <button
                onClick={() => {
                  onNavigate('/dashboard');
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <User size={20} />
                <span className="font-medium">User Dashboard</span>
              </button>
            )}
            <button
              onClick={() => {
                onLogout();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
