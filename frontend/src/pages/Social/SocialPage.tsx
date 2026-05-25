import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  Heart, MessageCircle, Share2, Trophy, UserPlus, Swords, Users, X, Medal,
  Dumbbell, Send, Plus, Target, Calendar, Flame, TrendingUp, Check,
} from 'lucide-react'
import { cn } from '@utils/cn'
import toast from 'react-hot-toast'

interface Comment {
  id: string
  username: string
  avatar: string
  content: string
  time: string
}

interface Post {
  id: string
  user: { name: string; avatar: string; level: number }
  content: string
  workout?: { name: string; duration: string; volume: string }
  likes: number
  liked: boolean
  time: string
  comments: Comment[]
}

interface Challenge {
  id: string
  name: string
  desc: string
  type: 'reps' | 'time' | 'weight' | 'distance'
  participants: number
  end: string
  daysLeft: number
  leader: string
  leaderScore: number
  myScore: number
  unit: string
  joined: boolean
}

const INITIAL_POSTS: Post[] = [
  {
    id: '1',
    user: { name: 'Carlos R.', avatar: 'CR', level: 12 },
    content: '¡Nuevo PR en sentadilla! 130 kg x 5 reps. Después de meses de trabajo duro, por fin lo conseguí. El proceso es largo pero los resultados llegan.',
    workout: { name: 'Leg Day', duration: '72 min', volume: '12,400 kg' },
    likes: 24, liked: false, time: 'hace 2h',
    comments: [
      { id: 'c1', username: 'María L.', avatar: 'ML', content: '¡Brutal! Seguro llegas a los 140 en poco tiempo.', time: 'hace 1h' },
      { id: 'c2', username: 'Juan M.', avatar: 'JM', content: 'Eres una máquina. ¿Cuánto tardaste en llegar a eso?', time: 'hace 45m' },
    ],
  },
  {
    id: '2',
    user: { name: 'María L.', avatar: 'ML', level: 8 },
    content: '5ª semana seguida cumpliendo mis objetivos nutricionales. La constancia da sus frutos. Hoy: 1.820 kcal, 142g proteína, todo en verde.',
    likes: 18, liked: true, time: 'hace 4h',
    comments: [
      { id: 'c3', username: 'Carlos R.', avatar: 'CR', content: '¡Muy bien! La constancia es la clave.', time: 'hace 3h' },
    ],
  },
  {
    id: '3',
    user: { name: 'Juan M.', avatar: 'JM', level: 6 },
    content: 'Completé mi primer 5K hoy. Tiempo: 28:32. Muy contento con el resultado para ser el primero. ¡A por el sub-25!',
    likes: 31, liked: false, time: 'hace 6h',
    comments: [
      { id: 'c4', username: 'María L.', avatar: 'ML', content: '¡Increíble para ser el primero! A por el sub-25.', time: 'hace 5h' },
      { id: 'c5', username: 'Carlos R.', avatar: 'CR', content: 'El primer 5K es especial, enhorabuena.', time: 'hace 4h' },
    ],
  },
  {
    id: '4',
    user: { name: 'Sara P.', avatar: 'SP', level: 5 },
    content: 'Primera semana con el plan de tonificación completada al 100%. Empiezo a notar cambios. La dieta es la parte más difícil pero vale la pena.',
    likes: 15, liked: false, time: 'hace 8h',
    comments: [],
  },
]

const INITIAL_CHALLENGES: Challenge[] = [
  {
    id: '1', name: '100 Push-ups', desc: 'Quien haga más flexiones esta semana gana',
    type: 'reps', participants: 8, end: '3 días', daysLeft: 3,
    leader: 'Carlos R.', leaderScore: 310, myScore: 240, unit: 'reps', joined: true,
  },
  {
    id: '2', name: 'Cardio Week', desc: 'Más minutos de cardio en 7 días',
    type: 'time', participants: 5, end: '5 días', daysLeft: 5,
    leader: 'María L.', leaderScore: 145, myScore: 90, unit: 'min', joined: true,
  },
  {
    id: '3', name: 'Peso muerto PR', desc: 'Mayor peso en peso muerto en 2 semanas',
    type: 'weight', participants: 4, end: '11 días', daysLeft: 11,
    leader: 'Juan M.', leaderScore: 140, myScore: 0, unit: 'kg', joined: false,
  },
  {
    id: '4', name: 'Pasos diarios', desc: 'Promedio de pasos diarios en 5 días',
    type: 'distance', participants: 6, end: '4 días', daysLeft: 4,
    leader: 'Sara P.', leaderScore: 12400, myScore: 0, unit: 'pasos', joined: false,
  },
]

