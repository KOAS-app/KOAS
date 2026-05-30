import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import logoOfficial from '../assets/logo/koas_official_logo.png';

export default function PublicNavbar() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#050a08]/85 backdrop-blur-md border-b border-[#1f2d2a]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center gap-2 no-underline group">
              <img src={logoOfficial} alt="KOAS Logo" className="h-12 md:h-16 w-auto object-contain group-hover:scale-105 transition-transform" />
            </Link>
          </div>

          {/* Desktop Nav Links - centered */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-[#9ca3af] absolute left-1/2 -translate-x-1/2">
            <a href="/#pricing" className="hover:text-[#4ade80] transition-colors no-underline whitespace-nowrap">Pricing Tiers</a>
            <a href="/#contact" className="hover:text-[#4ade80] transition-colors no-underline whitespace-nowrap">Contact Support</a>
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center gap-3 lg:gap-6">
            {user ? (
              <Link to="/dashboard" className="px-4 lg:px-5 py-2 lg:py-2.5 bg-[#16a34a] hover:bg-[#15803d] text-white text-sm font-semibold rounded-lg shadow-md shadow-[#16a34a]/20 hover:shadow-lg transition-all no-underline whitespace-nowrap">
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-sm font-semibold text-[#d1d5db] hover:text-[#4ade80] transition-colors no-underline whitespace-nowrap">
                  Sign In
                </Link>
                <Link to="/register" className="px-3 lg:px-5 py-2 lg:py-2.5 bg-gradient-to-r from-[#16a34a] to-[#15803d] hover:from-[#15803d] hover:to-[#166534] text-white text-sm font-semibold rounded-lg shadow-md shadow-[#16a34a]/25 hover:shadow-lg transition-all no-underline whitespace-nowrap">
                  Join as Owner
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-[#9ca3af] hover:text-[#4ade80] hover:bg-[#1f2d2a]/50 transition-colors"
            aria-label="Toggle menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {mobileMenuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#1f2d2a]/60 py-4 space-y-3">
            <a href="/#pricing" className="block px-4 py-2 text-sm font-medium text-[#9ca3af] hover:text-[#4ade80] hover:bg-[#1f2d2a]/30 rounded-lg transition-colors no-underline">
              Pricing Tiers
            </a>
            <a href="/#contact" className="block px-4 py-2 text-sm font-medium text-[#9ca3af] hover:text-[#4ade80] hover:bg-[#1f2d2a]/30 rounded-lg transition-colors no-underline">
              Contact Support
            </a>
            <div className="border-t border-[#1f2d2a]/60 pt-3 px-4 space-y-2">
              {user ? (
                <Link to="/dashboard" className="block w-full px-4 py-2.5 bg-[#16a34a] hover:bg-[#15803d] text-white text-sm font-semibold rounded-lg shadow-md text-center transition-all no-underline">
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/login" className="block w-full px-4 py-2.5 text-center text-sm font-semibold text-[#d1d5db] hover:text-[#4ade80] hover:bg-[#1f2d2a]/30 rounded-lg transition-colors no-underline">
                    Sign In
                  </Link>
                  <Link to="/register" className="block w-full px-4 py-2.5 bg-gradient-to-r from-[#16a34a] to-[#15803d] text-white text-sm font-semibold rounded-lg shadow-md text-center transition-all no-underline">
                    Join as Owner
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
