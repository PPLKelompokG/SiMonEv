import React, { useState, useEffect, useCallback } from 'react';
import {
  History, Search, Filter, RefreshCw, ChevronLeft, ChevronRight,
  User, MapPin, Calendar, Package, Home, ArrowUpDown, CheckCircle,
  AlertCircle, Clock, FileText, X, ChevronDown, ChevronUp, UserCheck
} from 'lucide-react';
import { getHistoriBantuan, getPenerimaBantuanList } from '../api/riwayatBantuanService';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (d) => {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

const JENIS_CONFIG = {
  penyaluran: {
    label: 'Penyaluran Bantuan',
    color: '#60a5fa',
    bg: 'rgba(96,165,250,0.12)',
    border: 'rgba(96,165,250,0.35)',
    icon: <Package size={16} />,
    badgeCls: 'rh-badge-blue',
  },
  distribusi_pangan: {
    label: 'Distribusi Pangan',
    color: '#34d399',
    bg: 'rgba(52,211,153,0.12)',
    border: 'rgba(52,211,153,0.35)',
    icon: <Package size={16} />,
    badgeCls: 'rh-badge-green',
  },
  kunjungan_rumah: {
    label: 'Kunjungan Rumah',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.12)',
    border: 'rgba(245,158,11,0.35)',
    icon: <Home size={16} />,
    badgeCls: 'rh-badge-yellow',
  },
  perubahan_status: {
    label: 'Perubahan Status',
    color: '#c084fc',
    bg: 'rgba(192,132,252,0.12)',
    border: 'rgba(192,132,252,0.35)',
    icon: <ArrowUpDown size={16} />,
    badgeCls: 'rh-badge-purple',
  },
};

const STATUS_COLOR = {
  selesai: '#34d399', terselesaikan: '#34d399', disetujui: '#34d399', aktif: '#34d399',
  pending: '#f59e0b', menunggu: '#f59e0b',
  ditolak: '#f87171', gagal: '#f87171', tidak_aktif: '#f87171',
};

const getStatusColor = (s) => STATUS_COLOR[s?.toLowerCase()] ?? '#94a3b8';

// ─── Stat Card ────────────────────────────────────────────────────────────────

const StatCard = ({ label, value, icon, color }) => (
  <div className="rh-stat-card glass-panel" style={{ '--accent': color }}>
    <div className="rh-stat-icon" style={{ background: `${color}22`, color }}>{icon}</div>
    <div>
      <div className="rh-stat-value">{value ?? 0}</div>
      <div className="rh-stat-label">{label}</div>
    </div>
  </div>
);

// ─── Timeline Event Card ──────────────────────────────────────────────────────

