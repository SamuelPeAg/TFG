import React from 'react';

export default function SeguridadSection() {
    return (
        <div id="seguridad" className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Seguridad</h3>
            <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-bold text-gray-600 dark:text-gray-400">Contraseña Actual</label>
                    <input type="password" name="current_password" placeholder="••••••••" className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brandTeal outline-none" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-bold text-gray-600 dark:text-gray-400">Nueva Contraseña</label>
                        <input type="password" name="password" placeholder="••••••••" className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brandTeal outline-none" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-bold text-gray-600 dark:text-gray-400">Confirmar Contraseña</label>
                        <input type="password" name="password_confirmation" placeholder="••••••••" className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brandTeal outline-none" />
                    </div>
                </div>
            </div>
        </div>
    );
}
