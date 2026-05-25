import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  Search, Play, Plus, Clock, Flame, ChevronRight,
  Dumbbell, BarChart2, Heart, RotateCcw, ArrowUp, Circle, Footprints, X, Check, Youtube,
} from 'lucide-react'
import { cn } from '@utils/cn'
import type { FC } from 'react'
import type { LucideProps } from 'lucide-react'

type Difficulty  = 'beginner' | 'intermediate' | 'advanced'
type MuscleGroup = 'all' | 'chest' | 'back' | 'shoulders' | 'arms' | 'core' | 'legs'
type WorkableMuscle = Exclude<MuscleGroup, 'all'>

interface Workout {
  id: string
  name: string
  difficulty: Difficulty
  duration: number
  calories: number
  muscles: WorkableMuscle[]
  exercises: number
  isTemplate: boolean
}

const muscleIconMap: Record<MuscleGroup, FC<LucideProps>> = {
  all:       Dumbbell,
  chest:     Heart,
  back:      RotateCcw,
  shoulders: ArrowUp,
  arms:      Dumbbell,
  core:      Circle,
  legs:      Footprints,
}

const INITIAL_WORKOUTS: Workout[] = [
  { id: '1', name: 'Push Day A', difficulty: 'intermediate', duration: 60, calories: 380, muscles: ['chest', 'shoulders', 'arms'], exercises: 6, isTemplate: true },
  { id: '2', name: 'Pull Day A', difficulty: 'intermediate', duration: 65, calories: 400, muscles: ['back', 'arms'],               exercises: 7, isTemplate: true },
  { id: '3', name: 'Leg Day',    difficulty: 'advanced',     duration: 75, calories: 520, muscles: ['legs', 'core'],               exercises: 8, isTemplate: true },
  { id: '4', name: 'Full Body',  difficulty: 'beginner',     duration: 45, calories: 280, muscles: ['chest', 'back', 'legs'],      exercises: 5, isTemplate: true },
  { id: '5', name: 'Core Blast', difficulty: 'intermediate', duration: 30, calories: 220, muscles: ['core'],                       exercises: 6, isTemplate: true },
  { id: '6', name: 'Upper Body', difficulty: 'beginner',     duration: 50, calories: 310, muscles: ['chest', 'back', 'shoulders'], exercises: 6, isTemplate: true },
]

const EXERCISE_CATALOG = [
  { id: 'e1',  name: 'Press de banca',       muscle: 'chest'     as WorkableMuscle, difficulty: 'intermediate' as Difficulty, equipment: 'Barra',          youtubeId: 'gRVjAtPip0Y' },
  { id: 'e2',  name: 'Dominadas',            muscle: 'back'      as WorkableMuscle, difficulty: 'intermediate' as Difficulty, equipment: 'Barra',          youtubeId: 'eGo4IYlbE5g' },
  { id: 'e3',  name: 'Sentadilla',           muscle: 'legs'      as WorkableMuscle, difficulty: 'beginner'     as Difficulty, equipment: 'Barra',          youtubeId: 'ultWZbUMPL8' },
  { id: 'e4',  name: 'Press militar',        muscle: 'shoulders' as WorkableMuscle, difficulty: 'intermediate' as Difficulty, equipment: 'Barra',          youtubeId: '2yjwXTZQDDI' },
  { id: 'e5',  name: 'Peso muerto',          muscle: 'back'      as WorkableMuscle, difficulty: 'advanced'     as Difficulty, equipment: 'Barra',          youtubeId: 'op9kVnSso6Q' },
  { id: 'e6',  name: 'Curl de bíceps',       muscle: 'arms'      as WorkableMuscle, difficulty: 'beginner'     as Difficulty, equipment: 'Mancuernas',    youtubeId: 'ykJmrZ5v0Oo' },
  { id: 'e7',  name: 'Extensión tríceps',    muscle: 'arms'      as WorkableMuscle, difficulty: 'beginner'     as Difficulty, equipment: 'Polea',          youtubeId: 'YbX7Wd8jQ-Q' },
  { id: 'e8',  name: 'Plancha',              muscle: 'core'      as WorkableMuscle, difficulty: 'beginner'     as Difficulty, equipment: 'Peso corporal',  youtubeId: 'pSHjTRCQxIw' },
  { id: 'e9',  name: 'Remo con barra',       muscle: 'back'      as WorkableMuscle, difficulty: 'intermediate' as Difficulty, equipment: 'Barra',          youtubeId: 'FWJR5Ve8bnQ' },
  { id: 'e10', name: 'Fondos en paralelas',  muscle: 'chest'     as WorkableMuscle, difficulty: 'intermediate' as Difficulty, equipment: 'Paralelas',      youtubeId: 'wjUmnZH528Y' },
  { id: 'e11', name: 'Elevaciones laterales',muscle: 'shoulders' as WorkableMuscle, difficulty: 'beginner'     as Difficulty, equipment: 'Mancuernas',    youtubeId: '3VcKaXpzqRo' },
  { id: 'e12', name: 'Zancadas',             muscle: 'legs'      as WorkableMuscle, difficulty: 'beginner'     as Difficulty, equipment: 'Mancuernas',    youtubeId: 'D7KaRcUTQeE' },
]

