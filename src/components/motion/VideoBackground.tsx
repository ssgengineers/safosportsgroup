import { useEffect, useRef } from "react";

interface VideoBackgroundProps {
  src: string;
  blur?: boolean;
  overlay?: boolean;
  className?: string;
}

export const VideoBackground = ({
  src,
  blur = false,
  overlay = true,
  className = "",
}: VideoBackgroundProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.log("Video autoplay failed:", error);
      });
    }
  }, []);

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className={`w-full h-full object-cover ${blur ? "blur-md scale-110" : ""}`}
      >
        <source src={src} type="video/mp4" />
      </video>
      {overlay && (
        <div className="absolute inset-0 bg-black/40" />
      )}
    </div>
  );
};
