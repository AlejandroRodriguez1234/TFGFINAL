import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Loader2, Check, ChevronRight, Flame, Beef, Wheat, Droplet, Coffee, Utensils, Apple, Moon, TrendingDown, TrendingUp, Scale, Zap, Sparkles, ShoppingCart, Copy, CheckCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { dietApi } from '@services/api'

type GeneratedPlan = {
  name: string
  target_calories: number
  target_protein: number
  target_carbs: number
  target_fat: number
  bmr: number
  tdee: number
  goal: string
  meal_split: { breakfast: number; lunch: number; snack: number; dinner: number }
  tips: string[]
}

const MEAL_ICON_MAP = [
  { key: 'breakfast' as const, icon: Coffee },
  { key: 'lunch'     as const, icon: Utensils },
  { key: 'snack'     as const, icon: Apple },
  { key: 'dinner'    as const, icon: Moon },
]

export default function DietPlannerPage() {
  const { t } = useTranslation()
  const [step, setStep]               = useState(1)
  const [selectedGoal, setGoal]       = useState('')
  const [loading, setLoading]         = useState(false)
  const [activating, setActivating]   = useState(false)
  const [generatedPlan, setGenerated] = useState<GeneratedPlan | null>(null)
  const [showShopping, setShowShopping] = useState(false)
  const [copied, setCopied]             = useState(false)
  const [form, setForm] = useState({
    weight: '', height: '', age: '', gender: 'male', activity: 'moderate',
  })

  const SHOPPING_LIST: Record<string, string[]> = {
    lose_weight: [
      'Pechuga de pollo (1 kg)', 'Atún en agua (6 latas)', 'Claras de huevo (1 docena)',
      'Brócoli (500 g)', 'Espinacas (bolsa grande)', 'Tomates cherry', 'Pepino (2 uds)',
      'Arroz integral (500 g)', 'Avena (500 g)', 'Aceite de oliva virgen extra',
      'Queso cottage (500 g)', 'Yogur griego 0% (pack 4)', 'Almendras (100 g)',
    ],
    gain_muscle: [
      'Pechuga de pollo (1,5 kg)', 'Huevos camperos (12 uds)', 'Salmón fresco (400 g)',
      'Ternera magra (500 g)', 'Arroz blanco (1 kg)', 'Pasta integral (500 g)',
      'Boniato (1 kg)', 'Plátanos (6 uds)', 'Leche entera (2 L)',
      'Queso fresco batido (500 g)', 'Nueces (200 g)', 'Aceite de oliva',
      'Mantequilla de cacahuete (250 g)', 'Avena (1 kg)',
    ],
    maintain: [
      'Pollo (800 g)', 'Salmón (300 g)', 'Huevos (12 uds)', 'Legumbres (400 g)',
      'Verduras variadas (1 kg)', 'Fruta de temporada (1 kg)', 'Arroz (500 g)',
      'Pan integral (1 ud)', 'Aceite de oliva', 'Yogur natural (pack 4)',
      'Frutos secos mixtos (150 g)', 'Leche (1 L)',
    ],
    performance: [
      'Pechuga de pavo (1 kg)', 'Atún al natural (8 latas)', 'Huevos (18 uds)',
      'Arroz blanco (1 kg)', 'Pasta (500 g)', 'Boniato (1,5 kg)',
      'Plátanos (8 uds)', 'Dátiles (200 g)', 'Leche (2 L)',
      'Queso batido (500 g)', 'Almendras y nueces (200 g)', 'Aceite de oliva',
      'Bebida isotónica', 'Miel (1 tarro)',
    ],
  }

  const handleCopyShopping = () => {
    if (!selectedGoal) return
    const list = SHOPPING_LIST[selectedGoal] ?? SHOPPING_LIST.maintain
    const text = list.map((item, i) => `${i + 1}. ${item}`).join('\n')
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const GOALS = [
    { id: 'lose_weight',  Icon: TrendingDown, color: 'text-orange-400', label: t('diet:loseWeight'),   desc: t('diet:loseWeightDesc')   },
    { id: 'gain_muscle',  Icon: TrendingUp,   color: 'text-sky-400',    label: t('diet:gainMuscle'),   desc: t('diet:gainMuscleDesc')   },
    { id: 'maintain',     Icon: Scale,        color: 'text-green-400',  label: t('diet:maintain'),     desc: t('diet:maintainDesc')     },
    { id: 'performance',  Icon: Zap,          color: 'text-yellow-400', label: t('diet:performance'),  desc: t('diet:performanceDesc')  },
  ]

  const generatePlan = async () => {
    if (!form.weight || !form.height || !form.age) {
      toast.error(t('diet:fillAllFields'))
      return
    }
    setLoading(true)
    try {
      const r = await dietApi.post<{ success: boolean; data: GeneratedPlan }>('/api/plans/generate', {
        goal:           selectedGoal,
        weight:         parseFloat(form.weight),
        height:         parseFloat(form.height),
        age:            parseInt(form.age),
        gender:         form.gender,
        activity_level: form.activity,
      })
      setGenerated(r.data.data)
      setStep(3)
    } catch {
      const w = parseFloat(form.weight)
      const h = parseFloat(form.height)
      const a = parseInt(form.age)
      const bmr = form.gender === 'male'
        ? Math.round(10 * w + 6.25 * h - 5 * a + 5)
        : Math.round(10 * w + 6.25 * h - 5 * a - 161)
      const mults: Record<string, number> = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 }
      const tdee = Math.round(bmr * (mults[form.activity] ?? 1.55))
      const adj = selectedGoal === 'lose_weight' ? -400 : selectedGoal === 'gain_muscle' ? 300 : 0
      const cals = tdee + adj
      const demoPlan: GeneratedPlan = {
        name: `Plan ${t(`diet:${selectedGoal === 'lose_weight' ? 'loseWeight' : selectedGoal === 'gain_muscle' ? 'gainMuscle' : selectedGoal === 'maintain' ? 'maintain' : 'performance'}`)}`,
        target_calories: cals,
        target_protein:  Math.round(w * 2),
        target_carbs:    Math.round((cals * 0.4) / 4),
        target_fat:      Math.round((cals * 0.25) / 9),
        bmr, tdee,
        goal: selectedGoal,
        meal_split: {
          breakfast: Math.round(cals * 0.25),
          lunch:     Math.round(cals * 0.35),
          snack:     Math.round(cals * 0.15),
          dinner:    Math.round(cals * 0.25),
        },
        tips: [
          'Distribuye las proteínas a lo largo del día para maximizar la síntesis muscular.',
          'Hidratación: bebe al menos 35 ml de agua por kg de peso corporal.',
          'Prioriza alimentos sin procesar: pollo, arroz, verduras, huevos y frutos secos.',
          'Registra tus comidas diariamente para mantener el seguimiento calórico.',
        ],
      }
      setGenerated(demoPlan)
      setStep(3)
    } finally {
      setLoading(false)
    }
  }

  const applyPlan = async () => {
    if (!generatedPlan) return
    setActivating(true)
    try {
      const today = new Date().toISOString().slice(0, 10)
      const r = await dietApi.post<{ success: boolean; data: { id: string } }>('/api/plans', {
        name:             generatedPlan.name,
        target_calories:  generatedPlan.target_calories,
        target_protein:   generatedPlan.target_protein,
        target_carbs:     generatedPlan.target_carbs,
        target_fat:       generatedPlan.target_fat,
        start_date:       today,
      })
      await dietApi.post(`/api/plans/${r.data.data.id}/activate`)
      toast.success(t('diet:planActivated'))
    } catch {
      toast.error(t('diet:errorApplying'))
    } finally {
      setActivating(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-display font-bold">{t('diet:plannerTitle')}</h1>
        <p className="text-white/40 text-sm mt-1">{t('diet:plannerSubtitle')}</p>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step >= s ? 'bg-brand-500 text-white' : 'bg-surface-200 text-white/30'}`}>
              {step > s ? <Check size={14} /> : s}
            </div>
            {s < 3 && <div className={`h-px flex-1 w-16 ${step > s ? 'bg-brand-500' : 'bg-surface-200'}`} />}
          </div>
        ))}
      </div>

      {/* Step 1 — Goal */}
      {step === 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <h2 className="font-semibold">{t('diet:whatIsYourGoal')}</h2>
          <div className="grid grid-cols-2 gap-3">
            {GOALS.map((g) => (
              <button key={g.id} onClick={() => setGoal(g.id)}
                className={`p-4 rounded-xl border text-left transition-all ${selectedGoal === g.id ? 'border-brand-500 bg-brand-500/10' : 'glass border-white/10 hover:border-white/30'}`}>
                <g.Icon size={24} className={`${g.color} mb-2`} />
                <p className="font-semibold text-sm">{g.label}</p>
                <p className="text-xs text-white/40 mt-0.5">{g.desc}</p>
              </button>
            ))}
          </div>
          <button onClick={() => setStep(2)} disabled={!selectedGoal} className="btn-primary w-full">
            {t('common:next')} <ChevronRight size={16} />
          </button>
        </motion.div>
      )}

      {/* Step 2 — Physical data */}
      {step === 2 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <h2 className="font-semibold">{t('diet:yourPhysicalData')}</h2>

          <div className="grid grid-cols-3 gap-3">
            {([
              [t('diet:weightKg'), 'weight', '75'],
              [t('diet:heightCm'), 'height', '175'],
              [t('diet:age'),      'age',    '25'],
            ] as const).map(([label, key, placeholder]) => (
              <div key={key}>
                <label className="text-sm text-white/60 mb-1 block">{label}</label>
                <input
                  type="number" placeholder={placeholder}
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="input"
                />
              </div>
            ))}
          </div>

          <div>
            <label className="text-sm text-white/60 mb-1 block">{t('diet:biologicalSex')}</label>
            <div className="grid grid-cols-2 gap-3">
              {([['male', t('diet:male')], ['female', t('diet:female')]] as const).map(([val, label]) => (
                <button key={val} type="button" onClick={() => setForm(f => ({ ...f, gender: val }))}
                  className={`py-2.5 rounded-xl border text-sm font-medium transition-all ${form.gender === val ? 'border-brand-500 bg-brand-500/10 text-white' : 'glass border-white/10 text-white/50 hover:border-white/30'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-white/60 mb-1 block">{t('diet:activityLevel')}</label>
            <select value={form.activity} onChange={(e) => setForm((f) => ({ ...f, activity: e.target.value }))} className="input">
              <option value="sedentary">{t('diet:sedentary')}</option>
              <option value="light">{t('diet:lightActivity')}</option>
              <option value="moderate">{t('diet:moderateActivity')}</option>
              <option value="active">{t('diet:activeActivity')}</option>
              <option value="very_active">{t('diet:veryActive')}</option>
            </select>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="btn-secondary px-4">{t('common:back')}</button>
            <button onClick={generatePlan} disabled={loading || !form.weight || !form.height || !form.age} className="btn-primary flex-1">
              {loading
                ? <><Loader2 size={16} className="animate-spin" /> {t('diet:generatingPlan')}</>
                : <><Brain size={16} /> {t('diet:generateWithAI')}</>}
            </button>
          </div>
        </motion.div>
      )}

      {/* Step 3 — Results */}
      {step === 3 && generatedPlan && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="card border border-success/20 bg-success/5 text-center py-5">
            <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center mx-auto mb-3">
              <Sparkles size={24} className="text-success" />
            </div>
            <h2 className="text-xl font-bold mb-1">{generatedPlan.name}</h2>
            <p className="text-white/40 text-xs">BMR: {generatedPlan.bmr} kcal · TDEE: {generatedPlan.tdee} kcal</p>
          </div>

          {/* Main macros */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { icon: Flame,   label: t('diet:calories'), val: `${generatedPlan.target_calories}`, unit: 'kcal', color: 'text-orange-400' },
              { icon: Beef,    label: t('diet:protein'),  val: `${generatedPlan.target_protein}`,  unit: 'g',    color: 'text-sky-400' },
              { icon: Wheat,   label: t('diet:carbs'),    val: `${generatedPlan.target_carbs}`,    unit: 'g',    color: 'text-orange-300' },
              { icon: Droplet, label: t('diet:fat'),      val: `${generatedPlan.target_fat}`,      unit: 'g',    color: 'text-purple-400' },
            ].map(({ icon: Icon, label, val, unit, color }) => (
              <div key={label} className="card text-center py-3">
                <Icon size={18} className={`${color} mx-auto mb-1`} />
                <p className={`text-lg font-bold ${color}`}>{val}</p>
                <p className="text-xs text-white/40">{unit}</p>
                <p className="text-xs text-white/30 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Meal split */}
          <div className="card">
            <h3 className="font-semibold text-sm mb-3">{t('diet:mealDistribution')}</h3>
            <div className="space-y-2">
              {MEAL_ICON_MAP.map(({ key, icon: Icon }) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <Icon size={14} className="text-brand-400" />
                    {t(`diet:${key}`)}
                  </div>
                  <span className="text-sm font-medium">{generatedPlan.meal_split[key]} kcal</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          {generatedPlan.tips.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-sm mb-3">{t('diet:recommendations')}</h3>
              <ul className="space-y-2">
                {generatedPlan.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-white/60">
                    <Check size={14} className="text-brand-400 mt-0.5 shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Shopping list */}
          <div className="card border border-white/5">
            <button
              onClick={() => setShowShopping(v => !v)}
              className="flex items-center justify-between w-full"
            >
              <div className="flex items-center gap-2">
                <ShoppingCart size={16} className="text-brand-400" />
                <span className="font-medium text-sm">Lista de la compra semanal</span>
              </div>
              <ChevronRight size={14} className={`text-white/30 transition-transform ${showShopping ? 'rotate-90' : ''}`} />
            </button>
            <AnimatePresence>
              {showShopping && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 space-y-1.5">
                    {(SHOPPING_LIST[selectedGoal] ?? SHOPPING_LIST.maintain).map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-white/70">
                        <Check size={13} className="text-brand-400 shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleCopyShopping}
                    className="btn-secondary w-full mt-4 text-sm"
                  >
                    {copied ? <><CheckCheck size={14} className="text-success" /> Copiado</> : <><Copy size={14} /> Copiar lista</>}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex gap-3">
            <button onClick={() => { setStep(1); setGoal(''); setGenerated(null); setShowShopping(false) }} className="btn-secondary px-4">
              {t('diet:newPlan')}
            </button>
            <button onClick={applyPlan} disabled={activating} className="btn-primary flex-1">
              {activating ? <><Loader2 size={16} className="animate-spin" /> {t('diet:applyingPlan')}</> : t('diet:applyPlan')}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