const leaderboard = [
  { rank: 1, name: 'Carlos R.', avatar: 'CR', xp: 4820, level: 12, change: 0  },
  { rank: 2, name: 'María L.',  avatar: 'ML', xp: 3210, level: 8,  change: 1  },
  { rank: 3, name: 'Tú',        avatar: 'TU', xp: 2840, level: 7,  change: -1, isMe: true },
  { rank: 4, name: 'Juan M.',   avatar: 'JM', xp: 2100, level: 6,  change: 0  },
  { rank: 5, name: 'Sara P.',   avatar: 'SP', xp: 1850, level: 5,  change: 2  },
  { rank: 6, name: 'Pedro G.',  avatar: 'PG', xp: 1420, level: 4,  change: -1 },
  { rank: 7, name: 'Laura S.',  avatar: 'LS', xp: 980,  level: 3,  change: 1  },
]

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <Trophy size={20} className="text-yellow-400" />
  if (rank === 2) return <Medal size={20} className="text-gray-300" />
  if (rank === 3) return <Medal size={20} className="text-amber-600" />
  return <span className="text-white/30 font-bold text-sm w-5 text-center">{rank}</span>
}

type Tab = 'feed' | 'challenges' | 'leaderboard'

export default function SocialPage() {
  const { t } = useTranslation()

  const [tab, setTab]               = useState<Tab>('feed')
  const [posts, setPosts]           = useState<Post[]>(INITIAL_POSTS)
  const [challenges, setChallenges] = useState<Challenge[]>(INITIAL_CHALLENGES)
  const [addFriendModal, setAddFriendModal] = useState(false)
  const [friendInput, setFriendInput] = useState('')
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({})
  const [newText, setNewText]       = useState<Record<string, string>>({})
  const [viewChallenge, setViewChallenge] = useState<Challenge | null>(null)
  const [createModal, setCreateModal] = useState(false)

  // Create challenge form state
  const [cName, setCName]   = useState('')
  const [cDesc, setCDesc]   = useState('')
  const [cType, setCType]   = useState<Challenge['type']>('reps')
  const [cDays, setCDays]   = useState('7')
  const [cTarget, setCTarget] = useState('')

  const toggleLike = (id: string) =>
    setPosts(p => p.map(post =>
      post.id === id ? { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 } : post
    ))

  const toggleComments = (postId: string) =>
    setOpenComments(p => ({ ...p, [postId]: !p[postId] }))

  const handleAddComment = (postId: string) => {
    const content = (newText[postId] ?? '').trim()
    if (!content) return
    const newComment: Comment = {
      id: crypto.randomUUID(),
      username: 'Tú',
      avatar: 'TU',
      content,
      time: 'ahora',
    }
    setPosts(p => p.map(post =>
      post.id === postId ? { ...post, comments: [...post.comments, newComment] } : post
    ))
    setNewText(p => ({ ...p, [postId]: '' }))
    toast.success(t('social:commentAdded'))
  }

  const handleJoin = (challengeId: string) => {
    setChallenges(prev => prev.map(c =>
      c.id === challengeId
        ? { ...c, joined: true, participants: c.joined ? c.participants : c.participants + 1, myScore: c.myScore > 0 ? c.myScore : Math.floor(c.leaderScore * 0.3) }
        : c
    ))
    toast.success(t('social:joinedChallenge'))
  }

  const handleCreateChallenge = (e: React.FormEvent) => {
    e.preventDefault()
    const newChallenge: Challenge = {
      id: crypto.randomUUID(),
      name: cName,
      desc: cDesc,
      type: cType,
      participants: 1,
      end: `${cDays} días`,
      daysLeft: parseInt(cDays),
      leader: 'Tú',
      leaderScore: parseInt(cTarget) || 0,
      myScore: 0,
      unit: cType === 'reps' ? 'reps' : cType === 'time' ? 'min' : cType === 'weight' ? 'kg' : 'pasos',
      joined: true,
    }
    setChallenges(prev => [newChallenge, ...prev])
    setCreateModal(false)
    setCName(''); setCDesc(''); setCType('reps'); setCDays('7'); setCTarget('')
    toast.success('¡Reto creado! Ya puedes invitar a tus amigos.')
  }

  const handleAddFriend = (e: React.FormEvent) => {
    e.preventDefault()
    setAddFriendModal(false)
    setFriendInput('')
    toast.success(t('social:requestSent'))
  }

  const typeLabel: Record<Challenge['type'], string> = {
    reps: 'Repeticiones', time: 'Tiempo', weight: 'Peso', distance: 'Distancia',
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
          <button key={key} onClick={() => setTab(key)}
            className={cn('flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              tab === key ? 'bg-brand-500 text-white' : 'text-white/50 hover:text-white')}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* FEED */}
      {tab === 'feed' && (
        <div className="space-y-4 max-w-xl">
          {posts.map((post, i) => (
            <motion.div key={post.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="card">
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

              <div className="flex items-center gap-4 text-sm text-white/50">
                <button onClick={() => toggleLike(post.id)} className={cn('flex items-center gap-1.5 transition-colors hover:text-red-400', post.liked && 'text-red-400')}>
                  <Heart size={15} className={post.liked ? 'fill-current' : ''} /> {post.likes}
                </button>
                <button onClick={() => toggleComments(post.id)} className={cn('flex items-center gap-1.5 transition-colors hover:text-brand-400', openComments[post.id] && 'text-brand-400')}>
                  <MessageCircle size={15} /> {post.comments.length}
                </button>
                <button className="flex items-center gap-1.5 transition-colors hover:text-white ml-auto">
                  <Share2 size={15} />
                </button>
              </div>

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
                      {post.comments.map(c => (
                        <div key={c.id} className="flex items-start gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-surface-300 flex items-center justify-center text-xs font-bold shrink-0">{c.avatar}</div>
                          <div className="flex-1 bg-surface-100 rounded-xl px-3 py-2">
                            <p className="text-xs font-semibold text-white/70 mb-0.5">{c.username}</p>
                            <p className="text-sm text-white/80">{c.content}</p>
                          </div>
                        </div>
                      ))}
                      {post.comments.length === 0 && (
                        <p className="text-xs text-white/30 text-center py-1">{t('social:noComments')}</p>
                      )}
                      <div className="flex gap-2 pt-1">
                        <div className="w-7 h-7 rounded-full bg-brand-500/30 flex items-center justify-center text-xs font-bold shrink-0">TU</div>
                        <div className="flex-1 flex gap-2">
                          <input
                            value={newText[post.id] ?? ''}
                            onChange={e => setNewText(p => ({ ...p, [post.id]: e.target.value }))}
                            onKeyDown={e => { if (e.key === 'Enter') handleAddComment(post.id) }}
                            placeholder={t('social:commentPlaceholder')}
                            className="input text-sm flex-1 py-1.5"
                          />
                          <button
                            onClick={() => handleAddComment(post.id)}
                            disabled={!(newText[post.id] ?? '').trim()}
                            className="btn-primary px-3 py-1.5 disabled:opacity-40"
                          >
                            <Send size={14} />
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

      {/* CHALLENGES */}
      {tab === 'challenges' && (
        <div className="space-y-4 max-w-2xl">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Retos activos',   value: challenges.filter(c => c.joined).length, color: 'text-brand-400',  bg: 'bg-brand-500/10',  icon: Swords },
              { label: 'Participantes',   value: challenges.reduce((a, c) => a + c.participants, 0), color: 'text-green-400', bg: 'bg-green-500/10', icon: Users  },
            ].map(({ label, value, color, bg, icon: Icon }) => (
              <div key={label} className="card flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                  <Icon size={18} className={color} />
                </div>
                <div>
                  <p className={`text-xl font-bold ${color}`}>{value}</p>
                  <p className="text-xs text-white/40">{label}</p>
                </div>
              </div>
            ))}
          </div>

          {challenges.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="card">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-semibold">{c.name}</h3>
                    {c.joined && <span className="badge badge-brand text-[10px] px-1.5">Unido</span>}
                  </div>
                  <p className="text-sm text-white/50">{c.desc}</p>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p className="text-xs text-white/40">{t('social:endsIn')}</p>
                  <p className="font-semibold text-brand-400 text-sm">{c.end}</p>
                </div>
              </div>

              {c.joined && c.myScore > 0 && (
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-white/40 mb-1">
                    <span>{t('social:you')}: {c.myScore} {c.unit}</span>
                    <span>{t('social:leader', { name: c.leader })}: {c.leaderScore} {c.unit}</span>
                  </div>
                  <div className="h-2 bg-surface-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-brand-500 to-cyan-400 rounded-full transition-all" style={{ width: `${Math.min(100, (c.myScore / c.leaderScore) * 100)}%` }} />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-xs text-white/40">{t('social:participants', { n: c.participants })} · {typeLabel[c.type]}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewChallenge(c)}
                    className="btn-secondary text-xs px-3 py-1.5"
                  >
                    {t('social:viewChallenge')}
                  </button>
                  {!c.joined && (
                    <button onClick={() => handleJoin(c.id)} className="btn-primary text-xs px-3 py-1.5">
                      {t('social:joinChallenge')}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          <button onClick={() => setCreateModal(true)} className="btn-secondary w-full py-3">
            <Plus size={16} /> {t('social:createNewChallenge')}
          </button>
        </div>
      )}

      {/* LEADERBOARD */}
      {tab === 'leaderboard' && (
        <div className="space-y-2 max-w-lg">
          <div className="card mb-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center shrink-0">
              <TrendingUp size={18} className="text-brand-400" />
            </div>
            <div>
              <p className="font-semibold text-sm">Tu posición: #3</p>
              <p className="text-xs text-white/40">2.840 XP esta semana · sube 1 posición</p>
            </div>
          </div>

          {leaderboard.map((u, i) => (
            <motion.div key={u.rank} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
              className={cn('flex items-center gap-4 p-4 rounded-xl transition-all', (u as any).isMe ? 'bg-brand-500/10 border border-brand-500/30' : 'bg-surface-100 hover:bg-surface-200')}
            >
              <div className="w-6 flex items-center justify-center shrink-0">
                <RankBadge rank={u.rank} />
              </div>
              <div className={cn('w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0', (u as any).isMe ? 'bg-gradient-to-br from-brand-500 to-cyan-400' : 'bg-surface-300')}>
                {u.avatar}
              </div>
              <div className="flex-1">
                <p className={cn('font-semibold text-sm', (u as any).isMe && 'text-brand-300')}>
                  {(u as any).isMe ? `${t('social:you')} ${t('social:youSelf')}` : u.name}
                </p>
                <p className="text-xs text-white/40">{t('social:levelN', { n: u.level })}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm text-brand-400">{u.xp.toLocaleString()} XP</p>
                <p className={cn('text-xs', u.change > 0 ? 'text-success' : u.change < 0 ? 'text-danger' : 'text-white/30')}>
                  {u.change > 0 ? `↑${u.change}` : u.change < 0 ? `↓${Math.abs(u.change)}` : '='}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Challenge detail modal */}
      {viewChallenge && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={() => setViewChallenge(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            onClick={e => e.stopPropagation()}
            className="glass border border-white/10 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center">
                  <Swords size={18} className="text-brand-400" />
                </div>
                <div>
                  <h3 className="font-semibold">{viewChallenge.name}</h3>
                  <p className="text-xs text-white/40">{viewChallenge.desc}</p>
                </div>
              </div>
              <button onClick={() => setViewChallenge(null)} className="btn-ghost p-1.5"><X size={16} /></button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { label: 'Participantes', value: viewChallenge.participants, icon: Users, color: 'text-brand-400' },
                { label: 'Días restantes', value: viewChallenge.daysLeft, icon: Calendar, color: 'text-orange-400' },
                { label: 'Tu puntuación', value: viewChallenge.myScore > 0 ? `${viewChallenge.myScore}` : '—', icon: Target, color: 'text-green-400' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="text-center p-3 bg-surface-100 rounded-xl">
                  <Icon size={16} className={cn(color, 'mx-auto mb-1')} />
                  <p className={cn('text-lg font-bold', color)}>{value}</p>
                  <p className="text-[10px] text-white/40">{label}</p>
                </div>
              ))}
            </div>

            {/* Progress */}
            {viewChallenge.joined && viewChallenge.myScore > 0 && (
              <div className="mb-5 p-3 rounded-xl bg-surface-100">
                <p className="text-xs text-white/40 mb-2">Tu progreso vs líder</p>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-brand-400">Tú: {viewChallenge.myScore} {viewChallenge.unit}</span>
                  <span className="text-yellow-400">{viewChallenge.leader}: {viewChallenge.leaderScore} {viewChallenge.unit}</span>
                </div>
                <div className="h-3 bg-surface-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-brand-500 to-cyan-400 rounded-full" style={{ width: `${(viewChallenge.myScore / viewChallenge.leaderScore) * 100}%` }} />
                </div>
                <p className="text-xs text-white/30 mt-1">
                  Te faltan {viewChallenge.leaderScore - viewChallenge.myScore} {viewChallenge.unit} para superar al líder
                </p>
              </div>
            )}

            {/* Leaderboard */}
            <div className="mb-5">
              <p className="text-xs text-white/40 mb-2 uppercase tracking-wide">Clasificación</p>
              <div className="space-y-2">
                {[
                  { pos: 1, name: viewChallenge.leader, score: viewChallenge.leaderScore, isLeader: true },
                  { pos: 2, name: 'Juan M.', score: Math.round(viewChallenge.leaderScore * 0.85), isLeader: false },
                  { pos: 3, name: 'Tú', score: viewChallenge.myScore > 0 ? viewChallenge.myScore : Math.round(viewChallenge.leaderScore * 0.7), isLeader: false, isMe: true },
                  { pos: 4, name: 'Sara P.', score: Math.round(viewChallenge.leaderScore * 0.55), isLeader: false },
                ].map(({ pos, name, score, isMe }) => (
                  <div key={pos} className={cn('flex items-center gap-3 p-2.5 rounded-xl', isMe ? 'bg-brand-500/10 border border-brand-500/20' : 'bg-surface-100')}>
                    <span className="w-6 text-center text-sm font-bold text-white/40">#{pos}</span>
                    <div className={cn('w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold', isMe ? 'bg-brand-500' : 'bg-surface-300')}>
                      {name.slice(0, 2).toUpperCase()}
                    </div>
                    <p className={cn('flex-1 text-sm font-medium', isMe && 'text-brand-300')}>{name}{isMe && ' (tú)'}</p>
                    <p className="text-sm font-bold text-white/70">{score} {viewChallenge.unit}</p>
                  </div>
                ))}
              </div>
            </div>

            {!viewChallenge.joined ? (
              <button onClick={() => { handleJoin(viewChallenge.id); setViewChallenge(null) }} className="btn-primary w-full">
                <Check size={15} /> Unirse al reto
              </button>
            ) : (
              <div className="p-3 rounded-xl bg-success/10 border border-success/20 flex items-center gap-2">
                <Check size={15} className="text-success" />
                <p className="text-sm text-success">Ya participas en este reto</p>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Create challenge modal */}
      {createModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={() => setCreateModal(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            onClick={e => e.stopPropagation()}
            className="glass border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Swords size={18} className="text-brand-400" />
                <h3 className="font-semibold">Crear nuevo reto</h3>
              </div>
              <button onClick={() => setCreateModal(false)} className="btn-ghost p-1.5"><X size={16} /></button>
            </div>
            <form onSubmit={handleCreateChallenge} className="space-y-4">
              <div>
                <label className="text-xs text-white/40 mb-1 block">Nombre del reto</label>
                <input required value={cName} onChange={e => setCName(e.target.value)}
                  placeholder="Ej. 200 dominadas" className="input text-sm" />
              </div>
              <div>
                <label className="text-xs text-white/40 mb-1 block">Descripción</label>
                <input required value={cDesc} onChange={e => setCDesc(e.target.value)}
                  placeholder="Ej. Quien haga más dominadas en una semana" className="input text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/40 mb-1 block">Tipo</label>
                  <select value={cType} onChange={e => setCType(e.target.value as Challenge['type'])}
                    className="input text-sm" style={{ colorScheme: 'dark' }}>
                    <option value="reps">Repeticiones</option>
                    <option value="time">Tiempo (min)</option>
                    <option value="weight">Peso (kg)</option>
                    <option value="distance">Distancia (pasos)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1 block">Duración (días)</label>
                  <input required type="number" min="1" max="30" value={cDays}
                    onChange={e => setCDays(e.target.value)} placeholder="7" className="input text-sm" />
                </div>
              </div>
              <div>
                <label className="text-xs text-white/40 mb-1 block">Objetivo inicial (tu marca)</label>
                <input type="number" min="0" value={cTarget}
                  onChange={e => setCTarget(e.target.value)} placeholder="0" className="input text-sm" />
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setCreateModal(false)} className="btn-secondary flex-1 text-sm">Cancelar</button>
                <button type="submit" className="btn-primary flex-1 text-sm"><Plus size={15} /> Crear reto</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Add friend modal */}
      {addFriendModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={() => setAddFriendModal(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            onClick={e => e.stopPropagation()}
            className="glass border border-white/10 rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-lg">{t('social:addFriend')}</h3>
              <button onClick={() => setAddFriendModal(false)} className="btn-ghost p-1.5"><X size={16} /></button>
            </div>
            <form onSubmit={handleAddFriend} className="space-y-4">
              <div>
                <label className="text-xs text-white/40 mb-1 block">{t('social:emailOrUsername')}</label>
                <input required value={friendInput} onChange={e => setFriendInput(e.target.value)}
                  placeholder="usuario@email.com o @username" className="input text-sm" />
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setAddFriendModal(false)} className="btn-secondary flex-1 text-sm">{t('common:cancel')}</button>
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
