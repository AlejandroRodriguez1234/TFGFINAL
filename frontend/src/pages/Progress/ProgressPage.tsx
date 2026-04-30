import { useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Camera, Scale, Award, BarChart2, ChevronRight } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { cn } from '@utils/cn'

const weightData = [
  { date: 'Mar 1',  weight: 82.5, fat: 18.2, muscle: 42.1 },
  { date: 'Mar 8',  weight: 81.8, fat: 17.8, muscle: 42.3 },
  { date: 'Mar 15', weight: 81.2, fat: 17.5, muscle: 42.6 },
  { date: 'Mar 22', weight: 80.9, fat: 17.1, muscle: 42.8 },
  { date: 'Mar 29', weight: 80.4, fat: 16.8, muscle: 43.1 },
  { date: 'Abr 5',  weight: 79.8, fat: 16.5, muscle: 43.4 },
  { date: 'Abr 12', weight: 79.5, fat: 16.2, muscle: 43.7 },
]

const liftData = [
  { exercise: 'Press banca', pr: 100, current: 95 },
  { exercise: 'Sentadilla', pr: 130, current: 120 },
  { exercise: 'Peso muerto', pr: 150, current: 140 },
  { exercise: 'Press militar', pr: 75, current: 70 },
]

const achievements: { icon: string; name: string; desc: string; xp: number; date: string }[] = [
  { icon: '🔥', name: 'On Fire',       desc: '7 días de racha',        xp: 50,  date: 'Hoy' },
  { icon: '💪', name: 'Primer 100kg',  desc: 'Press banca 100kg',      xp: 200, date: 'Hace 2 días' },
  { icon: '🥗', name: 'Semana verde',  desc: '7 días objetivo nutri.', xp: 100, date: 'Hace 5 días' },
  { icon: '🏃', name: '5K Runner',     desc: 'Cardio 5km completado',  xp: 75,  date: 'Hace 1 semana' },
]

const tabs = ['Peso', 'Fuerza', 'Logros'] as const

export default function ProgressPage() {
  const [tab, setTab] = useState<typeof tabs[number]>('Peso')

  const latest = weightData[weightData.length - 1]
  const first  = weightData[0]
  const diffWeight = latest.weight - first.weight
  const diffFat    = latest.fat - first.fat

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Progreso</h1>
          <p className="text-white/40 text-sm mt-1">Tu evolución en el tiempo</p>
        </div>
        <button className="btn-secondary text-sm px-4 py-2.5">
          <Scale size={16} /> Añadir medición
        </button>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Peso actual',  value: `${latest.weight} kg`, change: diffWeight, unit: 'kg', good: diffWeight < 0 },
          { label: '% Grasa',      value: `${latest.fat}%`,      change: diffFat,    unit: '%',  good: diffFat < 0 },
          { label: 'Masa muscular', value: `${latest.muscle} kg`, change: latest.muscle - first.muscle, unit: 'kg', good: true },
          { label: 'IMC',          value: '24.8',                change: -0.8,       unit: '',   good: true },
        ].map(({ label, value, change, unit, good }) => (
          <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card">
            <p className="text-xs text-white/40 mb-1">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
            <div className={cn('flex items-center gap-1 text-xs mt-1', good ? 'text-success' : 'text-danger')}>
              {good ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
              {change > 0 ? '+' : ''}{change.toFixed(1)}{unit}
              <span className="text-white/30 ml-1">este mes</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Body scan prompt */}
      <div className="card border border-brand-500/20 bg-brand-500/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center">
            <Camera size={18} className="text-brand-400" />
          </div>
          <div>
            <p className="font-semibold text-sm">Análisis de postura IA</p>
            <p className="text-xs text-white/40">Sube una foto para analizar tu postura y composición corporal</p>
          </div>
        </div>
        <button className="btn-primary text-sm px-4 py-2 shrink-0">Analizar</button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-surface-100 w-fit">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-all', tab === t ? 'bg-brand-500 text-white' : 'text-white/50 hover:text-white')}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'Peso' && (
        <div className="card">
          <h2 className="font-semibold mb-4">Evolución del peso</h2>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={weightData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2e2e2e" />
              <XAxis dataKey="date" tick={{ fill: '#ffffff50', fontSize: 11 }} />
              <YAxis domain={['dataMin - 1', 'dataMax + 1']} tick={{ fill: '#ffffff50', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #2e2e2e', borderRadius: 8 }} />
              <Line type="monotone" dataKey="weight"  stroke="#0ea5e9" strokeWidth={2} dot={{ fill: '#0ea5e9', r: 4 }} name="Peso (kg)" />
              <Line type="monotone" dataKey="fat"     stroke="#f97316" strokeWidth={2} dot={{ fill: '#f97316', r: 4 }} name="% Grasa" />
              <Line type="monotone" dataKey="muscle"  stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e', r: 4 }} name="Músculo (kg)" />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-2 text-xs text-white/40">
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-brand-500 inline-block" />Peso</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-orange-400 inline-block" />% Grasa</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-success inline-block" />Músculo</span>
          </div>
        </div>
      )}

      {tab === 'Fuerza' && (
        <div className="card">
          <h2 className="font-semibold mb-4">Récords personales</h2>
          <div className="space-y-4">
            {liftData.map((l) => (
              <div key={l.exercise}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium">{l.exercise}</span>
                  <div className="flex gap-3 text-xs text-white/50">
                    <span>Actual: <strong className="text-white">{l.current}kg</strong></span>
                    <span>PR: <strong className="text-yellow-400">{l.pr}kg</strong></span>
                  </div>
                </div>
                <div className="h-2 bg-surface-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-brand-500 to-cyan-400 rounded-full relative" style={{ width: `${(l.current / l.pr) * 100}%` }}>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-glow border border-brand-500" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'Logros' && (
        <div className="space-y-3">
          {achievements.map((a, i) => (
            <motion.div key={a.name} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
              className="card flex items-center gap-4"
            >
              <div className="text-3xl">{a.icon}</div>
              <div className="flex-1">
                <p className="font-semibold text-sm">{a.name}</p>
                <p className="text-xs text-white/40">{a.desc}</p>
              </div>
              <div className="text-right">
                <p className="text-brand-400 font-bold text-sm">+{a.xp} XP</p>
                <p className="text-xs text-white/30">{a.date}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
