import { useState, useEffect } from 'react'
import axios from 'axios'

export default function Contact() {
  const [centros, setCentros] = useState([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  })
  const [formStatus, setFormStatus] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const loadCentros = async () => {
      try {
        const res = await axios.get('/api/centros', { timeout: 5000 })
        if (res.data && res.data.length > 0) {
          setCentros(res.data)
        }
      } catch (err) {
        console.error('Error:', err.message)
        setCentros([
          {
            id: 1,
            nombre: 'Aira Fitness Club',
            direccion: 'Calle Principal, Madrid',
            google_maps_link: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12594.463651533495!2d-4.780209212841773!3d37.89266410000003!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd6cdf7288300331%3A0x1bd6b7761e69d9a9!2sMoverte%20da%20vida%20-%20Aira%20fitness%20club!5e0!3m2!1ses!2ses!4v1768325180952!5m2!1ses!2ses'
          },
          {
            id: 2,
            nombre: 'Open Arena',
            direccion: 'Avenida Central, Madrid',
            google_maps_link: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12596.662396816844!2d-4.821452712841789!3d37.879809800000004!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd6d21986110736b%3A0xd2b686fab1dd9bb5!2sMoverte%20da%20Vida%20-%20Open%20Arena!5e0!3m2!1ses!2ses!4v1768325263249!5m2!1ses!2ses'
          },
          {
            id: 3,
            nombre: 'Centro de Salud',
            direccion: 'Paseo de la Salud, Madrid',
            google_maps_link: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12596.662396816844!2d-4.821452712841789!3d37.879809800000004!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd6d210ee12d99e3%3A0x2e64896407139591!2sMoverte%20da%20vida%20-%20centro%20de%20salud%20y%20ejercicio!5e0!3m2!1ses!2ses!4v1768326010698!5m2!1ses!2ses'
          }
        ])
      } finally {
        setLoading(false)
      }
    }
    loadCentros()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setFormStatus(null)
    try {
      await axios.post('/contacto/enviar', formData)
      setFormStatus({ type: 'success', message: '¡Mensaje enviado correctamente! Nos pondremos en contacto contigo pronto.' })
      setFormData({ name: '', email: '', phone: '', message: '' })
    } catch (err) {
      const message = err.response?.data?.message || 'Error al enviar el mensaje. Intenta de nuevo.'
      setFormStatus({ type: 'error', message })
    } finally {
      setSubmitting(false)
    }
  }

  const colors = ['bg-brandTeal', 'bg-brandCoral', 'bg-brandAqua']
  const textColors = ['text-white', 'text-white', 'text-gray-900']
  const icons = ['fa-dumbbell', 'fa-sun', 'fa-heart-pulse']
  const tags = ['Maquinaria especializada', 'Aire libre y funcional', 'Salud y ejercicio']

  return (
    <div className="min-h-screen bg-white">
      {/* SECCIÓN HERO COMPACTA */}
      <section className="bg-gradient-to-b from-brandTeal/20 to-white pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-12 pb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Contáctanos
          </h1>
          <p className="text-base text-gray-600 max-w-xl mx-auto">
            Elige tu centro favorito o envíanos un mensaje
          </p>
        </div>
      </section>

      {/* SECCIÓN PRINCIPAL: CENTROS + FORMULARIO */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Grid de 2 columnas: Centros a la izquierda, Formulario a la derecha */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* COLUMNA IZQUIERDA: CENTROS */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Nuestros 3 Centros</h2>
              
              <div className="space-y-4">
                {loading ? (
                  <p className="text-gray-500">Cargando centros...</p>
                ) : (
                  centros.map((centro, index) => (
                    <div key={centro.id} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition">
                      <div className="flex flex-col sm:flex-row">
                        <div className="sm:w-2/5 h-40 sm:h-auto relative">
                          <iframe
                            className="absolute inset-0 w-full h-full"
                            src={centro.google_maps_link}
                            style={{border: '0'}}
                            allowFullScreen=""
                            loading="lazy"
                            title={centro.nombre}
                          ></iframe>
                        </div>
                        <div className="sm:w-3/5 p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`${colors[index % 3]} ${textColors[index % 3]} px-2 py-1 rounded-full text-xs font-bold`}>
                              {centro.nombre.toUpperCase()}
                            </span>
                            <h3 className="text-lg font-bold text-gray-900">{centro.nombre}</h3>
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p className="flex items-center gap-2">
                              <i className="fas fa-map-marker-alt text-brandTeal w-4"></i>
                              {centro.direccion}
                            </p>
                            <p className="flex items-center gap-2">
                              <i className={`fas ${icons[index % 3]} text-brandTeal w-4`}></i>
                              {tags[index % 3]}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Información de contacto */}
              <div className="mt-8 p-6 bg-gray-50 rounded-xl">
                <h3 className="font-bold text-gray-900 mb-4">Información de Contacto</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brandTeal/20 rounded-full flex items-center justify-center">
                      <i className="fas fa-envelope text-brandTeal"></i>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700">Email</p>
                      <a href="mailto:hola@factomove.com" className="text-brandTeal hover:underline">
                        hola@factomove.com
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brandCoral/20 rounded-full flex items-center justify-center">
                      <i className="fas fa-phone text-brandCoral"></i>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700">Teléfono</p>
                      <a href="tel:+34912345678" className="text-brandCoral hover:underline">
                        +34 912 345 678
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* COLUMNA DERECHA: FORMULARIO */}
            <div className="self-start">
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 sticky top-24">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Envíanos un Mensaje</h2>
                <p className="text-sm text-gray-600 mb-6">Te responderemos lo antes posible</p>

                {formStatus && (
                  <div className={`mb-4 p-3 border rounded-lg text-sm ${
                    formStatus.type === 'success' 
                      ? 'bg-green-100 border-green-200 text-green-800' 
                      : 'bg-red-100 border-red-200 text-red-800'
                  }`}>
                    <i className={`fas ${formStatus.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-2`}></i>
                    {formStatus.message}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1">
                      Nombre <span className="text-brandCoral">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brandTeal focus:border-brandTeal outline-none transition text-sm"
                      placeholder="Tu nombre completo"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">
                      Email <span className="text-brandCoral">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brandTeal focus:border-brandTeal outline-none transition text-sm"
                      placeholder="tu@email.com"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-1">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brandTeal focus:border-brandTeal outline-none transition text-sm"
                      placeholder="+34 600 000 000"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-1">
                      Mensaje <span className="text-brandCoral">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows="4"
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brandTeal focus:border-brandTeal outline-none transition resize-none text-sm"
                      placeholder="Cuéntanos cómo podemos ayudarte..."
                      required
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full btn-gradient text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <i className="fas fa-paper-plane mr-2"></i>
                    {submitting ? 'ENVIANDO...' : 'ENVIAR MENSAJE'}
                  </button>
                </form>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  )
}
