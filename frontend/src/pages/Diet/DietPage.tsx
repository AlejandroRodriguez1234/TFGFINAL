import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, Camera, Droplets, Flame, Coffee, Utensils, Apple, Moon, X, Loader2, Trash2 } from 'lucide-react'
import { cn } from '@utils/cn'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { dietApi } from '@services/api'
import { useDailyStore } from '@store/dailyStore'

type FoodItem = {
  id: string
  name: string
  brand?: string | null
  calories: number
  protein: number
  carbs: number
  fat: number
  serving_size: number
  serving_unit: string
}

type MealEntry = {
  id: string
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  quantity: number
  logged_at: string
  food_item: FoodItem
}

type FoodResult = {
  id?: string
  name: string
  brand?: string | null
  calories: number
  protein: number
  carbs: number
  fat: number
  serving_size: number
  serving_unit: string
}

const MEAL_TYPES = [
  { type: 'breakfast', icon: Coffee },
  { type: 'lunch',     icon: Utensils },
  { type: 'snack',     icon: Apple },
  { type: 'dinner',    icon: Moon },
] as const

const TARGET = { calories: 2200, protein: 165, carbs: 220, fat: 73 }
const MACRO_COLORS = { protein: '#0ea5e9', carbs: '#f97316', fat: '#a855f7' }

