import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { MessageCircle, X, Send, Loader2, Bot, User, Dumbbell, Apple, Flame, Droplets } from 'lucide-react'
import { cn } from '@utils/cn'
import { useAuthStore } from '@store/authStore'
import { useHabitsStore } from '@store/habitsStore'
import { useDailyStore } from '@store/dailyStore'
import { n8nApi, type ChatMessage } from '@services/n8nApi'

const QUICK_PROMPTS_ES = [
  { icon: Apple,    text: '¿Qué debería comer hoy?' },
  { icon: Dumbbell, text: '¿Qué rutina me recomiendas?' },
  { icon: Flame,    text: '¿Cómo puedo perder grasa?' },
  { icon: Droplets, text: '¿Cuánta agua debo tomar?' },
]
const QUICK_PROMPTS_EN = [
  { icon: Apple,    text: 'What should I eat today?' },
  { icon: Dumbbell, text: 'What routine do you recommend?' },
  { icon: Flame,    text: 'How can I lose fat?' },
  { icon: Droplets, text: 'How much water should I drink?' },
]

function getDemoResponse(text: string, lang: string, ctx: {
  calories: number; caloriesTarget: number; waterMl: number;
  workoutMinutes: number; habitsCompleted: number; habitsTotal: number; name: string
}): string {
  const q = text.toLowerCase()
  const es = lang === 'es'
  const waterL = (ctx.waterMl / 1000).toFixed(1)
  const calLeft = Math.max(0, ctx.caloriesTarget - ctx.calories)
  const waterLeft = Math.max(0, 2500 - ctx.waterMl)

  if (q.includes('agua') || q.includes('water') || q.includes('hidrat')) {
    return es
      ? `Llevas ${waterL}L de agua hoy. Se recomienda beber entre 2 y 2.5L diarios. Te quedan unos ${Math.round(waterLeft / 250)} vasos (${waterLeft}ml) para alcanzar tu objetivo. 💧`
      : `You've had ${waterL}L of water today. It's recommended to drink 2–2.5L per day. You need about ${Math.round(waterLeft / 250)} more glasses (${waterLeft}ml) to reach your goal. 💧`
  }
  if (q.includes('comer') || q.includes('eat') || q.includes('dieta') || q.includes('diet') || q.includes('nutrici')) {
    if (calLeft > 500) {
      return es
        ? `Hoy llevas ${ctx.calories} kcal de tu objetivo de ${ctx.caloriesTarget}. Te quedan ${calLeft} kcal. Te recomiendo una comida equilibrada con proteína magra (pollo, pescado o legumbres), carbohidratos complejos (arroz, patata) y verduras. 🥗`
        : `You've had ${ctx.calories} kcal out of your ${ctx.caloriesTarget} goal. You have ${calLeft} kcal left. I recommend a balanced meal with lean protein (chicken, fish or legumes), complex carbs (rice, potato) and vegetables. 🥗`
    }
    return es
      ? `¡Casi alcanzas tu objetivo calórico! Llevas ${ctx.calories} kcal. Si tienes hambre, opta por alimentos de bajo índice glucémico: frutas, yogur griego o una pequeña porción de frutos secos. 🍎`
      : `You're almost at your calorie goal! You've had ${ctx.calories} kcal. If you're hungry, go for low glycemic index foods: fruits, Greek yogurt or a small handful of nuts. 🍎`
  }
  if (q.includes('rutina') || q.includes('routine') || q.includes('ejercicio') || q.includes('exercise') || q.includes('entreno') || q.includes('workout')) {
    return es
      ? `Con ${ctx.workoutMinutes} min de entrenamiento hoy, ${ctx.workoutMinutes === 0 ? 'puedes empezar con un entrenamiento de fuerza de 45 min. En el Gimnasio tienes rutinas para todos los niveles — prueba el "Inicio rápido" para empezar ya.' : 'buen trabajo! Para maximizar el progreso, asegúrate de incluir al menos 3 sesiones de fuerza por semana y 2 de cardio moderado.'} 💪`
      : `With ${ctx.workoutMinutes} min of training today, ${ctx.workoutMinutes === 0 ? 'you could start with a 45-min strength session. In the Gym section you have routines for all levels — try the "Quick start" to begin now.' : 'great job! To maximize progress, aim for at least 3 strength sessions per week and 2 moderate cardio sessions.'} 💪`
  }
  if (q.includes('grasa') || q.includes('fat') || q.includes('adelgaz') || q.includes('peso') || q.includes('weight') || q.includes('perder')) {
    return es
      ? `Para perder grasa de forma efectiva: mantén un déficit calórico moderado (300-500 kcal/día), prioriza la proteína (1.6-2g por kg de peso), entrena con pesas 3-4 veces/semana y haz cardio moderado 2-3 veces. Tu objetivo calórico de hoy es ${ctx.caloriesTarget} kcal. 🎯`
      : `To lose fat effectively: maintain a moderate caloric deficit (300-500 kcal/day), prioritize protein (1.6-2g per kg body weight), train with weights 3-4x/week and do moderate cardio 2-3x. Your calorie goal today is ${ctx.caloriesTarget} kcal. 🎯`
  }
  if (q.includes('hábito') || q.includes('habit')) {
    return es
      ? `Llevas ${ctx.habitsCompleted} de ${ctx.habitsTotal} hábitos completados hoy. ${ctx.habitsCompleted < ctx.habitsTotal ? '¡Aún tienes tiempo! Los hábitos son la base del progreso. Trata de completar al menos el 80% cada día.' : '¡Increíble, todos los hábitos completados! Sigue así para construir una racha.'} ⚡`
      : `You've completed ${ctx.habitsCompleted} out of ${ctx.habitsTotal} habits today. ${ctx.habitsCompleted < ctx.habitsTotal ? "There's still time! Habits are the foundation of progress. Try to complete at least 80% each day." : 'Amazing, all habits done! Keep it up to build a streak.'} ⚡`
  }
  if (q.includes('proteína') || q.includes('protein')) {
    return es
      ? `La proteína es esencial para el crecimiento muscular. Se recomienda entre 1.6 y 2.2g por kg de peso corporal. Buenas fuentes: pechuga de pollo (31g/100g), atún (29g/100g), huevos (13g/100g), yogur griego (10g/100g) y legumbres (8-9g/100g). 🥩`
      : `Protein is essential for muscle growth. Aim for 1.6–2.2g per kg of body weight. Good sources: chicken breast (31g/100g), tuna (29g/100g), eggs (13g/100g), Greek yogurt (10g/100g) and legumes (8–9g/100g). 🥩`
  }
  if (q.includes('descanso') || q.includes('sleep') || q.includes('dormir') || q.includes('recuper')) {
    return es
      ? `El descanso es tan importante como el entrenamiento. Los adultos necesitan 7-9 horas de sueño. Durante el sueño profundo se libera hormona del crecimiento y se reparan los tejidos musculares. Intenta acostarte y levantarte siempre a la misma hora. 😴`
      : `Rest is as important as training. Adults need 7–9 hours of sleep. During deep sleep, growth hormone is released and muscle tissue is repaired. Try going to bed and waking up at the same time every day. 😴`
  }

  return es
    ? `¡Hola ${ctx.name}! Hoy llevas ${ctx.calories} kcal, ${waterL}L de agua y ${ctx.workoutMinutes} min de entrenamiento. Puedo ayudarte con nutrición, rutinas, hábitos o cualquier pregunta sobre fitness. ¿En qué te ayudo? 🏋️`
    : `Hi ${ctx.name}! Today you have ${ctx.calories} kcal, ${waterL}L of water and ${ctx.workoutMinutes} min of training. I can help you with nutrition, routines, habits or any fitness question. What can I help you with? 🏋️`
}

