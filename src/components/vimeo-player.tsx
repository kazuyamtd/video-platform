"use client";

import Player from "@vimeo/player";
import { useEffect, useRef } from "react";
import { toVimeoUrl } from "@/lib/vimeo";

export function VimeoPlayer({ video }: { video: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const player = new Player(containerRef.current!, {
      url: toVimeoUrl(video),
      responsive: true,
      dnt: true,
    });
    return () => {
      player.destroy();
    };
  }, [video]);

  return <div ref={containerRef} className="overflow-hidden rounded-lg bg-black" />;
}