function calcMacros(entries: MealEntry[]) {
  return entries.reduce(
    (acc, e) => {
      const r = e.quantity / e.food_item.serving_size
      acc.calories += e.food_item.calories * r
      acc.protein  += e.food_item.protein  * r
      acc.carbs    += e.food_item.carbs    * r
      acc.fat      += e.food_item.fat      * r
      return acc
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  )
}

export default function DietPage() {
  const { t } = useTranslation()
  const { today, setCalories, setWater } = useDailyStore()
  const [entries, setEntries]             = useState<MealEntry[]>([])
  const [loadingMeals, setLoadingMeals]   = useState(true)
  const [waterMl, setWaterMl]             = useState(today.waterMl)

  const [addModal, setAddModal]           = useState<string | null>(null)
  const [barcodeModal, setBarcodeModal]   = useState(false)
  const [barcodeQuery, setBarcodeQuery]   = useState('')
  const [barcodeLoading, setBarcodeLoading] = useState(false)
  const [barcodeResult, setBarcodeResult] = useState<FoodResult | null | undefined>(undefined)
  const [barcodeMeal, setBarcodeMeal]     = useState('breakfast')

  const [searchQuery, setSearchQuery]     = useState('')
  const [searchResults, setSearchResults] = useState<FoodResult[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [selectedFood, setSelectedFood]   = useState<FoodResult | null>(null)
  const [quantity, setQuantity]           = useState('100')
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [foodName, setFoodName]   = useState('')
  const [foodCals, setFoodCals]   = useState('')
  const [foodProt, setFoodProt]   = useState('')
  const [foodCarbs, setFoodCarbs] = useState('')
  const [foodFat, setFoodFat]     = useState('')

  useEffect(() => {
    dietApi.get<{ success: boolean; data: MealEntry[] }>('/api/meals/today')
      .then(r => setEntries(r.data.data))
      .catch(() => setLoadingMeals(false))
      .finally(() => setLoadingMeals(false))

    dietApi.get<{ success: boolean; data: { total_ml: number } }>('/api/hydration/today')
      .then(r => { setWaterMl(r.data.data.total_ml); setWater(r.data.data.total_ml) })
      .catch(() => {/* usa valor del store */})
  }, [])

  useEffect(() => {
    const macros = calcMacros(entries)
    if (macros.calories > 0) setCalories(Math.round(macros.calories))
  }, [entries, setCalories])

  useEffect(() => {
    setWater(waterMl)
  }, [waterMl, setWater])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(async () => {
      setSearchLoading(true)
      try {
        const r = await dietApi.get<{ success: boolean; data: { local: FoodResult[]; remote: FoodResult[] } }>(
          '/api/foods/search',
          { params: { q: searchQuery } },
        )
        setSearchResults([...r.data.data.local, ...r.data.data.remote])
      } catch {
        // silent
      } finally {
        setSearchLoading(false)
      }
    }, 350)
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current) }
  }, [searchQuery])

  const resetModal = () => {
    setAddModal(null)
    setSelectedFood(null)
    setSearchQuery('')
    setSearchResults([])
    setQuantity('100')
    setFoodName(''); setFoodCals(''); setFoodProt(''); setFoodCarbs(''); setFoodFat('')
  }

  const addEntry = async (foodItemId: string, mealType: string, qty: number) => {
    const r = await dietApi.post<{ success: boolean; data: MealEntry }>('/api/meals', {
      food_item_id: foodItemId,
      meal_type: mealType,
      quantity: qty,
    })
    setEntries(prev => [...prev, r.data.data])
    toast.success(t('diet:foodAdded'))
    resetModal()
  }

  const handleSelectFood = (food: FoodResult) => {
    setSelectedFood(food)
    setSearchQuery('')
    setSearchResults([])
    setQuantity(String(food.serving_size))
  }

  const handleSubmitSelected = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFood || !addModal) return
    const qty = parseFloat(quantity)
    try {
      if (selectedFood.id) {
        await addEntry(selectedFood.id, addModal, qty)
      } else {
        const r = await dietApi.post<{ success: boolean; data: FoodItem }>('/api/foods', {
          name:         selectedFood.name,
          brand:        selectedFood.brand ?? undefined,
          calories:     selectedFood.calories,
          protein:      selectedFood.protein,
          carbs:        selectedFood.carbs,
          fat:          selectedFood.fat,
          serving_size: selectedFood.serving_size,
          serving_unit: selectedFood.serving_unit,
        })
        await addEntry(r.data.data.id, addModal, qty)
      }
    } catch {
      toast.error(t('diet:errorAddingFood'))
    }
  }

  const handleSubmitManual = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!addModal) return
    try {
      const r = await dietApi.post<{ success: boolean; data: FoodItem }>('/api/foods', {
        name:         foodName,
        calories:     parseFloat(foodCals),
        protein:      parseFloat(foodProt  || '0'),
        carbs:        parseFloat(foodCarbs || '0'),
        fat:          parseFloat(foodFat   || '0'),
        serving_size: 100,
        serving_unit: 'g',
      })
      await addEntry(r.data.data.id, addModal, parseFloat(quantity || '100'))
    } catch {
      toast.error(t('diet:errorAddingFood'))
    }
  }

  const handleAddWater = async () => {
    if (waterMl >= 2500) return
    setWaterMl(prev => prev + 250)
    try {
      await dietApi.post('/api/hydration/log', { amount_ml: 250 })
    } catch {
      setWaterMl(prev => prev - 250)
      toast.error(t('diet:errorWater'))
    }
  }

  const handleDelete = async (entryId: string) => {
    try {
      await dietApi.delete(`/api/meals/${entryId}`)
      setEntries(prev => prev.filter(e => e.id !== entryId))
      toast.success(t('diet:foodDeleted'))
    } catch {
      toast.error(t('diet:errorDeleting'))
    }
  }

  const closeBarcodeModal = () => {
    setBarcodeModal(false)
    setBarcodeQuery('')
    setBarcodeResult(undefined)
  }

  const handleBarcodeSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!barcodeQuery.trim()) return
    setBarcodeLoading(true)
    setBarcodeResult(undefined)
    try {
      const res = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${barcodeQuery.trim()}.json`,
      )
      const data = await res.json()
      if (data.status === 1 && data.product) {
        const p = data.product
        const n = p.nutriments ?? {}
        setBarcodeResult({
          name:         p.product_name || 'Producto',
          brand:        p.brands       || undefined,
          calories:     n['energy-kcal_100g'] ?? n['energy-kcal'] ?? 0,
          protein:      n.proteins_100g       ?? n.proteins        ?? 0,
          carbs:        n.carbohydrates_100g  ?? n.carbohydrates   ?? 0,
          fat:          n.fat_100g            ?? n.fat             ?? 0,
          serving_size: 100,
          serving_unit: 'g',
        })
      } else {
        setBarcodeResult(null)
      }
    } catch {
      setBarcodeResult(null)
    } finally {
      setBarcodeLoading(false)
    }
  }

  const handleBarcodeAdd = async () => {
    if (!barcodeResult) return
    const demoEntry: MealEntry = {
      id:         crypto.randomUUID(),
      meal_type:  barcodeMeal as MealEntry['meal_type'],
      quantity:   100,
      logged_at:  new Date().toISOString(),
      food_item: {
        id:           crypto.randomUUID(),
        name:         barcodeResult.name,
        brand:        barcodeResult.brand,
        calories:     barcodeResult.calories,
        protein:      barcodeResult.protein,
        carbs:        barcodeResult.carbs,
        fat:          barcodeResult.fat,
        serving_size: 100,
        serving_unit: 'g',
      },
    }
    try {
      const rf = await dietApi.post<{ success: boolean; data: FoodItem }>('/api/foods', {
        name: barcodeResult.name, brand: barcodeResult.brand,
        calories: barcodeResult.calories, protein: barcodeResult.protein,
        carbs: barcodeResult.carbs, fat: barcodeResult.fat,
        serving_size: 100, serving_unit: 'g',
      })
      await addEntry(rf.data.data.id, barcodeMeal, 100)
    } catch {
      setEntries(prev => [...prev, demoEntry])
      toast.success(t('diet:foodAdded'))
      closeBarcodeModal()
    }
  }

  const todayMacros = calcMacros(entries)
  const pct = (val: number, target: number) => Math.min(100, (val / target) * 100)
  const piData = [
    { name: t('diet:protein'), value: todayMacros.protein * 4, color: MACRO_COLORS.protein },
    { name: t('diet:carbs'),   value: todayMacros.carbs * 4,   color: MACRO_COLORS.carbs },
    { name: t('diet:fat'),     value: todayMacros.fat * 9,     color: MACRO_COLORS.fat },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">{t('diet:title')}</h1>
          <p className="text-white/40 text-sm mt-1">{t('diet:subtitle')}</p>
        </div>
        <button onClick={() => setBarcodeModal(true)} className="btn-secondary text-sm px-3 py-2">
          <Camera size={16} /> {t('diet:scanBtn')}
        </button>
      </div>

      {/* Macro summary */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">{t('diet:daySummary')}</h2>
          <span className="text-sm text-white/40">
            {Math.round(todayMacros.calories)} / {TARGET.calories} kcal
          </span>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex items-center gap-6">
            <div className="relative w-28 h-28 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={piData} innerRadius={38} outerRadius={52} dataKey="value" startAngle={90} endAngle={-270} strokeWidth={0}>
                    {piData.map(entry => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #2e2e2e', borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold">{Math.round(todayMacros.calories)}</span>
                <span className="text-xs text-white/40">kcal</span>
              </div>
            </div>
            <div className="space-y-2 flex-1">
              {([
                { key: 'protein', val: todayMacros.protein, target: TARGET.protein, color: MACRO_COLORS.protein },
                { key: 'carbs',   val: todayMacros.carbs,   target: TARGET.carbs,   color: MACRO_COLORS.carbs },
                { key: 'fat',     val: todayMacros.fat,     target: TARGET.fat,     color: MACRO_COLORS.fat },
              ] as const).map(({ key, val, target, color }) => (
                <div key={key}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/60">{t(`diet:${key}`)}</span>
                    <span style={{ color }}>{Math.round(val)}g / {target}g</span>
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
              <h3 className="text-sm font-medium">{t('diet:hydration')}</h3>
              <span className="text-sm text-cyan-400">{waterMl}ml / 2500ml</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {Array.from({ length: 10 }).map((_, i) => {
                const filled = i < Math.floor(waterMl / 250)
                return (
                  <button key={i} onClick={handleAddWater} disabled={waterMl >= 2500}
                    className={cn('w-8 h-10 rounded-lg flex items-center justify-center transition-all',
                      filled ? 'bg-cyan-500/30 text-cyan-400' : 'bg-surface-100 text-white/20 hover:bg-cyan-500/10')}>
                    <Droplets size={16} />
                  </button>
                )
              })}
            </div>
            <p className="text-xs text-white/30 mt-2">
              {t('diet:glassesRemaining', { n: Math.max(0, 10 - Math.floor(waterMl / 250)) })}
            </p>
          </div>
        </div>
      </div>

      {/* Meal cards */}
      <div className="space-y-4">
        {loadingMeals ? (
          <div className="flex justify-center py-12">
            <Loader2 size={24} className="animate-spin text-white/30" />
          </div>
        ) : (
          MEAL_TYPES.map(({ type, icon: MealIcon }) => {
            const mealLabel = t(`diet:${type}`)
            const mealEntries = entries.filter(e => e.meal_type === type)
            const mealCal = mealEntries.reduce(
              (sum, e) => sum + (e.food_item.calories / e.food_item.serving_size) * e.quantity, 0,
            )
            return (
              <motion.div key={type} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-surface-100 flex items-center justify-center shrink-0">
                      <MealIcon size={16} className="text-brand-400" />
                    </div>
                    <h3 className="font-semibold text-sm">{mealLabel}</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    {mealCal > 0 && (
                      <span className="flex items-center gap-1 text-sm text-white/50">
                        <Flame size={13} className="text-orange-400" /> {Math.round(mealCal)} kcal
                      </span>
                    )}
                    <button onClick={() => setAddModal(type)} className="btn-ghost p-1.5">
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                {mealEntries.length > 0 ? (
                  <div className="space-y-2">
                    {mealEntries.map(entry => {
                      const r = entry.quantity / entry.food_item.serving_size
                      return (
                        <div key={entry.id} className="flex items-center justify-between p-2.5 rounded-lg bg-surface-100 hover:bg-surface-200 transition-colors group">
                          <div>
                            <p className="text-sm font-medium">{entry.food_item.name}</p>
                            <p className="text-xs text-white/30">
                              {entry.quantity}{entry.food_item.serving_unit} · P:{Math.round(entry.food_item.protein * r)}g C:{Math.round(entry.food_item.carbs * r)}g G:{Math.round(entry.food_item.fat * r)}g
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-white/50">{Math.round(entry.food_item.calories * r)} kcal</span>
                            <button
                              onClick={() => handleDelete(entry.id)}
                              className="opacity-0 group-hover:opacity-100 btn-ghost p-1 text-red-400 hover:text-red-300 transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <button onClick={() => setAddModal(type)}
                    className="w-full py-4 rounded-xl border border-dashed border-white/10 text-white/30 hover:border-brand-500/30 hover:text-brand-400 transition-all text-sm flex items-center justify-center gap-2">
                    <Plus size={16} /> {t('diet:addFood')}
                  </button>
                )}
              </motion.div>
            )
          })
        )}
      </div>

      {/* Barcode modal */}
      {barcodeModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={closeBarcodeModal}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            onClick={e => e.stopPropagation()}
            className="glass border border-white/10 rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Camera size={18} className="text-brand-400" />
                <h3 className="font-semibold">{t('diet:barcodeTitle')}</h3>
              </div>
              <button onClick={closeBarcodeModal} className="btn-ghost p-1.5"><X size={16} /></button>
            </div>
            <p className="text-white/50 text-xs mb-4">{t('diet:barcodeSubtitle')}</p>

            <form onSubmit={handleBarcodeSearch} className="flex gap-2 mb-4">
              <input
                value={barcodeQuery}
                onChange={e => setBarcodeQuery(e.target.value)}
                placeholder="8410188036148"
                inputMode="numeric"
                className="input flex-1 text-sm font-mono"
                autoFocus
              />
              <button type="submit" disabled={barcodeLoading} className="btn-primary px-3">
                {barcodeLoading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
              </button>
            </form>

            {barcodeResult === null && (
              <p className="text-xs text-danger text-center mb-4">{t('diet:barcodeNotFound')}</p>
            )}

            {barcodeResult && (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-surface-100 border border-brand-500/20">
                  <p className="text-sm font-semibold">{barcodeResult.name}</p>
                  {barcodeResult.brand && <p className="text-xs text-white/40 mt-0.5">{barcodeResult.brand}</p>}
                  <div className="grid grid-cols-4 gap-2 mt-3 text-xs text-center">
                    {[
                      { label: 'kcal', value: Math.round(barcodeResult.calories), color: 'text-white' },
                      { label: 'prot', value: `${Math.round(barcodeResult.protein)}g`, color: 'text-sky-400' },
                      { label: 'carb', value: `${Math.round(barcodeResult.carbs)}g`, color: 'text-orange-400' },
                      { label: 'gras', value: `${Math.round(barcodeResult.fat)}g`, color: 'text-purple-400' },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="p-1.5 rounded-lg bg-surface-200">
                        <p className={cn('font-bold', color)}>{value}</p>
                        <p className="text-white/40">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1 block">{t('diet:addFood')}</label>
                  <select value={barcodeMeal} onChange={e => setBarcodeMeal(e.target.value)} className="input w-full text-sm mb-3">
                    {MEAL_TYPES.map(m => (
                      <option key={m.type} value={m.type}>{t(`diet:${m.type}`)}</option>
                    ))}
                  </select>
                  <button onClick={handleBarcodeAdd} className="btn-primary w-full text-sm">
                    <Plus size={15} /> {t('common:add')} (100g)
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Add food modal */}
      {addModal && (
        <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={resetModal}>
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}
            onClick={e => e.stopPropagation()}
            className="glass border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">{t('diet:addFood')}</h3>
              <button onClick={resetModal} className="btn-ghost p-1.5"><X size={16} /></button>
            </div>

            {selectedFood ? (
              <form onSubmit={handleSubmitSelected} className="space-y-4">
                <div className="p-3 rounded-xl bg-surface-100 border border-brand-500/20">
                  <p className="text-sm font-medium">{selectedFood.name}</p>
                  {selectedFood.brand && <p className="text-xs text-white/40 mt-0.5">{selectedFood.brand}</p>}
                  <p className="text-xs text-white/30 mt-1">
                    {Math.round(selectedFood.calories)} kcal · P:{Math.round(selectedFood.protein)}g C:{Math.round(selectedFood.carbs)}g G:{Math.round(selectedFood.fat)}g {t('diet:quantity', { unit: selectedFood.serving_unit }).split('(')[0].trim()} {selectedFood.serving_size}{selectedFood.serving_unit}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1 block">{t('diet:quantity', { unit: selectedFood.serving_unit })}</label>
                  <input
                    required type="number" min="1"
                    value={quantity} onChange={e => setQuantity(e.target.value)}
                    className="input text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setSelectedFood(null)} className="btn-secondary flex-1 text-sm">{t('common:back')}</button>
                  <button type="submit" className="btn-primary flex-1 text-sm"><Plus size={15} /> {t('common:add')}</button>
                </div>
              </form>
            ) : (
              <>
                <div className="relative mb-3">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    autoFocus
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder={t('diet:searchFood')}
                    className="input pl-9"
                  />
                  {searchLoading && (
                    <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-white/30" />
                  )}
                </div>

                {searchResults.length > 0 && (
                  <div className="mb-3 max-h-48 overflow-y-auto rounded-xl border border-white/10 divide-y divide-white/5">
                    {searchResults.map((food, i) => (
                      <button key={i} type="button" onClick={() => handleSelectFood(food)}
                        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-surface-100 transition-colors text-left">
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{food.name}</p>
                          {food.brand && <p className="text-xs text-white/30 truncate">{food.brand}</p>}
                        </div>
                        <span className="text-xs text-white/40 shrink-0 ml-2">{Math.round(food.calories)} kcal</span>
                      </button>
                    ))}
                  </div>
                )}

                {searchQuery && !searchLoading && searchResults.length === 0 && (
                  <p className="text-xs text-white/30 mb-3 text-center">{t('diet:noResults')}</p>
                )}

                <div className="relative flex items-center gap-2 mb-4">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-xs text-white/30 shrink-0">{t('diet:orEnterManually')}</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                <form onSubmit={handleSubmitManual} className="space-y-3">
                  <div>
                    <label className="text-xs text-white/40 mb-1 block">{t('diet:foodName')}</label>
                    <input required value={foodName} onChange={e => setFoodName(e.target.value)}
                      placeholder="Ej. Pechuga de pollo" className="input text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-white/40 mb-1 block">{t('diet:caloriesPer100g')}</label>
                      <input required type="number" min="0" value={foodCals}
                        onChange={e => setFoodCals(e.target.value)} placeholder="0" className="input text-sm" />
                    </div>
                    <div>
                      <label className="text-xs text-white/40 mb-1 block">{t('diet:proteinPer100g')}</label>
                      <input type="number" min="0" value={foodProt}
                        onChange={e => setFoodProt(e.target.value)} placeholder="0" className="input text-sm" />
                    </div>
                    <div>
                      <label className="text-xs text-white/40 mb-1 block">{t('diet:carbsPer100g')}</label>
                      <input type="number" min="0" value={foodCarbs}
                        onChange={e => setFoodCarbs(e.target.value)} placeholder="0" className="input text-sm" />
                    </div>
                    <div>
                      <label className="text-xs text-white/40 mb-1 block">{t('diet:fatPer100g')}</label>
                      <input type="number" min="0" value={foodFat}
                        onChange={e => setFoodFat(e.target.value)} placeholder="0" className="input text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-white/40 mb-1 block">{t('diet:quantityG')}</label>
                    <input type="number" min="1" value={quantity}
                      onChange={e => setQuantity(e.target.value)} placeholder="100" className="input text-sm" />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button type="button" onClick={resetModal} className="btn-secondary flex-1 text-sm">{t('common:cancel')}</button>
                    <button type="submit" className="btn-primary flex-1 text-sm"><Plus size={15} /> {t('common:add')}</button>
                  </div>
                </form>

                <p className="text-xs text-white/30 text-center mt-4">{t('diet:foodDatabase')}</p>
              </>
            )}
          </motion.div>
        </div>
      )}
    </div>
  )
}
