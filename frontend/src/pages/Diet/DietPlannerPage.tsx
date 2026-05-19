import { useState } from 'react'
import { motion } from 'framer-motion'
import { Brain, Loader2, Check, ChevronRight, Flame, Beef, Wheat, Droplet, Coffee, Utensils, Apple, Moon } from 'lucide-react'
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
  const [form, setForm] = useState({
    weight: '', height: '', age: '', gender: 'male', activity: 'moderate',
  })

  const GOALS = [
    { id: 'lose_weight',  emoji: '📉', label: t('diet:loseWeight'),   desc: t('diet:loseWeightDesc')   },
    { id: 'gain_muscle',  emoji: '📈', label: t('diet:gainMuscle'),   desc: t('diet:gainMuscleDesc')   },
    { id: 'maintain',     emoji: '⚖️', label: t('diet:maintain'),     desc: t('diet:maintainDesc')     },
    { id: 'performance',  emoji: '⚡', label: t('diet:performance'),  desc: t('diet:performanceDesc')  },
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
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? t('diet:errorGenerating'))
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
                <div className="text-3xl mb-2">{g.emoji}</div>
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
            <div className="text-4xl mb-2">🎉</div>
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
                    <span className="text-brand-400 mt-0.5 shrink-0">✓</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => { setStep(1); setGoal(''); setGenerated(null) }} className="btn-secondary px-4">
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
