import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, Camera, Droplets, Flame, Beef, Wheat, Droplet, Coffee, Utensils, Apple, Moon, X } from 'lucide-react'
import { cn } from '@utils/cn'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import toast from 'react-hot-toast'

const todayMacros = { calories: 1840, protein: 148, carbs: 186, fat: 52 }
const targetMacros = { calories: 2200, protein: 165, carbs: 220, fat: 73 }

const meals = [
  {
    type: 'breakfast', label: 'Desayuno', time: '08:30', calories: 420,
    items: [
      { name: 'Avena con leche', calories: 280, protein: 12, carbs: 48, fat: 5, quantity: '80g' },
      { name: 'Plátano',        calories: 90,  protein: 1,  carbs: 23, fat: 0, quantity: '1 unidad' },
      { name: 'Proteína whey',  calories: 120, protein: 24, carbs: 4,  fat: 2, quantity: '30g' },
    ],
  },
  {
    type: 'lunch', label: 'Comida', time: '14:00', calories: 680,
    items: [
      { name: 'Pechuga de pollo', calories: 280, protein: 52, carbs: 0, fat: 6, quantity: '180g' },
      { name: 'Arroz integral',   calories: 270, protein: 5,  carbs: 56, fat: 2, quantity: '120g' },
      { name: 'Brócoli',          calories: 55,  protein: 4,  carbs: 10, fat: 1, quantity: '150g' },
    ],
  },
  {
    type: 'snack', label: 'Merienda', time: '17:30', calories: 220,
    items: [
      { name: 'Yogur griego',    calories: 130, protein: 17, carbs: 6, fat: 4, quantity: '200g' },
      { name: 'Nueces',          calories: 90,  protein: 2,  carbs: 2, fat: 9, quantity: '20g' },
    ],
  },
  { type: 'dinner', label: 'Cena', time: '21:00', calories: 0, items: [] },
]

const macroColors = { protein: '#0ea5e9', carbs: '#f97316', fat: '#a855f7' }
const piData = [
  { name: 'Proteína',      value: todayMacros.protein * 4, color: macroColors.protein },
  { name: 'Carbohidratos', value: todayMacros.carbs * 4,   color: macroColors.carbs },
  { name: 'Grasas',        value: todayMacros.fat * 9,     color: macroColors.fat },
]

const MEAL_ICON_MAP: Record<string, React.ElementType> = {
  breakfast: Coffee,
  lunch: Utensils,
  snack: Apple,
  dinner: Moon,
}

