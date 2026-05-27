import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Users, Activity, TrendingUp, Shield, Database, ChevronRight, MoreVertical, Search, Plus, X, Check, Trash2, Edit2, AlertTriangle } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { cn } from '@utils/cn'
import toast from 'react-hot-toast'

const registrationData = [
  { month: 'Oct', users: 320 }, { month: 'Nov', users: 480 }, { month: 'Dic', users: 650 },
  { month: 'Ene', users: 820 }, { month: 'Feb', users: 1100 }, { month: 'Mar', users: 1450 },
]

const activeByRole = [
  { role: 'Clientes', count: 48200 },
  { role: 'Trainers', count: 820 },
  { role: 'Admins', count: 12 },
]

type UserRole = 'ADMIN' | 'TRAINER' | 'CLIENT'
type UserStatus = 'active' | 'banned' | 'inactive'

interface AdminUser {
  id: string
  name: string
  email: string
  role: UserRole
  joined: string
  lastLogin: string
  status: UserStatus
  avatar: string
  workouts: number
  streak: number
}

const INITIAL_USERS: AdminUser[] = [
  { id: '1',  name: 'Alejandro Rodríguez', email: 'alejandro@fitforge.com', role: 'ADMIN',   joined: '15 Oct 2024', lastLogin: 'hace 5m',  status: 'active',   avatar: 'AR', workouts: 0,   streak: 0  },
  { id: '2',  name: 'Ana García',          email: 'ana@email.com',          role: 'CLIENT',  joined: '02 Nov 2024', lastLogin: 'hace 2h',  status: 'active',   avatar: 'AG', workouts: 48,  streak: 12 },
  { id: '3',  name: 'Carlos Ruiz',         email: 'carlos@email.com',       role: 'CLIENT',  joined: '15 Nov 2024', lastLogin: 'hace 1d',  status: 'active',   avatar: 'CR', workouts: 120, streak: 30 },
  { id: '4',  name: 'María López',         email: 'maria@email.com',        role: 'TRAINER', joined: '20 Nov 2024', lastLogin: 'hace 5h',  status: 'active',   avatar: 'ML', workouts: 0,   streak: 0  },
  { id: '5',  name: 'Juan Martínez',       email: 'juan@email.com',         role: 'CLIENT',  joined: '01 Dic 2024', lastLogin: 'hace 8h',  status: 'active',   avatar: 'JM', workouts: 67,  streak: 8  },
  { id: '6',  name: 'Laura Sánchez',       email: 'laura@email.com',        role: 'CLIENT',  joined: '10 Dic 2024', lastLogin: 'hace 1h',  status: 'active',   avatar: 'LS', workouts: 55,  streak: 15 },
  { id: '7',  name: 'Pedro García',        email: 'pedro@email.com',        role: 'CLIENT',  joined: '15 Dic 2024', lastLogin: 'hace 2d',  status: 'active',   avatar: 'PG', workouts: 33,  streak: 5  },
  { id: '8',  name: 'Sara Pérez',          email: 'sara@email.com',         role: 'CLIENT',  joined: '20 Ene 2025', lastLogin: 'hace 3h',  status: 'active',   avatar: 'SP', workouts: 29,  streak: 7  },
  { id: '9',  name: 'Roberto Díaz',        email: 'roberto@email.com',      role: 'TRAINER', joined: '01 Feb 2025', lastLogin: 'hace 4h',  status: 'active',   avatar: 'RD', workouts: 0,   streak: 0  },
  { id: '10', name: 'Emma Wilson',         email: 'emma@email.com',         role: 'CLIENT',  joined: '15 Feb 2025', lastLogin: 'hace 5d',  status: 'inactive', avatar: 'EW', workouts: 8,   streak: 0  },
  { id: '11', name: 'Miguel Torres',       email: 'miguel@email.com',       role: 'CLIENT',  joined: '20 Feb 2025', lastLogin: 'hace 7d',  status: 'banned',   avatar: 'MT', workouts: 3,   streak: 0  },
]

const roleColors: Record<UserRole, string> = {
  ADMIN: 'badge-danger', TRAINER: 'badge-warning', CLIENT: 'badge-brand',
}
const statusColors: Record<UserStatus, string> = {
  active: 'text-success', banned: 'text-danger', inactive: 'text-white/30',
}

type Tab = 'overview' | 'users' | 'system'

const EMPTY_FORM = { name: '', email: '', role: 'CLIENT' as UserRole }

