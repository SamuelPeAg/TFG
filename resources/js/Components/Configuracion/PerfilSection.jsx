import React, { useState } from 'react';

export default function PerfilSection({ user }) {
    const [previewSrc, setPreviewSrc] = useState(user.foto_de_perfil ? `/storage/${user.foto_de_perfil}` : null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setPreviewSrc(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div id="perfil" className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Perfil</h3>
            
            {/* Foto de Perfil */}
            <div className="flex flex-col items-center sm:flex-row gap-6 mb-6">
                <div className="relative group">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-lg">
                        {previewSrc ? (
                            <img src={previewSrc} alt="Foto de perfil" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-500">
                                <i className="fa-solid fa-user text-5xl"></i>
                            </div>
                        )}
                    </div>
                    <label htmlFor="foto_de_perfil" className="absolute bottom-0 right-0 bg-brandTeal text-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-teal-600 transition-colors">
                        <i className="fa-solid fa-camera"></i>
                        <input type="file" name="foto_de_perfil" id="foto_de_perfil" className="hidden" accept="image/*" onChange={handleFileChange} />
                    </label>
                </div>
                <div className="text-center sm:text-left flex flex-col gap-1">
                    <h4 className="font-bold text-gray-900 dark:text-white">Foto de Perfil</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Sube una imagen de hasta 2MB.</p>
                </div>
            </div>

            <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-bold text-gray-600 dark:text-gray-400">Nombre de Usuario</label>
                    <input type="text" name="name" defaultValue={user.name || ''} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brandTeal outline-none" />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-bold text-gray-600 dark:text-gray-400">Email</label>
                    <input type="email" name="email" defaultValue={user.email || ''} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brandTeal outline-none opacity-70" readOnly />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-bold text-gray-600 dark:text-gray-400">IBAN</label>
                    <input type="text" name="iban" defaultValue={user.iban || ''} placeholder="ES00 0000 0000 0000 0000 0000" className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brandTeal outline-none" />
                </div>
            </div>
        </div>
    );
}
