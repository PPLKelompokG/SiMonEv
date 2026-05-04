import React, { useState, useEffect, useContext } from 'react';
import { createPortal } from 'react-dom';
import { Plus, X, Activity, TrendingUp, Users, AlertTriangle, Search, Filter, Eye, User, Calendar, Ruler, Weight, Edit, Trash2 } from 'lucide-react';
import api from '../api';
import statusGiziService from '../api/statusGiziService';
import { AuthContext } from '../context/AuthContext';

// ── Helpers ──────────────────────────────────────────────────────────────────
const KATEGORI_CONFIG = {
  gizi_buruk: { label: 'Gizi Buruk', color: '#ef4444', bg: 'rgba(239,68,68,0.15)', badge: 'badge-danger' },
  gizi_kurang: { label: 'Gizi Kurang', color: '#f97316', bg: 'rgba(249,115,22,0.15)', badge: 'badge-warning' },
  normal: { label: 'Normal', color: '#22c55e', bg: 'rgba(34,197,94,0.15)', badge: 'badge-success' },
  gizi_lebih: { label: 'Gizi Lebih', color: '#eab308', bg: 'rgba(234,179,8,0.15)', badge: 'badge-warning' },
  obesitas: { label: 'Obesitas', color: '#a855f7', bg: 'rgba(168,85,247,0.15)', badge: 'badge-info' },
};

function hitungBmi(berat, tinggi) {
  if (!berat || !tinggi || tinggi <= 0) return null;
  const tinggiM = tinggi / 100;
  return +(berat / (tinggiM * tinggiM)).toFixed(2);
}

function tentukanKategori(bmi) {
  if (!bmi) return null;
  if (bmi < 17) return 'gizi_buruk';
  if (bmi < 18.5) return 'gizi_kurang';
  if (bmi < 25) return 'normal';
  if (bmi < 30) return 'gizi_lebih';
  return 'obesitas';
}

