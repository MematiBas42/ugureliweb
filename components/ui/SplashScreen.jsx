"use client";

import { useEffect, useState } from "react";

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Check if splash has been shown in this session
    const hasSeenSplash = sessionStorage.getItem("splash_seen");

    if (hasSeenSplash) {
      setIsVisible(false);
      return;
    }

    const handleLoad = () => {
      setIsVisible(false);
      sessionStorage.setItem("splash_seen", "true");
    };

    if (document.readyState === "complete") {
      handleLoad();
    } else {
      window.addEventListener("load", handleLoad);
    }

    // Failsafe: Remove splash screen after 1 second if load event doesn't fire
    const timer = setTimeout(() => {
      if (isVisible) {
        setIsVisible(false);
        sessionStorage.setItem("splash_seen", "true");
      }
    }, 1000);

    return () => {
      window.removeEventListener("load", handleLoad);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className={`splash-screen ${isVisible ? "" : "hidden"}`}>
      <div className="spinner-container">
        <img 
          src="/loading-logo.webp" 
          alt="Loading..." 
          className="splash-logo"
        />
      </div>
    </div>
  );
}
