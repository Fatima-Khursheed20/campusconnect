export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
      <p className="mt-3 text-slate-600">
        Additional account preferences—notifications, email, password change—will be added in a
        later phase.
      </p>
      <p className="mt-4 text-sm text-slate-500">
        For now, manage your visible profile via the navbar <strong className="text-slate-700">Profile</strong>{" "}
        link where available.
      </p>
    </div>
  );
}
