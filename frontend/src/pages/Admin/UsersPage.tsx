import { useState } from 'react'
import { Search, Filter, MoreVertical, UserX, Shield, Edit, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@utils/cn'

type Role = 'ALL' | 'ADMIN' | 'TRAINER' | 'CLIENT'

const users = Array.from({ length: 20 }, (_, i) => ({
  id: `u${i + 1}`,
  name: ['Ana García', 'Carlos Ruiz', 'María López', 'Juan Martínez', 'Sara Pérez'][i % 5],
  email: `user${i + 1}@fitforge.app`,
  role: (['CLIENT', 'CLIENT', 'TRAINER', 'CLIENT', 'ADMIN'] as const)[i % 5],
  joined: `${i + 1} Abr 2025`,
  workouts: Math.floor(Math.random() * 100),
  status: i % 7 === 0 ? 'inactive' : 'active',
}))

const roleColors: Record<string, string> = {
  ADMIN: 'badge-danger', TRAINER: 'badge-warning', CLIENT: 'badge-brand',
}

export default function UsersPage() {
  const [search, setSearch]   = useState('')
  const [roleFilter, setRole] = useState<Role>('ALL')
  const [page, setPage]       = useState(1)
  const perPage = 10

  const filtered = users.filter(
    (u) =>
      (roleFilter === 'ALL' || u.role === roleFilter) &&
      (u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())),
  )
  const paginated  = filtered.slice((page - 1) * perPage, page * perPage)
  const totalPages = Math.ceil(filtered.length / perPage)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Gestión de usuarios</h1>
          <p className="text-white/40 text-sm mt-1">{filtered.length} usuarios encontrados</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar usuario..." className="input pl-9" />
        </div>
        <div className="flex gap-2">
          {(['ALL', 'ADMIN', 'TRAINER', 'CLIENT'] as const).map((r) => (
            <button key={r} onClick={() => { setRole(r); setPage(1) }}
              className={cn('px-3 py-2 rounded-lg text-xs font-medium transition-all border', roleFilter === r ? 'bg-brand-500 border-brand-500 text-white' : 'glass border-white/10 text-white/50 hover:text-white')}
            >
              {r === 'ALL' ? 'Todos' : r}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left p-4 text-white/40 font-medium">Usuario</th>
              <th className="text-left p-4 text-white/40 font-medium hidden md:table-cell">Rol</th>
              <th className="text-left p-4 text-white/40 font-medium hidden lg:table-cell">Registro</th>
              <th className="text-left p-4 text-white/40 font-medium hidden lg:table-cell">Entrenos</th>
              <th className="text-left p-4 text-white/40 font-medium">Estado</th>
              <th className="p-4" />
            </tr>
          </thead>
          <tbody>
            {paginated.map((u) => (
              <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-cyan-400 flex items-center justify-center text-xs font-bold shrink-0">
                      {u.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-medium">{u.name}</p>
                      <p className="text-xs text-white/40">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 hidden md:table-cell">
                  <span className={cn('badge', roleColors[u.role])}>{u.role}</span>
                </td>
                <td className="p-4 text-white/50 hidden lg:table-cell">{u.joined}</td>
                <td className="p-4 text-white/50 hidden lg:table-cell">{u.workouts}</td>
                <td className="p-4">
                  <div className={cn('flex items-center gap-1.5 text-xs', u.status === 'active' ? 'text-success' : 'text-white/30')}>
                    <div className={cn('w-1.5 h-1.5 rounded-full', u.status === 'active' ? 'bg-success' : 'bg-white/20')} />
                    {u.status === 'active' ? 'Activo' : 'Inactivo'}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1 justify-end">
                    <button className="btn-ghost p-1.5"><Edit size={13} /></button>
                    <button className="btn-ghost p-1.5 text-danger hover:bg-danger/10"><UserX size={13} /></button>
                    <button className="btn-ghost p-1.5"><MoreVertical size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-white/5">
          <p className="text-xs text-white/40">
            Mostrando {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} de {filtered.length}
          </p>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(page - 1)} disabled={page === 1} className="btn-ghost p-2 disabled:opacity-30">
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm text-white/60 w-16 text-center">{page} / {totalPages}</span>
            <button onClick={() => setPage(page + 1)} disabled={page === totalPages} className="btn-ghost p-2 disabled:opacity-30">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
