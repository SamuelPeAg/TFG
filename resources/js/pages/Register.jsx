import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

export default function Register() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    terms: false
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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
      const response = await axios.post('/register', formData)
      if (response.status === 201 || response.status === 200) {
        window.location.href = '/login?registered=true'
      }
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors)
      } else if (err.response?.data?.message) {
        setErrors({ general: err.response.data.message })
      } else {
        setErrors({ general: 'Error al registrarse. Intenta de nuevo.' })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen pt-24 lg:pt-28 bg-gradient-to-br from-white via-brandTeal/30 to-brandCoral/40">

      {/* Contenedor principal */}
      <div className="flex-grow flex items-center justify-center p-4 sm:p-8">
        
        {/* TARJETA DE REGISTRO */}
        <div className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/60">
          
          {/* ENCABEZADO DE LA TARJETA */}
          <div className="px-8 pt-10 pb-4 text-center">
            <img
              src="/img/logopng.png"
              alt="Factomove Logo"
              className="h-28 w-auto mx-auto mb-6 transform hover:scale-105 transition duration-300"
            />
            
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Únete a Factomove</h2>
            <p className="mt-2 text-sm text-gray-500">
              Crea tu cuenta y empieza a gestionar el movimiento.
            </p>
          </div>

          {/* FORMULARIO */}
          <div className="px-8 pb-10">
            {errors.general && (
              <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-800 text-sm rounded-lg flex items-center gap-2">
                <i className="fa-solid fa-circle-exclamation"></i>
                {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              
              {/* NOMBRE */}
              <div className="group">
                <label htmlFor="name" className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 ml-1">
                  Nombre Completo
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fa-solid fa-user text-brandCoral group-focus-within:text-brandCoral/80 transition text-lg"></i>
                  </div>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl outline-none transition duration-200 sm:text-sm font-medium text-gray-800 ${
                      errors.name ? 'border-red-500 ring-2 ring-red-100' : 'border-gray-200 focus:ring-2 focus:ring-green-500'
                    }`}
                    placeholder="Ej. MariaGarcia"
                    required
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-xs text-red-500 font-bold ml-1">{errors.name[0]}</p>
                )}
              </div>

              {/* EMAIL */}
              <div className="group">
                <label htmlFor="email" className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 ml-1">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fa-solid fa-envelope text-brandCoral group-focus-within:text-brandCoral/80 transition text-lg"></i>
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl outline-none transition duration-200 sm:text-sm font-medium text-gray-800 ${
                      errors.email ? 'border-red-500 ring-2 ring-red-100' : 'border-gray-200 focus:ring-2 focus:ring-green-500'
                    }`}
                    placeholder="tucorreo@ejemplo.com"
                    required
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500 font-bold ml-1">{errors.email[0]}</p>
                )}
              </div>

              {/* CONTRASEÑA */}
              <div className="group">
                <label htmlFor="password" className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 ml-1">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fa-solid fa-lock text-brandCoral group-focus-within:text-brandCoral/80 transition text-lg"></i>
                  </div>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl outline-none transition duration-200 sm:text-sm font-medium text-gray-800 ${
                      errors.password ? 'border-red-500 ring-2 ring-red-100' : 'border-gray-200 focus:ring-2 focus:ring-green-500'
                    }`}
                    placeholder="Mínimo 8 caracteres"
                    required
                    autoComplete="new-password"
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-500 font-bold ml-1">{errors.password[0]}</p>
                )}
              </div>

              {/* CONFIRMAR CONTRASEÑA */}
              <div className="group">
                <label htmlFor="password_confirmation" className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 ml-1">
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fa-solid fa-check-double text-brandCoral group-focus-within:text-brandCoral/80 transition text-lg"></i>
                  </div>
                  <input
                    type="password"
                    id="password_confirmation"
                    name="password_confirmation"
                    value={formData.password_confirmation}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl outline-none transition duration-200 sm:text-sm font-medium text-gray-800 ${
                      errors.password ? 'border-red-500 ring-2 ring-red-100' : 'border-gray-200 focus:ring-2 focus:ring-green-500'
                    }`}
                    placeholder="Repite tu contraseña"
                    required
                  />
                </div>
              </div>

              {/* TÉRMINOS Y CONDICIONES */}
              <div className="flex items-start mt-2">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    checked={formData.terms}
                    onChange={handleChange}
                    required
                    className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-green-500/30 text-green-600 cursor-pointer"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="terms" className="font-medium text-gray-600">
                    He leído y acepto los{' '}
                    <Link to="/aviso-legal" className="text-brandTeal hover:underline font-bold">
                      Términos y Condiciones
                    </Link>
                  </label>
                </div>
              </div>
              {errors.terms && (
                <p className="mt-1 text-xs text-red-500 font-bold ml-1">{errors.terms[0]}</p>
              )}

              {/* BOTÓN REGISTRAR */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3.5 px-4 mt-6 border border-transparent rounded-xl shadow-lg shadow-brandCoral/30 text-sm font-bold text-white btn-gradient hover:shadow-xl hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brandTeal transition transform hover:-translate-y-0.5 duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'CREANDO CUENTA...' : 'CREAR CUENTA'}
              </button>
            </form>

            {/* ENLACE INICIAR SESIÓN */}
            <div className="mt-8 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-white text-xs text-gray-400 uppercase font-bold tracking-wider">
                  ¿Ya tienes cuenta?
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="inline-block text-brandTeal font-bold hover:text-teal-800 transition underline decoration-2 decoration-transparent hover:decoration-brandTeal"
              >
                Inicia sesión aquí
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
