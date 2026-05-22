import React, { useState, useEffect } from 'react';
import api from '../api';
import { CheckSquare, XSquare, CheckCircle } from 'lucide-react';

const Verifikasi = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifyModal, setVerifyModal] = useState(null);
  const [catatan, setCatatan] = useState('');
  const [statusAction, setStatusAction] = useState('disetujui');

  const fetchPending = async () => {
    try {
      setLoading(true);
      const res = await api.get('/verifikasi/pending');
      setData(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/verifikasi/${verifyModal.id}`, {
        status: statusAction,
        catatan_verifikasi: catatan
      });
      setVerifyModal(null);
      fetchPending();
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan verifikasi');
    }
  };

  const openVerify = (item, actionIsApproved) => {
    setVerifyModal(item);
    setStatusAction(actionIsApproved ? 'disetujui' : 'ditolak');
    setCatatan('');
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ margin: 0 }}>Verifikasi Data Penerima</h2>
        <p>Tinjau dan proses data pendaftaran baru</p>
      </div>

      <div className="glass-panel">
        <h3 style={{ borderBottom: '1px solid var(--pk-glass-border)', paddingBottom: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={20} color="var(--pk-warning)" />
          Menunggu Verifikasi
        </h3>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>NIK</th>
                  <th>Nama Lengkap</th>
                  <th>Kondisi Ekonomi</th>
                  <th>Tanggungan</th>
                  <th>Aksi Verifikasi</th>
                </tr>
              </thead>
              <tbody>
                {data.map(item => (
                  <tr key={item.id}>
                    <td>{item.nik}</td>
                    <td>{item.nama}</td>
                    <td>{item.kondisi_ekonomi}</td>
                    <td>{item.jumlah_tanggungan} orang</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-success" style={{ padding: '0.4rem 0.6rem' }} onClick={() => openVerify(item, true)}>
                          <CheckSquare size={16} /> Setuju
                        </button>
                        <button className="btn btn-danger" style={{ padding: '0.4rem 0.6rem' }} onClick={() => openVerify(item, false)}>
                          <XSquare size={16} /> Tolak
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr><td colSpan="5" style={{ textAlign:'center', padding: '2rem' }}>Semua pendaftaran telah diverifikasi.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {verifyModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, backdropFilter: 'blur(4px)' }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '500px', background: 'var(--pk-bg-secondary)' }}>
            <h3 style={{ marginBottom: '1.5rem', color: statusAction === 'disetujui' ? 'var(--pk-success)' : 'var(--pk-danger)' }}>
              Konfirmasi {statusAction === 'disetujui' ? 'Persetujuan' : 'Penolakan'}
            </h3>
            <div style={{ marginBottom: '1.5rem', background: 'var(--pk-highlight)', padding: '1rem', borderRadius: '8px' }}>
              <p style={{ margin: '0 0 0.5rem 0' }}><strong>Data Pemohon:</strong></p>
              <p style={{ margin: 0 }}>Nama: {verifyModal.nama}</p>
              <p style={{ margin: 0 }}>NIK: {verifyModal.nik}</p>
            </div>
            
            <form onSubmit={handleVerifySubmit}>
              <div className="form-group">
                <label className="form-label">Catatan Verifikasi (Opsional)</label>
                <textarea className="form-control" rows={4} value={catatan} onChange={e => setCatatan(e.target.value)} placeholder="Berikan alasan jika diperlukan..."></textarea>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setVerifyModal(null)}>Batal</button>
                <button type="submit" className={`btn ${statusAction === 'disetujui' ? 'btn-success' : 'btn-danger'}`}>
                  {statusAction === 'disetujui' ? 'Setujui Registrasi' : 'Tolak Registrasi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Verifikasi;
