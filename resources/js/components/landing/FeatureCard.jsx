import React from 'react';
import { motion } from 'framer-motion';

const FeatureCard = ({ icon, title, description, delay = 0 }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="bg-slate-900/40 light:bg-white/80 backdrop-blur-sm border border-white/5 light:border-black/5 p-8 rounded-3xl hover:bg-slate-800/60 light:hover:bg-white hover:border-emerald-500/20 light:hover:border-emerald-500/30 transition-all duration-300 group shadow-none light:shadow-xl"
    >
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 light:from-emerald-50 light:to-emerald-100 border border-white/5 light:border-emerald-200 flex items-center justify-center text-emerald-400 light:text-emerald-600 mb-6 group-hover:scale-110 group-hover:text-emerald-300 light:group-hover:text-emerald-700 transition-all duration-300 shadow-lg">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white light:text-slate-900 mb-3 tracking-tight">{title}</h3>
      <p className="text-slate-400 light:text-slate-600 leading-relaxed text-sm">
        {description}
      </p>
    </motion.div>
  );
};

export default FeatureCard;
