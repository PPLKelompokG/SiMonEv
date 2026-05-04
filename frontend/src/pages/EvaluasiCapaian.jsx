import React, { useState, useEffect, useContext } from 'react';
import { createPortal } from 'react-dom';
import { Plus, X, Target, TrendingUp, AlertTriangle, CheckCircle, Search, Filter, Edit, Trash2, Award, BarChart3, Calendar } from 'lucide-react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

const STATUS_CONFIG = {
  tercapai: { label: 'Tercapai', color: '#16a34a', bg: 'rgba(22,163,74,0.15)' },
  tidak_tercapai: { label: 'Tidak Tercapai', color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
  melebihi_target: { label: 'Melebihi Target', color: '#2563eb', bg: 'rgba(37,99,235,0.15)' },
};

const formatNumber = (n) => {
  if (n == null) return '-';
  return Number(n).toLocaleString('id-ID', { maximumFractionDigits: 2 });
};

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

const SkorBar = ({ skor }) => {
  const pct = Math.min(skor, 120);
  const color = skor >= 100 ? '#2563eb' : skor >= 80 ? '#16a34a' : '#ef4444';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 120 }}>
      <div style={{ flex: 1, height: 8, background: 'var(--pk-glass-border)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: color, borderRadius: 4, transition: 'width 0.4s ease' }} />
      </div>
      <span style={{ fontWeight: 700, color, fontSize: '0.85rem', minWidth: 45, textAlign: 'right' }}>{skor}%</span>
    </div>
  );
};

