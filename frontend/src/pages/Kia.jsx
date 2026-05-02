import React, { useState, useEffect, useContext } from 'react';
import { createPortal } from 'react-dom';
import { Plus, X, Activity, Users, AlertTriangle, Search, Eye, User, Calendar, Edit, Trash2, HeartPulse, Baby } from 'lucide-react';
import api from '../api';
import kiaService from '../api/kiaService';
import { AuthContext } from '../context/AuthContext';

function formatTanggal(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

const StatCard = ({ icon, label, value, color, sub }) => (
  <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem 1.5rem' }}>
    <div style={{ width: 48, height: 48, borderRadius: 14, background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--pk-text)', lineHeight: 1.1 }}>{value ?? '-'}</div>
      <div style={{ fontSize: '0.8rem', color: 'var(--pk-text-muted)', marginTop: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: '0.75rem', color, marginTop: 2, fontWeight: 600 }}>{sub}</div>}
    </div>
  </div>
);

const Kia = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('ibu_hamil'); // 'ibu_hamil' or 'balita'
  
  const [ibuHamilData, setIbuHamilData] = useState([]);
  const [balitaData, setBalitaData] = useState([]);
  const [statIbu, setStatIbu] = useState(null);
  const [statBalita, setStatBalita] = useState(null);
  const [penerimas, setPenerimas] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [showModalIbu, setShowModalIbu] = useState(false);
  const [showModalBalita, setShowModalBalita] = useState(false);
  const [search, setSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formError, setFormError] = useState('');

  // Form Initial States
  const INIT_IBU = {
    penerima_bantuan_id: '', tanggal_kunjungan: '', usia_kehamilan: '', berat_badan: '',
    tekanan_darah_sistolik: '', tekanan_darah_diastolik: '', status_kunjungan: 'K1',
    sudah_fe: false, sudah_tt: false, catatan: ''
  };
  const [formIbu, setFormIbu] = useState(INIT_IBU);

  const INIT_BALITA = {
    penerima_bantuan_id: '', nama_balita: '', tanggal_lahir: '', jenis_kelamin: 'laki_laki',
    tanggal_kunjungan: '', usia_bulan: '', berat_badan: '', tinggi_badan: '', lingkar_kepala: '',
    imunisasi_hb0: false, imunisasi_bcg: false, imunisasi_dpt_hb_hib_1: false, imunisasi_dpt_hb_hib_2: false, imunisasi_dpt_hb_hib_3: false,
    imunisasi_polio_1: false, imunisasi_polio_2: false, imunisasi_polio_3: false, imunisasi_polio_4: false,
    imunisasi_campak: false, imunisasi_mr: false, dapat_vit_a: false, catatan: ''
  };
  const [formBalita, setFormBalita] = useState(INIT_BALITA);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [resIbu, resBalita, resStatIbu, resStatBalita, resPenerima] = await Promise.all([
        kiaService.ibuHamil.getAll(),
        kiaService.balita.getAll(),
        kiaService.ibuHamil.getStatistik(),
        kiaService.balita.getStatistik(),
        api.get('/penerima-bantuan')
      ]);
      setIbuHamilData(resIbu.data.data || []);
      setBalitaData(resBalita.data.data || []);
      setStatIbu(resStatIbu.data.data || null);
      setStatBalita(resStatBalita.data.data || null);
      setPenerimas((resPenerima.data.data || []).filter(p => p.status === 'disetujui'));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // Submit Handlers
  const handleSubmitIbu = async (e) => {
    e.preventDefault();
    setFormError(''); setSubmitting(true);
    try {
      if (editId) await kiaService.ibuHamil.update(editId, formIbu);
      else await kiaService.ibuHamil.store(formIbu);
      setShowModalIbu(false); setFormIbu(INIT_IBU); setEditId(null);
      fetchAll();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Gagal menyimpan data.');
    } finally { setSubmitting(false); }
  };

  const handleSubmitBalita = async (e) => {
    e.preventDefault();
    setFormError(''); setSubmitting(true);
    try {
      if (editId) await kiaService.balita.update(editId, formBalita);
      else await kiaService.balita.store(formBalita);
      setShowModalBalita(false); setFormBalita(INIT_BALITA); setEditId(null);
      fetchAll();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Gagal menyimpan data.');
    } finally { setSubmitting(false); }
  };

  // Delete Handlers
  const handleDeleteIbu = async (id) => {
    if (!window.confirm('Yakin hapus data ibu hamil?')) return;
    try { await kiaService.ibuHamil.delete(id); fetchAll(); } catch (err) { alert('Gagal menghapus data'); }
  };
  const handleDeleteBalita = async (id) => {
    if (!window.confirm('Yakin hapus data balita?')) return;
    try { await kiaService.balita.delete(id); fetchAll(); } catch (err) { alert('Gagal menghapus data'); }
  };

  // Edit Handlers
  const handleEditIbu = (item) => {
    setEditId(item.id);
    setFormIbu({
      ...item, 
      tanggal_kunjungan: item.tanggal_kunjungan?.split('T')[0] || '',
      tekanan_darah_sistolik: item.tekanan_darah_sistolik || '',
      tekanan_darah_diastolik: item.tekanan_darah_diastolik || '',
      catatan: item.catatan || ''
    });
    setFormError(''); setShowModalIbu(true);
  };
  const handleEditBalita = (item) => {
    setEditId(item.id);
    setFormBalita({
      ...item,
      tanggal_lahir: item.tanggal_lahir?.split('T')[0] || '',
      tanggal_kunjungan: item.tanggal_kunjungan?.split('T')[0] || '',
      tinggi_badan: item.tinggi_badan || '',
      lingkar_kepala: item.lingkar_kepala || '',
      catatan: item.catatan || ''
    });
    setFormError(''); setShowModalBalita(true);
  };

  const filteredIbu = ibuHamilData.filter(i => (i.penerima_bantuan?.nama || '').toLowerCase().includes(search.toLowerCase()));
  const filteredBalita = balitaData.filter(b => b.nama_balita.toLowerCase().includes(search.toLowerCase()) || (b.penerima_bantuan?.nama || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ background: 'linear-gradient(135deg,#ec4899,#db2777)', borderRadius: 10, padding: '6px 8px', display: 'inline-flex' }}>
              <HeartPulse size={20} color="#fff" />
            </span>
            Kesehatan Ibu & Anak (KIA)
          </h2>
          <p style={{ margin: '0.35rem 0 0', color: 'var(--pk-text-muted)', fontSize: '0.875rem' }}>
            Pemantauan kesehatan ibu hamil dan balita
          </p>
        </div>
        {(user?.role === 'admin' || user?.role === 'petugas_lapangan') && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-outline" style={{ color: '#ec4899', borderColor: 'rgba(236, 72, 153, 0.3)' }} onClick={() => { setFormIbu(INIT_IBU); setEditId(null); setShowModalIbu(true); }}>
              <Plus size={17} /> Catat Ibu Hamil
            </button>
            <button className="btn btn-primary" onClick={() => { setFormBalita(INIT_BALITA); setEditId(null); setShowModalBalita(true); }}>
              <Plus size={17} /> Catat Balita
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--pk-glass-border)', marginBottom: '1.5rem' }}>
        <button 
          onClick={() => setActiveTab('ibu_hamil')}
          style={{ background: 'none', border: 'none', borderBottom: activeTab === 'ibu_hamil' ? '2px solid #ec4899' : '2px solid transparent', padding: '0.75rem 1rem', color: activeTab === 'ibu_hamil' ? '#fff' : 'var(--pk-text-muted)', fontWeight: 600, cursor: 'pointer', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <User size={18} /> Ibu Hamil
        </button>
        <button 
          onClick={() => setActiveTab('balita')}
          style={{ background: 'none', border: 'none', borderBottom: activeTab === 'balita' ? '2px solid var(--pk-primary)' : '2px solid transparent', padding: '0.75rem 1rem', color: activeTab === 'balita' ? '#fff' : 'var(--pk-text-muted)', fontWeight: 600, cursor: 'pointer', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Baby size={18} /> Balita
        </button>
      </div>

      {/* Stats */}
      {activeTab === 'ibu_hamil' && statIbu && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <StatCard icon={<Users size={22} />} label="Total Pemeriksaan" value={statIbu.total} color="#ec4899" />
          <StatCard icon={<Activity size={22} />} label="Risiko Tinggi" value={statIbu.per_kondisi?.risiko_tinggi || 0} color="#ef4444" sub="Perlu Perhatian" />
          <StatCard icon={<HeartPulse size={22} />} label="Sudah Imunisasi TT" value={statIbu.sudah_tt} color="#10b981" />
        </div>
      )}
      {activeTab === 'balita' && statBalita && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <StatCard icon={<Baby size={22} />} label="Total Pemeriksaan" value={statBalita.total} color="#3b82f6" />
          <StatCard icon={<AlertTriangle size={22} />} label="Gizi Buruk" value={statBalita.per_gizi?.gizi_buruk || 0} color="#ef4444" sub="Perlu Intervensi" />
          <StatCard icon={<Activity size={22} />} label="Imunisasi Dasar Lengkap" value={statBalita.imunisasi_lengkap} color="#10b981" />
        </div>
      )}

      {/* Table Container */}
      <div className="glass-panel">
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ flex: 1, maxWidth: 300, position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--pk-text-muted)' }} />
            <input className="form-control" style={{ paddingLeft: 36 }} placeholder="Cari nama..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>Memuat...</div>
        ) : activeTab === 'ibu_hamil' ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Penerima</th>
                  <th>Tgl Kunjungan</th>
                  <th>Usia Kehamilan</th>
                  <th>BB (kg)</th>
                  <th>Tensi</th>
                  <th>Kondisi</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredIbu.map(item => (
                  <tr key={item.id}>
                    <td>{item.penerima_bantuan?.nama}</td>
                    <td>{formatTanggal(item.tanggal_kunjungan)}</td>
                    <td>{item.usia_kehamilan} mgg</td>
                    <td>{item.berat_badan}</td>
                    <td>{item.tekanan_darah_sistolik ? `${item.tekanan_darah_sistolik}/${item.tekanan_darah_diastolik}` : '-'}</td>
                    <td>
                      <span className={`badge ${item.kondisi_kehamilan === 'risiko_tinggi' ? 'badge-danger' : item.kondisi_kehamilan === 'risiko_rendah' ? 'badge-warning' : 'badge-success'}`}>
                        {item.kondisi_kehamilan.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      {(user?.role === 'admin' || user?.role === 'petugas_lapangan') && (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button className="btn btn-outline" style={{ padding: '4px 8px' }} onClick={() => handleEditIbu(item)}><Edit size={14} /></button>
                          <button className="btn btn-outline" style={{ padding: '4px 8px', color: 'var(--pk-danger)' }} onClick={() => handleDeleteIbu(item.id)}><Trash2 size={14} /></button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Nama Balita</th>
                  <th>Penerima (Ortu)</th>
                  <th>Tgl Kunjungan</th>
                  <th>Usia</th>
                  <th>BB / TB</th>
                  <th>Status Gizi</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredBalita.map(item => (
                  <tr key={item.id}>
                    <td>{item.nama_balita}</td>
                    <td>{item.penerima_bantuan?.nama}</td>
                    <td>{formatTanggal(item.tanggal_kunjungan)}</td>
                    <td>{item.usia_bulan} bln</td>
                    <td>{item.berat_badan}kg / {item.tinggi_badan || '-'}cm</td>
                    <td>
                      <span className={`badge ${['gizi_buruk', 'obesitas'].includes(item.status_gizi_balita) ? 'badge-danger' : item.status_gizi_balita === 'normal' ? 'badge-success' : 'badge-warning'}`}>
                        {item.status_gizi_balita?.replace('_', ' ') || '-'}
                      </span>
                    </td>
                    <td>
                      {(user?.role === 'admin' || user?.role === 'petugas_lapangan') && (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button className="btn btn-outline" style={{ padding: '4px 8px' }} onClick={() => handleEditBalita(item)}><Edit size={14} /></button>
                          <button className="btn btn-outline" style={{ padding: '4px 8px', color: 'var(--pk-danger)' }} onClick={() => handleDeleteBalita(item.id)}><Trash2 size={14} /></button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Ibu Hamil */}
      {showModalIbu && createPortal(
        <div className="modal-overlay animate-fade-in" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: 650, background: 'var(--pk-bg-2)', maxHeight: '90vh', overflowY: 'auto', padding: '0', border: '1px solid rgba(236, 72, 153, 0.3)' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--pk-glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(to right, rgba(236, 72, 153, 0.1), transparent)' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ec4899' }}>
                <HeartPulse size={22} />
                {editId ? 'Edit Data Ibu Hamil' : 'Catat Data Ibu Hamil'}
              </h3>
              <button onClick={() => setShowModalIbu(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', cursor: 'pointer', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.3s' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(239,68,68,0.5)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}><X size={18} /></button>
            </div>
            
            <div style={{ padding: '1.5rem' }}>
              {formError && <div className="alert alert-danger" style={{ padding: '0.75rem', borderRadius: 8, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', marginBottom: '1.5rem', color: '#f87171' }}>{formError}</div>}
              
              <form onSubmit={handleSubmitIbu} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Section: Informasi Dasar */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--pk-glass-border)', padding: '1.25rem', borderRadius: 12 }}>
                  <h4 style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--pk-text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                     Informasi Dasar
                  </h4>
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label className="form-label">Penerima Bantuan</label>
                    <select className="form-control" required value={formIbu.penerima_bantuan_id} onChange={e => setFormIbu({...formIbu, penerima_bantuan_id: e.target.value})}>
                      <option value="">Pilih Penerima...</option>
                      {penerimas.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Tanggal Kunjungan</label>
                      <input type="date" className="form-control" required value={formIbu.tanggal_kunjungan} onChange={e => setFormIbu({...formIbu, tanggal_kunjungan: e.target.value})} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Usia Kehamilan (minggu)</label>
                      <input type="number" className="form-control" required min="1" max="42" placeholder="Contoh: 12" value={formIbu.usia_kehamilan} onChange={e => setFormIbu({...formIbu, usia_kehamilan: e.target.value})} />
                    </div>
                  </div>
                </div>

                {/* Section: Hasil Pemeriksaan */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--pk-glass-border)', padding: '1.25rem', borderRadius: 12 }}>
                  <h4 style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--pk-text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                     Hasil Pemeriksaan Medis
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Berat Badan (kg)</label>
                      <input type="number" className="form-control" step="0.1" required placeholder="0.0" value={formIbu.berat_badan} onChange={e => setFormIbu({...formIbu, berat_badan: e.target.value})} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Tensi Sistolik</label>
                      <input type="number" className="form-control" placeholder="120" value={formIbu.tekanan_darah_sistolik} onChange={e => setFormIbu({...formIbu, tekanan_darah_sistolik: e.target.value})} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Tensi Diastolik</label>
                      <input type="number" className="form-control" placeholder="80" value={formIbu.tekanan_darah_diastolik} onChange={e => setFormIbu({...formIbu, tekanan_darah_diastolik: e.target.value})} />
                    </div>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Status Kunjungan (Trimester)</label>
                    <select className="form-control" value={formIbu.status_kunjungan} onChange={e => setFormIbu({...formIbu, status_kunjungan: e.target.value})}>
                      <option value="K1">K1 (Kunjungan Trimester 1)</option>
                      <option value="K2">K2 (Kunjungan Trimester 2)</option>
                      <option value="K3">K3 (Kunjungan Trimester 3)</option>
                      <option value="K4">K4 (Kunjungan Trimester 3 Akhir)</option>
                    </select>
                  </div>
                </div>

                {/* Section: Tindakan */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--pk-glass-border)', padding: '1.25rem', borderRadius: 12 }}>
                   <h4 style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--pk-text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                     Tindakan & Catatan
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: formIbu.sudah_fe ? '1px solid #ec4899' : '1px solid var(--pk-glass-border)', borderRadius: 8, cursor: 'pointer', transition: '0.2s' }}>
                      <input type="checkbox" checked={formIbu.sudah_fe} onChange={e => setFormIbu({...formIbu, sudah_fe: e.target.checked})} style={{ width: 18, height: 18, accentColor: '#ec4899' }} /> 
                      <span style={{ fontWeight: formIbu.sudah_fe ? 600 : 400, color: formIbu.sudah_fe ? '#fff' : 'var(--pk-text-muted)' }}>Sudah dpt Tablet Fe</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: formIbu.sudah_tt ? '1px solid #ec4899' : '1px solid var(--pk-glass-border)', borderRadius: 8, cursor: 'pointer', transition: '0.2s' }}>
                      <input type="checkbox" checked={formIbu.sudah_tt} onChange={e => setFormIbu({...formIbu, sudah_tt: e.target.checked})} style={{ width: 18, height: 18, accentColor: '#ec4899' }} /> 
                      <span style={{ fontWeight: formIbu.sudah_tt ? 600 : 400, color: formIbu.sudah_tt ? '#fff' : 'var(--pk-text-muted)' }}>Sudah Imunisasi TT</span>
                    </label>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Catatan Tambahan</label>
                    <textarea className="form-control" rows="3" placeholder="Tuliskan keluhan atau catatan medis lainnya..." value={formIbu.catatan} onChange={e => setFormIbu({...formIbu, catatan: e.target.value})} style={{ resize: 'vertical' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--pk-glass-border)' }}>
                  <button type="button" className="btn btn-outline" onClick={() => setShowModalIbu(false)}>Batal</button>
                  <button type="submit" className="btn btn-primary" style={{ background: 'linear-gradient(135deg,#ec4899,#db2777)', boxShadow: '0 4px 15px rgba(236,72,153,0.4)' }} disabled={submitting}>
                    {submitting ? 'Menyimpan...' : 'Simpan Data'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal Balita */}
      {showModalBalita && createPortal(
        <div className="modal-overlay animate-fade-in" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: 750, background: 'var(--pk-bg-2)', maxHeight: '90vh', overflowY: 'auto', padding: '0', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--pk-glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(to right, rgba(59, 130, 246, 0.1), transparent)' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#3b82f6' }}>
                <Baby size={22} />
                {editId ? 'Edit Data Balita' : 'Catat Data Balita'}
              </h3>
              <button onClick={() => setShowModalBalita(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', cursor: 'pointer', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.3s' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(239,68,68,0.5)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}><X size={18} /></button>
            </div>

            <div style={{ padding: '1.5rem' }}>
              {formError && <div className="alert alert-danger" style={{ padding: '0.75rem', borderRadius: 8, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', marginBottom: '1.5rem', color: '#f87171' }}>{formError}</div>}
              
              <form onSubmit={handleSubmitBalita} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                {/* Section: Data Anak */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--pk-glass-border)', padding: '1.25rem', borderRadius: 12 }}>
                  <h4 style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--pk-text-muted)', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                     Data Anak & Orang Tua
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Nama Balita</label>
                      <input type="text" className="form-control" required placeholder="Nama Lengkap Balita" value={formBalita.nama_balita} onChange={e => setFormBalita({...formBalita, nama_balita: e.target.value})} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Penerima (Orang Tua)</label>
                      <select className="form-control" required value={formBalita.penerima_bantuan_id} onChange={e => setFormBalita({...formBalita, penerima_bantuan_id: e.target.value})}>
                        <option value="">Pilih Orang Tua...</option>
                        {penerimas.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Tanggal Lahir</label>
                      <input type="date" className="form-control" required value={formBalita.tanggal_lahir} onChange={e => setFormBalita({...formBalita, tanggal_lahir: e.target.value})} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Jenis Kelamin</label>
                      <select className="form-control" required value={formBalita.jenis_kelamin} onChange={e => setFormBalita({...formBalita, jenis_kelamin: e.target.value})}>
                        <option value="laki_laki">Laki-laki</option>
                        <option value="perempuan">Perempuan</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section: Pengukuran */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--pk-glass-border)', padding: '1.25rem', borderRadius: 12 }}>
                  <h4 style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--pk-text-muted)', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                     Hasil Pengukuran
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Tanggal Kunjungan</label>
                      <input type="date" className="form-control" required value={formBalita.tanggal_kunjungan} onChange={e => setFormBalita({...formBalita, tanggal_kunjungan: e.target.value})} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Usia (Bulan)</label>
                      <input type="number" className="form-control" required min="0" max="60" placeholder="0 - 60" value={formBalita.usia_bulan} onChange={e => setFormBalita({...formBalita, usia_bulan: e.target.value})} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Berat Badan (kg)</label>
                      <input type="number" className="form-control" step="0.1" required placeholder="0.0" value={formBalita.berat_badan} onChange={e => setFormBalita({...formBalita, berat_badan: e.target.value})} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Tinggi Badan (cm)</label>
                      <input type="number" className="form-control" step="0.1" placeholder="0.0" value={formBalita.tinggi_badan} onChange={e => setFormBalita({...formBalita, tinggi_badan: e.target.value})} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Lingkar Kepala (cm)</label>
                      <input type="number" className="form-control" step="0.1" placeholder="0.0" value={formBalita.lingkar_kepala} onChange={e => setFormBalita({...formBalita, lingkar_kepala: e.target.value})} />
                    </div>
                  </div>
                </div>
                
                {/* Section: Imunisasi */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--pk-glass-border)', padding: '1.25rem', borderRadius: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                    <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--pk-text-muted)' }}>Status Imunisasi & Vitamin</h4>
                    <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>Lengkapi data imunisasi</span>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem' }}>
                    {[
                      { key: 'imunisasi_hb0', label: 'HB0 (0-7 Hari)' },
                      { key: 'imunisasi_bcg', label: 'BCG (1 Bulan)' },
                      { key: 'imunisasi_polio_1', label: 'Polio 1' },
                      { key: 'imunisasi_polio_2', label: 'Polio 2' },
                      { key: 'imunisasi_polio_3', label: 'Polio 3' },
                      { key: 'imunisasi_polio_4', label: 'Polio 4' },
                      { key: 'imunisasi_dpt_hb_hib_1', label: 'DPT-HB-Hib 1' },
                      { key: 'imunisasi_dpt_hb_hib_2', label: 'DPT-HB-Hib 2' },
                      { key: 'imunisasi_dpt_hb_hib_3', label: 'DPT-HB-Hib 3' },
                      { key: 'imunisasi_campak', label: 'Campak (9 Bln)' },
                      { key: 'imunisasi_mr', label: 'MR (Booster)' },
                      { key: 'dapat_vit_a', label: 'Vitamin A' }
                    ].map(item => (
                      <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', background: 'rgba(0,0,0,0.15)', border: formBalita[item.key] ? '1px solid #3b82f6' : '1px solid var(--pk-glass-border)', borderRadius: 8, cursor: 'pointer', transition: '0.2s', fontSize: '0.8rem' }}>
                        <input type="checkbox" checked={formBalita[item.key]} onChange={e => setFormBalita({...formBalita, [item.key]: e.target.checked})} style={{ accentColor: '#3b82f6' }} /> 
                        <span style={{ color: formBalita[item.key] ? '#fff' : 'var(--pk-text-muted)', fontWeight: formBalita[item.key] ? 600 : 400 }}>{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Catatan Tambahan</label>
                  <textarea className="form-control" rows="3" placeholder="Perkembangan anak, anjuran dokter, dsb..." value={formBalita.catatan} onChange={e => setFormBalita({...formBalita, catatan: e.target.value})} style={{ resize: 'vertical' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--pk-glass-border)' }}>
                  <button type="button" className="btn btn-outline" onClick={() => setShowModalBalita(false)}>Batal</button>
                  <button type="submit" className="btn btn-primary" style={{ background: 'linear-gradient(135deg,#3b82f6,#2563eb)', boxShadow: '0 4px 15px rgba(59,130,246,0.4)' }} disabled={submitting}>
                    {submitting ? 'Menyimpan...' : 'Simpan Data'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default Kia;
