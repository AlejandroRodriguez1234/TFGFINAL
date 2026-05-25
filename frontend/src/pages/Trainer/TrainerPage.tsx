import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import {
  Users, Dumbbell, TrendingUp, MessageSquare, Plus, Search, ChevronRight,
  Activity, Target, Award, X, Send, CheckCircle2, Clock, BarChart2,
  Calendar, Flame, Star, Mail, Phone,
} from 'lucide-react'
import { cn } from '@utils/cn'
import toast from 'react-hot-toast'

interface Client {
  id: string
  name: string
  email: string
  phone?: string
  level: number
  streak: number
  lastSeen: string
  plan: string
  progress: number
  status: 'active' | 'inactive'
  joinDate: string
  goals: string
}

interface Plan {
  id: string
  name: string
  clients: number
  sessions: number
  duration: string
  desc: string
  weeks: number
  daysPerWeek: number
  exercises: string[]
  goals: string[]
}

interface Session {
  id: string
  client: string
  time: string
  type: string
  done: boolean
  notes?: string
}

const INITIAL_CLIENTS: Client[] = [
  { id: '1', name: 'María López',    email: 'maria@email.com',   phone: '+34 611 234 567', level: 4,  streak: 12, lastSeen: 'Hace 2h',  plan: 'Pérdida de peso',   progress: 72, status: 'active',   joinDate: 'Ene 2025', goals: 'Perder 8kg, tonificar piernas'  },
  { id: '2', name: 'Carlos Ruiz',    email: 'carlos@email.com',  phone: '+34 622 345 678', level: 7,  streak: 30, lastSeen: 'Hace 1d',  plan: 'Ganancia muscular', progress: 85, status: 'active',   joinDate: 'Feb 2024', goals: 'Ganar 5kg de músculo, fuerza'    },
  { id: '3', name: 'Ana Martínez',   email: 'ana@email.com',     phone: '+34 633 456 789', level: 2,  streak: 3,  lastSeen: 'Hace 3d',  plan: 'Tonificación',      progress: 40, status: 'inactive', joinDate: 'Mar 2025', goals: 'Tonificar, mejorar postura'      },
  { id: '4', name: 'Pedro García',   email: 'pedro@email.com',   phone: '+34 644 567 890', level: 5,  streak: 8,  lastSeen: 'Hace 5h',  plan: 'Resistencia',       progress: 60, status: 'active',   joinDate: 'Dic 2024', goals: 'Correr 10K, mejorar resistencia' },
  { id: '5', name: 'Laura Sánchez',  email: 'laura@email.com',   phone: '+34 655 678 901', level: 3,  streak: 15, lastSeen: 'Hace 1h',  plan: 'Pérdida de peso',   progress: 55, status: 'active',   joinDate: 'Ene 2025', goals: 'Perder 5kg, hábitos saludables'  },
]

const INITIAL_PLANS: Plan[] = [
  {
    id: 'p1', name: 'Pérdida de peso', clients: 3, sessions: 24, duration: '12 semanas',
    desc: 'Plan enfocado en déficit calórico progresivo con cardio HIIT y fuerza funcional.',
    weeks: 12, daysPerWeek: 4,
    exercises: ['Cardio HIIT (30 min)', 'Sentadillas', 'Peso muerto rumano', 'Plancha', 'Burpees', 'Zancadas', 'Remo con mancuerna'],
    goals: ['Déficit -400 kcal/día', 'Perder 4-6 kg en 12 semanas', 'Mejorar resistencia cardiovascular'],
  },
  {
    id: 'p2', name: 'Ganancia muscular', clients: 2, sessions: 36, duration: '16 semanas',
    desc: 'Hipertrofia progresiva con periodización undulante. Superávit calórico controlado.',
    weeks: 16, daysPerWeek: 5,
    exercises: ['Press de banca', 'Sentadilla con barra', 'Peso muerto', 'Press militar', 'Dominadas', 'Remo con barra', 'Fondos en paralelas'],
    goals: ['Superávit +300 kcal/día', 'Ganar 3-5 kg de músculo', 'Aumentar fuerza en levantamientos básicos'],
  },
  {
    id: 'p3', name: 'Tonificación', clients: 2, sessions: 20, duration: '8 semanas',
    desc: 'Combinación de cardio moderado y trabajo de fuerza con pesos medios y muchas repeticiones.',
    weeks: 8, daysPerWeek: 3,
    exercises: ['Elíptica (20 min)', 'Press con mancuernas', 'Sentadilla sumo', 'Hip thrust', 'Elevaciones laterales', 'Curl de bíceps'],
    goals: ['Mantener peso actual', 'Definir musculatura', 'Mejorar composición corporal'],
  },
  {
    id: 'p4', name: 'Resistencia', clients: 1, sessions: 28, duration: '10 semanas',
    desc: 'Preparación para carrera de 10K con incremento progresivo de volumen de carrera.',
    weeks: 10, daysPerWeek: 4,
    exercises: ['Carrera continua (45-60 min)', 'Intervals 400m', 'Cuestas', 'Core funcional', 'Movilidad', 'Fuerza de pierna'],
    goals: ['Completar 10K en menos de 55 min', 'Mejorar VO2 max', 'Evitar lesiones con fuerza compensatoria'],
  },
]

