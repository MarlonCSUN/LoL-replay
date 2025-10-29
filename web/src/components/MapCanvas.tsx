// Draws SR background, learned tower sites (alive at time t), and champions (skull when dead).
// NOTE: towers come from props.aliveTowers — learned dynamically, no hardcoded list.

import { useEffect, useRef } from "react";
import { Frame, MAP_SIZE, ParticipantLite, neighborFrames, predictPosition } from "../lib/riotTimeline";
import { getRemainingDeathTimer, type DeathInfo } from "../lib/deathTimer";

type MarkerStyle = "name" | "dot";

type AliveTower = {
  x: number; y: number;
  teamId: 100 | 200;
};

type Props = {
  width: number;
  height: number;
  participants: ParticipantLite[];
  frames: Frame[];
  timeMs: number;
  showHalos?: boolean;
  markerStyle?: MarkerStyle;
  dead: Set<number>;
  aliveTowers: AliveTower[]; // NEW: already filtered by time
  deathMap: Map<number, DeathInfo[]>;
};

const imageCache = new Map<string, HTMLImageElement>();

// Helper to laod and cache champion portrait
function loadChampionImage(championName: string): HTMLImageElement | null {
  // Check cache first
  if (imageCache.has(championName)) {
    return imageCache.get(championName)!;
  }

  const img = new Image();
  // We use data dragon which is Riot's official image source
  // Champion names must match exactly as it is case-sensitive
  const cleanName = championName.replace(/['\s]/g, ""); // This removes spaces and apostrophes for champions like Kai'Sa
  img.src = `https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/${cleanName}.png`;

  // Enables cross origin resource sharing
  img.crossOrigin = "anonymous";

  // Store in cache to prevent duplicate requests
  imageCache.set(championName, img);

  return img;
}

export default function MapCanvas({
  width, 
  height, 
  participants, 
  frames, 
  timeMs,
  showHalos = true, 
  markerStyle = "name",
  dead, 
  aliveTowers,
  deathMap,
}: Props) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const bgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.src = "/maps/sr.png";          // 512x512
    img.onload = () => { bgRef.current = img; draw(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { draw(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [
    timeMs, frames, participants, width, height, showHalos, markerStyle, dead, aliveTowers, deathMap
  ]);

  function draw() {
    const canvas = ref.current; 
    if (!canvas) return;
    const ctx = canvas.getContext("2d"); 
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    if (bgRef.current) ctx.drawImage(bgRef.current, 0, 0, width, height);
    else { ctx.fillStyle = "#0b1020"; ctx.fillRect(0, 0, width, height); }

    const sx = width / MAP_SIZE;
    const sy = height / MAP_SIZE;

    // Towers (learned)
    for (const site of aliveTowers) {
      const x = site.x * sx;
      const y = height - site.y * sy;
      drawTowerIcon(ctx, x, y, site.teamId === 100 ? "#3B82F6" : "#EF4444");
    }

    // Champions interpolated position
    const nbr = neighborFrames(frames, timeMs);
    if (!nbr) return;
    const { prev, next } = nbr;

    for (const p of participants) {
      const pPrev = prev.positions[p.participantId];
      const pNext = next.positions[p.participantId];
      const pos = predictPosition(pPrev, pNext, prev.t, next.t, timeMs);
      if (!pos) continue;

      const x = pos.x * sx;
      const y = height - pos.y * sy;
      const isDead = dead.has(p.participantId);

      if (showHalos && !isDead) {
        const sincePrevSec = Math.max(0, timeMs - prev.t) / 1000;
        const haloR = clamp(6, 24, 6 + sincePrevSec * 4);
        ctx.beginPath();
        ctx.arc(x, y, haloR, 0, Math.PI * 2);
        ctx.fillStyle = p.teamId === 100 ? "rgba(59,130,246,0.15)" : "rgba(239,68,68,0.15)";
        ctx.fill();
      }

      if (isDead) {
        // Get death timer
        const remainingSeconds = getRemainingDeathTimer(deathMap, p.participantId, timeMs);
        drawSkull(ctx, x, y, 1);

        if (remainingSeconds !== null && remainingSeconds > 0) {
          drawDeathTimer(ctx, x, y, remainingSeconds);
        }

        drawLabel(ctx, p.championName || p.summonerName || "Player", x, y - 16, "#6b7280");
      } else {
        // Champion portrait if alive
        const portraitImg = loadChampionImage(p.championName);

        // Check if image is loaded and ready
        if (portraitImg && portraitImg.complete && portraitImg.naturalWidth > 0) {
          // Draw the portrait as a circle
          drawCircularImage(ctx, portraitImg, x, y, 16, p.teamId === 100 ? "#3B82F6" : "#EF4444");
        } else {

        
        ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fillStyle = "#fff"; ctx.fill();
        ctx.lineWidth = 3; ctx.strokeStyle = p.teamId === 100 ? "#3B82F6" : "#EF4444";
        ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2); ctx.stroke();
        }
        if (markerStyle === "name") {
          drawLabel(ctx, p.championName || p.summonerName || "Player", x, y - 16, p.teamId === 100 ? "#3B82F6" : "#EF4444");
        }
      }
    }
  }

  return <canvas 
  ref={ref} 
  width={width} 
  height={height} 
  style={{ width, height, borderRadius: 12, boxShadow: "0 2px 18px rgba(0,0,0,0.25)" }} />;
}

function drawCircularImage(
  ctx: CanvasRenderingContext2D, 
  img: HTMLImageElement, 
  x: number, 
  y: number, 
  radius: number,
  borderColor: string
) {
  ctx.save(); 

  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.clip();

  ctx.drawImage(
    img,
    x - radius,
    y - radius,
    radius * 2,
    radius * 2
  );

  ctx.restore();

  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 3;
  ctx.stroke();
  
  ctx.beginPath();
  ctx.arc(x, y, radius - 1, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(0,0,0,0.3)";
  ctx.lineWidth = 1;
  ctx.stroke();
}
/* helpers */
function drawTowerIcon(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  ctx.save(); 
  ctx.translate(x, y);
  ctx.fillStyle = "#fff"; 
  ctx.strokeStyle = color; 
  ctx.lineWidth = 2;
  ctx.beginPath(); 
  ctx.rect(-7, -14, 14, 18); 
  ctx.fill(); ctx.stroke();
  ctx.beginPath(); 
  ctx.moveTo(-8, -14); 
  ctx.lineTo(0, -22); 
  ctx.lineTo(8, -14); 
  ctx.closePath();
  ctx.fillStyle = color; 
  ctx.fill(); 
  ctx.restore();
}

function drawDeathTimer(
  ctx: CanvasRenderingContext2D, 
  x: number, 
  y: number, 
  seconds: number
) {
  ctx.beginPath();
  ctx.arc(x, y + 20, 12, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0,0,0,0.8)";
  ctx.fill();
  ctx.strokeStyle = "#ef4444";
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // Timer text
  ctx.fillStyle = "#fff";
  ctx.font = "bold 10px system-ui";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(seconds.toString(), x, y + 20);
}

function drawSkull(ctx: CanvasRenderingContext2D, x: number, y: number, scale = 1) {
  ctx.save(); 
  ctx.translate(x, y); 
  ctx.scale(scale, scale); 
  ctx.fillStyle = "#1f2937";
  ctx.beginPath(); 
  ctx.arc(0, -4, 7, 0, Math.PI * 2); 
  ctx.fill();
  ctx.fillStyle = "#fff"; 
  ctx.beginPath(); 
  ctx.arc(-3, -5, 1.5, 0, Math.PI * 2); 
  ctx.fill();
  ctx.beginPath(); 
  ctx.arc(3, -5, 1.5, 0, Math.PI * 2); 
  ctx.fill();
  ctx.fillStyle = "#1f2937"; 
  ctx.fillRect(-5, 2, 10, 4); 
  ctx.restore();
}

function drawLabel(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, accent: string) {
  ctx.font = "12px system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif";
  ctx.textBaseline = "middle";
  const padX = 6; const tw = ctx.measureText(text).width; const w = tw + padX * 2; const h = 18;
  roundRect(ctx, x - w / 2, y - h, w, h, 8, "rgba(255,255,255,0.95)");
  ctx.beginPath(); ctx.moveTo(x - w / 2 + 6, y - 3); ctx.lineTo(x + w / 2 - 6, y - 3);
  ctx.lineWidth = 2; ctx.strokeStyle = accent; ctx.stroke();
  ctx.fillStyle = "#111827"; ctx.fillText(text, x - w / 2 + padX, y - h / 2 + 2);
}
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, fill: string) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}
function clamp(min: number, max: number, v: number) { 
  return Math.max(min, Math.min(max, v)); 
}
