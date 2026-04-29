import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import PenerimaBantuan from './pages/PenerimaBantuan';
import Verifikasi from './pages/Verifikasi';
import ProgramBantuan from './pages/ProgramBantuan';
import ManajemenDataKeluarga from './pages/ManajemenDataKeluarga';
import PermintaanKuota from './pages/PermintaanKuota';
import PenyaluranBantuan from './pages/PenyaluranBantuan';
import PembaruanStatus from './pages/PembaruanStatus';
import ApprovalPenyaluran from './pages/ApprovalPenyaluran';
import StatusGizi from './pages/StatusGizi';
import Kia from './pages/Kia';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            
            <Route path="users" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <UserManagement />
              </ProtectedRoute>
            } />
            
            <Route path="program-bantuan" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ProgramBantuan />
              </ProtectedRoute>
            } />
            
            <Route path="penerima-bantuan" element={<PenerimaBantuan />} />
            <Route path="manajemen-data-keluarga" element={<ManajemenDataKeluarga />} />
            <Route path="permintaan-kuota" element={<PermintaanKuota />} />
            
            <Route path="verifikasi" element={
              <ProtectedRoute allowedRoles={['admin', 'supervisor']}>
                <Verifikasi />
              </ProtectedRoute>
            } />

            <Route path="approval-penyaluran" element={
              <ProtectedRoute allowedRoles={['admin', 'supervisor']}>
                <ApprovalPenyaluran />
              </ProtectedRoute>
            } />

            <Route path="penyaluran-bantuan" element={
              <ProtectedRoute allowedRoles={['admin', 'petugas_lapangan']}>
                <PenyaluranBantuan />
              </ProtectedRoute>
            } />

            <Route path="pembaruan-status" element={
              <ProtectedRoute allowedRoles={['admin', 'petugas_lapangan']}>
                <PembaruanStatus />
              </ProtectedRoute>
            } />
            
            <Route path="status-gizi" element={
              <ProtectedRoute allowedRoles={['admin', 'petugas_lapangan', 'supervisor']}>
                <StatusGizi />
              </ProtectedRoute>
            } />
            
            <Route path="kia" element={
              <ProtectedRoute allowedRoles={['admin', 'petugas_lapangan', 'supervisor']}>
                <Kia />
              </ProtectedRoute>
            } />
          </Route>
          
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
