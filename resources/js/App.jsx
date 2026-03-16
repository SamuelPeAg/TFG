import { Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import Home from './pages/Home'
import Contact from './pages/Contact'
import LegalNotice from './pages/LegalNotice'
import PrivacyPolicy from './pages/PrivacyPolicy'
import CookiesPolicy from './pages/CookiesPolicy'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Calendario from './pages/Calendario'
import Clientes from './pages/Clientes'

function App() {
  return (
    <Routes>
      {/* Rutas con MainLayout (navbar y footer) */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/contacto" element={<Contact />} />
        <Route path="/aviso-legal" element={<LegalNotice />} />
        <Route path="/politica-privacidad" element={<PrivacyPolicy />} />
        <Route path="/politica-cookies" element={<CookiesPolicy />} />
      </Route>

      {/* Rutas Auth sin MainLayout (login, register, etc.) */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      
      {/* Ruta Calendario (Asegurada por auth middleware en backend) */}
      <Route path="/calendario" element={<Calendario />} />
      <Route path="/clientes" element={<Clientes />} />
      <Route path="/users" element={<Clientes />} />
    </Routes>
  )
}

export default App
