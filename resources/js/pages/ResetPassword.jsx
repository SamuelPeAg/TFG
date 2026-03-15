import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import axios from 'axios'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [formData, setFormData] = useState({
    password: '',
    password_confirmation: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    // Obtener email y token de URL
    const emailParam = searchParams.get('email')
    const tokenParam = searchParams.get('token')
    
    if (emailParam) setEmail(emailParam)
    if (tokenParam) setToken(tokenParam)
  }, [searchParams])

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
      const response = await axios.post('/reset-password', {
        email,
        token,
        password: formData.password,
        password_confirmation: formData.password_confirmation
      })
      
      if (response.status === 200) {
        setSuccess(true)
        setTimeout(() => {
          window.location.href = '/login'
        }, 2000)
      }
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors)
      } else if (err.response?.data?.message) {
        setErrors({ general: err.response.data.message })
      } else {
        setErrors({ general: 'Error al restablecer contraseña. Intenta de nuevo.' })
      }
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-brandTeal/30 to-brandCoral/40 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/60 p-8 text-center">
          <div className="mb-4 text-5xl">
            <i className="fa-solid fa-circle-check text-green-500"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">¡Contraseña actualizada!</h2>
          <p className="text-gray-600 mt-2">Redirigiendo a iniciar sesión...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-brandTeal/30 to-brandCoral/40 flex items-center justify-center p-4">

      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/60">

        {/* Header */}
        <div className="px-8 pt-12 pb-6 text-center">
          <img
            src="/img/logopng.png"
            alt="Factomove Logo"
            className="h-28 w-auto mx-auto mb-6 transform hover:scale-105 transition duration-300"
          />

          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Restablecer contraseña</h2>
          <p className="mt-2 text-sm text-gray-500">Crea una nueva contraseña para tu cuenta</p>
          <p className="mt-1 text-xs text-brandTeal font-semibold">{email}</p>
        </div>

        <div className="px-8 pb-10">
          {errors.general && (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <i className="fa-solid fa-triangle-exclamation mr-2"></i>
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Email (readonly) */}
              <div className="group md:col-span-2">
                <label htmlFor="email" className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 ml-1">
                  Email de acceso
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fa-solid fa-envelope text-gray-400 text-lg"></i>
                  </div>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={email}
                    readOnly
                    className="block w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none transition duration-200 sm:text-sm font-medium text-gray-800"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="group">
                <label htmlFor="password" className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 ml-1">
                  Nueva Contraseña
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
                    className={`block w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white focus:border-transparent outline-none transition duration-200 sm:text-sm font-medium text-gray-800 placeholder-gray-400 ${
                      errors.password ? 'border-red-500' : 'border-gray-200'
                    }`}
                    placeholder="Mínimo 8 caracteres"
                    required
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-500 font-bold ml-1">{errors.password[0]}</p>
                )}
              </div>

              {/* Confirm Password */}
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
                    className="block w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white focus:border-transparent outline-none transition duration-200 sm:text-sm font-medium text-gray-800 placeholder-gray-400"
                    placeholder="Repite la contraseña"
                    required
                  />
                </div>
              </div>

            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-8 w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-brandCoral/30 text-sm font-bold text-white btn-gradient hover:shadow-xl hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brandTeal transition transform hover:-translate-y-0.5 duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className="fa-solid fa-rotate mr-2"></i>
              {loading ? 'ACTUALIZANDO...' : 'ACTUALIZAR CONTRASEÑA'}
            </button>

            <Link
              to="/login"
              className="mt-5 block text-center text-sm font-semibold text-gray-600 hover:text-gray-900 transition"
            >
              <i className="fa-solid fa-arrow-left mr-2"></i> Volver a iniciar sesión
            </Link>
          </form>
        </div>
      </div>

    </div>
  )
}
