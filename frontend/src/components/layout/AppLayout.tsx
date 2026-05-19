import { Outlet } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAppStore } from '@store/appStore'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import { cn } from '@utils/cn'

export default function AppLayout() {
  const { sidebarOpen } = useAppStore()
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      <Sidebar />
      <div
        className={cn(
          'flex flex-col flex-1 overflow-hidden transition-all duration-300',
          sidebarOpen && !isMobile ? 'ml-64' : isMobile ? 'ml-0' : 'ml-16',
        )}
      >
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
