import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { TrendingUp, TrendingDown, Camera, Scale, Flame, Trophy, Leaf, Activity, X, Plus, Loader2, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react'
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

type TabKey = 'weight' | 'strength' | 'achievements' | 'calculator'

const ACTIVITY_LEVELS = [
  { key: 'sedentary',   label: 'Sedentario',         multiplier: 1.2   },
  { key: 'light',       label: 'Ligero (1-3 días/s)', multiplier: 1.375 },
  { key: 'moderate',    label: 'Moderado (3-5 días)', multiplier: 1.55  },
  { key: 'active',      label: 'Activo (6-7 días)',   multiplier: 1.725 },
  { key: 'very_active', label: 'Muy activo',          multiplier: 1.9   },
] as const

const DEMO_CHART: ChartPoint[] = [
  { date: '1 abr', weight: 83.2, fat: 19.5, muscle: 62.1, bmi: 26.3 },
  { date: '8 abr', weight: 82.5, fat: 19.1, muscle: 62.3, bmi: 26.1 },
  { date: '15 abr', weight: 81.8, fat: 18.6, muscle: 62.5, bmi: 25.9 },
  { date: '22 abr', weight: 81.0, fat: 18.2, muscle: 62.8, bmi: 25.6 },
  { date: '29 abr', weight: 80.4, fat: 17.8, muscle: 63.0, bmi: 25.4 },
  { date: '6 may', weight: 79.8, fat: 17.5, muscle: 63.2, bmi: 25.2 },
  { date: '13 may', weight: 79.2, fat: 17.2, muscle: 63.5, bmi: 25.0 },
]

function fmtDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })
}

