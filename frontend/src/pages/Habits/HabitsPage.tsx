import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  Plus, Check, Flame, Target, X,
  Dumbbell, Droplets, Brain, BookOpen, Apple, Moon,
  Footprints, Music, Leaf, Sun, Heart,
} from 'lucide-react'
import { cn } from '@utils/cn'
import type { LucideProps } from 'lucide-react'
import type { FC } from 'react'

type IconName =
  | 'Dumbbell' | 'Droplets' | 'Brain' | 'BookOpen' | 'Apple' | 'Moon'
  | 'Footprints' | 'Target' | 'Music' | 'Leaf' | 'Sun' | 'Heart'

const iconMap: Record<IconName, FC<LucideProps>> = {
  Dumbbell,
  Droplets,
  Brain,
  BookOpen,
  Apple,
  Moon,
  Footprints,
  Target,
  Music,
  Leaf,
  Sun,
  Heart,
}

const iconNames: IconName[] = [
  'Dumbbell', 'Droplets', 'Brain', 'BookOpen', 'Apple', 'Moon',
  'Footprints', 'Target', 'Music', 'Leaf', 'Sun', 'Heart',
]

interface Habit {
  id: string
  name: string
  iconName: IconName
  color: string
  streak: number
  completedToday: boolean
  completionRate: number
  description?: string
}

const initialHabits: Habit[] = [
  { id: '1', name: 'Entrenar',        iconName: 'Dumbbell',  color: 'from-brand-500 to-cyan-400',    streak: 7,  completedToday: true,  completionRate: 85 },
  { id: '2', name: 'Beber agua',      iconName: 'Droplets',  color: 'from-cyan-500 to-blue-400',     streak: 14, completedToday: true,  completionRate: 92 },
  { id: '3', name: 'Meditar',         iconName: 'Brain',     color: 'from-purple-500 to-pink-400',   streak: 3,  completedToday: false, completionRate: 60 },
  { id: '4', name: 'Leer 30 min',     iconName: 'BookOpen',  color: 'from-yellow-500 to-orange-400', streak: 5,  completedToday: false, completionRate: 70 },
  { id: '5', name: 'Registro comida', iconName: 'Apple',     color: 'from-green-500 to-emerald-400', streak: 10, completedToday: true,  completionRate: 78 },
  { id: '6', name: 'Dormir 8h',       iconName: 'Moon',      color: 'from-indigo-500 to-violet-400', streak: 2,  completedToday: false, completionRate: 55 },
]

const weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

function HabitIcon({ name, size = 18, className }: { name: IconName; size?: number; className?: string }) {
  const Icon = iconMap[name]
  return <Icon size={size} className={className} />
}

function HabitCard({ habit, onToggle }: { habit: Habit; onToggle: (id: string) => void }) {
  const { t } = useTranslation()
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn('card transition-all duration-300 group', habit.completedToday ? 'border border-success/20 bg-success/5' : '')}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${habit.color} flex items-center justify-center`}>
            <HabitIcon name={habit.iconName} size={18} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">{habit.name}</h3>
            <div className="flex items-center gap-1 mt-0.5">
              <Flame size={11} className="text-orange-400" />
              <span className="text-xs text-white/40">{t('habits:streakDays', { n: habit.streak })}</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => onToggle(habit.id)}
          className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center transition-all',
            habit.completedToday
              ? 'bg-success text-white shadow-md shadow-success/20'
              : 'bg-surface-200 text-white/30 hover:bg-brand-500/20 hover:text-brand-400',
          )}
        >
          <Check size={15} />
        </button>
      </div>

      {/* Weekly view */}
      <div className="flex gap-1 mb-3">
        {weekDays.map((day, i) => {
          const done = i < 4 || (i === 5 && habit.streak > 5) || (i === 6 && habit.completedToday)
          return (
            <div key={day} className="flex-1 flex flex-col items-center gap-1">
              <div
                className={cn(
                  'w-full aspect-square rounded-md',
                  done ? `bg-gradient-to-br ${habit.color}` : 'bg-surface-200',
                )}
              />
              <span className="text-[10px] text-white/30">{day}</span>
            </div>
          )
        })}
      </div>

      <div>
        <div className="flex justify-between text-xs text-white/40 mb-1">
          <span>{t('habits:completionRate')}</span>
          <span>{habit.completionRate}%</span>
        </div>
        <div className="h-1 bg-surface-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${habit.color}`}
            style={{ width: `${habit.completionRate}%` }}
          />
        </div>
      </div>
    </motion.div>
  )
}

