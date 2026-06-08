import React from 'react';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-black/80 light:bg-white border-t border-emerald-900/50 light:border-emerald-100 pt-16 pb-8 px-6 md:px-12 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-emerald-900/20 light:bg-emerald-100/50 blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">

          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img
                src="/logo.png"
                alt="SiMonEv Logo"
                className="w-8 h-8 object-contain"
                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
              />
              <div className="hidden w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 items-center justify-center text-white font-bold shadow-lg">
                S
              </div>
              <span className="font-bold text-xl text-white light:text-slate-900 tracking-tight">SIMONEV</span>
            </div>
            <p className="text-slate-400 light:text-slate-600 text-sm leading-relaxed mb-6">
              Sistem Monitoring dan Evaluasi Penyaluran Bantuan. Platform digital terpadu untuk memastikan bantuan disalurkan secara tepat sasaran, transparan, dan akuntabel.
            </p>
          </div>

          <div>
            <h4 className="text-white light:text-slate-900 font-semibold mb-4 tracking-tight">Tautan Cepat</h4>
            <ul className="space-y-3">
              <li><a href="#tentang" className="text-slate-400 light:text-slate-600 hover:text-emerald-400 light:hover:text-emerald-600 transition-colors text-sm">Tentang Kami</a></li>
              <li><a href="#peta" className="text-slate-400 light:text-slate-600 hover:text-emerald-400 light:hover:text-emerald-600 transition-colors text-sm">Peta Sebaran</a></li>
              <li><a href="#alur" className="text-slate-400 light:text-slate-600 hover:text-emerald-400 light:hover:text-emerald-600 transition-colors text-sm">Alur Penyaluran</a></li>
            </ul>
          </div>



        </div>

        <div className="border-t border-white/10 light:border-black/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 light:text-slate-500 text-sm text-center md:text-left">
            &copy; {year} SIMONEV - Telkom University. Hak Cipta Dilindungi.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
