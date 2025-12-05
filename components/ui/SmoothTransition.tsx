"use client";

import { ReactNode, useEffect, useState } from "react";

interface SmoothTransitionProps {
  children: ReactNode;
  transitionKey: string;
  duration?: number;
}

export default function SmoothTransition({
  children,
  transitionKey,
  duration = 300,
}: SmoothTransitionProps) {
  const [displayChildren, setDisplayChildren] = useState(children);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [lastKey, setLastKey] = useState(transitionKey);

  useEffect(() => {
    if (transitionKey !== lastKey) {
      setIsTransitioning(true);
      setLastKey(transitionKey);

      const timer = setTimeout(() => {
        setDisplayChildren(children);
        setIsTransitioning(false);
      }, duration / 2);

      return () => clearTimeout(timer);
    } else {
      setDisplayChildren(children);
    }
  }, [children, transitionKey, lastKey, duration]);

  return (
    <div
      style={{
        opacity: isTransitioning ? 0.7 : 1,
        transition: `opacity ${duration}ms ease-in-out`,
      }}
    >
      {displayChildren}
    </div>
  );
}
