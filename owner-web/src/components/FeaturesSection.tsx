export default function FeaturesSection() {
  const features = [
    {
      title: "Smart Slot Scheduler",
      description: "Create and manage slots automatically.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      )
    },
    {
      title: "Secure Receipt Verification",
      description: "Verify payments and stop fraud instantly.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      )
    },
    {
      title: "Revenue Analytics",
      description: "Track earnings, occupancy and performance live.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      )
    },
    {
      title: "Multi-Branch Management",
      description: "Manage multiple stadiums from one dashboard.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      )
    },
    {
      title: "Reviews & Feedback",
      description: "Build trust with reviews and player feedback.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      )
    },
    {
      title: "Owner-Gated Approvals",
      description: "Ensure safe listings with owner verification.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      )
    }
  ];

  return (
    <section id="features" className="relative z-10 py-12 sm:py-20 border-t border-[#1f2d2a]/30">
      
      {/* Dynamic Centered Heading */}
      <div className="text-center mb-10 sm:mb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
          Everything you need to run your stadium <span className="text-[#4ade80] font-black">smarter</span>
        </h2>
      </div>

      {/* Mobile: Horizontal Scroll, Desktop: Grid */}
      <div className="lg:max-w-7xl lg:mx-auto lg:px-4 sm:lg:px-6 lg:px-8">
        {/* Mobile Horizontal Scroll */}
        <div className="flex lg:hidden overflow-x-auto gap-4 px-4 pb-4 snap-x snap-mandatory scrollbar-hide">
          {features.map((feature, idx) => (
            <div 
              key={idx} 
              className="flex-shrink-0 w-[280px] bg-[#080d0c]/60 border border-[#1f2d2a]/80 p-5 rounded-2xl shadow-xl snap-start"
            >
              {/* Outlined Icon Wrapper */}
              <div className="w-10 h-10 rounded-xl bg-[#16a34a]/10 border border-[#16a34a]/20 flex items-center justify-center text-[#4ade80]">
                {feature.icon}
              </div>

              {/* Title */}
              <h3 className="text-sm font-bold text-white mt-4 leading-snug">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-xs text-[#9ca3af] mt-2 leading-relaxed font-medium">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Desktop Grid */}
        <div className="hidden lg:grid grid-cols-3 xl:grid-cols-6 gap-6">
          {features.map((feature, idx) => (
            <div 
              key={idx} 
              className="bg-[#080d0c]/60 border border-[#1f2d2a]/80 p-6 rounded-2xl shadow-xl hover:border-[#16a34a]/40 hover:shadow-[#16a34a]/5 hover:bg-[#0b1210]/80 transition-all duration-300 group flex flex-col justify-start text-left"
            >
              {/* Outlined Icon Wrapper */}
              <div className="w-12 h-12 rounded-xl bg-[#16a34a]/10 border border-[#16a34a]/20 flex items-center justify-center text-[#4ade80] group-hover:scale-105 group-hover:bg-[#16a34a]/15 transition-all">
                {feature.icon}
              </div>

              {/* Title */}
              <h3 className="text-base font-bold text-white mt-5 leading-snug">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-xs text-[#9ca3af] mt-2 leading-relaxed font-medium">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
      
    </section>
  );
}
