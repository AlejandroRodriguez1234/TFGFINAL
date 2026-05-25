import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  MessageCircle, X, Send, Loader2, Bot, User,
  Dumbbell, Apple, Flame, Droplets, Moon, Zap,
  TrendingUp, ShieldCheck, Coffee, Heart, Clock, Salad,
} from 'lucide-react'
import { cn } from '@utils/cn'
import { useAuthStore } from '@store/authStore'
import { useHabitsStore } from '@store/habitsStore'
import { useDailyStore } from '@store/dailyStore'
import { n8nApi, type ChatMessage } from '@services/n8nApi'

type QCategory =
  | 'nutrition' | 'water' | 'exercise' | 'fat_loss'
  | 'protein'   | 'sleep' | 'habits'   | 'muscle'
  | 'supplements'| 'general'

interface QuickPrompt {
  icon: React.ElementType
  text: string
  category: QCategory
}

/* ─── Initial starter questions ─── */
const STARTERS_ES: QuickPrompt[] = [
  { icon: Apple,    text: '¿Qué debería comer hoy?',        category: 'nutrition' },
  { icon: Dumbbell, text: '¿Qué rutina me recomiendas?',    category: 'exercise'  },
  { icon: Flame,    text: '¿Cómo puedo perder grasa?',      category: 'fat_loss'  },
  { icon: Droplets, text: '¿Cuánta agua debo tomar?',       category: 'water'     },
]
const STARTERS_EN: QuickPrompt[] = [
  { icon: Apple,    text: 'What should I eat today?',       category: 'nutrition' },
  { icon: Dumbbell, text: 'What routine do you recommend?', category: 'exercise'  },
  { icon: Flame,    text: 'How can I lose fat?',            category: 'fat_loss'  },
  { icon: Droplets, text: 'How much water should I drink?', category: 'water'     },
]

/* ─── Follow-up banks per category ─── */
const FOLLOW_UPS_ES: Record<QCategory, QuickPrompt[]> = {
  nutrition: [
    { icon: Clock,      text: '¿Cómo distribuyo las comidas al día?',         category: 'nutrition'   },
    { icon: Apple,      text: '¿Qué comer antes de entrenar?',                category: 'nutrition'   },
    { icon: Salad,      text: '¿Qué comer después de entrenar?',              category: 'nutrition'   },
    { icon: TrendingUp, text: '¿Cuánta proteína necesito al día?',            category: 'protein'     },
    { icon: Apple,      text: '¿Cómo calculo mis macros?',                    category: 'nutrition'   },
    { icon: Zap,        text: '¿Qué es el ayuno intermitente?',               category: 'nutrition'   },
    { icon: Salad,      text: '¿Qué alimentos tienen más proteína?',          category: 'protein'     },
    { icon: Clock,      text: '¿Es bueno desayunar antes de entrenar?',       category: 'nutrition'   },
  ],
  water: [
    { icon: Coffee,     text: '¿El café cuenta como hidratación?',            category: 'water'       },
    { icon: Droplets,   text: '¿Cuándo debo beber más agua?',                 category: 'water'       },
    { icon: Dumbbell,   text: '¿Agua antes o durante el entreno?',            category: 'exercise'    },
    { icon: Heart,      text: '¿Cómo sé si estoy deshidratado?',              category: 'water'       },
    { icon: Zap,        text: '¿Bebidas isotónicas o agua?',                  category: 'water'       },
    { icon: Moon,       text: '¿Debo beber agua antes de dormir?',            category: 'water'       },
  ],
  exercise: [
    { icon: Clock,      text: '¿Cuántos días debo entrenar a la semana?',     category: 'exercise'    },
    { icon: Flame,      text: '¿Qué es mejor, cardio o pesas?',               category: 'exercise'    },
    { icon: ShieldCheck,text: '¿Cómo puedo evitar lesiones?',                 category: 'exercise'    },
    { icon: Dumbbell,   text: '¿Cuánto descanso entre series?',               category: 'exercise'    },
    { icon: Zap,        text: '¿Qué es el HIIT y sirve para perder grasa?',   category: 'exercise'    },
    { icon: Clock,      text: '¿Es mejor entrenar por la mañana o por la noche?', category: 'exercise'},
    { icon: ShieldCheck,text: '¿Cómo calentar correctamente antes de entrenar?', category: 'exercise' },
    { icon: TrendingUp, text: '¿Qué es la sobrecarga progresiva?',            category: 'exercise'    },
  ],
  fat_loss: [
    { icon: Flame,      text: '¿Cuánto déficit calórico es seguro?',          category: 'fat_loss'    },
    { icon: Dumbbell,   text: '¿Qué cardio quema más grasa?',                 category: 'fat_loss'    },
    { icon: TrendingUp, text: '¿Puedo perder grasa y ganar músculo?',         category: 'muscle'      },
    { icon: Apple,      text: '¿Qué alimentos evitar para adelgazar?',        category: 'fat_loss'    },
    { icon: Zap,        text: '¿Cómo acelerar el metabolismo?',               category: 'fat_loss'    },
    { icon: Clock,      text: '¿El ayuno intermitente ayuda a perder grasa?', category: 'fat_loss'    },
    { icon: Heart,      text: '¿Cuánto tiempo para ver resultados reales?',   category: 'fat_loss'    },
  ],
  protein: [
    { icon: Zap,        text: '¿Los batidos de proteína son necesarios?',     category: 'protein'     },
    { icon: Clock,      text: '¿Cuándo es mejor tomar proteína?',             category: 'protein'     },
    { icon: Salad,      text: '¿Proteínas vegetales vs animales?',            category: 'protein'     },
    { icon: ShieldCheck,text: '¿Qué pasa si como demasiada proteína?',        category: 'protein'     },
    { icon: Apple,      text: '¿Qué alimentos tienen más proteína?',          category: 'protein'     },
    { icon: Heart,      text: '¿Son buenos los huevos todos los días?',       category: 'protein'     },
    { icon: Dumbbell,   text: '¿Cuánta proteína necesito para ganar músculo?',category: 'muscle'      },
  ],
  sleep: [
    { icon: Apple,      text: '¿Qué comer antes de dormir?',                  category: 'sleep'       },
    { icon: Flame,      text: '¿El sueño afecta la pérdida de grasa?',        category: 'sleep'       },
    { icon: Moon,       text: '¿Cómo mejorar la calidad del sueño?',          category: 'sleep'       },
    { icon: Clock,      text: '¿La siesta es beneficiosa?',                   category: 'sleep'       },
    { icon: Heart,      text: '¿El estrés afecta al sueño y al músculo?',     category: 'sleep'       },
    { icon: TrendingUp, text: '¿El sueño afecta a la masa muscular?',         category: 'sleep'       },
    { icon: Zap,        text: '¿Qué suplementos mejoran el sueño?',           category: 'supplements' },
  ],
  habits: [
    { icon: Zap,        text: '¿Cómo mantener la motivación?',                category: 'habits'      },
    { icon: Clock,      text: '¿Cuánto tarda en formarse un hábito?',         category: 'habits'      },
    { icon: Heart,      text: '¿Qué hábito es el más importante?',            category: 'habits'      },
    { icon: ShieldCheck,text: '¿Cómo gestionar los días malos?',              category: 'habits'      },
    { icon: Dumbbell,   text: '¿Cómo crear una rutina sostenible?',           category: 'habits'      },
    { icon: TrendingUp, text: '¿Qué hacer si no tengo tiempo para entrenar?', category: 'habits'      },
    { icon: Moon,       text: '¿Cómo mejorar la constancia en el deporte?',   category: 'habits'      },
  ],
  muscle: [
    { icon: Apple,      text: '¿Cuántas calorías para ganar masa?',           category: 'muscle'      },
    { icon: Clock,      text: '¿Cuánto tiempo hasta ver resultados?',         category: 'muscle'      },
    { icon: Dumbbell,   text: '¿Cuáles son los mejores ejercicios?',          category: 'exercise'    },
    { icon: Zap,        text: '¿Qué suplementos ayudan a ganar músculo?',     category: 'supplements' },
    { icon: TrendingUp, text: '¿Qué es la memoria muscular?',                 category: 'muscle'      },
    { icon: Heart,      text: '¿A qué edad es más fácil ganar músculo?',      category: 'muscle'      },
    { icon: ShieldCheck,text: '¿Cuántas series por músculo a la semana?',     category: 'muscle'      },
    { icon: Clock,      text: '¿Con qué frecuencia entrenar cada músculo?',   category: 'muscle'      },
  ],
  supplements: [
    { icon: ShieldCheck,text: '¿La creatina es segura?',                      category: 'supplements' },
    { icon: Clock,      text: '¿Cuándo tomar creatina?',                      category: 'supplements' },
    { icon: Zap,        text: '¿Los BCAAs son útiles?',                       category: 'supplements' },
    { icon: Apple,      text: '¿Qué suplementos básicos recomiendas?',        category: 'supplements' },
    { icon: Flame,      text: '¿La cafeína mejora el rendimiento deportivo?', category: 'supplements' },
    { icon: Heart,      text: '¿Para qué sirve la vitamina D?',               category: 'supplements' },
    { icon: TrendingUp, text: '¿Son necesarios los multivitamínicos?',        category: 'supplements' },
  ],
  general: [
    { icon: Apple,      text: '¿Qué debería comer hoy?',                      category: 'nutrition'   },
    { icon: Flame,      text: '¿Cómo puedo perder grasa?',                    category: 'fat_loss'    },
    { icon: Dumbbell,   text: '¿Qué rutina me recomiendas?',                  category: 'exercise'    },
    { icon: TrendingUp, text: '¿Cuánta proteína necesito al día?',            category: 'protein'     },
    { icon: Droplets,   text: '¿Cuánta agua debo tomar?',                     category: 'water'       },
    { icon: Moon,       text: '¿Cuántas horas debo dormir?',                  category: 'sleep'       },
  ],
}