export default function AdminPage() {
  const { t } = useTranslation('admin')
  const [tab, setTab]           = useState<Tab>('overview')
  const [users, setUsers]       = useState<AdminUser[]>(INITIAL_USERS)
  const [search, setSearch]     = useState('')
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL')
  const [editUser, setEditUser] = useState<AdminUser | null>(null)
  const [editRole, setEditRole] = useState<UserRole>('CLIENT')
  const [confirmDelete, setConfirmDelete] = useState<AdminUser | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState(EMPTY_FORM)
  const [createErrors, setCreateErrors] = useState<{ name?: string; email?: string }>({})

  const handleCreate = () => {
    const errors: { name?: string; email?: string } = {}
    if (!createForm.name.trim()) errors.name = 'El nombre es obligatorio'
    if (!createForm.email.trim()) errors.email = 'El email es obligatorio'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createForm.email)) errors.email = 'Email no válido'
    else if (users.some(u => u.email === createForm.email)) errors.email = 'Este email ya existe'
    if (Object.keys(errors).length) { setCreateErrors(errors); return }

    const initials = createForm.name.trim().split(' ').slice(0, 2).map(w => w[0].toUpperCase()).join('')
    const newUser: AdminUser = {
      id: String(Date.now()),
      name: createForm.name.trim(),
      email: createForm.email.trim(),
      role: createForm.role,
      joined: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
      lastLogin: 'Nunca',
      status: 'active',
      avatar: initials,
      workouts: 0,
      streak: 0,
    }
    setUsers(prev => [newUser, ...prev])
    toast.success(`Usuario ${newUser.name} creado correctamente`)
    setShowCreate(false)
    setCreateForm(EMPTY_FORM)
    setCreateErrors({})
  }

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter
    return matchSearch && matchRole
  })

  const handleRoleChange = () => {
    if (!editUser) return
    setUsers(prev => prev.map(u => u.id === editUser.id ? { ...u, role: editRole } : u))
    toast.success(`Rol de ${editUser.name} actualizado a ${editRole}`)
    setEditUser(null)
  }

  const handleToggleBan = (user: AdminUser) => {
    const newStatus: UserStatus = user.status === 'banned' ? 'active' : 'banned'
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: newStatus } : u))
    toast.success(newStatus === 'banned' ? `${user.name} ha sido suspendido` : `${user.name} ha sido rehabilitado`)
  }

  const handleDelete = () => {
    if (!confirmDelete) return
    setUsers(prev => prev.filter(u => u.id !== confirmDelete.id))
    toast.success(`Usuario ${confirmDelete.name} eliminado`)
    setConfirmDelete(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">{t('panel')}</h1>
          <p className="text-white/40 text-sm mt-1">{t('subtitle')}</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
          <Shield size={14} />
          <span>{t('adminAccess')}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-surface-100 rounded-xl w-fit">
        {([['overview', 'Resumen'], ['users', 'Usuarios'], ['system', 'Sistema']] as const).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-all',
              tab === key ? 'bg-brand-500 text-white' : 'text-white/50 hover:text-white')}>
            {label}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab === 'overview' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Users,      label: t('totalUsers'),    value: '49,032', change: '+12%', color: 'text-brand-400',  bg: 'bg-brand-500/10' },
              { icon: Activity,   label: t('activeToday'),  value: '8,241',  change: '+5%',  color: 'text-success',    bg: 'bg-success/10' },
              { icon: TrendingUp, label: t('newThisWeek'),  value: '342',    change: '+18%', color: 'text-orange-400', bg: 'bg-orange-500/10' },
              { icon: Database,   label: t('totalWorkouts'),value: '2.1M',   change: '+8%',  color: 'text-purple-400', bg: 'bg-purple-500/10' },
            ].map(({ icon: Icon, label, value, change, color, bg }, i) => (
              <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="card">
                <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center mb-3`}>
                  <Icon size={18} className={color} />
                </div>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-white/40 mt-0.5">{label}</p>
                <p className="text-xs text-success mt-1">{change} {t('thisMonth')}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 card">
              <h2 className="font-semibold mb-4">{t('newRegistrations')}</h2>
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

            <div className="card">
              <h2 className="font-semibold mb-4">{t('roleDistribution')}</h2>
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

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">{t('recentUsers')}</h2>
              <button onClick={() => setTab('users')} className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
                {t('viewAll')} <ChevronRight size={12} />
              </button>
            </div>
            <div className="space-y-3">
              {users.slice(0, 5).map(u => (
                <div key={u.email} className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-100 transition-colors group">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-cyan-400 flex items-center justify-center text-xs font-bold shrink-0">{u.avatar}</div>
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
        </motion.div>
      )}

      {/* USERS */}
      {tab === 'users' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar usuario..." className="input pl-9 text-sm" />
            </div>
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value as UserRole | 'ALL')}
              className="input text-sm w-36" style={{ colorScheme: 'dark' }}>
              <option value="ALL">Todos los roles</option>
              <option value="CLIENT">Clientes</option>
              <option value="TRAINER">Trainers</option>
              <option value="ADMIN">Admins</option>
            </select>
            <button onClick={() => { setShowCreate(true); setCreateForm(EMPTY_FORM); setCreateErrors({}) }} className="btn-primary text-sm px-3 py-2">
              <Plus size={15} /> Nuevo usuario
            </button>
          </div>

          <div className="card overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    {['Usuario', 'Rol', 'Registro', 'Último acceso', 'Actividad', 'Estado', 'Acciones'].map(h => (
                      <th key={h} className="text-left text-xs text-white/40 font-medium px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u, i) => (
                    <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                      className="border-b border-white/5 hover:bg-surface-100 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-cyan-400 flex items-center justify-center text-xs font-bold shrink-0">{u.avatar}</div>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{u.name}</p>
                            <p className="text-xs text-white/30 truncate">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${roleColors[u.role]}`}>{u.role}</span>
                      </td>
                      <td className="px-4 py-3 text-white/40 text-xs">{u.joined}</td>
                      <td className="px-4 py-3 text-white/40 text-xs">{u.lastLogin}</td>
                      <td className="px-4 py-3 text-xs text-white/50">
                        {u.role === 'CLIENT' ? `${u.workouts} entrenos · ${u.streak}d racha` : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn('text-xs font-medium', statusColors[u.status])}>
                          {u.status === 'active' ? '● Activo' : u.status === 'banned' ? '● Suspendido' : '● Inactivo'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => { setEditUser(u); setEditRole(u.role) }}
                            className="p-1.5 rounded-lg text-white/30 hover:text-brand-400 hover:bg-brand-500/10 transition-colors" title="Editar rol">
                            <Edit2 size={13} />
                          </button>
                          {u.role !== 'ADMIN' && (
                            <button onClick={() => handleToggleBan(u)}
                              className={cn('p-1.5 rounded-lg transition-colors',
                                u.status === 'banned' ? 'text-success hover:bg-success/10' : 'text-orange-400 hover:bg-orange-500/10')}
                              title={u.status === 'banned' ? 'Rehabilitar' : 'Suspender'}>
                              {u.status === 'banned' ? <Check size={13} /> : <AlertTriangle size={13} />}
                            </button>
                          )}
                          {u.role !== 'ADMIN' && (
                            <button onClick={() => setConfirmDelete(u)}
                              className="p-1.5 rounded-lg text-white/30 hover:text-danger hover:bg-danger/10 transition-colors" title="Eliminar">
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="text-center py-12 text-white/30 text-sm">No se encontraron usuarios</div>
              )}
            </div>
            <div className="px-4 py-3 border-t border-white/5 flex items-center justify-between">
              <span className="text-xs text-white/30">{filtered.length} de {users.length} usuarios</span>
              <span className="text-xs text-white/30">Página 1 de 1</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* SYSTEM */}
      {tab === 'system' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="font-semibold">{t('serviceStatus')}</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { name: 'Auth Service',  status: 'online', ping: '12ms',  uptime: '99.9%' },
                { name: 'API Service',   status: 'online', ping: '8ms',   uptime: '99.8%' },
                { name: 'Diet Service',  status: 'online', ping: '23ms',  uptime: '99.7%' },
                { name: 'AI Service',    status: 'online', ping: '145ms', uptime: '98.5%' },
              ].map(({ name, status, ping, uptime }) => (
                <div key={name} className="p-3 rounded-xl bg-surface-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${status === 'online' ? 'bg-success animate-pulse' : 'bg-danger'}`} />
                      <span className="text-sm font-medium">{name}</span>
                    </div>
                    <span className="text-xs text-white/40">{ping}</span>
                  </div>
                  <p className="text-xs text-white/30">Uptime: <span className="text-success">{uptime}</span></p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="card">
              <h2 className="font-semibold mb-4">Configuración de la plataforma</h2>
              <div className="space-y-3">
                {[
                  { label: 'Versión de la app', value: 'v2.4.1' },
                  { label: 'Modo de mantenimiento', value: 'Desactivado' },
                  { label: 'Registros nuevos', value: 'Habilitado' },
                  { label: 'Tier gratuito', value: 'Habilitado' },
                  { label: 'Plan Pro', value: '€9.99/mes' },
                  { label: 'Plan Trainer', value: '€24.99/mes' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b border-white/5">
                    <span className="text-sm text-white/60">{label}</span>
                    <span className="text-sm font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h2 className="font-semibold mb-4">Estadísticas del sistema</h2>
              <div className="space-y-4">
                {[
                  { label: 'Uso de CPU',      value: 34, color: 'bg-brand-500' },
                  { label: 'Uso de RAM',      value: 61, color: 'bg-orange-500' },
                  { label: 'Disco (SSD)',     value: 48, color: 'bg-purple-500' },
                  { label: 'Ancho de banda', value: 22, color: 'bg-green-500' },
                ].map(({ label, value, color }) => (
                  <div key={label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white/60">{label}</span>
                      <span className="text-white/40">{value}%</span>
                    </div>
                    <div className="h-1.5 bg-surface-200 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Edit role modal */}
      {editUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={() => setEditUser(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            onClick={e => e.stopPropagation()}
            className="glass border border-white/10 rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Editar rol</h3>
              <button onClick={() => setEditUser(null)} className="btn-ghost p-1.5"><X size={16} /></button>
            </div>
            <div className="flex items-center gap-3 mb-5 p-3 bg-surface-100 rounded-xl">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-cyan-400 flex items-center justify-center text-xs font-bold">{editUser.avatar}</div>
              <div>
                <p className="font-medium text-sm">{editUser.name}</p>
                <p className="text-xs text-white/40">{editUser.email}</p>
              </div>
            </div>
            <div className="space-y-2 mb-5">
              {(['CLIENT', 'TRAINER', 'ADMIN'] as UserRole[]).map(role => (
                <button key={role} onClick={() => setEditRole(role)}
                  className={cn('w-full flex items-center justify-between p-3 rounded-xl border transition-all',
                    editRole === role ? 'border-brand-500/50 bg-brand-500/10' : 'border-transparent bg-surface-100 hover:border-white/10')}>
                  <span className="text-sm font-medium">{role}</span>
                  {editRole === role && <Check size={15} className="text-brand-400" />}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditUser(null)} className="btn-secondary flex-1 text-sm">Cancelar</button>
              <button onClick={handleRoleChange} className="btn-primary flex-1 text-sm">Guardar cambios</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Create user modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={() => setShowCreate(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            onClick={e => e.stopPropagation()}
            className="glass border border-white/10 rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold">Nuevo usuario</h3>
              <button onClick={() => setShowCreate(false)} className="btn-ghost p-1.5"><X size={16} /></button>
            </div>

            <div className="space-y-4 mb-5">
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Nombre completo</label>
                <input
                  value={createForm.name}
                  onChange={e => { setCreateForm(f => ({ ...f, name: e.target.value })); setCreateErrors(er => ({ ...er, name: undefined })) }}
                  placeholder="Ej: Ana García"
                  className={cn('input text-sm w-full', createErrors.name && 'border-danger/50')}
                />
                {createErrors.name && <p className="text-xs text-danger mt-1">{createErrors.name}</p>}
              </div>

              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Email</label>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={e => { setCreateForm(f => ({ ...f, email: e.target.value })); setCreateErrors(er => ({ ...er, email: undefined })) }}
                  placeholder="usuario@email.com"
                  className={cn('input text-sm w-full', createErrors.email && 'border-danger/50')}
                />
                {createErrors.email && <p className="text-xs text-danger mt-1">{createErrors.email}</p>}
              </div>

              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Rol</label>
                <div className="space-y-2">
                  {(['CLIENT', 'TRAINER', 'ADMIN'] as UserRole[]).map(role => (
                    <button key={role} onClick={() => setCreateForm(f => ({ ...f, role }))}
                      className={cn('w-full flex items-center justify-between p-3 rounded-xl border transition-all',
                        createForm.role === role ? 'border-brand-500/50 bg-brand-500/10' : 'border-transparent bg-surface-100 hover:border-white/10')}>
                      <span className="text-sm font-medium">{role}</span>
                      {createForm.role === role && <Check size={15} className="text-brand-400" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setShowCreate(false)} className="btn-secondary flex-1 text-sm">Cancelar</button>
              <button onClick={handleCreate} className="btn-primary flex-1 text-sm">Crear usuario</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Confirm delete modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={() => setConfirmDelete(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            onClick={e => e.stopPropagation()}
            className="glass border border-white/10 rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-danger/10 flex items-center justify-center shrink-0">
                <Trash2 size={18} className="text-danger" />
              </div>
              <div>
                <h3 className="font-semibold">Eliminar usuario</h3>
                <p className="text-xs text-white/40">Esta acción no se puede deshacer</p>
              </div>
            </div>
            <p className="text-sm text-white/70 mb-5">
              ¿Estás seguro de que quieres eliminar a <strong>{confirmDelete.name}</strong>? Se borrarán todos sus datos.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmDelete(null)} className="btn-secondary flex-1 text-sm">Cancelar</button>
              <button onClick={handleDelete} className="flex-1 text-sm px-4 py-2 bg-danger hover:bg-danger/80 text-white rounded-lg font-medium transition-colors">Eliminar</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
