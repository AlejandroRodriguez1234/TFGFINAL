import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { authService } from '@services/authService'
import { useAuthStore } from '@store/authStore'
import { Eye, EyeOff, Loader2, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

const schema = z.object({
  email:    z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  totpCode: z.string().optional(),
})
type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const { t } = useTranslation(['auth', 'common'])
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [showPass, setShowPass]  = useState(false)
  const [loading, setLoading]    = useState(false)
  const [need2fa, setNeed2fa]    = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const res = await authService.login(data)
      const { user, tokens } = res.data.data
      setAuth(user, tokens)
      toast.success(`¡Bienvenido de vuelta, ${user.firstName}!`)
      navigate('/dashboard')
    } catch (err: any) {
      if (err?.response?.data?.code === 'TOTP_REQUIRED') {
        setNeed2fa(true)
        toast.success('Introduce el código de tu app de autenticación')
      } else if (!err?.response) {
        toast.error('No se puede conectar con el servidor. Asegúrate de que los contenedores estén corriendo.')
      } else {
        toast.error(err.response.data?.message || 'Credenciales incorrectas')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSocialLogin = (provider: string) => {
    toast('Inicio de sesión con ' + provider + ' próximamente', { icon: '🚧' })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      <div>
        <div className="flex items-center gap-2 mb-6 lg:hidden">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-cyan-400 flex items-center justify-center">
            <Zap size={16} />
          </div>
          <span className="font-display font-bold text-xl text-gradient">FitForge</span>
        </div>
        <h1 className="text-3xl font-display font-bold">{t('auth:welcomeBack')}</h1>
        <p className="text-white/50 mt-2">Inicia sesión para continuar tu progreso.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm text-white/70">{t('auth:email')}</label>
          <input {...register('email')} type="email" placeholder="tu@email.com" className="input" autoComplete="email" />
          {errors.email && <p className="text-danger text-xs">{errors.email.message}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-sm text-white/70">{t('auth:password')}</label>
          <div className="relative">
            <input
              {...register('password')}
              type={showPass ? 'text' : 'password'}
              placeholder="••••••••"
              className="input pr-10"
              autoComplete="current-password"
            />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors">
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="text-danger text-xs">{errors.password.message}</p>}
        </div>

        {need2fa && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-1">
            <label className="text-sm text-white/70">{t('auth:twoFactor')}</label>
            <input
              {...register('totpCode')}
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              className="input text-center tracking-[0.5em] text-xl font-mono"
              autoComplete="one-time-code"
            />
          </motion.div>
        )}

        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm text-brand-400 hover:text-brand-300 transition-colors">
            {t('auth:forgotPassword')}
          </Link>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base mt-2">
          {loading ? <Loader2 size={18} className="animate-spin" /> : t('auth:login')}
        </button>
      </form>

      <div className="relative flex items-center gap-3">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-xs text-white/30">o continúa con</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => handleSocialLogin('Google')} className="btn-secondary py-2.5 text-sm">
          <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Google
        </button>
        <button onClick={() => handleSocialLogin('GitHub')} className="btn-secondary py-2.5 text-sm">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
          GitHub
        </button>
      </div>

      <p className="text-center text-sm text-white/50">
        {t('auth:noAccount')}{' '}
        <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
          {t('auth:register')}
        </Link>
      </p>
    </motion.div>
  )
}