const EventCard = ({ event }) => {
  const [expanded, setExpanded] = useState(false);
  const cfg = JENIS_CONFIG[event.jenis] ?? JENIS_CONFIG.penyaluran;

  return (
    <div className="rh-event-card" style={{ borderLeft: `3px solid ${cfg.color}` }}>
      <div className="rh-event-dot" style={{ background: cfg.color }} />

      <div className="rh-event-body">
        <div className="rh-event-header">
          <div className="rh-event-meta">
            <span className={`rh-badge ${cfg.badgeCls}`}>{cfg.icon}{cfg.label}</span>
            <span className="rh-event-date">
              <Calendar size={13} style={{ marginRight: 4 }} />
              {formatDate(event.tanggal)}
            </span>
          </div>
          {event.detail && (
            <button className="rh-expand-btn" onClick={() => setExpanded(p => !p)} title="Detail">
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          )}
        </div>

        <h4 className="rh-event-title">{event.jenis_bantuan || cfg.label}</h4>

        <div className="rh-event-info-row">
          {event.petugas && (
            <span className="rh-info-chip">
              <User size={12} />{event.petugas}
            </span>
          )}
          {event.program && (
            <span className="rh-info-chip">
              <FileText size={12} />{event.program}
            </span>
          )}
          {event.jumlah != null && (
            <span className="rh-info-chip">
              <Package size={12} />{event.jumlah} {event.satuan ?? ''}
            </span>
          )}
          {event.status && (
            <span className="rh-info-chip" style={{ color: getStatusColor(event.status) }}>
              <CheckCircle size={12} />{event.status}
            </span>
          )}
        </div>

        {event.keterangan && (
          <p className="rh-event-keterangan">{event.keterangan}</p>
        )}

        {expanded && event.detail && (
          <div className="rh-event-detail animate-fade-in">
            {Array.isArray(event.detail)
              ? event.detail.map((item, i) => (
                  <div key={i} className="rh-detail-item">
                    <span>{item.komoditas}</span>
                    <span>{item.kuantitas} {item.satuan}</span>
                  </div>
                ))
              : (
                <div className="rh-detail-grid">
                  {Object.entries(event.detail).filter(([, v]) => v != null).map(([k, v]) => (
                    <div key={k} className="rh-detail-item">
                      <span className="rh-detail-key">{k.replace(/_/g, ' ')}</span>
                      <span className="rh-detail-val">{String(v)}</span>
                    </div>
                  ))}
                </div>
              )
            }
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const FILTER_JENIS = [
  { value: '', label: 'Semua Jenis' },
  { value: 'penyaluran', label: 'Penyaluran Bantuan' },
  { value: 'distribusi_pangan', label: 'Distribusi Pangan' },
  { value: 'kunjungan_rumah', label: 'Kunjungan Rumah' },
  { value: 'perubahan_status', label: 'Perubahan Status' },
];

const RiwayatBantuan = () => {
  // Penerima search
  const [penerimaList, setPenerimaList] = useState([]);
  const [penerimaSearch, setPenerimaSearch] = useState('');
  const [selectedPenerima, setSelectedPenerima] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [loadingPenerima, setLoadingPenerima] = useState(false);

  // History state
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filters
  const [filterJenis, setFilterJenis] = useState('');
  const [filterDari, setFilterDari] = useState('');
  const [filterSampai, setFilterSampai] = useState('');
  const [page, setPage] = useState(1);

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Load penerima list
  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoadingPenerima(true);
      try {
        const res = await getPenerimaBantuanList({ nama: penerimaSearch, per_page: 10 });
        const raw = res.data?.data?.data ?? res.data?.data ?? [];
        setPenerimaList(Array.isArray(raw) ? raw : []);
      } catch {
        setPenerimaList([]);
      } finally {
        setLoadingPenerima(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [penerimaSearch]);

  // Fetch history
  const fetchHistory = useCallback(async (p = 1) => {
    if (!selectedPenerima) return;
    setLoading(true);
    setError(null);
    try {
      const params = { page: p, per_page: 15 };
      if (filterJenis) params.jenis = filterJenis;
      if (filterDari) params.dari = filterDari;
      if (filterSampai) params.sampai = filterSampai;
      const res = await getHistoriBantuan(selectedPenerima.id, params);
      setData(res.data);
    } catch (e) {
      setError(e?.response?.data?.message ?? 'Gagal memuat data riwayat');
      showToast('Gagal memuat data riwayat', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedPenerima, filterJenis, filterDari, filterSampai]);

  useEffect(() => { setPage(1); fetchHistory(1); }, [fetchHistory]);
  useEffect(() => { fetchHistory(page); }, [page, fetchHistory]);

  const handleSelectPenerima = (p) => {
    setSelectedPenerima(p);
    setShowPicker(false);
    setPenerimaSearch('');
    setPage(1);
    setData(null);
  };

  const handleClearPenerima = () => {
    setSelectedPenerima(null);
    setData(null);
    setError(null);
  };

  const penerima = data?.penerima;
  const ringkasan = data?.ringkasan;
  const riwayat = data?.riwayat ?? [];
  const pagination = data?.pagination;

  return (
    <div className="rh-page">

      {/* Toast */}
      {toast && (
        <div className={`rh-toast ${toast.type === 'error' ? 'rh-toast-error' : 'rh-toast-success'}`}>
          {toast.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Page Header */}
      <div className="rh-page-header">
        <div className="rh-page-title-wrap">
          <div className="rh-page-icon-wrap">
            <History size={22} />
          </div>
          <div>
            <h1 className="rh-page-title">Riwayat & Histori Bantuan</h1>
            <p className="rh-page-subtitle">Profil lengkap riwayat bantuan per penerima</p>
          </div>
        </div>
        {selectedPenerima && (
          <button
            className="btn btn-outline rh-btn-sm"
            onClick={() => fetchHistory(page)}
            disabled={loading}
            title="Muat ulang"
          >
            <RefreshCw size={15} className={loading ? 'rh-spin' : ''} />
            <span>Refresh</span>
          </button>
        )}
      </div>

      {/* Penerima Picker */}
      <div className="rh-picker-section glass-panel">
        <label className="rh-picker-label">
          <UserCheck size={16} style={{ color: 'var(--pk-primary)' }} />
          Cari & Pilih Penerima Bantuan
        </label>

        {selectedPenerima ? (
          <div className="rh-selected-penerima">
            <div className="rh-selected-avatar">
              {selectedPenerima.nama?.charAt(0).toUpperCase()}
            </div>
            <div className="rh-selected-info">
              <span className="rh-selected-name">{selectedPenerima.nama}</span>
              <span className="rh-selected-nik">NIK: {selectedPenerima.nik}</span>
              {selectedPenerima.alamat && (
                <span className="rh-selected-detail">
                  <MapPin size={12} /> {selectedPenerima.alamat}
                </span>
              )}
            </div>
            <button className="rh-clear-btn" onClick={handleClearPenerima} title="Ganti penerima">
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="rh-search-wrap" style={{ position: 'relative' }}>
            <div className="rh-search-input-wrap">
              <Search size={16} className="rh-search-icon" />
              <input
                className="form-control rh-search-input"
                placeholder="Ketik nama atau NIK penerima..."
                value={penerimaSearch}
                onChange={e => { setPenerimaSearch(e.target.value); setShowPicker(true); }}
                onFocus={() => setShowPicker(true)}
              />
              {loadingPenerima && <RefreshCw size={15} className="rh-spin rh-search-loading" />}
            </div>

            {showPicker && (
              <div className="rh-dropdown">
                {penerimaList.length === 0 ? (
                  <div className="rh-dropdown-empty">
                    {loadingPenerima ? 'Mencari...' : 'Tidak ada penerima ditemukan'}
                  </div>
                ) : (
                  penerimaList.map(p => (
                    <div key={p.id} className="rh-dropdown-item" onClick={() => handleSelectPenerima(p)}>
                      <div className="rh-dropdown-avatar">{p.nama?.charAt(0).toUpperCase()}</div>
                      <div>
                        <div className="rh-dropdown-name">{p.nama}</div>
                        <div className="rh-dropdown-nik">NIK: {p.nik} {p.wilayah ? `· ${p.wilayah}` : ''}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Profile + Stats (shown after selecting penerima) */}
      {penerima && (
        <>
          <div className="rh-profile-card glass-panel">
            <div className="rh-profile-avatar">{penerima.nama?.charAt(0).toUpperCase()}</div>
            <div className="rh-profile-info">
              <h2 className="rh-profile-name">{penerima.nama}</h2>
              <div className="rh-profile-chips">
                <span className="rh-info-chip"><User size={12} />NIK: {penerima.nik}</span>
                {penerima.alamat && <span className="rh-info-chip"><MapPin size={12} />{penerima.alamat}</span>}
                {penerima.wilayah && <span className="rh-info-chip"><MapPin size={12} />{penerima.wilayah}</span>}
                {penerima.kondisi_ekonomi && <span className="rh-info-chip"><FileText size={12} />{penerima.kondisi_ekonomi}</span>}
                {penerima.terdaftar_pada && (
                  <span className="rh-info-chip"><Calendar size={12} />Terdaftar: {formatDate(penerima.terdaftar_pada)}</span>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
              <span
                className="badge"
                style={{
                  background: getStatusColor(penerima.status) + '22',
                  color: getStatusColor(penerima.status),
                  border: `1px solid ${getStatusColor(penerima.status)}44`
                }}
              >
                {penerima.status ?? '-'}
              </span>
              {penerima.status_penerima && (
                <span className="badge badge-warning">{penerima.status_penerima}</span>
              )}
            </div>
          </div>

          {/* Stat Cards */}
          {ringkasan && (
            <div className="rh-stats-grid">
              <StatCard label="Total Penyaluran" value={ringkasan.total_penyaluran} color="#60a5fa" icon={<Package size={20} />} />
              <StatCard label="Distribusi Pangan" value={ringkasan.total_distribusi_pangan} color="#34d399" icon={<Package size={20} />} />
              <StatCard label="Kunjungan Rumah" value={ringkasan.total_kunjungan_rumah} color="#f59e0b" icon={<Home size={20} />} />
              <StatCard label="Perubahan Status" value={ringkasan.total_perubahan_status} color="#c084fc" icon={<ArrowUpDown size={20} />} />
            </div>
          )}

          {ringkasan && (
            <div className="rh-period-bar glass-panel">
              <div className="rh-period-item">
                <Clock size={14} style={{ color: 'var(--pk-text-muted)' }} />
                <span>Bantuan Pertama:</span>
                <strong>{formatDate(ringkasan.bantuan_pertama)}</strong>
              </div>
              <div className="rh-period-divider" />
              <div className="rh-period-item">
                <Clock size={14} style={{ color: 'var(--pk-primary)' }} />
                <span>Bantuan Terakhir:</span>
                <strong style={{ color: 'var(--pk-primary)' }}>{formatDate(ringkasan.bantuan_terakhir)}</strong>
              </div>
              <div className="rh-period-divider" />
              <div className="rh-period-item">
                <History size={14} style={{ color: 'var(--pk-text-muted)' }} />
                <span>Total Kejadian:</span>
                <strong>{ringkasan.total_events}</strong>
              </div>
            </div>
          )}
        </>
      )}

      {/* Filters (shown after selecting penerima) */}
      {selectedPenerima && (
        <div className="rh-filter-bar glass-panel">
          <div className="rh-filter-label">
            <Filter size={15} /> Filter
          </div>
          <select
            className="form-control rh-filter-select"
            value={filterJenis}
            onChange={e => { setFilterJenis(e.target.value); setPage(1); }}
          >
            {FILTER_JENIS.map(f => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
          <input
            type="date"
            className="form-control rh-filter-date"
            value={filterDari}
            onChange={e => { setFilterDari(e.target.value); setPage(1); }}
            title="Dari tanggal"
          />
          <span style={{ color: 'var(--pk-text-muted)', fontSize: '0.85rem' }}>s/d</span>
          <input
            type="date"
            className="form-control rh-filter-date"
            value={filterSampai}
            onChange={e => { setFilterSampai(e.target.value); setPage(1); }}
            title="Sampai tanggal"
          />
          {(filterJenis || filterDari || filterSampai) && (
            <button
              className="btn btn-outline rh-btn-sm"
              onClick={() => { setFilterJenis(''); setFilterDari(''); setFilterSampai(''); setPage(1); }}
            >
              <X size={14} /> Reset
            </button>
          )}
        </div>
      )}

      {/* Timeline */}
      {selectedPenerima && (
        <div className="rh-timeline-section glass-panel">
          <h3 className="rh-timeline-title">
            <History size={18} style={{ color: 'var(--pk-primary)' }} />
            Timeline Kronologis
          </h3>

          {loading && (
            <div className="rh-loading">
              <div className="rh-spinner" />
              <p>Memuat riwayat...</p>
            </div>
          )}

          {error && !loading && (
            <div className="rh-empty rh-empty-error">
              <AlertCircle size={40} style={{ color: 'var(--pk-danger)', opacity: 0.7 }} />
              <p style={{ color: 'var(--pk-danger)' }}>{error}</p>
              <button className="btn btn-outline rh-btn-sm" onClick={() => fetchHistory(page)}>
                <RefreshCw size={14} /> Coba Lagi
              </button>
            </div>
          )}

          {!loading && !error && riwayat.length === 0 && (
            <div className="rh-empty">
              <History size={48} style={{ opacity: 0.2 }} />
              <p style={{ fontSize: '1rem', fontWeight: 500 }}>Belum ada riwayat bantuan</p>
              <p style={{ fontSize: '0.85rem' }}>Riwayat akan muncul setelah penerima mendapat bantuan</p>
            </div>
          )}

          {!loading && riwayat.length > 0 && (
            <div className="rh-timeline">
              {riwayat.map((event, i) => (
                <EventCard key={`${event.jenis}-${event.id_referensi}-${i}`} event={event} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.last_page > 1 && (
            <div className="rh-pagination">
              <button
                className="rh-page-btn"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1 || loading}
              >
                <ChevronLeft size={16} />
              </button>
              <span className="rh-page-info">
                Halaman {pagination.current_page} / {pagination.last_page}
              </span>
              <button
                className="rh-page-btn"
                onClick={() => setPage(p => Math.min(pagination.last_page, p + 1))}
                disabled={!pagination.has_more || loading}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Empty state – no penerima selected */}
      {!selectedPenerima && (
        <div className="rh-empty-state glass-panel">
          <div className="rh-empty-icon">
            <History size={48} style={{ opacity: 0.3 }} />
          </div>
          <h3 style={{ marginBottom: '0.5rem' }}>Pilih Penerima Bantuan</h3>
          <p>Cari dan pilih penerima di atas untuk melihat seluruh riwayat bantuan secara kronologis.</p>
        </div>
      )}
    </div>
  );
};

export default RiwayatBantuan;
