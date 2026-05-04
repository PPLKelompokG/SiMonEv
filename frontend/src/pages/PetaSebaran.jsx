import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Users, AlertTriangle, TrendingUp, Search } from 'lucide-react';
import api from '../api';

/* ── Koordinat kelurahan/kecamatan Bandung (sample) ── */
const WILAYAH_COORDS = {
  'Coblong': [-6.885, 107.617], 'Bandung Wetan': [-6.907, 107.615],
  'Cibeunying Kaler': [-6.889, 107.627], 'Cibeunying Kidul': [-6.903, 107.635],
  'Sumur Bandung': [-6.916, 107.610], 'Andir': [-6.912, 107.585],
  'Cicendo': [-6.905, 107.591], 'Sukajadi': [-6.882, 107.596],
  'Sukasari': [-6.868, 107.592], 'Cidadap': [-6.870, 107.607],
  'Bandung Kulon': [-6.925, 107.577], 'Babakan Ciparay': [-6.935, 107.578],
  'Bojongloa Kaler': [-6.932, 107.592], 'Bojongloa Kidul': [-6.942, 107.588],
  'Astana Anyar': [-6.927, 107.601], 'Regol': [-6.930, 107.612],
  'Lengkong': [-6.924, 107.624], 'Batununggal': [-6.934, 107.632],
  'Kiaracondong': [-6.923, 107.643], 'Antapani': [-6.910, 107.653],
  'Arcamanik': [-6.917, 107.668], 'Mandalajati': [-6.890, 107.660],
  'Ujung Berung': [-6.903, 107.707], 'Cibiru': [-6.915, 107.724],
  'Panyileukan': [-6.930, 107.713], 'Gedebage': [-6.945, 107.693],
  'Rancasari': [-6.955, 107.668], 'Cinambo': [-6.928, 107.688],
  'Bandung Kidul': [-6.953, 107.635], 'Buah Batu': [-6.946, 107.646],
  // Fallback for unknown areas - spread around center Bandung
  '_default': [-6.917, 107.619],
};

function getCoords(wilayah) {
  if (!wilayah) return WILAYAH_COORDS['_default'];
  const key = Object.keys(WILAYAH_COORDS).find(k =>
    wilayah.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(wilayah.toLowerCase())
  );
  if (key) return WILAYAH_COORDS[key];
  // Generate deterministic offset from name hash
  let hash = 0;
  for (let i = 0; i < wilayah.length; i++) hash = ((hash << 5) - hash) + wilayah.charCodeAt(i);
  const latOff = ((hash % 100) / 1000) - 0.05;
  const lngOff = (((hash >> 8) % 100) / 1000) - 0.05;
  return [-6.917 + latOff, 107.619 + lngOff];
}

function getIntensityColor(total, max) {
  const ratio = Math.min(total / Math.max(max, 1), 1);
  if (ratio > 0.7) return '#ef4444';
  if (ratio > 0.4) return '#f59e0b';
  if (ratio > 0.2) return '#2563eb';
  return '#10b981';
}

