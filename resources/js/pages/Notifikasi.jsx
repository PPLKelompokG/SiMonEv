import React, { useState, useEffect, useCallback } from 'react';
import {
  Bell, BellOff, CheckCheck, Trash2, RefreshCw,
  Package, AlertTriangle, AlertCircle, Clock, ChevronLeft, ChevronRight
} from 'lucide-react';
import {
  getNotifikasi,
  markAsRead,
  markAllAsRead,
  deleteNotifikasi,
} from '../api/notifikasiService';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getTipeIcon = (tipe) => {
  switch (tipe) {
    case 'awal_periode':    return <Package  size={18} style={{ color: '#60a5fa' }} />;
    case 'pengingat_tengah': return <AlertTriangle size={18} style={{ color: '#fbbf24' }} />;
    case 'pengingat_akhir':  return <AlertCircle  size={18} style={{ color: '#f87171' }} />;
    default:                 return <Bell          size={18} style={{ color: '#94a3b8' }} />;
  }
};

const getTipeBadge = (tipe) => {
  switch (tipe) {
    case 'awal_periode':     return { label: 'Awal Periode',  cls: 'notif-badge-info'    };
    case 'pengingat_tengah': return { label: 'Pengingat',     cls: 'notif-badge-warning' };
    case 'pengingat_akhir':  return { label: 'Peringatan',    cls: 'notif-badge-danger'  };
    default:                 return { label: 'Notifikasi',    cls: 'notif-badge-default' };
  }
};

const formatRelativeTime = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins  < 1)  return 'Baru saja';
  if (mins  < 60) return `${mins} menit lalu`;
  if (hours < 24) return `${hours} jam lalu`;
  if (days  < 7)  return `${days} hari lalu`;
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

// ─── Card Component ────────────────────────────────────────────────────────────

const NotifikasiCard = ({ notif, onRead, onDelete }) => {
  const data   = notif.data || {};
  const tipe   = data.tipe || 'default';
  const isRead = !!notif.read_at;
  const badge  = getTipeBadge(tipe);

  return (
    <div className={`notif-card ${isRead ? 'notif-card-read' : 'notif-card-unread'}`}>
      {/* Unread indicator dot */}
      {!isRead && <span className="notif-unread-dot" />}

      <div className="notif-card-icon">{getTipeIcon(tipe)}</div>

      <div className="notif-card-body">
        <div className="notif-card-header">
          <span className={`notif-type-badge ${badge.cls}`}>{badge.label}</span>
          <span className="notif-card-time">
            <Clock size={12} style={{ display: 'inline', marginRight: 4 }} />
            {formatRelativeTime(notif.created_at)}
          </span>
        </div>
        <h4 className="notif-card-title">{data.judul || 'Notifikasi'}</h4>
        <p  className="notif-card-message">{data.pesan}</p>
        {data.periode_bulan && (
          <p className="notif-card-meta">📅 Periode: {data.periode_bulan}</p>
        )}
      </div>

      <div className="notif-card-actions">
        {!isRead && (
          <button
            className="notif-action-btn notif-action-read"
            onClick={() => onRead(notif.id)}
            title="Tandai sudah dibaca"
          >
            <CheckCheck size={15} />
          </button>
        )}
        <button
          className="notif-action-btn notif-action-delete"
          onClick={() => onDelete(notif.id)}
          title="Hapus notifikasi"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'all',    label: 'Semua'       },
  { key: 'unread', label: 'Belum Dibaca'},
  { key: 'read',   label: 'Sudah Dibaca'},
];