const FOLLOW_UPS_EN: Record<QCategory, QuickPrompt[]> = {
  nutrition: [
    { icon: Clock,      text: 'How should I distribute my meals?',            category: 'nutrition'   },
    { icon: Apple,      text: 'What to eat before training?',                 category: 'nutrition'   },
    { icon: Salad,      text: 'What to eat after training?',                  category: 'nutrition'   },
    { icon: TrendingUp, text: 'How much protein do I need per day?',          category: 'protein'     },
    { icon: Apple,      text: 'How do I calculate my macros?',                category: 'nutrition'   },
    { icon: Zap,        text: 'What is intermittent fasting?',                category: 'nutrition'   },
    { icon: Salad,      text: 'What foods have the most protein?',            category: 'protein'     },
    { icon: Clock,      text: 'Is it good to have breakfast before training?',category: 'nutrition'   },
  ],
  water: [
    { icon: Coffee,     text: 'Does coffee count as hydration?',              category: 'water'       },
    { icon: Droplets,   text: 'When should I drink more water?',              category: 'water'       },
    { icon: Dumbbell,   text: 'Water before or during workout?',              category: 'exercise'    },
    { icon: Heart,      text: 'How do I know if I\'m dehydrated?',            category: 'water'       },
    { icon: Zap,        text: 'Sports drinks or water?',                      category: 'water'       },
    { icon: Moon,       text: 'Should I drink water before bed?',             category: 'water'       },
  ],
  exercise: [
    { icon: Clock,      text: 'How many days per week should I train?',       category: 'exercise'    },
    { icon: Flame,      text: 'What\'s better, cardio or weights?',           category: 'exercise'    },
    { icon: ShieldCheck,text: 'How can I avoid injuries?',                    category: 'exercise'    },
    { icon: Dumbbell,   text: 'How long to rest between sets?',               category: 'exercise'    },
    { icon: Zap,        text: 'What is HIIT and does it burn fat?',           category: 'exercise'    },
    { icon: Clock,      text: 'Is it better to train in the morning or evening?', category: 'exercise'},
    { icon: ShieldCheck,text: 'How to warm up correctly before training?',    category: 'exercise'    },
    { icon: TrendingUp, text: 'What is progressive overload?',                category: 'exercise'    },
  ],
  fat_loss: [
    { icon: Flame,      text: 'How much of a calorie deficit is safe?',       category: 'fat_loss'    },
    { icon: Dumbbell,   text: 'What cardio burns the most fat?',              category: 'fat_loss'    },
    { icon: TrendingUp, text: 'Can I lose fat and gain muscle?',              category: 'muscle'      },
    { icon: Apple,      text: 'What foods to avoid to lose weight?',          category: 'fat_loss'    },
    { icon: Zap,        text: 'How to speed up my metabolism?',               category: 'fat_loss'    },
    { icon: Clock,      text: 'Does intermittent fasting help lose fat?',     category: 'fat_loss'    },
    { icon: Heart,      text: 'How long until I see real results?',           category: 'fat_loss'    },
  ],
  protein: [
    { icon: Zap,        text: 'Are protein shakes necessary?',                category: 'protein'     },
    { icon: Clock,      text: 'When is the best time to take protein?',       category: 'protein'     },
    { icon: Salad,      text: 'Plant vs animal protein?',                     category: 'protein'     },
    { icon: ShieldCheck,text: 'What if I eat too much protein?',              category: 'protein'     },
    { icon: Apple,      text: 'What foods have the most protein?',            category: 'protein'     },
    { icon: Heart,      text: 'Are eggs good every day?',                     category: 'protein'     },
    { icon: Dumbbell,   text: 'How much protein to gain muscle?',             category: 'muscle'      },
  ],
  sleep: [
    { icon: Apple,      text: 'What to eat before bed?',                      category: 'sleep'       },
    { icon: Flame,      text: 'Does sleep affect fat loss?',                  category: 'sleep'       },
    { icon: Moon,       text: 'How to improve sleep quality?',                category: 'sleep'       },
    { icon: Clock,      text: 'Are naps beneficial?',                         category: 'sleep'       },
    { icon: Heart,      text: 'Does stress affect sleep and muscle?',         category: 'sleep'       },
    { icon: TrendingUp, text: 'Does sleep affect muscle mass?',               category: 'sleep'       },
    { icon: Zap,        text: 'What supplements improve sleep?',              category: 'supplements' },
  ],
  habits: [
    { icon: Zap,        text: 'How to stay motivated?',                       category: 'habits'      },
    { icon: Clock,      text: 'How long does it take to form a habit?',       category: 'habits'      },
    { icon: Heart,      text: 'What\'s the most important habit?',            category: 'habits'      },
    { icon: ShieldCheck,text: 'How to handle bad days?',                      category: 'habits'      },
    { icon: Dumbbell,   text: 'How to create a sustainable routine?',         category: 'habits'      },
    { icon: TrendingUp, text: 'What if I don\'t have time to train?',         category: 'habits'      },
    { icon: Moon,       text: 'How to improve sport consistency?',            category: 'habits'      },
  ],
  muscle: [
    { icon: Apple,      text: 'How many calories to bulk?',                   category: 'muscle'      },
    { icon: Clock,      text: 'How long until I see results?',                category: 'muscle'      },
    { icon: Dumbbell,   text: 'What are the best exercises?',                 category: 'exercise'    },
    { icon: Zap,        text: 'What supplements help gain muscle?',           category: 'supplements' },
    { icon: TrendingUp, text: 'What is muscle memory?',                       category: 'muscle'      },
    { icon: Heart,      text: 'At what age is it easiest to gain muscle?',    category: 'muscle'      },
    { icon: ShieldCheck,text: 'How many sets per muscle per week?',           category: 'muscle'      },
    { icon: Clock,      text: 'How often should I train each muscle?',        category: 'muscle'      },
  ],
  supplements: [
    { icon: ShieldCheck,text: 'Is creatine safe?',                            category: 'supplements' },
    { icon: Clock,      text: 'When to take creatine?',                       category: 'supplements' },
    { icon: Zap,        text: 'Are BCAAs useful?',                            category: 'supplements' },
    { icon: Apple,      text: 'What basic supplements do you recommend?',     category: 'supplements' },
    { icon: Flame,      text: 'Does caffeine improve athletic performance?',  category: 'supplements' },
    { icon: Heart,      text: 'What is vitamin D and why is it important?',   category: 'supplements' },
    { icon: TrendingUp, text: 'Are multivitamins necessary?',                 category: 'supplements' },
  ],
  general: [
    { icon: Apple,      text: 'What should I eat today?',                     category: 'nutrition'   },
    { icon: Flame,      text: 'How can I lose fat?',                          category: 'fat_loss'    },
    { icon: Dumbbell,   text: 'What routine do you recommend?',               category: 'exercise'    },
    { icon: TrendingUp, text: 'How much protein do I need per day?',          category: 'protein'     },
    { icon: Droplets,   text: 'How much water should I drink?',               category: 'water'       },
    { icon: Moon,       text: 'How many hours of sleep do I need?',           category: 'sleep'       },
  ],
}

