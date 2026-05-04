import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import {
  TrendingUp, TrendingDown, DollarSign, Users, Target, Award,
  BarChart3, Activity, RefreshCw, Calendar, ArrowUpRight, ArrowDownRight,
  Zap, PieChart as PieChartIcon, Layers
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, ComposedChart, Line
} from 'recharts';

/* ───── helper: format rupiah ───── */
const formatRupiah = (value) => {
  if (value == null) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR',
    minimumFractionDigits: 0, maximumFractionDigits: 0
  }).format(value);
};

/* ───── helper: format number ───── */
const formatNumber = (value) => {
  if (value == null) return '0';
  return new Intl.NumberFormat('id-ID').format(value);
};

/* ───── helper: month name ───── */
const getMonthName = (monthStr) => {
  if (!monthStr) return '';
  const [year, month] = monthStr.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  return `${months[parseInt(month) - 1]} ${year.slice(2)}`;
};

/* ───── color palette ───── */
const COLORS = {
  primary: '#818cf8',
  secondary: '#c084fc',
  success: '#34d399',
  warning: '#fbbf24',
  danger: '#f87171',
  info: '#38bdf8',
  cyan: '#22d3ee',
  rose: '#fb7185',
  amber: '#f59e0b',
  emerald: '#10b981',
};

const PIE_COLORS = ['#818cf8', '#c084fc', '#34d399', '#fbbf24', '#f87171', '#38bdf8', '#22d3ee', '#fb7185'];

