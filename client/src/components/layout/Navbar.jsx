import { Link } from "react-router-dom";

function Navbar() {
  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <h1 className="text-2xl font-bold text-blue-700">CampusConnect</h1>
        <nav className="flex gap-4 text-sm font-medium">
          <Link to="/" className="text-slate-700 hover:text-blue-700">
            Home
          </Link>
          <Link to="/jobs" className="text-slate-700 hover:text-blue-700">
            Jobs
          </Link>
          <Link to="/login" className="text-slate-700 hover:text-blue-700">
            Login
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
