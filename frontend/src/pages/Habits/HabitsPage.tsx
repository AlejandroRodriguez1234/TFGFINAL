import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  Plus, Check, Flame, Target, X, Trash2,
  Dumbbell, Droplets, Brain, BookOpen, Apple, Moon,
  Footprints, Music, Leaf, Sun, Heart, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { cn } from '@utils/cn'
import { useHabitsStore, type HabitIconName, type Habit } from '@store/habitsStore'
import type { LucideProps } from 'lucide-react'
import type { FC } from 'react'

const iconMap: Record<HabitIconName, FC<LucideProps>> = {
  Dumbbell, Droplets, Brain, BookOpen, Apple, Moon,
  Footprints, Target, Music, Leaf, Sun, Heart,
}

const iconNames: HabitIconName[] = [
  'Dumbbell', 'Droplets', 'Brain', 'BookOpen', 'Apple', 'Moon',
  'Footprints', 'Target', 'Music', 'Leaf', 'Sun', 'Heart',
]

const WEEKDAYS_SHORT = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const MONTHS_EN = ['January','February','March','April','May','June','July','August','September','October','November','December']

function HabitIcon({ name, size = 18, className }: { name: HabitIconName; size?: number; className?: string }) {
  const Icon = iconMap[name]
  return <Icon size={size} className={className} />
}