/* ───── custom tooltip ───── */
const CustomTooltip = ({ active, payload, label, formatter }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.95)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255,255,255,0.15)',
      borderRadius: '12px',
      padding: '0.875rem 1.125rem',
      boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
    }}>
      <p style={{ margin: 0, fontWeight: 600, color: '#f8fafc', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
        {label}
      </p>
      {payload.map((item, idx) => (
        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color }} />
          <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{item.name}:</span>
          <span style={{ color: '#f8fafc', fontWeight: 600, fontSize: '0.8rem' }}>
            {formatter ? formatter(item.value) : formatNumber(item.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   STAT CARD with sparkline indicator
   ═══════════════════════════════════════════════════ */
const KpiCard = ({ title, value, subtitle, icon, color, trend, trendLabel, delay = 0 }) => {
  const isPositive = trend >= 0;
  return (
    <div
      className="glass-panel"
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderLeft: `4px solid ${color}`,
        animation: `fadeIn 0.6s ease-out ${delay}s both`,
      }}
    >
      {/* Glow effect */}
      <div style={{
        position: 'absolute', top: '-30px', right: '-30px',
        width: '120px', height: '120px',
        background: `radial-gradient(circle, ${color}15, transparent 70%)`,
        borderRadius: '50%', pointerEvents: 'none'
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div style={{
          padding: '0.75rem', borderRadius: '14px',
          background: `${color}15`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {React.cloneElement(icon, { size: 24, color: color, strokeWidth: 2 })}
        </div>
        {trend !== undefined && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.25rem',
            padding: '0.3rem 0.65rem', borderRadius: '99px',
            fontSize: '0.75rem', fontWeight: 600,
            background: isPositive ? 'rgba(52, 211, 153, 0.15)' : 'rgba(248, 113, 113, 0.15)',
            color: isPositive ? COLORS.success : COLORS.danger,
          }}>
            {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>

      <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: 800, letterSpacing: '-1px', lineHeight: 1.1, color: '#f8fafc' }}>
        {value}
      </h2>
      <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>
        {title}
      </p>
      {subtitle && (
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#64748b' }}>
          {subtitle}
        </p>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   CHART CARD wrapper
   ═══════════════════════════════════════════════════ */
const ChartCard = ({ title, icon, children, style = {} }) => (
  <div className="glass-panel" style={{ ...style, animation: 'fadeIn 0.6s ease-out 0.3s both' }}>
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.75rem',
      marginBottom: '1.5rem', paddingBottom: '1rem',
      borderBottom: '1px solid rgba(255,255,255,0.08)'
    }}>
      <div style={{
        padding: '0.5rem', borderRadius: '10px',
        background: 'rgba(129, 140, 248, 0.1)',
      }}>
        {icon}
      </div>
      <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>{title}</h3>
    </div>
    {children}
  </div>
);


/* ═══════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════ */
const DashboardKPI = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const [statsRes, trendsRes] = await Promise.all([
        api.get('/dashboard-kpi/stats'),
        api.get('/dashboard-kpi/trends'),
      ]);

      setStats(statsRes.data.data);
      setTrends(trendsRes.data.data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Dashboard KPI fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  /* ───── Prepare chart data ───── */
  const pendaftaranData = trends?.pendaftaran?.map(item => ({
    bulan: getMonthName(item.bulan),
    'Penerima Baru': item.total_penerima,
  })) || [];

  const danaData = trends?.dana?.map(item => ({
    bulan: getMonthName(item.bulan),
    'Dana Tersalurkan': parseFloat(item.total_dana),
    'Jumlah Distribusi': item.total_distribusi,
  })) || [];

  const programData = trends?.program_breakdown?.map((item, idx) => ({
    name: item.kategori_sdg || 'Lainnya',
    value: item.total,
    color: PIE_COLORS[idx % PIE_COLORS.length],
  })) || [];

  /* status pie chart from stats */
  const statusPieData = stats ? [
    { name: 'Disetujui', value: stats.penerima_disetujui, color: COLORS.success },
    { name: 'Diajukan', value: stats.penerima_diajukan, color: COLORS.warning },
    { name: 'Ditolak', value: stats.penerima_ditolak, color: COLORS.danger },
  ].filter(d => d.value > 0) : [];

  /* ───── Loading state ───── */
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1.5rem' }}>
        <div style={{
          width: '60px', height: '60px', borderRadius: '50%',
          border: '3px solid rgba(129, 140, 248, 0.2)',
          borderTopColor: '#818cf8',
          animation: 'spin 0.8s linear infinite',
        }} />
        <p style={{ color: '#94a3b8', fontSize: '1rem', fontWeight: 500 }}>Memuat Dashboard KPI...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div id="dashboard-kpi-page">
      {/* ─── HEADER ─── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{
              padding: '0.6rem', borderRadius: '14px',
              background: 'linear-gradient(135deg, rgba(129,140,248,0.2), rgba(192,132,252,0.2))',
            }}>
              <Activity size={28} color="#818cf8" strokeWidth={2.5} />
            </div>
            <h1 style={{ margin: 0, fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
              Dashboard KPI <span style={{ color: '#818cf8' }}>Kemiskinan</span>
            </h1>
          </div>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.95rem' }}>
            Monitoring indikator kemiskinan & efektivitas program bantuan sosial
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {lastUpdated && (
            <span style={{ color: '#64748b', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Calendar size={14} />
              {lastUpdated.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button
            className="btn btn-outline"
            onClick={() => fetchData(true)}
            disabled={refreshing}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.1rem' }}
          >
            <RefreshCw size={16} className={refreshing ? 'spinning' : ''} style={refreshing ? { animation: 'spin 1s linear infinite' } : {}} />
            {refreshing ? 'Memuat...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* ─── KPI CARDS ─── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.25rem',
        marginBottom: '1.75rem',
      }}>
        <KpiCard
          title="Total Penerima Bantuan"
          value={formatNumber(stats?.total_penerima)}
          subtitle={`${formatNumber(stats?.penerima_disetujui)} disetujui`}
          icon={<Users />}
          color={COLORS.primary}
          delay={0}
        />
        <KpiCard
          title="Keberhasilan Program"
          value={`${stats?.tingkat_keberhasilan || 0}%`}
          subtitle={`${formatNumber(stats?.penerima_graduasi)} penerima graduasi`}
          icon={<Target />}
          color={COLORS.success}
          delay={0.1}
        />
        <KpiCard
          title="Total Dana Tersalurkan"
          value={formatRupiah(stats?.total_dana_tersalurkan)}
          subtitle={`${formatNumber(stats?.penyaluran_approved)} penyaluran berhasil`}
          icon={<DollarSign />}
          color={COLORS.cyan}
          delay={0.2}
        />
        <KpiCard
          title="Program Aktif"
          value={formatNumber(stats?.program_aktif)}
          subtitle={`dari ${formatNumber(stats?.total_program)} total program`}
          icon={<Layers />}
          color={COLORS.secondary}
          delay={0.3}
        />
      </div>

      {/* ─── SECONDARY KPI CARDS ─── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.25rem',
        marginBottom: '1.75rem',
      }}>
        <KpiCard
          title="Penerima Diajukan"
          value={formatNumber(stats?.penerima_diajukan)}
          icon={<Zap />}
          color={COLORS.warning}
          delay={0.15}
        />
        <KpiCard
          title="Penerima Ditolak"
          value={formatNumber(stats?.penerima_ditolak)}
          icon={<TrendingDown />}
          color={COLORS.danger}
          delay={0.2}
        />
        <KpiCard
          title="Tingkat Penyaluran"
          value={`${stats?.persentase_penyaluran || 0}%`}
          subtitle={`${formatNumber(stats?.total_penyaluran)} total penyaluran`}
          icon={<Award />}
          color={COLORS.emerald}
          delay={0.25}
        />
      </div>

      {/* ─── CHART ROW 1: Trend Penerima + Dana ─── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: pendaftaranData.length > 0 && danaData.length > 0 ? '1fr 1fr' : '1fr',
        gap: '1.25rem',
        marginBottom: '1.75rem',
      }}>
        {/* Trend Penerima Bantuan Per Bulan */}
        <ChartCard title="Trend Jumlah Penerima Bantuan per Periode" icon={<TrendingUp size={20} color="#818cf8" />}>
          {pendaftaranData.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={pendaftaranData}>
                <defs>
                  <linearGradient id="gradientPenerima" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.primary} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={COLORS.primary} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="bulan" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone" dataKey="Penerima Baru"
                  stroke={COLORS.primary} strokeWidth={3}
                  fill="url(#gradientPenerima)"
                  dot={{ fill: COLORS.primary, strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 7, fill: COLORS.primary, stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
              Belum ada data trend pendaftaran
            </div>
          )}
        </ChartCard>

        {/* Trend Dana Tersalurkan Per Bulan */}
        <ChartCard title="Trend Dana Tersalurkan per Periode" icon={<DollarSign size={20} color="#22d3ee" />}>
          {danaData.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <ComposedChart data={danaData}>
                <defs>
                  <linearGradient id="gradientDana" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.cyan} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={COLORS.cyan} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="bulan" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                <YAxis yAxisId="left" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}jt`} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                <Tooltip content={<CustomTooltip formatter={(v) => typeof v === 'number' && v > 10000 ? formatRupiah(v) : formatNumber(v)} />} />
                <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '0.8rem' }} />
                <Bar yAxisId="right" dataKey="Jumlah Distribusi" fill={COLORS.secondary} radius={[6, 6, 0, 0]} opacity={0.7} />
                <Area yAxisId="left" type="monotone" dataKey="Dana Tersalurkan" stroke={COLORS.cyan} strokeWidth={3} fill="url(#gradientDana)"
                  dot={{ fill: COLORS.cyan, strokeWidth: 2, r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
              Belum ada data trend penyaluran dana
            </div>
          )}
        </ChartCard>
      </div>

      {/* ─── CHART ROW 2: Status Pie + Program Breakdown ─── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1.25rem',
        marginBottom: '1.75rem',
      }}>
        {/* Status Penerima Pie Chart */}
        <ChartCard title="Distribusi Status Penerima" icon={<PieChartIcon size={20} color="#c084fc" />}>
          {statusPieData.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem' }}>
              <ResponsiveContainer width="55%" height={280}>
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%" cy="50%"
                    innerRadius={60} outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {statusPieData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {statusPieData.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{ width: 12, height: 12, borderRadius: '3px', background: item.color, flexShrink: 0 }} />
                    <div>
                      <span style={{ color: '#f8fafc', fontWeight: 600, fontSize: '0.9rem' }}>{formatNumber(item.value)}</span>
                      <span style={{ color: '#94a3b8', fontSize: '0.8rem', marginLeft: '0.4rem' }}>{item.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
              Belum ada data status penerima
            </div>
          )}
        </ChartCard>

        {/* Program Breakdown */}
        <ChartCard title="Kategori Program Bantuan" icon={<BarChart3 size={20} color="#34d399" />}>
          {programData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={programData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} width={120} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Jumlah Program" radius={[0, 8, 8, 0]}>
                  {programData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
              Belum ada data program
            </div>
          )}
        </ChartCard>
      </div>

      {/* ─── SUMMARY FOOTER ─── */}
      <div className="glass-panel" style={{
        background: 'linear-gradient(135deg, rgba(129, 140, 248, 0.08), rgba(192, 132, 252, 0.08))',
        border: '1px solid rgba(129, 140, 248, 0.15)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        animation: 'fadeIn 0.6s ease-out 0.5s both',
      }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
            Efisiensi Penyaluran
          </p>
          <h3 style={{
            margin: '0.4rem 0 0', fontSize: '1.75rem', fontWeight: 800,
            background: 'linear-gradient(135deg, #818cf8, #c084fc)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            {stats?.persentase_penyaluran || 0}%
          </h3>
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
            Tingkat Keberhasilan
          </p>
          <h3 style={{
            margin: '0.4rem 0 0', fontSize: '1.75rem', fontWeight: 800,
            background: 'linear-gradient(135deg, #34d399, #22d3ee)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            {stats?.tingkat_keberhasilan || 0}%
          </h3>
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
            Total Dana Tersalurkan
          </p>
          <h3 style={{
            margin: '0.4rem 0 0', fontSize: '1.75rem', fontWeight: 800,
            background: 'linear-gradient(135deg, #22d3ee, #38bdf8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            {formatRupiah(stats?.total_dana_tersalurkan)}
          </h3>
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
            Total Penerima Aktif
          </p>
          <h3 style={{
            margin: '0.4rem 0 0', fontSize: '1.75rem', fontWeight: 800,
            background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            {formatNumber(stats?.penerima_disetujui)}
          </h3>
        </div>
      </div>
    </div>
  );
};

export default DashboardKPI;
