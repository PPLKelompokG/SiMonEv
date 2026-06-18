import React from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, UserCheck, Truck, Activity, PieChart } from 'lucide-react';

const steps = [
  {
    icon: <ClipboardList size={24} />,
    title: "Pendataan",
    description: "Pengumpulan data calon penerima dari berbagai sumber yang terverifikasi."
  },
  {
    icon: <UserCheck size={24} />,
    title: "Verifikasi",
    description: "Proses validasi kelayakan penerima sesuai dengan kriteria program."
  },
  {
    icon: <Truck size={24} />,
    title: "Penyaluran",
    description: "Distribusi bantuan secara langsung kepada penerima yang berhak."
  },
  {
    icon: <Activity size={24} />,
    title: "Monitoring",
    description: "Pemantauan real-time status penyaluran di lapangan."
  },
  {
    icon: <PieChart size={24} />,
    title: "Evaluasi",
    description: "Analisis efektivitas dan transparansi program bantuan."
  }
];

const Timeline = () => {
  return (
    <div className="relative max-w-5xl mx-auto py-12">
      {/* Connecting Line */}
      <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-slate-800 via-emerald-900 to-slate-800 light:from-slate-200 light:via-emerald-300 light:to-slate-200 -translate-y-1/2 z-0"></div>
      
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative z-10">
        {steps.map((step, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="flex flex-col items-center text-center group"
          >
            {/* Icon Circle */}
            <div className="w-16 h-16 rounded-full bg-slate-900 light:bg-white border-4 border-slate-950 light:border-slate-100 flex items-center justify-center text-emerald-400 light:text-emerald-600 mb-6 group-hover:scale-110 group-hover:bg-emerald-600 light:group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.1)] light:shadow-[0_4px_15px_rgba(0,0,0,0.1)] group-hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] relative z-10">
              {step.icon}
              
              {/* Connector dot for mobile */}
              <div className="md:hidden absolute -bottom-10 left-1/2 w-1 h-8 bg-emerald-900 light:bg-emerald-300 -translate-x-1/2"></div>
            </div>
            
            <h4 className="text-white light:text-slate-900 font-bold mb-2 tracking-tight">{step.title}</h4>
            <p className="text-sm text-slate-400 light:text-slate-600">{step.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Timeline;
