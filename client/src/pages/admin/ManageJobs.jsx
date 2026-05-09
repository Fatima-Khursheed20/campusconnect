import { useEffect, useState } from "react";
import api from "../../services/api";

function ManageJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/jobs");
      setJobs(response.data.jobs || []);
      setError("");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadInitialJobs = async () => {
      try {
        setLoading(true);
        const response = await api.get("/admin/jobs");
        setJobs(response.data.jobs || []);
        setError("");
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Failed to fetch jobs");
      } finally {
        setLoading(false);
      }
    };

    loadInitialJobs();
  }, []);

  const toggleJob = async (id) => {
    await api.patch(`/admin/jobs/${id}/toggle`);
    fetchJobs();
  };

  const deleteJob = async (id) => {
    await api.delete(`/admin/jobs/${id}`);
    fetchJobs();
  };

  return (
    <div className="space-y-5">
      <header className="rounded-xl border bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Manage Jobs</h1>
        <p className="mt-1 text-sm text-slate-600">
          Approve, disable, or remove internship and job listings.
        </p>
      </header>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <section className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Company</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Posted Date</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-4 py-4 text-slate-500" colSpan={6}>
                    Loading jobs...
                  </td>
                </tr>
              ) : jobs.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-slate-500" colSpan={6}>
                    No jobs available.
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job._id} className="border-b last:border-0">
                    <td className="px-4 py-3">{job.title}</td>
                    <td className="px-4 py-3">
                      {job.postedBy?.companyName || job.postedBy?.name || "N/A"}
                    </td>
                    <td className="px-4 py-3 capitalize">{job.type}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          job.isActive
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {job.isActive ? "Approved" : "Removed"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => toggleJob(job._id)}
                          className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium hover:bg-slate-50"
                        >
                          {job.isActive ? "Remove" : "Approve"}
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteJob(job._id)}
                          className="rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
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

export default ManageJobs;
