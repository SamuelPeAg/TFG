import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import axios from 'axios'

export default function Login() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    try {
      const response = await axios.post('/login', formData)
      // Si el login es exitoso, redirigir al calendario (como indica Laravel)
      if (response.status === 200 || response.status === 204) {
        window.location.href = '/calendario'
      }
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors)
      } else if (err.response?.data?.message) {
        setErrors({ general: err.response.data.message })
      } else {
        setErrors({ general: 'Error al iniciar sesión. Intenta de nuevo.' })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <div className="grow bg-gradient-to-br from-gray-50 via-brandTeal/10 to-brandCoral/10 flex flex-col justify-center py-20 mt-10 sm:px-6 lg:px-8">

      {/* Contenedor interior centrado */}
      <div className="sm:mx-auto w-full max-w-7xl">
        
        {/* Grid Responsivo: 1 col móvil, 2 cols desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          
          {/* Columna izquierda: Información (Oculta en móvil pequeño, visible en lg) */}
          <div className="hidden lg:block space-y-8 px-4">
            <div className="text-left space-y-6">
              <h1 className="text-4xl lg:text-5xl font-black text-gray-900 leading-tight">
                Bienvenido a <br />
                <span className="text-gray-900">
                  Factomove
                </span>
              </h1>
              <p className="text-lg lg:text-xl text-gray-600 leading-relaxed max-w-lg">
                Accede a tu panel de gestión y lleva el control integral de tus entrenamientos, usuarios y pagos desde cualquier dispositivo.
              </p>
              
              {/* Features badges */}
              <div className="flex flex-col gap-5 pt-2">
                <div className="flex items-center gap-4 p-3 bg-white/50 rounded-xl backdrop-blur-sm border border-white/40 w-fit">
                  <div className="w-10 h-10 rounded-full bg-brandTeal/20 flex items-center justify-center shrink-0">
                    <i className="fa-solid fa-dumbbell text-brandTeal text-lg"></i>
                  </div>
                  <span className="text-sm font-bold text-gray-700">Gestión de Entrenadores</span>
                </div>

                <div className="flex items-center gap-4 p-3 bg-white/50 rounded-xl backdrop-blur-sm border border-white/40 w-fit">
                  <div className="w-10 h-10 rounded-full bg-brandCoral/20 flex items-center justify-center shrink-0">
                    <i className="fa-solid fa-users text-brandCoral text-lg"></i>
                  </div>
                  <span className="text-sm font-bold text-gray-700">Control de Usuarios</span>
                </div>
              </div>
            </div>
          </div>

          {/* Columna derecha: Formulario de Login */}
          <div className="w-full max-w-md mx-auto lg:max-w-full">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              
              {/* Encabezado compacto con Logo */}
              <div className="px-8 pt-8 pb-6 text-center bg-gradient-to-br from-white to-gray-50/50">
                
                {/* Logo responsive */}
                <img
                  src="/img/logopng.png"
                  alt="Factomove Logo"
                  className="h-12 lg:h-16 w-auto mx-auto mb-4 transition-all duration-300"
                />
                
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">¡Hola de nuevo!</h2>
                <p className="mt-2 text-sm text-gray-500 font-medium">Ingresa tus credenciales para continuar</p>
              </div>

              {/* Formulario */}
              <div className="px-8 pb-8 pt-2">
                {errors.general && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-800 text-sm rounded-lg flex items-center gap-2">
                    <i className="fa-solid fa-circle-exclamation"></i>
                    {errors.general}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  
                  {/* Input Email */}
                  <div className="group">
                    <label htmlFor="email" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Correo Electrónico
                    </label>
                    <div className="relative group-focus-within:text-brandTeal transition-colors">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i className="fa-solid fa-envelope text-gray-400 group-focus-within:text-brandTeal transition-colors duration-200"></i>
                      </div>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brandTeal/20 focus:bg-white focus:border-brandTeal outline-none transition-all duration-200 text-sm font-medium text-gray-800 placeholder-gray-400"
                        placeholder="ejemplo@correo.com"
                        required
                        autoFocus
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-500 font-semibold flex items-center gap-1">
                        <i className="fa-solid fa-circle-exclamation"></i>
                        {errors.email[0]}
                      </p>
                    )}
                  </div>

                  {/* Input Contraseña */}
                  <div className="group">
                    <div className="flex justify-between items-center mb-2">
                      <label htmlFor="password" className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Contraseña
                      </label>
                      <Link
                        to="/forgot-password"
                        className="text-xs text-brandTeal hover:text-brandTeal/80 font-bold transition-colors"
                      >
                        ¿Olvidaste tu contraseña?
                      </Link>
                    </div>
                    <div className="relative group-focus-within:text-brandCoral transition-colors">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i className="fa-solid fa-lock text-gray-400 group-focus-within:text-brandCoral transition-colors duration-200"></i>
                      </div>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brandCoral/20 focus:bg-white focus:border-brandCoral outline-none transition-all duration-200 text-sm font-medium text-gray-800 placeholder-gray-400"
                        placeholder="••••••••"
                        required
                        autoComplete="current-password"
                      />
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-xs text-red-500 font-semibold flex items-center gap-1">
                        <i className="fa-solid fa-circle-exclamation"></i>
                        {errors.password[0]}
                      </p>
                    )}
                  </div>

                  {/* Botón Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 group relative flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-brandTeal/30 text-sm font-bold text-white btn-gradient hover:shadow-xl hover:shadow-brandCoral/30 hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brandTeal transition-all duration-300 transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                      <i className="fa-solid fa-right-to-bracket text-white/50 group-hover:text-white transition-colors"></i>
                    </span>
                    {loading ? 'INICIANDO...' : 'INICIAR SESIÓN'}
                  </button>
                </form>

                {/* Footer Tarjeta */}
                <div className="mt-8 pt-6 border-t border-gray-50 text-center">
                  <p className="text-sm text-gray-600">
                    ¿Aún no eres miembro?{' '}
                    <Link
                      to="/register"
                      className="font-bold text-brandTeal hover:text-brandCoral transition-colors duration-200 inline-flex items-center gap-1"
                    >
                      Crea una cuenta gratis
                      <i className="fa-solid fa-arrow-right text-xs"></i>
                    </Link>
                  </p>
                </div>
              </div>
            </div>
            
            {/* Copyright móvil (opcional, si se quiere dentro del viewport) */}
            <div className="mt-8 text-center lg:hidden">
              <p className="text-xs text-gray-400">&copy; {new Date().getFullYear()} Factomove. Todos los derechos reservados.</p>
            </div>
          </div>

        </div>
      </div>
      </div>
      
      <Footer />
    </div>
  )
}
