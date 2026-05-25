import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play, Pause, Square, Plus, Minus, Check,
  Timer, ChevronDown, ChevronUp, Flame, Dumbbell,
} from 'lucide-react'
import { cn } from '@utils/cn'
import { useDailyStore } from '@store/dailyStore'
import { EXERCISE_CATALOG } from './GymPage'

function beepDone() {
  try {
    const ctx = new AudioContext()
    const freqs = [660, 880, 1100]
    freqs.forEach((freq, i) => {
      const osc  = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = freq
      osc.type = 'sine'
      gain.gain.setValueAtTime(0.25, ctx.currentTime + i * 0.15)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.25)
      osc.start(ctx.currentTime + i * 0.15)
      osc.stop(ctx.currentTime + i * 0.15 + 0.3)
    })
  } catch { /* sin soporte de audio */ }
}

function notifyRestDone() {
  beepDone()
  navigator.vibrate?.([200, 100, 200])
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('FitForge — ¡A por ello!', {
      body: 'Descanso terminado. Siguiente serie.',
      icon: '/pwa-192x192.png',
    })
  }
}

interface Set      { reps: number; weight: number; completed: boolean }
interface Exercise { id: string; name: string; sets: Set[]; restSeconds: number }

const mockWorkout = {
  name: 'Push Day A',
  exercises: [
    {
      id: 'e1',
      name: 'Press de banca',
      sets: [
        { reps: 8, weight: 70, completed: false },
        { reps: 8, weight: 70, completed: false },
        { reps: 6, weight: 75, completed: false },
      ],
      restSeconds: 120,
    },
    {
      id: 'e2',
      name: 'Press inclinado con mancuernas',
      sets: [
        { reps: 10, weight: 22, completed: false },
        { reps: 10, weight: 22, completed: false },
        { reps: 8,  weight: 24, completed: false },
      ],
      restSeconds: 90,
    },
    {
      id: 'e3',
      name: 'Fondos en paralelas',
      sets: [
        { reps: 12, weight: 0, completed: false },
        { reps: 10, weight: 0, completed: false },
        { reps: 10, weight: 0, completed: false },
      ],
      restSeconds: 90,
    },
    {
      id: 'e4',
      name: 'Extensión tríceps polea',
      sets: [
        { reps: 12, weight: 20, completed: false },
        { reps: 12, weight: 20, completed: false },
      ],
      restSeconds: 60,
    },
  ] as Exercise[],
}

