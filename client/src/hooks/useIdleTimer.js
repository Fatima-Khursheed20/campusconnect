import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from './useAuth';

const useIdleTimer = (idleTime = 30 * 60 * 1000, promptTime = 5 * 60 * 1000) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [isIdle, setIsIdle] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [countdown, setCountdown] = useState(Math.ceil(promptTime / 1000));

  const handleLogout = useCallback(() => {
    logout().then(() => {
      navigate('/login', { state: { message: 'You have been logged out due to inactivity.' } });
    });
  }, [logout, navigate]);

  useEffect(() => {
    if (!user) return;

    let idleTimeout;
    let promptInterval;
    let countdownInterval;

    const resetTimer = () => {
      setIsIdle(false);
      setShowPrompt(false);
      setCountdown(Math.ceil(promptTime / 1000));

      clearTimeout(idleTimeout);
      clearInterval(promptInterval);
      clearInterval(countdownInterval);

      promptInterval = setTimeout(() => {
        setShowPrompt(true);
        countdownInterval = setInterval(() => {
          setCountdown(prev => (prev > 0 ? prev - 1 : 0));
        }, 1000);
      }, idleTime - promptTime);

      idleTimeout = setTimeout(handleLogout, idleTime);
    };

    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetTimer));

    resetTimer();

    return () => {
      clearTimeout(idleTimeout);
      clearInterval(promptInterval);
      clearInterval(countdownInterval);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [user, idleTime, promptTime, handleLogout]);

  const stay = () => {
    setIsIdle(false);
    setShowPrompt(false);
  };

  const IdlePrompt = () => {
    if (!showPrompt) return null;

    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-slate-800">Are you still there?</h2>
          <p className="mt-4 text-slate-600">
            You will be logged out in{' '}
            <span className="font-semibold text-slate-800">
              {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
            </span>{' '}
            due to inactivity.
          </p>
          <div className="mt-6 flex justify-end space-x-4">
            <button
              onClick={handleLogout}
              className="rounded-md px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Logout
            </button>
            <button
              onClick={stay}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Stay Logged In
            </button>
          </div>
        </div>
      </div>
    );
  };

  return { isIdle, IdlePrompt };
};

export default useIdleTimer;
