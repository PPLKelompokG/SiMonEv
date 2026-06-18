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
import PermintaanKuota from './pages/PermintaanKuota';
import ReportPage from './pages/ReportPage';
import Profile from './pages/Profile';
import ManajemenDataKeluarga from './pages/ManajemenDataKeluarga';

// Pages from Main (Sprint 2/3)
import PenyaluranBantuan from './pages/PenyaluranBantuan';
import PembaruanStatus from './pages/PembaruanStatus';
import ApprovalPenyaluran from './pages/ApprovalPenyaluran';
import StatusGizi from './pages/StatusGizi';
import KIA from './pages/Kia';
import DistribusiPangan from './pages/DistribusiPangan';
import KinerjaPetugas from './pages/KinerjaPetugas';
import KunjunganRumah from './pages/KunjunganRumah';
import DashboardKPI from './pages/DashboardKPI';
import EvaluasiCapaian from './pages/EvaluasiCapaian';
import PetaSebaran from './pages/PetaSebaran';
import RiwayatBantuan from './pages/RiwayatBantuan';

import LandingPage from './pages/LandingPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
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

            <Route path="permintaan-kuota" element={
              <ProtectedRoute allowedRoles={['admin', 'petugas_lapangan']}>
                <PermintaanKuota />
              </ProtectedRoute>
            } />

            <Route path="profile" element={<Profile />} />

            <Route path="penerima-bantuan" element={<PenerimaBantuan />} />
            <Route path="manajemen-data-keluarga" element={<ManajemenDataKeluarga />} />

            <Route path="verifikasi" element={
              <ProtectedRoute allowedRoles={['admin', 'supervisor']}>
                <Verifikasi />
              </ProtectedRoute>
            } />

            {/* PBI-06 Laporan */}
            <Route path="laporan" element={<ReportPage />} />

            {/* Routes from Main Branch */}
            <Route path="penyaluran-bantuan" element={<PenyaluranBantuan />} />
            <Route path="pembaruan-status" element={<PembaruanStatus />} />
            
            <Route path="approval-penyaluran" element={
              <ProtectedRoute allowedRoles={['admin', 'supervisor']}>
                <ApprovalPenyaluran />
              </ProtectedRoute>
            } />

            <Route path="status-gizi" element={<StatusGizi />} />
            <Route path="kia" element={<KIA />} />
            <Route path="distribusi-pangan" element={<DistribusiPangan />} />
            <Route path="kinerja-petugas" element={<KinerjaPetugas />} />
            <Route path="kunjungan-rumah" element={<KunjunganRumah />} />

            {/* Dashboard KPI Kemiskinan */}
            <Route path="dashboard-kpi" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardKPI />
              </ProtectedRoute>
            } />

            {/* Evaluasi Capaian Program */}
            <Route path="evaluasi-capaian" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <EvaluasiCapaian />
              </ProtectedRoute>
            } />

            {/* Peta Sebaran Penerima */}
            <Route path="peta-sebaran" element={
              <ProtectedRoute allowedRoles={['admin', 'supervisor', 'petugas_lapangan']}>
                <PetaSebaran />
              </ProtectedRoute>
            } />

            {/* PBI-19 Riwayat & Histori Bantuan per Penerima */}
            <Route path="riwayat-bantuan" element={<RiwayatBantuan />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;