export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-bold text-slate-900">Contact</h1>
      <p className="mt-4 text-slate-600 leading-relaxed">
        Have questions about listings, partnerships, or support? Reach out—we respond to campus and
        employer inquiries regularly.
      </p>
      <div className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-slate-700">CampusConnect</p>
        <p className="mt-2 text-sm text-slate-600">
          Email:{" "}
          <a href="mailto:support@campusconnect.example" className="text-blue-600 hover:text-blue-500">
            support@campusconnect.example
          </a>
        </p>
        <p className="mt-4 text-xs text-slate-500">
          Replace this address with your real support email before launch.
        </p>
      </div>
    </div>
  );
}
