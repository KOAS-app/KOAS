import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoOfficial from '../assets/logo/koas_official_logo.png';
import PublicNavbar from '../components/PublicNavbar';

export default function PublicLayout() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050a08] via-[#0a1110] to-[#070c0a] text-white font-sans flex flex-col justify-between relative overflow-x-hidden">

      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none opacity-[0.03] blur-[120px] bg-gradient-to-l from-[#16a34a] to-transparent z-0" />
      <div className="absolute top-1/2 left-[-100px] w-[600px] h-[600px] rounded-full pointer-events-none opacity-[0.02] blur-[150px] bg-gradient-to-r from-[#16a34a] to-transparent z-0" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none z-0" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, #16a34a 1px, transparent 1px)',
        backgroundSize: '36px 36px'
      }} />

      {/* Global Standalone Fixed Navbar */}
      <PublicNavbar />

      {/* Main Slot with fixed navbar offset */}
      <main className="flex-grow flex flex-col justify-center relative z-10 pt-20">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-[#040807] border-t border-[#1f2d2a]/80 py-12 text-sm text-[#6b7280]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src={logoOfficial} alt="KOAS Logo" className="w-20 h-20 object-contain" />
            <div className="text-left">
              <span className="block text-white font-extrabold tracking-wide">KOAS Stadium Portal</span>
              <span className="block text-xs text-[#4b5563]">© 2026 KOAS Inc. All rights reserved.</span>
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
            <a href="#" className="hover:text-white transition-colors no-underline">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors no-underline">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors no-underline">Cookie Settings</a>
            <a href="#" className="hover:text-white transition-colors no-underline">Turf Owner Guidelines</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
