import React, { useState } from 'react';
import PerfilSection from './PerfilSection';
import SeguridadSection from './SeguridadSection';

export default function ConfiguracionApp({ user, updateRoute, csrfToken, successMsg, errorsMsg }) {
    // We pass down state down explicitly if needed or just handle the standard form submission.
    // We'll use a traditional form submission, so we just wrap it in a form.
    return (
        <div className="w-full bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <div className="p-8">
                {/* Alertas */}
                {successMsg && (
                    <div className="mb-6 p-4 rounded-2xl border border-green-200 bg-green-50 text-green-700 font-semibold">
                        {successMsg}
                    </div>
                )}
                {errorsMsg && errorsMsg.length > 0 && (
                    <div className="mb-6 p-4 rounded-2xl border border-red-200 bg-red-50 text-red-700">
                        <ul className="list-disc ml-5 text-sm flex flex-col gap-1">
                            {errorsMsg.map((error, idx) => (
                                <li key={idx}>{error}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* FORMULARIO */}
                <section className="max-w-4xl mx-auto flex flex-col gap-8">
                    <form method="POST" action={updateRoute} encType="multipart/form-data" className="flex flex-col gap-8">
                        <input type="hidden" name="_token" value={csrfToken} />
                        <input type="hidden" name="_method" value="PUT" />

                        <PerfilSection user={user} />
                        
                        <SeguridadSection />

                        <div className="flex justify-end gap-4">
                            <a href="javascript:history.back()" className="px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-100 dark:hover:bg-gray-700 transition">Cancelar</a>
                            <button type="submit" className="px-6 py-3 rounded-xl bg-gradient-to-r from-brandTeal to-brandCoral text-white font-bold shadow-lg hover:shadow-xl hover:brightness-110 transition">Guardar Cambios</button>
                        </div>
                    </form>
                </section>
            </div>
        </div>
    );
}
