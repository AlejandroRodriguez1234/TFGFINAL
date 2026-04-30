import { useAuthStore } from '@store/authStore'
import {
  Activity, Dumbbell, Flame, Droplets, Moon,
  ChevronRight, Trophy, Leaf, TrendingUp,
  Play, Target, Award, Clock,
} from 'lucide-react'
import { motion } from 'framer-motion'
import {
  RadialBarChart, RadialBar, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts'
import { Link } from 'react-router-dom'

const weekData = [
  { day: 'L', calories: 2100, target: 2200 },
  { day: 'M', calories: 1950, target: 2200 },
  { day: 'X', calories: 2300, target: 2200 },
  { day: 'J', calories: 2050, target: 2200 },
  { day: 'V', calories: 2400, target: 2200 },
  { day: 'S', calories: 1800, target: 2200 },
  { day: 'D', calories: 2150, target: 2200 },
]

const activityRings = [
  { name: 'Movimiento', value: 78, fill: '#ef4444' },
  { name: 'Ejercicio',  value: 65, fill: '#0ea5e9' },
  { name: 'Pie',        value: 90, fill: '#22c55e' },
]

const recentAchievements = [
  { Icon: Flame,  bg: 'bg-orange-500/15', color: 'text-orange-400', title: 'Racha de 7 días',  desc: '7 días consecutivos entrenando' },
  { Icon: Trophy, bg: 'bg-yellow-500/15', color: 'text-yellow-400', title: 'Primer PR',        desc: 'Press banca: 80 kg x 5 reps' },
  { Icon: Leaf,   bg: 'bg-green-500/15',  color: 'text-green-400',  title: 'Semana verde',     desc: 'Objetivos nutricionales al 100%' },
]

const upcomingWorkouts = [
  { name: 'Pecho y Tríceps', time: 'Hoy 18:00', duration: '60 min', difficulty: 'Intermedio' },
  { name: 'Piernas',         time: 'Mañana',     duration: '75 min', difficulty: 'Avanzado' },
]

const statsCards = [
  { Icon: Flame,    label: 'Calorías',   value: '1,840', sub: 'de 2,200 kcal',    color: 'text-orange-400', bg: 'bg-orange-500/10', bar: 84 },
  { Icon: Dumbbell, label: 'Ejercicios', value: '3',     sub: 'de 4 completados', color: 'text-brand-400',  bg: 'bg-brand-500/10',  bar: 75 },
  { Icon: Droplets, label: 'Agua',       value: '1.8 L', sub: 'de 2.5 L',         color: 'text-cyan-400',   bg: 'bg-cyan-500/10',   bar: 72 },
  { Icon: Moon,     label: 'Sueño',      value: '7h 20', sub: 'Buena calidad',    color: 'text-purple-400', bg: 'bg-purple-500/10', bar: 92 },
]

export default function DashboardPage() {
  const { user } = useAuthStore()

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Buenos días' : hour < 20 ? 'Buenas tardes' : 'Buenas noches'
  const xpProgress = (user?.xp ?? 0) % 1000
  const xpPct = xpProgress / 10

  return (
    <div className="space-y-6">

      {/* HERO */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 via-brand-500 to-cyan-500 p-6 md:p-8"
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 w-48 h-48 rounded-full bg-cyan-400/10 blur-2xl" />
          {[0,1,2,3,4].map((i) => (
            <div key={i} className="absolute rounded-full border border-white/10"
              style={{ width: `${(i+1)*80}px`, height: `${(i+1)*80}px`, top: '50%', left: '80%', transform: 'translate(-50%,-50%)', opacity: 0.3 - i * 0.05 }} />
          ))}
        </div>

        <div className="relative flex items-center justify-between gap-4">
          <div>
            <p className="text-white/70 text-sm font-medium">{greeting},</p>
            <h1 className="text-4xl font-display font-bold text-white mt-1 tracking-tight">{user?.firstName}</h1>
            <p className="text-white/60 text-sm mt-1">Aquí está tu resumen de hoy</p>
            <div className="mt-4 w-56">
              <div className="flex justify-between text-xs text-white/60 mb-1.5">
                <span className="font-semibold">Nivel {user?.level ?? 1}</span>
                <span>{xpProgress} / 1000 XP</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${xpPct}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                  className="h-full bg-white rounded-full"
                />
              </div>
            </div>
          </div>
          <div className="hidden md:flex flex-col items-end gap-3 shrink-0">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 border border-white/20">
              <Trophy size={18} className="text-yellow-300" />
              <div className="text-right">
                <p className="text-[10px] text-white/60 uppercase tracking-wide">Racha</p>
                <p className="text-xl font-bold text-white leading-none">{user?.streakDays ?? 0} días</p>
              </div>
            </div>
            <Link to="/gym/workout/quick" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-brand-600 font-semibold text-sm hover:bg-white/90 transition-colors">
              <Play size={15} /> Iniciar entreno
            </Link>
          </div>
        </div>
      </motion.div>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map(({ Icon, label, value, sub, color, bg, bar }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.07 }} className="card">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon size={18} className={color} />
              </div>
              <TrendingUp size={13} className="text-success opacity-60" />
            </div>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            <p className="text-xs font-medium text-white/50 mt-0.5">{label}</p>
            <p className="text-[11px] text-white/30 mt-0.5">{sub}</p>
            <div className="h-1 bg-surface-200 rounded-full mt-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${bar}%` }}
                transition={{ duration: 0.9, delay: 0.3 + i * 0.07, ease: 'easeOut' }}
                className={`h-full rounded-full ${bg}`}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* CHARTS */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-semibold">Calorías esta semana</h2>
              <p className="text-xs text-white/40 mt-0.5">Promedio: 2,107 kcal / día</p>
            </div>
            <span className="badge badge-brand text-xs">Esta semana</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={weekData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="calGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#0ea5e9" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" />
              <XAxis dataKey="day" tick={{ fill: '#ffffff40', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#ffffff40', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#141414', border: '1px solid #2a2a2a', borderRadius: 10, fontSize: 12 }} labelStyle={{ color: '#fff', fontWeight: 600 }} />
              <Area type="monotone" dataKey="calories" stroke="#0ea5e9" strokeWidth={2.5} fill="url(#calGrad)" name="Calorías" dot={false} activeDot={{ r: 5, fill: '#0ea5e9' }} />
              <Area type="monotone" dataKey="target" stroke="#ffffff15" strokeWidth={1} strokeDasharray="5 5" fill="none" name="Objetivo" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card flex flex-col">
          <h2 className="font-semibold mb-1">Actividad hoy</h2>
          <p className="text-xs text-white/40 mb-3">Anillos de progreso</p>
          <div className="relative flex-1 min-h-[140px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart innerRadius="25%" outerRadius="90%" data={activityRings} startAngle={90} endAngle={-270}>
                <RadialBar dataKey="value" cornerRadius={6} background={{ fill: '#1a1a1a' }} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Activity size={18} className="text-brand-400 mx-auto" />
                <p className="text-xs text-white/40 mt-1">77%</p>
              </div>
            </div>
          </div>
          <div className="space-y-2 mt-3">
            {activityRings.map(({ name, value, fill }) => (
              <div key={name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: fill }} />
                  <span className="text-xs text-white/50">{name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1 bg-surface-200 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${value}%`, background: fill }} />
                  </div>
                  <span className="text-xs font-medium w-8 text-right">{value}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BOTTOM */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Próximos entrenamientos</h2>
            <Link to="/gym" className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors">
              Ver todos <ChevronRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {upcomingWorkouts.map((w) => (
              <div key={w.name} className="flex items-center justify-between p-3 rounded-xl bg-surface-100 hover:bg-surface-200 transition-colors cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center">
                    <Dumbbell size={17} className="text-brand-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{w.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Clock size={11} className="text-white/30" />
                      <p className="text-xs text-white/40">{w.time} · {w.duration}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/30 hidden sm:block">{w.difficulty}</span>
                  <ChevronRight size={15} className="text-white/20 group-hover:text-white/60 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Logros recientes</h2>
            <Link to="/progress" className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors">
              Ver <ChevronRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {recentAchievements.map(({ Icon, bg, color, title, desc }) => (
              <div key={title} className="flex items-center gap-3 p-3 rounded-xl bg-surface-100 hover:bg-surface-200 transition-colors">
                <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                  <Icon size={16} className={color} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{title}</p>
                  <p className="text-xs text-white/40 truncate">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TODAY'S GOALS */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target size={17} className="text-brand-400" />
            <h2 className="font-semibold">Objetivos de hoy</h2>
          </div>
          <span className="text-xs text-white/40">3 de 4 completados</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Entrenamiento', done: true,  Icon: Dumbbell, color: 'text-brand-400'  },
            { label: 'Agua 2.5 L',   done: false, Icon: Droplets, color: 'text-cyan-400'   },
            { label: 'Calorías',     done: true,  Icon: Flame,    color: 'text-orange-400' },
            { label: 'Hábitos 3/4',  done: true,  Icon: Award,    color: 'text-purple-400' },
          ].map(({ label, done, Icon, color }) => (
            <div key={label} className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all ${done ? 'bg-success/5 border-success/20' : 'bg-surface-100 border-white/5'}`}>
              <Icon size={16} className={done ? 'text-success' : color} />
              <span className={`text-xs font-medium ${done ? 'text-success' : 'text-white/40'}`}>{label}</span>
            </div>
          ))}
        </div>
      </motion.div>

    </div>
  )
}
