/**
 * n8n API service — calls the local n8n webhook for AI features.
 * Default URL: http://localhost:5678/webhook/fitforge
 * Change N8N_WEBHOOK_URL if your n8n runs elsewhere.
 */

const N8N_WEBHOOK_URL =
  (import.meta as any).env?.VITE_N8N_WEBHOOK_URL ||
  'http://localhost:5678/webhook/fitforge'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface UserContext {
  name: string
  level: number
  calories: number
  caloriesTarget: number
  waterMl: number
  workoutMinutes: number
  habitsCompleted: number
  habitsTotal: number
  language: string
}

export interface ChatRequest {
  type: 'chat'
  message: string
  history: ChatMessage[]
  context: UserContext
}

export interface PhotoAnalysisRequest {
  type: 'food_analysis'
  image_base64: string
  language: string
}

export interface FoodAnalysisResult {
  food_name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  serving_size: number
  confidence: 'high' | 'medium' | 'low'
  description: string
}

export interface N8NResponse {
  reply?: string
  analysis?: FoodAnalysisResult
  error?: string
}

async function callN8N(body: ChatRequest | PhotoAnalysisRequest): Promise<N8NResponse> {
  const res = await fetch(N8N_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`n8n error: ${res.status}`)
  return res.json()
}

export const n8nApi = {
  chat: (message: string, history: ChatMessage[], context: UserContext) =>
    callN8N({ type: 'chat', message, history, context }),

  analyzeFood: (imageBase64: string, language = 'es') =>
    callN8N({ type: 'food_analysis', image_base64: imageBase64, language }),
}