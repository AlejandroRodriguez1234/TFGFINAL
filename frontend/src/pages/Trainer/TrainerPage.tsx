import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import {
  Users, Dumbbell, TrendingUp, MessageSquare, Plus,
  Search, ChevronRight, Activity, Target, Award, X, Send,
  CheckCircle2, Clock, BarChart2,
} from 'lucide-react'
import { cn } from '@utils/cn'
import toast from 'react-hot-toast'

interface Client {
  id: string
  name: string
  email: string
  level: number
  streak: number
  lastSeen: string
  plan: string
  progress: number
  status: 'active' | 'inactive'
}

const CLIENTS: Client[] = [
  { id: '1', name: 'María López',    email: 'maria@email.com',   level: 4,  streak: 12, lastSeen: 'Hace 2h',    plan: 'Pérdida de peso',    progress: 72, status: 'active'   },
  { id: '2', name: 'Carlos Ruiz',    email: 'carlos@email.com',  level: 7,  streak: 30, lastSeen: 'Hace 1d',    plan: 'Ganancia muscular',  progress: 85, status: 'active'   },
  { id: '3', name: 'Ana Martínez',   email: 'ana@email.com',     level: 2,  streak: 3,  lastSeen: 'Hace 3d',    plan: 'Tonificación',       progress: 40, status: 'inactive' },
  { id: '4', name: 'Pedro García',   email: 'pedro@email.com',   level: 5,  streak: 8,  lastSeen: 'Hace 5h',    plan: 'Resistencia',        progress: 60, status: 'active'   },
  { id: '5', name: 'Laura Sánchez',  email: 'laura@email.com',   level: 3,  streak: 15, lastSeen: 'Hace 1h',    plan: 'Pérdida de peso',    progress: 55, status: 'active'   },
]

const PLANS = [
  { id: 'p1', name: 'Pérdida de peso',   clients: 3, sessions: 24, duration: '12 semanas' },
  { id: 'p2', name: 'Ganancia muscular', clients: 2, sessions: 36, duration: '16 semanas' },
  { id: 'p3', name: 'Tonificación',      clients: 2, sessions: 20, duration: '8 semanas'  },
  { id: 'p4', name: 'Resistencia',       clients: 1, sessions: 28, duration: '10 semanas' },
]

const SESSIONS = [
  { id: 's1', client: 'María López',   time: 'Hoy 10:00',    type: 'Cardio + Core',     done: true  },
  { id: 's2', client: 'Carlos Ruiz',   time: 'Hoy 12:00',    type: 'Fuerza — Pecho',    done: true  },
  { id: 's3', client: 'Pedro García',  time: 'Hoy 17:00',    type: 'Piernas',            done: false },
  { id: 's4', client: 'Laura Sánchez', time: 'Mañana 09:00', type: 'Cardio + Abs',       done: false },
  { id: 's5', client: 'Ana Martínez',  time: 'Mañana 11:00', type: 'Tonificación total', done: false },
]

type Tab = 'overview' | 'clients' | 'plans' | 'schedule'

