export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-3xl font-bold text-slate-900">Privacy Policy</h1>
      <p className="text-sm text-slate-600 leading-relaxed">
        This placeholder outlines how CampusConnect treats personal data at a high level. Replace with
        a complete policy drafted for your jurisdiction and institution before production use.
      </p>
      <ul className="list-inside list-disc space-y-2 text-sm text-slate-600">
        <li>We collect account details you provide (such as name and email).</li>
        <li>Cookies secure your session via httpOnly tokens where applicable.</li>
        <li>Uploads such as resumes are stored for application purposes.</li>
        <li>Contact support to request access or deletion where required by law.</li>
      </ul>
    </div>
  );
}
