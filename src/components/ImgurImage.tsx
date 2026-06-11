/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Image, ImageOff } from "lucide-react";

interface ImgurImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: "1:1" | "16:9" | "4:3" | "3:4" | "custom";
}

export default function ImgurImage({
  src,
  alt,
  className = "",
  aspectRatio = "4:3",
}: ImgurImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [currentSrc, setCurrentSrc] = useState(src);

  // Sync internal state when external src changes
  useEffect(() => {
    setCurrentSrc(src);
    setErrorCount(0);
    setLoaded(false);
  }, [src]);

  // Handle Imgur link optimization
  // If it's a standard imgur link (e.g. i.imgur.com/xyz.jpg), we can check it
  const getOptimizedUrl = (url: string) => {
    if (!url) return "";
    // If it's an imgur url and doesn't have secure protocol, upgrade it
    let finalUrl = url.trim();
    if (finalUrl.includes("imgur.com") && finalUrl.startsWith("http://")) {
      finalUrl = finalUrl.replace("http://", "https://");
    }
    return finalUrl;
  };

  const handleLoad = () => {
    setLoaded(true);
  };

  const handleError = () => {
    if (errorCount === 0) {
      // Fallback 1: Try a high-quality fallback therapy placeholder based on the Alt text keywords
      setErrorCount(1);
      if (alt.toLowerCase().includes("facial") || alt.toLowerCase().includes("soin")) {
        setCurrentSrc("https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=800");
      } else if (alt.toLowerCase().includes("massage")) {
        setCurrentSrc("https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=800");
      } else {
        setCurrentSrc("https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800");
      }
    } else {
      // Fallback 2: General safe fallback graphics to ensure no blank breaks
      setErrorCount(2);
    }
  };

  const aspectClass = {
    "1:1": "aspect-square",
    "16:9": "aspect-video",
    "4:3": "aspect-[4/3]",
    "3:4": "aspect-[3/4]",
    "custom": "",
  }[aspectRatio || "4:3"];

  return (
    <div className={`relative overflow-hidden bg-stone-100 dark:bg-stone-900 rounded-2xl ${aspectClass} ${className}`}>
      {/* Elegantly styled placeholder shimmer while loading */}
      {!loaded && errorCount < 2 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-tr from-stone-100 to-stone-200 animate-pulse">
          <div className="w-10 h-10 border-t-2 border-r-2 border-[#C5A880] rounded-full animate-spin mb-2"></div>
          <span className="text-[10px] font-mono tracking-widest text-[#C5A880] uppercase">Chez Lou Beauty</span>
        </div>
      )}

      {/* Extreme fallback graphics if both primary and secondary fail */}
      {errorCount >= 2 ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-stone-100 border border-stone-200/50">
          <ImageOff className="w-8 h-8 text-stone-400 mb-2 stroke-[1.2]" />
          <span className="text-xs text-stone-500 font-sans">{alt || "Visual indisponible"}</span>
          <span className="text-[10px] text-stone-300 font-mono mt-1">Chez Lou Royal Beauty</span>
        </div>
      ) : (
        <img
          src={getOptimizedUrl(currentSrc)}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
          referrerPolicy="no-referrer"
          className={`w-full h-full object-cover transition-all duration-700 ease-out ${
            loaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
          }`}
        />
      )}
    </div>
  );
}
