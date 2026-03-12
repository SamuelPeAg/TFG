import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';

export default function Welcome() {
    useEffect(() => {
        const observerOptions = { threshold: 0.1 };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, observerOptions);

        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

        return () => observer.disconnect();
    }, []);

    return (
        <div className="welcome-page">
            <Header />

            <main>
                {/* 1. HERO SECTION */}
                <section style={{ backgroundColor: '#fff', paddingTop: '250px' }}>
                    <div className="container-custom">
                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '80px', alignItems: 'center' }}>
                            <div className="reveal active">
                                <span className="small-caps-header">Impulsado por Moverte da Vida</span>
                                <h1 className="hero-title">
                                    Tu centro, <br />
                                    <span className="text-gradient">sincronizado.</span>
                                </h1>
                                <p className="hero-subtitle">
                                    Desde el control de sesiones a pie de pista hasta la liquidación final. Una sola herramienta limpia y eficiente.
                                </p>
                                <div className="hero-buttons">
                                    <Link to="/login" style={{ padding: '20px 40px', backgroundColor: '#111', color: '#fff', borderRadius: '15px', textDecoration: 'none', fontWeight: '900', fontSize: '20px' }}>
                                        Acceder al Sistema
                                    </Link>
                                    <a href="#solucion" style={{ padding: '20px 40px', backgroundColor: '#fff', border: '1px solid #ddd', color: '#111', borderRadius: '15px', textDecoration: 'none', fontWeight: '900', fontSize: '20px' }}>
                                        ¿Cómo funciona?
                                    </a>
                                </div>
                            </div>

                            <div className="reveal active" style={{ transitionDelay: '200ms' }}>
                                <div style={{ animation: 'float 6s ease-in-out infinite' }}>
                                    <div className="glass-card">
                                        <div style={{ backgroundColor: '#f9f9f9', borderRadius: '25px', padding: '40px', border: '1px solid #eee' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
                                                <div>
                                                    <p style={{ color: '#4BB7AE', fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '5px' }}>Agenda de Hoy</p>
                                                    <h4 style={{ fontSize: '28px', fontWeight: '900', margin: 0 }}>Mis Sesiones</h4>
                                                </div>
                                                <div style={{ backgroundColor: 'rgba(239, 93, 122, 0.1)', padding: '15px', borderRadius: '15px' }}>
                                                    <i className="fa-solid fa-calendar-day" style={{ color: '#EF5D7A', fontSize: '24px' }}></i>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                                <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 5px 15px rgba(0,0,0,0.02)' }}>
                                                    <span style={{ fontWeight: '800' }}>10:00 - Yoga Vinyasa</span>
                                                    <span style={{ fontSize: '10px', backgroundColor: '#4BB7AE', color: '#fff', padding: '5px 12px', borderRadius: '20px', fontWeight: '900' }}>CONFIRMAR</span>
                                                </div>
                                                <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.5 }}>
                                                    <span style={{ fontWeight: '800' }}>12:30 - Personal Tr.</span>
                                                    <span style={{ fontSize: '10px', backgroundColor: '#eee', color: '#666', padding: '5px 12px', borderRadius: '20px', fontWeight: '900' }}>PENDIENTE</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. SOLUCION SECTION */}
                <section id="solucion" style={{ backgroundColor: '#fff', borderTop: '1px solid #f5f5f5', borderBottom: '1px solid #f5f5f5' }}>
                    <div className="container-custom">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '100px', alignItems: 'center' }}>
                            <div className="reveal">
                                <span className="small-caps-header" style={{ color: '#EF5D7A' }}>La Transformación</span>
                                <h2 className="section-title">Del caos del Excel a la gestión viva.</h2>
                                <p style={{ fontSize: '20px', color: '#666', lineHeight: '1.6', marginBottom: '40px' }}>
                                    Antiguamente, la gestión en <strong>Moverte da Vida</strong> se basaba en el intercambio constante de archivos. Un caos de 240 documentos al año donde era imposible cuadrar cobros y horas.
                                </p>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                                    <div className="stat-card">
                                        <p style={{ fontSize: '50px', fontWeight: '900', color: '#EF5D7A', margin: '0 0 5px 0' }}>240</p>
                                        <p style={{ fontSize: '10px', fontWeight: '900', color: '#aaa', textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>Archivos / Año</p>
                                    </div>
                                    <div className="stat-card" style={{ borderLeftColor: '#4BB7AE' }}>
                                        <p style={{ fontSize: '50px', fontWeight: '900', color: '#4BB7AE', margin: '0 0 5px 0' }}>100%</p>
                                        <p style={{ fontSize: '10px', fontWeight: '900', color: '#aaa', textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>Digitalizado</p>
                                    </div>
                                </div>
                            </div>

                            <div className="reveal" style={{ display: 'flex', flexDirection: 'column', gap: '50px' }}>
                                {[
                                    { icon: 'fa-mobile-screen-button', title: 'Entrenador conectado', text: 'Cada coach tiene su propio panel personal para consultar sus horarios y gestionar la asistencia al momento.' },
                                    { icon: 'fa-cash-register', title: 'Control total de cobros', text: 'Registro inmediato del método de pago. El entrenador valida el cobro al terminar la sesión.' },
                                    { icon: 'fa-wand-magic-sparkles', title: 'Nóminas automáticas', text: 'Toda la actividad del equipo alimenta el generador de nóminas masivo. Cálculos perfectos en 1 clic.' }
                                ].map((item, idx) => (
                                    <div key={idx} style={{ display: 'flex', gap: '30px' }}>
                                        <div style={{ width: '70px', height: '70px', backgroundColor: '#f9f9f9', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', color: '#4BB7AE', border: '1px solid #eee', flexShrink: 0 }}>
                                            <i className={`fa-solid ${item.icon}`}></i>
                                        </div>
                                        <div>
                                            <h4 style={{ fontSize: '22px', fontWeight: '900', marginBottom: '10px', marginTop: 0 }}>{item.title}</h4>
                                            <p style={{ fontSize: '16px', color: '#777', margin: 0, lineHeight: '1.5' }}>{item.text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. BENEFITS SECTION */}
                <section style={{ backgroundColor: '#fcfcfc' }}>
                    <div className="container-custom">
                        <div style={{ textAlign: 'center', marginBottom: '100px' }} className="reveal">
                            <span className="small-caps-header">Core Benefits</span>
                            <h2 className="section-title">Todo lo que hacemos por ti.</h2>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px' }} className="reveal">
                            {[
                                { icon: 'fa-hotel', title: 'Gestión Multi-Centro', text: 'Controla todas tus sedes (Aira, Open Arena...) desde una única cuenta maestra.' },
                                { icon: 'fa-calculator', title: 'Cálculo de Tramos', text: 'Lógica de precios automática integrada según la duración y tipo de sesión.' },
                                { icon: 'fa-user-check', title: 'Control de Asistencia', text: 'Los entrenadores marcan la presencia del cliente al instante desde el móvil.' },
                                { icon: 'fa-file-pdf', title: 'PDFs Automáticos', text: 'Generación instantánea de borradores de nóminas listos para su revisión.' }
                            ].map((item, id) => (
                                <div key={id} className="advantage-box">
                                    <div style={{ width: '80px', height: '80px', backgroundColor: '#f9f9f9', borderRadius: '25px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '35px', margin: '0 auto 30px auto', color: '#4BB7AE', border: '1px solid #eee' }}>
                                        <i className={`fa-solid ${item.icon}`}></i>
                                    </div>
                                    <h5 style={{ fontSize: '18px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '20px' }}>{item.title}</h5>
                                    <p style={{ fontSize: '14px', color: '#777', lineHeight: '1.6' }}>{item.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 4. FINAL CTA */}
                <section style={{ backgroundColor: '#fff', textAlign: 'center', paddingBottom: '250px' }}>
                    <div className="container-custom reveal">
                        <h2 className="section-title">Impulsar tu centro <br /> hacia el futuro.</h2>
                        <p style={{ fontSize: '24px', color: '#666', maxWidth: '700px', margin: '0 auto 60px auto' }}>
                            La digitalización inteligente es la ventaja competitiva para centros de alto rendimiento como <strong>Moverte da Vida</strong>.
                        </p>
                        <Link to="/login" style={{ display: 'inline-block', padding: '30px 60px', backgroundColor: '#EF5D7A', color: '#fff', borderRadius: '30px', fontWeight: '900', fontSize: '28px', textDecoration: 'none', boxShadow: '0 20px 40px rgba(239, 93, 122, 0.3)' }}>
                            Acceder al Sistema
                        </Link>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
