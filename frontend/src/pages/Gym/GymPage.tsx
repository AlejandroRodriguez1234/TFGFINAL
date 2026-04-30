import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Search, Play, Plus, Clock, Flame, ChevronRight,
  Dumbbell, BarChart2, Heart, RotateCcw, ArrowUp, Circle, Footprints,
} from 'lucide-react'
import { cn } from '@utils/cn'
import type { FC } from 'react'
import type { LucideProps } from 'lucide-react'

type Difficulty  = 'all' | 'beginner' | 'intermediate' | 'advanced'
type MuscleGroup = 'all' | 'chest' | 'back' | 'shoulders' | 'arms' | 'core' | 'legs'

const muscleIconMap: Record<MuscleGroup, FC<LucideProps>> = {
  all:       Dumbbell,
  chest:     Heart,
  back:      RotateCcw,
  shoulders: ArrowUp,
  arms:      Dumbbell,
  core:      Circle,
  legs:      Footprints,
}

const muscles: { key: MuscleGroup; label: string }[] = [
  { key: 'all',       label: 'Todos'   },
  { key: 'chest',     label: 'Pecho'   },
  { key: 'back',      label: 'Espalda' },
  { key: 'shoulders', label: 'Hombros' },
  { key: 'arms',      label: 'Brazos'  },
  { key: 'core',      label: 'Core'    },
  { key: 'legs',      label: 'Piernas' },
]

const workouts = [
  { id: '1', name: 'Push Day A', difficulty: 'intermediate', duration: 60, calories: 380, muscles: ['chest', 'shoulders', 'arms'], exercises: 6, isTemplate: true },
  { id: '2', name: 'Pull Day A', difficulty: 'intermediate', duration: 65, calories: 400, muscles: ['back', 'arms'],               exercises: 7, isTemplate: true },
  { id: '3', name: 'Leg Day',    difficulty: 'advanced',     duration: 75, calories: 520, muscles: ['legs', 'core'],               exercises: 8, isTemplate: true },
  { id: '4', name: 'Full Body',  difficulty: 'beginner',     duration: 45, calories: 280, muscles: ['chest', 'back', 'legs'],      exercises: 5, isTemplate: true },
  { id: '5', name: 'Core Blast', difficulty: 'intermediate', duration: 30, calories: 220, muscles: ['core'],                       exercises: 6, isTemplate: true },
  { id: '6', name: 'Upper Body', difficulty: 'beginner',     duration: 50, calories: 310, muscles: ['chest', 'back', 'shoulders'], exercises: 6, isTemplate: true },
]

const exercises = [
  { id: 'e1', name: 'Press de banca',    muscle: 'chest' as MuscleGroup,     difficulty: 'intermediate', equipment: 'Barra'          },
  { id: 'e2', name: 'Dominadas',         muscle: 'back' as MuscleGroup,      difficulty: 'intermediate', equipment: 'Barra'          },
  { id: 'e3', name: 'Sentadilla',        muscle: 'legs' as MuscleGroup,      difficulty: 'beginner',     equipment: 'Barra'          },
  { id: 'e4', name: 'Press militar',     muscle: 'shoulders' as MuscleGroup, difficulty: 'intermediate', equipment: 'Barra'          },
  { id: 'e5', name: 'Peso muerto',       muscle: 'back' as MuscleGroup,      difficulty: 'advanced',     equipment: 'Barra'          },
  { id: 'e6', name: 'Curl de bíceps',    muscle: 'arms' as MuscleGroup,      difficulty: 'beginner',     equipment: 'Mancuernas'     },
  { id: 'e7', name: 'Extensión tríceps', muscle: 'arms' as MuscleGroup,      difficulty: 'beginner',     equipment: 'Polea'          },
  { id: 'e8', name: 'Plancha',           muscle: 'core' as MuscleGroup,      difficulty: 'beginner',     equipment: 'Peso corporal'  },
]

