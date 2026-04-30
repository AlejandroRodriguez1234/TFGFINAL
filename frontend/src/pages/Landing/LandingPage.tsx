import { useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useTranslation } from 'react-i18next'
import {
  Zap, Dumbbell, Apple, Brain, Users, TrendingUp,
  Shield, Star, ChevronRight, Play, ArrowRight, Check,
  Activity, Target, Award, Smartphone,
} from 'lucide-react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Sphere, MeshDistortMaterial, Float } from '@react-three/drei'
import { Suspense } from 'react'

gsap.registerPlugin(ScrollTrigger)

function AnimatedSphere() {
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <Sphere args={[1, 100, 200]} scale={2.2}>
        <MeshDistortMaterial
          color="#0ea5e9"
          attach="material"
          distort={0.4}
          speed={2}
          roughness={0.1}
          metalness={0.8}
          transparent
          opacity={0.6}
        />
      </Sphere>
    </Float>
  )
}

const features = [
  { icon: Brain,     title: 'IA Integrada',          desc: 'Análisis de postura, recomendaciones personalizadas y chatbot nutricional con inteligencia artificial.', color: 'from-purple-500 to-pink-500' },
  { icon: Dumbbell,  title: 'Rutinas Inteligentes',   desc: 'Más de 200 ejercicios con vídeos, progresión automática y seguimiento de records personales.', color: 'from-brand-500 to-cyan-400' },
  { icon: Apple,     title: 'Nutrición Avanzada',     desc: 'Escaneo de código de barras, base de datos de 500K alimentos y planes de dieta personalizados.', color: 'from-green-500 to-emerald-400' },
  { icon: TrendingUp, title: 'Analíticas Detalladas', desc: 'Dashboards interactivos, predicciones de progreso y análisis de composición corporal.', color: 'from-orange-500 to-yellow-400' },
  { icon: Users,     title: 'Comunidad Social',       desc: 'Retos entre amigos, tabla de clasificación, feed de actividad y sistema de logros gamificado.', color: 'from-pink-500 to-rose-400' },
  { icon: Shield,    title: 'Seguridad Total',        desc: 'Autenticación 2FA, cifrado end-to-end y cumplimiento GDPR. Tus datos están protegidos.', color: 'from-indigo-500 to-violet-400' },
]

const stats = [
  { value: '50K+', label: 'Usuarios activos' },
  { value: '200+', label: 'Ejercicios' },
  { value: '500K', label: 'Alimentos en BD' },
  { value: '4.9★', label: 'Valoración' },
]

const plans = [
  {
    name: 'Starter',
    price: 'Gratis',
    period: '',
    features: ['Dashboard básico', '50 ejercicios', 'Registro de comidas', 'Comunidad'],
    cta: 'Empezar gratis',
    featured: false,
  },
  {
    name: 'Pro',
    price: '€9.99',
    period: '/mes',
    features: ['Todo en Starter', '200+ ejercicios con vídeo', 'IA postura y nutrición', 'Sin límites', 'Analíticas avanzadas', 'Soporte prioritario'],
    cta: 'Empezar Pro',
    featured: true,
  },
  {
    name: 'Trainer',
    price: '€24.99',
    period: '/mes',
    features: ['Todo en Pro', 'Panel de entrenador', 'Gestión de clientes', 'Planes personalizados', 'API access', 'White-label'],
    cta: 'Contactar',
    featured: false,
  },
]

