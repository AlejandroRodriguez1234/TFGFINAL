import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { TrendingUp, TrendingDown, Camera, Scale, Flame, Trophy, Leaf, Activity, X, Plus, Loader2 } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { cn } from '@utils/cn'
import toast from 'react-hot-toast'
import { apiClient } from '@services/api'

interface BodyMeasurement {
  id: string
  date: string
  weight: number
  bodyFat?: number
  muscleMass?: number
  bmi?: number
  notes?: string
}

interface BodyComposition {
  current: BodyMeasurement
  changes: { weight: number; bodyFat?: number; muscleMass?: number }
}

interface ChartPoint {
  date: string
  weight: number
  fat?: number
  muscle?: number
  bmi?: number
}

const liftData = [
  { exercise: 'Press banca',   pr: 100, current: 95  },
  { exercise: 'Sentadilla',    pr: 130, current: 120 },
  { exercise: 'Peso muerto',   pr: 150, current: 140 },
  { exercise: 'Press militar', pr: 75,  current: 70  },
]

type TabKey = 'weight' | 'strength' | 'achievements'

function fmtDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })
}

export default function ProgressPage() {
  const { t } = useTranslation()
  const [tab, setTab]               = useState<TabKey>('weight')
  const [measureModal, setMeasureModal] = useState(false)
  const [mWeight, setMWeight]       = useState('')
  const [mHeight, setMHeight]       = useState('')
  const [mFat, setMFat]             = useState('')
  const [mMuscle, setMuscle]        = useState('')
  const [mNotes, setMNotes]         = useState('')

  const [chartData, setChartData]   = useState<ChartPoint[]>([])
  const [bodyComp, setBodyComp]     = useState<BodyComposition | null>(null)
  const [bmiChange, setBmiChange]   = useState(0)
  const [loading, setLoading]       = useState(true)
  const [saving, setSaving]         = useState(false)

  const fetchWeightData = useCallback(async () => {
    try {
      const [measRes, compRes] = await Promise.all([
        apiClient.get<BodyMeasurement[]>('/progress/measurements', { params: { limit: 30 } }),
        apiClient.get<BodyComposition>('/progress/body-composition'),
      ])

      const raw = measRes.data
      const points: ChartPoint[] = [...raw].reverse().map((m) => ({
        date:   fmtDate(m.date),
        weight: m.weight,
        fat:    m.bodyFat,
        muscle: m.muscleMass,
        bmi:    m.bmi,
      }))
      setChartData(points)
      setBodyComp(compRes.data)

      if (raw.length >= 2) {
        const oldest = raw[raw.length - 1]
        const newest = raw[0]
        if (oldest.bmi != null && newest.bmi != null) {
          setBmiChange(parseFloat((newest.bmi - oldest.bmi).toFixed(1)))
        }
      }
    } catch {
      toast.error('Error cargando datos de peso')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchWeightData() }, [fetchWeightData])

  const current = bodyComp?.current
  const changes = bodyComp?.changes

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'weight',       label: t('progress:tabWeight')       },
    { key: 'strength',     label: t('progress:tabStrength')     },
    { key: 'achievements', label: t('progress:tabAchievements') },
  ]

  const achievements = [
    { Icon: Flame,    iconClass: 'text-orange-400', name: 'On Fire',      desc: t('progress:achieveStreakDesc'), xp: 50,  date: t('progress:dateToday')  },
    { Icon: Trophy,   iconClass: 'text-yellow-400', name: 'Primer 100kg', desc: t('progress:achievePRDesc'),    xp: 200, date: t('progress:daysAgo2')   },
    { Icon: Leaf,     iconClass: 'text-green-400',  name: 'Semana verde', desc: t('progress:achieveGreenDesc'), xp: 100, date: t('progress:daysAgo5')   },
    { Icon: Activity, iconClass: 'text-brand-400',  name: '5K Runner',    desc: t('progress:achieveRunDesc'),   xp: 75,  date: t('progress:weeksAgo1')  },
  ]

  const metrics = [
    {
      label: t('progress:currentWeight'),
      value:  current ? `${current.weight} kg`                    : '—',
      change: changes?.weight     ?? 0,
      unit:   'kg',
      good:   (changes?.weight    ?? 0) < 0,
    },
    {
      label: t('progress:fatPercent'),
      value:  current?.bodyFat  != null ? `${current.bodyFat}%`   : '—',
      change: changes?.bodyFat   ?? 0,
      unit:   '%',
      good:   (changes?.bodyFat  ?? 0) < 0,
    },
    {
      label: t('progress:muscleMass'),
      value:  current?.muscleMass != null ? `${current.muscleMass} kg` : '—',
      change: changes?.muscleMass ?? 0,
      unit:   'kg',
      good:   true,
    },
    {
      label: t('progress:bmi'),
      value:  current?.bmi != null ? current.bmi.toFixed(1) : '—',
      change: bmiChange,
      unit:   '',
      good:   bmiChange <= 0,
    },
  ]

  const handleMeasureSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await apiClient.post('/progress/measurements', {
        weight:                    parseFloat(mWeight),
        ...(mHeight && { height:     parseFloat(mHeight)  }),
        ...(mFat    && { bodyFat:    parseFloat(mFat)    }),
        ...(mMuscle && { muscleMass: parseFloat(mMuscle) }),
        ...(mNotes  && { notes: mNotes }),
      })
      setMeasureModal(false)
      setMWeight(''); setMHeight(''); setMFat(''); setMuscle(''); setMNotes('')
      toast.success(t('progress:measurementSaved'))
      setLoading(true)
      await fetchWeightData()
    } catch {
      toast.error('Error guardando la medición')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">{t('progress:title')}</h1>
          <p className="text-white/40 text-sm mt-1">{t('progress:subtitle')}</p>
        </div>
        <button onClick={() => setMeasureModal(true)} className="btn-secondary text-sm px-4 py-2.5">
          <Scale size={16} /> {t('progress:addMeasurement')}
        </button>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map(({ label, value, change, unit, good }) => (
          <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card">
            <p className="text-xs text-white/40 mb-1">{label}</p>
            {loading ? (
              <div className="h-8 w-20 bg-surface-200 rounded animate-pulse mt-1" />
            ) : (
              <>
                <p className="text-2xl font-bold">{value}</p>
                <div className={cn('flex items-center gap-1 text-xs mt-1', good ? 'text-success' : 'text-danger')}>
                  {good ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
                  {change > 0 ? '+' : ''}{typeof change === 'number' ? change.toFixed(1) : change}{unit}
                  <span className="text-white/30 ml-1">{t('progress:thisMonth')}</span>
                </div>
              </>
            )}
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
            <p className="font-semibold text-sm">{t('progress:postureAI')}</p>
            <p className="text-xs text-white/40">{t('progress:postureAIDesc')}</p>
          </div>
        </div>
        <button className="btn-primary text-sm px-4 py-2 shrink-0">{t('progress:analyze')}</button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-surface-100 w-fit">
        {tabs.map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)} className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-all', tab === key ? 'bg-brand-500 text-white' : 'text-white/50 hover:text-white')}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'weight' && (
        <div className="card">
          <h2 className="font-semibold mb-4">{t('progress:weightEvolution')}</h2>

          {loading ? (
            <div className="h-60 flex items-center justify-center">
              <Loader2 size={28} className="animate-spin text-brand-400" />
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-60 flex flex-col items-center justify-center gap-2 text-white/40">
              <Scale size={32} className="opacity-40" />
              <p className="text-sm">{t('progress:noMeasurements', 'Aún no hay mediciones. Añade la primera.')}</p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2e2e2e" />
                  <XAxis dataKey="date" tick={{ fill: '#ffffff50', fontSize: 11 }} />
                  <YAxis domain={['dataMin - 1', 'dataMax + 1']} tick={{ fill: '#ffffff50', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #2e2e2e', borderRadius: 8 }} />
                  <Line type="monotone" dataKey="weight" stroke="#0ea5e9" strokeWidth={2} dot={{ fill: '#0ea5e9', r: 4 }} name={t('progress:legendWeight')} />
                  <Line type="monotone" dataKey="fat"    stroke="#f97316" strokeWidth={2} dot={{ fill: '#f97316', r: 4 }} name={t('progress:legendFat')}    />
                  <Line type="monotone" dataKey="muscle" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e', r: 4 }} name={t('progress:legendMuscle')} />
                </LineChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6 mt-2 text-xs text-white/40">
                <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-brand-500 inline-block" />{t('progress:legendWeight')}</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-orange-400 inline-block" />{t('progress:legendFat')}</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-success inline-block" />{t('progress:legendMuscle')}</span>
              </div>
            </>
          )}
        </div>
      )}

      {tab === 'strength' && (
        <div className="card">
          <h2 className="font-semibold mb-4">{t('progress:personalRecords')}</h2>
          <div className="space-y-4">
            {liftData.map((l) => (
              <div key={l.exercise}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium">{l.exercise}</span>
                  <div className="flex gap-3 text-xs text-white/50">
                    <span>{t('progress:current')}: <strong className="text-white">{l.current}kg</strong></span>
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

      {tab === 'achievements' && (
        <div className="space-y-3">
          {achievements.map((a, i) => (
            <motion.div key={a.name} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
              className="card flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-surface-100 flex items-center justify-center shrink-0">
                <a.Icon size={24} className={a.iconClass} />
              </div>
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

      {/* Measurement modal */}
      {measureModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={() => setMeasureModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="glass border border-white/10 rounded-2xl p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-lg">{t('progress:newMeasurement')}</h3>
              <button onClick={() => setMeasureModal(false)} className="btn-ghost p-1.5">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleMeasureSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/40 mb-1 block">{t('diet:weightKg')}</label>
                  <input
                    required
                    type="number"
                    step="0.1"
                    min="0"
                    value={mWeight}
                    onChange={(e) => setMWeight(e.target.value)}
                    placeholder="79.5"
                    className="input text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1 block">{t('diet:heightCm')}</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    max="300"
                    value={mHeight}
                    onChange={(e) => setMHeight(e.target.value)}
                    placeholder="175"
                    className="input text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1 block">{t('progress:bodyFatPercent')}</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={mFat}
                    onChange={(e) => setMFat(e.target.value)}
                    placeholder="16.2"
                    className="input text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1 block">{t('progress:muscleMassKg')}</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={mMuscle}
                    onChange={(e) => setMuscle(e.target.value)}
                    placeholder="43.7"
                    className="input text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-white/40 mb-1 block">{t('progress:notes')}</label>
                <textarea
                  value={mNotes}
                  onChange={(e) => setMNotes(e.target.value)}
                  placeholder={t('progress:notesPlaceholder')}
                  rows={3}
                  className="input text-sm resize-none"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setMeasureModal(false)} className="btn-secondary flex-1 text-sm">
                  {t('common:cancel')}
                </button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 text-sm">
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
                  {t('common:save')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
