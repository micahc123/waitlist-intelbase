"use client";

import { useRef, useEffect } from "react";

interface VideoBackgroundProps {
  src: string;
  className?: string;
  desaturated?: boolean;
}

export function VideoBackground({
  src,
  className = "",
  desaturated = false,
}: VideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (src.endsWith(".m3u8")) {
      import("hls.js").then(({ default: Hls }) => {
        if (Hls.isSupported()) {
          const hls = new Hls();
          hls.loadSource(src);
          hls.attachMedia(video);
          return () => hls.destroy();
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = src;
        }
      });
    } else {
      video.src = src;
    }
  }, [src]);

  return (
    <video
      ref={videoRef}
      autoPlay
      loop
      muted
      playsInline
      className={`absolute inset-0 h-full w-full object-cover ${desaturated ? "saturate-0" : ""} ${className}`}
    />
  );
}