function formatTanggal(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ── Stat Card ────────────────────────────────────────────────────────────────
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

// ── BMI Meter ────────────────────────────────────────────────────────────────
const BmiMeter = ({ bmi }) => {
  if (!bmi) return null;
  const kat = tentukanKategori(bmi);
  const cfg = KATEGORI_CONFIG[kat] || {};
  const pct = Math.min(Math.max(((bmi - 10) / 30) * 100, 0), 100);
  return (
    <div style={{ marginTop: '1rem', padding: '1rem', background: `${cfg.color}11`, borderRadius: 10, border: `1px solid ${cfg.color}44` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--pk-text-muted)' }}>BMI Dihitung Otomatis</span>
        <span style={{ fontWeight: 700, color: cfg.color }}>{bmi}</span>
      </div>
      <div style={{ height: 8, background: 'var(--pk-glass-border)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: cfg.color, borderRadius: 4, transition: 'width 0.4s ease' }} />
      </div>
      <div style={{ marginTop: 6, fontSize: '0.8rem', fontWeight: 600, color: cfg.color }}>
        Kategori: {cfg.label}
      </div>
    </div>
  );
};

// ── Main Component ───────────────────────────────────────────────────────────
const StatusGizi = () => {
  const { user } = useContext(AuthContext);

  const [data, setData] = useState([]);
  const [penerimas, setPenerimas] = useState([]);
  const [statistik, setStatistik] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [filterKat, setFilterKat] = useState('semua');
  const [editId, setEditId] = useState(null);

  const FORM_INIT = { penerima_bantuan_id: '', tanggal_kunjungan: '', berat_badan: '', tinggi_badan: '', usia_saat_ukur: '', catatan: '' };
  const [form, setForm] = useState(FORM_INIT);

  const bmiPreview = hitungBmi(parseFloat(form.berat_badan), parseFloat(form.tinggi_badan));

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchAll = async () => {
    try {
      setLoading(true);
      const [resData, resStat, resPenerima] = await Promise.all([
        statusGiziService.getAll(),
        statusGiziService.getStatistik(),
        api.get('/penerima-bantuan'),
      ]);
      setData(resData.data.data || []);
      setStatistik(resStat.data.data || null);

      const allPenerima = resPenerima.data.data || [];
      setPenerimas(allPenerima.filter(p => p.status === 'disetujui'));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // ── Submit & Actions ──────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      if (editId) {
        await statusGiziService.update(editId, form);
      } else {
        await statusGiziService.store(form);
      }
      setShowModal(false);
      setForm(FORM_INIT);
      setEditId(null);
      fetchAll();
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal menyimpan data.';
      const errors = err.response?.data?.errors;
      setFormError(errors ? Object.values(errors).flat().join(' | ') : msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setForm({
      penerima_bantuan_id: item.penerima_bantuan_id,
      tanggal_kunjungan: item.tanggal_kunjungan ? item.tanggal_kunjungan.split('T')[0] : '',
      berat_badan: item.berat_badan,
      tinggi_badan: item.tinggi_badan,
      usia_saat_ukur: item.usia_saat_ukur || '',
      catatan: item.catatan || '',
    });
    setFormError('');
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus data status gizi ini?')) return;
    try {
      await statusGiziService.delete(id);
      fetchAll();
    } catch (err) {
      alert('Gagal menghapus data.');
    }
  };

  // ── Filter ─────────────────────────────────────────────────────────────────
  const filtered = data.filter(item => {
    const matchSearch = search === '' ||
      item.penerima_bantuan?.nama?.toLowerCase().includes(search.toLowerCase()) ||
      item.penerima_bantuan?.nik?.includes(search);
    const matchKat = filterKat === 'semua' || item.kategori_status === filterKat;
    return matchSearch && matchKat;
  });

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)', borderRadius: 10, padding: '6px 8px', display: 'inline-flex' }}>
              <Activity size={20} color='var(--pk-text)' />
            </span>
            Status Gizi Penerima
          </h2>
          <p style={{ margin: '0.35rem 0 0', color: 'var(--pk-text-muted)', fontSize: '0.875rem' }}>
            Pemantauan berat badan, tinggi badan &amp; BMI
          </p>
        </div>
        {(user?.role === 'admin' || user?.role === 'petugas_lapangan') && (
          <button className="btn btn-primary" onClick={() => { setForm(FORM_INIT); setEditId(null); setFormError(''); setShowModal(true); }}>
            <Plus size={17} /> Catat Data Gizi
          </button>
        )}
      </div>

      {/* Statistik Cards */}
      {!loading && statistik && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
          <StatCard icon={<Users size={22} />} label="Total Kunjungan" value={statistik.total} color="#8b5cf6" />
          <StatCard icon={<TrendingUp size={22} />} label="Rata-rata BMI" value={statistik.rata_rata_bmi} color="#06b6d4" sub="Indeks Massa Tubuh" />
          <StatCard icon={<Activity size={22} />} label="Normal" value={statistik.per_kategori?.normal ?? 0} color="#22c55e" sub="Kategori Normal" />
          <StatCard icon={<AlertTriangle size={22} />} label="Gizi Buruk" value={statistik.per_kategori?.gizi_buruk ?? 0} color="#ef4444" sub="Perlu Penanganan" />
        </div>
      )}

      {/* Table Panel */}
      <div className="glass-panel">
        {/* Search & Filter Bar */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 220, position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--pk-text-muted)' }} />
            <input
              className="form-control"
              style={{ paddingLeft: 36 }}
              placeholder="Cari nama / NIK penerima..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Filter size={16} style={{ color: 'var(--pk-text-muted)' }} />
            <select className="form-control" style={{ minWidth: 160 }} value={filterKat} onChange={e => setFilterKat(e.target.value)}>
              <option value="semua">Semua Kategori</option>
              {Object.entries(KATEGORI_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--pk-text-muted)' }}>
            <Activity size={32} style={{ opacity: 0.4, marginBottom: 8 }} />
            <p>Memuat data...</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Penerima</th>
                  <th>Tanggal Kunjungan</th>
                  <th>BB (kg)</th>
                  <th>TB (cm)</th>
                  <th>BMI</th>
                  <th>Kategori</th>
                  <th>Usia</th>
                  <th>Petugas</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => {
                  const kat = KATEGORI_CONFIG[item.kategori_status] || {};
                  return (
                    <tr key={item.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{item.penerima_bantuan?.nama || '-'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--pk-text-muted)' }}>{item.penerima_bantuan?.nik || ''}</div>
                      </td>
                      <td>{formatTanggal(item.tanggal_kunjungan)}</td>
                      <td>{item.berat_badan}</td>
                      <td>{item.tinggi_badan}</td>
                      <td>
                        <span style={{ fontWeight: 700, color: kat.color }}>{item.bmi}</span>
                      </td>
                      <td>
                        <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, background: kat.bg, color: kat.color, border: `1px solid ${kat.color}44` }}>
                          {kat.label}
                        </span>
                      </td>
                      <td>{item.usia_saat_ukur ? `${item.usia_saat_ukur} th` : '-'}</td>
                      <td>{item.petugas?.name || '-'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            className="btn btn-outline"
                            style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                            onClick={() => setShowDetail(item)}
                            title="Detail"
                          >
                            <Eye size={14} />
                          </button>
                          {(user?.role === 'admin' || user?.role === 'petugas_lapangan') && (
                            <>
                              <button
                                className="btn btn-outline"
                                style={{ padding: '4px 8px', fontSize: '0.8rem', color: 'var(--pk-primary)', borderColor: 'rgba(139, 92, 246, 0.3)' }}
                                onClick={() => handleEdit(item)}
                                title="Edit"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                className="btn btn-outline"
                                style={{ padding: '4px 8px', fontSize: '0.8rem', color: 'var(--pk-danger)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                                onClick={() => handleDelete(item.id)}
                                title="Hapus"
                              >
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', color: 'var(--pk-text-muted)', padding: '2rem' }}>
                      Tidak ada data ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modal Catat Data Gizi ──────────────────────────────────────────── */}
      {/* ── Modal Catat Data Gizi ──────────────────────────────────────────── */}
      {showModal && createPortal(
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div className="animate-slide-up" style={{
            width: '100%',
            maxWidth: '650px',
            padding: 0,
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px var(--pk-glass-border)',
            margin: '1rem',
            background: 'var(--pk-bg-2)',
            borderRadius: 'var(--pk-radius)'
          }}>
            <div style={{
              padding: '1.5rem',
              borderBottom: '1px solid var(--pk-glass-border)',
              background: 'linear-gradient(to right, rgba(139, 92, 246, 0.05), transparent)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem' }}>
                <div style={{ width: '8px', height: '24px', background: 'var(--pk-primary)', borderRadius: '4px' }}></div>
                {editId ? 'Edit Data Status Gizi' : 'Form Status Gizi Baru'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--pk-text-muted)' }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{ padding: '1.5rem', maxHeight: '75vh', overflowY: 'auto' }}>
              {formError && (
                <div className="alert alert-danger" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem', borderRadius: '12px' }}>
                  <AlertTriangle size={20} />
                  <span style={{ fontWeight: 500 }}>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                <div>
                  <label className="form-label" style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <User size={16} color="var(--pk-secondary)" /> Penerima Bantuan <span style={{ color: 'var(--pk-danger)' }}>*</span>
                  </label>
                  <select
                    className="form-control"
                    required
                    value={form.penerima_bantuan_id}
                    onChange={e => setForm({ ...form, penerima_bantuan_id: e.target.value })}
                    style={{ background: 'var(--pk-bg)' }}
                  >
                    <option value="">-- Pilih Penerima --</option>
                    {penerimas.map(p => (
                      <option key={p.id} value={p.id}>{p.nik} - {p.nama}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="form-label" style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Calendar size={16} color="var(--pk-secondary)" /> Tanggal <span style={{ color: 'var(--pk-danger)' }}>*</span>
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      required
                      value={form.tanggal_kunjungan}
                      onChange={e => setForm({ ...form, tanggal_kunjungan: e.target.value })}
                      style={{ background: 'var(--pk-bg)' }}
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Activity size={16} color="var(--pk-secondary)" /> Usia Saat Diukur <span style={{ color: 'var(--pk-text-muted)', fontSize: '0.8rem', fontWeight: 'normal' }}>(Opsional)</span>
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      min="0"
                      max="150"
                      placeholder="Mis. 5 (tahun)"
                      value={form.usia_saat_ukur}
                      onChange={e => setForm({ ...form, usia_saat_ukur: e.target.value })}
                      style={{ background: 'var(--pk-bg)' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="form-label" style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Weight size={16} color="var(--pk-secondary)" /> Berat Badan (kg) <span style={{ color: 'var(--pk-danger)' }}>*</span>
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      step="0.01"
                      min="1"
                      max="500"
                      required
                      placeholder="Contoh: 55.5"
                      value={form.berat_badan}
                      onChange={e => setForm({ ...form, berat_badan: e.target.value })}
                      style={{ background: 'var(--pk-bg)' }}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Ruler size={16} color="var(--pk-secondary)" /> Tinggi Badan (cm) <span style={{ color: 'var(--pk-danger)' }}>*</span>
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      step="0.01"
                      min="30"
                      max="300"
                      required
                      placeholder="Contoh: 165"
                      value={form.tinggi_badan}
                      onChange={e => setForm({ ...form, tinggi_badan: e.target.value })}
                      style={{ background: 'var(--pk-bg)' }}
                    />
                  </div>
                </div>

                {/* BMI Preview */}
                <BmiMeter bmi={bmiPreview} />

                <div>
                  <label className="form-label" style={{ fontWeight: 600 }}>Keterangan <span style={{ color: 'var(--pk-text-muted)', fontSize: '0.8rem', fontWeight: 'normal' }}>(Opsional)</span></label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Tambahkan catatan khusus, rekomendasi..."
                    value={form.catatan}
                    onChange={e => setForm({ ...form, catatan: e.target.value })}
                    style={{ background: 'var(--pk-bg)', resize: 'vertical' }}
                  ></textarea>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setShowModal(false)}
                    disabled={submitting}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)' }}
                  >
                    {submitting ? (
                      <>
                        <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px', borderColor: 'rgba(255,255,255,0.5)', borderTopColor: '#fff' }}></div>
                        Menyimpan...
                      </>
                    ) : (
                      <><Plus size={18} /> Simpan Data</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── Modal Detail ───────────────────────────────────────────────────── */}
      {showDetail && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, backdropFilter: 'blur(6px)' }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: 460, background: 'var(--pk-bg-secondary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>Detail Catatan Gizi</h3>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--pk-text-muted)' }} onClick={() => setShowDetail(null)}>
                <X size={22} />
              </button>
            </div>

            {(() => {
              const d = showDetail;
              const kat = KATEGORI_CONFIG[d.kategori_status] || {};
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <Row label="Penerima" value={`${d.penerima_bantuan?.nama || '-'} (${d.penerima_bantuan?.nik || '-'})`} />
                  <Row label="Tanggal Kunjungan" value={formatTanggal(d.tanggal_kunjungan)} />
                  <Row label="Berat Badan" value={`${d.berat_badan} kg`} />
                  <Row label="Tinggi Badan" value={`${d.tinggi_badan} cm`} />
                  <Row label="BMI" value={<span style={{ fontWeight: 700, color: kat.color }}>{d.bmi}</span>} />
                  <Row label="Status Gizi" value={
                    <span style={{ padding: '3px 12px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600, background: kat.bg, color: kat.color }}>
                      {kat.label}
                    </span>
                  } />
                  {d.usia_saat_ukur && <Row label="Usia Saat Ukur" value={`${d.usia_saat_ukur} tahun`} />}
                  <Row label="Dicatat oleh" value={d.petugas?.name || '-'} />
                  {d.catatan && (
                    <div style={{ padding: '0.75rem', background: 'var(--pk-highlight)', borderRadius: 8, border: '1px solid var(--pk-glass-border)' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--pk-text-muted)', marginBottom: 4 }}>Catatan</div>
                      <div style={{ fontSize: '0.875rem' }}>{d.catatan}</div>
                    </div>
                  )}
                </div>
              );
            })()}

            <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
              <button className="btn btn-outline" onClick={() => setShowDetail(null)}>Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Row = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--pk-highlight)', paddingBottom: '0.6rem' }}>
    <span style={{ fontSize: '0.8rem', color: 'var(--pk-text-muted)', flexShrink: 0, marginRight: '1rem' }}>{label}</span>
    <span style={{ fontWeight: 500, textAlign: 'right' }}>{value}</span>
  </div>
);

export default StatusGizi;
