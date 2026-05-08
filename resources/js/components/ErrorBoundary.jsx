import React from 'react';
import axios from 'axios';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Actualiza el estado para que la próxima renderización muestre la IU de repuesto.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // También puedes registrar el error en un servicio de reporte de errores
    console.error("Uncaught Error:", error, errorInfo);
    
    // Enviar el error al backend para registrarlo
    this.logErrorToBackend(error, errorInfo, 'CRITICAL');
  }

  logErrorToBackend(error, errorInfo, level = 'ERROR') {
    try {
      axios.post('/api/log-client-error', {
        message: error.message || error.toString(),
        stack: errorInfo?.componentStack || error.stack,
        url: window.location.href,
        level: level
      }).catch(err => console.error("No se pudo registrar el error en el backend", err));
    } catch (e) {
      // Ignorar errores al enviar el log
    }
  }

  componentDidMount() {
    // Capturar promesas rechazadas (como peticiones axios no capturadas)
    window.addEventListener('unhandledrejection', (event) => {
      const error = event.reason;
      console.error("Unhandled Promise Rejection:", error);
      
      const message = error?.message || (typeof error === 'string' ? error : 'Promesa rechazada sin mensaje');
      const stack = error?.stack || '';
      const status = error?.response?.status;
      
      // Si es un error 401/403 es algo menor, si es 500 es crítico
      let level = 'WARNING';
      if (status >= 500) level = 'ERROR';
      
      this.logErrorToBackend({ message, stack }, {}, level);
    });

    // Capturar errores generales de la ventana
    window.addEventListener('error', (event) => {
      console.error("Window Error:", event.error);
      this.logErrorToBackend(event.error || { message: event.message }, {}, 'ERROR');
    });
  }

  render() {
    if (this.state.hasError) {
      // Puedes renderizar cualquier IU de repuesto
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
            <div className="bg-white p-8 sm:p-12 rounded-3xl shadow-2xl max-w-lg text-center border border-rose-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-rose-500"></div>
                <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i className="fa-solid fa-triangle-exclamation text-4xl"></i>
                </div>
                <h1 className="text-2xl font-black text-slate-800 mb-2">Algo salió mal</h1>
                <p className="text-slate-500 font-bold mb-8">
                    Hemos detectado un error inesperado en la aplicación. Nuestro equipo técnico ha sido notificado automáticamente y lo revisaremos lo antes posible.
                </p>
                <button 
                    onClick={() => window.location.href = '/'}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-black px-8 py-4 rounded-xl w-full tracking-widest text-sm transition-all shadow-lg hover:shadow-slate-900/20"
                >
                    <i className="fa-solid fa-house mr-2"></i>
                    VOLVER AL INICIO
                </button>
            </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
