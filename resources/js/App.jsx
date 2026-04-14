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
import ActivateAccount from './pages/ActivateAccount'
import Calendario from './pages/Calendario'
import Clientes from './pages/Clientes'
import Entrenadores from './pages/Entrenadores'
import Facturacion from './pages/Facturacion'
import AdminNominas from './pages/AdminNominas'
import MisNominas from './pages/MisNominas'
import Configuracion from './pages/Configuracion'
import Suscripciones from './pages/Suscripciones'
import Estadisticas from './pages/Estadisticas'
import MiFicha from './pages/MiFicha'
import MisClases from './pages/MisClases'
import MisEstadisticas from './pages/MisEstadisticas'
import ReservaClases from './pages/ReservaClases'
import Notificaciones from './pages/Notificaciones'

function App() {
  const user = window.AppConfig?.user;
  const isClient = user?.role === 'cliente';

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
      <Route path="/activate-account/:token" element={<ActivateAccount />} />
      
      {/* Ruta Calendario (Asegurada por auth middleware en backend) */}
      <Route path="/calendario" element={isClient ? <ReservaClases /> : <Calendario />} />
      <Route path="/reserva-clases" element={<ReservaClases />} />
      <Route path="/clientes" element={<Clientes />} />
      <Route path="/users" element={<Clientes />} />
      <Route path="/entrenadores" element={<Entrenadores />} />
      <Route path="/facturas" element={<Facturacion />} />
      <Route path="/admin/nominas" element={<AdminNominas />} />
      <Route path="/mis-nominas" element={<MisNominas />} />
      <Route path="/configuracion" element={<Configuracion />} />
      <Route path="/configuracion/edit" element={<Configuracion />} />
      <Route path="/suscripciones" element={<Suscripciones />} />
      <Route path="/estadisticas" element={<Estadisticas />} />
      <Route path="/mi-ficha" element={<MiFicha />} />
      <Route path="/mis-clases" element={<MisClases />} />
      <Route path="/mis-estadisticas" element={<MisEstadisticas />} />
      <Route path="/notificaciones" element={<Notificaciones />} />
    </Routes>
  )
}

export default App
