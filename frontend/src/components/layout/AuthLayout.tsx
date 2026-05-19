import { Outlet } from 'react-router-dom'
import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { Zap } from 'lucide-react'

export default function AuthLayout() {
  const bgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to('.auth-orb-1', {
        x: 40, y: -30,
        duration: 6, ease: 'sine.inOut',
        yoyo: true, repeat: -1,
      })
      gsap.to('.auth-orb-2', {
        x: -30, y: 40,
        duration: 8, ease: 'sine.inOut',
        yoyo: true, repeat: -1,
        delay: 2,
      })
    }, bgRef)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={bgRef} className="min-h-screen flex bg-surface overflow-hidden">
      {/* Left panel - decorative */}
      <div className="hidden lg:flex flex-col w-1/2 relative bg-gradient-to-br from-surface to-surface-50 overflow-hidden p-12">
        {/* Animated orbs */}
        <div className="auth-orb-1 absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-brand-500/20 blur-3xl pointer-events-none" />
        <div className="auth-orb-2 absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3 mb-auto">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-cyan-400 flex items-center justify-center">
            <Zap size={20} className="text-white" />
          </div>
          <span className="font-display font-bold text-2xl text-gradient">FitForge</span>
        </div>

        <div className="relative z-10 space-y-6 my-auto">
          <h1 className="text-5xl font-display font-bold leading-tight">
            Forja tu<br />
            <span className="text-gradient">mejor versión</span>
          </h1>
          <p className="text-white/60 text-lg max-w-sm leading-relaxed">
            Entrena inteligente, come mejor, vive más. La plataforma fitness más avanzada con IA integrada.
          </p>
          <div className="grid grid-cols-3 gap-4 max-w-sm">
            {[
              { value: '50K+', label: 'Usuarios activos' },
              { value: '200+', label: 'Ejercicios' },
              { value: '98%', label: 'Satisfacción' },
            ].map(({ value, label }) => (
              <div key={label} className="glass rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-gradient">{value}</div>
                <div className="text-xs text-white/50 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 mt-auto">
          <p className="text-white/30 text-sm">© 2025 FitForge. Todos los derechos reservados.</p>
        </div>
      </div>

      {/* Right panel - auth form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
