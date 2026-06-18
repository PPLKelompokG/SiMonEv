import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ icon, value, label, prefix = '', suffix = '', delay = 0 }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="bg-slate-900/50 light:bg-white/90 backdrop-blur-xl border border-white/10 light:border-black/10 p-6 rounded-2xl relative overflow-hidden group hover:border-emerald-500/30 light:hover:border-emerald-500/50 transition-colors shadow-none light:shadow-xl"
    >
      {/* Background Glow */}
      <div className="absolute -right-10 -top-10 w-32 h-32 bg-emerald-500/10 light:bg-emerald-500/20 rounded-full blur-3xl group-hover:bg-emerald-500/20 light:group-hover:bg-emerald-500/30 transition-all duration-500"></div>
      
      <div className="flex items-center gap-4 relative z-10">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 light:from-emerald-500/20 light:to-teal-500/20 border border-emerald-500/20 light:border-emerald-500/30 flex items-center justify-center text-emerald-400 light:text-emerald-600 group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <div>
          <div className="text-3xl font-bold text-white light:text-slate-900 tracking-tight flex items-baseline gap-1">
            <span className="text-emerald-400 light:text-emerald-600 text-lg">{prefix}</span>
            {value}
            <span className="text-emerald-400 light:text-emerald-600 text-lg">{suffix}</span>
          </div>
          <div className="text-sm text-slate-400 light:text-slate-500 mt-1 font-medium">{label}</div>
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;