function detectCategory(text: string): QCategory {
  const q = text.toLowerCase()
  if (q.includes('agua') || q.includes('water') || q.includes('hidrat') || q.includes('beber') || q.includes('café') || q.includes('coffee') || q.includes('deshidrat')) return 'water'
  if (q.includes('proteína') || q.includes('protein') || q.includes('batido') || q.includes('shake') || q.includes('bcaa')) return 'protein'
  if (q.includes('grasa') || q.includes('adelgaz') || q.includes('perder') || q.includes('déficit') || q.includes('deficit') || q.includes('fat') || q.includes('lose weight') || q.includes('cardio')) return 'fat_loss'
  if (q.includes('músculo') || q.includes('muscle') || q.includes('masa') || q.includes('volumen') || q.includes('bulk') || q.includes('ganar')) return 'muscle'
  if (q.includes('dormir') || q.includes('sueño') || q.includes('sleep') || q.includes('descanso') || q.includes('siesta') || q.includes('nap')) return 'sleep'
  if (q.includes('hábito') || q.includes('habit') || q.includes('motivaci') || q.includes('motivat') || q.includes('streak')) return 'habits'
  if (q.includes('suplemento') || q.includes('supplement') || q.includes('creatina') || q.includes('creatine')) return 'supplements'
  if (q.includes('rutina') || q.includes('routine') || q.includes('ejercicio') || q.includes('exercise') || q.includes('entreno') || q.includes('workout') || q.includes('lesion') || q.includes('injur') || q.includes('series') || q.includes('sets')) return 'exercise'
  if (q.includes('comer') || q.includes('eat') || q.includes('dieta') || q.includes('diet') || q.includes('nutri') || q.includes('calor') || q.includes('comida') || q.includes('meal') || q.includes('antes') || q.includes('before') || q.includes('después') || q.includes('after')) return 'nutrition'
  return 'general'
}

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
      : `You've had ${waterL}L of water today. Aim for 2–2.5L per day. You need about ${Math.round(waterLeft / 250)} more glasses (${waterLeft}ml) to reach your goal. 💧`
  }
  if (q.includes('café') || q.includes('coffee')) {
    return es
      ? `El café sí aporta hidratación, aunque tiene efecto diurético leve. Un café con cafeína cuenta aproximadamente como el 80% de su volumen en agua. No lo cuentes como sustituto del agua, pero sí suma a tu ingesta total. ☕`
      : `Coffee does contribute to hydration, though it has a mild diuretic effect. A caffeinated coffee counts roughly as 80% of its volume in water. Don't replace water with it, but it does add to your total intake. ☕`
  }
  if (q.includes('deshidrat') || q.includes('dehydrat')) {
    return es
      ? `Señales de deshidratación: orina oscura (debe ser amarillo pálido), boca seca, cansancio, dolores de cabeza y reducción del rendimiento físico. Si notas alguna de estas señales, bebe agua inmediatamente. 💧`
      : `Signs of dehydration: dark urine (should be pale yellow), dry mouth, fatigue, headaches, and reduced physical performance. If you notice any of these, drink water immediately. 💧`
  }
  if (q.includes('comer') || q.includes('eat') || q.includes('dieta') || q.includes('diet') || q.includes('nutri')) {
    if (calLeft > 500) {
      return es
        ? `Hoy llevas ${ctx.calories} kcal de tu objetivo de ${ctx.caloriesTarget}. Te quedan ${calLeft} kcal. Te recomiendo una comida equilibrada con proteína magra (pollo, pescado o legumbres), carbohidratos complejos (arroz, patata) y verduras. 🥗`
        : `You've had ${ctx.calories} kcal out of your ${ctx.caloriesTarget} goal. You have ${calLeft} kcal left. I recommend a balanced meal with lean protein (chicken, fish or legumes), complex carbs (rice, potato) and vegetables. 🥗`
    }
    return es
      ? `¡Casi alcanzas tu objetivo calórico! Llevas ${ctx.calories} kcal. Si tienes hambre, opta por alimentos de bajo índice glucémico: frutas, yogur griego o una pequeña porción de frutos secos. 🍎`
      : `You're almost at your calorie goal! You've had ${ctx.calories} kcal. If hungry, go for low glycemic foods: fruits, Greek yogurt or a small handful of nuts. 🍎`
  }
  if (q.includes('antes de entrenar') || q.includes('before training') || q.includes('pre-workout') || q.includes('pre entreno')) {
    return es
      ? `Antes de entrenar (1-2h antes): carbohidratos de digestión media como arroz, pasta o avena + proteína moderada. Ejemplo: 150g de arroz + 120g de pechuga. Evita grasas en exceso ya que ralentizan la digestión. ⚡`
      : `Before training (1-2h before): medium-digestion carbs like rice, pasta or oats + moderate protein. Example: 150g rice + 120g chicken breast. Avoid excess fat as it slows digestion. ⚡`
  }
  if (q.includes('después de entrenar') || q.includes('after training') || q.includes('post-workout') || q.includes('post entreno')) {
    return es
      ? `Después de entrenar (dentro de 1-2h): proteína de rápida absorción + carbohidratos simples. Ejemplo: batido de proteína con plátano, o tortillas de huevo con arroz blanco. Esto maximiza la síntesis proteica y repone glucógeno. 💪`
      : `After training (within 1-2h): fast-absorbing protein + simple carbs. Example: protein shake with banana, or egg wraps with white rice. This maximizes protein synthesis and replenishes glycogen. 💪`
  }
  if (q.includes('distribuyo') || q.includes('distribute') || q.includes('comidas al día') || q.includes('meals')) {
    return es
      ? `Lo óptimo es 3-5 comidas al día con proteína en cada una. Ejemplo: desayuno (25% kcal), media mañana (10%), comida (35%), merienda (10%), cena (20%). Esto mantiene el metabolismo activo y evita picos de insulina. 🕐`
      : `Optimal is 3-5 meals per day with protein in each. Example: breakfast (25% kcal), mid-morning (10%), lunch (35%), snack (10%), dinner (20%). This keeps metabolism active and avoids insulin spikes. 🕐`
  }
  if (q.includes('rutina') || q.includes('routine') || q.includes('ejercicio') || q.includes('exercise') || q.includes('entreno') || q.includes('workout')) {
    return es
      ? `Con ${ctx.workoutMinutes} min de entrenamiento hoy, ${ctx.workoutMinutes === 0 ? 'puedes empezar con un entrenamiento de fuerza de 45 min. En el Gimnasio tienes rutinas para todos los niveles — prueba el "Inicio rápido".' : 'buen trabajo! Para maximizar el progreso, incluye al menos 3 sesiones de fuerza y 2 de cardio por semana.'} 💪`
      : `With ${ctx.workoutMinutes} min of training today, ${ctx.workoutMinutes === 0 ? 'you could start with a 45-min strength session. In the Gym section you have routines for all levels — try "Quick start".' : 'great job! To maximize progress, aim for at least 3 strength sessions and 2 cardio sessions per week.'} 💪`
  }
  if (q.includes('días') || q.includes('days per week') || q.includes('cuántos días')) {
    return es
      ? `Para resultados óptimos: principiante → 3 días (full body); intermedio → 4 días (upper/lower o push/pull/legs); avanzado → 5-6 días (splits específicos). Recuerda: el descanso entre sesiones del mismo grupo muscular debe ser 48-72h. 📅`
      : `For optimal results: beginner → 3 days (full body); intermediate → 4 days (upper/lower or push/pull/legs); advanced → 5-6 days (specific splits). Remember: rest 48-72h between sessions for the same muscle group. 📅`
  }
  if (q.includes('cardio') || q.includes('pesas') || q.includes('weights')) {
    return es
      ? `Ambos son importantes y complementarios. Las pesas preservan y aumentan masa muscular, aceleran el metabolismo a largo plazo y queman grasa en reposo. El cardio mejora la salud cardiovascular y crea déficit calórico. Lo ideal: prioriza fuerza (3-4 días) + cardio moderado (2-3 días). 🏋️`
      : `Both are important and complementary. Weights preserve and build muscle, boost long-term metabolism and burn fat at rest. Cardio improves cardiovascular health and creates caloric deficit. Ideal: prioritize strength (3-4 days) + moderate cardio (2-3 days). 🏋️`
  }
  if (q.includes('lesion') || q.includes('injur') || q.includes('evitar lesiones') || q.includes('avoid injuries')) {
    return es
      ? `Para prevenir lesiones: calienta siempre 5-10 min antes, usa técnica correcta (mejor menos peso con buena forma), progresa gradualmente (+5-10% de carga por semana), duerme suficiente para recuperarte y escucha a tu cuerpo — el dolor agudo es una señal de parar. 🛡️`
      : `To prevent injuries: always warm up 5-10 min before, use correct technique (better less weight with good form), progress gradually (+5-10% load per week), sleep enough to recover and listen to your body — sharp pain is a signal to stop. 🛡️`
  }
  if (q.includes('series') || q.includes('sets') || q.includes('descanso entre') || q.includes('rest between')) {
    return es
      ? `Tiempo de descanso entre series según objetivo: fuerza máxima (3-5 min), hipertrofia/volumen (60-90 seg), resistencia muscular (30-45 seg). Para ejercicios compuestos como sentadilla o press banca, descansa más (2-3 min). ⏱️`
      : `Rest time between sets by goal: max strength (3-5 min), hypertrophy/volume (60-90 sec), muscular endurance (30-45 sec). For compound lifts like squats or bench press, rest longer (2-3 min). ⏱️`
  }
  if (q.includes('grasa') || q.includes('fat') || q.includes('adelgaz') || q.includes('perder') || q.includes('lose weight')) {
    return es
      ? `Para perder grasa: déficit de 300-500 kcal/día, prioriza proteína (1.6-2g/kg), entrena con pesas 3-4 veces/semana + cardio moderado 2-3 veces. Tu objetivo calórico hoy es ${ctx.caloriesTarget} kcal. 🎯`
      : `To lose fat: 300-500 kcal/day deficit, prioritize protein (1.6-2g/kg), train with weights 3-4x/week + moderate cardio 2-3x. Your calorie goal today is ${ctx.caloriesTarget} kcal. 🎯`
  }
  if (q.includes('déficit') || q.includes('deficit') || q.includes('cuánto déficit') || q.includes('how much deficit')) {
    return es
      ? `Un déficit de 300-500 kcal/día es seguro y sostenible (perderás ~0.3-0.5 kg/semana). Más de 700-1000 kcal de déficit puede provocar pérdida muscular, fatiga, carencias nutricionales y efecto rebote. La paciencia es clave. ⚖️`
      : `A 300-500 kcal/day deficit is safe and sustainable (you'll lose ~0.3-0.5 kg/week). More than 700-1000 kcal deficit can cause muscle loss, fatigue, nutritional deficiencies and rebound effect. Patience is key. ⚖️`
  }
  if (q.includes('alimentos evitar') || q.includes('foods to avoid') || q.includes('qué evitar')) {
    return es
      ? `Para adelgazar, reduce: ultraprocesados (bollería, snacks, refrescos), alcohol, salsas industriales y aceites en exceso. No los prohíbas totalmente — la adherencia es clave. Aplica la regla 80/20: 80% comida real, 20% flexibilidad. 🥗`
      : `To lose weight, reduce: ultra-processed foods (pastries, snacks, sodas), alcohol, industrial sauces and excess oils. Don't ban them completely — adherence is key. Apply the 80/20 rule: 80% real food, 20% flexibility. 🥗`
  }
  if (q.includes('perder grasa y ganar') || q.includes('lose fat and gain') || q.includes('recomposición') || q.includes('recomposition')) {
    return es
      ? `¡Sí es posible! Se llama recomposición corporal. Funciona mejor en principiantes, personas con sobrepeso o tras un descanso. Clave: déficit calórico leve (-200 kcal), proteína alta (2g/kg) y entrenamiento de fuerza progresivo. Es más lento que hacer cada cosa por separado. 🔄`
      : `Yes it's possible! It's called body recomposition. Works best for beginners, overweight people or after a break. Key: slight caloric deficit (-200 kcal), high protein (2g/kg) and progressive strength training. It's slower than doing each separately. 🔄`
  }
  if (q.includes('proteína') || q.includes('protein')) {
    return es
      ? `La proteína es esencial para el crecimiento muscular. Recomendación: 1.6-2.2g/kg de peso. Fuentes: pollo (31g/100g), atún (29g/100g), huevos (13g/100g), yogur griego (10g/100g), legumbres (8-9g/100g). 🥩`
      : `Protein is essential for muscle growth. Aim for 1.6–2.2g/kg body weight. Sources: chicken (31g/100g), tuna (29g/100g), eggs (13g/100g), Greek yogurt (10g/100g), legumes (8–9g/100g). 🥩`
  }
  if (q.includes('batido') || q.includes('shake') || q.includes('necesario') || q.includes('necessary')) {
    return es
      ? `Los batidos de proteína son un suplemento cómodo, no una necesidad. Si llegas a tus proteínas diarias con comida real, no los necesitas. Son útiles cuando es difícil alcanzar el objetivo proteico solo con comida (viajes, poco tiempo, etc.). 🥤`
      : `Protein shakes are a convenient supplement, not a necessity. If you reach your daily protein with real food, you don't need them. They're useful when it's hard to hit protein goals through food alone (travel, little time, etc.). 🥤`
  }
  if (q.includes('cuándo tomar proteína') || q.includes('when to take protein') || q.includes('timing')) {
    return es
      ? `El timing de proteína es menos crítico de lo que se cree. Lo más importante es la cantidad total diaria. Dicho esto, consumir proteína dentro de las 2h post-entreno favorece la síntesis muscular. Distribúyela en 3-5 tomas de 25-40g. ⏰`
      : `Protein timing is less critical than commonly thought. Total daily amount is what matters most. That said, consuming protein within 2h post-workout favors muscle synthesis. Distribute it in 3-5 doses of 25-40g. ⏰`
  }
  if (q.includes('vegetal') || q.includes('plant') || q.includes('animal')) {
    return es
      ? `Las proteínas animales son "completas" (todos los aminoácidos esenciales) y de alta biodisponibilidad. Las vegetales pueden ser incompletas, pero combinando fuentes (arroz + legumbres, por ejemplo) obtienes el perfil completo. Ambas son válidas para ganar músculo. 🌱`
      : `Animal proteins are "complete" (all essential amino acids) with high bioavailability. Plant proteins can be incomplete, but combining sources (rice + legumes, for example) gives you the full profile. Both are valid for muscle building. 🌱`
  }
  if (q.includes('demasiada proteína') || q.includes('too much protein')) {
    return es
      ? `En personas sanas, consumir proteína en exceso (>3g/kg) no es peligroso a largo plazo, pero el exceso simplemente se usa como energía. Los riñones sanos pueden manejar altas ingestas. Sin embargo, más de 2.5g/kg no aporta beneficios adicionales. 📊`
      : `In healthy people, consuming excess protein (>3g/kg) isn't dangerous long-term, but the excess is simply used as energy. Healthy kidneys can handle high intakes. However, more than 2.5g/kg provides no additional benefit. 📊`
  }
  if (q.includes('dormir') || q.includes('sleep') || q.includes('sueño') || q.includes('descanso') || q.includes('recuper')) {
    return es
      ? `El descanso es tan importante como el entrenamiento. Los adultos necesitan 7-9h. Durante el sueño profundo se libera hormona del crecimiento y se reparan tejidos musculares. Intenta acostarte y levantarte a la misma hora. 😴`
      : `Rest is as important as training. Adults need 7-9h. During deep sleep, growth hormone is released and muscle tissue is repaired. Try to go to bed and wake up at the same time. 😴`
  }
  if (q.includes('antes de dormir') || q.includes('before bed') || q.includes('cena') || q.includes('noche')) {
    return es
      ? `Antes de dormir: opta por proteína de absorción lenta (caseína) como requesón, queso cottage o yogur griego. Evita carbohidratos simples y alcohol que fragmentan el sueño. Un buen snack nocturno: 150g de queso cottage + nueces. 🌙`
      : `Before bed: opt for slow-absorbing protein (casein) like cottage cheese or Greek yogurt. Avoid simple carbs and alcohol that fragment sleep. A good nighttime snack: 150g cottage cheese + nuts. 🌙`
  }
  if (q.includes('calidad del sueño') || q.includes('sleep quality') || q.includes('mejorar') && q.includes('dormir')) {
    return es
      ? `Para mejorar la calidad del sueño: oscuridad total y temperatura fresca (18-20°C), sin pantallas 1h antes, cena ligera 2h antes de dormir, rutina constante de hora de acostarse. La melatonina puede ayudar ocasionalmente (0.5-1mg). 🌙`
      : `To improve sleep quality: total darkness and cool temperature (18-20°C), no screens 1h before, light dinner 2h before bed, consistent bedtime routine. Melatonin can occasionally help (0.5-1mg). 🌙`
  }
  if (q.includes('siesta') || q.includes('nap')) {
    return es
      ? `La siesta corta (10-20 min) mejora el rendimiento cognitivo, el estado de ánimo y la recuperación física. Evita siestas de más de 30 min que pueden provocar inercia del sueño. El mejor momento: entre las 13-15h. 💤`
      : `Short naps (10-20 min) improve cognitive performance, mood and physical recovery. Avoid naps over 30 min that can cause sleep inertia. Best time: between 1-3 PM. 💤`
  }
  if (q.includes('hábito') || q.includes('habit')) {
    return es
      ? `Llevas ${ctx.habitsCompleted} de ${ctx.habitsTotal} hábitos completados hoy. ${ctx.habitsCompleted < ctx.habitsTotal ? '¡Aún tienes tiempo! Trata de completar al menos el 80% cada día.' : '¡Todos los hábitos completados! Sigue así para construir una racha.'} ⚡`
      : `You've completed ${ctx.habitsCompleted} out of ${ctx.habitsTotal} habits today. ${ctx.habitsCompleted < ctx.habitsTotal ? "There's still time! Try to complete at least 80% each day." : 'All habits done! Keep it up to build a streak.'} ⚡`
  }
  if (q.includes('motivaci') || q.includes('motivat')) {
    return es
      ? `La motivación fluctúa — la disciplina y los sistemas son más fiables. Consejo: vincula los hábitos a recompensas inmediatas, busca un compañero de entrenamiento, registra tu progreso visualmente y recuerda tu "porqué" profundo. Los pequeños logros diarios construyen el impulso. 🔥`
      : `Motivation fluctuates — discipline and systems are more reliable. Tips: link habits to immediate rewards, find a training partner, track your progress visually and remember your deep "why". Small daily wins build momentum. 🔥`
  }
  if (q.includes('cuánto tarda') || q.includes('how long') || q.includes('formarse un hábito') || q.includes('form a habit')) {
    return es
      ? `Contrario al mito de los 21 días, la investigación muestra que un hábito tarda en promedio 66 días (rango 18-254 días) en automatizarse, según un estudio de la UCL. La clave es la consistencia, no la perfección — fallar un día no rompe el proceso. 📅`
      : `Contrary to the 21-day myth, research shows habits take an average of 66 days (range 18-254 days) to become automatic, according to a UCL study. The key is consistency, not perfection — missing one day doesn't break the process. 📅`
  }
  if (q.includes('días malos') || q.includes('bad days') || q.includes('gestionar') || q.includes('handle')) {
    return es
      ? `Los días malos son normales y parte del proceso. Estrategia: aplica la "regla de nunca dos veces" (si fallas un día, al siguiente vuelves sin excusas), reduce la carga ese día (5 min en vez de 30) y recuerda que el progreso no es lineal. 💪`
      : `Bad days are normal and part of the process. Strategy: apply the "never twice" rule (if you miss a day, come back the next without excuses), reduce the load that day (5 min instead of 30) and remember progress is not linear. 💪`
  }
  if (q.includes('músculo') || q.includes('muscle') || q.includes('masa') || q.includes('ganar')) {
    return es
      ? `Para ganar músculo: superávit calórico leve (+200-300 kcal), proteína 1.8-2.2g/kg, entrenamiento de fuerza progresivo (aumenta carga o reps cada semana) y descanso adecuado. Resultados visibles en 8-12 semanas de consistencia. 💪`
      : `To gain muscle: slight caloric surplus (+200-300 kcal), protein 1.8-2.2g/kg, progressive strength training (increase load or reps each week) and adequate rest. Visible results in 8-12 weeks of consistency. 💪`
  }
  if (q.includes('cuántas calorías') || q.includes('how many calories') || q.includes('superávit') || q.includes('surplus')) {
    return es
      ? `Para ganar masa muscular: TDEE + 200-300 kcal (superávit limpio). Más de +500 kcal solo añade grasa innecesaria. Si eres principiante, puedes ganar músculo incluso en mantenimiento calórico o con un leve déficit. 📈`
      : `To gain muscle: TDEE + 200-300 kcal (clean surplus). More than +500 kcal just adds unnecessary fat. If you're a beginner, you can gain muscle even at maintenance or with a slight deficit. 📈`
  }
  if (q.includes('tiempo hasta ver') || q.includes('how long until') || q.includes('resultados')) {
    return es
      ? `Primeras 4 semanas: mejoras neuromusculares (más fuerza sin cambio físico visible). 8-12 semanas: cambios físicos apreciables. 6 meses: transformación notable. Recuerda: las fotos antes/después que ves en redes son 1-2 años de trabajo constante. 🗓️`
      : `First 4 weeks: neuromuscular improvements (more strength without visible physical change). 8-12 weeks: appreciable physical changes. 6 months: notable transformation. Remember: before/after photos on social media represent 1-2 years of consistent work. 🗓️`
  }
  if (q.includes('mejores ejercicios') || q.includes('best exercises')) {
    return es
      ? `Los ejercicios más efectivos son los compuestos: sentadilla, peso muerto, press banca, press militar, remo con barra y dominadas. Trabajan múltiples grupos musculares, generan más testosterona y hormona del crecimiento, y son más eficientes en tiempo. 🏋️`
      : `The most effective exercises are compound movements: squat, deadlift, bench press, overhead press, barbell row and pull-ups. They work multiple muscle groups, generate more testosterone and growth hormone, and are more time-efficient. 🏋️`
  }
  if (q.includes('suplemento') || q.includes('supplement') || q.includes('creatina') || q.includes('creatine')) {
    return es
      ? `Los suplementos con más evidencia científica: 1) Creatina monohidrato (fuerza y volumen muscular), 2) Proteína whey (conveniencia), 3) Cafeína (rendimiento), 4) Vitamina D (si hay déficit), 5) Omega-3 (antiinflamatorio). El resto tiene evidencia limitada. 💊`
      : `Supplements with the most scientific evidence: 1) Creatine monohydrate (strength & muscle volume), 2) Whey protein (convenience), 3) Caffeine (performance), 4) Vitamin D (if deficient), 5) Omega-3 (anti-inflammatory). The rest have limited evidence. 💊`
  }
  if (q.includes('creatina segura') || q.includes('creatine safe') || q.includes('es segura')) {
    return es
      ? `Sí, la creatina monohidrato es uno de los suplementos más estudiados y seguros. No daña los riñones en personas sanas, no causa calvicie (el mito del DHT está refutado) y es efectiva para aumentar fuerza y masa muscular. Dosis: 3-5g/día. ✅`
      : `Yes, creatine monohydrate is one of the most studied and safest supplements. It doesn't damage kidneys in healthy people, doesn't cause hair loss (the DHT myth is debunked) and is effective for increasing strength and muscle mass. Dose: 3-5g/day. ✅`
  }
  if (q.includes('cuándo tomar creatina') || q.includes('when to take creatine')) {
    return es
      ? `El momento de tomar creatina importa poco — lo más importante es la consistencia diaria. Si prefieres un momento específico: post-entreno con carbohidratos parece ligeramente superior. No necesitas fase de carga — 3-5g/día es suficiente desde el primer día. 💊`
      : `When you take creatine matters little — daily consistency is what's important. If you prefer a specific time: post-workout with carbs seems slightly superior. No loading phase needed — 3-5g/day is enough from day one. 💊`
  }
  if (q.includes('bcaa') || q.includes('aminoácidos')) {
    return es
      ? `Los BCAAs son útiles principalmente si entrenas en ayunas o tu ingesta de proteína total es baja. Si ya consumes suficiente proteína (>1.6g/kg), los BCAAs aportan poco beneficio adicional. El mismo efecto lo obtienes con una fuente proteica completa. 💡`
      : `BCAAs are mainly useful if you train fasted or your total protein intake is low. If you already consume enough protein (>1.6g/kg), BCAAs provide little additional benefit. You get the same effect from a complete protein source. 💡`
  }
  if (q.includes('qué suplementos básicos') || q.includes('what basic supplements')) {
    return es
      ? `Stack básico recomendado: 1) Creatina 3-5g/día, 2) Proteína whey si no llegas con comida, 3) Vitamina D3 (1000-2000 UI) especialmente en invierno, 4) Omega-3 (1-2g de EPA+DHA). Con estos cuatro cubres las bases más importantes. 📦`
      : `Recommended basic stack: 1) Creatine 3-5g/day, 2) Whey protein if you can't reach targets through food, 3) Vitamin D3 (1000-2000 IU) especially in winter, 4) Omega-3 (1-2g EPA+DHA). These four cover the most important bases. 📦`
  }

  return es
    ? `¡Hola ${ctx.name}! Hoy llevas ${ctx.calories} kcal, ${waterL}L de agua y ${ctx.workoutMinutes} min de entrenamiento. Puedo ayudarte con nutrición, rutinas, hábitos o cualquier pregunta sobre fitness. ¿En qué te ayudo? 🏋️`
    : `Hi ${ctx.name}! Today you have ${ctx.calories} kcal, ${waterL}L of water and ${ctx.workoutMinutes} min of training. I can help you with nutrition, routines, habits or any fitness question. What can I help you with? 🏋️`
}

