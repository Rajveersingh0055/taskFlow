import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <section className="mx-auto max-w-lg text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-primary-600">
        404
      </p>
      <h1 className="mt-3 text-3xl font-bold text-slate-950">Page not found</h1>
      <p className="mt-3 text-slate-600">
        The page you are looking for does not exist.
      </p>
      <Link
        to="/dashboard"
        className="mt-6 inline-flex rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
      >
        Go to dashboard
      </Link>
    </section>
  )
}

export default NotFound
