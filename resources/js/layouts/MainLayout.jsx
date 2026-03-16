import { Outlet } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Header />

      {/* MAIN CONTENT */}
      <main className="grow pt-20">
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}
