import { motion } from 'framer-motion'
import { Users, Activity, TrendingUp, Shield, Database, AlertTriangle, ChevronRight, MoreVertical } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

const registrationData = [
  { month: 'Oct', users: 320 }, { month: 'Nov', users: 480 }, { month: 'Dic', users: 650 },
  { month: 'Ene', users: 820 }, { month: 'Feb', users: 1100 }, { month: 'Mar', users: 1450 },
]

const activeByRole = [
  { role: 'Clientes', count: 48200 },
  { role: 'Trainers', count: 820 },
  { role: 'Admins', count: 12 },
]

const recentUsers = [
  { name: 'Ana García',    email: 'ana@email.com',    role: 'CLIENT',  joined: 'hace 2h',  avatar: 'AG' },
  { name: 'Carlos Ruiz',   email: 'carlos@email.com', role: 'CLIENT',  joined: 'hace 3h',  avatar: 'CR' },
  { name: 'María López',   email: 'maria@email.com',  role: 'TRAINER', joined: 'hace 5h',  avatar: 'ML' },
  { name: 'Juan Martínez', email: 'juan@email.com',   role: 'CLIENT',  joined: 'hace 8h',  avatar: 'JM' },
]

const roleColors: Record<string, string> = {
  ADMIN: 'badge-danger', TRAINER: 'badge-warning', CLIENT: 'badge-brand',
}

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Panel de administración</h1>
          <p className="text-white/40 text-sm mt-1">Gestión y estadísticas globales de FitForge</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
          <Shield size={14} />
          <span>Acceso Admin</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Users,      label: 'Total usuarios',  value: '49,032', change: '+12%', color: 'text-brand-400',  bg: 'bg-brand-500/10' },
          { icon: Activity,   label: 'Activos hoy',     value: '8,241',  change: '+5%',  color: 'text-success',    bg: 'bg-success/10' },
          { icon: TrendingUp, label: 'Nuevos esta sem', value: '342',    change: '+18%', color: 'text-orange-400', bg: 'bg-orange-500/10' },
          { icon: Database,   label: 'Entrenamientos',  value: '2.1M',   change: '+8%',  color: 'text-purple-400', bg: 'bg-purple-500/10' },
        ].map(({ icon: Icon, label, value, change, color, bg }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="card">
            <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center mb-3`}>
              <Icon size={18} className={color} />
            </div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-white/40 mt-0.5">{label}</p>
            <p className="text-xs text-success mt-1">{change} este mes</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Registration chart */}
        <div className="lg:col-span-2 card">
          <h2 className="font-semibold mb-4">Nuevos registros por mes</h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={registrationData}>
              <defs>
                <linearGradient id="regGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#0ea5e9" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2e2e2e" />
              <XAxis dataKey="month" tick={{ fill: '#ffffff50', fontSize: 12 }} />
              <YAxis tick={{ fill: '#ffffff50', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #2e2e2e', borderRadius: 8 }} />
              <Area type="monotone" dataKey="users" stroke="#0ea5e9" strokeWidth={2} fill="url(#regGrad)" name="Usuarios" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Roles distribution */}
        <div className="card">
          <h2 className="font-semibold mb-4">Distribución por rol</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={activeByRole} layout="vertical">
              <XAxis type="number" tick={{ fill: '#ffffff50', fontSize: 11 }} />
              <YAxis dataKey="role" type="category" tick={{ fill: '#ffffff50', fontSize: 11 }} width={55} />
              <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #2e2e2e', borderRadius: 8 }} />
              <Bar dataKey="count" fill="#0ea5e9" radius={[0, 4, 4, 0]} name="Usuarios" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent users */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Usuarios recientes</h2>
          <a href="/admin/users" className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
            Ver todos <ChevronRight size={12} />
          </a>
        </div>
        <div className="space-y-3">
          {recentUsers.map((u) => (
            <div key={u.email} className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-100 transition-colors group">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-cyan-400 flex items-center justify-center text-xs font-bold shrink-0">
                {u.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{u.name}</p>
                <p className="text-xs text-white/40 truncate">{u.email}</p>
              </div>
              <span className={`badge ${roleColors[u.role]} shrink-0`}>{u.role}</span>
              <span className="text-xs text-white/30 shrink-0 hidden md:block">{u.joined}</span>
              <button className="btn-ghost p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* System status */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="font-semibold">Estado de servicios</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { name: 'Auth Service',  status: 'online', ping: '12ms' },
            { name: 'API Service',   status: 'online', ping: '8ms' },
            { name: 'Diet Service',  status: 'online', ping: '23ms' },
            { name: 'AI Service',    status: 'online', ping: '145ms' },
          ].map(({ name, status, ping }) => (
            <div key={name} className="flex items-center justify-between p-3 rounded-xl bg-surface-100">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${status === 'online' ? 'bg-success animate-pulse' : 'bg-danger'}`} />
                <span className="text-sm font-medium">{name}</span>
              </div>
              <span className="text-xs text-white/40">{ping}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
