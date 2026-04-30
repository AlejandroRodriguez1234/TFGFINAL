import { useAuthStore } from '@store/authStore'
import { motion } from 'framer-motion'
import { Edit, Dumbbell, Flame, Trophy, Zap, TrendingUp, Calendar } from 'lucide-react'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts'

const radarData = [
  { subject: 'Fuerza',      A: 80 },
  { subject: 'Resistencia', A: 65 },
  { subject: 'Nutrición',   A: 88 },
  { subject: 'Flexibilidad',A: 50 },
  { subject: 'Hábitos',     A: 75 },
  { subject: 'Social',      A: 60 },
]

export default function ProfilePage() {
  const { user } = useAuthStore()

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Cover + avatar */}
      <div className="card p-0 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-brand-600 via-brand-500 to-cyan-400" />
        <div className="px-6 pb-6 -mt-12">
          <div className="flex items-end justify-between">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-cyan-400 flex items-center justify-center text-3xl font-bold border-4 border-surface-50">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-success border-2 border-surface-50" />
            </div>
            <button className="btn-secondary text-sm px-3 py-2 mt-12">
              <Edit size={14} /> Editar perfil
            </button>
          </div>
          <div className="mt-4">
            <h1 className="text-2xl font-bold">{user?.firstName} {user?.lastName}</h1>
            <p className="text-white/50 text-sm">@{user?.username}</p>
            <div className="flex items-center gap-3 mt-3">
              <span className="badge badge-brand">Nivel {user?.level ?? 1}</span>
              {user?.role === 'ADMIN' && <span className="badge badge-danger">Admin</span>}
              <span className="text-xs text-white/40">Miembro desde {new Date(user?.createdAt ?? '').getFullYear()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Stats */}
        <div className="card">
          <h2 className="font-semibold mb-4">Estadísticas globales</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Dumbbell, label: 'Entrenamientos', value: '148', color: 'text-brand-400' },
              { icon: Flame,    label: 'Calorías totales', value: '92K', color: 'text-orange-400' },
              { icon: Trophy,   label: 'Logros',          value: '23', color: 'text-yellow-400' },
              { icon: Calendar, label: 'Días activos',    value: '64', color: 'text-green-400' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="text-center p-3 rounded-xl bg-surface-100">
                <Icon size={20} className={cn(color, 'mx-auto mb-1')} />
                <p className="text-xl font-bold">{value}</p>
                <p className="text-xs text-white/40 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Fitness radar */}
        <div className="card">
          <h2 className="font-semibold mb-2">Perfil de fitness</h2>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#2e2e2e" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#ffffff60', fontSize: 11 }} />
              <Radar name="Tú" dataKey="A" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* XP timeline */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Progresión de nivel</h2>
          <span className="badge badge-brand">{user?.xp ?? 0} XP total</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand-500 to-cyan-400 flex items-center justify-center shrink-0">
            <Zap size={24} className="text-white" />
          </div>
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-semibold">Nivel {user?.level ?? 1}</span>
              <span className="text-white/40">{(user?.xp ?? 0) % 1000} / 1000 XP para Nivel {(user?.level ?? 1) + 1}</span>
            </div>
            <div className="h-3 bg-surface-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${((user?.xp ?? 0) % 1000) / 10}%` }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-brand-500 to-cyan-400 rounded-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ')
}
