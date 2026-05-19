import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Heart, MessageCircle, Share2, Trophy, UserPlus, Swords, Users, X, Medal, Dumbbell, Pencil, Trash2, Send, Loader2 } from 'lucide-react'
import { cn } from '@utils/cn'
import toast from 'react-hot-toast'
import { apiClient } from '@services/api'
import { useAuthStore } from '@store/authStore'

interface RealComment {
  id: string
  postId: string
  userId: string
  username: string
  content: string
  createdAt: string
}

interface FakeComment {
  id: string
  username: string
  avatar: string
  content: string
  fake: true
}

const FAKE_COMMENTS: Record<string, FakeComment[]> = {
  '1': [
    { id: 'f1a', username: 'María L.', avatar: 'ML', content: '¡Brutal tío! Tú puedes llegar a los 140 💪', fake: true },
    { id: 'f1b', username: 'Juan M.',  avatar: 'JM', content: 'Máquina 🔥 ¿Cuánto tardaste en llegar a eso?', fake: true },
  ],
  '2': [
    { id: 'f2a', username: 'Carlos R.', avatar: 'CR', content: '¡Muy bien! La constancia es la clave 🥗', fake: true },
  ],
  '3': [
    { id: 'f3a', username: 'María L.',  avatar: 'ML', content: '¡Increíble para ser el primero! A por el sub-25 🏃', fake: true },
    { id: 'f3b', username: 'Carlos R.', avatar: 'CR', content: 'El primer 5K es especial, enhorabuena 👏', fake: true },
  ],
}

const feed = [
  { id: '1', user: { name: 'Carlos R.', avatar: 'CR', level: 12 }, content: '¡Nuevo PR en sentadilla! 130kg x 5 💪 Después de meses de trabajo duro', workout: { name: 'Leg Day', duration: '72 min', volume: '12,400 kg' }, likes: 24, liked: false, time: 'hace 2h' },
  { id: '2', user: { name: 'María L.',  avatar: 'ML', level: 8  }, content: '5ª semana seguida cumpliendo mis objetivos nutricionales 🥗', likes: 18, liked: true, time: 'hace 4h' },
  { id: '3', user: { name: 'Juan M.',   avatar: 'JM', level: 6  }, content: 'Completé mi primer 5K hoy! Tiempo: 28:32 🏃', likes: 31, liked: false, time: 'hace 6h' },
]

const challenges = [
  { id: '1', name: '100 Push-ups',  desc: 'Quien haga más flexiones esta semana', participants: 8, end: '3 días', leader: 'Carlos R.', myScore: 240, leaderScore: 310 },
  { id: '2', name: 'Cardio Week',   desc: 'Más minutos de cardio en 7 días',     participants: 5, end: '5 días', leader: 'María L.', myScore: 90,  leaderScore: 145 },
]

const leaderboard = [
  { rank: 1, name: 'Carlos R.', avatar: 'CR', xp: 4820, level: 12, change: 0 },
  { rank: 2, name: 'María L.',  avatar: 'ML', xp: 3210, level: 8,  change: 1 },
  { rank: 3, name: 'Tú',        avatar: 'TU', xp: 2840, level: 7,  change: -1, isMe: true },
  { rank: 4, name: 'Juan M.',   avatar: 'JM', xp: 2100, level: 6,  change: 0 },
  { rank: 5, name: 'Sara P.',   avatar: 'SP', xp: 1850, level: 5,  change: 2 },
]

type Tab = 'feed' | 'challenges' | 'leaderboard'

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <Trophy size={20} className="text-yellow-400" />
  if (rank === 2) return <Medal size={20} className="text-gray-300" />
  if (rank === 3) return <Medal size={20} className="text-amber-600" />
  return <span className="text-white/30 font-bold text-sm w-5 text-center">{rank}</span>
}

function AvatarInitials({ text, className }: { text: string; className?: string }) {
  return (
    <div className={cn('rounded-full bg-surface-300 flex items-center justify-center text-xs font-bold shrink-0', className)}>
      {text}
    </div>
  )
}

