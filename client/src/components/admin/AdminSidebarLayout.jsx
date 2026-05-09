import { Link, Outlet, useLocation } from "react-router-dom";

const links = [
  { to: "/admin", label: "Dashboard" },
  { to: "/admin/users", label: "Manage Users" },
  { to: "/admin/jobs", label: "Manage Jobs" },
];

function AdminSidebarLayout() {
  const location = useLocation();

  return (
    <div className="grid min-h-[70vh] gap-6 lg:grid-cols-[260px_1fr]">
      <aside className="rounded-xl border bg-white p-4 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-slate-900">Admin Panel</h2>
        <nav className="space-y-2">
          {links.map((item) => {
            const active =
              location.pathname === item.to ||
              (item.to !== "/admin" && location.pathname.startsWith(item.to));
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`block rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <section className="min-w-0">
        <Outlet />
      </section>
    </div>
  );
}

export default AdminSidebarLayout;
