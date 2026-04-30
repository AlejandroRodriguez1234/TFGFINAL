import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { authService } from '@services/authService'
import { useAuthStore } from '@store/authStore'
import { Eye, EyeOff, Loader2, Check, X, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

const schema = z.object({
  firstName: z.string().min(2, 'Mínimo 2 caracteres'),
  lastName:  z.string().min(2, 'Mínimo 2 caracteres'),
  username:  z.string().min(3, 'Mínimo 3 caracteres').regex(/^[a-z0-9_]+$/, 'Solo letras, números y _'),
  email:     z.string().email('Email inválido'),
  password:  z.string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Necesita una mayúscula')
    .regex(/[0-9]/, 'Necesita un número'),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, { message: 'Las contraseñas no coinciden', path: ['confirm'] })

type FormData = z.infer<typeof schema>

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: 'Mínimo 8 caracteres', ok: password.length >= 8 },
    { label: 'Una mayúscula',        ok: /[A-Z]/.test(password) },
    { label: 'Un número',            ok: /[0-9]/.test(password) },
    { label: 'Un símbolo',           ok: /[^A-Za-z0-9]/.test(password) },
  ]
  const score = checks.filter((c) => c.ok).length
  const colors = ['bg-danger', 'bg-warning', 'bg-warning', 'bg-success', 'bg-success']
  const labels = ['', 'Muy débil', 'Débil', 'Aceptable', 'Fuerte']

  return (
    <div className="space-y-2 mt-2">
      <div className="flex gap-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i < score ? colors[score] : 'bg-surface-200'}`} />
        ))}
      </div>
      {password && <p className="text-xs text-white/40">{labels[score]}</p>}
      <ul className="grid grid-cols-2 gap-1">
        {checks.map(({ label, ok }) => (
          <li key={label} className={`flex items-center gap-1 text-xs ${ok ? 'text-success' : 'text-white/30'}`}>
            {ok ? <Check size={10} /> : <X size={10} />} {label}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function RegisterPage() {
  const navigate   = useNavigate()
  const { setAuth } = useAuthStore()
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [step, setStep]         = useState(1)

  const { register, handleSubmit, watch, trigger, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
  })
  const password = watch('password', '')

  const handleNext = async () => {
    const ok = await trigger(['firstName', 'lastName', 'username', 'email'])
    if (ok) setStep(2)
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const res = await authService.register(data)
      const { user, tokens } = res.data.data
      setAuth(user, tokens)
      toast.success('¡Cuenta creada! Bienvenido a FitForge 🎉')
      navigate('/dashboard')
    } catch (err: any) {
      if (!err?.response) {
        toast.error('No se puede conectar con el servidor. Asegúrate de que los contenedores estén corriendo.')
      } else {
        toast.error(err.response.data?.message || 'Error al crear la cuenta')
      }
    } finally {
      setLoading(false)
    }
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
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-display font-bold">Crea tu cuenta</h1>
          <span className="text-sm text-white/40">{step}/2</span>
        </div>
        <div className="flex gap-1 mb-4">
          <div className="h-1 flex-1 rounded-full bg-brand-500" />
          <div className={`h-1 flex-1 rounded-full transition-all ${step === 2 ? 'bg-brand-500' : 'bg-surface-200'}`} />
        </div>
        <p className="text-white/50">
          {step === 1 ? 'Cuéntanos quién eres.' : 'Elige una contraseña segura.'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm text-white/70">Nombre</label>
                <input {...register('firstName')} placeholder="Ana" className="input" />
                {errors.firstName && <p className="text-danger text-xs">{errors.firstName.message}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-sm text-white/70">Apellidos</label>
                <input {...register('lastName')} placeholder="García" className="input" />
                {errors.lastName && <p className="text-danger text-xs">{errors.lastName.message}</p>}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm text-white/70">Nombre de usuario</label>
              <input {...register('username')} placeholder="ana_garcia" className="input" />
              {errors.username && <p className="text-danger text-xs">{errors.username.message}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-sm text-white/70">Email</label>
              <input {...register('email')} type="email" placeholder="ana@email.com" className="input" />
              {errors.email && <p className="text-danger text-xs">{errors.email.message}</p>}
            </div>
            <button type="button" onClick={handleNext} className="btn-primary w-full py-3.5">
              Siguiente
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm text-white/70">Contraseña</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="input pr-10"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {password && <PasswordStrength password={password} />}
              {errors.password && <p className="text-danger text-xs">{errors.password.message}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-sm text-white/70">Confirmar contraseña</label>
              <input {...register('confirm')} type="password" placeholder="••••••••" className="input" />
              {errors.confirm && <p className="text-danger text-xs">{errors.confirm.message}</p>}
            </div>
            <p className="text-xs text-white/30">
              Al registrarte aceptas nuestros{' '}
              <a href="#" className="text-brand-400 hover:underline">Términos de uso</a> y{' '}
              <a href="#" className="text-brand-400 hover:underline">Política de privacidad</a>.
            </p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)} className="btn-secondary px-4">
                Atrás
              </button>
              <button type="submit" disabled={loading} className="btn-primary flex-1 py-3.5">
                {loading ? <Loader2 size={18} className="animate-spin" /> : 'Crear cuenta'}
              </button>
            </div>
          </motion.div>
        )}
      </form>

      <p className="text-center text-sm text-white/50">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
          Inicia sesión
        </Link>
      </p>
    </motion.div>
  )
}
