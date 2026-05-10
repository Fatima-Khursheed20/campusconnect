import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";

const USERS_PER_PAGE = 10;

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = async (search = "") => {
    try {
      setLoading(true);
      const response = await api.get("/admin/users", {
        params: search ? { search } : {},
      });
      setUsers(response.data.users || []);
      setError("");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadInitialUsers = async () => {
      try {
        setLoading(true);
        const response = await api.get("/admin/users");
        setUsers(response.data.users || []);
        setError("");
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };

    loadInitialUsers();
  }, []);

  const totalPages = Math.max(1, Math.ceil(users.length / USERS_PER_PAGE));
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * USERS_PER_PAGE;
    return users.slice(start, start + USERS_PER_PAGE);
  }, [users, currentPage]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setCurrentPage(1);
    fetchUsers(searchTerm.trim());
  };

  const handleToggleStatus = async (id) => {
    try {
      await api.patch(`/admin/users/${id}/toggle-status`);
      fetchUsers(searchTerm.trim());
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update user status");
    }
  };

  const handleRoleChange = async (id, role) => {
    try {
      await api.patch(`/admin/users/${id}/role`, { role });
      fetchUsers(searchTerm.trim());
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update user role");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/users/${id}`);
      fetchUsers(searchTerm.trim());
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete user");
    }
  };

  return (
    <div className="space-y-5">
      <header className="rounded-xl border bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Manage Users</h1>
        <p className="mt-1 text-sm text-slate-600">
          Review user accounts, status, and role access across CampusConnect.
        </p>
      </header>

      <form
        onSubmit={handleSearchSubmit}
        className="rounded-xl border bg-white p-4 shadow-sm"
      >
        <label className="block text-sm font-medium text-slate-700">
          Search users
        </label>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by name or email"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
          <button
            type="submit"
            className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
          >
            Search
          </button>
        </div>
      </form>

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
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-4 py-4 text-slate-500" colSpan={5}>
                    Loading users...
                  </td>
                </tr>
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-slate-500" colSpan={5}>
                    No users found.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => (
                  <tr key={user._id} className="border-b last:border-0">
                    <td className="px-4 py-3">{user.name}</td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3">
                      <select
                        value={user.role}
                        onChange={(event) =>
                          handleRoleChange(user._id, event.target.value)
                        }
                        className="rounded-md border border-slate-300 px-2 py-1"
                      >
                        <option value="student">student</option>
                        <option value="recruiter">recruiter</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          user.isActive
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(user._id)}
                          className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium hover:bg-slate-50"
                        >
                          Toggle Status
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(user._id)}
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

        <div className="flex items-center justify-between border-t px-4 py-3 text-sm">
          <p className="text-slate-600">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="rounded-md border border-slate-300 px-3 py-1 disabled:opacity-50"
            >
              Prev
            </button>
            <button
              type="button"
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
              className="rounded-md border border-slate-300 px-3 py-1 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ManageUsers;
