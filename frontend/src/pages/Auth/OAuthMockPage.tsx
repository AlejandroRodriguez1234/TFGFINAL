import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Loader2, ShieldCheck } from 'lucide-react'
import { socialDemoLogin } from '@services/demoAuth'

export default function OAuthMockPage() {
  const [params] = useSearchParams()
  const provider = params.get('provider') ?? 'Google'
  const [step, setStep] = useState<'consent' | 'loading' | 'done'>('consent')

  const isGoogle = provider === 'Google'

  const demo = socialDemoLogin(provider)
  const user = demo?.user

  useEffect(() => {
    if (step === 'done') {
      if (window.opener && demo) {
        window.opener.postMessage({ type: 'OAUTH_SUCCESS', provider, user: demo.user, tokens: demo.tokens }, window.location.origin)
      }
      const t = setTimeout(() => window.close(), 800)
      return () => clearTimeout(t)
    }
  }, [step])

  const handleAllow = () => {
    setStep('loading')
    setTimeout(() => setStep('done'), 1200)
  }

  if (isGoogle) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center font-sans">
        <div className="w-full max-w-sm border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
          {/* Google header */}
          <div className="px-8 pt-8 pb-4 text-center">
            <svg viewBox="0 0 74 24" className="h-6 mx-auto mb-6" aria-label="Google">
              <path fill="#4285F4" d="M10 4.4C6.9 4.4 4.4 6.9 4.4 10S6.9 15.6 10 15.6c1.9 0 3.2-.8 3.9-1.9v1.6h1.6V10c0-3.1-2.5-5.6-5.5-5.6zm0 9.6c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4z"/>
              <path fill="#EA4335" d="M33.6 4.4C30.5 4.4 28 6.9 28 10s2.5 5.6 5.6 5.6c1.3 0 2.4-.4 3.3-1.2l-1.1-1.1c-.6.5-1.3.8-2.2.8-1.7 0-3.2-1.3-3.4-3H38v-.6c0-2.9-2.2-5.1-4.4-5.1zm-3.4 4.6c.2-1.5 1.5-2.6 3-2.6s2.8 1.1 3 2.6h-6z"/>
              <path fill="#FBBC05" d="M47.2 4.7l-3 7.6-3-7.6h-1.8l3.8 9.5-.1.2c-.5 1.1-1 1.6-2.1 1.6-.2 0-.5 0-.7-.1l-.2 1.5c.4.1.8.1 1.2.1 1.8 0 2.8-.8 3.6-2.9l4-9.9h-1.7z"/>
              <path fill="#4285F4" d="M56.4 4.4c-3.1 0-5.6 2.5-5.6 5.6s2.5 5.6 5.6 5.6c1.9 0 3.2-.8 3.9-1.9v1.6H62V4.7h-1.7v1.6c-.7-1.2-2-1.9-3.9-1.9zm0 9.6c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4z"/>
              <path fill="#34A853" d="M67 1h-1.7v14.3H67V1z"/>
            </svg>
            <h2 className="text-gray-700 text-xl font-medium mb-1">Iniciar sesión</h2>
            <p className="text-gray-500 text-sm">para continuar en FitForge</p>
          </div>

          {step === 'consent' && (
            <div className="px-8 pb-8">
              {/* Account pill */}
              <div className="flex items-center gap-3 border border-gray-200 rounded-full px-4 py-2.5 mb-6 cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {user?.firstName?.[0]}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
              </div>

              <div className="text-xs text-gray-400 text-center mb-5 px-2">
                Al continuar, Google compartirá tu nombre, dirección de email y foto de perfil con FitForge.
              </div>

              <button
                onClick={handleAllow}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-full transition-colors"
              >
                Continuar
              </button>
              <button
                onClick={() => window.close()}
                className="w-full mt-3 py-2.5 text-blue-600 text-sm font-medium hover:bg-gray-50 rounded-full transition-colors"
              >
                Usar otra cuenta
              </button>
            </div>
          )}

          {step === 'loading' && (
            <div className="px-8 pb-12 flex flex-col items-center gap-3">
              <Loader2 className="animate-spin text-blue-500" size={32} />
              <p className="text-sm text-gray-500">Verificando...</p>
            </div>
          )}

          {step === 'done' && (
            <div className="px-8 pb-12 flex flex-col items-center gap-3">
              <ShieldCheck className="text-green-500" size={32} />
              <p className="text-sm text-gray-600 font-medium">Sesión iniciada</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // GitHub
  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center font-sans">
      <div className="w-full max-w-sm px-8">
        {/* GitHub logo */}
        <div className="flex justify-center mb-6">
          <svg height="48" viewBox="0 0 16 16" fill="white">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
          </svg>
        </div>

        <div className="border border-[#30363d] rounded-lg bg-[#161b22] p-6">
          <h2 className="text-[#c9d1d9] text-xl font-semibold text-center mb-1">Autorizar FitForge</h2>
          <p className="text-[#8b949e] text-sm text-center mb-5">FitForge solicita acceso a tu cuenta</p>

          {step === 'consent' && (
            <>
              {/* Account */}
              <div className="flex items-center gap-3 border border-[#30363d] rounded-md px-3 py-3 mb-4 bg-[#0d1117]">
                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {user?.firstName?.[0]}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#c9d1d9] truncate">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-[#8b949e] truncate">@{user?.username}</p>
                </div>
              </div>

              {/* Permissions */}
              <div className="border border-[#30363d] rounded-md divide-y divide-[#30363d] mb-4 text-xs text-[#8b949e]">
                {['Leer datos del perfil público', 'Leer dirección de email'].map((p) => (
                  <div key={p} className="flex items-center gap-2 px-3 py-2">
                    <svg viewBox="0 0 16 16" className="text-green-400 shrink-0" width="14" fill="currentColor">
                      <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"/>
                    </svg>
                    {p}
                  </div>
                ))}
              </div>

              <button
                onClick={handleAllow}
                className="w-full py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md transition-colors mb-2"
              >
                Autorizar FitForge
              </button>
              <button
                onClick={() => window.close()}
                className="w-full py-2 border border-[#30363d] text-[#8b949e] hover:bg-[#21262d] text-sm rounded-md transition-colors"
              >
                Cancelar
              </button>
            </>
          )}

          {step === 'loading' && (
            <div className="flex flex-col items-center gap-3 py-4">
              <Loader2 className="animate-spin text-[#58a6ff]" size={28} />
              <p className="text-sm text-[#8b949e]">Autorizando...</p>
            </div>
          )}

          {step === 'done' && (
            <div className="flex flex-col items-center gap-3 py-4">
              <ShieldCheck className="text-green-400" size={28} />
              <p className="text-sm text-[#c9d1d9] font-medium">Autorización completada</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
