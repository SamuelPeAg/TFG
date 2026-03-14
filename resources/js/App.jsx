import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import Welcome from './pages/Welcome.jsx';
import Login from './pages/login/signup/Login.jsx';
import Register from './pages/login/signup/Register.jsx';
import ForgotPassword from './pages/login/signup/ForgotPassword.jsx';
import ResetPassword from './pages/login/signup/ResetPassword.jsx';
import Contact from './pages/Contact.jsx';
import Calendario from './pages/Calendario.jsx';
import Configuracion from './pages/Configuracion.jsx';
import Pagos from './pages/Pagos.jsx';
import Entrenadores from './pages/Entrenadores.jsx';
import Clientes from './pages/Clientes.jsx';
import NominasAdmin from './pages/NominasAdmin.jsx';
import NominasEntrenador from './pages/NominasEntrenador.jsx';

function App() {
    return (
        <Routes>
            {/* PÁGINA DE INICIO (Independiente para diseño perfecto) */}
            <Route path="/" element={<Welcome />} />

            {/* RUTAS PÚBLICAS (Con Header y Footer normales) */}
            <Route element={<PublicLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/contacto" element={<Contact />} />
            </Route>

            {/* RUTAS PRIVADAS (Panel con Sidebar) */}
            <Route element={<DashboardLayout />}>
                <Route path="/calendario" element={<Calendario />} />
                <Route path="/configuracion" element={<Configuracion />} />
                <Route path="/facturas" element={<Pagos />} />
                <Route path="/entrenadores" element={<Entrenadores />} />
                <Route path="/users" element={<Clientes />} />
                <Route path="/admin/nominas" element={<NominasAdmin />} />
                <Route path="/entrenador/nominas" element={<NominasEntrenador />} />
            </Route>
        </Routes>
    );
}

export default App;