function MonthCalendar({ habit }: { habit: Habit }) {
  const [offset, setOffset] = useState(0)
  const { i18n } = useTranslation()
  const lang = i18n.language
  const months = lang === 'en' ? MONTHS_EN : MONTHS_ES

  const ref = new Date()
  ref.setMonth(ref.getMonth() - offset)
  const year = ref.getFullYear()
  const month = ref.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay  = new Date(year, month + 1, 0)

  // Monday-based: 0=Mon..6=Sun
  const startDow = (firstDay.getDay() + 6) % 7
  const cells: Array<number | null> = Array(startDow).fill(null)
  for (let d = 1; d <= lastDay.getDate(); d++) cells.push(d)

  const completedSet = new Set(habit.completedDates)

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-2">
        <button onClick={() => setOffset(o => o + 1)} className="btn-ghost p-1"><ChevronLeft size={14} /></button>
        <span className="text-xs font-medium text-white/60">{months[month]} {year}</span>
        <button onClick={() => setOffset(o => Math.max(0, o - 1))} disabled={offset === 0} className="btn-ghost p-1 disabled:opacity-30">
          <ChevronRight size={14} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {WEEKDAYS_SHORT.map(d => (
          <div key={d} className="text-center text-[9px] text-white/20 pb-1">{d}</div>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} />
          const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const done = completedSet.has(iso)
          const isToday = iso === new Date().toISOString().split('T')[0]
          return (
            <div
              key={iso}
              className={cn(
                'aspect-square rounded-sm flex items-center justify-center text-[9px]',
                done
                  ? `bg-gradient-to-br ${habit.color} text-white font-bold`
                  : isToday
                  ? 'border border-white/20 text-white/60'
                  : 'text-white/20',
              )}
            >
              {day}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function HabitCard({ habit, onToggle, onDelete }: { habit: Habit; onToggle: (id: string) => void; onDelete: (id: string) => void }) {
  const { t } = useTranslation()
  const [showCalendar, setShowCalendar] = useState(false)
  const completionRate = habit.completedDates.length > 0
    ? Math.min(100, Math.round((habit.completedDates.length / 30) * 100))
    : 0

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn('card transition-all duration-300', habit.completedToday && 'border border-success/20 bg-success/5')}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => setShowCalendar(v => !v)}>
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${habit.color} flex items-center justify-center shrink-0`}>
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
        <div className="flex items-center gap-1">
          <button
            onClick={() => onDelete(habit.id)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white/20 hover:text-danger hover:bg-danger/10 transition-all"
          >
            <Trash2 size={12} />
          </button>
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
      </div>

      {/* Weekly mini-grid (last 7 days) */}
      <div className="flex gap-1 mb-3">
        {Array.from({ length: 7 }, (_, i) => {
          const d = new Date()
          d.setDate(d.getDate() - (6 - i))
          const iso = d.toISOString().split('T')[0]
          const done = habit.completedDates.includes(iso)
          const isToday = i === 6
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className={cn(
                'w-full aspect-square rounded-md',
                done ? `bg-gradient-to-br ${habit.color}` : isToday ? 'border border-dashed border-white/20' : 'bg-surface-200',
              )} />
              <span className="text-[10px] text-white/30">{WEEKDAYS_SHORT[i]}</span>
            </div>
          )
        })}
      </div>

      <div>
        <div className="flex justify-between text-xs text-white/40 mb-1">
          <span>{t('habits:completionRate')}</span>
          <span>{completionRate}%</span>
        </div>
        <div className="h-1 bg-surface-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${habit.color} transition-all duration-500`}
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>

      <AnimatePresence>
        {showCalendar && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <MonthCalendar habit={habit} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function HabitsPage() {
  const { t } = useTranslation()
  const { habits, toggleHabit, addHabit, deleteHabit, resetIfNewDay } = useHabitsStore()
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newIcon, setNewIcon] = useState<HabitIconName>('Dumbbell')

  useEffect(() => { resetIfNewDay() }, [resetIfNewDay])

  const completed = habits.filter((h) => h.completedToday).length
  const total     = habits.length
  const bestStreak = habits.length > 0 ? Math.max(...habits.map((h) => h.streak)) : 0
  const avgRate    = habits.length > 0
    ? Math.round(habits.reduce((a, h) => a + Math.min(100, Math.round((h.completedDates.length / 30) * 100)), 0) / habits.length)
    : 0

  const handleAdd = () => {
    if (!newName.trim()) return
    addHabit(newName.trim(), newIcon)
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
          <div className="text-3xl font-bold text-gradient">{bestStreak}</div>
          <p className="text-xs text-white/40 mt-1">{t('habits:bestStreak')}</p>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-gradient">{avgRate}%</div>
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
            {total > 0 ? Math.round((completed / total) * 100) : 0}%
          </span>
        </div>
        <div className="h-3 bg-surface-200 rounded-full overflow-hidden">
          <motion.div
            animate={{ width: total > 0 ? `${(completed / total) * 100}%` : '0%' }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-brand-500 to-cyan-400 rounded-full"
          />
        </div>
        <p className="text-xs text-white/30 mt-2">{t('habits:pendingHabits', { n: total - completed })}</p>
      </div>

      {/* Habits grid */}
      {habits.length === 0 ? (
        <div className="card text-center py-12">
          <Target size={32} className="text-white/20 mx-auto mb-3" />
          <p className="text-white/40 text-sm">{t('habits:noHabits', 'No tienes hábitos aún. Añade el primero.')}</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {habits.map((habit) => (
            <HabitCard key={habit.id} habit={habit} onToggle={toggleHabit} onDelete={deleteHabit} />
          ))}
        </div>
      )}

      {/* Tip */}
      <p className="text-xs text-white/20 text-center">
        {t('habits:calendarTip', 'Pulsa sobre un hábito para ver el calendario mensual')}
      </p>

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
                <button onClick={() => setShowAdd(false)} className="btn-ghost p-1"><X size={16} /></button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-white/60 mb-1 block">{t('habits:habitName')}</label>
                  <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
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
                  <div className="mt-3 flex items-center gap-2 p-2 rounded-lg bg-surface-100">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-cyan-400 flex items-center justify-center">
                      <HabitIcon name={newIcon} size={16} className="text-white" />
                    </div>
                    <span className="text-sm text-white/60">
                      {t('habits:habitPreview')}: <span className="text-white">{newName || t('habits:myHabit')}</span>
                    </span>
                  </div>
                </div>

                <button onClick={handleAdd} disabled={!newName.trim()} className="btn-primary w-full disabled:opacity-40">
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
