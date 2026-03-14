'use client';

import { useState, useEffect, useCallback } from 'react';
import type { DashboardMetrics } from '@/types';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Filler);

export default function Dashboard() {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // VIP state
  const [vipUsers, setVipUsers] = useState<Array<{ user_phone: string; first_seen: string; last_seen: string; total_messages: number }>>([]);
  const [vipSlots, setVipSlots] = useState({ used: 0, max: 10 });
  const [newVipPhone, setNewVipPhone] = useState('');
  const [vipLoading, setVipLoading] = useState(false);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          setError('Contraseña incorrecta');
          setAuthenticated(false);
          return;
        }
        throw new Error('Error fetching metrics');
      }

      const data = await res.json();
      setMetrics(data);
      setAuthenticated(true);
      setError('');
    } catch {
      setError('Error al cargar métricas');
    } finally {
      setLoading(false);
    }
  }, [password]);

  const fetchVips = useCallback(async () => {
    try {
      const res = await fetch('/api/vip', {
        headers: { 'x-dashboard-password': password },
      });
      if (res.ok) {
        const data = await res.json();
        setVipUsers(data.vipUsers);
        setVipSlots({ used: data.usedSlots, max: data.maxSlots });
      }
    } catch {
      console.error('Error fetching VIPs');
    }
  }, [password]);

  useEffect(() => {
    if (authenticated) {
      fetchVips();
    }
  }, [authenticated, fetchVips]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetchMetrics();
  };

  const addVip = async () => {
    if (!newVipPhone.trim()) return;
    setVipLoading(true);
    try {
      const res = await fetch('/api/vip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, phone: newVipPhone.trim() }),
      });
      if (res.ok) {
        setNewVipPhone('');
        await fetchVips();
      } else {
        const data = await res.json();
        alert(data.error || 'Error al añadir VIP');
      }
    } catch {
      alert('Error de conexión');
    } finally {
      setVipLoading(false);
    }
  };

  const removeVip = async (phone: string) => {
    if (!confirm(`¿Eliminar ${phone} de VIP?`)) return;
    try {
      const res = await fetch('/api/vip', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, phone }),
      });
      if (res.ok) {
        await fetchVips();
      }
    } catch {
      alert('Error de conexión');
    }
  };

  if (!authenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <form onSubmit={handleLogin} className="w-full max-w-sm">
          <h1 className="text-2xl font-light text-gray-900 mb-8 text-center">Dashboard</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sage-500 mb-4"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sage-600 hover:bg-sage-700 text-white px-6 py-3 rounded-xl font-medium transition-colors disabled:bg-gray-300"
          >
            {loading ? 'Cargando...' : 'Entrar'}
          </button>
          {error && <p className="mt-4 text-red-500 text-sm text-center">{error}</p>}
        </form>
      </main>
    );
  }

  if (!metrics) return null;

  const chartData = {
    labels: metrics.activityChart.map((d) => {
      const date = new Date(d.date);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    }),
    datasets: [
      {
        label: 'Mensajes',
        data: metrics.activityChart.map((d) => d.count),
        borderColor: '#637363',
        backgroundColor: 'rgba(99, 115, 99, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 2,
        pointHoverRadius: 5,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 } } },
      y: { beginAtZero: true, grid: { color: '#f0f0f0' }, ticks: { font: { size: 11 } } },
    },
  };

  return (
    <main className="min-h-screen p-6 sm:p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-2xl font-light text-gray-900">Habla con Buda — Dashboard</h1>
        <button
          onClick={fetchMetrics}
          className="text-sm text-sage-600 hover:text-sage-700 transition-colors"
        >
          Actualizar
        </button>
      </div>

      {/* Overview */}
      <section className="mb-10">
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Overview</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <MetricCard label="Total usuarios" value={metrics.overview.totalUsers} />
          <MetricCard label="Nuevos hoy" value={metrics.overview.newUsersToday} />
          <MetricCard label="Activos hoy" value={metrics.overview.activeUsersToday} />
          <MetricCard label="Mensajes hoy" value={metrics.overview.totalMessagesToday} />
          <MetricCard label="Conversaciones hoy" value={metrics.overview.totalConversationsToday} />
        </div>
      </section>

      {/* Engagement + Retention + Premium */}
      <section className="mb-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Engagement</h2>
          <div className="space-y-4">
            <MetricCard label="Msgs / usuario (promedio)" value={metrics.engagement.avgMessagesPerUser} />
            <MetricCard label="Largo conv. (promedio)" value={metrics.engagement.avgConversationLength} />
          </div>
        </div>
        <div>
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Retención</h2>
          <div className="space-y-4">
            <MetricCard label="D1 retención" value={`${metrics.retention.d1}%`} />
            <MetricCard label="D7 retención" value={`${metrics.retention.d7}%`} />
          </div>
        </div>
        <div>
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Premium</h2>
          <div className="space-y-4">
            <MetricCard label="Usuarios premium" value={metrics.premium.premiumUsers} />
            <MetricCard label="Conversión" value={`${metrics.premium.conversionRate}%`} />
          </div>
        </div>
      </section>

      {/* Activity Chart */}
      <section className="mb-10">
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Actividad (últimos 30 días)</h2>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <Line data={chartData} options={chartOptions} />
        </div>
      </section>

      {/* Top Topics */}
      <section className="mb-10">
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Temas frecuentes</h2>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          {metrics.topTopics.length === 0 ? (
            <p className="text-gray-400 text-sm">Sin datos suficientes</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {metrics.topTopics.map((topic) => (
                <span
                  key={topic.word}
                  className="inline-block px-3 py-1.5 bg-warm-100 text-warm-800 rounded-full text-sm"
                  style={{ fontSize: `${Math.max(12, Math.min(20, 12 + topic.count))}px` }}
                >
                  {topic.word} <span className="text-warm-500">({topic.count})</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* VIP Management */}
      <section className="mb-10">
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">
          Gestión VIP ({vipSlots.used} de {vipSlots.max} slots)
        </h2>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          {vipUsers.length === 0 ? (
            <p className="text-gray-400 text-sm mb-4">Sin usuarios VIP</p>
          ) : (
            <div className="space-y-3 mb-6">
              {vipUsers.map((vip) => (
                <div key={vip.user_phone} className="flex items-center justify-between py-2 px-3 bg-warm-50 rounded-xl">
                  <div>
                    <span className="font-mono text-sm text-gray-700">{vip.user_phone}</span>
                    <span className="ml-3 text-xs text-sage-600">Activo</span>
                    <span className="ml-3 text-xs text-gray-400">{vip.total_messages} msgs</span>
                  </div>
                  <button
                    onClick={() => removeVip(vip.user_phone)}
                    className="text-xs text-red-400 hover:text-red-600 transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            <input
              type="text"
              value={newVipPhone}
              onChange={(e) => setNewVipPhone(e.target.value)}
              placeholder="+34612345678"
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sage-500 text-sm font-mono"
            />
            <button
              onClick={addVip}
              disabled={vipLoading || vipSlots.used >= vipSlots.max}
              className="bg-sage-600 hover:bg-sage-700 disabled:bg-gray-300 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors"
            >
              {vipLoading ? '...' : 'Añadir VIP'}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-2xl font-light text-gray-900">{value}</p>
    </div>
  );
}
