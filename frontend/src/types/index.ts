// ─── USER & AUTH ─────────────────────────────────────────────────────────────
export type UserRole = 'ADMIN' | 'TRAINER' | 'CLIENT'

export interface User {
  id: string
  email: string
  username: string
  firstName: string
  lastName: string
  avatar?: string
  role: UserRole
  level: number
  xp: number
  streakDays: number
  createdAt: string
  profile?: UserProfile
}

export interface UserProfile {
  age?: number
  height?: number
  weight?: number
  gender?: 'male' | 'female' | 'other'
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
  goal?: 'lose_weight' | 'gain_muscle' | 'maintain' | 'improve_endurance'
  bodyFat?: number
  muscleMass?: number
  bmi?: number
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

// ─── HABITS ──────────────────────────────────────────────────────────────────
export interface Habit {
  id: string
  name: string
  description?: string
  icon: string
  color: string
  frequency: 'daily' | 'weekly' | 'custom'
  targetDays: number[]
  streak: number
  completedToday: boolean
  completionRate: number
  createdAt: string
}

// ─── GYM ─────────────────────────────────────────────────────────────────────
export type MuscleGroup = 'chest' | 'back' | 'shoulders' | 'arms' | 'core' | 'legs' | 'glutes' | 'cardio'
export type Difficulty   = 'beginner' | 'intermediate' | 'advanced'
export type Equipment    = 'barbell' | 'dumbbell' | 'machine' | 'bodyweight' | 'cable' | 'kettlebell' | 'bands'

export interface Exercise {
  id: string
  name: string
  description: string
  muscleGroups: MuscleGroup[]
  primaryMuscle: MuscleGroup
  difficulty: Difficulty
  equipment: Equipment[]
  gifUrl?: string
  videoUrl?: string
  instructions: string[]
  tips: string[]
}

export interface WorkoutSet {
  reps?: number
  weight?: number
  duration?: number
  distance?: number
  restSeconds: number
  completed: boolean
}

export interface WorkoutExercise {
  exercise: Exercise
  sets: WorkoutSet[]
  notes?: string
}

export interface Workout {
  id: string
  name: string
  description?: string
  difficulty: Difficulty
  estimatedDuration: number
  muscleGroups: MuscleGroup[]
  exercises: WorkoutExercise[]
  isTemplate: boolean
}

export interface WorkoutLog {
  id: string
  workoutId: string
  workout: Workout
  startedAt: string
  finishedAt?: string
  duration?: number
  totalVolume?: number
  exercises: WorkoutExercise[]
  notes?: string
}

export interface Routine {
  id: string
  name: string
  description?: string
  days: { dayOfWeek: number; workout: Workout }[]
  isActive: boolean
  createdAt: string
}

// ─── DIET ────────────────────────────────────────────────────────────────────
export interface FoodItem {
  id: string
  name: string
  barcode?: string
  brand?: string
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber?: number
  sugar?: number
  servingSize: number
  servingUnit: string
}

export interface MealEntry {
  id: string
  foodItem: FoodItem
  quantity: number
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  loggedAt: string
}

export interface DietPlan {
  id: string
  name: string
  description?: string
  targetCalories: number
  targetProtein: number
  targetCarbs: number
  targetFat: number
  meals: MealEntry[]
  startDate: string
  endDate?: string
  isActive: boolean
}

export interface BodyMeasurement {
  id: string
  date: string
  weight: number
  bodyFat?: number
  muscleMass?: number
  waist?: number
  chest?: number
  hips?: number
  arms?: number
  thighs?: number
  bmi?: number
  hydration?: number
}

// ─── PROGRESS & GAMIFICATION ─────────────────────────────────────────────────
export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  xpReward: number
  unlockedAt?: string
  isUnlocked: boolean
  category: 'fitness' | 'nutrition' | 'streak' | 'social' | 'milestone'
}

export interface Challenge {
  id: string
  name: string
  description: string
  type: 'steps' | 'workouts' | 'calories' | 'streak' | 'weight'
  target: number
  current: number
  participants: User[]
  startDate: string
  endDate: string
  status: 'pending' | 'active' | 'completed'
}

// ─── SOCIAL ──────────────────────────────────────────────────────────────────
export interface FriendRequest {
  id: string
  sender: User
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: string
}

export interface Post {
  id: string
  author: User
  content: string
  imageUrl?: string
  workoutLog?: WorkoutLog
  likes: number
  comments: number
  isLiked: boolean
  createdAt: string
}

// ─── NOTIFICATIONS ───────────────────────────────────────────────────────────
export interface Notification {
  id: string
  type: 'workout' | 'diet' | 'achievement' | 'social' | 'system'
  title: string
  message: string
  isRead: boolean
  createdAt: string
  actionUrl?: string
}

// ─── API RESPONSES ───────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiError {
  message: string
  code: string
  statusCode: number
  errors?: Record<string, string[]>
}
