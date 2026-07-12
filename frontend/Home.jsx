import React from 'react';

const Home = () => {
  return (
    <div className="min-h-screen bg-[#F8F9FA] p-4 md:p-8">
      {/* Navbar Section */}
      <nav className="flex justify-between items-center max-w-7xl mx-auto mb-8 text-[#1A3C34]">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-[#1A3C34] rounded-full flex items-center justify-center">
            <span className="text-white text-xs">🛡️</span>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase leading-tight">Kole District Local Government</p>
            <h1 className="text-lg font-serif font-bold italic">Corruption Reporting System</h1>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-6 font-medium">
          <a href="#" className="bg-[#D1E2D3] px-4 py-2 rounded-full">Home</a>
          <a href="#">Report</a>
          <a href="#">Track</a>
          <a href="#">Admin</a>
          <div className="flex items-center bg-[#1A3C34] text-white rounded-full px-2 py-1 text-xs">
            <span className="px-2 opacity-100">EN</span>
            <span className="px-2 opacity-50">LB</span>
          </div>
        </div>
      </nav>

      {/* Main Hero Card */}
      <div className="max-w-7xl mx-auto bg-[#1A3C34] rounded-[40px] p-8 md:p-16 text-white shadow-2xl relative overflow-hidden">
        {/* Decorative Grid Overlay */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

        <div className="relative z-10">
          <p className="uppercase tracking-[0.2em] text-xs font-bold mb-6 opacity-80">
            Kole District — Northern Uganda
          </p>
          
          <h2 className="text-4xl md:text-6xl font-serif font-medium leading-tight mb-8">
            Report Corruption.<br />
            Protect Your Community.
          </h2>

          <p className="max-w-xl text-lg opacity-90 mb-10 leading-relaxed">
            A secure, anonymous platform for citizens of Kole District to report corruption in 
            government programs and track the progress of their reports. No registration required.
          </p>

          {/* Feature Tags */}
          <div className="flex flex-wrap gap-3 mb-16">
            <span className="bg-white/10 border border-white/20 px-4 py-2 rounded-full text-sm flex items-center gap-2">
              ✅ 100% Anonymous
            </span>
            <span className="bg-white/10 border border-white/20 px-4 py-2 rounded-full text-sm flex items-center gap-2">
              🔒 End-to-End Encrypted
            </span>
            <span className="bg-white/10 border border-white/20 px-4 py-2 rounded-full text-sm flex items-center gap-2">
              🕒 Real-Time Case Tracking
            </span>
            <span className="bg-white/10 border border-white/20 px-4 py-2 rounded-full text-sm flex items-center gap-2">
              🌐 English & Leblango
            </span>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-10 border-t border-white/10">
            <div>
              <h3 className="text-5xl font-serif mb-2">5</h3>
              <p className="text-xs uppercase tracking-widest opacity-60">Total Reports</p>
            </div>
            <div className="border-l border-white/10 pl-8">
              <h3 className="text-5xl font-serif mb-2">2</h3>
              <p className="text-xs uppercase tracking-widest opacity-60">Under Review</p>
            </div>
            <div className="border-l border-white/10 pl-8">
              <h3 className="text-5xl font-serif mb-2">1</h3>
              <p className="text-xs uppercase tracking-widest opacity-60">Resolved</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;