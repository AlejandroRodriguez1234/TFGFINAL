import { useState } from 'react'
import { motion } from 'framer-motion'
import { Brain, Loader2, Check, ChevronRight } from 'lucide-react'

const goals = [
  { id: 'lose',    emoji: '📉', label: 'Perder grasa',     desc: 'Déficit calórico controlado' },
  { id: 'gain',    emoji: '📈', label: 'Ganar músculo',    desc: 'Superávit calórico con proteína alta' },
  { id: 'maintain',emoji: '⚖️', label: 'Mantener peso',   desc: 'Mantenimiento con calidad' },
  { id: 'performance',emoji:'⚡',label:'Rendimiento',      desc: 'Optimizado para el deporte' },
]

export default function DietPlannerPage() {
  const [step, setStep]         = useState(1)
  const [selectedGoal, setGoal] = useState('')
  const [loading, setLoading]   = useState(false)
  const [form, setForm]         = useState({ weight: '', height: '', age: '', activity: 'moderate' })

  const generatePlan = () => {
    setLoading(true)
    setTimeout(() => { setLoading(false); setStep(3) }, 2500)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-display font-bold">Planificador de dieta</h1>
        <p className="text-white/40 text-sm mt-1">Genera un plan personalizado con IA</p>
      </div>

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

      {step === 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <h2 className="font-semibold">¿Cuál es tu objetivo?</h2>
          <div className="grid grid-cols-2 gap-3">
            {goals.map((g) => (
              <button key={g.id} onClick={() => setGoal(g.id)}
                className={`p-4 rounded-xl border text-left transition-all ${selectedGoal === g.id ? 'border-brand-500 bg-brand-500/10' : 'glass border-white/10 hover:border-white/30'}`}
              >
                <div className="text-3xl mb-2">{g.emoji}</div>
                <p className="font-semibold text-sm">{g.label}</p>
                <p className="text-xs text-white/40 mt-0.5">{g.desc}</p>
              </button>
            ))}
          </div>
          <button onClick={() => setStep(2)} disabled={!selectedGoal} className="btn-primary w-full">
            Siguiente <ChevronRight size={16} />
          </button>
        </motion.div>
      )}

      {step === 2 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <h2 className="font-semibold">Tus datos físicos</h2>
          {[['Peso (kg)', 'weight', '75'], ['Altura (cm)', 'height', '175'], ['Edad', 'age', '25']].map(([label, key, placeholder]) => (
            <div key={key as string}>
              <label className="text-sm text-white/60 mb-1 block">{label as string}</label>
              <input
                type="number"
                placeholder={placeholder as string}
                value={form[key as keyof typeof form]}
                onChange={(e) => setForm((f) => ({ ...f, [key as string]: e.target.value }))}
                className="input"
              />
            </div>
          ))}
          <div>
            <label className="text-sm text-white/60 mb-1 block">Nivel de actividad</label>
            <select value={form.activity} onChange={(e) => setForm((f) => ({ ...f, activity: e.target.value }))} className="input">
              <option value="sedentary">Sedentario (poco o nada de ejercicio)</option>
              <option value="light">Ligero (1-3 días/semana)</option>
              <option value="moderate">Moderado (3-5 días/semana)</option>
              <option value="active">Activo (6-7 días/semana)</option>
              <option value="very_active">Muy activo (2 veces/día)</option>
            </select>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="btn-secondary px-4">Atrás</button>
            <button onClick={generatePlan} disabled={loading || !form.weight} className="btn-primary flex-1">
              {loading ? <><Loader2 size={16} className="animate-spin" /> Generando plan...</> : <><Brain size={16} /> Generar con IA</>}
            </button>
          </div>
        </motion.div>
      )}

      {step === 3 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="card border border-success/20 bg-success/5 text-center py-6">
            <div className="text-4xl mb-3">🎉</div>
            <h2 className="text-xl font-bold mb-1">¡Plan generado!</h2>
            <p className="text-white/50 text-sm">Tu plan nutricional personalizado está listo</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[['2,100', 'Calorías/día', '🔥'], ['165g', 'Proteína', '💪'], ['230g', 'Carbohidratos', '🌾']].map(([val, label, emoji]) => (
              <div key={label as string} className="card text-center">
                <div className="text-2xl mb-1">{emoji}</div>
                <p className="text-xl font-bold text-gradient">{val as string}</p>
                <p className="text-xs text-white/40">{label as string}</p>
              </div>
            ))}
          </div>
          <button className="btn-primary w-full">Aplicar este plan</button>
        </motion.div>
      )}
    </div>
  )
}
