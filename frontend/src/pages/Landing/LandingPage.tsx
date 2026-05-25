import { useRef, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useTranslation } from 'react-i18next'
import {
  Zap, Dumbbell, Apple, Brain, Users, TrendingUp,
  Shield, Star, ChevronRight, Play, ArrowRight, Check,
  Activity, Target, Award, Smartphone, Globe,
  Flame, Droplets, Moon, Trophy,
} from 'lucide-react'
import { cn } from '@utils/cn'

gsap.registerPlugin(ScrollTrigger)

const LANGS = [
  { code: 'es', label: 'Español', short: 'ES' },
  { code: 'en', label: 'English', short: 'EN' },
]

function DashboardPreview() {
  const { t } = useTranslation()
  return (
    <div className="relative hidden md:block" style={{ animation: 'float 4s ease-in-out infinite' }}>
      <style>{`@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}`}</style>

      <div className="absolute inset-0 bg-brand-500/20 blur-3xl rounded-full scale-75 pointer-events-none" />

      <div className="relative w-80 rounded-2xl bg-[#141414]/90 backdrop-blur-xl border border-white/10 shadow-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-white/40">{t('dashboard:goodAfternoon')},</p>
            <p className="text-lg font-bold text-white">Alejandro</p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/20 border border-brand-500/30">
            <Trophy size={11} className="text-brand-300" />
            <span className="text-brand-300 text-xs font-bold">{t('common:levelPrefix')} 10</span>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-[10px] text-white/30 mb-1">
            <span>{t('landing:xpProgressLabel')}</span><span>9,500 / 10,000</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full w-[95%] bg-gradient-to-r from-brand-500 to-cyan-400 rounded-full" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { val: '1,840', label: 'kcal',                    Icon: Flame,    cls: 'text-orange-400', bg: 'bg-orange-500/10' },
            { val: '7h 20', label: t('dashboard:sleep'),      Icon: Moon,     cls: 'text-purple-400', bg: 'bg-purple-500/10' },
            { val: '1.8L',  label: t('dashboard:water'),      Icon: Droplets, cls: 'text-cyan-400',   bg: 'bg-cyan-500/10'   },
          ].map(({ val, label, Icon, cls, bg }) => (
            <div key={label} className={`${bg} rounded-xl p-2.5 text-center`}>
              <Icon size={12} className={cn(cls, 'mx-auto mb-1')} />
              <p className={`text-sm font-bold ${cls}`}>{val}</p>
              <p className="text-[9px] text-white/30">{label}</p>
            </div>
          ))}
        </div>

        <div>
          <p className="text-[10px] text-white/30 mb-2 uppercase tracking-wide">{t('landing:weeklyActivity')}</p>
          <div className="flex items-end gap-1.5 h-10">
            {[65,80,45,90,70,85,60].map((h, i) => (
              <div key={i} className="flex-1 rounded-sm" style={{ height: `${h}%`, background: i === 3 ? 'linear-gradient(to top,#0ea5e9,#22d3ee)' : 'rgba(255,255,255,0.08)' }} />
            ))}
          </div>
          <div className="flex justify-between mt-1.5">
            {(t('landing:weekDaysShort', { returnObjects: true }) as string[]).map((d, i) => (
              <span key={i} className="flex-1 text-center text-[9px] text-white/20">{d}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute -top-3 -right-4 bg-gradient-to-r from-green-500 to-emerald-400 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1">
        <Zap size={10} /> +150 XP
      </div>
      <div className="absolute -bottom-3 -left-4 bg-[#141414] border border-white/10 rounded-xl px-3 py-2 shadow-xl flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span className="text-xs text-white/70 font-medium">{t('landing:streakLabel')}</span>
      </div>
    </div>
  )
}

export default function LandingPage() {
  const { i18n, t } = useTranslation()
  const heroRef = useRef<HTMLDivElement>(null)
  const [langOpen, setLangOpen] = useState(false)
  const currentLang = LANGS.find((l) => l.code === i18n.language) ?? LANGS[0]

  const features = [
    { icon: Brain,      title: t('landing:featureAITitle'),     desc: t('landing:featureAIDesc'),     color: 'from-purple-500 to-pink-500',   span: 'col-span-2' },
    { icon: Shield,     title: t('landing:featureSecTitle'),    desc: t('landing:featureSecDesc'),    color: 'from-indigo-500 to-violet-400', span: 'col-span-1' },
    { icon: Dumbbell,   title: t('landing:featureGymTitle'),    desc: t('landing:featureGymDesc'),    color: 'from-brand-500 to-cyan-400',    span: 'col-span-1' },
    { icon: Apple,      title: t('landing:featureNutTitle'),    desc: t('landing:featureNutDesc'),    color: 'from-green-500 to-emerald-400', span: 'col-span-1' },
    { icon: TrendingUp, title: t('landing:featureAnalTitle'),   desc: t('landing:featureAnalDesc'),   color: 'from-orange-500 to-yellow-400', span: 'col-span-1' },
    { icon: Users,      title: t('landing:featureSocialTitle'), desc: t('landing:featureSocialDesc'), color: 'from-pink-500 to-rose-400',     span: 'col-span-2' },
  ]

  const plans = [
    {
      name: 'Starter', price: t('landing:planStarterPrice'), period: '',
      features: [t('landing:planStarterF1'), t('landing:planStarterF2'), t('landing:planStarterF3'), t('landing:planStarterF4')],
      cta: t('landing:planStarterCta'), featured: false,
    },
    {
      name: 'Pro', price: '€9.99', period: t('landing:planPeriodMonth'),
      features: [t('landing:planProF1'), t('landing:planProF2'), t('landing:planProF3'), t('landing:planProF4'), t('landing:planProF5'), t('landing:planProF6')],
      cta: t('landing:planProCta'), featured: true,
    },
    {
      name: 'Trainer', price: '€24.99', period: t('landing:planPeriodMonth'),
      features: [t('landing:planTrainerF1'), t('landing:planTrainerF2'), t('landing:planTrainerF3'), t('landing:planTrainerF4'), t('landing:planTrainerF5'), t('landing:planTrainerF6')],
      cta: t('landing:planTrainerCta'), featured: false,
    },
  ]

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.hero-badge',  { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' })
      gsap.fromTo('.hero-title',  { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', delay: 0.1 })
      gsap.fromTo('.hero-sub',    { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.25 })
      gsap.fromTo('.hero-cta',    { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', delay: 0.4 })
      gsap.fromTo('.hero-stats',  { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: 'power3.out', delay: 0.55 })
      gsap.fromTo('.hero-visual', { x: 60, opacity: 0 }, { x: 0, opacity: 1, duration: 1,   ease: 'power3.out', delay: 0.3 })

      gsap.fromTo('.feature-card', { y: 50, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', stagger: 0.08,
        scrollTrigger: { trigger: '.features-section', start: 'top 80%' },
      })
      gsap.fromTo('.stat-item', { y: 30, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.5, stagger: 0.1,
        scrollTrigger: { trigger: '.stats-section', start: 'top 80%' },
      })
      gsap.fromTo('.pricing-card', { y: 50, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.6, stagger: 0.12,
        scrollTrigger: { trigger: '.pricing-section', start: 'top 80%' },
      })
    }, heroRef)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={heroRef} className="min-h-screen bg-surface text-white overflow-x-hidden">

      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 flex items-center justify-between px-6 md:px-12 h-16 glass border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-cyan-400 flex items-center justify-center">
            <Zap size={16} />
          </div>
          <span className="font-display font-bold text-xl bg-gradient-to-r from-brand-400 to-cyan-400 bg-clip-text text-transparent">FitForge</span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
          <a href="#features" className="hover:text-white transition-colors">{t('landing:navFeatures')}</a>
          <a href="#pricing"  className="hover:text-white transition-colors">{t('landing:navPricing')}</a>
          <a href="#about"    className="hover:text-white transition-colors">{t('landing:navAbout')}</a>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors text-xs font-semibold"
            >
              <Globe size={14} />
              <span>{currentLang.short}</span>
            </button>
            {langOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setLangOpen(false)} />
                <div className="absolute right-0 top-full mt-1 w-32 rounded-xl bg-[#1a1a1a] border border-white/10 shadow-xl z-20 py-1">
                  {LANGS.map(({ code, label, short }) => (
                    <button
                      key={code}
                      onClick={() => { i18n.changeLanguage(code); setLangOpen(false) }}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2 text-sm transition-colors text-left',
                        i18n.language === code ? 'text-brand-300 bg-brand-500/10' : 'text-white/60 hover:bg-white/10',
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold bg-white/10 rounded px-1 py-0.5">{short}</span>
                        {label}
                      </div>
                      {i18n.language === code && <Check size={12} className="text-brand-400" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <Link to="/login"    className="px-4 py-2 text-sm text-white/70 hover:text-white transition-colors">{t('landing:signIn')}</Link>
          <Link to="/register" className="px-4 py-2 text-sm bg-brand-500 hover:bg-brand-600 text-white rounded-lg font-medium transition-colors">{t('landing:startFree')}</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="min-h-screen flex items-center pt-16 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-brand-600/15 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-16 items-center w-full py-20">
          <div className="space-y-8">
            <div className="hero-badge inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand-500/30 bg-brand-500/10 text-sm text-brand-300">
              <Activity size={13} />
              <span>{t('landing:heroBadge')}</span>
            </div>

            <h1 className="hero-title text-5xl md:text-6xl lg:text-[4.5rem] font-display font-black leading-[1.05] tracking-tight">
              {t('landing:heroTitle1')}<br />
              <span className="bg-gradient-to-r from-brand-400 to-cyan-400 bg-clip-text text-transparent">{t('landing:heroTitle2')}</span><br />
              <span className="text-white/80">{t('landing:heroTitle3')}</span>
            </h1>

            <p className="hero-sub text-lg text-white/55 max-w-lg leading-relaxed">
              {t('landing:heroSubtitle')}
            </p>

            <div className="hero-cta flex flex-col sm:flex-row gap-3">
              <Link to="/register" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-all text-base group">
                {t('landing:startFreeBtn')} <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/15 hover:border-white/30 text-white/80 hover:text-white rounded-xl transition-all text-base">
                <Play size={15} className="text-brand-400" /> {t('landing:watchDemo')}
              </button>
            </div>

            <div className="flex flex-wrap gap-8">
              {[
                { value: '50K+', label: t('landing:statActiveUsers'), star: false },
                { value: '200+', label: t('landing:statExercises'),    star: false },
                { value: '500K', label: t('landing:statFoods'),        star: false },
                { value: '4.9',  label: t('landing:statRating'),       star: true  },
              ].map(({ value, label, star }) => (
                <div key={label} className="hero-stats">
                  <div className="flex items-center gap-1 text-2xl font-bold bg-gradient-to-r from-brand-400 to-cyan-400 bg-clip-text text-transparent">
                    {value}{star && <Star size={16} className="fill-yellow-400 text-yellow-400 ml-0.5" />}
                  </div>
                  <div className="text-xs text-white/35 mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-visual flex justify-center">
            <DashboardPreview />
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/25 text-xs">
          <span>{t('landing:scrollHint')}</span>
          <div className="w-px h-8 bg-gradient-to-b from-white/25 to-transparent" />
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="features-section py-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              {t('landing:featuresTitle1')}<br />
              <span className="bg-gradient-to-r from-brand-400 to-cyan-400 bg-clip-text text-transparent">{t('landing:featuresTitle2')}</span>
            </h2>
            <p className="text-white/45 text-lg max-w-2xl mx-auto">
              {t('landing:featuresSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {features.map(({ icon: Icon, title, desc, color, span }) => (
              <div
                key={title}
                className={cn(
                  'feature-card group relative overflow-hidden rounded-2xl border border-white/8 bg-white/3 hover:border-white/15 p-6 transition-all duration-300 hover:-translate-y-1',
                  span,
                )}
              >
                <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${color} opacity-10 blur-3xl rounded-full pointer-events-none`} />
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon size={20} className="text-white" />
                </div>
                <h3 className="text-base font-semibold mb-2 text-white">{title}</h3>
                <p className="text-white/45 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="stats-section py-20 px-6 md:px-12 border-y border-white/5">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { icon: Users,    value: '50,000+', label: t('landing:statsActiveUsers') },
            { icon: Dumbbell, value: '2M+',     label: t('landing:statsWorkouts') },
            { icon: Target,   value: '87%',     label: t('landing:statsGoal') },
            { icon: Award,    value: '4.9/5',   label: t('landing:statsRating') },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="stat-item text-center">
              <Icon size={26} className="text-brand-400 mx-auto mb-3 opacity-80" />
              <div className="text-3xl font-bold bg-gradient-to-r from-brand-400 to-cyan-400 bg-clip-text text-transparent mb-1">{value}</div>
              <div className="text-sm text-white/40">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="pricing-section py-24 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              {t('landing:pricingTitle1')} <span className="bg-gradient-to-r from-brand-400 to-cyan-400 bg-clip-text text-transparent">{t('landing:pricingTitle2')}</span>
            </h2>
            <p className="text-white/45 text-lg">{t('landing:pricingSubtitle')}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 items-center">
            {plans.map(({ name, price, period, features: pf, cta, featured }) => (
              <div
                key={name}
                className={cn(
                  'pricing-card rounded-2xl p-7 border transition-all duration-300',
                  featured
                    ? 'bg-gradient-to-b from-brand-500/15 to-transparent border-brand-500/40 shadow-[0_0_40px_rgba(14,165,233,0.15)] scale-105'
                    : 'bg-white/3 border-white/8 hover:border-white/15',
                )}
              >
                {featured && (
                  <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 mb-3">
                    {t('landing:mostPopular')}
                  </span>
                )}
                <h3 className="text-xl font-bold mb-2 text-white">{name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold bg-gradient-to-r from-brand-400 to-cyan-400 bg-clip-text text-transparent">{price}</span>
                  <span className="text-white/40 text-sm">{period}</span>
                </div>
                <ul className="space-y-3 mb-7">
                  {pf.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-white/65">
                      <Check size={14} className="text-brand-400 shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/register"
                  className={cn(
                    'w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all',
                    featured ? 'bg-brand-500 hover:bg-brand-600 text-white' : 'border border-white/15 hover:border-white/30 text-white/80 hover:text-white',
                  )}
                >
                  {cta} <ChevronRight size={15} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="about" className="py-24 px-6 md:px-12">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-6 text-white/40 text-sm">
            <Smartphone size={16} className="text-brand-400" />
            <span>{t('landing:pwaBadge')}</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
            {t('landing:ctaTitle1')}<br />
            <span className="bg-gradient-to-r from-brand-400 to-cyan-400 bg-clip-text text-transparent">{t('landing:ctaTitle2')}</span>
          </h2>
          <p className="text-white/50 text-lg mb-10">
            {t('landing:ctaSubtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/register" className="inline-flex items-center gap-2 px-10 py-4 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-all text-base">
              {t('landing:createFreeAccount')} <ArrowRight size={17} />
            </Link>
            <div className="flex items-center gap-2 text-white/40 text-sm">
              <Check size={13} className="text-green-400" /> {t('landing:noCreditCard')}
            </div>
          </div>
          <div className="flex items-center justify-center gap-1 mt-8">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={15} className="fill-yellow-400 text-yellow-400" />
            ))}
            <span className="text-white/40 text-sm ml-2">{t('landing:reviews')}</span>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-10 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-cyan-400 flex items-center justify-center">
              <Zap size={13} />
            </div>
            <span className="font-bold bg-gradient-to-r from-brand-400 to-cyan-400 bg-clip-text text-transparent">FitForge</span>
          </div>
          <p className="text-white/25 text-sm text-center">
            © 2025 FitForge. {t('common:tagline')}.
          </p>
          <div className="flex gap-6 text-sm text-white/35">
            <a href="#" className="hover:text-white transition-colors">{t('landing:privacy')}</a>
            <a href="#" className="hover:text-white transition-colors">{t('landing:terms')}</a>
            <a href="#" className="hover:text-white transition-colors">{t('landing:contact')}</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
