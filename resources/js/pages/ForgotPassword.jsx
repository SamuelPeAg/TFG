import { useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(null)

  const handleChange = (e) => {
    setEmail(e.target.value)
    if (errors.email) {
      setErrors({})
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})
    setStatus(null)

    try {
      const response = await axios.post('/forgot-password', { email })
      if (response.status === 200) {
        setStatus(response.data.message || 'Si el email existe, se enviará el enlace de recuperación.')
        setEmail('')
      }
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors)
      } else if (err.response?.data?.message) {
        setStatus(err.response.data.message)
      } else {
        setErrors({ general: 'Error al enviar el enlace. Intenta de nuevo.' })
      }
    } finally {
      setLoading(false)
    }
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

          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Recuperar contraseña</h2>
          <p className="mt-2 text-sm text-gray-500">Introduce tu email y te enviaremos un enlace para restablecerla</p>
        </div>

        <div className="px-8 pb-10">

          {status && (
            <div className="mb-5 rounded-2xl border border-brandTeal/30 bg-brandTeal/10 px-4 py-3 text-sm text-gray-700">
              <i className="fa-solid fa-circle-check text-brandTeal mr-2"></i>
              {status}
            </div>
          )}

          {errors.general && (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <i className="fa-solid fa-triangle-exclamation mr-2"></i>
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            <div className="group">
              <label htmlFor="email" className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 ml-1">
                Email de acceso
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fa-solid fa-envelope text-brandCoral group-focus-within:text-brandCoral/80 transition text-lg"></i>
                </div>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={email}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white focus:border-transparent outline-none transition duration-200 sm:text-sm font-medium text-gray-800 placeholder-gray-400 ${
                    errors.email ? 'border-red-500' : 'border-gray-200'
                  }`}
                  placeholder="tuemail@dominio.com"
                  required
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-500 font-bold ml-1">{errors.email[0]}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-8 w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-brandCoral/30 text-sm font-bold text-white btn-gradient hover:shadow-xl hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brandTeal transition transform hover:-translate-y-0.5 duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className="fa-solid fa-paper-plane mr-2"></i>
              {loading ? 'ENVIANDO...' : 'ENVIAR ENLACE DE RECUPERACIÓN'}
            </button>

            <Link
              to="/login"
              className="mt-5 block text-center text-sm font-semibold text-gray-600 hover:text-gray-900 transition"
            >
              <i className="fa-solid fa-arrow-left mr-2"></i> Volver a iniciar sesión
            </Link>

            <p className="mt-6 text-center text-xs text-gray-400">
              Por seguridad, si el email existe, enviaremos el enlace igualmente.
            </p>
          </form>
        </div>
      </div>

    </div>
  )
}
