import React from 'react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import { Outlet } from 'react-router-dom';

export default function PublicLayout() {
    return (
        <div className="w-full min-h-screen flex flex-col pt-32 bg-white welcome-page"> {/* pt-32 space for fixed Header */}
            <Header />
            <main className="flex-grow flex flex-col">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}
