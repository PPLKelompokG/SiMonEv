import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import distribusiPanganService from '../api/distribusiPanganService';
import { 
  ShoppingBag, Search, Plus, CheckCircle, AlertCircle, 
  FolderOpen, Calendar, MapPin, Truck, Trash2, 
  User, Edit, Info, X, BarChart3 
} from 'lucide-react';

const DistribusiPangan = () => {
  const [distribusiList, setDistribusiList] = useState([]);
  const [statistik, setStatistik] = useState(null);
  const [penerimaList, setPenerimaList] = useState([]);
  const [komoditasList, setKomoditasList] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDistribusi, setSelectedDistribusi] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Form State
  const initialFormState = {
    penerima_bantuan_id: '',
    tanggal_distribusi: new Date().toISOString().split('T')[0],
    periode_bulan: new Date().toISOString().slice(0, 7), // YYYY-MM
    metode_distribusi: 'langsung',
    lokasi_distribusi: '',
    catatan: '',
    items: [
      { jenis_komoditas: 'beras', kuantitas: '', satuan: 'kg', keterangan: '' }
    ]
  };
  
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resDist, resStat, resPen, resKom] = await Promise.all([
        distribusiPanganService.getAll(),
        distribusiPanganService.getStatistik(),
        distribusiPanganService.getPenerimaDisetujui(),
        distribusiPanganService.getKomoditas()
      ]);

      setDistribusiList(resDist.data.data);
      setStatistik(resStat.data.data);
      setPenerimaList(resPen.data.data);
      setKomoditasList(resKom.data.data);
    } catch (err) {
      console.error(err);
      setError('Gagal memuat data. Pastikan koneksi ke server baik.');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (msg, type = 'success') => {
    if (type === 'success') {
      setMessage(msg);
      setTimeout(() => setMessage(null), 3000);
    } else {
      setError(msg);
      setTimeout(() => setError(null), 3000);
    }
  };

  // Form Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    
    // Auto-update satuan if komoditas changes
    if (field === 'jenis_komoditas') {
      const selectedKomoditas = komoditasList.find(k => k.value === value);
      if (selectedKomoditas) {
        newItems[index]['satuan'] = selectedKomoditas.satuan;
      }
    }
    
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { jenis_komoditas: 'beras', kuantitas: '', satuan: 'kg', keterangan: '' }]
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length <= 1) return;
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const openAddForm = () => {
    setFormData(initialFormState);
    setIsEditMode(false);
    setIsFormModalOpen(true);
    setError(null);
  };

  const openEditForm = (distribusi) => {
    setFormData({
      id: distribusi.id,
      penerima_bantuan_id: distribusi.penerima_bantuan_id,
      tanggal_distribusi: distribusi.tanggal_distribusi,
      periode_bulan: distribusi.periode_bulan,
      metode_distribusi: distribusi.metode_distribusi,
      lokasi_distribusi: distribusi.lokasi_distribusi || '',
      catatan: distribusi.catatan || '',
      items: distribusi.items.map(item => ({
        id: item.id,
        jenis_komoditas: item.jenis_komoditas,
        kuantitas: item.kuantitas,
        satuan: item.satuan,
        keterangan: item.keterangan || ''
      }))
    });
    setIsEditMode(true);
    setIsFormModalOpen(true);
    setIsDetailModalOpen(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data distribusi ini?')) return;
    
    try {
      await distribusiPanganService.delete(id);
      showMessage('Data distribusi berhasil dihapus');
      fetchData();
      setIsDetailModalOpen(false);
    } catch (err) {
      showMessage(err.response?.data?.message || 'Gagal menghapus data', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validasi sederhana
    if (!formData.penerima_bantuan_id) {
      setError('Pilih penerima bantuan terlebih dahulu');
      return;
    }
    
    const invalidItems = formData.items.filter(item => !item.kuantitas || item.kuantitas <= 0);
    if (invalidItems.length > 0) {
      setError('Pastikan semua item memiliki kuantitas yang valid (lebih dari 0)');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      if (isEditMode) {
        await distribusiPanganService.update(formData.id, formData);
        showMessage('Data distribusi berhasil diperbarui');
      } else {
        await distribusiPanganService.create(formData);
        showMessage('Data distribusi berhasil dicatat');
      }
      setIsFormModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Terjadi kesalahan saat menyimpan data');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredList = distribusiList.filter(item => 
    item.penerimaBantuan?.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.penerimaBantuan?.nik?.includes(searchTerm) ||
    item.periode_bulan?.includes(searchTerm)
  );

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--pk-text)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShoppingBag size={28} color="var(--pk-primary)" />
            Distribusi Pangan
          </h1>
          <p style={{ color: 'var(--pk-text-muted)', margin: 0 }}>
            Pencatatan dan pemantauan distribusi komoditas pangan dasar
          </p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={openAddForm}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)' }}
        >
          <Plus size={18} />
          Catat Distribusi Baru
        </button>
      </div>

      {message && (
        <div className="alert alert-success animate-slide-up" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)' }}>
          <CheckCircle size={20} />
          <span style={{ fontWeight: 500 }}>{message}</span>
        </div>
      )}

      {error && !isFormModalOpen && (
        <div className="alert alert-danger animate-slide-up" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)' }}>
          <AlertCircle size={20} />
          <span style={{ fontWeight: 500 }}>{error}</span>
        </div>
      )}

      {/* Statistics Cards */}
      {statistik && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid var(--pk-primary)' }}>
            <div style={{ color: 'var(--pk-text-muted)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Total Distribusi</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--pk-text)' }}>{statistik.total_distribusi}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--pk-text-muted)', marginTop: '0.25rem' }}>Catatan penyaluran</div>
          </div>
          
          <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid #10b981' }}>
            <div style={{ color: 'var(--pk-text-muted)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Penerima Aktif</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--pk-text)' }}>{statistik.total_penerima_aktif}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--pk-text-muted)', marginTop: '0.25rem' }}>Keluarga penerima manfaat</div>
          </div>
          
          <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid #f59e0b' }}>
            <div style={{ color: 'var(--pk-text-muted)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Distribusi Bulan Ini</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--pk-text)' }}>{statistik.distribusi_bulan_ini}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--pk-text-muted)', marginTop: '0.25rem' }}>Periode: {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--pk-glass-border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart3 size={20} color="var(--pk-primary)" />
            Riwayat Distribusi Pangan
          </h3>
          <div className="search-bar" style={{ position: 'relative', width: '300px' }}>
            <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--pk-text-muted)' }} />
            <input 
              type="text" 
              placeholder="Cari penerima atau NIK..." 
              className="form-control" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.5rem', borderRadius: '2rem', background: 'var(--pk-bg)', padding: '0.5rem 2.5rem', height: '36px' }} 
            />
          </div>
        </div>
        
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 0', color: 'var(--pk-primary)' }}>
            <div className="spinner" style={{ borderTopColor: 'var(--pk-primary)', margin: '0 auto 1rem' }}></div>
            <p>Memuat data distribusi...</p>
          </div>
        ) : filteredList.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Periode / Tanggal</th>
                  <th>Penerima</th>
                  <th>Komoditas (Ringkasan)</th>
                  <th>Metode</th>
                  <th style={{ textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.map((item) => (
                  <tr key={item.id} className="animate-fade-in">
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--pk-text)' }}>{item.periode_bulan}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--pk-text-muted)' }}>
                        {new Date(item.tanggal_distribusi).toLocaleDateString('id-ID', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--pk-text)' }}>{item.penerimaBantuan?.nama}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--pk-text-muted)' }}>NIK: {item.penerimaBantuan?.nik}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                        {item.items?.map((it, idx) => (
                          <span key={idx} className="badge" style={{ background: 'var(--pk-bg-secondary)', color: 'var(--pk-primary)', fontSize: '0.75rem' }}>
                            {komoditasList.find(k => k.value === it.jenis_komoditas)?.label || it.jenis_komoditas} 
                            ({it.kuantitas} {it.satuan})
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span className="badge" style={{ 
                        background: item.metode_distribusi === 'langsung' ? 'rgba(16, 185, 129, 0.1)' : 
                                    item.metode_distribusi === 'dikirim' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                        color: item.metode_distribusi === 'langsung' ? '#10b981' : 
                               item.metode_distribusi === 'dikirim' ? '#3b82f6' : '#f59e0b',
                        textTransform: 'capitalize'
                      }}>
                        {item.metode_distribusi}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button 
                        onClick={() => {
                          setSelectedDistribusi(item);
                          setIsDetailModalOpen(true);
                        }}
                        className="btn btn-outline"
                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                      >
                        <Info size={14} /> Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--pk-text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--pk-bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <FolderOpen size={32} style={{ opacity: 0.5, color: 'var(--pk-primary)' }} />
            </div>
            <p style={{ margin: 0, fontWeight: 500 }}>Belum ada data distribusi</p>
            <p style={{ fontSize: '0.875rem', marginTop: '0.5rem', opacity: 0.8 }}>Gunakan tombol 'Catat Distribusi Baru' untuk menambahkan.</p>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {isFormModalOpen && createPortal(
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
            maxWidth: '800px', 
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)',
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
                {isEditMode ? 'Edit Distribusi Pangan' : 'Catat Distribusi Pangan Baru'}
              </h3>
              <button 
                onClick={() => setIsFormModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--pk-text-muted)' }}
              >
                <X size={24} />
              </button>
            </div>
            
            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
              {error && (
                <div className="alert alert-danger" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem', borderRadius: '12px' }}>
                  <AlertCircle size={20} />
                  <span style={{ fontWeight: 500 }}>{error}</span>
                </div>
              )}

              <form id="distribusi-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                {/* Bagian 1: Info Utama */}
                <div style={{ background: 'var(--pk-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--pk-glass-border)' }}>
                  <h4 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--pk-text)', fontSize: '1.1rem' }}>
                    <User size={18} color="var(--pk-primary)" /> Informasi Penerima & Waktu
                  </h4>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label className="form-label" style={{ fontWeight: 600 }}>Penerima Bantuan <span style={{color: 'var(--pk-danger)'}}>*</span></label>
                      <select 
                        className="form-control" 
                        name="penerima_bantuan_id" 
                        value={formData.penerima_bantuan_id} 
                        onChange={handleInputChange} 
                        required
                        style={{ background: 'var(--pk-bg-2)' }}
                      >
                        <option value="">-- Pilih Penerima (Disetujui) --</option>
                        {penerimaList.map(p => (
                          <option key={p.id} value={p.id}>{p.nik} - {p.nama}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="form-label" style={{ fontWeight: 600 }}>Tanggal Distribusi <span style={{color: 'var(--pk-danger)'}}>*</span></label>
                      <input 
                        type="date" 
                        className="form-control" 
                        name="tanggal_distribusi" 
                        value={formData.tanggal_distribusi} 
                        onChange={handleInputChange} 
                        required
                        style={{ background: 'var(--pk-bg-2)' }}
                      />
                    </div>

                    <div>
                      <label className="form-label" style={{ fontWeight: 600 }}>Periode Bulan <span style={{color: 'var(--pk-danger)'}}>*</span></label>
                      <input 
                        type="month" 
                        className="form-control" 
                        name="periode_bulan" 
                        value={formData.periode_bulan} 
                        onChange={handleInputChange} 
                        required
                        style={{ background: 'var(--pk-bg-2)' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Bagian 2: Item Komoditas */}
                <div style={{ background: 'var(--pk-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--pk-glass-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--pk-text)', fontSize: '1.1rem' }}>
                      <ShoppingBag size={18} color="var(--pk-primary)" /> Detail Komoditas Pangan <span style={{color: 'var(--pk-danger)'}}>*</span>
                    </h4>
                    <button 
                      type="button" 
                      onClick={addItem}
                      className="btn btn-outline"
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                    >
                      <Plus size={14} /> Tambah Item
                    </button>
                  </div>

                  {formData.items.map((item, index) => (
                    <div key={index} style={{ 
                      display: 'flex', gap: '1rem', alignItems: 'flex-start', 
                      background: 'var(--pk-bg-2)', padding: '1rem', borderRadius: '8px', 
                      marginBottom: '1rem', border: '1px solid var(--pk-glass-border)' 
                    }}>
                      <div style={{ flex: 2 }}>
                        <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Komoditas</label>
                        <select 
                          className="form-control" 
                          value={item.jenis_komoditas} 
                          onChange={(e) => handleItemChange(index, 'jenis_komoditas', e.target.value)} 
                          required
                        >
                          {komoditasList.map(k => (
                            <option key={k.value} value={k.value}>{k.label}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div style={{ flex: 1 }}>
                        <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Kuantitas</label>
                        <input 
                          type="number" 
                          step="0.01"
                          min="0.1"
                          className="form-control" 
                          value={item.kuantitas} 
                          onChange={(e) => handleItemChange(index, 'kuantitas', e.target.value)} 
                          required
                          placeholder="0.00"
                        />
                      </div>

                      <div style={{ flex: 1 }}>
                        <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Satuan</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          value={item.satuan} 
                          readOnly
                          style={{ background: 'rgba(0,0,0,0.1)', cursor: 'not-allowed' }}
                        />
                      </div>

                      <button 
                        type="button" 
                        onClick={() => removeItem(index)}
                        disabled={formData.items.length <= 1}
                        style={{ 
                          marginTop: '1.7rem',
                          background: 'rgba(239, 68, 68, 0.1)', 
                          color: 'var(--pk-danger)', 
                          border: 'none', 
                          padding: '0.5rem', 
                          borderRadius: '8px', 
                          cursor: formData.items.length <= 1 ? 'not-allowed' : 'pointer',
                          opacity: formData.items.length <= 1 ? 0.5 : 1
                        }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Bagian 3: Pelaksanaan */}
                <div style={{ background: 'var(--pk-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--pk-glass-border)' }}>
                  <h4 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--pk-text)', fontSize: '1.1rem' }}>
                    <Truck size={18} color="var(--pk-primary)" /> Pelaksanaan Distribusi
                  </h4>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label className="form-label" style={{ fontWeight: 600 }}>Metode Distribusi</label>
                      <select 
                        className="form-control" 
                        name="metode_distribusi" 
                        value={formData.metode_distribusi} 
                        onChange={handleInputChange}
                        style={{ background: 'var(--pk-bg-2)' }}
                      >
                        <option value="langsung">Diambil Langsung (oleh Penerima)</option>
                        <option value="perwakilan">Diwakilkan (Keluarga/Kerabat)</option>
                        <option value="dikirim">Dikirim ke Rumah (Delivery)</option>
                      </select>
                    </div>

                    <div>
                      <label className="form-label" style={{ fontWeight: 600 }}>Lokasi Distribusi <span style={{color: 'var(--pk-text-muted)', fontSize: '0.8rem', fontWeight: 'normal'}}>(Opsional)</span></label>
                      <input 
                        type="text" 
                        className="form-control" 
                        name="lokasi_distribusi" 
                        value={formData.lokasi_distribusi} 
                        onChange={handleInputChange} 
                        placeholder="Contoh: Balai Desa, Rumah Penerima..."
                        style={{ background: 'var(--pk-bg-2)' }}
                      />
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                      <label className="form-label" style={{ fontWeight: 600 }}>Catatan Khusus <span style={{color: 'var(--pk-text-muted)', fontSize: '0.8rem', fontWeight: 'normal'}}>(Opsional)</span></label>
                      <textarea 
                        className="form-control" 
                        name="catatan" 
                        value={formData.catatan} 
                        onChange={handleInputChange} 
                        rows="2"
                        placeholder="Tambahkan keterangan jika perlu..."
                        style={{ background: 'var(--pk-bg-2)', resize: 'vertical' }}
                      ></textarea>
                    </div>
                  </div>
                </div>

              </form>
            </div>
            
            <div style={{ 
              padding: '1.25rem 1.5rem', 
              borderTop: '1px solid var(--pk-glass-border)',
              display: 'flex', 
              justifyContent: 'flex-end', 
              gap: '1rem',
              background: 'var(--pk-bg)'
            }}>
              <button 
                type="button" 
                className="btn btn-outline" 
                onClick={() => setIsFormModalOpen(false)}
                disabled={submitting}
              >
                Batal
              </button>
              <button 
                type="submit" 
                form="distribusi-form"
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
                  <><CheckCircle size={18} /> {isEditMode ? 'Simpan Perubahan' : 'Simpan Distribusi'}</>
                )}
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}

      {/* Detail Modal */}
      {isDetailModalOpen && selectedDistribusi && createPortal(
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
            maxWidth: '600px', 
            padding: 0, 
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)',
            margin: '1rem',
            background: 'var(--pk-bg-2)',
            borderRadius: 'var(--pk-radius)'
          }}>
            <div style={{ 
              padding: '1.5rem', 
              borderBottom: '1px solid var(--pk-glass-border)', 
              background: 'linear-gradient(to right, rgba(59, 130, 246, 0.05), transparent)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem' }}>
                <div style={{ width: '8px', height: '24px', background: 'var(--pk-primary)', borderRadius: '4px' }}></div>
                Detail Distribusi Pangan
              </h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  onClick={() => openEditForm(selectedDistribusi)}
                  style={{ background: 'rgba(59, 130, 246, 0.1)', border: 'none', cursor: 'pointer', color: '#3b82f6', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title="Edit"
                >
                  <Edit size={16} />
                </button>
                <button 
                  onClick={() => setIsDetailModalOpen(false)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--pk-text-muted)', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div style={{ padding: '1.5rem', maxHeight: '70vh', overflowY: 'auto' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', background: 'var(--pk-bg)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--pk-glass-border)' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--pk-text-muted)', marginBottom: '0.2rem' }}>Penerima</div>
                  <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{selectedDistribusi.penerimaBantuan?.nama}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--pk-text-muted)' }}>NIK: {selectedDistribusi.penerimaBantuan?.nik}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--pk-text-muted)', marginBottom: '0.2rem' }}>Periode</div>
                  <div style={{ fontWeight: 600, color: 'var(--pk-primary)' }}>{selectedDistribusi.periode_bulan}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--pk-text-muted)' }}>
                    {new Date(selectedDistribusi.tanggal_distribusi).toLocaleDateString('id-ID', {
                      day: 'numeric', month: 'long', year: 'numeric'
                    })}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', color: 'var(--pk-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Komoditas yang Diberikan
                </h4>
                <div style={{ border: '1px solid var(--pk-glass-border)', borderRadius: '8px', overflow: 'hidden' }}>
                  <table style={{ margin: 0 }}>
                    <thead style={{ background: 'var(--pk-bg)' }}>
                      <tr>
                        <th style={{ padding: '0.75rem 1rem', fontSize: '0.85rem' }}>Jenis Komoditas</th>
                        <th style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', textAlign: 'right' }}>Kuantitas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedDistribusi.items?.map((item, idx) => (
                        <tr key={idx} style={{ borderTop: '1px solid var(--pk-glass-border)' }}>
                          <td style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>
                            {komoditasList.find(k => k.value === item.jenis_komoditas)?.label || item.jenis_komoditas}
                          </td>
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: 'var(--pk-primary)' }}>
                            {item.kuantitas} {item.satuan}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--pk-text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.2rem' }}>
                    <Truck size={14} /> Metode Distribusi
                  </div>
                  <div style={{ fontWeight: 500, textTransform: 'capitalize' }}>{selectedDistribusi.metode_distribusi}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--pk-text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.2rem' }}>
                    <MapPin size={14} /> Lokasi
                  </div>
                  <div style={{ fontWeight: 500 }}>{selectedDistribusi.lokasi_distribusi || '-'}</div>
                </div>
              </div>

              {selectedDistribusi.catatan && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--pk-text-muted)', marginBottom: '0.5rem' }}>Catatan</div>
                  <div style={{ 
                    background: 'var(--pk-bg)', 
                    padding: '1rem', 
                    borderRadius: '8px', 
                    border: '1px solid var(--pk-glass-border)',
                    fontSize: '0.9rem',
                    lineHeight: '1.5'
                  }}>
                    {selectedDistribusi.catatan}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--pk-glass-border)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--pk-text-muted)' }}>
                  Dicatat oleh: <span style={{ fontWeight: 500, color: 'var(--pk-text)' }}>{selectedDistribusi.petugas?.name}</span>
                </div>
                <button 
                  type="button" 
                  onClick={() => handleDelete(selectedDistribusi.id)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--pk-danger)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 500 }}
                >
                  <Trash2 size={16} /> Hapus Data
                </button>
              </div>

            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default DistribusiPangan;
