import { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, MessageCircle, Share2, Trophy, UserPlus, Zap, Users, Swords } from 'lucide-react'
import { cn } from '@utils/cn'

const feed = [
  { id: '1', user: { name: 'Carlos R.', avatar: 'CR', level: 12 }, content: '¡Nuevo PR en sentadilla! 130kg x 5 💪 Después de meses de trabajo duro', workout: { name: 'Leg Day', duration: '72 min', volume: '12,400 kg' }, likes: 24, comments: 8, liked: false, time: 'hace 2h' },
  { id: '2', user: { name: 'María L.', avatar: 'ML', level: 8 }, content: '5ª semana seguida cumpliendo mis objetivos nutricionales 🥗', likes: 18, comments: 4, liked: true, time: 'hace 4h' },
  { id: '3', user: { name: 'Juan M.', avatar: 'JM', level: 6 }, content: 'Completé mi primer 5K hoy! Tiempo: 28:32 🏃', likes: 31, comments: 12, liked: false, time: 'hace 6h' },
]

const challenges = [
  { id: '1', name: '100 Push-ups',    desc: 'Quien haga más flexiones esta semana', participants: 8, end: '3 días', leader: 'Carlos R.', myScore: 240, leaderScore: 310 },
  { id: '2', name: 'Cardio Week',     desc: 'Más minutos de cardio en 7 días',     participants: 5, end: '5 días', leader: 'María L.', myScore: 90, leaderScore: 145 },
]

const leaderboard = [
  { rank: 1, name: 'Carlos R.', avatar: 'CR', xp: 4820, level: 12, change: 0 },
  { rank: 2, name: 'María L.',  avatar: 'ML', xp: 3210, level: 8,  change: 1 },
  { rank: 3, name: 'Tú',        avatar: 'TU', xp: 2840, level: 7,  change: -1, isMe: true },
  { rank: 4, name: 'Juan M.',   avatar: 'JM', xp: 2100, level: 6,  change: 0 },
  { rank: 5, name: 'Sara P.',   avatar: 'SP', xp: 1850, level: 5,  change: 2 },
]

type Tab = 'feed' | 'challenges' | 'leaderboard'

export default function SocialPage() {
  const [tab, setTab] = useState<Tab>('feed')
  const [posts, setPosts] = useState(feed)

  const toggleLike = (id: string) => {
    setPosts((p) => p.map((post) => post.id === id ? { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 } : post))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Social</h1>
          <p className="text-white/40 text-sm mt-1">Tu comunidad fitness</p>
        </div>
        <button className="btn-primary text-sm px-4 py-2.5">
          <UserPlus size={16} /> Añadir amigo
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-surface-100 w-fit">
        {([['feed', 'Feed', Users], ['challenges', 'Retos', Swords], ['leaderboard', 'Ranking', Trophy]] as const).map(([key, label, Icon]) => (
          <button key={key} onClick={() => setTab(key)} className={cn('flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all', tab === key ? 'bg-brand-500 text-white' : 'text-white/50 hover:text-white')}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

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
                    <span className="badge badge-brand text-[10px] px-1.5">Nv.{post.user.level}</span>
                  </div>
                  <p className="text-xs text-white/40">{post.time}</p>
                </div>
              </div>
              <p className="text-sm text-white/80 mb-3 leading-relaxed">{post.content}</p>
              {post.workout && (
                <div className="p-3 rounded-xl bg-surface-100 mb-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-500/20 flex items-center justify-center shrink-0">💪</div>
                  <div>
                    <p className="text-sm font-medium">{post.workout.name}</p>
                    <p className="text-xs text-white/40">{post.workout.duration} · {post.workout.volume}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-4 text-sm text-white/50">
                <button onClick={() => toggleLike(post.id)} className={cn('flex items-center gap-1.5 hover:text-red-400 transition-colors', post.liked && 'text-red-400')}>
                  <Heart size={15} className={post.liked ? 'fill-current' : ''} /> {post.likes}
                </button>
                <button className="flex items-center gap-1.5 hover:text-brand-400 transition-colors">
                  <MessageCircle size={15} /> {post.comments}
                </button>
                <button className="flex items-center gap-1.5 hover:text-white transition-colors ml-auto">
                  <Share2 size={15} />
                </button>
              </div>
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
                  <p className="text-xs text-white/40">Termina en</p>
                  <p className="font-semibold text-brand-400 text-sm">{c.end}</p>
                </div>
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-xs text-white/40 mb-1">
                  <span>Tú: {c.myScore}</span>
                  <span>Líder ({c.leader}): {c.leaderScore}</span>
                </div>
                <div className="h-2 bg-surface-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-brand-500 to-cyan-400 rounded-full" style={{ width: `${(c.myScore / c.leaderScore) * 100}%` }} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/40">{c.participants} participantes</span>
                <button className="btn-primary text-xs px-3 py-1.5">Ver reto</button>
              </div>
            </div>
          ))}
          <button className="btn-secondary w-full py-3">
            <Swords size={16} /> Crear nuevo reto
          </button>
        </div>
      )}

      {tab === 'leaderboard' && (
        <div className="space-y-2 max-w-lg">
          {leaderboard.map((u, i) => (
            <motion.div key={u.rank} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
              className={cn('flex items-center gap-4 p-4 rounded-xl transition-all', u.isMe ? 'bg-brand-500/10 border border-brand-500/30' : 'bg-surface-100 hover:bg-surface-200')}
            >
              <span className={cn('text-lg font-bold w-6 text-center', u.rank === 1 ? 'text-yellow-400' : u.rank === 2 ? 'text-gray-300' : u.rank === 3 ? 'text-amber-600' : 'text-white/30')}>
                {u.rank === 1 ? '🥇' : u.rank === 2 ? '🥈' : u.rank === 3 ? '🥉' : u.rank}
              </span>
              <div className={cn('w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0', u.isMe ? 'bg-gradient-to-br from-brand-500 to-cyan-400' : 'bg-surface-300')}>
                {u.avatar}
              </div>
              <div className="flex-1">
                <p className={cn('font-semibold text-sm', u.isMe && 'text-brand-300')}>{u.name} {u.isMe && '(tú)'}</p>
                <p className="text-xs text-white/40">Nivel {u.level}</p>
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
    </div>
  )
}