const INITIAL_SESSIONS: Session[] = [
  { id: 's1', client: 'María López',   time: 'Hoy 10:00',    type: 'Cardio + Core',     done: true,  notes: 'Completó todas las series. Gran esfuerzo.' },
  { id: 's2', client: 'Carlos Ruiz',   time: 'Hoy 12:00',    type: 'Fuerza — Pecho',    done: true,  notes: 'Nuevo PR en press banca: 90kg.' },
  { id: 's3', client: 'Pedro García',  time: 'Hoy 17:00',    type: 'Piernas',            done: false, notes: '' },
  { id: 's4', client: 'Laura Sánchez', time: 'Mañana 09:00', type: 'Cardio + Abs',       done: false, notes: '' },
  { id: 's5', client: 'Ana Martínez',  time: 'Mañana 11:00', type: 'Tonificación total', done: false, notes: '' },
  { id: 's6', client: 'Carlos Ruiz',   time: 'Mañana 15:00', type: 'Espalda + Bíceps',   done: false, notes: '' },
]

type Tab = 'overview' | 'clients' | 'plans' | 'schedule'

export default function TrainerPage() {
  const { t } = useTranslation('trainer')
  const [tab, setTab]               = useState<Tab>('overview')
  const [search, setSearch]         = useState('')
  const [clients, setClients]       = useState<Client[]>(INITIAL_CLIENTS)
  const [sessions, setSessions]     = useState<Session[]>(INITIAL_SESSIONS)
  const [msgClient, setMsgClient]   = useState<Client | null>(null)
  const [msgText, setMsgText]       = useState('')
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [newClientModal, setNewClientModal] = useState(false)
  const [clientDetail, setClientDetail] = useState<Client | null>(null)
  const [selectedPlanId, setSelectedPlanId] = useState<string>('p1')
  const [plans] = useState<Plan[]>(INITIAL_PLANS)

  // New client form
  const [ncName, setNcName]     = useState('')
  const [ncEmail, setNcEmail]   = useState('')
  const [ncPhone, setNcPhone]   = useState('')
  const [ncPlan, setNcPlan]     = useState('p1')
  const [ncGoals, setNcGoals]   = useState('')

  const filtered = clients.filter(
    c => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()),
  )

  const sendMsg = () => {
    if (!msgText.trim()) return
    toast.success(`Mensaje enviado a ${msgClient?.name}`)
    setMsgText('')
    setMsgClient(null)
  }

  const markDone = (sessionId: string) => {
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, done: true } : s))
    toast.success('Sesión marcada como completada ✓')
  }

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault()
    const plan = plans.find(p => p.id === ncPlan)
    const newClient: Client = {
      id: crypto.randomUUID(),
      name: ncName,
      email: ncEmail,
      phone: ncPhone || undefined,
      level: 1,
      streak: 0,
      lastSeen: 'Recién añadido',
      plan: plan?.name ?? 'Sin plan',
      progress: 0,
      status: 'active',
      joinDate: new Date().toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
      goals: ncGoals || 'Por definir',
    }
    setClients(prev => [newClient, ...prev])
    setNewClientModal(false)
    setNcName(''); setNcEmail(''); setNcPhone(''); setNcPlan('p1'); setNcGoals('')
    toast.success(`¡Cliente ${ncName} añadido correctamente!`)
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
        <button onClick={() => setNewClientModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> {t('addClient')}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-surface-100 rounded-xl w-fit">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={cn('flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              tab === key ? 'bg-brand-500 text-white shadow' : 'text-white/50 hover:text-white')}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab === 'overview' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: t('activeClients'),        value: clients.filter(c => c.status === 'active').length, icon: Users,      color: 'text-brand-400',  bg: 'bg-brand-500/10'  },
              { label: t('sessionsToday'),        value: sessions.filter(s => s.time.startsWith('Hoy')).length, icon: Dumbbell, color: 'text-green-400', bg: 'bg-green-500/10'  },
              { label: t('avgProgress'),          value: `${Math.round(clients.reduce((a, c) => a + c.progress, 0) / clients.length)}%`, icon: TrendingUp, color: 'text-orange-400', bg: 'bg-orange-500/10' },
              { label: t('unlockedAchievements'), value: '14', icon: Award, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
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
            <div className="card space-y-4">
              <h2 className="font-semibold">{t('recentClients')}</h2>
              {clients.slice(0, 4).map(c => (
                <div key={c.id} className="flex items-center gap-3 cursor-pointer hover:bg-surface-100 -mx-2 px-2 py-1 rounded-lg transition-colors" onClick={() => setClientDetail(c)}>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-cyan-400 flex items-center justify-center text-xs font-bold shrink-0">
                    {c.name.split(' ').map(n => n[0]).join('')}
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

            <div className="card space-y-4">
              <h2 className="font-semibold">{t('todaySessions')}</h2>
              {sessions.filter(s => s.time.startsWith('Hoy')).map(s => (
                <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl bg-surface-100">
                  <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', s.done ? 'bg-green-500/20' : 'bg-brand-500/20')}>
                    {s.done ? <CheckCircle2 size={15} className="text-green-400" /> : <Clock size={15} className="text-brand-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{s.client}</p>
                    <p className="text-xs text-white/40">{s.type}</p>
                    {s.done && s.notes && <p className="text-xs text-white/30 mt-0.5 italic">{s.notes}</p>}
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
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('searchClient')} className="input pl-9" />
          </div>
          <div className="space-y-3">
            {filtered.map((c, i) => (
              <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="card flex items-center gap-4 hover:border-white/15 transition-colors">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-brand-500 to-cyan-400 flex items-center justify-center text-sm font-bold shrink-0">
                  {c.name.split(' ').map(n => n[0]).join('')}
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
                  <button onClick={() => setClientDetail(c)} className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
                    <Activity size={15} />
                  </button>
                  <button onClick={() => setClientDetail(c)} className="p-2 rounded-lg hover:bg-white/10 text-white/20 hover:text-white transition-colors">
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
          {plans.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="card hover:border-white/15 transition-colors cursor-pointer group" onClick={() => setSelectedPlan(p)}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold">{p.name}</h3>
                  <p className="text-xs text-white/40 mt-0.5">{p.duration} · {p.daysPerWeek} días/semana</p>
                </div>
                <span className="badge badge-brand">{p.clients} clientes</span>
              </div>
              <p className="text-xs text-white/50 mb-4 leading-relaxed">{p.desc}</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-surface-100 rounded-xl p-3 text-center">
                  <p className="text-lg font-bold">{p.sessions}</p>
                  <p className="text-xs text-white/40">Sesiones totales</p>
                </div>
                <div className="bg-surface-100 rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-brand-400">{p.clients}</p>
                  <p className="text-xs text-white/40">Clientes activos</p>
                </div>
              </div>
              <button className="mt-4 w-full btn-secondary text-sm py-2 group-hover:border-brand-500/30 transition-colors">
                {t('viewPlan')} <ChevronRight size={14} className="inline" />
              </button>
            </motion.div>
          ))}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}
            className="card border-dashed border-white/10 flex items-center justify-center cursor-pointer hover:border-brand-500/30 transition-colors group"
            onClick={() => toast.success('Funcionalidad de crear plan disponible. Por ahora usa los planes existentes.')}>
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
          {['Hoy', 'Mañana'].map(day => (
            <div key={day}>
              <h3 className="text-sm font-semibold text-white/40 uppercase tracking-wide mb-2">{day}</h3>
              {sessions.filter(s => s.time.startsWith(day)).map((s, i) => (
                <motion.div key={s.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-surface-100 hover:bg-surface-200 transition-colors mb-2">
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', s.done ? 'bg-green-500/20' : 'bg-brand-500/20')}>
                    {s.done ? <CheckCircle2 size={18} className="text-green-400" /> : <Target size={18} className="text-brand-400" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{s.client}</p>
                    <p className="text-xs text-white/40">{s.type}</p>
                    {s.done && s.notes && <p className="text-xs text-success/70 mt-0.5">{s.notes}</p>}
                  </div>
                  <span className="text-sm text-white/50 font-medium">{s.time.replace(`${day} `, '')}</span>
                  {s.done
                    ? <span className="badge badge-success text-xs">Completada</span>
                    : <button onClick={() => markDone(s.id)} className="badge badge-brand text-xs cursor-pointer hover:bg-brand-500/30 transition-colors">Pendiente</button>
                  }
                </motion.div>
              ))}
            </div>
          ))}
        </motion.div>
      )}

      {/* Plan detail modal */}
      {selectedPlan && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={() => setSelectedPlan(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            onClick={e => e.stopPropagation()}
            className="glass border border-white/10 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center shrink-0">
                  <Dumbbell size={18} className="text-brand-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{selectedPlan.name}</h3>
                  <p className="text-xs text-white/40">{selectedPlan.duration} · {selectedPlan.daysPerWeek} días/semana</p>
                </div>
              </div>
              <button onClick={() => setSelectedPlan(null)} className="btn-ghost p-1.5"><X size={16} /></button>
            </div>

            <p className="text-sm text-white/60 mb-5 leading-relaxed">{selectedPlan.desc}</p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { label: 'Sesiones', value: selectedPlan.sessions, icon: Calendar, color: 'text-brand-400' },
                { label: 'Clientes', value: selectedPlan.clients,  icon: Users,    color: 'text-green-400' },
                { label: 'Semanas',  value: selectedPlan.weeks,    icon: Star,     color: 'text-orange-400' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="text-center p-3 bg-surface-100 rounded-xl">
                  <Icon size={16} className={cn(color, 'mx-auto mb-1')} />
                  <p className={cn('text-xl font-bold', color)}>{value}</p>
                  <p className="text-[10px] text-white/40">{label}</p>
                </div>
              ))}
            </div>

            {/* Goals */}
            <div className="mb-5">
              <p className="text-xs text-white/40 mb-2 uppercase tracking-wide">Objetivos del plan</p>
              <div className="space-y-2">
                {selectedPlan.goals.map((goal, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <Target size={13} className="text-brand-400 shrink-0" />
                    <span className="text-white/70">{goal}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Exercises */}
            <div className="mb-5">
              <p className="text-xs text-white/40 mb-2 uppercase tracking-wide">Ejercicios principales</p>
              <div className="grid grid-cols-2 gap-2">
                {selectedPlan.exercises.map((ex, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-surface-100 rounded-lg text-xs">
                    <Flame size={11} className="text-orange-400 shrink-0" />
                    <span className="text-white/70">{ex}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Clients on this plan */}
            <div>
              <p className="text-xs text-white/40 mb-2 uppercase tracking-wide">Clientes en este plan</p>
              <div className="space-y-2">
                {clients.filter(c => c.plan === selectedPlan.name).map(c => (
                  <div key={c.id} className="flex items-center gap-3 p-2.5 bg-surface-100 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-cyan-400 flex items-center justify-center text-xs font-bold shrink-0">
                      {c.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{c.name}</p>
                      <p className="text-xs text-white/40">{c.progress}% completado</p>
                    </div>
                    <div className="w-16 h-1.5 bg-surface-200 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-500 rounded-full" style={{ width: `${c.progress}%` }} />
                    </div>
                  </div>
                ))}
                {clients.filter(c => c.plan === selectedPlan.name).length === 0 && (
                  <p className="text-xs text-white/30 text-center py-2">Sin clientes asignados</p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Client detail modal */}
      {clientDetail && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={() => setClientDetail(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            onClick={e => e.stopPropagation()}
            className="glass border border-white/10 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-cyan-400 flex items-center justify-center text-sm font-bold shrink-0">
                  {clientDetail.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="font-semibold">{clientDetail.name}</h3>
                  <div className="flex items-center gap-2">
                    <div className={cn('w-1.5 h-1.5 rounded-full', clientDetail.status === 'active' ? 'bg-green-400' : 'bg-white/20')} />
                    <p className="text-xs text-white/40">{clientDetail.status === 'active' ? 'Activo' : 'Inactivo'} · desde {clientDetail.joinDate}</p>
                  </div>
                </div>
              </div>
              <button onClick={() => setClientDetail(null)} className="btn-ghost p-1.5"><X size={16} /></button>
            </div>

            {/* Contact */}
            <div className="space-y-2 mb-5">
              <div className="flex items-center gap-2 text-sm text-white/60">
                <Mail size={14} className="text-brand-400" />
                {clientDetail.email}
              </div>
              {clientDetail.phone && (
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <Phone size={14} className="text-brand-400" />
                  {clientDetail.phone}
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { label: 'Nivel',    value: clientDetail.level,    color: 'text-brand-400' },
                { label: 'Racha',    value: `${clientDetail.streak}d`, color: 'text-orange-400' },
                { label: 'Progreso', value: `${clientDetail.progress}%`, color: 'text-green-400' },
              ].map(({ label, value, color }) => (
                <div key={label} className="text-center p-3 bg-surface-100 rounded-xl">
                  <p className={cn('text-xl font-bold', color)}>{value}</p>
                  <p className="text-[10px] text-white/40">{label}</p>
                </div>
              ))}
            </div>

            {/* Progress bar */}
            <div className="mb-5">
              <div className="flex justify-between text-xs text-white/40 mb-1.5">
                <span>Progreso del plan</span>
                <span>{clientDetail.progress}%</span>
              </div>
              <div className="h-2.5 bg-surface-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-brand-500 to-cyan-400 rounded-full transition-all" style={{ width: `${clientDetail.progress}%` }} />
              </div>
            </div>

            {/* Plan & goals */}
            <div className="space-y-3 mb-5">
              <div className="p-3 bg-surface-100 rounded-xl">
                <p className="text-xs text-white/40 mb-1">Plan actual</p>
                <p className="text-sm font-semibold">{clientDetail.plan}</p>
              </div>
              <div className="p-3 bg-surface-100 rounded-xl">
                <p className="text-xs text-white/40 mb-1">Objetivos</p>
                <p className="text-sm text-white/70">{clientDetail.goals}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => { setClientDetail(null); setMsgClient(clientDetail) }} className="btn-secondary flex-1 text-sm">
                <MessageSquare size={14} /> Mensaje
              </button>
              <button onClick={() => { setClientDetail(null); toast.success('Informe de progreso generado') }} className="btn-primary flex-1 text-sm">
                <TrendingUp size={14} /> Ver progreso
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add client modal */}
      {newClientModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={() => setNewClientModal(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            onClick={e => e.stopPropagation()}
            className="glass border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-brand-400" />
                <h3 className="font-semibold">{t('addClient')}</h3>
              </div>
              <button onClick={() => setNewClientModal(false)} className="btn-ghost p-1.5"><X size={16} /></button>
            </div>
            <form onSubmit={handleAddClient} className="space-y-4">
              <div>
                <label className="text-xs text-white/40 mb-1 block">Nombre completo *</label>
                <input required value={ncName} onChange={e => setNcName(e.target.value)}
                  placeholder="Ej. Juan García" className="input text-sm" />
              </div>
              <div>
                <label className="text-xs text-white/40 mb-1 block">Email *</label>
                <input required type="email" value={ncEmail} onChange={e => setNcEmail(e.target.value)}
                  placeholder="juan@email.com" className="input text-sm" />
              </div>
              <div>
                <label className="text-xs text-white/40 mb-1 block">Teléfono</label>
                <input value={ncPhone} onChange={e => setNcPhone(e.target.value)}
                  placeholder="+34 600 000 000" className="input text-sm" />
              </div>
              <div>
                <label className="text-xs text-white/40 mb-1 block">Plan asignado</label>
                <select value={ncPlan} onChange={e => setNcPlan(e.target.value)} className="input text-sm" style={{ colorScheme: 'dark' }}>
                  {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-white/40 mb-1 block">Objetivos del cliente</label>
                <textarea value={ncGoals} onChange={e => setNcGoals(e.target.value)}
                  placeholder="Ej. Perder 5kg, mejorar resistencia..." rows={2}
                  className="input text-sm resize-none" />
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setNewClientModal(false)} className="btn-secondary flex-1 text-sm">{t('common:cancel')}</button>
                <button type="submit" className="btn-primary flex-1 text-sm"><Plus size={15} /> Añadir cliente</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Message modal */}
      {msgClient && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={() => setMsgClient(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} onClick={e => e.stopPropagation()}
            className="glass border border-white/10 rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-cyan-400 flex items-center justify-center text-xs font-bold">
                  {msgClient.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="font-semibold text-sm">{msgClient.name}</p>
                  <p className="text-xs text-white/40">{t('directMessage')}</p>
                </div>
              </div>
              <button onClick={() => setMsgClient(null)} className="btn-ghost p-1.5"><X size={16} /></button>
            </div>
            <textarea value={msgText} onChange={e => setMsgText(e.target.value)} placeholder={t('writeMessage')} className="input w-full h-28 resize-none text-sm" />
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
