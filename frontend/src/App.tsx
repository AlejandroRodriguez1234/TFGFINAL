import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@store/authStore'
import { Suspense, lazy } from 'react'
import { PageLoader } from '@components/ui/PageLoader'
import AppLayout from '@components/layout/AppLayout'
import AuthLayout from '@components/layout/AuthLayout'

// Lazy load pages for code splitting
const Landing        = lazy(() => import('@pages/Landing/LandingPage'))
const Login          = lazy(() => import('@pages/Auth/LoginPage'))
const Register       = lazy(() => import('@pages/Auth/RegisterPage'))
const Dashboard      = lazy(() => import('@pages/Dashboard/DashboardPage'))
const Habits         = lazy(() => import('@pages/Habits/HabitsPage'))
const Gym            = lazy(() => import('@pages/Gym/GymPage'))
const GymWorkout     = lazy(() => import('@pages/Gym/WorkoutPage'))
const Diet           = lazy(() => import('@pages/Diet/DietPage'))
const DietPlanner    = lazy(() => import('@pages/Diet/DietPlannerPage'))
const Progress       = lazy(() => import('@pages/Progress/ProgressPage'))
const Social         = lazy(() => import('@pages/Social/SocialPage'))
const Profile        = lazy(() => import('@pages/Profile/ProfilePage'))
const Settings       = lazy(() => import('@pages/Profile/SettingsPage'))
const Admin          = lazy(() => import('@pages/Admin/AdminPage'))
const AdminUsers     = lazy(() => import('@pages/Admin/UsersPage'))
const Trainer        = lazy(() => import('@pages/Trainer/TrainerPage'))
const NotFound       = lazy(() => import('@pages/NotFound'))
const OAuthMock      = lazy(() => import('@pages/Auth/OAuthMockPage'))

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.role !== 'ADMIN') return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

function TrainerRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.role !== 'TRAINER' && user?.role !== 'ADMIN') return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <>{children}</>
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* OAuth popup pages (no layout) */}
        <Route path="/oauth" element={<OAuthMock />} />

        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route element={<AuthLayout />}>
          <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        </Route>

        {/* Protected App */}
        <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
          <Route path="/dashboard"        element={<Dashboard />} />
          <Route path="/habits"           element={<Habits />} />
          <Route path="/gym"              element={<Gym />} />
          <Route path="/gym/workout/:id"  element={<GymWorkout />} />
          <Route path="/diet"             element={<Diet />} />
          <Route path="/diet/planner"     element={<DietPlanner />} />
          <Route path="/progress"         element={<Progress />} />
          <Route path="/social"           element={<Social />} />
          <Route path="/profile"          element={<Profile />} />
          <Route path="/settings"         element={<Settings />} />
        </Route>

        {/* Trainer */}
        <Route path="/trainer" element={<TrainerRoute><AppLayout /></TrainerRoute>}>
          <Route index element={<Trainer />} />
        </Route>

        {/* Admin */}
        <Route path="/admin" element={<AdminRoute><AppLayout /></AdminRoute>}>
          <Route index          element={<Admin />} />
          <Route path="users"   element={<AdminUsers />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}
