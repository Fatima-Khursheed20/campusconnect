import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { resolveUploadUrl } from "../utils/resolveUploadUrl";

function GradCapIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" />
    </svg>
  );
}

function navLinkClass(isActive) {
  return isActive ? "text-blue-600 font-semibold" : "text-slate-700 hover:text-blue-600";
}

function MobileNavLink({ to, children, onNavigate, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) =>
        `block rounded-md px-3 py-2 text-base font-medium ${
          isActive ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"
        }`
      }
    >
      {children}
    </NavLink>
  );
}

export default function Navbar() {
  const { user, loading, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setAvatarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!avatarOpen) return undefined;
    const close = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setAvatarOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [avatarOpen]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const profileHref =
    user?.role === "student"
      ? "/student/profile"
      : user?.role === "recruiter"
        ? "/recruiter/dashboard"
        : "/admin";

  const avatarSrc = resolveUploadUrl(user?.profilePicture);
  const initial = user?.name?.trim()?.[0]?.toUpperCase() || "?";

  const inactiveDesktop =
    "!text-slate-700 font-medium hover:text-blue-600 data-[active=true]:text-blue-600 data-[active=true]:font-semibold";

  return (
    <header
      className={`sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur transition-shadow duration-200 ${
        scrolled ? "shadow-md" : "shadow-sm"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2 text-lg font-bold tracking-tight text-slate-900"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
            <GradCapIcon className="h-5 w-5" />
          </span>
          <span className="text-base tracking-tight sm:text-lg">CampusConnect</span>
        </Link>

        <>
          <nav className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-1 xl:gap-2">
            {loading && (
              <span className="self-center px-3 text-sm text-slate-400">Checking session…</span>
            )}
            {!loading && (!isAuthenticated || !user) && (
                <>
                  <NavLink
                    to="/"
                    end
                    className={({ isActive }) =>
                      `rounded-md px-3 py-2 text-sm font-medium ${navLinkClass(isActive)}`
                    }
                  >
                    Home
                  </NavLink>
                  <NavLink
                    to="/jobs"
                    className={({ isActive }) =>
                      `rounded-md px-3 py-2 text-sm font-medium ${navLinkClass(isActive)}`
                    }
                  >
                    Jobs
                  </NavLink>
                  <NavLink
                    to="/about"
                    className={({ isActive }) =>
                      `rounded-md px-3 py-2 text-sm font-medium ${navLinkClass(isActive)}`
                    }
                  >
                    About
                  </NavLink>
                  <NavLink
                    to="/contact"
                    className={({ isActive }) =>
                      `rounded-md px-3 py-2 text-sm font-medium ${navLinkClass(isActive)}`
                    }
                  >
                    Contact
                  </NavLink>
                  <NavLink
                    to="/login"
                    className={({ isActive }) =>
                      `rounded-md px-3 py-2 text-sm font-medium ${navLinkClass(isActive)}`
                    }
                  >
                    Login
                  </NavLink>
                  <NavLink to="/register">
                    {({ isActive }) => (
                      <span
                        className={`ml-1 inline-flex rounded-md px-4 py-2 text-sm font-semibold shadow-sm ${
                          isActive
                            ? "bg-blue-700 text-white"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                      >
                        Register
                      </span>
                    )}
                  </NavLink>
                </>
              )}
            {!loading && user?.role === "student" && (
                <>
                  <NavLink
                    to="/"
                    end
                    className={({ isActive }) =>
                      `rounded-md px-3 py-2 text-sm font-medium ${navLinkClass(isActive)}`
                    }
                  >
                    Home
                  </NavLink>
                  <NavLink
                    to="/jobs"
                    className={({ isActive }) =>
                      `rounded-md px-3 py-2 text-sm font-medium ${navLinkClass(isActive)}`
                    }
                  >
                    Browse Jobs
                  </NavLink>
                  <NavLink
                    to="/student/applications"
                    className={({ isActive }) =>
                      `rounded-md px-3 py-2 text-sm font-medium ${navLinkClass(isActive)}`
                    }
                  >
                    My Applications
                  </NavLink>
                  <NavLink
                    to="/student/bookmarks"
                    className={({ isActive }) =>
                      `rounded-md px-3 py-2 text-sm font-medium ${navLinkClass(isActive)}`
                    }
                  >
                    Bookmarks
                  </NavLink>
                </>
              )}
            {!loading && user?.role === "recruiter" && (
                <>
                  <NavLink
                    to="/"
                    end
                    className={({ isActive }) =>
                      `rounded-md px-3 py-2 text-sm font-medium ${navLinkClass(isActive)}`
                    }
                  >
                    Home
                  </NavLink>
                  <NavLink
                    to="/recruiter/jobs"
                    className={({ isActive }) =>
                      `rounded-md px-3 py-2 text-sm font-medium ${navLinkClass(isActive)}`
                    }
                  >
                    My Listings
                  </NavLink>
                  <NavLink
                    to="/recruiter/jobs/new"
                    className={({ isActive }) =>
                      `rounded-md px-3 py-2 text-sm font-medium ${navLinkClass(isActive)}`
                    }
                  >
                    Post a Job
                  </NavLink>
                  <NavLink
                    to="/recruiter/dashboard"
                    end
                    className={({ isActive }) =>
                      `rounded-md px-3 py-2 text-sm font-medium ${navLinkClass(isActive)}`
                    }
                  >
                    Dashboard
                  </NavLink>
                </>
              )}
            {!loading && user?.role === "admin" && (
                <>
                  <NavLink
                    to="/admin"
                    end
                    className={({ isActive }) =>
                      `rounded-md px-3 py-2 text-sm font-medium ${navLinkClass(isActive)}`
                    }
                  >
                    Dashboard
                  </NavLink>
                  <NavLink
                    to="/admin/users"
                    className={({ isActive }) =>
                      `rounded-md px-3 py-2 text-sm font-medium ${navLinkClass(isActive)}`
                    }
                  >
                    Manage Users
                  </NavLink>
                  <NavLink
                    to="/admin/jobs"
                    className={({ isActive }) =>
                      `rounded-md px-3 py-2 text-sm font-medium ${navLinkClass(isActive)}`
                    }
                  >
                    Manage Jobs
                  </NavLink>
                </>
              )}
          </nav>

          {!loading && user && (
              <div className="hidden lg:block relative" ref={dropdownRef}>
                <button
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={avatarOpen}
                  onClick={() => setAvatarOpen((o) => !o)}
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-2 shadow-sm hover:border-slate-300"
                >
                  <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-blue-100 text-sm font-semibold text-blue-800">
                    {avatarSrc ? (
                      <img src={avatarSrc} alt="" className="h-full w-full object-cover" />
                    ) : (
                      initial
                    )}
                  </span>
                  <svg className="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {avatarOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-52 rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
                  >
                    <Link
                      to={profileHref}
                      role="menuitem"
                      className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      onClick={() => setAvatarOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      to="/settings"
                      role="menuitem"
                      className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      onClick={() => setAvatarOpen(false)}
                    >
                      Settings
                    </Link>
                    <button
                      type="button"
                      role="menuitem"
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
          )}

          <div className="flex items-center gap-2 lg:hidden">
            {!loading && user && (
                <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-blue-100 text-sm font-semibold text-blue-800">
                  {avatarSrc ? (
                    <img src={avatarSrc} alt="" className="h-full w-full object-cover" />
                  ) : (
                    initial
                  )}
                </span>
            )}
            <button
                type="button"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
                onClick={() => setMobileOpen((o) => !o)}
                className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white p-2 text-slate-700 shadow-sm hover:bg-slate-50"
              >
                {mobileOpen ? (
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
          </div>
        </>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white lg:hidden">
          <div className="mx-auto max-w-6xl space-y-1 px-4 py-4 sm:px-6">
            {loading && (
              <>
                <p className="px-3 py-2 text-sm text-slate-500">Checking session…</p>
                <MobileNavLink to="/" onNavigate={() => setMobileOpen(false)} end>
                  Home
                </MobileNavLink>
                <MobileNavLink to="/jobs" onNavigate={() => setMobileOpen(false)}>
                  Jobs
                </MobileNavLink>
              </>
            )}
            {!loading && (!isAuthenticated || !user) && (
              <>
                <MobileNavLink to="/" onNavigate={() => setMobileOpen(false)} end>
                  Home
                </MobileNavLink>
                <MobileNavLink to="/jobs" onNavigate={() => setMobileOpen(false)}>
                  Jobs
                </MobileNavLink>
                <MobileNavLink to="/about" onNavigate={() => setMobileOpen(false)}>
                  About
                </MobileNavLink>
                <MobileNavLink to="/contact" onNavigate={() => setMobileOpen(false)}>
                  Contact
                </MobileNavLink>
                <MobileNavLink to="/login" onNavigate={() => setMobileOpen(false)}>
                  Login
                </MobileNavLink>
                <MobileNavLink to="/register" onNavigate={() => setMobileOpen(false)}>
                  Register
                </MobileNavLink>
              </>
            )}

            {!loading && user?.role === "student" && (
              <>
                <MobileNavLink to="/" onNavigate={() => setMobileOpen(false)} end>
                  Home
                </MobileNavLink>
                <MobileNavLink to="/jobs" onNavigate={() => setMobileOpen(false)}>
                  Browse Jobs
                </MobileNavLink>
                <MobileNavLink to="/student/applications" onNavigate={() => setMobileOpen(false)}>
                  My Applications
                </MobileNavLink>
                <MobileNavLink to="/student/bookmarks" onNavigate={() => setMobileOpen(false)}>
                  Bookmarks
                </MobileNavLink>
                <div className="border-t border-slate-100 pt-2 mt-2">
                  <MobileNavLink to="/student/profile" onNavigate={() => setMobileOpen(false)}>
                    Profile
                  </MobileNavLink>
                  <MobileNavLink to="/settings" onNavigate={() => setMobileOpen(false)}>
                    Settings
                  </MobileNavLink>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false);
                      handleLogout();
                    }}
                    className="mt-1 w-full rounded-md px-3 py-2 text-left text-base font-medium text-red-600 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
              </>
            )}

            {!loading && user?.role === "recruiter" && (
              <>
                <MobileNavLink to="/" onNavigate={() => setMobileOpen(false)} end>
                  Home
                </MobileNavLink>
                <MobileNavLink to="/recruiter/jobs" onNavigate={() => setMobileOpen(false)}>
                  My Listings
                </MobileNavLink>
                <MobileNavLink to="/recruiter/jobs/new" onNavigate={() => setMobileOpen(false)}>
                  Post a Job
                </MobileNavLink>
                <MobileNavLink to="/recruiter/dashboard" onNavigate={() => setMobileOpen(false)} end>
                  Dashboard
                </MobileNavLink>
                <div className="border-t border-slate-100 pt-2 mt-2">
                  <MobileNavLink to={profileHref} onNavigate={() => setMobileOpen(false)} end>
                    Profile
                  </MobileNavLink>
                  <MobileNavLink to="/settings" onNavigate={() => setMobileOpen(false)}>
                    Settings
                  </MobileNavLink>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false);
                      handleLogout();
                    }}
                    className="mt-1 w-full rounded-md px-3 py-2 text-left text-base font-medium text-red-600 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
              </>
            )}

            {!loading && user?.role === "admin" && (
              <>
                <MobileNavLink to="/admin" onNavigate={() => setMobileOpen(false)} end>
                  Dashboard
                </MobileNavLink>
                <MobileNavLink to="/admin/users" onNavigate={() => setMobileOpen(false)}>
                  Manage Users
                </MobileNavLink>
                <MobileNavLink to="/admin/jobs" onNavigate={() => setMobileOpen(false)}>
                  Manage Jobs
                </MobileNavLink>
                <div className="border-t border-slate-100 pt-2 mt-2">
                  <MobileNavLink to="/admin" onNavigate={() => setMobileOpen(false)} end>
                    Profile
                  </MobileNavLink>
                  <MobileNavLink to="/settings" onNavigate={() => setMobileOpen(false)}>
                    Settings
                  </MobileNavLink>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false);
                      handleLogout();
                    }}
                    className="mt-1 w-full rounded-md px-3 py-2 text-left text-base font-medium text-red-600 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
