import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoOfficial from '../assets/logo/koas_official_logo.png';

export default function PublicNavbar() {
  const { user } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#050a08]/85 backdrop-blur-md border-b border-[#1f2d2a]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-3 items-center h-20">

          {/* Logo */}
          <div className="flex justify-start">
            <Link to="/" className="flex items-center gap-3 no-underline group">
              <img src={logoOfficial} alt="KOAS Logo" className="h-16 w-auto object-contain group-hover:scale-105 transition-transform" />
            </Link>
          </div>

          {/* Nav Links - perfectly centered */}
          <div className="flex justify-center">
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#9ca3af]">
              <a href="/#pricing" className="hover:text-[#4ade80] transition-colors no-underline">Pricing Tiers</a>
              <a href="/" className="hover:text-[#4ade80] transition-colors no-underline">Contact Support</a>
            </nav>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end">
            <div className="flex items-center gap-6 sm:gap-8">
              {user ? (
                <Link to="/dashboard" className="px-5 py-2.5 bg-[#16a34a] hover:bg-[#15803d] text-white text-sm font-semibold rounded-lg shadow-md shadow-[#16a34a]/20 hover:shadow-lg transition-all no-underline">
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/login" className="text-sm font-semibold text-[#d1d5db] hover:text-[#4ade80] transition-colors no-underline">
                    Sign In
                  </Link>
                  <Link to="/register" className="px-5 py-2.5 bg-gradient-to-r from-[#16a34a] to-[#15803d] hover:from-[#15803d] hover:to-[#166534] text-white text-sm font-semibold rounded-lg shadow-md shadow-[#16a34a]/25 hover:shadow-lg transition-all no-underline">
                    Join as Owner
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
