import React, { useState } from 'react';
import { Send, Clock, RotateCcw, MessageSquare } from 'lucide-react';

const programOptions = [
  { id: 1, name: 'Food Aid', currentQuota: 1000 },
  { id: 2, name: 'Health Support', currentQuota: 500 },
  { id: 3, name: 'Education', currentQuota: 800 }
];

const dummyHistory = [
  { id: 1, date: '2026-03-25', program: 'Food Aid', amount: 500, justification: 'Increased demand in region', status: 'Pending' },
  { id: 2, date: '2026-03-20', program: 'Health Support', amount: 300, justification: 'New beneficiaries registered', status: 'Approved' },
  { id: 3, date: '2026-03-15', program: 'Education', amount: 200, justification: 'Insufficient quota', status: 'Rejected' }
];

const PermintaanKuota = () => {
  const [selectedProgram, setSelectedProgram] = useState('');
  const [requestedQuota, setRequestedQuota] = useState('');
  const [justification, setJustification] = useState('');
  const [history, setHistory] = useState(dummyHistory);

  const selectedProgramData = programOptions.find(p => p.id === parseInt(selectedProgram));
  const currentQuota = selectedProgramData ? selectedProgramData.currentQuota : '';
  const totalAfter = (selectedProgramData && requestedQuota) ? (parseInt(currentQuota) + parseInt(requestedQuota)) : '';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedProgram || !requestedQuota || !justification) return;

    const newRequest = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      program: selectedProgramData.name,
      amount: parseInt(requestedQuota),
      justification,
      status: 'Pending'
    };

    setHistory([newRequest, ...history]);
    handleReset();
  };

  const handleReset = () => {
    setSelectedProgram('');
    setRequestedQuota('');
    setJustification('');
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Approved': return <span className="badge badge-success">Approved</span>;
      case 'Rejected': return <span className="badge badge-danger">Rejected</span>;
      default: return <span className="badge badge-warning">Pending</span>;
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ margin: 0 }}>Permintaan Kuota</h2>
        <p>Ajukan kuota program tambahan</p>
      </div>

      <div className="glass-panel" style={{ marginBottom: '2rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '1.25rem' }}>
          <MessageSquare size={20} /> Ajukan Permintaan Kuota
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2">
            <div className="form-group">
              <label className="form-label">Program*</label>
              <select 
                className="form-control" 
                value={selectedProgram} 
                onChange={(e) => setSelectedProgram(e.target.value)}
                required
              >
                <option value="">Pilih program</option>
                {programOptions.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Kuota Saat Ini</label>
              <input 
                type="text" 
                className="form-control" 
                value={currentQuota} 
                disabled 
                placeholder="Masukkan kuota saat ini"
                style={{ background: 'rgba(255,255,255,0.02)' }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2">
            <div className="form-group">
              <label className="form-label">Kuota Tambahan yang Diminta*</label>
              <input 
                type="number" 
                className="form-control" 
                value={requestedQuota} 
                onChange={(e) => setRequestedQuota(e.target.value)}
                required 
                placeholder="Masukkan kuota tambahan yang diperlukan"
                min="1"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Total Setelah Persetujuan</label>
              <input 
                type="text" 
                className="form-control" 
                value={totalAfter} 
                disabled 
                style={{ background: 'rgba(255,255,255,0.02)' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Justifikasi*</label>
            <textarea 
              className="form-control" 
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              required 
              rows="3"
              placeholder="Jelaskan mengapa kuota tambahan diperlukan..."
            ></textarea>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button type="submit" className="btn btn-primary">
              <Send size={18} /> Ajukan Permintaan
            </button>
            <button type="button" className="btn btn-outline" onClick={handleReset}>
              <RotateCcw size={18} /> Reset
            </button>
          </div>
        </form>
      </div>

      <div className="glass-panel">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '1.25rem' }}>
          <Clock size={20} /> Riwayat Permintaan
        </h3>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Program</th>
                <th>Kuota Diminta</th>
                <th>Justifikasi</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.id}>
                  <td>{item.date}</td>
                  <td style={{ fontWeight: 500 }}>{item.program}</td>
                  <td>{item.amount}</td>
                  <td style={{ color: 'var(--pk-text-muted)' }}>{item.justification}</td>
                  <td>{getStatusBadge(item.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {history.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--pk-text-muted)' }}>
              Belum ada riwayat permintaan kuota.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PermintaanKuota;
