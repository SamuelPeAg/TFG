import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';

export default function DashboardLayout() {
    const user = window.FactomoveUser;

    // Si no hay usuario logueado en window, redirigimos a login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Sidebar tiene su propio position fixed y z-index en el CSS original, pero la envolvemos por si acasi */}
            <Sidebar />

            {/* Contenido principal: ml-[260px] en desktop para dar espacio al sidebar que tiene width:260px en sidebar.css */}
            <main className="flex-1 w-full flex flex-col overflow-y-auto lg:ml-[260px] transition-all duration-300">
                <Outlet />
            </main>
        </div>
    );
}