export default function ChatbotWidget() {
  const { i18n } = useTranslation()
  const { user }   = useAuthStore()
  const { habits } = useHabitsStore()
  const { today }  = useDailyStore()

  const [open, setOpen]           = useState(false)
  const [messages, setMessages]   = useState<ChatMessage[]>([])
  const [input, setInput]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [n8nOk, setN8nOk]         = useState<boolean | null>(null)
  const [suggested, setSuggested] = useState<QuickPrompt[]>([])
  const [askedTexts, setAskedTexts] = useState<Set<string>>(new Set())
  const bottomRef = useRef<HTMLDivElement>(null)

  const lang         = i18n.language.startsWith('es') ? 'es' : 'en'
  const starters     = lang === 'es' ? STARTERS_ES     : STARTERS_EN
  const followUpsMap = lang === 'es' ? FOLLOW_UPS_ES   : FOLLOW_UPS_EN

  /* reset on open */
  useEffect(() => {
    if (open) {
      setSuggested(starters)
      setAskedTexts(new Set())
      setMessages([])
    }
  }, [open])  // eslint-disable-line

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

  const buildSuggestions = (text: string, newAsked: Set<string>): QuickPrompt[] => {
    const cat = detectCategory(text)
    const catPool = followUpsMap[cat]
    const otherPool = (Object.keys(followUpsMap) as QCategory[])
      .filter(k => k !== cat)
      .flatMap(k => followUpsMap[k])
      .sort(() => Math.random() - 0.5)
    const combined = [...catPool, ...otherPool]
    const seen = new Set<string>()
    return combined.filter(p => {
      if (newAsked.has(p.text) || seen.has(p.text)) return false
      seen.add(p.text)
      return true
    }).slice(0, 10)
  }

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return
    const userMsg: ChatMessage = { role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    setSuggested([])

    const newAsked = new Set(askedTexts).add(text)
    setAskedTexts(newAsked)

    try {
      let reply: string
      if (n8nOk) {
        const res = await n8nApi.chat(text, messages, buildContext())
        reply = res.reply ?? getDemoResponse(text, lang, buildContext())
      } else {
        await new Promise(r => setTimeout(r, 600 + Math.random() * 400))
        reply = getDemoResponse(text, lang, buildContext())
      }
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
      setSuggested(buildSuggestions(text, newAsked))
    } catch {
      await new Promise(r => setTimeout(r, 400))
      const reply = getDemoResponse(text, lang, buildContext())
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
      setSuggested(buildSuggestions(text, newAsked))
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
            className="fixed bottom-6 right-6 z-50 w-[360px] max-h-[600px] flex flex-col bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
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
                    <span className="text-[10px] text-white/40">{lang === 'es' ? 'Activo' : 'Active'}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="btn-ghost p-1.5"><X size={15} /></button>
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
              {/* Greeting */}
              <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot size={14} className="text-white" />
                </div>
                <div className="bg-[#2a2a2a] rounded-2xl rounded-tl-none px-3 py-2.5 text-sm text-white/80 max-w-[85%]">
                  {greeting}
                </div>
              </div>

              {messages.map((m, i) => (
                <div key={i} className={cn('flex gap-2.5', m.role === 'user' && 'flex-row-reverse')}>
                  <div className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5',
                    m.role === 'user' ? 'bg-brand-500/30' : 'bg-gradient-to-br from-brand-500 to-cyan-400',
                  )}>
                    {m.role === 'user'
                      ? <User size={14} className="text-brand-300" />
                      : <Bot  size={14} className="text-white" />}
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

            {/* Suggested questions — scrollable list, updates after each response */}
            {suggested.length > 0 && !loading && (
              <div className="px-3 pb-2 shrink-0">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={suggested.map(s => s.text).join('|')}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col gap-1 max-h-[220px] overflow-y-auto no-scrollbar"
                  >
                    {suggested.map(({ icon: Icon, text }) => (
                      <button
                        key={text}
                        onClick={() => sendMessage(text)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#2a2a2a] hover:bg-[#333] text-xs text-white/60 hover:text-white transition-all text-left shrink-0"
                      >
                        <Icon size={12} className="text-brand-400 shrink-0" />
                        {text}
                      </button>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>
            )}

            {/* Input */}
            <div className="px-3 py-3 border-t border-white/10 shrink-0">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) } }}
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
