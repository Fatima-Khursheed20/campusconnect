import { Link } from "react-router-dom";

function Unauthorized() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl items-center justify-center px-4">
      <div className="w-full rounded-2xl border bg-white p-8 text-center shadow-md">
        <p className="text-sm font-semibold uppercase tracking-widest text-red-500">
          403
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Access Denied</h1>
        <p className="mt-3 text-slate-600">
          You do not have permission to view this page.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-lg bg-blue-700 px-5 py-2.5 font-semibold text-white transition hover:bg-blue-800"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default Unauthorized;
