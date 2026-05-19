import { Link } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center text-center px-4">
      <div>
        <div className="text-8xl font-display font-black text-gradient mb-4">404</div>
        <h1 className="text-2xl font-bold mb-2">Página no encontrada</h1>
        <p className="text-white/50 mb-8">La página que buscas no existe o ha sido movida.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => history.back()} className="btn-secondary">
            <ArrowLeft size={16} /> Volver
          </button>
          <Link to="/dashboard" className="btn-primary">
            <Home size={16} /> Ir al dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