export default function SocialPage() {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)

  const [tab, setTab]               = useState<Tab>('feed')
  const [posts, setPosts]           = useState(feed)
  const [addFriendModal, setAddFriendModal] = useState(false)
  const [friendInput, setFriendInput] = useState('')

  // comments state keyed by postId
  const [openComments, setOpenComments]   = useState<Record<string, boolean>>({})
  const [realComments, setRealComments]   = useState<Record<string, RealComment[]>>({})
  const [loadingCmts, setLoadingCmts]     = useState<Record<string, boolean>>({})
  const [newText, setNewText]             = useState<Record<string, string>>({})
  const [submitting, setSubmitting]       = useState<Record<string, boolean>>({})
  const [editingId, setEditingId]         = useState<string | null>(null)
  const [editText, setEditText]           = useState('')

  const fetchComments = useCallback(async (postId: string) => {
    setLoadingCmts((p) => ({ ...p, [postId]: true }))
    try {
      const res = await apiClient.get<RealComment[]>(`/social/posts/${postId}/comments`)
      setRealComments((p) => ({ ...p, [postId]: res.data }))
    } catch {
      // silently ignore — fake comments still show
    } finally {
      setLoadingCmts((p) => ({ ...p, [postId]: false }))
    }
  }, [])

  const toggleComments = (postId: string) => {
    const opening = !openComments[postId]
    setOpenComments((p) => ({ ...p, [postId]: opening }))
    if (opening && realComments[postId] === undefined) fetchComments(postId)
  }

  const handleAddComment = async (postId: string) => {
    const content = (newText[postId] ?? '').trim()
    if (!content) return
    setSubmitting((p) => ({ ...p, [postId]: true }))
    try {
      const res = await apiClient.post<RealComment>(`/social/posts/${postId}/comments`, { content })
      setRealComments((p) => ({ ...p, [postId]: [...(p[postId] ?? []), res.data] }))
      setNewText((p) => ({ ...p, [postId]: '' }))
      toast.success(t('social:commentAdded'))
    } catch {
      toast.error('Error al añadir comentario')
    } finally {
      setSubmitting((p) => ({ ...p, [postId]: false }))
    }
  }

  const handleEditSave = async (postId: string, commentId: string) => {
    const content = editText.trim()
    if (!content) return
    try {
      const res = await apiClient.patch<RealComment>(`/social/posts/${postId}/comments/${commentId}`, { content })
      setRealComments((p) => ({
        ...p,
        [postId]: p[postId].map((c) => (c.id === commentId ? res.data : c)),
      }))
      setEditingId(null)
      toast.success(t('social:commentEdited'))
    } catch {
      toast.error('Error al editar comentario')
    }
  }

  const handleDelete = async (postId: string, commentId: string) => {
    try {
      await apiClient.delete(`/social/posts/${postId}/comments/${commentId}`)
      setRealComments((p) => ({
        ...p,
        [postId]: p[postId].filter((c) => c.id !== commentId),
      }))
      toast.success(t('social:commentDeleted'))
    } catch {
      toast.error('Error al eliminar comentario')
    }
  }

  const totalComments = (postId: string) =>
    (FAKE_COMMENTS[postId]?.length ?? 0) + (realComments[postId]?.length ?? 0)

  const toggleLike = (id: string) =>
    setPosts((p) => p.map((post) =>
      post.id === id ? { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 } : post
    ))

  const handleAddFriend = (e: React.FormEvent) => {
    e.preventDefault()
    setAddFriendModal(false)
    setFriendInput('')
    toast.success(t('social:requestSent'))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">{t('social:title')}</h1>
          <p className="text-white/40 text-sm mt-1">{t('social:subtitle')}</p>
        </div>
        <button onClick={() => setAddFriendModal(true)} className="btn-primary text-sm px-4 py-2.5">
          <UserPlus size={16} /> {t('social:addFriend')}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-surface-100 w-fit">
        {([['feed', t('social:tabFeed'), Users], ['challenges', t('social:tabChallenges'), Swords], ['leaderboard', t('social:tabLeaderboard'), Trophy]] as const).map(([key, label, Icon]) => (
          <button key={key} onClick={() => setTab(key)} className={cn('flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all', tab === key ? 'bg-brand-500 text-white' : 'text-white/50 hover:text-white')}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {tab === 'feed' && (
        <div className="space-y-4 max-w-xl">
          {posts.map((post, i) => (
            <motion.div key={post.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="card">
              {/* Post header */}
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-cyan-400 flex items-center justify-center text-xs font-bold shrink-0">
                  {post.user.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">{post.user.name}</p>
                    <span className="badge badge-brand text-[10px] px-1.5">{t('social:levelN', { n: post.user.level })}</span>
                  </div>
                  <p className="text-xs text-white/40">{post.time}</p>
                </div>
              </div>

              <p className="text-sm text-white/80 mb-3 leading-relaxed">{post.content}</p>

              {post.workout && (
                <div className="p-3 rounded-xl bg-surface-100 mb-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-500/20 flex items-center justify-center shrink-0">
                    <Dumbbell size={16} className="text-brand-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{post.workout.name}</p>
                    <p className="text-xs text-white/40">{post.workout.duration} · {post.workout.volume}</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-4 text-sm text-white/50">
                <button onClick={() => toggleLike(post.id)} className={cn('flex items-center gap-1.5 transition-colors hover:text-red-400', post.liked && 'text-red-400')}>
                  <Heart size={15} className={post.liked ? 'fill-current' : ''} /> {post.likes}
                </button>
                <button onClick={() => toggleComments(post.id)} className={cn('flex items-center gap-1.5 transition-colors hover:text-brand-400', openComments[post.id] && 'text-brand-400')}>
                  <MessageCircle size={15} /> {totalComments(post.id)}
                </button>
                <button className="flex items-center gap-1.5 transition-colors hover:text-white ml-auto">
                  <Share2 size={15} />
                </button>
              </div>

              {/* Comments panel */}
              <AnimatePresence>
                {openComments[post.id] && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 pt-3 border-t border-white/10 space-y-3">
                      {/* Fake comments */}
                      {(FAKE_COMMENTS[post.id] ?? []).map((c) => (
                        <div key={c.id} className="flex items-start gap-2.5">
                          <AvatarInitials text={c.avatar} className="w-7 h-7" />
                          <div className="flex-1 bg-surface-100 rounded-xl px-3 py-2">
                            <p className="text-xs font-semibold text-white/70 mb-0.5">{c.username}</p>
                            <p className="text-sm text-white/80">{c.content}</p>
                          </div>
                        </div>
                      ))}

                      {/* Real comments */}
                      {loadingCmts[post.id] ? (
                        <div className="flex justify-center py-2">
                          <Loader2 size={16} className="animate-spin text-white/30" />
                        </div>
                      ) : (realComments[post.id] ?? []).length === 0 && (FAKE_COMMENTS[post.id] ?? []).length === 0 ? (
                        <p className="text-xs text-white/30 text-center py-1">{t('social:noComments')}</p>
                      ) : (
                        (realComments[post.id] ?? []).map((c) => {
                          const isOwn = c.userId === user?.id
                          const isEditing = editingId === c.id
                          return (
                            <div key={c.id} className="flex items-start gap-2.5">
                              <AvatarInitials text={c.username.slice(0, 2).toUpperCase()} className="w-7 h-7" />
                              <div className="flex-1">
                                {isEditing ? (
                                  <div className="flex gap-2">
                                    <input
                                      autoFocus
                                      value={editText}
                                      onChange={(e) => setEditText(e.target.value)}
                                      onKeyDown={(e) => { if (e.key === 'Enter') handleEditSave(post.id, c.id) }}
                                      className="input text-sm flex-1 py-1.5"
                                    />
                                    <button onClick={() => handleEditSave(post.id, c.id)} className="btn-primary text-xs px-3 py-1.5">{t('social:saveComment')}</button>
                                    <button onClick={() => setEditingId(null)} className="btn-secondary text-xs px-2 py-1.5"><X size={12} /></button>
                                  </div>
                                ) : (
                                  <div className="bg-surface-100 rounded-xl px-3 py-2">
                                    <div className="flex items-center justify-between mb-0.5">
                                      <p className="text-xs font-semibold text-brand-400">{c.username}</p>
                                      {isOwn && (
                                        <div className="flex gap-1">
                                          <button onClick={() => { setEditingId(c.id); setEditText(c.content) }} className="text-white/30 hover:text-white/60 transition-colors p-0.5">
                                            <Pencil size={11} />
                                          </button>
                                          <button onClick={() => handleDelete(post.id, c.id)} className="text-white/30 hover:text-danger transition-colors p-0.5">
                                            <Trash2 size={11} />
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                    <p className="text-sm text-white/80">{c.content}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        })
                      )}

                      {/* Add comment input */}
                      <div className="flex gap-2 pt-1">
                        <AvatarInitials text={(user?.username ?? 'U').slice(0, 2).toUpperCase()} className="w-7 h-7 bg-brand-500/30" />
                        <div className="flex-1 flex gap-2">
                          <input
                            value={newText[post.id] ?? ''}
                            onChange={(e) => setNewText((p) => ({ ...p, [post.id]: e.target.value }))}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment(post.id) }}
                            placeholder={t('social:commentPlaceholder')}
                            className="input text-sm flex-1 py-1.5"
                          />
                          <button
                            onClick={() => handleAddComment(post.id)}
                            disabled={submitting[post.id] || !(newText[post.id] ?? '').trim()}
                            className="btn-primary px-3 py-1.5 disabled:opacity-40"
                          >
                            {submitting[post.id] ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}

      {tab === 'challenges' && (
        <div className="space-y-4 max-w-2xl">
          {challenges.map((c) => (
            <div key={c.id} className="card">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold">{c.name}</h3>
                  <p className="text-sm text-white/50 mt-0.5">{c.desc}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-white/40">{t('social:endsIn')}</p>
                  <p className="font-semibold text-brand-400 text-sm">{c.end}</p>
                </div>
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-xs text-white/40 mb-1">
                  <span>{t('social:you')}: {c.myScore}</span>
                  <span>{t('social:leader', { name: c.leader })}: {c.leaderScore}</span>
                </div>
                <div className="h-2 bg-surface-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-brand-500 to-cyan-400 rounded-full" style={{ width: `${(c.myScore / c.leaderScore) * 100}%` }} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/40">{t('social:participants', { n: c.participants })}</span>
                <div className="flex gap-2">
                  <button className="btn-secondary text-xs px-3 py-1.5">{t('social:viewChallenge')}</button>
                  <button onClick={() => toast.success(t('social:joinedChallenge'))} className="btn-primary text-xs px-3 py-1.5">{t('social:joinChallenge')}</button>
                </div>
              </div>
            </div>
          ))}
          <button className="btn-secondary w-full py-3">
            <Swords size={16} /> {t('social:createNewChallenge')}
          </button>
        </div>
      )}

      {tab === 'leaderboard' && (
        <div className="space-y-2 max-w-lg">
          {leaderboard.map((u, i) => (
            <motion.div key={u.rank} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
              className={cn('flex items-center gap-4 p-4 rounded-xl transition-all', u.isMe ? 'bg-brand-500/10 border border-brand-500/30' : 'bg-surface-100 hover:bg-surface-200')}
            >
              <div className="w-6 flex items-center justify-center shrink-0">
                <RankBadge rank={u.rank} />
              </div>
              <div className={cn('w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0', u.isMe ? 'bg-gradient-to-br from-brand-500 to-cyan-400' : 'bg-surface-300')}>
                {u.avatar}
              </div>
              <div className="flex-1">
                <p className={cn('font-semibold text-sm', u.isMe && 'text-brand-300')}>
                  {u.isMe ? t('social:you') : u.name} {u.isMe && t('social:youSelf')}
                </p>
                <p className="text-xs text-white/40">{t('social:levelN', { n: u.level })}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm text-gradient">{u.xp.toLocaleString()} XP</p>
                <p className={cn('text-xs', u.change > 0 ? 'text-success' : u.change < 0 ? 'text-danger' : 'text-white/30')}>
                  {u.change > 0 ? `↑${u.change}` : u.change < 0 ? `↓${Math.abs(u.change)}` : '='}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add friend modal */}
      {addFriendModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={() => setAddFriendModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="glass border border-white/10 rounded-2xl p-6 w-full max-w-sm"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-lg">{t('social:addFriend')}</h3>
              <button onClick={() => setAddFriendModal(false)} className="btn-ghost p-1.5">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleAddFriend} className="space-y-4">
              <div>
                <label className="text-xs text-white/40 mb-1 block">{t('social:emailOrUsername')}</label>
                <input
                  required
                  value={friendInput}
                  onChange={(e) => setFriendInput(e.target.value)}
                  placeholder="usuario@email.com o @username"
                  className="input text-sm"
                />
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setAddFriendModal(false)} className="btn-secondary flex-1 text-sm">
                  {t('common:cancel')}
                </button>
                <button type="submit" className="btn-primary flex-1 text-sm">
                  <UserPlus size={15} /> {t('social:addFriend')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
