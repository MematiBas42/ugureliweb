"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { FaSpotify, FaApple, FaYoutube, FaDeezer, FaTimes, FaPlay, FaPause, FaAmazon } from "react-icons/fa";
import { SiYoutubemusic } from "react-icons/si";

export default function Cards({ record, priority = false }) {
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
      // If back button is pressed while modal is open, close it
      if (isOpen) {
        setIsOpen(false);
        setIsPlaying(false);
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
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

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const trackEvent = (eventName) => {
    if (typeof window !== 'undefined' && window.umami) {
      window.umami.track(eventName);
    }
  };

  const openModal = (e) => {
    e.preventDefault();
    trackEvent(`Yayın Kartı Tıklandı: ${record.title}`);
    // Add fake history state so back button closes modal
    window.history.pushState(null, "", window.location.href);
    setIsPlaying(false);
    setIsOpen(true);
  };

  const closeModal = (e) => {
    e.stopPropagation();
    // Go back in history (which triggers popstate -> closes modal)
    // We only do this if modal is actually open to avoid accidental navigation
    if (isOpen) {
      window.history.back();
    }
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

  // Helper to get icon based on platform key
  const getIcon = (key) => {
    switch (key) {
      case "spotify": return <FaSpotify />;
      case "appleMusic": return <FaApple />;
      case "youtubeMusic": return <SiYoutubemusic />;
      case "youtube": return <FaYoutube />;
      case "deezer": return <FaDeezer />;
      case "amazonMusic": return <FaAmazon />;
      case "amazonStore": return <FaAmazon />;
      default: return null;
    }
  };

  // Helper to get nice name
  const getName = (key) => {
    switch (key) {
      case "spotify": return "Spotify";
      case "appleMusic": return "Apple Music";
      case "youtubeMusic": return "YouTube Music";
      case "youtube": return "YouTube";
      case "deezer": return "Deezer";
      case "amazonMusic": return "Amazon Music";
      case "amazonStore": return "Amazon";
      default: return key;
    }
  };

  return (
    <>
      {/* Card Trigger */}
      <div 
        className="card" 
        onClick={openModal} 
        style={{ cursor: "pointer" }}
      >
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
          <span className="tag">{record.tag}</span>
        </div>
      </div>

      {/* Modal Overlay via Portal */}
      {mounted && isOpen && createPortal(
        <div className="music-modal-overlay" onClick={closeModal}>
          <div className="music-modal-content" onClick={(e) => e.stopPropagation()}>
            
            {/* Close Button */}
            <button className="music-modal-close" onClick={closeModal}>
              <FaTimes />
            </button>

            {/* Artwork */}
            <div className="music-modal-header">
              <Image
                src={record.image}
                alt={record.title}
                width={200}
                height={200}
                className="music-modal-artwork"
              />
              <h3>{record.title}</h3>
              
              {/* Custom Preview Player */}
              {record.previewUrl && (
                <div className="custom-player">
                  <p className="preview-label">Önizleme</p>
                  
                  <audio 
                    ref={audioRef} 
                    src={record.previewUrl} 
                    onEnded={handleAudioEnded}
                  />

                  <div className="player-controls">
                    <button 
                      className="play-btn" 
                      onClick={() => {
                        togglePlay();
                        trackEvent(isPlaying ? `Yayın Demosu Durduruldu: ${record.title}` : `Yayın Demosu Oynatıldı: ${record.title}`);
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

              {!record.previewUrl && <p>Dinlemek için platform seçin</p>}
            </div>

            {/* Links - Sorted by Popularity in TR */}
            <div className="music-modal-links">
              {(() => {
                const platforms = record.platforms || {};
                const order = ["youtubeMusic", "spotify", "appleMusic", "deezer", "amazonMusic"];
                
                // Get keys that are present in data
                const presentKeys = Object.keys(platforms);
                
                // Sort keys based on defined order, append others at the end
                const sortedKeys = presentKeys.sort((a, b) => {
                  const indexA = order.indexOf(a);
                  const indexB = order.indexOf(b);
                  
                  if (indexA !== -1 && indexB !== -1) return indexA - indexB;
                  if (indexA !== -1) return -1;
                  if (indexB !== -1) return 1;
                  return 0;
                });

                return sortedKeys.map((key) => {
                  const url = platforms[key];
                  if (!url) return null;
                  
                  // Filters
                  if (key === 'itunes' && platforms.appleMusic) return null;
                  if (key === 'amazonStore') return null; // Remove Amazon Store (redundant)
                  // Show YouTube ONLY if it is a manual override (user explicitly requested it)
                  if (key === 'youtube' && !record.hasManualYoutube) return null;

                  return (
                    <a 
                      key={key} 
                      href={url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className={`platform-btn ${key}`}
                      onClick={() => trackEvent(`Yayın Modalı: ${getName(key)}'a Gidildi (${record.title})`)}
                    >
                      <span className="platform-icon">{getIcon(key)}</span>
                      <span className="platform-name">{getName(key)}</span>
                      <span className="platform-action">Dinle</span>
                    </a>
                  );
                });
              })()}
            </div>

          </div>
        </div>,
        document.body
      )}
    </>
  );
}