import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Plus, Search, BookOpen, Droplets, Flame, Coffee, Utensils, Apple, Moon,
  X, Trash2, CheckCircle2, Tag,
} from 'lucide-react'
import { cn } from '@utils/cn'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { useDailyStore } from '@store/dailyStore'

type HealthLabel = 'healthy' | 'moderate' | 'unhealthy'

type CatalogProduct = {
  refCode: string
  name: string
  brand?: string
  category: string
  health: HealthLabel
  calories: number
  protein: number
  carbs: number
  fat: number
  serving_size: number
  serving_unit: string
}

type FoodItem = {
  id: string
  refCode?: string
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

const MEAL_TYPES = [
  { type: 'breakfast', icon: Coffee },
  { type: 'lunch',     icon: Utensils },
  { type: 'snack',     icon: Apple },
  { type: 'dinner',    icon: Moon },
] as const

const TARGET = { calories: 2200, protein: 165, carbs: 220, fat: 73 }
const MACRO_COLORS = { protein: '#0ea5e9', carbs: '#f97316', fat: '#a855f7' }

const HEALTH_CONFIG: Record<HealthLabel, { label: string; color: string; bg: string }> = {
  healthy:   { label: 'Saludable',       color: 'text-green-400',  bg: 'bg-green-500/20'  },
  moderate:  { label: 'Moderado',        color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  unhealthy: { label: 'Menos saludable', color: 'text-red-400',    bg: 'bg-red-500/20'    },
}

const PRODUCT_CATALOG: CatalogProduct[] = [
  { refCode: '#FF001', name: 'Pechuga de pollo a la plancha', category: 'Carnes y aves',    health: 'healthy',   calories: 165, protein: 31,  carbs: 0,   fat: 3.6, serving_size: 100, serving_unit: 'g'  },
  { refCode: '#FF002', name: 'Muslo de pollo al horno',       category: 'Carnes y aves',    health: 'moderate',  calories: 215, protein: 26,  carbs: 0,   fat: 12,  serving_size: 100, serving_unit: 'g'  },
  { refCode: '#FF003', name: 'Ternera magra a la plancha',    category: 'Carnes y aves',    health: 'moderate',  calories: 172, protein: 28,  carbs: 0,   fat: 6,   serving_size: 100, serving_unit: 'g'  },
  { refCode: '#FF004', name: 'Lomo de cerdo al horno',        category: 'Carnes y aves',    health: 'moderate',  calories: 182, protein: 27,  carbs: 0,   fat: 8,   serving_size: 100, serving_unit: 'g'  },
  { refCode: '#FF005', name: 'Pavo en lonchas',               category: 'Carnes y aves',    health: 'healthy',   calories: 107, protein: 21,  carbs: 1.4, fat: 1.6, serving_size: 100, serving_unit: 'g'  },
  { refCode: '#FF006', name: 'Jamón serrano',                 category: 'Embutidos',        health: 'moderate',  calories: 241, protein: 30,  carbs: 0,   fat: 14,  serving_size: 100, serving_unit: 'g'  },
  { refCode: '#FF007', name: 'Chorizo',                       category: 'Embutidos',        health: 'unhealthy', calories: 455, protein: 24,  carbs: 1.9, fat: 40,  serving_size: 100, serving_unit: 'g'  },
  { refCode: '#FF008', name: 'Salchichón',                    category: 'Embutidos',        health: 'unhealthy', calories: 430, protein: 22,  carbs: 2,   fat: 37,  serving_size: 100, serving_unit: 'g'  },
  { refCode: '#FF009', name: 'Salmón al horno',               category: 'Pescados',         health: 'healthy',   calories: 208, protein: 20,  carbs: 0,   fat: 13,  serving_size: 100, serving_unit: 'g'  },
  { refCode: '#FF010', name: 'Atún en lata (escurrido)',       category: 'Pescados',         health: 'healthy',   calories: 116, protein: 26,  carbs: 0,   fat: 1,   serving_size: 100, serving_unit: 'g'  },
  { refCode: '#FF011', name: 'Merluza al vapor',              category: 'Pescados',         health: 'healthy',   calories: 80,  protein: 18,  carbs: 0,   fat: 0.8, serving_size: 100, serving_unit: 'g'  },
  { refCode: '#FF012', name: 'Sardinas en aceite',            category: 'Pescados',         health: 'moderate',  calories: 208, protein: 25,  carbs: 0,   fat: 12,  serving_size: 100, serving_unit: 'g'  },
  { refCode: '#FF013', name: 'Gambas cocidas',                category: 'Pescados',         health: 'healthy',   calories: 99,  protein: 21,  carbs: 0,   fat: 1.7, serving_size: 100, serving_unit: 'g'  },
  { refCode: '#FF014', name: 'Bacalao desalado',              category: 'Pescados',         health: 'healthy',   calories: 82,  protein: 19,  carbs: 0,   fat: 0.7, serving_size: 100, serving_unit: 'g'  },
  { refCode: '#FF015', name: 'Huevos revueltos',              category: 'Lácteos y huevos', health: 'moderate',  calories: 148, protein: 10,  carbs: 1.6, fat: 11,  serving_size: 100, serving_unit: 'g'  },
  { refCode: '#FF016', name: 'Tortilla de 2 huevos',          category: 'Lácteos y huevos', health: 'moderate',  calories: 185, protein: 13,  carbs: 1.2, fat: 14,  serving_size: 100, serving_unit: 'g'  },
  { refCode: '#FF017', name: 'Yogur natural',                 category: 'Lácteos y huevos', health: 'moderate',  calories: 59,  protein: 3.5, carbs: 4.7, fat: 3.3, serving_size: 100, serving_unit: 'g'  },
  { refCode: '#FF018', name: 'Leche entera',                  category: 'Lácteos y huevos', health: 'moderate',  calories: 61,  protein: 3.2, carbs: 4.8, fat: 3.3, serving_size: 100, serving_unit: 'ml' },
  { refCode: '#FF019', name: 'Queso fresco',                  category: 'Lácteos y huevos', health: 'moderate',  calories: 98,  protein: 11,  carbs: 3.4, fat: 4.5, serving_size: 100, serving_unit: 'g'  },
  { refCode: '#FF020', name: 'Queso manchego curado',         category: 'Lácteos y huevos', health: 'unhealthy', calories: 395, protein: 27,  carbs: 0.5, fat: 32,  serving_size: 100, serving_unit: 'g'  },
  { refCode: '#FF021', name: 'Requesón',                      category: 'Lácteos y huevos', health: 'healthy',   calories: 74,  protein: 13,  carbs: 3,   fat: 1.3, serving_size: 100, serving_unit: 'g'  },
  { refCode: '#FF022', name: 'Avena con leche',               category: 'Cereales',         health: 'moderate',  calories: 372, protein: 13,  carbs: 58,  fat: 8,   serving_size: 100, serving_unit: 'g'  },
  { refCode: '#FF023', name: 'Arroz blanco cocido',           category: 'Cereales',         health: 'moderate',  calories: 130, protein: 2.7, carbs: 28,  fat: 0.3, serving_size: 100, serving_unit: 'g'  },
  { refCode: '#FF024', name: 'Pasta cocida',                  category: 'Cereales',         health: 'moderate',  calories: 158, protein: 5.8, carbs: 31,  fat: 0.9, serving_size: 100, serving_unit: 'g'  },
  { refCode: '#FF025', name: 'Pan integral',                  category: 'Cereales',         health: 'moderate',  calories: 247, protein: 13,  carbs: 41,  fat: 4.2, serving_size: 100, serving_unit: 'g'  },
  { refCode: '#FF026', name: 'Pan blanco',                    category: 'Cereales',         health: 'unhealthy', calories: 265, protein: 9,   carbs: 51,  fat: 3.2, serving_size: 100, serving_unit: 'g'  },
  { refCode: '#FF027', name: 'Quinoa cocida',                 category: 'Cereales',         health: 'healthy',   calories: 120, protein: 4.4, carbs: 22,  fat: 1.9, serving_size: 100, serving_unit: 'g'  },
  { refCode: '#FF028', name: 'Copos de avena',                category: 'Cereales',         health: 'healthy',   calories: 389, protein: 17,  carbs: 66,  fat: 7,   serving_size: 100, serving_unit: 'g'  },
  { refCode: '#FF029', name: 'Plátano',                       category: 'Frutas',           health: 'healthy',   calories: 89,  protein: 1.1, carbs: 23,  fat: 0.3, serving_size: 100, serving_unit: 'g'  },
  { refCode: '#FF030', name: 'Manzana',                       category: 'Frutas',           health: 'healthy',   calories: 52,  protein: 0.3, carbs: 14,  fat: 0.2, serving_size: 100, serving_unit: 'g'  },
  { refCode: '#FF031', name: 'Naranja',                       category: 'Frutas',           health: 'healthy',   calories: 47,  protein: 0.9, carbs: 12,  fat: 0.1, serving_size: 100, serving_unit: 'g'  },
  { refCode: '#FF032', name: 'Fresas',                        category: 'Frutas',           health: 'healthy',   calories: 32,  protein: 0.7, carbs: 7.7, fat: 0.3, serving_size: 100, serving_unit: 'g'  },
  { refCode: '#FF033', name: 'Kiwi',                          category: 'Frutas',           health: 'healthy',   calories: 61,  protein: 1.1, carbs: 15,  fat: 0.5, serving_size: 100, serving_unit: 'g'  },
  { refCode: '#FF034', name: 'Uvas',                          category: 'Frutas',           health: 'moderate',  calories: 69,  protein: 0.7, carbs: 18,  fat: 0.2, serving_size: 100, serving_unit: 'g'  },
  { refCode: '#FF035', name: 'Mango',                         category: 'Frutas',           health: 'moderate',  calories: 60,  protein: 0.8, carbs: 15,  fat: 0.4, serving_size: 100, serving_unit: 'g'  },
  { refCode: '#FF036', name: 'Sandía',                        category: 'Frutas',           health: 'healthy',   calories: 30,  protein: 0.6, carbs: 7.6, fat: 0.2, serving_size: 100, serving_unit: 'g'  },
  { refCode: '#FF037', name: 'Brócoli cocido',                category: 'Verduras',         health: 'healthy',   calories: 34,  protein: 2.8, carbs: 7,   fat: 0.4, serving_size: 100, serving_unit: 'g'  },
  { refCode: '#FF038', name: 'Patata cocida',                 category: 'Verduras',         health: 'moderate',  calories: 87,  protein: 1.9, carbs: 20,  fat: 0.1, serving_size: 100, serving_unit: 'g'  },
  { refCode: '#FF039', name: 'Espinacas',                     category: 'Verduras',         health: 'healthy',   calories: 23,  protein: 2.9, carbs: 3.6, fat: 0.4, serving_size: 100, serving_unit: 'g'  },
  { refCode: '#FF040', name: 'Tomate',                        category: 'Verduras',         health: 'healthy',   calories: 18,  protein: 0.9, carbs: 3.9, fat: 0.2, serving_size: 100, serving_unit: 'g'  },
  { refCode: '#FF041', name: 'Zanahoria',                     category: 'Verduras',         health: 'healthy',   calories: 41,  protein: 0.9, carbs: 10,  fat: 0.2, serving_size: 100, serving_unit: 'g'  },
  { refCode: '#FF042', name: 'Aguacate',                      category: 'Verduras',         health: 'healthy',   calories: 160, protein: 2,   carbs: 9,   fat: 15,  serving_size: 100, serving_unit: 'g'  },
  { refCode: '#FF043', name: 'Pepino',                        category: 'Verduras',         health: 'healthy',   calories: 16,  protein: 0.7, carbs: 3.6, fat: 0.1, serving_size: 100, serving_unit: 'g'  },
  { refCode: '#FF044', name: 'Lenteja cocida',                category: 'Legumbres',        health: 'healthy',   calories: 116, protein: 9,   carbs: 20,  fat: 0.4, serving_size: 100, serving_unit: 'g'  },
  { refCode: '#FF045', name: 'Garbanzo cocido',               category: 'Legumbres',        health: 'healthy',   calories: 164, protein: 9,   carbs: 27,  fat: 2.6, serving_size: 100, serving_unit: 'g'  },
  { refCode: '#FF046', name: 'Judía blanca cocida',           category: 'Legumbres',        health: 'healthy',   calories: 127, protein: 9,   carbs: 23,  fat: 0.5, serving_size: 100, serving_unit: 'g'  },
  { refCode: '#FF047', name: 'Edamame',                       category: 'Legumbres',        health: 'healthy',   calories: 122, protein: 11,  carbs: 10,  fat: 5,   serving_size: 100, serving_unit: 'g'  },
  { refCode: '#FF048', name: 'Almendras',                     category: 'Frutos secos',     health: 'healthy',   calories: 579, protein: 21,  carbs: 22,  fat: 50,  serving_size: 30,  serving_unit: 'g'  },
  { refCode: '#FF049', name: 'Nueces',                        category: 'Frutos secos',     health: 'healthy',   calories: 654, protein: 15,  carbs: 14,  fat: 65,  serving_size: 30,  serving_unit: 'g'  },
  { refCode: '#FF050', name: 'Cacahuetes',                    category: 'Frutos secos',     health: 'moderate',  calories: 567, protein: 26,  carbs: 16,  fat: 49,  serving_size: 30,  serving_unit: 'g'  },
  { refCode: '#FF051', name: 'Semillas de chía',              category: 'Frutos secos',     health: 'healthy',   calories: 486, protein: 17,  carbs: 42,  fat: 31,  serving_size: 20,  serving_unit: 'g'  },
  { refCode: '#FF052', name: 'Aceite de oliva',               category: 'Aceites',          health: 'moderate',  calories: 884, protein: 0,   carbs: 0,   fat: 100, serving_size: 10,  serving_unit: 'ml' },
  { refCode: '#FF053', name: 'Mantequilla',                   category: 'Aceites',          health: 'unhealthy', calories: 717, protein: 0.9, carbs: 0.1, fat: 81,  serving_size: 10,  serving_unit: 'g'  },
  { refCode: '#FF054', name: 'Proteína de suero (Whey)',      category: 'Suplementos',      health: 'healthy',   calories: 400, protein: 80,  carbs: 8,   fat: 6,   serving_size: 30,  serving_unit: 'g', brand: 'MyProtein' },
  { refCode: '#FF055', name: 'Leche de avena',                category: 'Bebidas',          health: 'moderate',  calories: 45,  protein: 1,   carbs: 9,   fat: 0.5, serving_size: 100, serving_unit: 'ml', brand: 'Oatly' },
  { refCode: '#FF056', name: 'Leche de almendra',             category: 'Bebidas',          health: 'healthy',   calories: 17,  protein: 0.6, carbs: 1.4, fat: 1.1, serving_size: 100, serving_unit: 'ml' },
  { refCode: '#FF057', name: 'Zumo de naranja natural',       category: 'Bebidas',          health: 'moderate',  calories: 45,  protein: 0.7, carbs: 10,  fat: 0.2, serving_size: 200, serving_unit: 'ml' },
]

const DEMO_MEALS: MealEntry[] = [
  { id: 'demo1', meal_type: 'breakfast', quantity: 150, logged_at: new Date().toISOString(), food_item: { id: 'f1', refCode: '#FF022', name: 'Avena con leche', calories: 372, protein: 13, carbs: 58, fat: 8, serving_size: 100, serving_unit: 'g' } },
  { id: 'demo2', meal_type: 'breakfast', quantity: 100, logged_at: new Date().toISOString(), food_item: { id: 'f2', refCode: '#FF029', name: 'Plátano', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, serving_size: 100, serving_unit: 'g' } },
  { id: 'demo3', meal_type: 'lunch', quantity: 200, logged_at: new Date().toISOString(), food_item: { id: 'f3', refCode: '#FF001', name: 'Pechuga de pollo a la plancha', calories: 165, protein: 31, carbs: 0, fat: 3.6, serving_size: 100, serving_unit: 'g' } },
  { id: 'demo4', meal_type: 'lunch', quantity: 180, logged_at: new Date().toISOString(), food_item: { id: 'f4', refCode: '#FF023', name: 'Arroz blanco cocido', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, serving_size: 100, serving_unit: 'g' } },
  { id: 'demo5', meal_type: 'snack', quantity: 30, logged_at: new Date().toISOString(), food_item: { id: 'f5', refCode: '#FF048', name: 'Almendras', calories: 579, protein: 21, carbs: 22, fat: 50, serving_size: 30, serving_unit: 'g' } },
]

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
  const [entries, setEntries]   = useState<MealEntry[]>(DEMO_MEALS)
  const [waterMl, setWaterMl]   = useState(today.waterMl || 500)
  const [addModal, setAddModal]         = useState<string | null>(null)
  const [searchQuery, setSearchQuery]   = useState('')
  const [searchResults, setSearchResults] = useState<CatalogProduct[]>([])
  const [selectedFood, setSelectedFood] = useState<CatalogProduct | null>(null)
  const [quantity, setQuantity]         = useState('100')
  const [foodName, setFoodName]   = useState('')
  const [foodCals, setFoodCals]   = useState('')
  const [foodProt, setFoodProt]   = useState('')
  const [foodCarbs, setFoodCarbs] = useState('')
  const [foodFat, setFoodFat]     = useState('')
  const [catalogModal, setCatalogModal]   = useState(false)
  const [catalogSearch, setCatalogSearch] = useState('')
  const [catalogFilter, setCatalogFilter] = useState<'all' | HealthLabel>('all')
  const [catalogAddRef, setCatalogAddRef] = useState<string | null>(null)
  const [catalogAddMeal, setCatalogAddMeal] = useState('breakfast')
  const [catalogAddQty, setCatalogAddQty]   = useState('100')

  useEffect(() => {
    const macros = calcMacros(entries)
    if (macros.calories > 0) setCalories(Math.round(macros.calories))
  }, [entries, setCalories])

  useEffect(() => { setWater(waterMl) }, [waterMl, setWater])

  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return }
    const q = searchQuery.toLowerCase()
    setSearchResults(PRODUCT_CATALOG.filter(p =>
      p.name.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q) || p.refCode.toLowerCase().includes(q)
    ))
  }, [searchQuery])

  const resetModal = () => {
    setAddModal(null); setSelectedFood(null); setSearchQuery(''); setSearchResults([])
    setQuantity('100'); setFoodName(''); setFoodCals(''); setFoodProt(''); setFoodCarbs(''); setFoodFat('')
  }

  const handleSelectFood = (food: CatalogProduct) => {
    setSelectedFood(food); setSearchQuery(''); setSearchResults([]); setQuantity(String(food.serving_size))
  }

  const handleSubmitSelected = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFood || !addModal) return
    setEntries(prev => [...prev, {
      id: crypto.randomUUID(), meal_type: addModal as MealEntry['meal_type'],
      quantity: parseFloat(quantity), logged_at: new Date().toISOString(),
      food_item: { id: crypto.randomUUID(), refCode: selectedFood.refCode, name: selectedFood.name, brand: selectedFood.brand, calories: selectedFood.calories, protein: selectedFood.protein, carbs: selectedFood.carbs, fat: selectedFood.fat, serving_size: selectedFood.serving_size, serving_unit: selectedFood.serving_unit },
    }])
    toast.success(t('diet:foodAdded'))
    resetModal()
  }

  const handleSubmitManual = (e: React.FormEvent) => {
    e.preventDefault()
    if (!addModal || !foodName || !foodCals) return
    setEntries(prev => [...prev, {
      id: crypto.randomUUID(), meal_type: addModal as MealEntry['meal_type'],
      quantity: parseFloat(quantity || '100'), logged_at: new Date().toISOString(),
      food_item: { id: crypto.randomUUID(), name: foodName, calories: parseFloat(foodCals), protein: parseFloat(foodProt || '0'), carbs: parseFloat(foodCarbs || '0'), fat: parseFloat(foodFat || '0'), serving_size: 100, serving_unit: 'g' },
    }])
    toast.success(t('diet:foodAdded'))
    resetModal()
  }

  const handleDelete = (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id))
    toast.success(t('diet:foodDeleted'))
  }

  const handleAddWater = () => { if (waterMl < 2500) setWaterMl(prev => prev + 250) }

  const handleCatalogAdd = (product: CatalogProduct) => {
    const qty = parseFloat(catalogAddQty) || product.serving_size
    setEntries(prev => [...prev, {
      id: crypto.randomUUID(), meal_type: catalogAddMeal as MealEntry['meal_type'],
      quantity: qty, logged_at: new Date().toISOString(),
      food_item: { id: crypto.randomUUID(), refCode: product.refCode, name: product.name, brand: product.brand, calories: product.calories, protein: product.protein, carbs: product.carbs, fat: product.fat, serving_size: product.serving_size, serving_unit: product.serving_unit },
    }])
    toast.success(`${product.name} añadido a ${t(`diet:${catalogAddMeal}`)}`)
    setCatalogAddRef(null)
  }

  const getProductUsage = (refCode: string) => {
    const used = entries.filter(e => e.food_item.refCode === refCode)
    if (!used.length) return null
    return [...new Set(used.map(e => t(`diet:${e.meal_type}`)))].join(', ')
  }

  const filteredCatalog = PRODUCT_CATALOG.filter(p => {
    const q = catalogSearch.toLowerCase()
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.refCode.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q)
    return matchSearch && (catalogFilter === 'all' || p.health === catalogFilter)
  })

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
        <button onClick={() => setCatalogModal(true)} className="btn-secondary text-sm px-3 py-2">
          <BookOpen size={16} /> Catálogo
        </button>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">{t('diet:daySummary')}</h2>
          <span className="text-sm text-white/40">{Math.round(todayMacros.calories)} / {TARGET.calories} kcal</span>
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
              {([{key:'protein',val:todayMacros.protein,target:TARGET.protein,color:MACRO_COLORS.protein},{key:'carbs',val:todayMacros.carbs,target:TARGET.carbs,color:MACRO_COLORS.carbs},{key:'fat',val:todayMacros.fat,target:TARGET.fat,color:MACRO_COLORS.fat}] as const).map(({ key, val, target, color }) => (
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
            <p className="text-xs text-white/30 mt-2">{t('diet:glassesRemaining', { n: Math.max(0, 10 - Math.floor(waterMl / 250)) })}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {MEAL_TYPES.map(({ type, icon: MealIcon }) => {
          const mealLabel   = t(`diet:${type}`)
          const mealEntries = entries.filter(e => e.meal_type === type)
          const mealCal     = mealEntries.reduce((sum, e) => sum + (e.food_item.calories / e.food_item.serving_size) * e.quantity, 0)
          return (
            <motion.div key={type} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-surface-100 flex items-center justify-center shrink-0"><MealIcon size={16} className="text-brand-400" /></div>
                  <h3 className="font-semibold text-sm">{mealLabel}</h3>
                </div>
                <div className="flex items-center gap-3">
                  {mealCal > 0 && <span className="flex items-center gap-1 text-sm text-white/50"><Flame size={13} className="text-orange-400" /> {Math.round(mealCal)} kcal</span>}
                  <button onClick={() => setAddModal(type)} className="btn-ghost p-1.5"><Plus size={16} /></button>
                </div>
              </div>
              {mealEntries.length > 0 ? (
                <div className="space-y-2">
                  {mealEntries.map(entry => {
                    const r = entry.quantity / entry.food_item.serving_size
                    return (
                      <div key={entry.id} className="flex items-center justify-between p-2.5 rounded-lg bg-surface-100 hover:bg-surface-200 transition-colors group">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-medium">{entry.food_item.name}</p>
                            {entry.food_item.refCode && (
                              <span className="font-mono text-[10px] text-brand-400/80 bg-brand-500/10 px-1.5 py-0.5 rounded">{entry.food_item.refCode}</span>
                            )}
                          </div>
                          <p className="text-xs text-white/30">{entry.quantity}{entry.food_item.serving_unit} · P:{Math.round(entry.food_item.protein * r)}g C:{Math.round(entry.food_item.carbs * r)}g G:{Math.round(entry.food_item.fat * r)}g</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-white/50">{Math.round(entry.food_item.calories * r)} kcal</span>
                          <button onClick={() => handleDelete(entry.id)} className="opacity-0 group-hover:opacity-100 btn-ghost p-1 text-red-400 hover:text-red-300 transition-all"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <button onClick={() => setAddModal(type)} className="w-full py-4 rounded-xl border border-dashed border-white/10 text-white/30 hover:border-brand-500/30 hover:text-brand-400 transition-all text-sm flex items-center justify-center gap-2">
                  <Plus size={16} /> {t('diet:addFood')}
                </button>
              )}
            </motion.div>
          )
        })}
      </div>

      {catalogModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={() => { setCatalogModal(false); setCatalogAddRef(null) }}>
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
            onClick={e => e.stopPropagation()}
            className="glass border border-white/10 rounded-2xl w-full max-w-4xl max-h-[88vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <BookOpen size={20} className="text-brand-400" />
                <div>
                  <h3 className="font-semibold">Catálogo de productos</h3>
                  <p className="text-xs text-white/40">Busca por nombre, código (#FF001) o categoría</p>
                </div>
              </div>
              <button onClick={() => { setCatalogModal(false); setCatalogAddRef(null) }} className="btn-ghost p-1.5"><X size={16} /></button>
            </div>
            <div className="px-6 py-3 space-y-3 border-b border-white/10 shrink-0">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input autoFocus value={catalogSearch} onChange={e => { setCatalogSearch(e.target.value); setCatalogAddRef(null) }}
                  placeholder="Buscar por nombre o código (#FF001)…" className="input pl-9 text-sm" />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {([{key:'all' as const,label:'Todos'},{key:'healthy' as const,label:'🟢 Saludable'},{key:'moderate' as const,label:'🟡 Moderado'},{key:'unhealthy' as const,label:'🔴 Menos saludable'}]).map(({ key, label }) => (
                  <button key={key} onClick={() => { setCatalogFilter(key); setCatalogAddRef(null) }}
                    className={cn('px-3 py-1 rounded-full text-xs font-medium transition-all',
                      catalogFilter === key ? 'bg-brand-500/30 text-brand-300 border border-brand-500/40' : 'glass border border-white/10 text-white/50 hover:text-white/80')}>
                    {label}
                  </button>
                ))}
                <span className="text-xs text-white/30 ml-auto">{filteredCatalog.length} productos</span>
              </div>
            </div>
            <div className="hidden md:grid grid-cols-[90px_1fr_110px_52px_52px_52px_52px_130px_90px] gap-2 px-6 py-2 text-xs text-white/30 border-b border-white/5 shrink-0">
              <span>Código</span><span>Nombre</span><span>Categoría</span>
              <span className="text-center">Cal</span><span className="text-center text-sky-400/70">Prot</span>
              <span className="text-center text-orange-400/70">HC</span><span className="text-center text-purple-400/70">Gras</span>
              <span>Salud</span><span></span>
            </div>
            <div className="overflow-y-auto flex-1 divide-y divide-white/5">
              {filteredCatalog.map(product => {
                const usage    = getProductUsage(product.refCode)
                const isAdding = catalogAddRef === product.refCode
                const hCfg     = HEALTH_CONFIG[product.health]
                return (
                  <div key={product.refCode} className={cn(isAdding && 'bg-brand-500/5')}>
                    <div className={cn('grid grid-cols-[90px_1fr_auto] md:grid-cols-[90px_1fr_110px_52px_52px_52px_52px_130px_90px] gap-2 px-6 py-3 items-center transition-colors', !isAdding && 'hover:bg-white/[0.03]')}>
                      <span className="font-mono text-xs text-brand-400 font-semibold">{product.refCode}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{product.name}</p>
                        {product.brand && <p className="text-xs text-white/30">{product.brand}</p>}
                        <p className="text-xs text-white/30 md:hidden mt-0.5">{Math.round(product.calories)} kcal · P:{Math.round(product.protein)}g C:{Math.round(product.carbs)}g G:{Math.round(product.fat)}g</p>
                        {usage && <p className="text-xs text-cyan-400 md:hidden mt-0.5">En uso: {usage}</p>}
                      </div>
                      <span className="hidden md:block text-xs text-white/40 truncate">{product.category}</span>
                      <span className="hidden md:block text-xs text-center text-white/70">{Math.round(product.calories)}</span>
                      <span className="hidden md:block text-xs text-center text-sky-400">{Math.round(product.protein)}g</span>
                      <span className="hidden md:block text-xs text-center text-orange-400">{Math.round(product.carbs)}g</span>
                      <span className="hidden md:block text-xs text-center text-purple-400">{Math.round(product.fat)}g</span>
                      <div className="hidden md:flex items-center gap-1.5 flex-wrap">
                        <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-semibold', hCfg.bg, hCfg.color)}>{hCfg.label}</span>
                        {usage && <span className="flex items-center gap-0.5 text-[10px] text-cyan-400" title={`En: ${usage}`}><CheckCircle2 size={10} /> {usage}</span>}
                      </div>
                      <button onClick={() => { if (isAdding) { setCatalogAddRef(null); return } setCatalogAddRef(product.refCode); setCatalogAddMeal('breakfast'); setCatalogAddQty(String(product.serving_size)) }}
                        className={cn('flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all',
                          isAdding ? 'bg-brand-500/30 text-brand-300 border border-brand-500/40' : 'glass border border-white/10 text-white/70 hover:text-white hover:border-brand-500/30')}>
                        {isAdding ? <X size={12} /> : <Plus size={12} />}
                        {isAdding ? 'Cerrar' : 'Añadir'}
                      </button>
                    </div>
                    {isAdding && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="px-6 pb-4 bg-brand-500/5 border-t border-brand-500/20">
                        <div className="flex flex-wrap gap-3 pt-3 items-end">
                          <div>
                            <label className="text-xs text-white/40 mb-1 block">Añadir a comida</label>
                            <select value={catalogAddMeal} onChange={e => setCatalogAddMeal(e.target.value)} className="input text-sm w-36" style={{ colorScheme: 'dark' }}>
                              {MEAL_TYPES.map(m => <option key={m.type} value={m.type}>{t(`diet:${m.type}`)}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="text-xs text-white/40 mb-1 block">Cantidad ({product.serving_unit})</label>
                            <input type="number" min="1" value={catalogAddQty} onChange={e => setCatalogAddQty(e.target.value)} className="input text-sm w-28" />
                          </div>
                          <button onClick={() => handleCatalogAdd(product)} className="btn-primary text-sm"><Plus size={15} /> Añadir a comida</button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )
              })}
              {filteredCatalog.length === 0 && (
                <div className="py-16 text-center text-white/30 text-sm">
                  <Tag size={24} className="mx-auto mb-3 opacity-30" />
                  No se encontraron productos
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {addModal && (
        <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={resetModal}>
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}
            onClick={e => e.stopPropagation()} className="glass border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">{t('diet:addFood')}</h3>
              <button onClick={resetModal} className="btn-ghost p-1.5"><X size={16} /></button>
            </div>
            {selectedFood ? (
              <form onSubmit={handleSubmitSelected} className="space-y-4">
                <div className="p-3 rounded-xl bg-surface-100 border border-brand-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium">{selectedFood.name}</p>
                    <span className="font-mono text-[10px] text-brand-400 bg-brand-500/10 px-1.5 py-0.5 rounded">{selectedFood.refCode}</span>
                  </div>
                  {selectedFood.brand && <p className="text-xs text-white/40">{selectedFood.brand}</p>}
                  <p className="text-xs text-white/30 mt-1">{Math.round(selectedFood.calories)} kcal · P:{Math.round(selectedFood.protein)}g C:{Math.round(selectedFood.carbs)}g G:{Math.round(selectedFood.fat)}g por {selectedFood.serving_size}{selectedFood.serving_unit}</p>
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1 block">{t('diet:quantity', { unit: selectedFood.serving_unit })}</label>
                  <input required type="number" min="1" value={quantity} onChange={e => setQuantity(e.target.value)} className="input text-sm" />
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
                  <input autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={t('diet:searchFood')} className="input pl-9" />
                </div>
                {searchResults.length > 0 && (
                  <div className="mb-3 max-h-48 overflow-y-auto rounded-xl border border-white/10 divide-y divide-white/5">
                    {searchResults.map(food => (
                      <button key={food.refCode} type="button" onClick={() => handleSelectFood(food)}
                        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-surface-100 transition-colors text-left">
                        <div className="min-w-0 flex items-center gap-2">
                          <span className="font-mono text-[10px] text-brand-400 shrink-0">{food.refCode}</span>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{food.name}</p>
                            {food.brand && <p className="text-xs text-white/30">{food.brand}</p>}
                          </div>
                        </div>
                        <span className="text-xs text-white/40 shrink-0 ml-2">{Math.round(food.calories)} kcal</span>
                      </button>
                    ))}
                  </div>
                )}
                {searchQuery && searchResults.length === 0 && <p className="text-xs text-white/30 mb-3 text-center">{t('diet:noResults')}</p>}
                <div className="relative flex items-center gap-2 mb-4">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-xs text-white/30 shrink-0">{t('diet:orEnterManually')}</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>
                <form onSubmit={handleSubmitManual} className="space-y-3">
                  <div>
                    <label className="text-xs text-white/40 mb-1 block">{t('diet:foodName')}</label>
                    <input required value={foodName} onChange={e => setFoodName(e.target.value)} placeholder="Ej. Pechuga de pollo" className="input text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-xs text-white/40 mb-1 block">{t('diet:caloriesPer100g')}</label><input required type="number" min="0" value={foodCals} onChange={e => setFoodCals(e.target.value)} placeholder="0" className="input text-sm" /></div>
                    <div><label className="text-xs text-white/40 mb-1 block">{t('diet:proteinPer100g')}</label><input type="number" min="0" value={foodProt} onChange={e => setFoodProt(e.target.value)} placeholder="0" className="input text-sm" /></div>
                    <div><label className="text-xs text-white/40 mb-1 block">{t('diet:carbsPer100g')}</label><input type="number" min="0" value={foodCarbs} onChange={e => setFoodCarbs(e.target.value)} placeholder="0" className="input text-sm" /></div>
                    <div><label className="text-xs text-white/40 mb-1 block">{t('diet:fatPer100g')}</label><input type="number" min="0" value={foodFat} onChange={e => setFoodFat(e.target.value)} placeholder="0" className="input text-sm" /></div>
                  </div>
                  <div><label className="text-xs text-white/40 mb-1 block">{t('diet:quantityG')}</label><input type="number" min="1" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="100" className="input text-sm" /></div>
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