const StatCard = ({ icon, label, value, color }) => (
  <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem' }}>
    <div style={{ width: 42, height: 42, borderRadius: 12, background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>{icon}</div>
    <div>
      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--pk-text)', lineHeight: 1.1 }}>{value ?? '-'}</div>
      <div style={{ fontSize: '0.78rem', color: 'var(--pk-text-muted)', marginTop: 2 }}>{label}</div>
    </div>
  </div>
);

/* Fit bounds to markers */
const FitBounds = ({ points }) => {
  const map = useMap();
  useEffect(() => {
    if (points.length > 0) {
      const bounds = points.map(p => p.coords);
      map.fitBounds(bounds, { padding: [30, 30], maxZoom: 14 });
    }
  }, [points, map]);
  return null;
};

const PetaSebaran = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get('/peta-sebaran');
        setData(res.data.data);
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const wilayahList = data?.per_wilayah || [];
  const maxPenerima = Math.max(...wilayahList.map(w => w.total_penerima), 1);

  const points = wilayahList
    .filter(w => !search || w.wilayah?.toLowerCase().includes(search.toLowerCase()))
    .map(w => ({ ...w, coords: getCoords(w.wilayah) }));

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ background: 'var(--pk-primary)', borderRadius: 10, padding: '6px 8px', display: 'inline-flex' }}>
              <MapPin size={20} color='var(--pk-text)' />
            </span>
            Peta Sebaran Penerima Bantuan
          </h2>
          <p style={{ margin: '0.35rem 0 0', color: 'var(--pk-text-muted)', fontSize: '0.875rem' }}>
            Visualisasi sebaran & intensitas kemiskinan per wilayah
          </p>
        </div>
      </div>

      {/* Stats */}
      {!loading && data && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <StatCard icon={<Users size={20} />} label="Total Penerima" value={data.total} color="#2563eb" />
          <StatCard icon={<MapPin size={20} />} label="Jumlah Wilayah" value={data.total_wilayah} color="#10b981" />
          <StatCard icon={<AlertTriangle size={20} />} label="Sangat Miskin" value={data.per_kondisi?.sangat_miskin || 0} color="#ef4444" />
          <StatCard icon={<TrendingUp size={20} />} label="Data Terpetakan" value={data.coverage} color="#0ea5e9" />
        </div>
      )}

      {loading ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem', color: 'var(--pk-text-muted)' }}>
          <MapPin size={36} style={{ opacity: 0.4, marginBottom: 8 }} /><p>Memuat peta...</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem' }}>
          {/* Map */}
          <div className="glass-panel" style={{ padding: 0, overflow: 'hidden', minHeight: 500 }}>
            <MapContainer center={[-6.917, 107.619]} zoom={13} style={{ height: '100%', minHeight: 500, borderRadius: 'var(--pk-radius)' }} attributionControl={false}>
              <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
              <FitBounds points={points} />
              {points.map((w, i) => {
                const radius = Math.max(12, Math.min(40, (w.total_penerima / maxPenerima) * 40));
                const color = getIntensityColor(w.total_penerima, maxPenerima);
                return (
                  <CircleMarker key={i} center={w.coords} radius={radius} pathOptions={{ fillColor: color, fillOpacity: 0.6, color: color, weight: 2, opacity: 0.8 }}
                    eventHandlers={{ click: () => setSelected(w) }}>
                    <Popup>
                      <div style={{ minWidth: 180, color: '#1e293b', fontFamily: 'Inter, sans-serif' }}>
                        <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 6 }}>{w.wilayah}</div>
                        <div style={{ fontSize: '0.8rem', lineHeight: 1.6 }}>
                          <div>Total Penerima: <b>{w.total_penerima}</b></div>
                          <div>Disetujui: <b style={{ color: '#16a34a' }}>{w.disetujui}</b></div>
                          <div>Sangat Miskin: <b style={{ color: '#ef4444' }}>{w.sangat_miskin}</b></div>
                          <div>Miskin: <b style={{ color: '#f59e0b' }}>{w.miskin}</b></div>
                          <div>Rentan Miskin: <b style={{ color: '#0ea5e9' }}>{w.rentan_miskin}</b></div>
                          <div>Rata-rata Tanggungan: <b>{Number(w.rata_tanggungan || 0).toFixed(1)}</b></div>
                        </div>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          </div>

          {/* Sidebar Detail */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--pk-text-muted)' }} />
              <input className="form-control" style={{ paddingLeft: 36 }} placeholder="Cari wilayah..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            {/* Legend */}
            <div className="glass-panel" style={{ padding: '1rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem' }}>Intensitas Kemiskinan</div>
              {[
                { color: '#ef4444', label: 'Sangat Tinggi (>70%)' },
                { color: '#f59e0b', label: 'Tinggi (40-70%)' },
                { color: '#2563eb', label: 'Sedang (20-40%)' },
                { color: '#10b981', label: 'Rendah (<20%)' },
              ].map((l, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', marginTop: 4 }}>
                  <div style={{ width: 14, height: 14, borderRadius: '50%', background: l.color, opacity: 0.7, flexShrink: 0 }} />
                  <span style={{ color: 'var(--pk-text-muted)' }}>{l.label}</span>
                </div>
              ))}
            </div>

            {/* Ranking List */}
            <div className="glass-panel" style={{ padding: '1rem', flex: 1, overflowY: 'auto', maxHeight: 350 }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.75rem' }}>Ranking Wilayah</div>
              {points.length === 0 && <p style={{ fontSize: '0.8rem', color: 'var(--pk-text-muted)' }}>Tidak ada data.</p>}
              {points.map((w, i) => {
                const color = getIntensityColor(w.total_penerima, maxPenerima);
                const isSelected = selected?.wilayah === w.wilayah;
                return (
                  <div key={i} onClick={() => setSelected(w)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.75rem', borderRadius: 10, marginBottom: 4, cursor: 'pointer', background: isSelected ? 'var(--pk-highlight)' : 'transparent', border: isSelected ? '1px solid var(--pk-glass-border)' : '1px solid transparent', transition: 'all 0.2s' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${color}22`, color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.7rem', flexShrink: 0 }}>
                      {i + 1}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.82rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{w.wilayah}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--pk-text-muted)' }}>{w.total_penerima} penerima</div>
                    </div>
                    <div style={{ width: 50, height: 6, background: 'var(--pk-glass-border)', borderRadius: 3, overflow: 'hidden', flexShrink: 0 }}>
                      <div style={{ height: '100%', width: `${(w.total_penerima / maxPenerima) * 100}%`, background: color, borderRadius: 3 }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Detail */}
            {selected && (
              <div className="glass-panel" style={{ padding: '1rem' }}>
                <div style={{ fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MapPin size={16} color="var(--pk-primary)" /> {selected.wilayah}
                </div>
                {[
                  ['Total Penerima', selected.total_penerima, 'var(--pk-text)'],
                  ['Disetujui', selected.disetujui, '#16a34a'],
                  ['Diajukan', selected.diajukan, '#f59e0b'],
                  ['Ditolak', selected.ditolak, '#ef4444'],
                  ['Sangat Miskin', selected.sangat_miskin, '#ef4444'],
                  ['Miskin', selected.miskin, '#f59e0b'],
                  ['Rentan Miskin', selected.rentan_miskin, '#0ea5e9'],
                  ['Rata-rata Tanggungan', Number(selected.rata_tanggungan || 0).toFixed(1), 'var(--pk-text)'],
                ].map(([label, val, col], i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '0.3rem 0', borderBottom: '1px solid var(--pk-highlight)' }}>
                    <span style={{ color: 'var(--pk-text-muted)' }}>{label}</span>
                    <span style={{ fontWeight: 600, color: col }}>{val}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PetaSebaran;
