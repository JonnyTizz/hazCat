import { useEffect, useState } from "react";

const RAIN_DROP_COUNT = 100;
const RAIN_DURATION_MS = 3000;

type RainDrop = {
  id: number;
  left: number;
  delay: number;
  duration: number;
  opacity: number;
  size: number;
};

function generateRainDrops(): RainDrop[] {
  return Array.from({ length: RAIN_DROP_COUNT }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 1,
    duration: 0.5 + Math.random() * 0.5,
    opacity: 0.3 + Math.random() * 0.7,
    size: 1 + Math.random() * 2,
  }));
}

type BlueRainProps = {
  onComplete?: () => void;
};

export function BlueRain({ onComplete }: BlueRainProps) {
  const [drops] = useState<RainDrop[]>(() => generateRainDrops());
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Start fading out before removing
    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, RAIN_DURATION_MS - 500);

    // Remove component after duration
    const removeTimer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, RAIN_DURATION_MS);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [onComplete]);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 pointer-events-none overflow-hidden z-50 transition-opacity duration-500 ${
        isFading ? "opacity-0" : "opacity-100"
      }`}
      aria-hidden="true"
    >
      {drops.map((drop) => (
        <div
          key={drop.id}
          className="absolute top-0 animate-rain-fall"
          style={{
            left: `${drop.left}%`,
            animationDelay: `${drop.delay}s`,
            animationDuration: `${drop.duration}s`,
            opacity: drop.opacity,
          }}
        >
          <div
            className="bg-blue-400 rounded-full"
            style={{
              width: `${drop.size}px`,
              height: `${drop.size * 8}px`,
            }}
          />
        </div>
      ))}
    </div>
  );
}
