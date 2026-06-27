import Navbar from './components/Navbar.jsx'
import AppRoutes from './routes/AppRoutes.jsx'

function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <AppRoutes />
      </main>
    </div>
  )
}

export default App