const muscleBadgeColors: Record<MuscleGroup, string> = {
  all:       'bg-white/10 text-white/60',
  chest:     'bg-rose-500/20 text-rose-300',
  back:      'bg-blue-500/20 text-blue-300',
  shoulders: 'bg-purple-500/20 text-purple-300',
  arms:      'bg-orange-500/20 text-orange-300',
  core:      'bg-yellow-500/20 text-yellow-300',
  legs:      'bg-green-500/20 text-green-300',
}

const diffColors: Record<Difficulty, string> = {
  beginner:     'badge-success',
  intermediate: 'badge-warning',
  advanced:     'badge-danger',
}

const WORKABLE_MUSCLES: WorkableMuscle[] = ['chest', 'back', 'shoulders', 'arms', 'core', 'legs']

const EMPTY_FORM = {
  name:        '',
  difficulty:  'beginner' as Difficulty,
  muscles:     [] as WorkableMuscle[],
  duration:    '',
  exerciseIds: [] as string[],
}

export default function GymPage() {
  const { t } = useTranslation()
  const [tab, setTab]         = useState<'workouts' | 'exercises'>('workouts')
  const [muscle, setMuscle]   = useState<MuscleGroup>('all')
  const [search, setSearch]   = useState('')
  const [workouts, setWorkouts] = useState<Workout[]>(INITIAL_WORKOUTS)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm]       = useState(EMPTY_FORM)
  const [videoEx, setVideoEx] = useState<typeof EXERCISE_CATALOG[number] | null>(null)

  const muscleKeys: MuscleGroup[] = ['all', 'chest', 'back', 'shoulders', 'arms', 'core', 'legs']
  const muscleLabels: Record<MuscleGroup, string> = {
    all:       t('gym:muscleAll'),
    chest:     t('gym:muscleChest'),
    back:      t('gym:muscleBack'),
    shoulders: t('gym:muscleShoulders'),
    arms:      t('gym:muscleArms'),
    core:      t('gym:muscleCore'),
    legs:      t('gym:muscleLegs'),
  }
  const diffLabels: Record<Difficulty, string> = {
    beginner:     t('gym:beginner'),
    intermediate: t('gym:intermediate'),
    advanced:     t('gym:advanced'),
  }

  const filteredWorkouts = workouts.filter(
    (w) => muscle === 'all' || w.muscles.includes(muscle as WorkableMuscle),
  )

  const filteredExercises = EXERCISE_CATALOG.filter(
    (e) => (muscle === 'all' || e.muscle === muscle) && e.name.toLowerCase().includes(search.toLowerCase()),
  )

  const openModal = () => { setForm(EMPTY_FORM); setModalOpen(true) }
  const closeModal = () => setModalOpen(false)

  const toggleMuscle = (m: WorkableMuscle) =>
    setForm((f) => ({
      ...f,
      muscles: f.muscles.includes(m) ? f.muscles.filter((x) => x !== m) : [...f.muscles, m],
    }))

  const toggleExercise = (id: string) =>
    setForm((f) => ({
      ...f,
      exerciseIds: f.exerciseIds.includes(id)
        ? f.exerciseIds.filter((x) => x !== id)
        : [...f.exerciseIds, id],
    }))

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    const dur = parseInt(form.duration) || 0
    const newWorkout: Workout = {
      id:         String(Date.now()),
      name:       form.name.trim(),
      difficulty: form.difficulty,
      duration:   dur,
      calories:   Math.round(dur * 5.5),
      muscles:    form.muscles.length > 0 ? form.muscles : ['core'],
      exercises:  form.exerciseIds.length,
      isTemplate: false,
    }
    setWorkouts((prev) => [newWorkout, ...prev])
    closeModal()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">{t('gym:title')}</h1>
          <p className="text-white/40 text-sm mt-1">{t('gym:subtitle')}</p>
        </div>
        <Link to="/gym/workout/new" className="btn-primary text-sm px-4 py-2.5">
          <Plus size={16} /> {t('gym:newWorkout')}
        </Link>
      </div>

      {/* Quick action cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Play,      label: t('gym:start'),    sub: t('gym:quickWorkout'),           color: 'from-brand-500 to-cyan-400',    to: '/gym/workout/quick' },
          { icon: Dumbbell,  label: t('gym:routines'), sub: `${workouts.length} templates`,  color: 'from-purple-500 to-pink-500',   to: '/gym#routines'      },
          { icon: BarChart2, label: t('gym:history'),  sub: t('gym:viewProgress'),           color: 'from-orange-500 to-yellow-400', to: '/progress'          },
        ].map(({ icon: Icon, label, sub, color, to }) => (
          <Link key={label} to={to} className="card-hover text-center">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mx-auto mb-2`}>
              <Icon size={18} className="text-white" />
            </div>
            <p className="font-semibold text-sm">{label}</p>
            <p className="text-xs text-white/40 mt-0.5">{sub}</p>
          </Link>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-surface-100 w-fit">
        {(['workouts', 'exercises'] as const).map((tabKey) => (
          <button
            key={tabKey}
            onClick={() => setTab(tabKey)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all',
              tab === tabKey ? 'bg-brand-500 text-white' : 'text-white/50 hover:text-white',
            )}
          >
            {tabKey === 'workouts' ? t('gym:tabRoutines') : t('gym:tabExercises')}
          </button>
        ))}
      </div>

      {/* Muscle group filter */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {muscleKeys.map((key) => {
          const Icon = muscleIconMap[key]
          return (
            <button
              key={key}
              onClick={() => setMuscle(key)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-all border',
                muscle === key
                  ? 'bg-brand-500 border-brand-500 text-white'
                  : 'glass border-white/10 text-white/60 hover:text-white hover:border-white/30',
              )}
            >
              <Icon size={13} />
              {muscleLabels[key]}
            </button>
          )
        })}
      </div>

      {tab === 'workouts' ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWorkouts.map((w, i) => (
            <motion.div
              key={w.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link to={`/gym/workout/${w.id}`} className="card-hover block">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-500/20 flex items-center justify-center">
                    <Dumbbell size={18} className="text-brand-400" />
                  </div>
                  <span className={cn('badge', diffColors[w.difficulty])}>{diffLabels[w.difficulty]}</span>
                </div>
                <h3 className="font-semibold mb-1">{w.name}</h3>
                <p className="text-xs text-white/40 mb-3">
                  {w.exercises} {t('gym:exercises').toLowerCase()} · {w.muscles.slice(0, 2).map(m => muscleLabels[m]).join(', ')}
                </p>
                <div className="flex items-center gap-4 text-xs text-white/50">
                  <span className="flex items-center gap-1"><Clock size={12} /> {w.duration} min</span>
                  <span className="flex items-center gap-1"><Flame size={12} /> ~{w.calories} kcal</span>
                </div>
              </Link>
            </motion.div>
          ))}

          {filteredWorkouts.length === 0 && (
            <div className="col-span-3 text-center py-12 text-white/30 text-sm">
              {t('gym:noRoutinesForMuscle', 'No hay rutinas para este grupo muscular')}
            </div>
          )}

          <button
            onClick={openModal}
            className="card border-dashed border-white/20 hover:border-brand-500/50 flex flex-col items-center justify-center gap-2 text-white/40 hover:text-brand-400 transition-colors min-h-[160px]"
          >
            <Plus size={24} />
            <span className="text-sm">{t('gym:createRoutine')}</span>
          </button>
        </div>
      ) : (
        <>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('gym:searchExercise')}
              className="input pl-9"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            {filteredExercises.map((e, i) => {
              const MuscleIcon = muscleIconMap[e.muscle]
              return (
                <motion.div
                  key={e.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="card-hover flex items-center gap-4"
                >
                  <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center shrink-0', muscleBadgeColors[e.muscle])}>
                    <MuscleIcon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{e.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={cn('text-xs px-1.5 py-0.5 rounded-full font-medium', muscleBadgeColors[e.muscle])}>
                        {muscleLabels[e.muscle]}
                      </span>
                      <span className="text-xs text-white/40">{e.equipment}</span>
                    </div>
                  </div>
                  <span className={cn('badge shrink-0', diffColors[e.difficulty])}>
                    {diffLabels[e.difficulty]}
                  </span>
                  <button
                    onClick={() => setVideoEx(e)}
                    className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                    title="Ver vídeo"
                  >
                    <Youtube size={16} />
                  </button>
                </motion.div>
              )
            })}
          </div>
        </>
      )}

      {/* YouTube video modal */}
      {videoEx && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={() => setVideoEx(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="glass border border-white/10 rounded-2xl overflow-hidden w-full max-w-2xl"
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Youtube size={16} className="text-red-400" />
                <span className="font-semibold text-sm">{videoEx.name}</span>
              </div>
              <button onClick={() => setVideoEx(null)} className="btn-ghost p-1.5"><X size={16} /></button>
            </div>
            <div className="aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${videoEx.youtubeId}?autoplay=1&rel=0`}
                title={videoEx.name}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </motion.div>
        </div>
      )}

      {/* Create routine modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
          onClick={closeModal}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="glass border border-white/10 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-lg">{t('gym:createRoutine')}</h3>
              <button onClick={closeModal} className="btn-ghost p-1.5"><X size={16} /></button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="text-xs text-white/40 mb-1 block">{t('gym:routineName', 'Nombre de la rutina')}</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Ej. Push Day B"
                  className="input text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/40 mb-1 block">{t('gym:difficulty', 'Dificultad')}</label>
                  <select
                    value={form.difficulty}
                    onChange={(e) => setForm((f) => ({ ...f, difficulty: e.target.value as Difficulty }))}
                    className="input text-sm"
                  >
                    {(['beginner', 'intermediate', 'advanced'] as Difficulty[]).map((d) => (
                      <option key={d} value={d}>{diffLabels[d]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1 block">{t('gym:estimatedDuration', 'Duración estimada (min)')}</label>
                  <input
                    required
                    type="number"
                    min="5"
                    max="240"
                    value={form.duration}
                    onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                    placeholder="60"
                    className="input text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-white/40 mb-2 block">{t('gym:musclesWorked', 'Músculos trabajados')}</label>
                <div className="flex flex-wrap gap-2">
                  {WORKABLE_MUSCLES.map((m) => {
                    const Icon = muscleIconMap[m]
                    const selected = form.muscles.includes(m)
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => toggleMuscle(m)}
                        className={cn(
                          'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border transition-all',
                          selected
                            ? 'bg-brand-500 border-brand-500 text-white'
                            : 'glass border-white/10 text-white/60 hover:text-white hover:border-white/30',
                        )}
                      >
                        <Icon size={12} />
                        {muscleLabels[m]}
                        {selected && <Check size={11} />}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs text-white/40 mb-2 block">
                  {t('gym:exercises')}
                  {form.exerciseIds.length > 0 && (
                    <span className="ml-1 text-brand-400">({form.exerciseIds.length} {t('gym:selected', 'seleccionados')})</span>
                  )}
                </label>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {EXERCISE_CATALOG.map((ex) => {
                    const Icon = muscleIconMap[ex.muscle]
                    const selected = form.exerciseIds.includes(ex.id)
                    return (
                      <button
                        key={ex.id}
                        type="button"
                        onClick={() => toggleExercise(ex.id)}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all border',
                          selected
                            ? 'bg-brand-500/10 border-brand-500/40 text-white'
                            : 'bg-surface-100 border-transparent text-white/70 hover:border-white/20',
                        )}
                      >
                        <div className={cn('w-7 h-7 rounded-md flex items-center justify-center shrink-0', muscleBadgeColors[ex.muscle])}>
                          <Icon size={13} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{ex.name}</p>
                          <p className="text-xs text-white/40">{ex.equipment} · {muscleLabels[ex.muscle]}</p>
                        </div>
                        <div className={cn(
                          'w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all',
                          selected ? 'bg-brand-500 border-brand-500' : 'border-white/20',
                        )}>
                          {selected && <Check size={11} className="text-white" />}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button type="button" onClick={closeModal} className="btn-secondary flex-1 text-sm">
                  {t('common:cancel')}
                </button>
                <button type="submit" className="btn-primary flex-1 text-sm">
                  <Plus size={15} /> {t('common:save')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}