const Notifikasi = () => {
  const [items,      setItems]      = useState([]);
  const [meta,       setMeta]       = useState(null);   // pagination meta
  const [page,       setPage]       = useState(1);
  const [tab,        setTab]        = useState('all');
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState(null);
  const [actionId,   setActionId]   = useState(null);   // id being processed
  const [toast,      setToast]      = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchNotifikasi = useCallback(async (pageNum = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res  = await getNotifikasi(20);
      const data = res.data?.data;

      // Support both paginated and plain array responses
      if (data?.data) {
        setItems(data.data);
        setMeta(data);
      } else {
        setItems(Array.isArray(data) ? data : []);
        setMeta(null);
      }
    } catch (err) {
      setError('Gagal memuat notifikasi. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNotifikasi(page); }, [fetchNotifikasi, page]);

  // Filter by tab client-side
  const filtered = items.filter(n => {
    if (tab === 'unread') return !n.read_at;
    if (tab === 'read')   return  !!n.read_at;
    return true;
  });

  const unreadCount = items.filter(n => !n.read_at).length;

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleRead = async (id) => {
    setActionId(id);
    try {
      await markAsRead(id);
      setItems(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
      showToast('Notifikasi ditandai sebagai sudah dibaca');
    } catch {
      showToast('Gagal menandai notifikasi', 'error');
    } finally {
      setActionId(null);
    }
  };

  const handleReadAll = async () => {
    setLoading(true);
    try {
      await markAllAsRead();
      setItems(prev => prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() })));
      showToast('Semua notifikasi ditandai sudah dibaca');
    } catch {
      showToast('Gagal menandai semua notifikasi', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setActionId(id);
    try {
      await deleteNotifikasi(id);
      setItems(prev => prev.filter(n => n.id !== id));
      showToast('Notifikasi berhasil dihapus');
    } catch {
      showToast('Gagal menghapus notifikasi', 'error');
    } finally {
      setActionId(null);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="notif-page">

      {/* Toast */}
      {toast && (
        <div className={`notif-toast ${toast.type === 'error' ? 'notif-toast-error' : 'notif-toast-success'}`}>
          {toast.type === 'error' ? <AlertCircle size={16} /> : <CheckCheck size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="notif-page-header">
        <div className="notif-page-title-wrap">
          <div className="notif-page-icon-wrap">
            <Bell size={22} />
          </div>
          <div>
            <h1 className="notif-page-title">Notifikasi</h1>
            <p className="notif-page-subtitle">
              Pengingat jadwal distribusi bantuan pangan
            </p>
          </div>
          {unreadCount > 0 && (
            <span className="notif-header-badge">{unreadCount} belum dibaca</span>
          )}
        </div>

        <div className="notif-page-actions">
          <button
            className="btn btn-outline notif-btn-sm"
            onClick={() => fetchNotifikasi(page)}
            disabled={loading}
            title="Muat ulang"
          >
            <RefreshCw size={15} className={loading ? 'notif-spin' : ''} />
            <span>Refresh</span>
          </button>
          {unreadCount > 0 && (
            <button
              className="btn btn-primary notif-btn-sm"
              onClick={handleReadAll}
              disabled={loading}
            >
              <CheckCheck size={15} />
              <span>Tandai Semua Dibaca</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="notif-tabs">
        {TABS.map(t => (
          <button
            key={t.key}
            className={`notif-tab ${tab === t.key ? 'notif-tab-active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
            {t.key === 'unread' && unreadCount > 0 && (
              <span className="notif-tab-count">{unreadCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="notif-list-wrap glass-panel" style={{ marginTop: '1.5rem' }}>
        {loading && items.length === 0 ? (
          <div className="notif-empty">
            <div className="notif-loading-spinner" />
            <p>Memuat notifikasi...</p>
          </div>
        ) : error ? (
          <div className="notif-empty notif-empty-error">
            <AlertCircle size={40} style={{ color: 'var(--pk-danger)', opacity: 0.7 }} />
            <p style={{ color: 'var(--pk-danger)' }}>{error}</p>
            <button className="btn btn-outline notif-btn-sm" onClick={() => fetchNotifikasi(page)}>
              <RefreshCw size={15} /> Coba Lagi
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="notif-empty">
            <BellOff size={48} style={{ opacity: 0.3 }} />
            <p style={{ fontSize: '1rem', fontWeight: 500 }}>
              {tab === 'unread' ? 'Tidak ada notifikasi yang belum dibaca' :
               tab === 'read'   ? 'Belum ada notifikasi yang sudah dibaca' :
               'Belum ada notifikasi'}
            </p>
            <p style={{ fontSize: '0.85rem' }}>
              Notifikasi pengingat jadwal distribusi akan muncul di sini
            </p>
          </div>
        ) : (
          <>
            <div className="notif-list">
              {filtered.map(notif => (
                <NotifikasiCard
                  key={notif.id}
                  notif={notif}
                  onRead={handleRead}
                  onDelete={handleDelete}
                  processing={actionId === notif.id}
                />
              ))}
            </div>

            {/* Pagination */}
            {meta && meta.last_page > 1 && (
              <div className="notif-pagination">
                <button
                  className="notif-page-btn"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="notif-page-info">
                  Halaman {meta.current_page} / {meta.last_page}
                </span>
                <button
                  className="notif-page-btn"
                  onClick={() => setPage(p => Math.min(meta.last_page, p + 1))}
                  disabled={page >= meta.last_page}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Info panel */}
      <div className="notif-info-panel glass-panel" style={{ marginTop: '1.5rem' }}>
        <h4 style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Bell size={16} style={{ color: 'var(--pk-primary)' }} />
          Jadwal Pengiriman Pengingat Otomatis
        </h4>
        <div className="notif-schedule-grid">
          <div className="notif-schedule-item notif-schedule-info">
            <span className="notif-schedule-day">Tgl 1</span>
            <div>
              <p style={{ fontWeight: 600, color: 'var(--pk-text)', marginBottom: 0 }}>Pengingat Awal Periode</p>
              <p style={{ fontSize: '0.8rem' }}>Distribusi bantuan bulan ini telah dimulai</p>
            </div>
          </div>
          <div className="notif-schedule-item notif-schedule-warning">
            <span className="notif-schedule-day">Tgl 8</span>
            <div>
              <p style={{ fontWeight: 600, color: 'var(--pk-text)', marginBottom: 0 }}>Pengingat Tengah</p>
              <p style={{ fontSize: '0.8rem' }}>Jika distribusi bulan ini belum tercatat</p>
            </div>
          </div>
          <div className="notif-schedule-item notif-schedule-danger">
            <span className="notif-schedule-day">Tgl 15</span>
            <div>
              <p style={{ fontWeight: 600, color: 'var(--pk-text)', marginBottom: 0 }}>Peringatan Akhir</p>
              <p style={{ fontSize: '0.8rem' }}>Peringatan keras jika masih belum ada catatan</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifikasi;