export default function LandingPage() {
  const { t } = useTranslation()
  const heroRef   = useRef<HTMLDivElement>(null)
  const featRef   = useRef<HTMLDivElement>(null)
  const statsRef  = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero entrance
      gsap.fromTo('.hero-title',   { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 1,   ease: 'power3.out' })
      gsap.fromTo('.hero-sub',     { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', delay: 0.2 })
      gsap.fromTo('.hero-cta',     { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.4 })
      gsap.fromTo('.hero-stats',   { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.6, stagger: 0.1 })
      gsap.fromTo('.hero-sphere',  { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.2, ease: 'elastic.out(1, 0.6)', delay: 0.3 })

      // Features on scroll
      gsap.fromTo('.feature-card', { y: 60, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', stagger: 0.1,
        scrollTrigger: { trigger: '.features-section', start: 'top 80%' },
      })

      // Stats counter animation
      gsap.fromTo('.stat-item', { y: 30, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.6, stagger: 0.1,
        scrollTrigger: { trigger: '.stats-section', start: 'top 80%' },
      })

      // Pricing cards
      gsap.fromTo('.pricing-card', { y: 50, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.7, stagger: 0.15,
        scrollTrigger: { trigger: '.pricing-section', start: 'top 80%' },
      })
    }, heroRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={heroRef} className="min-h-screen bg-surface text-white overflow-x-hidden">
      {/* ─── NAVBAR ──────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 w-full z-50 flex items-center justify-between px-6 md:px-12 h-16 glass border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-cyan-400 flex items-center justify-center">
            <Zap size={16} />
          </div>
          <span className="font-display font-bold text-xl text-gradient">FitForge</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
          <a href="#features" className="hover:text-white transition-colors">Funciones</a>
          <a href="#pricing" className="hover:text-white transition-colors">Precios</a>
          <a href="#about" className="hover:text-white transition-colors">Nosotros</a>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="btn-ghost text-sm">Entrar</Link>
          <Link to="/register" className="btn-primary text-sm py-2 px-4">Empezar gratis</Link>
        </div>
      </nav>

      {/* ─── HERO ────────────────────────────────────────────────────────────── */}
      <section className="min-h-screen flex items-center pt-16 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-mesh-gradient opacity-10 pointer-events-none" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-12 items-center w-full">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-brand-500/30 text-sm text-brand-300">
              <Activity size={14} />
              <span>IA-Powered Fitness Platform</span>
            </div>

            <h1 className="hero-title text-5xl md:text-6xl lg:text-7xl font-display font-black leading-[1.05]">
              Forja tu<br />
              <span className="text-gradient">mejor versión</span><br />
              <span className="text-white/80">con IA</span>
            </h1>

            <p className="hero-sub text-lg text-white/60 max-w-lg leading-relaxed">
              La plataforma fitness más avanzada: entrena con IA, come inteligente, conecta con tu comunidad y mide tu evolución con analíticas de nivel profesional.
            </p>

            <div className="hero-cta flex flex-col sm:flex-row gap-4">
              <Link to="/register" className="btn-primary text-base px-8 py-4 group">
                Empieza gratis
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="btn-secondary text-base px-8 py-4 group">
                <Play size={16} className="text-brand-400" />
                Ver demo
              </button>
            </div>

            <div className="flex flex-wrap gap-6">
              {stats.map(({ value, label }) => (
                <div key={label} className="hero-stats text-center">
                  <div className="text-2xl font-bold text-gradient">{value}</div>
                  <div className="text-xs text-white/40 mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-sphere h-[500px] hidden md:block">
            <Canvas camera={{ position: [0, 0, 5] }}>
              <ambientLight intensity={0.5} />
              <directionalLight position={[10, 10, 5]} intensity={2} />
              <pointLight position={[-10, -10, -5]} color="#0ea5e9" intensity={1} />
              <Suspense fallback={null}>
                <AnimatedSphere />
              </Suspense>
              <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
            </Canvas>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30 text-xs animate-bounce">
          <span>Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-white/30 to-transparent" />
        </div>
      </section>

      {/* ─── FEATURES ────────────────────────────────────────────────────────── */}
      <section id="features" className="features-section py-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Todo lo que necesitas<br />
              <span className="text-gradient">en un solo lugar</span>
            </h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">
              Desde el análisis de postura con IA hasta la gamificación social, FitForge tiene cada aspecto de tu fitness cubierto.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="feature-card card-hover group">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon size={22} className="text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── STATS ───────────────────────────────────────────────────────────── */}
      <section className="stats-section py-20 px-6 md:px-12 bg-surface-50">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { icon: Users,    value: '50,000+', label: 'Usuarios activos' },
            { icon: Dumbbell, value: '2M+',     label: 'Entrenamientos completados' },
            { icon: Target,   value: '87%',     label: 'Usuarios que alcanzan sus metas' },
            { icon: Award,    value: '4.9/5',   label: 'Valoración media' },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="stat-item text-center">
              <Icon size={28} className="text-brand-400 mx-auto mb-3" />
              <div className="text-3xl font-bold text-gradient mb-1">{value}</div>
              <div className="text-sm text-white/50">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── PRICING ─────────────────────────────────────────────────────────── */}
      <section id="pricing" className="pricing-section py-24 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Precios <span className="text-gradient">transparentes</span>
            </h2>
            <p className="text-white/50 text-lg">Empieza gratis, escala cuando lo necesites.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 items-center">
            {plans.map(({ name, price, period, features: planFeatures, cta, featured }) => (
              <div
                key={name}
                className={`pricing-card rounded-2xl p-8 border transition-all duration-300 ${
                  featured
                    ? 'bg-gradient-to-b from-brand-500/20 to-brand-500/5 border-brand-500/50 shadow-glow scale-105'
                    : 'glass border-white/10 hover:border-white/20'
                }`}
              >
                {featured && (
                  <div className="badge badge-brand mb-3">Más popular</div>
                )}
                <h3 className="text-xl font-bold mb-2">{name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold text-gradient">{price}</span>
                  <span className="text-white/50 text-sm">{period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {planFeatures.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-white/70">
                      <Check size={15} className="text-brand-400 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/register"
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all ${
                    featured ? 'btn-primary' : 'btn-secondary'
                  }`}
                >
                  {cta} <ChevronRight size={16} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─────────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 md:px-12">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-6">
            <Smartphone size={20} className="text-brand-400" />
            <span className="text-sm text-white/50">Disponible como PWA en móvil y escritorio</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
            ¿Listo para forjar<br /><span className="text-gradient">tu mejor versión?</span>
          </h2>
          <p className="text-white/60 text-lg mb-10">
            Únete a más de 50,000 personas que ya están transformando su vida con FitForge.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-primary text-base px-10 py-4">
              Crear cuenta gratis <ArrowRight size={18} />
            </Link>
            <div className="flex items-center gap-2 text-white/50 text-sm justify-center">
              <Check size={14} className="text-success" />
              Sin tarjeta de crédito
            </div>
          </div>
          <div className="flex items-center justify-center gap-1 mt-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
            ))}
            <span className="text-white/50 text-sm ml-2">4.9/5 de más de 2,000 reseñas</span>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-12 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-cyan-400 flex items-center justify-center">
              <Zap size={14} />
            </div>
            <span className="font-bold text-gradient">FitForge</span>
          </div>
          <p className="text-white/30 text-sm text-center">
            © 2025 FitForge. Hecho con ❤️ para el TFG.
          </p>
          <div className="flex gap-6 text-sm text-white/40">
            <a href="#" className="hover:text-white transition-colors">Privacidad</a>
            <a href="#" className="hover:text-white transition-colors">Términos</a>
            <a href="#" className="hover:text-white transition-colors">Contacto</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
