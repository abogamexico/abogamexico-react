import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { LangProvider } from './context/LangContext'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import DashboardAbogado from './pages/DashboardAbogado'
import { Privacidad, Terminos } from './pages/Legal'
import Restablecer from './pages/Restablecer'
import Expediente from './pages/Expediente'
import Admin from './pages/Admin'

function PrivateRoute({ children, requiredTipo }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',fontFamily:'Inter,sans-serif',color:'#aaa'}}>Cargando...</div>
  if (!user) return <Navigate to="/" replace />
  if (requiredTipo && user.user_metadata?.tipo !== requiredTipo) return <Navigate to="/" replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/dashboard" element={
        <PrivateRoute requiredTipo="cliente"><Dashboard /></PrivateRoute>
      } />
      <Route path="/abogado" element={
        <PrivateRoute requiredTipo="abogado"><DashboardAbogado /></PrivateRoute>
      } />
      <Route path="/admin" element={<PrivateRoute><Admin /></PrivateRoute>} />
      <Route path="/abogado/consulta/:id" element={
        <PrivateRoute requiredTipo="abogado"><Expediente /></PrivateRoute>
      } />
      <Route path="/privacidad" element={<Privacidad />} />
      <Route path="/terminos" element={<Terminos />} />
      <Route path="/restablecer" element={<Restablecer />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <LangProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </LangProvider>
    </BrowserRouter>
  )
}
