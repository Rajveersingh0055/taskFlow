function Dashboard() {
  return (
    <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary-600">
          TaskFlow
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
          Dashboard
        </h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Your task management workspace is ready for Phase 2 features.
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-950">Next up</h2>
        <ul className="mt-4 space-y-3 text-sm text-slate-600">
          <li>User authentication</li>
          <li>Task CRUD routes</li>
          <li>MongoDB models</li>
          <li>Protected dashboard views</li>
        </ul>
      </div>
    </section>
  )
}

export default Dashboard
