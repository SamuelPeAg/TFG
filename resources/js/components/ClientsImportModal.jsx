import React, { useState, useRef } from 'react';
import axios from 'axios';
import Button from './Button';

export default function ClientsImportModal({ isOpen, onClose, onImportSuccess }) {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState(null);
    const fileInputRef = useRef(null);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setErrors(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setErrors({ file: ['Por favor, selecciona un archivo.'] });
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            await axios.post('/users/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            onImportSuccess();
            onClose();
            setFile(null);
        } catch (err) {
            if (err.response?.data?.errors) {
                setErrors(err.response.data.errors);
            } else {
                setErrors({ general: 'Error al importar el archivo. Verifica el formato.' });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            
            <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <button onClick={onClose} className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors z-10">
                    <i className="fas fa-times"></i>
                </button>

                <div className="p-8">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4 bg-indigo-50 text-indigo-600">
                            <i className="fas fa-file-excel text-2xl"></i>
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Importar Clientes</h2>
                        <p className="text-slate-500 text-sm mt-1 font-medium">Sube un archivo Excel para registrar múltiples clientes a la vez.</p>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Formato de Columnas (Cabeceras)</h4>
                        <div className="grid grid-cols-3 gap-1 text-[9px] font-bold text-slate-600 uppercase">
                            <span className="bg-white p-1 rounded border border-slate-200 text-center text-[#38C1A3]">empresa</span>
                            <span className="bg-white p-1 rounded border border-slate-200 text-center text-indigo-400">mes</span>
                            <span className="bg-white p-1 rounded border border-slate-200 text-center text-indigo-400">fecha</span>
                            <span className="bg-white p-1 rounded border border-slate-200 text-center text-[#38C1A3]">cliente*</span>
                            <span className="bg-white p-1 rounded border border-slate-200 text-center">precio</span>
                            <span className="bg-white p-1 rounded border border-slate-200 text-center">pago</span>
                            <span className="bg-white p-1 rounded border border-slate-200 text-center">centro</span>
                            <span className="bg-white p-1 rounded border border-slate-200 text-center">entrenador</span>
                            <span className="bg-white p-1 rounded border border-slate-200 text-center">servicio</span>
                        </div>
                        <p className="text-[9px] text-slate-400 mt-3 px-1 italic">El sistema reconocerá automáticamente las columnas. El campo 'cliente' es obligatorio para identificar al alumno.</p>
                    </div>

                    {errors?.general && (
                        <div className="mb-4 p-3 bg-rose-50 border border-rose-100 text-rose-600 text-xs rounded-xl flex items-center gap-2">
                            <i className="fas fa-exclamation-circle"></i>
                            {errors.general}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div 
                            className={`border-2 border-dashed rounded-3xl p-8 transition-all flex flex-col items-center justify-center cursor-pointer ${file ? 'border-[#38C1A3] bg-[#38C1A3]/5' : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'}`}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx,.xls,.csv" onChange={handleFileChange} />
                            
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 ${file ? 'bg-[#38C1A3] text-white' : 'bg-white text-slate-300 shadow-sm'}`}>
                                <i className={`fas ${file ? 'fa-check' : 'fa-cloud-upload-alt'} text-xl`}></i>
                            </div>
                            
                            <p className="text-sm font-bold text-slate-700">{file ? file.name : 'Seleccionar Archivo'}</p>
                            <p className="text-[10px] text-slate-400 mt-1 font-medium">{file ? `${(file.size / 1024).toFixed(1)} KB` : 'Arrastra un archivo Excel o haz clic'}</p>
                        </div>

                        {errors?.file && (
                            <p className="text-rose-500 text-[10px] font-bold text-center">{errors.file[0]}</p>
                        )}

                        <Button type="submit" variant="primary" className="w-full py-4 shadow-lg shadow-indigo-500/20" disabled={loading || !file}>
                            {loading ? (
                                <span className="flex items-center justify-center gap-2 tracking-widest">
                                    <i className="fas fa-circle-notch animate-spin"></i> PROCESANDO...
                                </span>
                            ) : (
                                <span className="tracking-widest">INICIAR IMPORTACIÓN</span>
                            )}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