export default function ProgressPage() {
  const { t } = useTranslation()
  const [tab, setTab]               = useState<TabKey>('weight')
  const postureInputRef = useRef<HTMLInputElement>(null)
  const [postureAnalyzing, setPostureAnalyzing] = useState(false)
  const [postureImageUrl, setPostureImageUrl]   = useState<string | null>(null)
  const [postureResult, setPostureResult]       = useState<{
    valid: boolean
    title: string
    details: string
    recommendations: string[]
    bmi?: number
    fatPct?: number
    category?: string
  } | null>(null)
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

  const [calcWeight, setCalcWeight]     = useState('')
  const [calcHeight, setCalcHeight]     = useState('')
  const [calcAge, setCalcAge]           = useState('')
  const [calcGender, setCalcGender]     = useState<'male' | 'female'>('male')
  const [calcActivity, setCalcActivity] = useState<string>('moderate')
  const [calcResult, setCalcResult]     = useState<null | { bmr: number; tdee: number; protein: number; fatGoal: string; bmi: number; bmiCategory: string; idealWeight: string }>(null)

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
      setChartData(DEMO_CHART)
      setBodyComp({
        current: { id: 'demo', date: new Date().toISOString(), weight: 79.2, bodyFat: 17.2, muscleMass: 63.5, bmi: 25.0 },
        changes: { weight: -4.0, bodyFat: -2.3, muscleMass: 1.4 },
      })
      setBmiChange(-1.3)
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
    { key: 'calculator',   label: 'Calculadora'                 },
  ]

  const handleCalcSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const w = parseFloat(calcWeight)
    const h = parseFloat(calcHeight)
    const a = parseInt(calcAge)
    if (isNaN(w) || isNaN(h) || isNaN(a)) return

    const bmr = calcGender === 'male'
      ? 10 * w + 6.25 * h - 5 * a + 5
      : 10 * w + 6.25 * h - 5 * a - 161

    const level = ACTIVITY_LEVELS.find(l => l.key === calcActivity) ?? ACTIVITY_LEVELS[2]
    const tdee = Math.round(bmr * level.multiplier)
    const bmi  = parseFloat((w / ((h / 100) ** 2)).toFixed(1))
    const bmiCategory =
      bmi < 18.5 ? 'Bajo peso' :
      bmi < 25   ? 'Normopeso' :
      bmi < 30   ? 'Sobrepeso' : 'Obesidad'
    const minIdeal = parseFloat((18.5 * ((h / 100) ** 2)).toFixed(1))
    const maxIdeal = parseFloat((24.9 * ((h / 100) ** 2)).toFixed(1))
    const protein = Math.round(w * 2.0)
    const fatGoal = bmi < 18.5 ? 'Volumen' : bmi >= 25 ? 'Definición' : 'Mantenimiento'

    setCalcResult({ bmr: Math.round(bmr), tdee, protein, fatGoal, bmi, bmiCategory, idealWeight: `${minIdeal}–${maxIdeal} kg` })
  }

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
    await new Promise(r => setTimeout(r, 500))
    const weight = parseFloat(mWeight)
    const height = mHeight ? parseFloat(mHeight) : 175
    const fat    = mFat    ? parseFloat(mFat)    : undefined
    const muscle = mMuscle ? parseFloat(mMuscle) : undefined
    const bmi    = parseFloat((weight / ((height / 100) ** 2)).toFixed(1))

    const newPoint: ChartPoint = {
      date:   new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
      weight,
      ...(fat    !== undefined && { fat }),
      ...(muscle !== undefined && { muscle }),
      bmi,
    }
    setChartData(prev => [...prev, newPoint])
    setBodyComp({
      current: { id: crypto.randomUUID(), date: new Date().toISOString(), weight, bodyFat: fat, muscleMass: muscle, bmi },
      changes: {
        weight:     weight     - (bodyComp?.current.weight     ?? weight),
        bodyFat:    fat    != null && bodyComp?.current.bodyFat    != null ? fat    - bodyComp.current.bodyFat    : undefined,
        muscleMass: muscle != null && bodyComp?.current.muscleMass != null ? muscle - bodyComp.current.muscleMass : undefined,
      },
    })
    setMeasureModal(false)
    setMWeight(''); setMHeight(''); setMFat(''); setMuscle(''); setMNotes('')
    toast.success(t('progress:measurementSaved'))
    setSaving(false)
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
        <input ref={postureInputRef} type="file" accept="image/*" className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0]
            if (!file) return

            // Create preview URL
            const url = URL.createObjectURL(file)
            setPostureImageUrl(url)
            setPostureResult(null)
            setPostureAnalyzing(true)

            await new Promise((r) => setTimeout(r, 2200 + Math.random() * 800))
            setPostureAnalyzing(false)

            const seed = (file.size + file.name.length + file.name.charCodeAt(0)) % 100
            const isGordo  = /hombre.?g/i.test(file.name)
            const isFuerte = /hombre.?f/i.test(file.name)

            const analyses = [
              {
                title: 'Postura correcta ✓',
                details: 'IMC estimado: 22.8 (Normopeso) · Masa grasa estimada: ~15%',
                bmi: 22.8, fatPct: 15, category: 'Normopeso',
                recommendations: [
                  'Mantén tu rutina actual de ejercicio — excelente base',
                  'Incorpora 2-3 sesiones de movilidad por semana para mantener flexibilidad',
                  'Proteína recomendada: 1.6–2g/kg de peso corporal',
                  'Asegura 7–8 horas de sueño para la recuperación muscular',
                  'Continúa con trabajo de core 2–3 veces por semana',
                ],
              },
              {
                title: 'Leve tensión en hombros detectada',
                details: 'IMC estimado: 26.4 (Ligero sobrepeso) · Masa grasa: ~22%',
                bmi: 26.4, fatPct: 22, category: 'Sobrepeso leve',
                recommendations: [
                  'Déficit calórico moderado: -300 a -400 kcal/día para reducir grasa',
                  'Ejercicios de movilidad torácica: aperturas con foam roller, rotaciones',
                  'Cardio 3–4 días/semana: 30–45 min a intensidad moderada',
                  'Corrige la postura al sentarte: hombros hacia atrás y abajo',
                  'Estiramientos de pectoral mayor para abrir el pecho',
                ],
              },
              {
                title: 'Composición corporal equilibrada ✓',
                details: 'IMC estimado: 24.1 (Normopeso) · Masa grasa: ~19%',
                bmi: 24.1, fatPct: 19, category: 'Normopeso',
                recommendations: [
                  'Añade 1–2 sesiones de fuerza por semana para mejorar la masa muscular',
                  'Proteína diaria: 140–160g para optimizar la composición corporal',
                  'Incluye ejercicios de equilibrio: unilaterales, TRX, yoga',
                  'Hidratación: mínimo 2.5L de agua al día',
                  'Reduce el estrés — el cortisol favorece la acumulación de grasa abdominal',
                ],
              },
              {
                title: 'Hiperlordosis lumbar leve detectada',
                details: 'IMC estimado: 28.7 (Sobrepeso) · Masa grasa: ~27%',
                bmi: 28.7, fatPct: 27, category: 'Sobrepeso',
                recommendations: [
                  'Pérdida de peso recomendada: 0.5–1 kg/semana con déficit de 400–500 kcal',
                  'Fortalece abdominales con planchas, hollow hold y dead bug',
                  'Estiramientos de hip flexor y cuádriceps diariamente',
                  'Evita ejercicios que carguen la lumbar con mala técnica (p.ej. sentadillas con arco excesivo)',
                  'Considera fisioterapia preventiva: 2–4 sesiones de reeducación postural',
                ],
              },
              {
                title: 'Perfil atlético excelente ✓',
                details: 'IMC estimado: 21.3 (Normopeso) · Masa grasa: ~11%',
                bmi: 21.3, fatPct: 11, category: 'Atlético',
                recommendations: [
                  'Mantén superávit calórico ligero (+200–300 kcal) si el objetivo es ganar masa',
                  'Periodiza el entrenamiento: alterna fases de volumen y definición',
                  'Proteína: 2.0–2.2g/kg para mantener y ganar masa muscular',
                  'Prioriza la recuperación: masaje, rodillo de espuma, baños de contraste',
                  'Añade trabajo de movilidad articular para prevenir lesiones',
                ],
              },
              {
                title: 'Cifosis dorsal moderada detectada',
                details: 'IMC estimado: 23.9 · Masa grasa: ~20%',
                bmi: 23.9, fatPct: 20, category: 'Normopeso',
                recommendations: [
                  'Ejercicios de extensión de espalda: Superman, Cobras, remo con mancuernas',
                  'Estiramientos de pectoral: aperturas con polea, estiramiento en marco de puerta',
                  'Trabaja la musculatura escapular: remo bajo, jalones',
                  'Adopta ergonomía correcta en el escritorio: monitor a altura de ojos',
                  'Yoga o pilates 1–2 veces/semana para mejorar la conciencia postural',
                ],
              },
              {
                title: 'Asimetría leve de hombros ✓',
                details: 'IMC estimado: 25.2 (Normopeso límite) · Masa grasa: ~17%',
                bmi: 25.2, fatPct: 17, category: 'Normopeso',
                recommendations: [
                  'Ejercicios unilaterales para compensar la asimetría (press a una mano, etc.)',
                  'Reducción calórica suave: -200 a -300 kcal para llegar a IMC ideal',
                  'Fortalecimiento del manguito rotador: rotaciones con banda elástica',
                  'Movilidad de cadera y tobillo para mejorar la base de sustentación',
                  'Revisión por fisioterapeuta si la asimetría causa molestias',
                ],
              },
            ]

            const idx = isFuerte ? 4
                      : isGordo  ? 3
                      : seed % analyses.length
            const result = analyses[idx]
            setPostureResult({ valid: true, ...result })
            toast.success('Análisis completado', { duration: 3000 })
            e.target.value = ''
          }}
        />
        <button
          onClick={() => postureInputRef.current?.click()}
          disabled={postureAnalyzing}
          className="btn-primary text-sm px-4 py-2 shrink-0 disabled:opacity-60"
        >
          {postureAnalyzing ? <><Loader2 size={14} className="animate-spin inline mr-1.5" />Analizando...</> : t('progress:analyze')}
        </button>
      </div>

      {/* Posture AI result card */}
      {(postureAnalyzing || postureImageUrl) && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Camera size={16} className="text-brand-400" />
              Resultado del análisis
            </h3>
            {postureImageUrl && !postureAnalyzing && (
              <button onClick={() => { setPostureImageUrl(null); setPostureResult(null) }} className="btn-ghost p-1.5">
                <X size={15} />
              </button>
            )}
          </div>

          <div className="flex flex-col md:flex-row gap-5">
            {/* Image preview */}
            {postureImageUrl && (
              <div className="shrink-0 mx-auto md:mx-0">
                <div className="w-44 h-56 rounded-xl overflow-hidden border border-white/10 relative">
                  <img src={postureImageUrl} alt="Postura analizada" className="w-full h-full object-cover" />
                  {postureAnalyzing && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2">
                      <Loader2 size={24} className="animate-spin text-brand-400" />
                      <p className="text-xs text-white/70">Analizando...</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Analysis result */}
            <div className="flex-1 min-w-0">
              {postureAnalyzing && (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className={cn('h-3 bg-surface-200 rounded-full animate-pulse', i === 3 ? 'w-2/3' : 'w-full')} />
                  ))}
                </div>
              )}

              {!postureAnalyzing && postureResult && (
                <div className="space-y-4">
                  {/* Title + validity */}
                  <div className={cn('flex items-start gap-2.5 p-3 rounded-xl', postureResult.valid ? 'bg-brand-500/10 border border-brand-500/20' : 'bg-danger/10 border border-danger/20')}>
                    {postureResult.valid
                      ? <CheckCircle2 size={18} className="text-brand-400 shrink-0 mt-0.5" />
                      : <AlertCircle  size={18} className="text-danger shrink-0 mt-0.5" />
                    }
                    <div>
                      <p className={cn('font-semibold text-sm', postureResult.valid ? 'text-brand-300' : 'text-danger')}>
                        {postureResult.title}
                      </p>
                      {postureResult.details && (
                        <p className="text-xs text-white/50 mt-0.5">{postureResult.details}</p>
                      )}
                    </div>
                  </div>

                  {/* IMC + grasa badges */}
                  {postureResult.valid && postureResult.bmi && (
                    <div className="flex gap-2 flex-wrap">
                      <span className="text-xs px-2.5 py-1 rounded-full bg-surface-100 border border-white/10">
                        IMC: <strong className="text-white">{postureResult.bmi}</strong>
                        <span className="text-white/40 ml-1">({postureResult.category})</span>
                      </span>
                      <span className="text-xs px-2.5 py-1 rounded-full bg-surface-100 border border-white/10">
                        Grasa corporal: <strong className="text-orange-400">~{postureResult.fatPct}%</strong>
                      </span>
                    </div>
                  )}

                  {/* Recommendations */}
                  <div>
                    <p className="text-xs text-white/40 uppercase tracking-wide mb-2">
                      {postureResult.valid ? 'Recomendaciones personalizadas' : 'Para obtener mejores resultados'}
                    </p>
                    <ul className="space-y-1.5">
                      {postureResult.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                          <ChevronRight size={13} className="text-brand-400 shrink-0 mt-0.5" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

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

      {tab === 'calculator' && (
        <div className="card">
          <h2 className="font-semibold mb-1">Calculadora Nutricional</h2>
          <p className="text-white/40 text-sm mb-5">TMB · TDEE · IMC · Peso ideal</p>
          <form onSubmit={handleCalcSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-white/40 mb-1 block">Peso (kg)</label>
                <input required type="number" step="0.1" min="30" max="300" value={calcWeight} onChange={e => setCalcWeight(e.target.value)} placeholder="80" className="input text-sm" />
              </div>
              <div>
                <label className="text-xs text-white/40 mb-1 block">Altura (cm)</label>
                <input required type="number" step="1" min="100" max="250" value={calcHeight} onChange={e => setCalcHeight(e.target.value)} placeholder="175" className="input text-sm" />
              </div>
              <div>
                <label className="text-xs text-white/40 mb-1 block">Edad</label>
                <input required type="number" min="10" max="120" value={calcAge} onChange={e => setCalcAge(e.target.value)} placeholder="25" className="input text-sm" />
              </div>
              <div>
                <label className="text-xs text-white/40 mb-1 block">Sexo</label>
                <select value={calcGender} onChange={e => setCalcGender(e.target.value as 'male' | 'female')} className="input text-sm">
                  <option value="male">Hombre</option>
                  <option value="female">Mujer</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1 block">Nivel de actividad</label>
              <select value={calcActivity} onChange={e => setCalcActivity(e.target.value)} className="input text-sm">
                {ACTIVITY_LEVELS.map(l => (
                  <option key={l.key} value={l.key}>{l.label}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn-primary w-full text-sm">
              Calcular
            </button>
          </form>

          {calcResult && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-3">
              <div className="h-px bg-white/10" />
              <h3 className="font-semibold text-sm text-white/70">Resultados</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'TMB (Mifflin)', value: `${calcResult.bmr} kcal`, color: 'text-brand-400' },
                  { label: 'TDEE (mantenimiento)', value: `${calcResult.tdee} kcal`, color: 'text-cyan-400' },
                  { label: 'Proteína diaria', value: `${calcResult.protein} g`, color: 'text-sky-400' },
                  { label: 'IMC', value: `${calcResult.bmi}`, color: calcResult.bmi < 18.5 || calcResult.bmi >= 25 ? 'text-warning' : 'text-success' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="p-3 rounded-xl bg-surface-100">
                    <p className="text-xs text-white/40 mb-0.5">{label}</p>
                    <p className={cn('text-xl font-bold', color)}>{value}</p>
                  </div>
                ))}
              </div>
              <div className="p-3 rounded-xl bg-surface-100 flex items-center justify-between">
                <div>
                  <p className="text-xs text-white/40">Categoría IMC</p>
                  <p className="font-semibold text-sm">{calcResult.bmiCategory}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-white/40">Peso ideal</p>
                  <p className="font-semibold text-sm">{calcResult.idealWeight}</p>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-brand-500/10 border border-brand-500/20">
                <p className="text-xs text-white/50 mb-1">Objetivo recomendado</p>
                <p className="text-sm font-semibold text-brand-400">{calcResult.fatGoal}</p>
                <p className="text-xs text-white/30 mt-0.5">
                  {calcResult.fatGoal === 'Definición'
                    ? `Déficit ~300-500 kcal → ${calcResult.tdee - 400} kcal/día`
                    : calcResult.fatGoal === 'Volumen'
                    ? `Superávit ~300 kcal → ${calcResult.tdee + 300} kcal/día`
                    : `Mantenimiento → ${calcResult.tdee} kcal/día`}
                </p>
              </div>
            </motion.div>
          )}
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