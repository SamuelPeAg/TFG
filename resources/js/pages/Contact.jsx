import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Contact() {
    const [centros, setCentros] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });
    const [status, setStatus] = useState({ type: null, message: '' });
    const [loading, setLoading] = useState(false);

    // Cargar los centros
    useEffect(() => {
        const fetchCentros = async () => {
            try {
                // Hacemos un GET al endpoint de nuestra API
                const response = await axios.get('/api/centros', {
                    headers: { 'Accept': 'application/json' }
                });
                setCentros(response.data);
            } catch (error) {
                console.error("Error al cargar los centros:", error);
            }
        };
        fetchCentros();
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: null, message: '' });

        try {
            const response = await axios.post('/contacto/enviar', formData);
            if (response.data.success) {
                setStatus({ type: 'success', message: response.data.message });
                setFormData({ name: '', email: '', phone: '', message: '' });
            }
        } catch (error) {
            if (error.response && error.response.status === 422) {
                // Errores de validación Laravel
                const errors = error.response.data.errors;
                const firstError = Object.values(errors)[0][0];
                setStatus({ type: 'error', message: firstError });
            } else {
                setStatus({ type: 'error', message: 'Error de conexión. Inténtalo de nuevo más tarde.' });
            }
        } finally {
            setLoading(false);
        }
    };

    const colors = ['#4BB7AE', '#EF5D7A', '#A5EFE2'];
    const icons = ['fa-dumbbell', 'fa-sun', 'fa-heart-pulse'];
    const tags = ['Maquinaria especializada', 'Aire libre y funcional', 'Salud y ejercicio'];

    return (
        <div className="bg-gray-50 flex-grow">
            {/* HER0 COMPACTA */}
            <section className="bg-gradient-to-b from-[#4BB7AE]/20 to-white pb-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-24 pb-16">
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
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Nuestros Centros</h2>

                            <div className="space-y-4">
                                {centros.length === 0 ? (
                                    <div className="animate-pulse flex space-x-4">
                                        <div className="flex-1 space-y-4 py-1">
                                            <div className="h-40 bg-gray-200 rounded w-full"></div>
                                        </div>
                                    </div>
                                ) : (
                                    centros.map((centro, index) => {
                                        const hexColor = colors[index % colors.length];
                                        const iconClass = icons[index % icons.length];
                                        const tagText = tags[index % tags.length];
                                        const mapUrl = centro.google_maps_link || `https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${encodeURIComponent(centro.nombre + " " + centro.direccion)}`;

                                        return (
                                            <div key={centro.id} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition">
                                                <div className="flex flex-col sm:flex-row">
                                                    <div className="sm:w-2/5 h-40 sm:h-auto relative">
                                                        <iframe
                                                            className="absolute inset-0 w-full h-full"
                                                            src={mapUrl}
                                                            style={{ border: 0 }}
                                                            allowFullScreen=""
                                                            loading="lazy"
                                                            title={`Mapa de ${centro.nombre}`}
                                                        ></iframe>
                                                    </div>
                                                    <div className="sm:w-3/5 p-4">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span style={{ backgroundColor: hexColor }} className={`px-2 py-1 rounded-full text-xs font-bold text-white`}>
                                                                {centro.nombre.toUpperCase()}
                                                            </span>
                                                            <h3 className="text-lg font-bold text-gray-900">{centro.nombre}</h3>
                                                        </div>
                                                        <div className="space-y-1 text-sm text-gray-600">
                                                            <p className="flex items-center gap-2">
                                                                <i className="fas fa-map-marker-alt text-[#4BB7AE] w-4"></i>
                                                                {centro.direccion}
                                                            </p>
                                                            <p className="flex items-center gap-2">
                                                                <i className={`fas ${iconClass} text-[#4BB7AE] w-4`}></i>
                                                                {tagText}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Información de contacto */}
                            <div className="mt-8 p-6 bg-gray-50 rounded-xl">
                                <h3 className="font-bold text-gray-900 mb-4">Información de Contacto</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-[#4BB7AE]/20 rounded-full flex items-center justify-center">
                                            <i className="fas fa-envelope text-[#4BB7AE]"></i>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-700">Email</p>
                                            <a href="mailto:hola@factomove.com" className="text-[#4BB7AE] hover:underline">
                                                hola@factomove.com
                                            </a>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-[#EF5D7A]/20 rounded-full flex items-center justify-center">
                                            <i className="fas fa-phone text-[#EF5D7A]"></i>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-700">Teléfono</p>
                                            <a href="tel:+34912345678" className="text-[#EF5D7A] hover:underline">
                                                +34 912 345 678
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* COLUMNA DERECHA: FORMULARIO */}
                        <div>
                            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 sticky top-24">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Envíanos un Mensaje</h2>
                                <p className="text-sm text-gray-600 mb-6">Te responderemos lo antes posible</p>

                                {status.type === 'success' && (
                                    <div className="mb-4 p-3 bg-green-100 border border-green-200 rounded-lg text-green-800 text-sm">
                                        <i className="fas fa-check-circle mr-2"></i>
                                        {status.message}
                                    </div>
                                )}

                                {status.type === 'error' && (
                                    <div className="mb-4 p-3 bg-red-100 border border-red-200 rounded-lg text-red-800 text-sm">
                                        <i className="fas fa-exclamation-circle mr-2"></i>
                                        {status.message}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1">
                                            Nombre <span className="text-[#EF5D7A]">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#4BB7AE] focus:border-[#4BB7AE] outline-none transition text-sm"
                                            placeholder="Tu nombre completo"
                                            required />
                                    </div>

                                    <div>
                                        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">
                                            Email <span className="text-[#EF5D7A]">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#4BB7AE] focus:border-[#4BB7AE] outline-none transition text-sm"
                                            placeholder="tu@email.com"
                                            required />
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
                                            className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#4BB7AE] focus:border-[#4BB7AE] outline-none transition text-sm"
                                            placeholder="+34 600 000 000" />
                                    </div>

                                    <div>
                                        <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-1">
                                            Mensaje <span className="text-[#EF5D7A]">*</span>
                                        </label>
                                        <textarea
                                            id="message"
                                            name="message"
                                            rows="4"
                                            value={formData.message}
                                            onChange={handleChange}
                                            className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#4BB7AE] focus:border-[#4BB7AE] outline-none transition resize-none text-sm"
                                            placeholder="Cuéntanos cómo podemos ayudarte..."
                                            required></textarea>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-gradient-to-r from-[#4BB7AE] to-[#EF5D7A] text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition duration-200 disabled:opacity-70">
                                        {loading ? (
                                            <span><i className="fas fa-circle-notch fa-spin mr-2"></i> ENVIANDO...</span>
                                        ) : (
                                            <span><i className="fas fa-paper-plane mr-2"></i> ENVIAR MENSAJE</span>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </div>
    );
}
