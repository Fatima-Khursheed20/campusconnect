import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "./useAuth";

const useIdleTimer = (idleTime = 30 * 60 * 1000, promptTime = 5 * 60 * 1000) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [showPrompt, setShowPrompt] = useState(false);
  const [countdown, setCountdown] = useState(Math.ceil(promptTime / 1000));

  const handleLogout = useCallback(() => {
    logout().then(() => {
      navigate("/login", {
        state: { message: "You have been logged out due to inactivity." },
      });
    });
  }, [logout, navigate]);

  useEffect(() => {
    if (!user) return;

    let idleTimeout;
    let countdownInterval;

    const resetTimer = () => {
      setShowPrompt(false);
      setCountdown(Math.ceil(promptTime / 1000));

      clearTimeout(idleTimeout);
      clearInterval(countdownInterval);

      idleTimeout = setTimeout(() => {
        setShowPrompt(true);

        countdownInterval = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              handleLogout();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }, idleTime - promptTime);
    };

    const events = ["mousemove", "keydown", "mousedown", "touchstart"];
    events.forEach((event) => window.addEventListener(event, resetTimer));

    resetTimer();

    return () => {
      clearTimeout(idleTimeout);
      clearInterval(countdownInterval);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [user, idleTime, promptTime, handleLogout]);

  return { showPrompt, countdown, handleLogout, setShowPrompt };
};

export default useIdleTimer;