import React, { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { motion } from 'framer-motion';
import { MapPin, Users, TrendingUp } from 'lucide-react';

const regionCoordinates = {
  "Ngamprah": [-6.840, 107.513],
  "Padalarang": [-6.841, 107.473],
  "Lembang": [-6.814, 107.618],
  "Cisarua": [-6.797, 107.545],
  "Cililin": [-6.953, 107.464],
  "Batujajar": [-6.891, 107.491],
  "Cihampelas": [-6.929, 107.494],
  "Cipatat": [-6.833, 107.391],
  "Cipeundeuy": [-6.758, 107.362],
  "Cikalong Wetan": [-6.732, 107.441],
  "Bandung": [-6.917, 107.619], // Default fallback
};

const SectionMap = ({ mapData = [], totalTitik = 0, wilayahTerjangkau = 0 }) => {
  const [activeMarker, setActiveMarker] = useState(null);

  // Process data for the map
  const processedData = mapData.map((item) => {
    // Attempt to match exact or partial name
    let coords = regionCoordinates["Bandung"]; // Default
    let matchedName = "Bandung";
    
    for (const [key, val] of Object.entries(regionCoordinates)) {
      if (item.wilayah && item.wilayah.toLowerCase().includes(key.toLowerCase())) {
        coords = val;
        matchedName = key;
        break;
      }
    }
    
    // Determine intensity and color based on total
    let intensitas = "Rendah";
    let color = "#10b981"; // Emerald/Low
    
    if (item.total_penerima > 1000) {
      intensitas = "Sangat Tinggi";
      color = "#ef4444"; // Red
    } else if (item.total_penerima > 500) {
      intensitas = "Tinggi";
      color = "#f59e0b"; // Orange
    } else if (item.total_penerima > 100) {
      intensitas = "Sedang";
      color = "#3b82f6"; // Blue
    }

    // Small random offset so markers with the same exact matched fallback coordinate don't perfectly overlap
    const offsetCoords = [
      coords[0] + (Math.random() - 0.5) * 0.02,
      coords[1] + (Math.random() - 0.5) * 0.02
    ];

    return {
      ...item,
      coords: offsetCoords,
      matchedName,
      intensitas,
      color
    };
  });

  return (
    <div className="bg-slate-900/50 light:bg-white/80 backdrop-blur-xl border border-white/10 light:border-black/10 rounded-3xl p-6 md:p-8 overflow-hidden relative shadow-none light:shadow-xl">
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/10 rounded-full blur-[80px] pointer-events-none"></div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Map Information Sidebar */}
        <div className="lg:col-span-1 flex flex-col justify-center">
          <div className="inline-flex items-center justify-center p-3 bg-emerald-500/20 light:bg-emerald-500/10 text-emerald-400 light:text-emerald-700 rounded-xl mb-6 w-max border border-emerald-500/30 light:border-emerald-500/20">
            <MapPin size={24} />
          </div>
          <h3 className="text-2xl font-bold text-white light:text-slate-900 mb-4 tracking-tight">Peta Sebaran Bantuan</h3>
          <p className="text-slate-400 light:text-slate-600 mb-8 leading-relaxed text-sm">
            Pantau distribusi bantuan secara langsung. Peta interaktif kami memberikan visualisasi detail mengenai area jangkauan, jumlah penerima, dan tingkat intensitas penyaluran di setiap wilayah.
          </p>

          <div className="space-y-4">
            <div className="bg-slate-800/50 light:bg-slate-50 p-4 rounded-2xl border border-white/5 light:border-black/5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 light:bg-emerald-500/10 text-emerald-400 light:text-emerald-600 flex items-center justify-center">
                <Users size={20} />
              </div>
              <div>
                <div className="text-2xl font-bold text-white light:text-slate-900">{totalTitik.toLocaleString('id-ID')}</div>
                <div className="text-xs text-slate-400 light:text-slate-500 font-medium uppercase tracking-wider">Total Penerima di Peta</div>
              </div>
            </div>

            <div className="bg-slate-800/50 light:bg-slate-50 p-4 rounded-2xl border border-white/5 light:border-black/5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-teal-500/20 light:bg-teal-500/10 text-teal-400 light:text-teal-600 flex items-center justify-center">
                <TrendingUp size={20} />
              </div>
              <div>
                <div className="text-2xl font-bold text-white light:text-slate-900">{wilayahTerjangkau.toLocaleString('id-ID')}</div>
                <div className="text-xs text-slate-400 light:text-slate-500 font-medium uppercase tracking-wider">Wilayah Terjangkau</div>
              </div>
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="lg:col-span-2 relative h-[400px] lg:h-[500px] rounded-2xl overflow-hidden border border-white/10 light:border-black/10 shadow-2xl">
          <MapContainer 
            center={[-6.840, 107.513]} 
            zoom={11} 
            scrollWheelZoom={false}
            style={{ height: '100%', width: '100%', backgroundColor: '#0f172a' }}
            attributionControl={false}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            
            {processedData.map((data, index) => {
              const radius = Math.max(12, Math.min(30, (data.total_penerima / 2500) * 40));
              
              return (
                <CircleMarker 
                  key={index} 
                  center={data.coords} 
                  radius={radius} 
                  pathOptions={{ 
                    fillColor: data.color, 
                    fillOpacity: 0.7, 
                    color: data.color, 
                    weight: 2, 
                    opacity: 0.9 
                  }}
                  eventHandlers={{
                    click: () => setActiveMarker(data)
                  }}
                >
                  <Popup className="simonev-custom-popup">
                    <div className="p-1 min-w-[150px]">
                      <div className="font-bold text-slate-900 text-sm mb-1">{data.wilayah}</div>
                      <div className="flex justify-between items-center text-xs mb-1">
                        <span className="text-slate-500">Penerima</span>
                        <span className="font-bold text-slate-900">{data.total_penerima.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">Status</span>
                        <span className="font-semibold" style={{ color: data.color }}>{data.intensitas}</span>
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default SectionMap;
