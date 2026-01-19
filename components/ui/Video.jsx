"use client";

import { useState } from "react";
import Image from "next/image";
import { FaPlay } from "react-icons/fa";

export default function Video({ youtubeId, title, thumbnail }) {
  const [showVideo, setShowVideo] = useState(false);

  return (
    <div 
      className="video" 
      style={{ 
        position: "relative",
        // Force aspect ratio in JS to prevent collapse
        aspectRatio: "16 / 9", 
        // Width is handled by CSS class .video
        cursor: showVideo ? "default" : "pointer",
        backgroundColor: "#000",
        // Fix border-radius overflow bug on mobile/webkit
        borderRadius: "12px",
        overflow: "hidden",
        transform: "translateZ(0)", 
        WebkitTransform: "translateZ(0)"
      }}
      onClick={() => {
        if (!showVideo) {
          if (typeof window !== 'undefined' && window.umami) {
            window.umami.track(`Video Oynatıldı: ${title}`);
          }
          setShowVideo(true);
        }
      }}
    >
      {!showVideo ? (
        <>
          <Image
            src={thumbnail}
            alt={`Music video for ${title}`}
            fill
            priority
            sizes="(max-width: 768px) 90vw, 600px" // Correct sizing for optimization
            style={{ objectFit: "cover", opacity: 0.9 }}
          />
          <div 
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "60px",
              height: "60px",
              backgroundColor: "rgba(0,0,0,0.7)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid #fff",
              boxShadow: "0 0 20px rgba(0,0,0,0.5)",
              zIndex: 2 // Ensure button is above image
            }}
          >
            <FaPlay style={{ color: "#fff", fontSize: "1.5rem", marginLeft: "4px" }} />
          </div>
        </>
      ) : (
        <iframe
          key={title}
          name={title}
          style={{ width: "100%", height: "100%", border: "none" }}
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0&controls=1&autoplay=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      )}
    </div>
  );
}
