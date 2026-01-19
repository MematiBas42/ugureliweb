"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function Nav() {
  const pathname = usePathname();
  const [scroll, setScroll] = useState(false);
  const nav = useRef();

  // Handle smooth scroll on click
  const handleLinkClick = (e, href, eventName) => {
    // Track event if provided and umami is available
    if (typeof window !== 'undefined' && window.umami && eventName) {
      window.umami.track(eventName);
    }

    // Only scroll manually if we are staying on the same page
    // If changing pages, let Template.jsx handle the scroll after render
    if (pathname === href) {
      scrollToContent();
    }
  };

  const scrollToContent = () => {
    const contentStart = document.getElementById("content-start");
    if (contentStart) {
      const rect = contentStart.getBoundingClientRect();
      const offset = 80;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const targetPosition = rect.top + scrollTop - offset;

      window.scrollTo({
        top: targetPosition,
        behavior: "smooth"
      });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (!nav.current) return;
      const rect = nav.current.getBoundingClientRect();
      setScroll(rect.top <= 0);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <nav className={scroll ? "stuck" : ""} ref={nav}>
      <ul className="navbar">
        <li>
          <Link 
            href="/" 
            scroll={false} 
            onClick={(e) => handleLinkClick(e, "/", "Menü: Müzik Sayfasına Gidildi")} 
            className={pathname === "/" ? "active" : "inactive"}
          >
            Müzik
          </Link>
        </li>
        <li>
          <Link
            href="/shows"
            scroll={false}
            onClick={(e) => handleLinkClick(e, "/shows", "Menü: Konserler Sayfasına Gidildi")}
            className={pathname.startsWith("/shows") ? "active" : "inactive"}
          >
            Konserler
          </Link>
        </li>
        <li>
          <Link
            href="/about"
            scroll={false}
            onClick={(e) => handleLinkClick(e, "/about", "Menü: Hakkında Sayfasına Gidildi")}
            className={pathname.startsWith("/about") ? "active" : "inactive"}
          >
            Hakkında
          </Link>
        </li>
      </ul>
    </nav>
  );
}