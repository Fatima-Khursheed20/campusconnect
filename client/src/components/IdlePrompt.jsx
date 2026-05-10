import useIdleTimer from "../hooks/useIdleTimer";

const IdlePrompt = () => {
  const { showPrompt, countdown, handleLogout, setShowPrompt } = useIdleTimer();

  if (!showPrompt) return null;

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-2xl">
        <h2 className="text-2xl font-bold text-slate-800">Are you still there?</h2>

        <p className="mt-4 text-slate-600">
          You will be logged out in{" "}
          <span className="font-semibold text-slate-800">
            {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
          </span>
        </p>

        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={handleLogout}
            className="rounded-md px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Logout
          </button>

          <button
            onClick={() => setShowPrompt(false)}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Stay Logged In
          </button>
        </div>
      </div>
    </div>
  );
};

export default IdlePrompt;