const EvaluasiCapaian = () => {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [statistik, setStatistik] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('semua');
  const [filterProgram, setFilterProgram] = useState('semua');
  const [editId, setEditId] = useState(null);

  const FORM_INIT = { program_bantuan_id: '', periode: '', nama_indikator: '', satuan: 'orang', target: '', realisasi: '', catatan: '' };
  const [form, setForm] = useState(FORM_INIT);

  const previewSkor = form.target && form.realisasi && Number(form.target) > 0
    ? Math.round((Number(form.realisasi) / Number(form.target)) * 10000) / 100 : null;
  const previewStatus = previewSkor !== null
    ? (previewSkor >= 100 ? 'melebihi_target' : previewSkor >= 80 ? 'tercapai' : 'tidak_tercapai') : null;

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [resData, resStat, resProg] = await Promise.all([
        api.get('/evaluasi-capaian'),
        api.get('/evaluasi-capaian/statistik'),
        api.get('/program-bantuan'),
      ]);
      setData(resData.data.data || []);
      setStatistik(resStat.data.data || null);
      setPrograms(resProg.data.data || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(''); setSubmitting(true);
    try {
      if (editId) { await api.put(`/evaluasi-capaian/${editId}`, form); }
      else { await api.post('/evaluasi-capaian', form); }
      setShowModal(false); setForm(FORM_INIT); setEditId(null); fetchAll();
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal menyimpan.';
      const errors = err.response?.data?.errors;
      setFormError(errors ? Object.values(errors).flat().join(' | ') : msg);
    } finally { setSubmitting(false); }
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setForm({ program_bantuan_id: item.program_bantuan_id, periode: item.periode, nama_indikator: item.nama_indikator, satuan: item.satuan, target: item.target, realisasi: item.realisasi, catatan: item.catatan || '' });
    setFormError(''); setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus evaluasi ini?')) return;
    try { await api.delete(`/evaluasi-capaian/${id}`); fetchAll(); } catch { alert('Gagal menghapus.'); }
  };

  const filtered = data.filter(item => {
    const matchSearch = search === '' || item.nama_indikator?.toLowerCase().includes(search.toLowerCase()) || item.program_bantuan?.nama_program?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'semua' || item.status_capaian === filterStatus;
    const matchProgram = filterProgram === 'semua' || String(item.program_bantuan_id) === filterProgram;
    return matchSearch && matchStatus && matchProgram;
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ background: 'var(--pk-primary)', borderRadius: 10, padding: '6px 8px', display: 'inline-flex' }}>
              <Target size={20} color='var(--pk-text)' />
            </span>
            Evaluasi Capaian Program
          </h2>
          <p style={{ margin: '0.35rem 0 0', color: 'var(--pk-text-muted)', fontSize: '0.875rem' }}>
            Input indikator capaian dan evaluasi otomatis per periode
          </p>
        </div>
        {user?.role === 'admin' && (
          <button className="btn btn-primary" onClick={() => { setForm(FORM_INIT); setEditId(null); setFormError(''); setShowModal(true); }}>
            <Plus size={17} /> Input Evaluasi
          </button>
        )}
      </div>

      {/* Stats */}
      {!loading && statistik && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
          <StatCard icon={<BarChart3 size={22} />} label="Total Indikator" value={statistik.total} color="#2563eb" />
          <StatCard icon={<CheckCircle size={22} />} label="Tercapai" value={statistik.tercapai + statistik.melebihi} color="#16a34a" sub={`${statistik.melebihi} melebihi target`} />
          <StatCard icon={<AlertTriangle size={22} />} label="Tidak Tercapai" value={statistik.tidak_tercapai} color="#ef4444" />
          <StatCard icon={<TrendingUp size={22} />} label="Rata-rata Skor" value={`${statistik.rata_rata_skor}%`} color="#0ea5e9" />
        </div>
      )}

      {/* Table */}
      <div className="glass-panel">
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 220, position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--pk-text-muted)' }} />
            <input className="form-control" style={{ paddingLeft: 36 }} placeholder="Cari indikator / program..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Filter size={16} style={{ color: 'var(--pk-text-muted)' }} />
            <select className="form-control" style={{ minWidth: 160 }} value={filterProgram} onChange={e => setFilterProgram(e.target.value)}>
              <option value="semua">Semua Program</option>
              {programs.map(p => <option key={p.id} value={String(p.id)}>{p.nama_program}</option>)}
            </select>
            <select className="form-control" style={{ minWidth: 150 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="semua">Semua Status</option>
              {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--pk-text-muted)' }}>
            <Target size={32} style={{ opacity: 0.4, marginBottom: 8 }} /><p>Memuat data...</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Program</th><th>Periode</th><th>Indikator</th><th>Target</th><th>Realisasi</th><th>Skor</th><th>Status</th><th>Penilai</th>
                  {user?.role === 'admin' && <th>Aksi</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => {
                  const cfg = STATUS_CONFIG[item.status_capaian] || {};
                  return (
                    <tr key={item.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{item.program_bantuan?.nama_program || '-'}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--pk-text-muted)' }}>{item.program_bantuan?.kategori_sdg}</div>
                      </td>
                      <td><span style={{ fontSize: '0.8rem', padding: '3px 8px', borderRadius: 6, background: 'var(--pk-highlight)', border: '1px solid var(--pk-glass-border)' }}>{item.periode}</span></td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{item.nama_indikator}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--pk-text-muted)' }}>Satuan: {item.satuan}</div>
                      </td>
                      <td style={{ fontWeight: 600 }}>{formatNumber(item.target)}</td>
                      <td style={{ fontWeight: 600 }}>{formatNumber(item.realisasi)}</td>
                      <td><SkorBar skor={Number(item.skor_capaian)} /></td>
                      <td>
                        <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}44` }}>
                          {cfg.label}
                        </span>
                      </td>
                      <td>{item.penilai?.name || '-'}</td>
                      {user?.role === 'admin' && (
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '0.8rem', color: 'var(--pk-primary)' }} onClick={() => handleEdit(item)} title="Edit"><Edit size={14} /></button>
                            <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '0.8rem', color: 'var(--pk-danger)' }} onClick={() => handleDelete(item.id)} title="Hapus"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={user?.role === 'admin' ? 9 : 8} style={{ textAlign: 'center', color: 'var(--pk-text-muted)', padding: '2rem' }}>Tidak ada data ditemukan.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Per-Program Summary Cards */}
      {!loading && statistik?.per_program?.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Award size={20} /> Ringkasan per Program</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            {statistik.per_program.map(p => {
              const avgSkor = Number(p.rata_rata_skor || 0).toFixed(1);
              const color = avgSkor >= 80 ? '#16a34a' : '#ef4444';
              return (
                <div key={p.program_bantuan_id} className="glass-panel" style={{ padding: '1.25rem' }}>
                  <div style={{ fontWeight: 700, marginBottom: '0.5rem' }}>{p.program_bantuan?.nama_program || 'Program'}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--pk-text-muted)', marginBottom: '0.75rem' }}>{p.program_bantuan?.kategori_sdg}</div>
                  <SkorBar skor={Number(avgSkor)} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem', fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--pk-text-muted)' }}>{p.total_indikator} indikator</span>
                    <span><span style={{ color: '#16a34a', fontWeight: 600 }}>{p.total_tercapai} tercapai</span> · <span style={{ color: '#ef4444', fontWeight: 600 }}>{p.total_tidak_tercapai} gagal</span></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal Input */}
      {showModal && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, animation: 'fadeIn 0.2s ease-out' }}>
          <div style={{ width: '100%', maxWidth: 650, padding: 0, overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5), 0 0 0 1px var(--pk-glass-border)', margin: '1rem', background: 'var(--pk-bg-2)', borderRadius: 'var(--pk-radius)' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--pk-glass-border)', background: 'var(--pk-highlight)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem' }}>
                <div style={{ width: 8, height: 24, background: 'var(--pk-primary)', borderRadius: 4 }} />
                {editId ? 'Edit Evaluasi Capaian' : 'Input Evaluasi Capaian Baru'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--pk-text-muted)' }}><X size={24} /></button>
            </div>

            <div style={{ padding: '1.5rem', maxHeight: '75vh', overflowY: 'auto' }}>
              {formError && (
                <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem', borderRadius: 12, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}>
                  <AlertTriangle size={20} /><span style={{ fontWeight: 500 }}>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label className="form-label" style={{ fontWeight: 600 }}>Program Bantuan <span style={{ color: 'var(--pk-danger)' }}>*</span></label>
                  <select className="form-control" required value={form.program_bantuan_id} onChange={e => setForm({ ...form, program_bantuan_id: e.target.value })}>
                    <option value="">-- Pilih Program --</option>
                    {programs.map(p => <option key={p.id} value={p.id}>{p.nama_program}</option>)}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="form-label" style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Calendar size={16} color="var(--pk-secondary)" /> Periode <span style={{ color: 'var(--pk-danger)' }}>*</span>
                    </label>
                    <input className="form-control" required placeholder="Contoh: 2026-Q1, Semester 1" value={form.periode} onChange={e => setForm({ ...form, periode: e.target.value })} />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontWeight: 600 }}>Satuan <span style={{ color: 'var(--pk-danger)' }}>*</span></label>
                    <select className="form-control" required value={form.satuan} onChange={e => setForm({ ...form, satuan: e.target.value })}>
                      <option value="orang">Orang</option>
                      <option value="persen">Persen (%)</option>
                      <option value="rupiah">Rupiah (Rp)</option>
                      <option value="unit">Unit</option>
                      <option value="kegiatan">Kegiatan</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="form-label" style={{ fontWeight: 600 }}>Nama Indikator <span style={{ color: 'var(--pk-danger)' }}>*</span></label>
                  <input className="form-control" required placeholder="Contoh: Jumlah penerima yang graduasi" value={form.nama_indikator} onChange={e => setForm({ ...form, nama_indikator: e.target.value })} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="form-label" style={{ fontWeight: 600 }}>Target <span style={{ color: 'var(--pk-danger)' }}>*</span></label>
                    <input type="number" className="form-control" step="0.01" min="0.01" required placeholder="Contoh: 100" value={form.target} onChange={e => setForm({ ...form, target: e.target.value })} />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontWeight: 600 }}>Realisasi <span style={{ color: 'var(--pk-danger)' }}>*</span></label>
                    <input type="number" className="form-control" step="0.01" min="0" required placeholder="Contoh: 85" value={form.realisasi} onChange={e => setForm({ ...form, realisasi: e.target.value })} />
                  </div>
                </div>

                {/* Live Preview */}
                {previewSkor !== null && (
                  <div style={{ padding: '1rem', borderRadius: 10, border: `1px solid ${STATUS_CONFIG[previewStatus]?.color}44`, background: STATUS_CONFIG[previewStatus]?.bg }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--pk-text-muted)' }}>Skor Capaian (Otomatis)</span>
                      <span style={{ fontWeight: 700, color: STATUS_CONFIG[previewStatus]?.color }}>{previewSkor}%</span>
                    </div>
                    <div style={{ height: 8, background: 'var(--pk-glass-border)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.min(previewSkor, 100)}%`, background: STATUS_CONFIG[previewStatus]?.color, borderRadius: 4, transition: 'width 0.4s ease' }} />
                    </div>
                    <div style={{ marginTop: 6, fontSize: '0.8rem', fontWeight: 600, color: STATUS_CONFIG[previewStatus]?.color }}>
                      Status: {STATUS_CONFIG[previewStatus]?.label}
                    </div>
                  </div>
                )}

                <div>
                  <label className="form-label" style={{ fontWeight: 600 }}>Catatan <span style={{ color: 'var(--pk-text-muted)', fontSize: '0.8rem', fontWeight: 'normal' }}>(Opsional)</span></label>
                  <textarea className="form-control" rows="3" placeholder="Tambahkan catatan evaluasi..." value={form.catatan} onChange={e => setForm({ ...form, catatan: e.target.value })} style={{ resize: 'vertical' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                  <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)} disabled={submitting}>Batal</button>
                  <button type="submit" className="btn btn-primary" disabled={submitting} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {submitting ? 'Menyimpan...' : <><Plus size={18} /> Simpan Evaluasi</>}
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

export default EvaluasiCapaian;