export default function HabitsPage() {
  const { t } = useTranslation()
  const [habits, setHabits]   = useState<Habit[]>(initialHabits)
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newIcon, setNewIcon] = useState<IconName>('Dumbbell')

  const completed = habits.filter((h) => h.completedToday).length
  const total     = habits.length

  const toggleHabit = (id: string) => {
    setHabits((prev) =>
      prev.map((h) =>
        h.id === id
          ? {
              ...h,
              completedToday: !h.completedToday,
              streak: h.completedToday ? Math.max(0, h.streak - 1) : h.streak + 1,
            }
          : h,
      ),
    )
  }

  const addHabit = () => {
    if (!newName.trim()) return
    setHabits((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: newName,
        iconName: newIcon,
        color: 'from-brand-500 to-cyan-400',
        streak: 0,
        completedToday: false,
        completionRate: 0,
      },
    ])
    setNewName('')
    setNewIcon('Dumbbell')
    setShowAdd(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">{t('habits:title')}</h1>
          <p className="text-white/40 text-sm mt-1">{t('habits:subtitle')}</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary text-sm px-4 py-2.5">
          <Plus size={16} /> {t('habits:addHabit')}
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center">
          <div className="text-3xl font-bold text-gradient">{completed}/{total}</div>
          <p className="text-xs text-white/40 mt-1">{t('habits:completedToday')}</p>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-gradient">
            {Math.max(...habits.map((h) => h.streak))}
          </div>
          <p className="text-xs text-white/40 mt-1">{t('habits:bestStreak')}</p>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-gradient">
            {Math.round(habits.reduce((a, h) => a + h.completionRate, 0) / habits.length)}%
          </div>
          <p className="text-xs text-white/40 mt-1">{t('habits:weeklyAvg')}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target size={16} className="text-brand-400" />
            <span className="font-medium text-sm">{t('habits:todayProgress')}</span>
          </div>
          <span className="text-sm text-brand-400 font-semibold">
            {Math.round((completed / total) * 100)}%
          </span>
        </div>
        <div className="h-3 bg-surface-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(completed / total) * 100}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-brand-500 to-cyan-400 rounded-full"
          />
        </div>
        <p className="text-xs text-white/30 mt-2">{t('habits:pendingHabits', { n: total - completed })}</p>
      </div>

      {/* Habits grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {habits.map((habit) => (
          <HabitCard key={habit.id} habit={habit} onToggle={toggleHabit} />
        ))}
      </div>

      {/* Add habit modal */}
      <AnimatePresence>
        {showAdd && (
          <div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
            onClick={() => setShowAdd(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="glass border border-white/10 rounded-2xl p-6 w-full max-w-sm"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold">{t('habits:addHabit')}</h3>
                <button onClick={() => setShowAdd(false)} className="btn-ghost p-1">
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-white/60 mb-1 block">{t('habits:habitName')}</label>
                  <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="ej: Meditar 10 min"
                    className="input"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="text-sm text-white/60 mb-2 block">{t('habits:habitIcon')}</label>
                  <div className="flex flex-wrap gap-2">
                    {iconNames.map((name) => {
                      const Icon = iconMap[name]
                      return (
                        <button
                          key={name}
                          onClick={() => setNewIcon(name)}
                          title={name}
                          className={cn(
                            'w-10 h-10 rounded-lg flex items-center justify-center transition-all',
                            newIcon === name
                              ? 'bg-brand-500/30 border border-brand-500 text-brand-400'
                              : 'bg-surface-100 hover:bg-surface-200 text-white/50 hover:text-white',
                          )}
                        >
                          <Icon size={18} />
                        </button>
                      )
                    })}
                  </div>

                  {/* Preview */}
                  <div className="mt-3 flex items-center gap-2 p-2 rounded-lg bg-surface-100">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-cyan-400 flex items-center justify-center">
                      <HabitIcon name={newIcon} size={16} className="text-white" />
                    </div>
                    <span className="text-sm text-white/60">
                      {t('habits:habitPreview')}: <span className="text-white">{newName || t('habits:myHabit')}</span>
                    </span>
                  </div>
                </div>

                <button onClick={addHabit} className="btn-primary w-full">
                  {t('habits:addHabitBtn')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