export default function ChatbotWidget() {
  const { i18n } = useTranslation()
  const { user }               = useAuthStore()
  const { habits }             = useHabitsStore()
  const { today }              = useDailyStore()

  const [open, setOpen]           = useState(false)
  const [messages, setMessages]   = useState<ChatMessage[]>([])
  const [input, setInput]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [n8nOk, setN8nOk]         = useState<boolean | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const lang = i18n.language.startsWith('es') ? 'es' : 'en'
  const quickPrompts = lang === 'es' ? QUICK_PROMPTS_ES : QUICK_PROMPTS_EN

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (!open || n8nOk !== null) return
    fetch('http://localhost:5678/healthz', { signal: AbortSignal.timeout(2000) })
      .then(() => setN8nOk(true))
      .catch(() => setN8nOk(false))
  }, [open, n8nOk])

  const buildContext = () => ({
    name:            user?.firstName ?? 'Usuario',
    level:           user?.level ?? 1,
    calories:        today.calories,
    caloriesTarget:  today.caloriesTarget,
    waterMl:         today.waterMl,
    workoutMinutes:  today.workoutMinutes,
    habitsCompleted: habits.filter((h) => h.completedToday).length,
    habitsTotal:     habits.length,
    language:        lang,
  })

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return
    const userMsg: ChatMessage = { role: 'user', content: text }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      if (n8nOk) {
        const res = await n8nApi.chat(text, messages, buildContext())
        const reply = res.reply ?? getDemoResponse(text, lang, buildContext())
        setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
      } else {
        // Demo mode: smart local responses without n8n
        await new Promise((r) => setTimeout(r, 600 + Math.random() * 400))
        const reply = getDemoResponse(text, lang, buildContext())
        setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
      }
    } catch {
      await new Promise((r) => setTimeout(r, 400))
      const reply = getDemoResponse(text, lang, buildContext())
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
    } finally {
      setLoading(false)
    }
  }

  const greeting = lang === 'es'
    ? `¡Hola${user?.firstName ? `, ${user.firstName}` : ''}! Soy tu asistente FitForge. Puedo ayudarte con nutrición, rutinas y hábitos personalizados a tus datos de hoy.`
    : `Hello${user?.firstName ? `, ${user.firstName}` : ''}! I'm your FitForge assistant. I can help you with nutrition, routines and habits tailored to your today's data.`

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          'fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full shadow-lg shadow-brand-500/30',
          'bg-gradient-to-br from-brand-500 to-cyan-400 flex items-center justify-center',
          'hover:scale-110 transition-transform',
          open && 'hidden',
        )}
        title={lang === 'es' ? 'Asistente IA' : 'AI Assistant'}
      >
        <Bot size={24} className="text-white" />
        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-success border-2 border-surface-50 animate-pulse" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-[360px] max-h-[580px] flex flex-col bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-gradient-to-r from-brand-600/20 to-cyan-600/20 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-cyan-400 flex items-center justify-center">
                  <Bot size={16} className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm">FitForge AI</p>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                    <span className="text-[10px] text-white/40">
                      {lang === 'es' ? 'Activo' : 'Active'}
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="btn-ghost p-1.5">
                <X size={15} />
              </button>
            </div>

            {/* Context bar */}
            <div className="flex gap-3 px-4 py-2 bg-[#222]/50 border-b border-white/5 text-[10px] text-white/40 shrink-0">
              <span><Flame size={10} className="inline text-orange-400 mr-0.5" />{today.calories} kcal</span>
              <span><Droplets size={10} className="inline text-blue-400 mr-0.5" />{Math.round(today.waterMl / 100) / 10}L</span>
              <span><Dumbbell size={10} className="inline text-brand-400 mr-0.5" />{today.workoutMinutes} min</span>
              <span className="text-white/30">|</span>
              <span>{lang === 'es' ? 'Contexto' : 'Context'}: {lang === 'es' ? 'hoy' : 'today'}</span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
              {messages.length === 0 && (
                <div className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot size={14} className="text-white" />
                  </div>
                  <div className="bg-[#2a2a2a] rounded-2xl rounded-tl-none px-3 py-2.5 text-sm text-white/80 max-w-[85%]">
                    {greeting}
                  </div>
                </div>
              )}

              {messages.map((m, i) => (
                <div key={i} className={cn('flex gap-2.5', m.role === 'user' && 'flex-row-reverse')}>
                  <div className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5',
                    m.role === 'user' ? 'bg-brand-500/30' : 'bg-gradient-to-br from-brand-500 to-cyan-400',
                  )}>
                    {m.role === 'user'
                      ? <User size={14} className="text-brand-300" />
                      : <Bot size={14} className="text-white" />}
                  </div>
                  <div className={cn(
                    'px-3 py-2.5 rounded-2xl text-sm max-w-[85%] leading-relaxed whitespace-pre-wrap',
                    m.role === 'user'
                      ? 'bg-brand-500/20 text-white rounded-tr-none'
                      : 'bg-[#2a2a2a] text-white/80 rounded-tl-none',
                  )}>
                    {m.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-cyan-400 flex items-center justify-center shrink-0">
                    <Bot size={14} className="text-white" />
                  </div>
                  <div className="bg-[#2a2a2a] rounded-2xl rounded-tl-none px-4 py-3">
                    <div className="flex gap-1.5 items-center">
                      <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce [animation-delay:0ms]" />
                      <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce [animation-delay:150ms]" />
                      <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Quick prompts */}
            {messages.length === 0 && (
              <div className="px-4 pb-2 flex flex-col gap-1.5 shrink-0">
                {quickPrompts.map(({ icon: Icon, text }) => (
                  <button
                    key={text}
                    onClick={() => sendMessage(text)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#2a2a2a] hover:bg-[#333] text-xs text-white/60 hover:text-white transition-all text-left"
                  >
                    <Icon size={12} className="text-brand-400 shrink-0" />
                    {text}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="px-3 py-3 border-t border-white/10 shrink-0">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) } }}
                  placeholder={lang === 'es' ? 'Escribe tu pregunta...' : 'Type your question...'}
                  className="input text-sm flex-1 py-2"
                  disabled={loading}
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={loading || !input.trim()}
                  className="btn-primary px-3 py-2 disabled:opacity-40"
                >
                  {loading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
