import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Activity, BarChart3, Database, Globe, Map as MapIcon, ArrowRight, CheckCircle2, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

// Components
import Navbar from '../components/landing/Navbar';
import StatCard from '../components/landing/StatCard';
import FeatureCard from '../components/landing/FeatureCard';
import Timeline from '../components/landing/Timeline';
import SectionMap from '../components/landing/SectionMap';
import Footer from '../components/landing/Footer';

const LandingPage = () => {
  const [stats, setStats] = useState({
    total_bantuan: 0,
    jumlah_penerima: 0,
    program_aktif: 0,
    wilayah_terjangkau: 0,
    status_penyaluran: 0,
    sebaran_wilayah: []
  });

  // Ensure window starts at top on load & fetch stats
  useEffect(() => {
    window.scrollTo(0, 0);
    
    axios.get('/api/public/landing-stats')
      .then(response => {
        if (response.data.status === 'success') {
          setStats(response.data.data);
        }
      })
      .catch(error => console.error("Error fetching landing stats:", error));
  }, []);

  const formatCurrencyCompact = (value) => {
    if (!value) return "0";
    if (value >= 1000000000) return (value / 1000000000).toFixed(1) + 'M';
    if (value >= 1000000) return (value / 1000000).toFixed(1) + ' Jt';
    return Number(value).toLocaleString('id-ID');
  };

  return (
    <div className="login-bg-animate min-h-screen text-slate-200 light:text-slate-800 font-sans selection:bg-emerald-500/30 overflow-x-hidden transition-colors duration-500">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center pt-20 pb-16 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-emerald-600/10 blur-[120px]"></div>
          <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] rounded-full bg-teal-600/10 blur-[120px]"></div>
          
          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 light:bg-emerald-500/20 border border-emerald-500/20 light:border-emerald-500/40 text-emerald-400 light:text-emerald-700 text-sm font-medium mb-6">
                <ShieldCheck size={16} />
                <span>Transparan & Akuntabel</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white light:text-slate-900 leading-[1.1] mb-6">
                Sistem Monitoring <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500 light:from-emerald-600 light:to-teal-600">
                  Evaluasi Bantuan
                </span>
              </h1>
              
              <p className="text-lg text-slate-400 light:text-slate-600 mb-10 leading-relaxed max-w-xl">
                Platform digital inovatif untuk memantau, mengevaluasi, dan memastikan penyaluran bantuan pemerintah berjalan tepat sasaran secara real-time.
              </p>
              
              <div className="flex flex-wrap items-center gap-4">
                <Link 
                  to="/login"
                  className="px-8 py-3.5 rounded-full bg-slate-900 light:bg-emerald-600 hover:bg-slate-800 light:hover:bg-emerald-700 border border-emerald-500/30 light:border-emerald-500 text-white font-semibold transition-all shadow-[0_4px_15px_rgba(0,0,0,0.2)] flex items-center gap-2"
                >
                  Masuk Portal <ArrowRight size={18} />
                </Link>
                <a 
                  href="#peta"
                  className="px-8 py-3.5 rounded-full bg-white/5 light:bg-slate-900/5 hover:bg-white/10 light:hover:bg-slate-900/10 text-white light:text-slate-800 font-semibold border border-white/10 light:border-black/10 transition-all backdrop-blur-sm"
                >
                  Lihat Sebaran
                </a>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              {/* Abstract Dashboard Illustration */}
              <div className="relative w-full aspect-square max-w-lg mx-auto">
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-600/10 to-teal-600/10 rounded-full blur-[80px]"></div>
                
                {/* Floating UI Elements */}
                <motion.div 
                  animate={{ y: [0, -15, 0] }} 
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-10 right-10 bg-slate-900/80 light:bg-white/90 backdrop-blur-xl border border-white/10 light:border-black/10 p-4 rounded-2xl shadow-2xl w-48"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 light:bg-emerald-500/20 flex items-center justify-center text-emerald-400 light:text-emerald-600"><CheckCircle2 size={16} /></div>
                    <div>
                      <div className="text-xs text-slate-400 light:text-slate-500">Status Penyaluran</div>
                      <div className="text-sm font-bold text-white light:text-slate-900">{stats.status_penyaluran}% Selesai</div>
                    </div>
                  </div>
                  <div className="h-2 bg-slate-800 light:bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${stats.status_penyaluran}%` }}></div>
                  </div>
                </motion.div>

                <motion.div 
                  animate={{ y: [0, 20, 0] }} 
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute bottom-20 left-0 bg-slate-900/80 light:bg-white/90 backdrop-blur-xl border border-white/10 light:border-black/10 p-5 rounded-2xl shadow-2xl w-56"
                >
                  <div className="text-xs text-slate-400 light:text-slate-500 mb-2">Penerima Aktif</div>
                  <div className="text-3xl font-bold text-white light:text-slate-900 mb-4">{stats.jumlah_penerima.toLocaleString('id-ID')}</div>
                  <div className="flex items-end gap-1 h-12">
                    {[40, 60, 45, 80, 55, 90, 75].map((h, i) => (
                      <div key={i} className="w-full bg-emerald-500 rounded-sm" style={{ height: `${h}%` }}></div>
                    ))}
                  </div>
                </motion.div>
                
                {/* Central Circle */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border border-white/10 border-dashed animate-[spin_20s_linear_infinite] flex items-center justify-center">
                   <div className="w-48 h-48 rounded-full border border-emerald-500/30 animate-[spin_15s_linear_infinite_reverse]"></div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="py-12 border-y border-white/5 light:border-black/5 bg-slate-900/20 light:bg-slate-100/50 relative z-10">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard icon={<Database size={24} />} value={formatCurrencyCompact(stats.total_bantuan)} label="Total Bantuan Tersalurkan" prefix="Rp " delay={0.1} />
            <StatCard icon={<Users size={24} />} value={stats.jumlah_penerima.toLocaleString('id-ID')} label="Jumlah Penerima" delay={0.2} />
            <StatCard icon={<ShieldCheck size={24} />} value={stats.program_aktif} label="Program Bantuan Aktif" delay={0.3} />
            <StatCard icon={<MapIcon size={24} />} value={stats.wilayah_terjangkau} label="Wilayah Terjangkau" delay={0.4} />
          </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section id="tentang" className="py-24 relative light:bg-slate-50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold text-white light:text-slate-900 mb-6 tracking-tight"
          >
            Apa itu SIMONEV?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-slate-400 light:text-slate-600 leading-relaxed"
          >
            SIMONEV adalah sistem terpadu yang dirancang khusus untuk memantau, mengelola, dan mengevaluasi seluruh proses penyaluran bantuan sosial. Dengan teknologi berbasis data, kami memastikan setiap bantuan disalurkan secara <span className="text-white light:text-slate-900 font-semibold">tepat sasaran</span> dan <span className="text-white light:text-slate-900 font-semibold">dapat dipertanggungjawabkan</span>.
          </motion.p>
        </div>
      </section>


      {/* MAP SECTION */}
      <section id="peta" className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          <SectionMap 
            mapData={stats.sebaran_wilayah} 
            totalTitik={stats.sebaran_wilayah.reduce((sum, item) => sum + item.total_penerima, 0)} 
            wilayahTerjangkau={stats.wilayah_terjangkau} 
          />
        </div>
      </section>

      {/* FLOW SECTION */}
      <section id="alur" className="py-24 bg-gradient-to-b from-transparent to-slate-900/50 light:to-slate-100/50">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white light:text-slate-900 mb-4 tracking-tight">Alur Penyaluran Terintegrasi</h2>
            <p className="text-slate-400 light:text-slate-600 max-w-2xl mx-auto">Standardisasi proses untuk memastikan efisiensi dan keadilan distribusi.</p>
          </div>
          
          <Timeline />
        </div>
      </section>

      {/* TRANSPARENCY SECTION (CTA) */}
      <section className="py-24 relative overflow-hidden light:bg-slate-50">
        <div className="absolute inset-0 bg-emerald-600/5 light:bg-emerald-600/10"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-[500px] bg-emerald-600/10 blur-[150px] rounded-full pointer-events-none"></div>
        
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center bg-slate-900/60 light:bg-white/80 backdrop-blur-xl border border-white/10 light:border-black/10 p-12 rounded-3xl">
          <h2 className="text-3xl md:text-4xl font-bold text-white light:text-slate-900 mb-6 tracking-tight">Komitmen Transparansi</h2>
          <p className="text-lg text-slate-300 light:text-slate-600 mb-10 leading-relaxed max-w-2xl mx-auto">
            Kami percaya bahwa data yang terbuka dan akuntabel adalah kunci dari pelayanan publik yang baik. SIMONEV menghadirkan kepastian bahwa hak masyarakat terpenuhi.
          </p>
          <div className="flex justify-center gap-8 mb-10 flex-wrap">
            <div className="flex items-center gap-2"><CheckCircle2 className="text-emerald-400 light:text-emerald-600" size={20}/> <span className="text-slate-200 light:text-slate-800 font-medium">Data Terintegrasi</span></div>
            <div className="flex items-center gap-2"><CheckCircle2 className="text-emerald-400 light:text-emerald-600" size={20}/> <span className="text-slate-200 light:text-slate-800 font-medium">Laporan Akurat</span></div>
            <div className="flex items-center gap-2"><CheckCircle2 className="text-emerald-400 light:text-emerald-600" size={20}/> <span className="text-slate-200 light:text-slate-800 font-medium">Keputusan Berbasis Data</span></div>
          </div>
          <Link 
            to="/login"
            className="inline-flex px-8 py-4 rounded-full bg-white light:bg-emerald-600 text-black light:text-white font-bold hover:bg-slate-200 light:hover:bg-emerald-700 transition-colors shadow-xl"
          >
            Akses Dashboard Sekarang
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
