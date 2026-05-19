import { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Bell, Globe, Palette, User, Smartphone, Check, Moon, Sun } from 'lucide-react'
import { cn } from '@utils/cn'
import { useAuthStore } from '@store/authStore'
import { useTranslation } from 'react-i18next'
import { QRCodeSVG as QRCode } from 'qrcode.react'
import toast from 'react-hot-toast'

type Section = 'profile' | 'security' | 'notifications' | 'language' | 'appearance'

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)} className={cn('w-11 h-6 rounded-full transition-all relative', checked ? 'bg-brand-500' : 'bg-surface-300')}>
      <span className={cn('absolute top-1 w-4 h-4 rounded-full bg-white transition-all', checked ? 'left-6' : 'left-1')} />
    </button>
  )
}

export default function SettingsPage() {
  const { user } = useAuthStore()
  const { t, i18n } = useTranslation()
  const [active, setActive]   = useState<Section>('profile')
  const [show2fa, setShow2fa] = useState(false)
  const [notifs, setNotifs]   = useState({ workout: true, diet: true, social: false, achievements: true, email: true })

  const sections = [
    { key: 'profile'       as Section, icon: User,    label: t('common:profile') },
    { key: 'security'      as Section, icon: Shield,  label: t('common:security') },
    { key: 'notifications' as Section, icon: Bell,    label: t('common:notifications') },
    { key: 'language'      as Section, icon: Globe,   label: t('common:language') },
    { key: 'appearance'    as Section, icon: Palette, label: t('common:appearance') },
  ]

  const handleSaveChanges = () => {
    toast.success(t('common:changesSaved'))
  }

  const handleChangePhoto = () => {
    toast(t('common:mobileOnly'), { icon: <Smartphone size={14} /> })
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-display font-bold">{t('common:settings')}</h1>

      <div className="grid md:grid-cols-4 gap-6">
        {/* Nav */}
        <div className="md:col-span-1">
          <nav className="space-y-1">
            {sections.map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                onClick={() => setActive(key)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all text-left',
                  active === key
                    ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                )}
              >
                <Icon size={16} /> {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="md:col-span-3 card space-y-6">

          {active === 'profile' && (
            <div className="space-y-5">
              <h2 className="font-semibold">{t('common:personalInfo')}</h2>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-500 to-cyan-400 flex items-center justify-center text-xl font-bold">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
                <button onClick={handleChangePhoto} className="btn-secondary text-sm px-3 py-2">
                  {t('common:changePhoto')}
                </button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {([
                  [t('auth:firstName'), user?.firstName],
                  [t('auth:lastName'),  user?.lastName],
                  [t('auth:username'),  `@${user?.username}`],
                  [t('auth:email'),     user?.email],
                ] as [string, string | undefined][]).map(([label, val]) => (
                  <div key={label}>
                    <label className="text-xs text-white/40 mb-1 block">{label}</label>
                    <input defaultValue={val ?? ''} className="input text-sm" />
                  </div>
                ))}
              </div>
              <button onClick={handleSaveChanges} className="btn-primary">{t('common:saveChanges')}</button>
            </div>
          )}

          {active === 'security' && (
            <div className="space-y-5">
              <h2 className="font-semibold">{t('common:security')}</h2>
              <div className="space-y-3">
                {([
                  [t('common:currentPassword'), 'current-password'],
                  [t('common:newPassword'),      'new-password'],
                  [t('common:confirmPassword'),  'new-password'],
                ] as [string, string][]).map(([label, ac]) => (
                  <div key={label}>
                    <label className="text-xs text-white/40 mb-1 block">{label}</label>
                    <input type="password" autoComplete={ac} className="input text-sm" />
                  </div>
                ))}
                <button
                  onClick={() => toast.success(t('common:passwordUpdated'))}
                  className="btn-primary text-sm"
                >
                  {t('common:updatePassword')}
                </button>
              </div>
              <div className="section-divider" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{t('common:twoFactorAuth')}</p>
                  <p className="text-xs text-white/40 mt-0.5">{t('common:twoFactorDesc')}</p>
                </div>
                <button
                  onClick={() => setShow2fa(!show2fa)}
                  className={cn('btn-secondary text-sm px-3 py-2', show2fa && 'text-success border-success/30')}
                >
                  {show2fa ? <><Check size={14} /> {t('common:enabled')}</> : <><Smartphone size={14} /> {t('common:enable')}</>}
                </button>
              </div>
              {show2fa && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="glass rounded-xl p-4 space-y-3">
                  <p className="text-sm text-white/60">{t('common:scanQRCode')}</p>
                  <div className="flex justify-center p-3 bg-white rounded-xl w-fit">
                    <QRCode value="otpauth://totp/FitForge:user@email.com?secret=JBSWY3DPEHPK3PXP&issuer=FitForge" size={128} />
                  </div>
                  <input
                    placeholder={t('common:enterSixDigits')}
                    className="input text-center tracking-widest font-mono"
                    maxLength={6}
                    inputMode="numeric"
                  />
                  <button
                    onClick={() => toast.success(t('common:twoFaActivated'))}
                    className="btn-primary text-sm w-full"
                  >
                    {t('common:verifyAndActivate')}
                  </button>
                </motion.div>
              )}
            </div>
          )}

          {active === 'notifications' && (
            <div className="space-y-5">
              <h2 className="font-semibold">{t('common:notifications')}</h2>
              {([
                { key: 'workout'      as const, label: t('common:notifWorkout'),      desc: t('common:notifWorkoutDesc')      },
                { key: 'diet'         as const, label: t('common:notifDiet'),         desc: t('common:notifDietDesc')         },
                { key: 'social'       as const, label: t('common:notifSocial'),       desc: t('common:notifSocialDesc')       },
                { key: 'achievements' as const, label: t('common:notifAchievements'), desc: t('common:notifAchievementsDesc') },
                { key: 'email'        as const, label: t('common:notifEmail'),        desc: t('common:notifEmailDesc')        },
              ]).map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-white/40">{desc}</p>
                  </div>
                  <Toggle checked={notifs[key]} onChange={(v) => setNotifs((p) => ({ ...p, [key]: v }))} />
                </div>
              ))}
            </div>
          )}

          {active === 'language' && (
            <div className="space-y-4">
              <h2 className="font-semibold">{t('common:language')}</h2>
              {([['es', 'ES', 'Español'], ['en', 'EN', 'English']] as [string, string, string][]).map(([code, flag, label]) => (
                <button
                  key={code}
                  onClick={() => {
                    i18n.changeLanguage(code)
                    toast.success(t('common:languageChanged', { lang: label }))
                  }}
                  className={cn(
                    'w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left',
                    i18n.language === code
                      ? 'bg-brand-500/10 border-brand-500/30 text-brand-300'
                      : 'glass border-white/10 text-white/70 hover:border-white/30'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-surface-100 flex items-center justify-center text-xs font-bold text-white">{flag}</span>
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                  {i18n.language === code && <Check size={16} className="text-brand-400" />}
                </button>
              ))}
            </div>
          )}

          {active === 'appearance' && (
            <div className="space-y-4">
              <h2 className="font-semibold">{t('common:appearance')}</h2>
              <p className="text-sm text-white/50">{t('common:themeDesc')}</p>
              <div className="grid grid-cols-2 gap-3">
                <button className="p-4 rounded-xl border border-brand-500/50 bg-surface text-center text-sm font-medium flex items-center justify-center gap-2">
                  <Moon size={16} className="text-brand-400" /> {t('common:darkMode')}
                </button>
                <button className="p-4 rounded-xl glass border border-white/10 text-center text-sm font-medium text-white/50 opacity-50 cursor-not-allowed flex items-center justify-center gap-2" disabled>
                  <Sun size={16} /> {t('common:lightModeSoon')}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
