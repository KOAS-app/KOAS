import { Link } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import logoOfficial from '../assets/logo/koas_official_logo.png';

export default function PublicNavbar() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const contactRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contactRef.current && !contactRef.current.contains(e.target as Node)) {
        setContactOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
            <div className="relative" ref={contactRef}>
              <button
                onClick={() => setContactOpen(!contactOpen)}
                className="flex items-center gap-1.5 hover:text-[#4ade80] transition-colors no-underline whitespace-nowrap cursor-pointer bg-transparent border-none text-[#9ca3af] text-sm font-medium"
              >
                Contact Support
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${contactOpen ? 'rotate-180' : ''}`}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {contactOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-[#111819] border border-[#1f2d2a] rounded-xl shadow-2xl overflow-hidden z-50">
                  <a
                    href="mailto:koasmeda21@gmail.com"
                    className="flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-[#d1d5db] hover:text-[#4ade80] hover:bg-[#1f2d2a]/50 transition-colors no-underline border-b border-[#1f2d2a]/60"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#4ade80] flex-shrink-0">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    <div>
                      <div className="font-semibold text-white">By Email</div>
                      <div className="text-[11px] text-[#9ca3af] mt-0.5">koasmeda21@gmail.com</div>
                    </div>
                  </a>
                  <a
                    href="tel:0981559200"
                    className="flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-[#d1d5db] hover:text-[#4ade80] hover:bg-[#1f2d2a]/50 transition-colors no-underline"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#4ade80] flex-shrink-0">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    <div>
                      <div className="font-semibold text-white">By Phone</div>
                      <div className="text-[11px] text-[#9ca3af] mt-0.5">0981559200</div>
                    </div>
                  </a>
                </div>
              )}
            </div>
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
            <div className="space-y-1">
              <div className="px-4 py-2 text-sm font-medium text-[#9ca3af]">Contact Support</div>
              <a href="mailto:koasmeda21@gmail.com" className="flex items-center gap-3 mx-4 px-4 py-2.5 text-sm font-medium text-[#d1d5db] hover:text-[#4ade80] hover:bg-[#1f2d2a]/30 rounded-lg transition-colors no-underline">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#4ade80] flex-shrink-0">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <span>By Email — koasmeda21@gmail.com</span>
              </a>
              <a href="tel:0981559200" className="flex items-center gap-3 mx-4 px-4 py-2.5 text-sm font-medium text-[#d1d5db] hover:text-[#4ade80] hover:bg-[#1f2d2a]/30 rounded-lg transition-colors no-underline">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#4ade80] flex-shrink-0">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <span>By Phone — 0981559200</span>
              </a>
            </div>
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