export default function TrainerPage() {
  const { t } = useTranslation('trainer')
  const [tab, setTab]             = useState<Tab>('overview')
  const [search, setSearch]       = useState('')
  const [msgClient, setMsgClient] = useState<Client | null>(null)
  const [msgText, setMsgText]     = useState('')

  const filtered = CLIENTS.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()),
  )

  const sendMsg = () => {
    if (!msgText.trim()) return
    toast.success(`${t('sendMessage')}: ${msgClient?.name}`)
    setMsgText('')
    setMsgClient(null)
  }

  const tabs: { key: Tab; label: string; icon: typeof Users }[] = [
    { key: 'overview',  label: t('overview'),  icon: BarChart2 },
    { key: 'clients',   label: t('clients'),   icon: Users     },
    { key: 'plans',     label: t('plans'),     icon: Dumbbell  },
    { key: 'schedule',  label: t('schedule'),  icon: Clock     },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">{t('panel')}</h1>
          <p className="text-white/40 text-sm mt-1">{t('subtitle')}</p>
        </div>
        <button onClick={() => toast.success(t('inviteSent'))} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> {t('addClient')}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-surface-100 rounded-xl w-fit">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              tab === key ? 'bg-brand-500 text-white shadow' : 'text-white/50 hover:text-white',
            )}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab === 'overview' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: t('activeClients'),        value: '5',   icon: Users,      color: 'text-brand-400',  bg: 'bg-brand-500/10'  },
              { label: t('sessionsToday'),        value: '3',   icon: Dumbbell,   color: 'text-green-400',  bg: 'bg-green-500/10'  },
              { label: t('avgProgress'),          value: '62%', icon: TrendingUp, color: 'text-orange-400', bg: 'bg-orange-500/10' },
              { label: t('unlockedAchievements'), value: '14',  icon: Award,      color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
            ].map(({ label, value, icon: Icon, color, bg }, i) => (
              <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="card">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', bg)}>
                  <Icon size={18} className={color} />
                </div>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-white/40 mt-0.5">{label}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent clients */}
            <div className="card space-y-4">
              <h2 className="font-semibold">{t('recentClients')}</h2>
              {CLIENTS.slice(0, 4).map((c) => (
                <div key={c.id} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-cyan-400 flex items-center justify-center text-xs font-bold shrink-0">
                    {c.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{c.name}</p>
                    <p className="text-xs text-white/40">{c.plan}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-brand-400">{c.progress}%</p>
                    <div className="w-16 h-1 bg-surface-200 rounded-full mt-1">
                      <div className="h-full bg-brand-500 rounded-full" style={{ width: `${c.progress}%` }} />
                    </div>
                  </div>
                  <div className={cn('w-2 h-2 rounded-full shrink-0', c.status === 'active' ? 'bg-green-400' : 'bg-white/20')} />
                </div>
              ))}
            </div>

            {/* Today's sessions */}
            <div className="card space-y-4">
              <h2 className="font-semibold">{t('todaySessions')}</h2>
              {SESSIONS.filter((s) => s.time.startsWith('Hoy')).map((s) => (
                <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl bg-surface-100">
                  <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', s.done ? 'bg-green-500/20' : 'bg-brand-500/20')}>
                    {s.done ? <CheckCircle2 size={15} className="text-green-400" /> : <Clock size={15} className="text-brand-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{s.client}</p>
                    <p className="text-xs text-white/40">{s.type}</p>
                  </div>
                  <span className="text-xs text-white/40 shrink-0">{s.time.replace('Hoy ', '')}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* CLIENTS */}
      {tab === 'clients' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('searchClient')} className="input pl-9" />
          </div>
          <div className="space-y-3">
            {filtered.map((c, i) => (
              <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="card flex items-center gap-4 hover:border-white/15 transition-colors"
              >
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-brand-500 to-cyan-400 flex items-center justify-center text-sm font-bold shrink-0">
                  {c.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{c.name}</p>
                    <div className={cn('w-1.5 h-1.5 rounded-full shrink-0', c.status === 'active' ? 'bg-green-400' : 'bg-white/20')} />
                  </div>
                  <p className="text-xs text-white/40">{c.email} · {c.plan}</p>
                </div>
                <div className="hidden md:flex items-center gap-6 shrink-0">
                  <div className="text-center">
                    <p className="text-sm font-bold text-brand-400">Nv. {c.level}</p>
                    <p className="text-[10px] text-white/30">Nivel</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold">{c.streak}d</p>
                    <p className="text-[10px] text-white/30">Racha</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-green-400">{c.progress}%</p>
                    <p className="text-[10px] text-white/30">Progreso</p>
                  </div>
                  <p className="text-xs text-white/30 w-20 text-right">{c.lastSeen}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => setMsgClient(c)} className="p-2 rounded-lg hover:bg-brand-500/20 text-white/40 hover:text-brand-400 transition-colors">
                    <MessageSquare size={15} />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
                    <Activity size={15} />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-white/10 text-white/20 hover:text-white transition-colors">
                    <ChevronRight size={15} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* PLANS */}
      {tab === 'plans' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid md:grid-cols-2 gap-4">
          {PLANS.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="card hover:border-white/15 transition-colors cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold">{p.name}</h3>
                  <p className="text-xs text-white/40 mt-0.5">{p.duration}</p>
                </div>
                <span className="badge badge-brand">{p.clients} clientes</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-surface-100 rounded-xl p-3 text-center">
                  <p className="text-lg font-bold">{p.sessions}</p>
                  <p className="text-xs text-white/40">Sesiones</p>
                </div>
                <div className="bg-surface-100 rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-brand-400">{p.clients}</p>
                  <p className="text-xs text-white/40">Clientes</p>
                </div>
              </div>
              <button className="mt-4 w-full btn-secondary text-sm py-2 group-hover:border-brand-500/30 transition-colors">
                {t('viewPlan')} <ChevronRight size={14} className="inline" />
              </button>
            </motion.div>
          ))}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}
            className="card border-dashed border-white/10 flex items-center justify-center cursor-pointer hover:border-brand-500/30 transition-colors group"
            onClick={() => toast.success('Creando nuevo plan...')}
          >
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-brand-500/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-brand-500/20 transition-colors">
                <Plus size={20} className="text-brand-400" />
              </div>
              <p className="text-sm font-medium text-white/60">{t('createPlan')}</p>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* SCHEDULE */}
      {tab === 'schedule' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          {['Hoy', 'Mañana'].map((day) => (
            <div key={day}>
              <h3 className="text-sm font-semibold text-white/40 uppercase tracking-wide mb-2">{day}</h3>
              {SESSIONS.filter((s) => s.time.startsWith(day)).map((s, i) => (
                <motion.div key={s.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-surface-100 hover:bg-surface-200 transition-colors mb-2"
                >
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', s.done ? 'bg-green-500/20' : 'bg-brand-500/20')}>
                    {s.done ? <CheckCircle2 size={18} className="text-green-400" /> : <Target size={18} className="text-brand-400" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{s.client}</p>
                    <p className="text-xs text-white/40">{s.type}</p>
                  </div>
                  <span className="text-sm text-white/50 font-medium">{s.time.replace(`${day} `, '')}</span>
                  {s.done
                    ? <span className="badge badge-success text-xs">Completada</span>
                    : <button onClick={() => toast.success('Sesión marcada como completada')} className="badge badge-brand text-xs cursor-pointer hover:bg-brand-500/30 transition-colors">Pendiente</button>
                  }
                </motion.div>
              ))}
            </div>
          ))}
        </motion.div>
      )}

      {/* Message modal */}
      {msgClient && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={() => setMsgClient(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} onClick={(e) => e.stopPropagation()}
            className="glass border border-white/10 rounded-2xl p-6 w-full max-w-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-cyan-400 flex items-center justify-center text-xs font-bold">
                  {msgClient.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <p className="font-semibold text-sm">{msgClient.name}</p>
                  <p className="text-xs text-white/40">{t('directMessage')}</p>
                </div>
              </div>
              <button onClick={() => setMsgClient(null)} className="btn-ghost p-1.5"><X size={16} /></button>
            </div>
            <textarea
              value={msgText}
              onChange={(e) => setMsgText(e.target.value)}
              placeholder={t('writeMessage')}
              className="input w-full h-28 resize-none text-sm"
            />
            <div className="flex gap-2 mt-3">
              <button onClick={() => setMsgClient(null)} className="btn-secondary flex-1 text-sm">{t('common:cancel')}</button>
              <button onClick={sendMsg} className="btn-primary flex-1 text-sm flex items-center justify-center gap-2">
                <Send size={14} /> {t('common:send')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
