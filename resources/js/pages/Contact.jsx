import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Contact() {
  const [centros, setCentros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [formStatus, setFormStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadCentros = async () => {
      try {
        const res = await axios.get('/api/centros', { timeout: 5000 });
        if (res.data && res.data.length > 0) {
          setCentros(res.data);
        }
      } catch (err) {
        console.error('Error fetching centros, loading fallback:', err.message);
        // Fallback data if API fails or is not available
        setCentros([
          {
            id: 1,
            nombre: 'Aira Fitness Club',
            direccion: 'Av. de Rabanales, s/n, Levante, 14007 Córdoba',
            google_maps_link: 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d1765324.3289938641!2d-7.2000453!3d37.8926499!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd6cdf852e981d07%3A0xf6367ab1c976d7fb!2sAira%20Fitness%20Club!5e1!3m2!1ses!2ses!4v1774127157355!5m2!1ses!2ses'
          },
          {
            id: 2,
            nombre: 'Open Arena',
            direccion: 'C. Escritora Maria Goyri, s/n, 14005 Córdoba',
            google_maps_link: 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d110352.01090579458!2d-4.802398!3d37.87981!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd6d21986110736b%3A0xd2b686fab1dd9bb5!2sMoverte%20da%20Vida%20-%20Open%20Arena!5e1!3m2!1ses!2ses!4v1774126909735!5m2!1ses!2ses'
          },
          {
            id: 3,
            nombre: 'Centro de Salud',
            direccion: 'C. José Dámaso "Pepete", Poniente Sur, 14005 Córdoba',
            google_maps_link: 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d110356.86810429477!2d-4.797538!3d37.876568!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd6d210ee12d99e3%3A0x2e64896407139591!2sMoverte%20da%20vida%20-%20centro%20de%20salud%20y%20ejercicio!5e1!3m2!1ses!2ses!4v1774126923529!5m2!1ses!2ses'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    loadCentros();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormStatus(null);
    try {
      await axios.post('/contacto/enviar', formData);
      setFormStatus({ type: 'success', message: '¡Mensaje enviado con éxito! Nos pondremos en contacto contigo pronto.' });
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      const message = err.response?.data?.message || 'Hubo un error al enviar tu mensaje. Intenta de nuevo.';
      setFormStatus({ type: 'error', message });
    } finally {
      setSubmitting(false);
    }
  };

  const tags = ['Maquinaria especializada', 'Aire libre y funcional', 'Salud y ejercicio'];
  const icons = ['fa-dumbbell', 'fa-sun', 'fa-heart-pulse'];

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-[#38C1A3]/30 selection:text-teal-900">
       {/* HERO SECTION */}
       <section className="relative bg-slate-900 pt-24 pb-32 lg:pt-32 lg:pb-48 overflow-hidden z-0">
           {/* Decorative Background Elements */}
           <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[600px] h-[600px] bg-[#38C1A3]/20 rounded-full blur-[120px] opacity-70 pointer-events-none"></div>
           <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[500px] h-[500px] bg-[#eb567a]/20 rounded-full blur-[100px] opacity-60 pointer-events-none"></div>
           
           <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
               <span className="inline-block py-1.5 px-4 rounded-full bg-white/10 text-teal-300 backdrop-blur-md border border-white/10 text-xs font-black tracking-widest uppercase mb-6 shadow-sm">
                   A un paso de ti
               </span>
               <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight mb-6">
                   Hablemos de tu <br className="hidden md:block" />
                   <span className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight mb-6">
                       Próximo Objetivo
                   </span>
               </h1>
               <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto font-medium">
                   Ya sea para consultar una clase, revisar nuestras tarifas o simplemente conocernos. Estamos a tu disposición siempre.
               </p>
           </div>
       </section>

       {/* CONTACT FORM OVERLAPPING HERO */}
       <section className="relative z-20 -mt-20 lg:-mt-32 max-w-7xl mx-auto px-6 mb-24">
           <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col lg:flex-row">
               
               {/* Left Side: Info */}
               <div className="lg:w-2/5 md:bg-slate-50 p-10 md:p-14 border-b lg:border-b-0 lg:border-r border-slate-100 flex flex-col justify-center relative overflow-hidden">
                   {/* subtle bg graphic */}
                   <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-teal-400/5 rounded-full blur-3xl"></div>

                   <h3 className="text-3xl font-black text-slate-800 mb-8 tracking-tight relative z-10">Estamos para ti</h3>
                   
                   <div className="space-y-8 relative z-10">
                       <div className="flex gap-5 group">
                           <div className="w-14 h-14 shrink-0 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-xl text-[#38C1A3] group-hover:-translate-y-1 transition-transform">
                               <i className="fa-solid fa-envelope"></i>
                           </div>
                           <div>
                               <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Escríbenos</p>
                               <a href="mailto:hola@factomove.com" className="text-lg font-bold text-slate-700 hover:text-[#38C1A3] transition-colors">
                                   hola@factomove.com
                               </a>
                           </div>
                       </div>
                       
                       <div className="flex gap-5 group">
                           <div className="w-14 h-14 shrink-0 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-xl text-[#eb567a] group-hover:-translate-y-1 transition-transform">
                               <i className="fa-solid fa-phone"></i>
                           </div>
                           <div>
                               <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Llámanos</p>
                               <a href="tel:+34912345678" className="text-lg font-bold text-slate-700 hover:text-[#eb567a] transition-colors">
                                   +34 912 345 678
                               </a>
                           </div>
                       </div>

                       <div className="flex gap-5 group">
                           <div className="w-14 h-14 shrink-0 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-xl text-slate-800 group-hover:-translate-y-1 transition-transform">
                               <i className="fa-regular fa-clock"></i>
                           </div>
                           <div>
                               <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Horario Atención</p>
                               <p className="text-lg font-bold text-slate-700">
                                   Lun - Vie: 09:00 a 20:00
                               </p>
                           </div>
                       </div>
                   </div>
               </div>

               {/* Right Side: Form */}
               <div className="lg:w-3/5 p-10 md:p-14">
                   <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">Envíanos un mensaje</h3>
                   <p className="text-slate-500 font-medium mb-8">Te responderemos en menos de 24 horas laborables.</p>

                   {formStatus && (
                       <div className={`p-4 rounded-2xl mb-8 flex items-start gap-3 border ${
                           formStatus.type === 'success' 
                           ? 'bg-emerald-50 text-emerald-700 border-emerald-100 shadow-sm' 
                           : 'bg-rose-50 text-rose-700 border-rose-100 shadow-sm'
                       } animate-in fade-in slide-in-from-top-2`}>
                           <i className={`fa-solid ${formStatus.type === 'success' ? 'fa-circle-check text-emerald-500' : 'fa-circle-exclamation text-rose-500'} mt-0.5 text-lg`}></i>
                           <p className="font-bold text-sm leading-relaxed">{formStatus.message}</p>
                       </div>
                   )}

                   <form onSubmit={handleSubmit} className="space-y-6">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-2">
                               <label htmlFor="name" className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Nombre Completo <span className="text-[#eb567a]">*</span></label>
                               <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required 
                                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 focus:bg-white focus:border-[#38C1A3] focus:ring-4 focus:ring-[#38C1A3]/10 outline-none transition-all font-bold text-slate-700 placeholder:text-slate-400 placeholder:font-medium text-sm shadow-sm"
                                      placeholder="Ej. Juan Pérez" />
                           </div>
                           <div className="space-y-2">
                               <label htmlFor="email" className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Email <span className="text-[#eb567a]">*</span></label>
                               <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required 
                                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 focus:bg-white focus:border-[#38C1A3] focus:ring-4 focus:ring-[#38C1A3]/10 outline-none transition-all font-bold text-slate-700 placeholder:text-slate-400 placeholder:font-medium text-sm shadow-sm"
                                      placeholder="juan@ejemplo.com" />
                           </div>
                       </div>
                       
                       <div className="space-y-2">
                           <label htmlFor="phone" className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Teléfono (Opcional)</label>
                           <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} 
                                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 focus:bg-white focus:border-[#38C1A3] focus:ring-4 focus:ring-[#38C1A3]/10 outline-none transition-all font-bold text-slate-700 placeholder:text-slate-400 placeholder:font-medium text-sm shadow-sm"
                                  placeholder="+34 600 000 000" />
                       </div>

                       <div className="space-y-2">
                           <label htmlFor="message" className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Tu Mensaje <span className="text-[#eb567a]">*</span></label>
                           <textarea id="message" name="message" value={formData.message} onChange={handleChange} required rows="4"
                                     className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:bg-white focus:border-[#38C1A3] focus:ring-4 focus:ring-[#38C1A3]/10 outline-none transition-all font-bold text-slate-700 placeholder:text-slate-400 placeholder:font-medium text-sm resize-none shadow-sm"
                                     placeholder="¿En qué podemos ayudarte?"></textarea>
                       </div>

                       <button type="submit" disabled={submitting} 
                               className="w-full md:w-auto px-10 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold tracking-wide shadow-xl shadow-slate-900/20 transition-all hover:-translate-y-1 flex items-center justify-center gap-3 disabled:opacity-50 disabled:hover:translate-y-0">
                           {submitting ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-regular fa-paper-plane text-teal-400"></i>}
                           {submitting ? 'ENVIANDO...' : 'ENVIAR MENSAJE'}
                       </button>
                   </form>
               </div>
           </div>
       </section>

       {/* CENTROS SECTION */}
       <section className="max-w-7xl mx-auto px-6 pb-32">
           <div className="text-center mb-16">
               <span className="inline-block py-1.5 px-4 rounded-full bg-teal-50 text-[#38C1A3] font-black border border-teal-100 text-xs tracking-widest uppercase mb-4 shadow-sm">
                   Nuestras Instalaciones
               </span>
               <h2 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight">
                   Encuentra tu centro
               </h2>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {loading ? (
                   [1, 2, 3].map(i => (
                       <div key={i} className="bg-white rounded-[2rem] h-[400px] border border-slate-100 shadow-sm animate-pulse flex flex-col">
                           <div className="h-48 bg-slate-200 rounded-t-[2rem]"></div>
                           <div className="p-8 flex-1">
                               <div className="h-6 bg-slate-200 rounded-md w-3/4 mb-4"></div>
                               <div className="h-4 bg-slate-200 rounded-md w-full mb-2"></div>
                               <div className="h-4 bg-slate-200 rounded-md w-2/3"></div>
                           </div>
                       </div>
                   ))
               ) : (
                   centros.map((centro, index) => (
                       <div key={centro.id} className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden group hover:-translate-y-2 transition-transform duration-300">
                           {/* Map */}
                           <div className="h-56 relative overflow-hidden bg-slate-100">
                               <iframe
                                 className="absolute inset-0 w-full h-[150%] -top-1/4 pointer-events-none grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                                 src={centro.google_maps_link}
                                 style={{border: '0'}}
                                 allowFullScreen=""
                                 loading="lazy"
                                 title={centro.nombre}
                               ></iframe>
                               {/* Overlay shadow for UI contrast */}
                               <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-900/60 to-transparent flex items-end p-6">
                                   <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-sm">
                                       <i className="fa-solid fa-location-dot"></i>
                                   </div>
                               </div>
                           </div>
                           
                           {/* Content */}
                           <div className="p-8 relative">
                               {/* Decorative accent */}
                               <div className="absolute top-0 left-8 -translate-y-1/2 w-12 h-1 bg-[#38C1A3] rounded-full shadow-sm"></div>

                               <h3 className="text-xl font-black text-slate-800 mb-2 truncate" title={centro.nombre}>{centro.nombre}</h3>
                               
                               <div className="space-y-3 mt-6">
                                   <div className="flex items-start gap-4 text-slate-600">
                                       <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 mt-0.5">
                                           <i className="fa-solid fa-map-pin text-xs text-[#eb567a]"></i>
                                       </div>
                                       <p className="font-bold text-sm leading-relaxed pt-1.5">{centro.direccion}</p>
                                   </div>
                                   
                                   <div className="flex items-start gap-4 text-slate-600">
                                       <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 mt-0.5">
                                           <i className={`fa-solid ${icons[index % 3]} text-xs text-[#38C1A3]`}></i>
                                       </div>
                                       <p className="font-bold text-sm leading-relaxed pt-1.5">{tags[index % 3]}</p>
                                   </div>
                               </div>
                               
                               {/* Footer view map button - now properly links to Maps instead of trying to open embed */}
                               <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(centro.nombre + " " + centro.direccion)}`} target="_blank" rel="noreferrer" className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between text-sm font-black text-slate-400 hover:text-[#38C1A3] transition-colors group/link w-full">
                                   ABRIR EN MAPS
                                   <i className="fa-solid fa-arrow-right-long group-hover/link:translate-x-1 transition-transform text-lg"></i>
                               </a>
                           </div>
                       </div>
                   ))
               )}
           </div>
       </section>
    </div>
  );
}
