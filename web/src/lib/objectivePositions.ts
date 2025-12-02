import type { ReplayEvent } from "./riotTimeline";

// Objective spawn locations on Summoner's Rift
export type ObjectiveType = "dragon" | "baron" | "herald";

export type ObjectivePosition = {
  type: ObjectiveType;
  x: number;
  y: number;
  available?: boolean;
};

// These positions are always the same on Summoner's Rift

const DRAGON_PIT = { x: 9866, y: 4414 }; // Dragon pit center
const RIFT_PIT = { x: 5007, y: 10471 }; //for both Baron and Herald


const FIRST_DRAGON_SPAWN = 5 * 60 * 1000;    // 5:00
const DRAGON_RESPAWN = 5 * 60 * 1000;         // 5 minutes after death
const FIRST_HERALD_SPAWN = 8 * 60 * 1000;     // 8:00
const HERALD_DESPAWN = 19 * 60 * 1000 + 45 * 1000; // 19:45
const FIRST_BARON_SPAWN = 20 * 60 * 1000;     // 20:00
const BARON_RESPAWN = 6 * 60 * 1000;          // 6 minutes after death

/**
 * Calculate which objectives are currently available
 * Takes into account spawn times, death times, and respawns
 */
export function getVisibleObjectives(
  events: ReplayEvent[],
  currentTimeMs: number
): ObjectivePosition[] {
  const objectives: ObjectivePosition[] = [];
  
  // Find all epic monster kills up to current time
  const epicKills = events.filter(
    e => e.kind === "ELITE_MONSTER_KILL" && e.t <= currentTimeMs
  );
  
  // DRAGON LOGIC
  const dragonAvailable = isDragonAvailable(epicKills, currentTimeMs);
  if (dragonAvailable) {
    objectives.push({
      type: "dragon",
      x: DRAGON_PIT.x,
      y: DRAGON_PIT.y,
      available: true,
    });
  }
  
  // HERALD LOGIC (only before 19:45)
  if (currentTimeMs < HERALD_DESPAWN) {
    const heraldAvailable = isHeraldAvailable(epicKills, currentTimeMs);
    if (heraldAvailable) {
      objectives.push({
        type: "herald",
        x: RIFT_PIT.x,
        y: RIFT_PIT.y,
        available: true,
      });
    }
  }
  
  // BARON LOGIC (only after 20:00)
  if (currentTimeMs >= FIRST_BARON_SPAWN) {
    const baronAvailable = isBaronAvailable(epicKills, currentTimeMs);
    if (baronAvailable) {
      objectives.push({
        type: "baron",
        x: RIFT_PIT.x,
        y: RIFT_PIT.y,
        available: true,
      });
    }
  }
  
  return objectives;
}

// Check if dragon is currently alive
function isDragonAvailable(
  epicKills: ReplayEvent[],
  currentTimeMs: number
): boolean {
  // Not spawned yet
  if (currentTimeMs < FIRST_DRAGON_SPAWN) return false;
  
  // Find all dragon kills
  const dragonKills = epicKills.filter(e => 
    e.monsterType?.includes("DRAGON")
  );
  
  // No dragons killed yet - it's alive
  if (dragonKills.length === 0) return true;
  
  // Find most recent dragon kill
  const lastKill = dragonKills[dragonKills.length - 1];
  const timeSinceKill = currentTimeMs - lastKill.t;
  
  // Has it respawned?
  return timeSinceKill >= DRAGON_RESPAWN;
}

// Check if herald is currently alive
function isHeraldAvailable(
  epicKills: ReplayEvent[],
  currentTimeMs: number
): boolean {
  // Not spawned yet
  if (currentTimeMs < FIRST_HERALD_SPAWN) return false;
  
  // Despawns at 19:45
  if (currentTimeMs >= HERALD_DESPAWN) return false;
  
  // Find herald kills
  const heraldKills = epicKills.filter(e => 
    e.monsterType?.includes("HERALD") || e.monsterType?.includes("RIFTHERALD")
  );
  
  // Herald can only be killed twice (2 spawns before 19:45)
  // If killed twice, it's gone
  if (heraldKills.length >= 2) return false;
  
  // If killed once, check if it respawned (6 min respawn)
  if (heraldKills.length === 1) {
    const lastKill = heraldKills[0];
    const timeSinceKill = currentTimeMs - lastKill.t;
    return timeSinceKill >= 6 * 60 * 1000; // 6 min respawn
  }
  
  // Never killed - it's alive
  return true;
}

//Check if baron is currently alive
function isBaronAvailable(
  epicKills: ReplayEvent[],
  currentTimeMs: number
): boolean {
  // Not spawned yet
  if (currentTimeMs < FIRST_BARON_SPAWN) return false;
  
  // Find baron kills
  const baronKills = epicKills.filter(e => 
    e.monsterType?.includes("BARON")
  );
  
  // No barons killed yet - it's alive
  if (baronKills.length === 0) return true;
  
  // Find most recent baron kill
  const lastKill = baronKills[baronKills.length - 1];
  const timeSinceKill = currentTimeMs - lastKill.t;
  
  // Has it respawned?
  return timeSinceKill >= BARON_RESPAWN;
}
