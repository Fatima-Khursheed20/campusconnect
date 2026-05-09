import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import useAuth from "../../hooks/useAuth";

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function statusBadgeClass(status) {
  switch (status) {
    case "shortlisted":
      return "bg-emerald-100 text-emerald-800";
    case "rejected":
      return "bg-red-100 text-red-700";
    case "reviewed":
      return "bg-amber-100 text-amber-800";
    case "pending":
    default:
      return "bg-slate-100 text-slate-700";
  }
}

function StudentDashboard() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [appsRes, bmRes] = await Promise.all([
          api.get("/users/applications"),
          api.get("/users/bookmarks"),
        ]);
        setApplications(appsRes.data.applications || []);
        setBookmarks(bmRes.data.bookmarks || []);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const shortlistedCount = applications.filter((a) => a.status === "shortlisted").length;
  const recent = [...applications].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  ).slice(0, 5);

  if (loading) {
    return (
      <section className="rounded-lg bg-white p-10 text-center shadow-sm">
        <p className="text-slate-500">Loading dashboard…</p>
      </section>
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-lg bg-gradient-to-br from-blue-700 to-blue-900 p-6 text-white shadow-sm sm:p-8">
        <p className="text-sm font-medium text-blue-100">Student dashboard</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
          Welcome back, {user?.name?.split(" ")[0] || user?.name || "student"}!
        </h1>
        <p className="mt-2 max-w-xl text-sm text-blue-100">
          Track applications, bookmarks, and your profile from one place.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            to="/student/profile"
            className="rounded-md bg-white px-3 py-1.5 text-sm font-medium text-blue-800 hover:bg-blue-50"
          >
            Edit profile
          </Link>
          <Link
            to="/student/applications"
            className="rounded-md border border-white/40 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/10"
          >
            All applications
          </Link>
        </div>
      </section>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Applications sent</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{applications.length}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Shortlisted</p>
          <p className="mt-2 text-3xl font-semibold text-emerald-700">{shortlistedCount}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Bookmarks</p>
          <p className="mt-2 text-3xl font-semibold text-blue-700">{bookmarks.length}</p>
        </div>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-4 py-4 sm:px-6">
          <h2 className="text-lg font-semibold text-slate-900">Recent applications</h2>
          <p className="mt-1 text-sm text-slate-500">Your latest submissions</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium sm:px-6">Job title</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Applied</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recent.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-center text-slate-500 sm:px-6" colSpan={3}>
                    No applications yet.{" "}
                    <Link to="/jobs" className="font-medium text-blue-600 hover:text-blue-500">
                      Browse jobs
                    </Link>
                  </td>
                </tr>
              ) : (
                recent.map((app) => (
                  <tr key={app._id}>
                    <td className="px-4 py-3 sm:px-6">
                      <Link
                        to={`/jobs/${app.job?._id}`}
                        className="font-medium text-blue-700 hover:text-blue-600"
                      >
                        {app.job?.title || "Job"}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusBadgeClass(
                          app.status
                        )}`}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {formatDate(app.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default StudentDashboard;
