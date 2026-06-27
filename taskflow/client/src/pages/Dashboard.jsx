import { useAuth } from '../context/AuthContext.jsx'

function Dashboard() {
  const { user } = useAuth()

  return (
    <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary-600">
          TaskFlow
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
          Welcome{user?.name ? `, ${user.name}` : ''}
        </h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Your protected dashboard is connected to the authentication module.
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-950">Account</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div>
            <dt className="font-medium text-slate-500">Name</dt>
            <dd className="mt-1 text-slate-900">{user?.name || 'Loading...'}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">Email</dt>
            <dd className="mt-1 text-slate-900">{user?.email || 'Loading...'}</dd>
          </div>
        </dl>
      </div>
    </section>
  )
}

export default Dashboard