export default function DietPage() {
  const [water, setWater]       = useState(6)
  const [addModal, setAddModal] = useState<string | null>(null)
  const [barcodeModal, setBarcodeModal] = useState(false)

  // Add food form state
  const [foodName, setFoodName]     = useState('')
  const [foodCals, setFoodCals]     = useState('')
  const [foodProt, setFoodProt]     = useState('')
  const [foodCarbs, setFoodCarbs]   = useState('')
  const [foodFat, setFoodFat]       = useState('')

  const pct = (val: number, target: number) => Math.min(100, (val / target) * 100)

  const handleAddFood = (e: React.FormEvent) => {
    e.preventDefault()
    setAddModal(null)
    setFoodName(''); setFoodCals(''); setFoodProt(''); setFoodCarbs(''); setFoodFat('')
    toast.success('Alimento añadido')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Nutrición</h1>
          <p className="text-white/40 text-sm mt-1">Registro de hoy</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setBarcodeModal(true)} className="btn-secondary text-sm px-3 py-2">
            <Camera size={16} /> Escanear
          </button>
        </div>
      </div>

      {/* Macro overview */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Resumen del día</h2>
          <span className="text-sm text-white/40">
            {todayMacros.calories} / {targetMacros.calories} kcal
          </span>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Calorie ring */}
          <div className="flex items-center gap-6">
            <div className="relative w-28 h-28 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={piData} innerRadius={38} outerRadius={52} dataKey="value" startAngle={90} endAngle={-270} strokeWidth={0}>
                    {piData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #2e2e2e', borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold">{todayMacros.calories}</span>
                <span className="text-xs text-white/40">kcal</span>
              </div>
            </div>
            <div className="space-y-2 flex-1">
              {[
                { label: 'Proteína',      val: todayMacros.protein, target: targetMacros.protein, color: macroColors.protein, unit: 'g', icon: Beef },
                { label: 'Carbohidratos', val: todayMacros.carbs,   target: targetMacros.carbs,   color: macroColors.carbs,   unit: 'g', icon: Wheat },
                { label: 'Grasas',        val: todayMacros.fat,     target: targetMacros.fat,     color: macroColors.fat,     unit: 'g', icon: Droplet },
              ].map(({ label, val, target, color, unit }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/60">{label}</span>
                    <span style={{ color }}>{val}{unit} / {target}{unit}</span>
                  </div>
                  <div className="h-1.5 bg-surface-200 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct(val, target)}%`, background: color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Water tracker */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium">Hidratación</h3>
              <span className="text-sm text-cyan-400">{water * 250}ml / 2500ml</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {Array.from({ length: 10 }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setWater(i < water ? i : i + 1)}
                  className={cn('w-8 h-10 rounded-lg flex items-center justify-center transition-all', i < water ? 'bg-cyan-500/30 text-cyan-400' : 'bg-surface-100 text-white/20 hover:bg-cyan-500/10')}
                >
                  <Droplets size={16} />
                </button>
              ))}
            </div>
            <p className="text-xs text-white/30 mt-2">{10 - water} vasos restantes para tu objetivo</p>
          </div>
        </div>
      </div>

      {/* Meals */}
      <div className="space-y-4">
        {meals.map((meal) => {
          const MealIcon = MEAL_ICON_MAP[meal.type] ?? Coffee
          return (
            <motion.div key={meal.type} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-surface-100 flex items-center justify-center shrink-0">
                    <MealIcon size={16} className="text-brand-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{meal.label}</h3>
                    {meal.time && <p className="text-xs text-white/40">{meal.time}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {meal.calories > 0 && (
                    <span className="flex items-center gap-1 text-sm text-white/50">
                      <Flame size={13} className="text-orange-400" /> {meal.calories} kcal
                    </span>
                  )}
                  <button onClick={() => setAddModal(meal.type)} className="btn-ghost p-1.5">
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {meal.items.length > 0 ? (
                <div className="space-y-2">
                  {meal.items.map((item) => (
                    <div key={item.name} className="flex items-center justify-between p-2.5 rounded-lg bg-surface-100 hover:bg-surface-200 transition-colors group cursor-pointer">
                      <div>
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-white/30">{item.quantity} · P:{item.protein}g C:{item.carbs}g G:{item.fat}g</p>
                      </div>
                      <span className="text-sm text-white/50">{item.calories} kcal</span>
                    </div>
                  ))}
                </div>
              ) : (
                <button onClick={() => setAddModal(meal.type)} className="w-full py-4 rounded-xl border border-dashed border-white/10 text-white/30 hover:border-brand-500/30 hover:text-brand-400 transition-all text-sm flex items-center justify-center gap-2">
                  <Plus size={16} /> Añadir alimento
                </button>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Barcode modal */}
      {barcodeModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={() => setBarcodeModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="glass border border-white/10 rounded-2xl p-6 w-full max-w-sm text-center"
          >
            <div className="w-14 h-14 rounded-xl bg-brand-500/20 flex items-center justify-center mx-auto mb-4">
              <Camera size={28} className="text-brand-400" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Escanear código de barras</h3>
            <p className="text-white/50 text-sm mb-6">Función de escaneo disponible en la app móvil</p>
            <button onClick={() => setBarcodeModal(false)} className="btn-secondary w-full">
              <X size={16} /> Cerrar
            </button>
          </motion.div>
        </div>
      )}

      {/* Add food modal */}
      {addModal && (
        <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={() => setAddModal(null)}>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="glass border border-white/10 rounded-2xl p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Añadir alimento</h3>
              <button onClick={() => setAddModal(null)} className="btn-ghost p-1.5">
                <X size={16} />
              </button>
            </div>

            {/* Quick search row */}
            <div className="relative mb-3">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input placeholder="Buscar alimento..." className="input pl-9" />
            </div>

            <div className="relative flex items-center gap-2 mb-5">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-white/30 shrink-0">o introduce manualmente</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <form onSubmit={handleAddFood} className="space-y-3">
              <div>
                <label className="text-xs text-white/40 mb-1 block">Nombre del alimento</label>
                <input
                  required
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  placeholder="Ej. Pechuga de pollo"
                  className="input text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/40 mb-1 block">Calorías (kcal)</label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={foodCals}
                    onChange={(e) => setFoodCals(e.target.value)}
                    placeholder="0"
                    className="input text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1 block">Proteína (g)</label>
                  <input
                    type="number"
                    min="0"
                    value={foodProt}
                    onChange={(e) => setFoodProt(e.target.value)}
                    placeholder="0"
                    className="input text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1 block">Carbohidratos (g)</label>
                  <input
                    type="number"
                    min="0"
                    value={foodCarbs}
                    onChange={(e) => setFoodCarbs(e.target.value)}
                    placeholder="0"
                    className="input text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1 block">Grasas (g)</label>
                  <input
                    type="number"
                    min="0"
                    value={foodFat}
                    onChange={(e) => setFoodFat(e.target.value)}
                    placeholder="0"
                    className="input text-sm"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setAddModal(null)} className="btn-secondary flex-1 text-sm">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary flex-1 text-sm">
                  <Plus size={15} /> Añadir
                </button>
              </div>
            </form>

            <p className="text-xs text-white/30 text-center mt-4">Base de datos: 500,000+ alimentos · Open Food Facts</p>
          </motion.div>
        </div>
      )}
    </div>
  )
}
