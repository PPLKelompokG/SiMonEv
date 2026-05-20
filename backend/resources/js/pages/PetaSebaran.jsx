import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Users, AlertTriangle, TrendingUp, Search, Layers } from 'lucide-react';
import api from '../api';

/* ── Koordinat kecamatan Kabupaten Bandung Barat ── */
const WILAYAH_COORDS = {
  'Batujajar': [-6.891, 107.491],
  'Cihampelas': [-6.924, 107.502],
  'Cikalongwetan': [-6.746, 107.447],
  'Cililin': [-6.953, 107.464],
  'Cipatat': [-6.822, 107.399],
  'Cipeundeuy': [-6.762, 107.369],
  'Cipongkor': [-6.985, 107.411],
  'Cisarua': [-6.797, 107.545],
  'Gununghalu': [-7.027, 107.359],
  'Lembang': [-6.814, 107.618],
  'Ngamprah': [-6.840, 107.513],
  'Padalarang': [-6.841, 107.473],
  'Parongpong': [-6.804, 107.575],
  'Rongga': [-7.037, 107.288],
  'Saguling': [-6.912, 107.412],
  'Sindangkerta': [-6.992, 107.448],
  // Fallback for unknown areas - center of Bandung City
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
  const [mapMode, setMapMode] = useState('dark');

  const [geoJsonData, setGeoJsonData] = useState(null);

  const MAP_URLS = {
    dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    osm: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [res, geoRes] = await Promise.all([
          api.get('/peta-sebaran'),
          fetch('/batas_wilayah.geojson').then(r => r.ok ? r.json() : null).catch(() => null)
        ]);
        setData(res.data.data);
        if (geoRes) setGeoJsonData(geoRes);
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
          <div className="glass-panel" style={{ padding: 0, overflow: 'hidden', minHeight: 500, position: 'relative' }}>
            
            {/* Map Mode Toggle */}
            <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 1000, display: 'flex', background: 'var(--pk-glass-bg)', backdropFilter: 'blur(8px)', borderRadius: '8px', border: '1px solid var(--pk-glass-border)', overflow: 'hidden' }}>
              <button 
                onClick={() => setMapMode('osm')} 
                style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', fontWeight: 600, background: mapMode === 'osm' ? 'var(--pk-primary)' : 'transparent', color: mapMode === 'osm' ? '#fff' : 'var(--pk-text-muted)', border: 'none', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <MapPin size={14} /> Standar
              </button>
              <button 
                onClick={() => setMapMode('dark')} 
                style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', fontWeight: 600, background: mapMode === 'dark' ? 'var(--pk-primary)' : 'transparent', color: mapMode === 'dark' ? '#fff' : 'var(--pk-text-muted)', border: 'none', borderLeft: '1px solid var(--pk-glass-border)', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Layers size={14} /> Dark
              </button>
              <button 
                onClick={() => setMapMode('satellite')} 
                style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', fontWeight: 600, background: mapMode === 'satellite' ? 'var(--pk-primary)' : 'transparent', color: mapMode === 'satellite' ? '#fff' : 'var(--pk-text-muted)', border: 'none', borderLeft: '1px solid var(--pk-glass-border)', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <MapPin size={14} /> Satelit
              </button>
            </div>

            <MapContainer center={[-6.840, 107.513]} zoom={11} style={{ height: '100%', minHeight: 500, borderRadius: 'var(--pk-radius)' }} attributionControl={false}>
              <TileLayer url={MAP_URLS[mapMode]} />
              <FitBounds points={points} />
              
              {/* Render GeoJSON Polygons (Choropleth) if available, otherwise fallback to CircleMarkers */}
              {geoJsonData && geoJsonData.features ? (
                geoJsonData.features.map((feature, i) => {
                  const wilayahName = feature.properties.district || feature.properties.KECAMATAN;
                  if (!wilayahName) return null;
                  
                  const w = points.find(x => 
                    x.wilayah?.toLowerCase().includes(wilayahName.toLowerCase()) || 
                    wilayahName.toLowerCase().includes(x.wilayah?.toLowerCase())
                  );
                  
                  if (!w) return null; // Only show if we have data for this region

                  const color = getIntensityColor(w.total_penerima, maxPenerima);
                  const isSelected = selected?.wilayah === w.wilayah;

                  return (
                    <GeoJSON 
                      key={`${i}-${isSelected}`} // Force re-render on select to bring to front if needed
                      data={feature} 
                      style={{
                        fillColor: color,
                        weight: isSelected ? 2 : 0.8,
                        opacity: 1,
                        color: isSelected ? '#1e293b' : 'rgba(255,255,255,0.4)',
                        fillOpacity: isSelected ? 0.9 : 0.7
                      }}
                      eventHandlers={{
                        click: () => setSelected(w),
                        mouseover: (e) => {
                          const layer = e.target;
                          layer.setStyle({ fillOpacity: 0.85, weight: 2, color: '#334155' });
                          layer.bringToFront();
                        },
                        mouseout: (e) => {
                          const layer = e.target;
                          if (selected?.wilayah !== w.wilayah) {
                            layer.setStyle({ fillOpacity: 0.7, weight: 0.8, color: 'rgba(255,255,255,0.4)' });
                          } else {
                            layer.setStyle({ fillOpacity: 0.9, weight: 2, color: '#1e293b' });
                          }
                        }
                      }}
                    >
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
                    </GeoJSON>
                  );
                })
              ) : (
                points.map((w, i) => {
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
                })
              )}
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
