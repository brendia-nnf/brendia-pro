"use client";

import { useRef, useState } from "react";
import { Container } from "@/components/ui";
import { useTranslations } from "next-intl";
import { useGSAP } from "@/hooks";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function VideoIntro() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const t = useTranslations("videoIntro");

  useGSAP(
    () => {
      gsap.fromTo(
        "[data-animate]",
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
          },
        }
      );
    },
    { scope: sectionRef }
  );

  const handlePlayClick = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <section ref={sectionRef} className="py-20 md:py-32 bg-cream">
      <Container>
        <div className="max-w-4xl mx-auto">
          {/* Section heading */}
          <div data-animate className="text-center mb-12">
            <p className="text-secondary text-sm font-medium tracking-widest uppercase mb-4">
              {t("tagline")}
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading text-primary">
              {t("title")}
            </h2>
          </div>

          {/* Video container */}
          <div data-animate className="relative aspect-video bg-primary/5 overflow-hidden group">
            {/* Video element */}
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              poster="/images/video-poster.jpg"
              playsInline
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
            >
              <source src="/videos/video-web-brendia.mp4" type="video/mp4" />
              {t("browserNotSupported")}
            </video>

            {/* Play/Pause overlay */}
            <button
              onClick={handlePlayClick}
              className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
                isPlaying ? "opacity-0 hover:opacity-100" : "opacity-100"
              }`}
              aria-label={isPlaying ? t("pauseVideo") : t("playVideo")}
            >
              <div className="w-20 h-20 md:w-24 md:h-24 bg-white/95 backdrop-blur-sm flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                {isPlaying ? (
                  <svg
                    className="w-8 h-8 text-primary"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                ) : (
                  <svg
                    className="w-8 h-8 text-primary ml-1"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </div>
            </button>

            {/* Decorative corner accents */}
            <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-secondary/30" />
            <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-secondary/30" />
            <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-secondary/30" />
            <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-secondary/30" />
          </div>

          {/* Caption */}
          <p data-animate className="text-center text-primary/50 text-sm mt-6">
            {t("caption")}
          </p>
        </div>
      </Container>
    </section>
  );
}
