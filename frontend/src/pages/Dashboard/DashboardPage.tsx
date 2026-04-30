import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@store/authStore'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@services/api'
import {
  Activity, Dumbbell, Flame, Droplets, Moon, TrendingUp,
  Target, Award, ChevronRight, Zap, Trophy, Leaf,
} from 'lucide-react'
import { motion } from 'framer-motion'
import {
  RadialBarChart, RadialBar, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts'

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
  { name: 'Movimiento',    value: 78, fill: '#ef4444', max: 100 },
  { name: 'Ejercicio',     value: 65, fill: '#0ea5e9', max: 100 },
  { name: 'Estar en pie',  value: 90, fill: '#22c55e', max: 100 },
]

const recentAchievements = [
  {
    iconComponent: <Flame size={16} className="text-orange-400" />,
    iconBg: 'bg-orange-500/15',
    title: 'Racha de 7 días',
    desc: '¡7 días consecutivos entrenando!',
  },
  {
    iconComponent: <Trophy size={16} className="text-yellow-400" />,
    iconBg: 'bg-yellow-500/15',
    title: 'Primer PR',
    desc: 'Press banca: 80kg x 5 reps',
  },
  {
    iconComponent: <Leaf size={16} className="text-green-400" />,
    iconBg: 'bg-green-500/15',
    title: 'Semana verde',
    desc: 'Objetivos nutricionales cumplidos',
  },
]

const upcomingWorkouts = [
  { name: 'Pecho y Tríceps', time: 'Hoy 18:00', duration: '60 min', difficulty: 'intermediate' },
  { name: 'Piernas',         time: 'Mañana',    duration: '75 min', difficulty: 'advanced' },
]

export default function DashboardPage() {
  const { t } = useTranslation(['dashboard', 'common'])
  const { user } = useAuthStore()

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Buenos días' : hour < 20 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div>
          <p className="text-white/50 text-sm">{greeting},</p>
          <h1 className="text-3xl font-display font-bold mt-0.5">
            <span className="text-gradient">{user?.firstName}</span>
          </h1>
          <p className="text-white/40 text-sm mt-1">Aquí está tu resumen de hoy</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl glass border border-brand-500/20">
          <Trophy size={16} className="text-yellow-400" />
          <div>
            <p className="text-xs text-white/40">Racha</p>
            <p className="font-bold text-sm">{user?.streakDays ?? 0} días</p>
          </div>
        </div>
      </motion.div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Flame,    label: 'Calorías',   value: '1,840',  sub: 'de 2,200 kcal',      color: 'text-orange-400',  bg: 'bg-orange-500/10' },
          { icon: Dumbbell, label: 'Ejercicios',  value: '3',      sub: 'de 4 completados',   color: 'text-brand-400',   bg: 'bg-brand-500/10'  },
          { icon: Droplets, label: 'Agua',        value: '1.8L',   sub: 'de 2.5L objetivo',   color: 'text-cyan-400',    bg: 'bg-cyan-500/10'   },
          { icon: Moon,     label: 'Sueño',       value: '7h 20m', sub: 'Buena calidad',       color: 'text-purple-400',  bg: 'bg-purple-500/10' },
        ].map(({ icon: Icon, label, value, sub, color, bg }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card"
          >
            <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center mb-3`}>
              <Icon size={18} className={color} />
            </div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-white/40 mt-0.5">{label}</p>
            <p className="text-xs text-white/30 mt-1">{sub}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Weekly calories chart */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Calorías esta semana</h2>
            <span className="badge badge-brand">Promedio: 2,107 kcal</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={weekData}>
              <defs>
                <linearGradient id="calGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#0ea5e9" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2e2e2e" />
              <XAxis dataKey="day" tick={{ fill: '#ffffff50', fontSize: 12 }} />
              <YAxis tick={{ fill: '#ffffff50', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ background: '#1a1a1a', border: '1px solid #2e2e2e', borderRadius: 8 }}
                labelStyle={{ color: '#fff' }}
              />
              <Area type="monotone" dataKey="calories" stroke="#0ea5e9" strokeWidth={2} fill="url(#calGrad)" name="Calorías" />
              <Area type="monotone" dataKey="target" stroke="#ffffff20" strokeWidth={1} strokeDasharray="4 4" fill="none" name="Objetivo" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Activity rings */}
        <div className="card">
          <h2 className="font-semibold mb-4">Anillos de actividad</h2>
          <div className="relative h-40">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart innerRadius="30%" outerRadius="90%" data={activityRings} startAngle={90} endAngle={-270}>
                <RadialBar dataKey="value" cornerRadius={4} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center">
              <Activity size={20} className="text-brand-400" />
            </div>
          </div>
          <div className="space-y-2 mt-2">
            {activityRings.map(({ name, value, fill }) => (
              <div key={name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: fill }} />
                  <span className="text-white/60">{name}</span>
                </div>
                <span className="font-medium">{value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming workouts */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Próximos entrenamientos</h2>
            <a href="/gym" className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
              Ver todos <ChevronRight size={12} />
            </a>
          </div>
          <div className="space-y-3">
            {upcomingWorkouts.map((w) => (
              <div
                key={w.name}
                className="flex items-center justify-between p-3 rounded-xl bg-surface-100 hover:bg-surface-200 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-brand-500/20 flex items-center justify-center">
                    <Dumbbell size={16} className="text-brand-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{w.name}</p>
                    <p className="text-xs text-white/40">{w.time} · {w.duration}</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-white/20 group-hover:text-white/60 transition-colors" />
              </div>
            ))}
          </div>
        </div>

        {/* Recent achievements */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Logros recientes</h2>
            <a href="/progress" className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
              Ver todos <ChevronRight size={12} />
            </a>
          </div>
          <div className="space-y-3">
            {recentAchievements.map((a) => (
              <div key={a.title} className="flex items-center gap-3 p-3 rounded-xl bg-surface-100">
                <div className={`w-9 h-9 rounded-lg ${a.iconBg} flex items-center justify-center shrink-0`}>
                  {a.iconComponent}
                </div>
                <div>
                  <p className="text-sm font-medium">{a.title}</p>
                  <p className="text-xs text-white/40">{a.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* XP Progress */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="card flex items-center justify-between gap-6"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-cyan-400 flex items-center justify-center">
            <Zap size={22} className="text-white" />
          </div>
          <div>
            <p className="text-sm text-white/50">Nivel {user?.level ?? 1}</p>
            <p className="font-bold text-lg">{user?.xp ?? 0} XP</p>
          </div>
        </div>
        <div className="flex-1 max-w-xs">
          <div className="flex justify-between text-xs text-white/40 mb-1">
            <span>Progreso al siguiente nivel</span>
            <span>{(user?.xp ?? 0) % 1000} / 1000 XP</span>
          </div>
          <div className="h-2 bg-surface-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((user?.xp ?? 0) % 1000) / 10}%` }}
              transition={{ duration: 1, delay: 0.6, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-brand-500 to-cyan-400 rounded-full"
            />
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-white/40">Siguiente</p>
          <p className="font-semibold text-sm">Nivel {(user?.level ?? 1) + 1}</p>
        </div>
      </motion.div>
    </div>
  )
}
