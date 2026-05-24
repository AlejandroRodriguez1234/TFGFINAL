import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@store/authStore'
import { useHabitsStore } from '@store/habitsStore'
import { useDailyStore } from '@store/dailyStore'
import { cn } from '@utils/cn'
import { motion } from 'framer-motion'
import { Edit, Dumbbell, Flame, Trophy, Zap, Calendar, X, Save } from 'lucide-react'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { t } = useTranslation()
  const { user, setUser } = useAuthStore()
  const { habits } = useHabitsStore()
  const { weekHistory, today } = useDailyStore()

  const [editModal, setEditModal] = useState(false)
  const [editFirst, setEditFirst] = useState(user?.firstName ?? '')
  const [editLast,  setEditLast]  = useState(user?.lastName  ?? '')
  const [editUser,  setEditUser]  = useState(user?.username  ?? '')
  const [editBio,   setEditBio]   = useState('')

  const totalWorkouts = weekHistory.filter((d) => d.workoutMinutes > 0).length + (today.workoutMinutes > 0 ? 1 : 0)
  const totalCalories = Math.round((weekHistory.reduce((a, d) => a + d.calories, 0) + today.calories) / 1000)
  const activeDays    = weekHistory.filter((d) => d.exercisesCompleted > 0 || d.workoutMinutes > 0).length
  const habitsStreak  = habits.length > 0 ? Math.max(...habits.map((h) => h.streak)) : 0

  const radarData = [
    { subject: 'Fuerza',       A: Math.min(100, 60 + totalWorkouts * 2) },
    { subject: 'Resistencia',  A: Math.min(100, 50 + activeDays * 5) },
    { subject: 'Nutrición',    A: Math.min(100, 70 + totalCalories) },
    { subject: 'Flexibilidad', A: 55 },
    { subject: 'Hábitos',      A: Math.min(100, habitsStreak * 5 + 40) },
    { subject: 'Social',       A: 60 },
  ]

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setUser({
      ...user,
      firstName: editFirst.trim() || user.firstName,
      lastName:  editLast.trim()  || user.lastName,
      username:  editUser.trim()  || user.username,
    })
    setEditModal(false)
    toast.success(t('profile:profileUpdated'))
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Cover + avatar */}
      <div className="card p-0 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-brand-600 via-brand-500 to-cyan-400" />
        <div className="px-6 pb-6 -mt-12">
          <div className="flex items-end justify-between">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-cyan-400 flex items-center justify-center text-3xl font-bold border-4 border-surface-50">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-success border-2 border-surface-50" />
            </div>
            <button onClick={() => setEditModal(true)} className="btn-secondary text-sm px-3 py-2 mt-12">
              <Edit size={14} /> {t('profile:editProfile')}
            </button>
          </div>
          <div className="mt-4">
            <h1 className="text-2xl font-bold">{user?.firstName} {user?.lastName}</h1>
            <p className="text-white/50 text-sm">@{user?.username}</p>
            {editBio && <p className="text-white/60 text-sm mt-2">{editBio}</p>}
            <div className="flex items-center gap-3 mt-3">
              <span className="badge badge-brand">{t('profile:levelN', { n: user?.level ?? 1 })}</span>
              {user?.role === 'ADMIN' && <span className="badge badge-danger">{t('profile:adminBadge')}</span>}
              <span className="text-xs text-white/40">{t('profile:memberSince')} {new Date(user?.createdAt ?? '').getFullYear()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Stats */}
        <div className="card">
          <h2 className="font-semibold mb-4">{t('profile:globalStats')}</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Dumbbell, label: t('profile:workouts'),  value: String(totalWorkouts || 1),       color: 'text-brand-400'  },
              { icon: Flame,    label: t('profile:caloriesK'), value: `${totalCalories || 12}K`,         color: 'text-orange-400' },
              { icon: Trophy,   label: t('profile:bestStreak'),value: t('profile:streakDays', { n: habitsStreak }), color: 'text-yellow-400' },
              { icon: Calendar, label: t('profile:activeDays'),value: String(activeDays || 5),          color: 'text-green-400'  },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="text-center p-3 rounded-xl bg-surface-100">
                <Icon size={20} className={cn(color, 'mx-auto mb-1')} />
                <p className="text-xl font-bold">{value}</p>
                <p className="text-xs text-white/40 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Fitness radar */}
        <div className="card">
          <h2 className="font-semibold mb-2">{t('profile:fitnessProfile')}</h2>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#2e2e2e" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#ffffff60', fontSize: 11 }} />
              <Radar name="Tú" dataKey="A" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* XP timeline */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">{t('profile:levelProgress')}</h2>
          <span className="badge badge-brand">{t('profile:totalXP', { n: user?.xp ?? 0 })}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand-500 to-cyan-400 flex items-center justify-center shrink-0">
            <Zap size={24} className="text-white" />
          </div>
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-semibold">{t('profile:levelN', { n: user?.level ?? 1 })}</span>
              <span className="text-white/40">{t('profile:xpToNext', { xp: (user?.xp ?? 0) % 1000, lvl: (user?.level ?? 1) + 1 })}</span>
            </div>
            <div className="h-3 bg-surface-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${((user?.xp ?? 0) % 1000) / 10}%` }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-brand-500 to-cyan-400 rounded-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Edit profile modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={() => setEditModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="glass border border-white/10 rounded-2xl p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-lg">{t('profile:editProfile')}</h3>
              <button onClick={() => setEditModal(false)} className="btn-ghost p-1.5">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/40 mb-1 block">{t('auth:firstName')}</label>
                  <input
                    value={editFirst}
                    onChange={(e) => setEditFirst(e.target.value)}
                    placeholder={t('auth:firstName')}
                    className="input text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1 block">{t('auth:lastName')}</label>
                  <input
                    value={editLast}
                    onChange={(e) => setEditLast(e.target.value)}
                    placeholder={t('auth:lastName')}
                    className="input text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-white/40 mb-1 block">{t('auth:username')}</label>
                <input
                  value={editUser}
                  onChange={(e) => setEditUser(e.target.value)}
                  placeholder={t('auth:username')}
                  className="input text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-white/40 mb-1 block">{t('profile:bio')}</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder={t('profile:bioPlaceholder')}
                  rows={2}
                  className="input text-sm resize-none"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setEditModal(false)} className="btn-secondary flex-1 text-sm">
                  {t('common:cancel')}
                </button>
                <button type="submit" className="btn-primary flex-1 text-sm">
                  <Save size={15} /> {t('common:saveChanges')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
