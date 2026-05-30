import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function HeroSection() {
  const { user } = useAuth();

  return (
    <section className="relative z-10 py-8 sm:py-12 lg:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-visible">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* Left Side: Branded Copy & CTAs */}
        <div className="lg:col-span-5 flex flex-col justify-center text-left lg:text-left text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.08] tracking-tight mb-6 sm:mb-8">
            <span className="block">More Bookings.</span>
            <span className="block mt-1">More Revenue.</span>
            <span className="relative inline-block text-[#4ade80] mt-2 sm:mt-3">
              Zero Hassle.
              <svg className="absolute left-0 -bottom-2 sm:-bottom-3 w-full h-3 sm:h-4 text-[#16a34a]" viewBox="0 0 300 12" fill="none" preserveAspectRatio="none">
                <path d="M3 9C85 3 170 3 297 9" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </span>
          </h1>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4 mt-4 sm:mt-6">
            {user ? (
              <Link
                to="/dashboard"
                className="flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-[#16a34a] hover:bg-[#15803d] active:bg-[#166534] text-white text-sm sm:text-base font-bold rounded-xl transition-all duration-200 shadow-lg shadow-[#16a34a]/30 hover:shadow-xl hover:shadow-[#16a34a]/40 group no-underline"
              >
                {/* Stadium Icon */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform sm:w-[20px] sm:h-[20px]">
                  <path d="M22 10V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v4" />
                  <path d="M2 14v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4" />
                  <path d="M12 2v20" />
                  <path d="M17 10H7" />
                  <circle cx="12" cy="12" r="4" />
                </svg>
                <span>Go to Dashboard</span>
                {/* Arrow Icon */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform sm:w-[18px] sm:h-[18px]">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            ) : (
              <Link
                to="/register"
                className="flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-[#16a34a] hover:bg-[#15803d] active:bg-[#166534] text-white text-sm sm:text-base font-bold rounded-xl transition-all duration-200 shadow-lg shadow-[#16a34a]/30 hover:shadow-xl hover:shadow-[#16a34a]/40 group no-underline"
              >
                {/* Stadium Icon */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform sm:w-[20px] sm:h-[20px]">
                  <path d="M22 10V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v4" />
                  <path d="M2 14v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4" />
                  <path d="M12 2v20" />
                  <path d="M17 10H7" />
                  <circle cx="12" cy="12" r="4" />
                </svg>
                <span>List Your Stadium</span>
                {/* Arrow Icon */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform sm:w-[18px] sm:h-[18px]">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            )}

            <a
              href="#"
              className="flex items-center justify-center gap-2 sm:gap-2.5 px-5 sm:px-7 py-3 sm:py-4 bg-transparent border border-[#1f2d2a] hover:border-[#2d3d37] hover:bg-[#111819]/40 text-[#d1d5db] hover:text-white text-sm sm:text-base font-bold rounded-xl transition-all duration-200 group no-underline"
            >
              {/* Play Video Icon */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="fill-transparent group-hover:scale-110 transition-transform text-[#4ade80] sm:w-[18px] sm:h-[18px]">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              <span className="hidden sm:inline">See How KOAS Works</span>
              <span className="sm:hidden">How It Works</span>
            </a>
          </div>
        </div>

        {/* Right Side: High-Fidelity Stadium Visual with 3D Overlapping dashboard layout - Hidden on mobile */}
        <div className="hidden lg:block lg:col-span-7 relative w-full aspect-[1.5] overflow-visible">

          {/* Ambient Green Aura / Glow behind the stadium */}
          <div className="absolute -inset-6 bg-gradient-to-tr from-[#16a34a]/25 via-transparent to-[#10b981]/15 rounded-[3rem] blur-3xl opacity-70 pointer-events-none z-0" />

          {/* Stadium Photo Container with soft rounded edges */}
          <div className="absolute inset-0 rounded-[2rem] overflow-hidden z-10 border border-[#1f2d2a]/30">
            {/* Unsplash Stadium Backdrop */}
            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-[1.03]" style={{
              backgroundImage: 'url("https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=1200&q=80")'
            }} />

            {/* Dark Overlay for Dashboard Legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

            {/* Seamless Edge Fades to integrate with the page background */}
            {/* Left Fade */}
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#050a08] via-[#050a08]/60 to-transparent z-15 pointer-events-none" />
            {/* Right Fade */}
            <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#050a08]/80 via-[#050a08]/30 to-transparent z-15 pointer-events-none" />
            {/* Top Fade */}
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#050a08] via-[#050a08]/40 to-transparent z-15 pointer-events-none" />
            {/* Bottom Fade */}
            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#050a08] via-[#050a08]/70 to-transparent z-15 pointer-events-none" />
          </div>

          {/* Floating Card 1: Total Revenue (Overlapping Top Right) */}
          <div className="absolute -top-4 -right-4 w-64 bg-[#080d0b]/95 border border-[#1f2d2a] backdrop-blur-md rounded-xl p-4 shadow-2xl z-20 transition-all duration-300 hover:-translate-y-1 hover:shadow-[#10b981]/10 hover:border-[#16a34a]/50">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-[#6b7280] tracking-widest uppercase">Total Revenue</p>
                <h3 className="text-xl font-extrabold text-white mt-1">125,430 <span className="text-xs font-semibold text-[#9ca3af]">ETB</span></h3>
                <span className="text-[10px] font-semibold text-[#10b981] flex items-center gap-1 mt-1">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="18 15 12 9 6 15" />
                  </svg>
                  28% this month
                </span>
              </div>

              {/* Sleek Mini Bar Chart */}
              <div className="flex items-end gap-1 h-12 pt-2">
                <div className="w-1.5 h-4 bg-[#10b981]/30 rounded-t-sm" />
                <div className="w-1.5 h-6 bg-[#10b981]/40 rounded-t-sm" />
                <div className="w-1.5 h-8 bg-[#10b981]/50 rounded-t-sm" />
                <div className="w-1.5 h-7 bg-[#10b981]/60 rounded-t-sm" />
                <div className="w-1.5 h-9 bg-[#10b981]/70 rounded-t-sm" />
                <div className="w-1.5 h-11 bg-[#10b981]/90 rounded-t-sm" />
                <div className="w-1.5 h-14 bg-[#10b981] rounded-t-sm" />
              </div>
            </div>
          </div>

          {/* Floating Card 2: Today's Bookings (3D Overlapping Middle Left Edge) */}
          <div className="absolute top-[35%] -left-10 w-60 bg-white rounded-xl p-4 shadow-2xl z-30 flex items-center justify-between transition-all duration-300 hover:scale-[1.03] hover:shadow-black/50">
            <div>
              <p className="text-[10px] font-bold text-[#4b5563] tracking-widest uppercase">Today's Bookings</p>
              <h3 className="text-2xl font-extrabold text-[#030712] mt-0.5">12</h3>
              <span className="text-[10px] font-semibold text-[#16a34a] flex items-center gap-1 mt-0.5">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="18 15 12 9 6 15" />
                </svg>
                3 from yesterday
              </span>
            </div>
            {/* Calendar Icon Circle wrapper */}
            <div className="w-10 h-10 bg-[#16a34a]/10 rounded-full flex items-center justify-center text-[#16a34a]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
          </div>

          {/* Floating Card 3: Booking Rate (Overlapping Bottom Right Edge) */}
          <div className="absolute bottom-20 -right-6 w-52 bg-[#080d0b]/95 border border-[#1f2d2a] backdrop-blur-md rounded-xl p-4 shadow-2xl z-20 flex items-center justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-[#10b981]/10 hover:border-[#16a34a]/50">
            <div>
              <p className="text-[10px] font-bold text-[#6b7280] tracking-widest uppercase">Booking Rate</p>
              <h3 className="text-xl font-extrabold text-white mt-1">87%</h3>
              <span className="text-[10px] font-semibold text-[#10b981] flex items-center gap-1 mt-1">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="18 15 12 9 6 15" />
                </svg>
                15% this month
              </span>
            </div>

            {/* Circular Progress Ring */}
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="24" cy="24" r="18" stroke="#1f2d2a" strokeWidth="3" fill="transparent" />
                <circle cx="24" cy="24" r="18" stroke="#10b981" strokeWidth="3" fill="transparent" strokeDasharray="113" strokeDashoffset="15" strokeLinecap="round" />
              </svg>
              <span className="absolute text-[10px] font-extrabold text-white">87%</span>
            </div>
          </div>

          {/* Floating Card 4: Trust Banner (Overlapping Bottom Edge) */}
          <div className="absolute -bottom-4 left-6 right-6 bg-[#16a34a]/10 border border-[#16a34a]/25 backdrop-blur-md rounded-xl p-4 flex items-center gap-3.5 z-30 shadow-2xl">
            {/* Shield Check Icon */}
            <div className="w-10 h-10 bg-[#16a34a]/20 border border-[#16a34a]/30 rounded-xl flex items-center justify-center text-[#4ade80] flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 11 11 13 15 9" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Secure. Reliable. Built for Football.</h4>
              <p className="text-xs text-[#9ca3af] mt-0.5">Verified payments • Real-time receipts • Powerful analytics</p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