/** Colored badge for each muscle group shown in the exercises list */
const muscleBadgeColors: Record<MuscleGroup, string> = {
  all:       'bg-white/10 text-white/60',
  chest:     'bg-rose-500/20 text-rose-300',
  back:      'bg-blue-500/20 text-blue-300',
  shoulders: 'bg-purple-500/20 text-purple-300',
  arms:      'bg-orange-500/20 text-orange-300',
  core:      'bg-yellow-500/20 text-yellow-300',
  legs:      'bg-green-500/20 text-green-300',
}

const muscleLabels: Record<MuscleGroup, string> = {
  all:       'Todos',
  chest:     'Pecho',
  back:      'Espalda',
  shoulders: 'Hombros',
  arms:      'Brazos',
  core:      'Core',
  legs:      'Piernas',
}

const diffColors: Record<string, string> = {
  beginner:     'badge-success',
  intermediate: 'badge-warning',
  advanced:     'badge-danger',
}
const diffLabels: Record<string, string> = {
  beginner: 'Principiante', intermediate: 'Intermedio', advanced: 'Avanzado',
}

export default function GymPage() {
  const [tab, setTab]       = useState<'workouts' | 'exercises'>('workouts')
  const [muscle, setMuscle] = useState<MuscleGroup>('all')
  const [search, setSearch] = useState('')

  const filtered = exercises.filter(
    (e) => (muscle === 'all' || e.muscle === muscle) && e.name.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Gimnasio</h1>
          <p className="text-white/40 text-sm mt-1">Entrena, registra y supera tus límites</p>
        </div>
        <Link to="/gym/workout/new" className="btn-primary text-sm px-4 py-2.5">
          <Plus size={16} /> Nuevo entrenamiento
        </Link>
      </div>

      {/* Quick action cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Play,      label: 'Iniciar',   sub: 'Entrenamiento rápido',       color: 'from-brand-500 to-cyan-400',    to: '/gym/workout/quick' },
          { icon: Dumbbell,  label: 'Rutinas',   sub: `${workouts.length} templates`, color: 'from-purple-500 to-pink-500', to: '#'                  },
          { icon: BarChart2, label: 'Historial', sub: 'Ver progresión',              color: 'from-orange-500 to-yellow-400', to: '/progress'          },
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
        {(['workouts', 'exercises'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all',
              tab === t ? 'bg-brand-500 text-white' : 'text-white/50 hover:text-white',
            )}
          >
            {t === 'workouts' ? 'Rutinas' : 'Ejercicios'}
          </button>
        ))}
      </div>

      {/* Muscle group filter - Lucide icons instead of emojis */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {muscles.map(({ key, label }) => {
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
              {label}
            </button>
          )
        })}
      </div>

      {tab === 'workouts' ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workouts.map((w, i) => (
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
                  {w.exercises} ejercicios · {w.muscles.slice(0, 2).join(', ')}
                </p>
                <div className="flex items-center gap-4 text-xs text-white/50">
                  <span className="flex items-center gap-1"><Clock size={12} /> {w.duration} min</span>
                  <span className="flex items-center gap-1"><Flame size={12} /> ~{w.calories} kcal</span>
                </div>
              </Link>
            </motion.div>
          ))}

          {/* Add custom */}
          <button className="card border-dashed border-white/20 hover:border-brand-500/50 flex flex-col items-center justify-center gap-2 text-white/40 hover:text-brand-400 transition-colors min-h-[160px]">
            <Plus size={24} />
            <span className="text-sm">Crear rutina</span>
          </button>
        </div>
      ) : (
        <>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar ejercicio..."
              className="input pl-9"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            {filtered.map((e, i) => {
              const MuscleIcon = muscleIconMap[e.muscle]
              return (
                <motion.div
                  key={e.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="card-hover flex items-center gap-4"
                >
                  {/* Muscle group icon with colored background */}
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
                  <ChevronRight size={14} className="text-white/20 shrink-0" />
                </motion.div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