function RestTimer({ seconds, onDone }: { seconds: number; onDone: () => void }) {
  const [left, setLeft] = useState(seconds)
  const firedRef = useRef(false)

  useEffect(() => {
    if (left <= 0) {
      if (!firedRef.current) {
        firedRef.current = true
        notifyRestDone()
        onDone()
      }
      return
    }
    const t = setTimeout(() => setLeft((p) => p - 1), 1000)
    return () => clearTimeout(t)
  }, [left, onDone])

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  const pct = (left / seconds) * 100
  const urgent = left <= 5

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm"
    >
      <div className="text-center">
        <p className="text-white/60 mb-4 text-sm font-medium tracking-wide uppercase">Descanso</p>
        <div className="relative w-40 h-40 mx-auto">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#2e2e2e" strokeWidth="6" />
            <circle
              cx="50" cy="50" r="45"
              fill="none"
              stroke={urgent ? '#ef4444' : '#0ea5e9'}
              strokeWidth="6"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - pct / 100)}`}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn('text-5xl font-bold tabular-nums', urgent && 'text-red-400')}>{left}</span>
            <span className="text-xs text-white/30 mt-1">seg</span>
          </div>
        </div>
        <div className="flex gap-3 mt-5 justify-center">
          <button onClick={onDone} className="btn-ghost text-sm px-5">Saltar</button>
          <button onClick={() => setLeft(seconds)} className="btn-secondary text-sm px-5">Reiniciar</button>
        </div>
      </div>
    </motion.div>
  )
}

const emptyWorkout = { name: 'Nuevo entrenamiento', exercises: [] as Exercise[] }

export default function WorkoutPage() {
  const { id }         = useParams()
  const navigate       = useNavigate()
  const location       = useLocation()
  const { addWorkout } = useDailyStore()
  const isNew          = id === 'new'

  /* Build exercise list from the workout passed via navigation state */
  const stateWorkout = (location.state as { workout?: { name: string; exerciseIds: string[] } } | null)?.workout
  const workoutData = isNew
    ? emptyWorkout
    : stateWorkout
      ? {
          name: stateWorkout.name,
          exercises: stateWorkout.exerciseIds
            .map((eid) => {
              const cat = EXERCISE_CATALOG.find((e) => e.id === eid)
              if (!cat) return null
              return {
                id: cat.id,
                name: cat.name,
                sets: Array.from({ length: cat.defaultSets }, () => ({
                  reps: cat.defaultReps,
                  weight: cat.defaultWeight,
                  completed: false,
                })),
                restSeconds: cat.restSeconds,
              } as Exercise
            })
            .filter(Boolean) as Exercise[],
        }
      : mockWorkout

  const [exercises, setExercises] = useState<Exercise[]>(workoutData.exercises)
  const [elapsed, setElapsed]     = useState(0)
  const [running, setRunning]     = useState(false)
  const [resting, setResting]     = useState(false)
  const [restSecs, setRestSecs]   = useState(90)
  const [expanded, setExpanded]   = useState<string | null>(exercises[0]?.id ?? null)
  const intervalRef = useRef<ReturnType<typeof setInterval>>()

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setElapsed((p) => p + 1), 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [running])

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const toggleSet = (exIdx: number, setIdx: number) => {
    setExercises((prev) => {
      const next = structuredClone(prev)
      const s = next[exIdx].sets[setIdx]
      if (!s.completed) {
        s.completed = true
        setRestSecs(next[exIdx].restSeconds)
        setResting(true)
        if (!running) setRunning(true)
      } else {
        s.completed = false
      }
      return next
    })
  }

  const updateSet = (exIdx: number, setIdx: number, field: 'reps' | 'weight', delta: number) => {
    setExercises((prev) => {
      const next = structuredClone(prev)
      next[exIdx].sets[setIdx][field] = Math.max(0, next[exIdx].sets[setIdx][field] + delta)
      return next
    })
  }

  const totalSets = exercises.reduce((a, e) => a + e.sets.length, 0)
  const doneSets  = exercises.reduce((a, e) => a + e.sets.filter((s) => s.completed).length, 0)
  const progress  = totalSets > 0 ? (doneSets / totalSets) * 100 : 0

  const finishWorkout = useCallback(() => {
    setRunning(false)
    const mins = Math.max(1, Math.round(elapsed / 60))
    const done = exercises.reduce((a, e) => a + e.sets.filter((s) => s.completed).length, 0)
    addWorkout(mins, done)
    navigate('/gym')
  }, [elapsed, exercises, addWorkout, navigate])

  return (
    <div className="space-y-6 pb-24">
      <AnimatePresence>
        {resting && <RestTimer seconds={restSecs} onDone={() => setResting(false)} />}
      </AnimatePresence>

      {/* Header card */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-display font-bold">{workoutData.name ?? 'Entrenamiento'}</h1>
            <p className="text-white/40 text-sm">{exercises.length} ejercicios · {doneSets}/{totalSets} series</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-mono font-bold text-brand-400">{fmt(elapsed)}</div>
            <p className="text-xs text-white/40">Duración</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-surface-200 rounded-full overflow-hidden mb-4">
          <motion.div
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
            className="h-full bg-gradient-to-r from-brand-500 to-cyan-400 rounded-full"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setRunning(!running)}
            className={cn('btn-primary flex-1 py-2.5', running ? 'bg-warning hover:bg-yellow-400' : '')}
          >
            {running ? <Pause size={16} /> : <Play size={16} />}
            {running ? 'Pausar' : 'Reanudar'}
          </button>
          <button onClick={finishWorkout} className="btn-danger px-4 py-2.5">
            <Square size={16} />
            Terminar
          </button>
        </div>
      </div>

      {/* Exercise list */}
      <div className="space-y-4">
        {isNew && exercises.length === 0 && (
          <div className="card text-center py-10">
            <Dumbbell size={36} className="text-white/20 mx-auto mb-3" />
            <p className="text-white/40 text-sm mb-4">Añade ejercicios para empezar tu entrenamiento personalizado</p>
            <button
              onClick={() => {
                const newEx: Exercise = {
                  id: `e${Date.now()}`,
                  name: 'Nuevo ejercicio',
                  sets: [{ reps: 10, weight: 0, completed: false }],
                  restSeconds: 90,
                }
                setExercises([newEx])
                setExpanded(newEx.id)
              }}
              className="btn-primary px-6 py-2.5 mx-auto"
            >
              <Plus size={16} /> Añadir ejercicio
            </button>
          </div>
        )}
        {exercises.map((ex, exIdx) => {
          const isExpanded = expanded === ex.id
          const doneEx     = ex.sets.filter((s) => s.completed).length

          return (
            <div key={ex.id} className="card overflow-hidden">
              {/* Exercise header - click to expand/collapse */}
              <button
                onClick={() => setExpanded(isExpanded ? null : ex.id)}
                className="w-full flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold',
                      doneEx === ex.sets.length
                        ? 'bg-success/20 text-success'
                        : 'bg-brand-500/20 text-brand-400',
                    )}
                  >
                    {doneEx === ex.sets.length ? <Check size={16} /> : exIdx + 1}
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-sm">{ex.name}</p>
                    <p className="text-xs text-white/40">{doneEx}/{ex.sets.length} series</p>
                  </div>
                </div>
                {isExpanded
                  ? <ChevronUp size={16} className="text-white/30" />
                  : <ChevronDown size={16} className="text-white/30" />}
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4 space-y-2">
                      {/* Column headers */}
                      <div className="grid grid-cols-4 text-xs text-white/40 px-1 text-center">
                        <span>Serie</span><span>Reps</span><span>Kg</span><span></span>
                      </div>

                      {ex.sets.map((s, setIdx) => (
                        <div
                          key={setIdx}
                          className={cn(
                            'grid grid-cols-4 items-center gap-2 p-2 rounded-lg transition-colors',
                            s.completed ? 'bg-success/10' : 'bg-surface-100',
                          )}
                        >
                          <span className="text-center text-sm font-mono text-white/60">{setIdx + 1}</span>

                          {/* Reps adjuster */}
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => updateSet(exIdx, setIdx, 'reps', -1)}
                              className="w-6 h-6 rounded-md bg-surface-200 hover:bg-surface-300 flex items-center justify-center"
                            >
                              <Minus size={10} />
                            </button>
                            <span className="w-6 text-center text-sm font-semibold">{s.reps}</span>
                            <button
                              onClick={() => updateSet(exIdx, setIdx, 'reps', 1)}
                              className="w-6 h-6 rounded-md bg-surface-200 hover:bg-surface-300 flex items-center justify-center"
                            >
                              <Plus size={10} />
                            </button>
                          </div>

                          {/* Weight adjuster */}
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => updateSet(exIdx, setIdx, 'weight', -2.5)}
                              className="w-6 h-6 rounded-md bg-surface-200 hover:bg-surface-300 flex items-center justify-center"
                            >
                              <Minus size={10} />
                            </button>
                            <span className="w-8 text-center text-sm font-semibold">{s.weight}</span>
                            <button
                              onClick={() => updateSet(exIdx, setIdx, 'weight', 2.5)}
                              className="w-6 h-6 rounded-md bg-surface-200 hover:bg-surface-300 flex items-center justify-center"
                            >
                              <Plus size={10} />
                            </button>
                          </div>

                          {/* Complete set button */}
                          <button
                            onClick={() => toggleSet(exIdx, setIdx)}
                            className={cn(
                              'w-8 h-8 rounded-lg flex items-center justify-center mx-auto transition-all',
                              s.completed
                                ? 'bg-success text-white'
                                : 'bg-surface-200 text-white/30 hover:bg-brand-500/30 hover:text-brand-400',
                            )}
                          >
                            <Check size={14} />
                          </button>
                        </div>
                      ))}

                      <div className="flex items-center gap-2 text-xs text-white/40 pt-1">
                        <Timer size={12} />
                        <span>Descanso: {ex.restSeconds}s</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>

      {/* Fixed bottom summary bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 glass border-t border-white/5 z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1.5 text-white/50">
              <Check size={14} className="text-success" /> {doneSets} series
            </span>
            <span className="flex items-center gap-1.5 text-white/50">
              <Flame size={14} className="text-orange-400" /> ~{Math.round(doneSets * 12)} kcal
            </span>
            <span className="flex items-center gap-1.5 text-white/50">
              <Timer size={14} className="text-brand-400" /> {fmt(elapsed)}
            </span>
          </div>
          <button onClick={finishWorkout} className="btn-primary text-sm px-5 py-2">
            Finalizar
          </button>
        </div>
      </div>
    </div>
  )
}
