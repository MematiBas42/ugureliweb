"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { FaTimes, FaPlay, FaPause, FaSpotify, FaApple, FaYoutube, FaInstagram } from "react-icons/fa";
import { SiYoutubemusic } from "react-icons/si";

export default function UpcomingCards({ record, priority = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mounted, setMounted] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      if (isOpen) {
        setIsOpen(false);
        setIsPlaying(false);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
      }
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  const trackEvent = (eventName) => {
    if (typeof window !== 'undefined' && window.umami) {
      window.umami.track(eventName);
    }
  };

  const openModal = (e) => {
    e.preventDefault();
    trackEvent(`Yakında Kartı Tıklandı: ${record.title}`);
    window.history.pushState(null, "", window.location.href);
    setIsPlaying(false);
    setIsOpen(true);
  };

  const closeModal = (e) => {
    e.stopPropagation();
    if (isOpen) window.history.back();
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    if (audioRef.current) audioRef.current.currentTime = 0;
  };

  return (
    <>
      {/* 
         Card Design Matches 'Cards.jsx' Exactly
         Removed dashed border, added overlay badge for 'Upcoming' status
      */}
      <div 
        className="card upcoming-card" 
        onClick={openModal} 
        style={{ cursor: "pointer", position: "relative" }}
      >
        {/* Overlay Badge to Distinguish Upcoming Releases */}
        <div style={{
            position: "absolute",
            top: "8px",
            right: "8px",
            backgroundColor: "rgba(255, 0, 0, 0.8)",
            color: "white",
            padding: "2px 8px",
            borderRadius: "4px",
            fontSize: "0.7rem",
            fontWeight: "bold",
            zIndex: 2,
            boxShadow: "0 2px 4px rgba(0,0,0,0.3)"
        }}>
          YAKINDA
        </div>

        <Image
          priority={priority}
          src={record.image}
          alt={`${record.title} artwork`}
          style={{
            width: 'auto',
            height: "auto",
            display: 'block',
            maxWidth: '100%',
            objectFit: "cover"
          }}
          width={300}
          height={300}
          sizes="(max-width: 768px) 150px, 300px"
        />
        <div className="contents">
          <h5>{record.title}</h5>
          <span className="tag" style={{ color: "#ff4d4d" }}>{record.tag}</span>
        </div>
      </div>

      {mounted && isOpen && createPortal(
        <div className="music-modal-overlay" onClick={closeModal}>
          <div className="music-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="music-modal-close" onClick={closeModal}><FaTimes /></button>

            <div className="music-modal-header">
              <Image
                src={record.image}
                alt={record.title}
                width={200}
                height={200}
                className="music-modal-artwork"
                style={{ filter: "grayscale(20%)" }}
              />
              <h3>{record.title}</h3>
              <p className="upcoming-status" style={{ marginBottom: "1rem", color: "#aaa" }}>
                Bu parça yakında yayınlanacak!
              </p>
              
              {record.previewUrl && (
                <div className="custom-player" style={{ marginBottom: "2rem" }}>
                  <p className="preview-label">Demo Dinle</p>
                  <audio ref={audioRef} src={record.previewUrl} onEnded={handleAudioEnded} />
                  <div className="player-controls">
                    <button 
                      className="play-btn" 
                      onClick={() => {
                        togglePlay();
                        trackEvent(isPlaying ? `Yakında Demosu Durduruldu: ${record.title}` : `Yakında Demosu Oynatıldı: ${record.title}`);
                      }}
                    >
                      {isPlaying ? <FaPause /> : <FaPlay style={{ marginLeft: "2px" }} />}
                    </button>
                    <div className={`visualizer ${isPlaying ? "playing" : ""}`}>
                      {[...Array(20)].map((_, i) => (
                        <div key={i} className="bar" style={{ animationDelay: `${i * 0.05}s` }}></div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* NEW FOOTER DESIGN: Large Action Buttons */}
            <div className="music-modal-links" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
               <p style={{ textAlign: "center", marginBottom: "10px", fontSize: "0.9rem", color: "#ddd" }}>
                 Haberdar olmak için takip edin:
               </p>
               
               <div className="social-buttons-grid" style={{ 
                   display: "grid", 
                   gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", 
                   gap: "10px",
                   width: "100%"
               }}>
                  <a 
                    href="https://open.spotify.com/artist/73t1X7rpXydywb5okRLWFJ" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="platform-btn spotify" 
                    style={{ justifyContent: "center", padding: "12px", background: "#1DB954", color: "white" }}
                    onClick={() => trackEvent(`Yakında Modalı: Spotify Takip Butonu Tıklandı (${record.title})`)}
                  >
                    <FaSpotify size={20} /> <span style={{ marginLeft: "8px" }}>Takip Et</span>
                  </a>
                  
                  <a 
                    href="https://www.instagram.com/ugreli" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="platform-btn" 
                    style={{ justifyContent: "center", padding: "12px", background: "#E1306C", color: "white" }}
                    onClick={() => trackEvent(`Yakında Modalı: Instagram Takip Butonu Tıklandı (${record.title})`)}
                  >
                    <FaInstagram size={20} /> <span style={{ marginLeft: "8px" }}>Takip Et</span>
                  </a>

                  <a 
                    href="https://youtube.com/@ugreli?si=mYfgH0EJE0XngKpy" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="platform-btn youtube" 
                    style={{ justifyContent: "center", padding: "12px", background: "#ff0000", color: "white" }}
                    onClick={() => trackEvent(`Yakında Modalı: YouTube Abone Ol Butonu Tıklandı (${record.title})`)}
                  >
                    <FaYoutube size={20} /> <span style={{ marginLeft: "8px" }}>Abone Ol</span>
                  </a>

                  <a 
                    href="https://music.youtube.com/channel/UC1XkRabRwj5H1wf4W-X6tuQ" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="platform-btn youtubeMusic" 
                    style={{ justifyContent: "center", padding: "12px", background: "#ff0000", color: "white" }}
                    onClick={() => trackEvent(`Yakında Modalı: YouTube Music Abone Ol Butonu Tıklandı (${record.title})`)}
                  >
                    <SiYoutubemusic size={20} /> <span style={{ marginLeft: "8px" }}>Abone Ol</span>
                  </a>
               </div>
            </div>

          </div>
        </div>,
        document.body
      )}
    </>
  );
}