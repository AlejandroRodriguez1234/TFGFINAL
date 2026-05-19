import { Zap } from 'lucide-react'

export function PageLoader() {
  return (
    <div className="fixed inset-0 bg-surface flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-cyan-400 flex items-center justify-center animate-pulse-glow">
            <Zap size={28} className="text-white" />
          </div>
          <div className="absolute inset-0 rounded-2xl border-2 border-brand-500/30 animate-ping" />
        </div>
        <p className="text-white/50 text-sm font-medium animate-pulse">Cargando FitForge...</p>
      </div>
    </div>
  )
}
