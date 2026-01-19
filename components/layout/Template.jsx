"use client";

import Footer from "./Footer";
import Header from "./Header";
import Nav from "./Nav";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function Template(props) {
  const pathname = usePathname();
  const isFirstRender = useRef(true);
  const contentRef = useRef(null);
  const wrapperRef = useRef(null);
  const [minHeight, setMinHeight] = useState("50vh");
  
  // Use a ref to store the numeric max height to avoid dependency loops and parsing issues
  const maxHeightRef = useRef(0);

  // Initialize ref with viewport calculation on mount if needed
  useEffect(() => {
    if (typeof window !== 'undefined' && maxHeightRef.current === 0) {
      maxHeightRef.current = window.innerHeight * 0.5;
    }
  }, []);

  // Keep track of the maximum height encountered
  useEffect(() => {
    if (!contentRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const currentHeight = entry.contentRect.height;
        
        // Only update if significantly larger (ignore sub-pixel differences)
        // threshold of 1px prevents infinite loops from float rounding
        if (currentHeight > maxHeightRef.current + 1) {
          maxHeightRef.current = currentHeight;
          setMinHeight(`${currentHeight}px`);
        }
      }
    });

    observer.observe(contentRef.current);

    return () => observer.disconnect();
  }, [pathname]); // Re-attach on pathname change just in case, though refs persist

  useEffect(() => {
    // Disable default browser scroll restoration to prevent jumps
    if (typeof window !== 'undefined') {
      window.history.scrollRestoration = 'manual';
    }

    // Prevent scroll on initial load (let user see the header)
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Wait for the next paint frame to ensure DOM is updated
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const contentStart = document.getElementById("content-start");
        
        // Scroll to content regardless of position
        if (contentStart) {
          const rect = contentStart.getBoundingClientRect();
          const offset = 80; // Approximate nav height
          // Calculate absolute top position relative to document
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          const targetPosition = rect.top + scrollTop - offset;
  
          window.scrollTo({
            top: targetPosition,
            behavior: "smooth"
          });
        }
      });
    });

    return () => {
      // Optional: Restore auto if needed, but keeping manual is often better for SPAs
      // window.history.scrollRestoration = 'auto';
    };
  }, [pathname]);

  return (
    <div>
      <Header />
      <Nav />
      {/* Scroll margin top ensures the fixed nav doesn't cover the content start */}
      <main 
        id="content-start" 
        style={{ scrollMarginTop: "100px", minHeight: minHeight }}
        ref={wrapperRef}
      >
        <div ref={contentRef}>
          {props.children}
        </div>
      </main>
      <Footer />
    </div>
  );
}