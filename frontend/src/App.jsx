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
import ReportPage from './pages/ReportPage';

// Pages from Main (Sprint 2/3)
import PenyaluranBantuan from './pages/PenyaluranBantuan';
import PembaruanStatus from './pages/PembaruanStatus';
import ApprovalPenyaluran from './pages/ApprovalPenyaluran';
import StatusGizi from './pages/StatusGizi';
import KIA from './pages/KIA';
import DistribusiPangan from './pages/DistribusiPangan';
import KinerjaPetugas from './pages/KinerjaPetugas';
import KunjunganRumah from './pages/KunjunganRumah';
import DashboardKPI from './pages/DashboardKPI';
import EvaluasiCapaian from './pages/EvaluasiCapaian';
import PetaSebaran from './pages/PetaSebaran';

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
              <ProtectedRoute allowedRoles={['admin']}>
                <PetaSebaran />
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