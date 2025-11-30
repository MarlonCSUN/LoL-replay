import type { ReplayEvent } from "./riotTimeline";

export type TowerKey = string;

export type TowerInfo = {
  teamId: 100 | 200;
  lane: "TOP" | "MID" | "BOT";
  type: "OUTER" | "INNER" | "INHIBITOR" | "NEXUS" | "INHIBITOR_BUILDING" | "NEXUS_BUILDING";
  x: number;
  y: number;
  alive: boolean;
};

export function getTowerKey (
  teamId: 100 | 200,
  lane: string,
  type: string
): TowerKey {
     const normalizedLane = lane.includes("TOP") ? "TOP"
      : lane.includes("MID") ? "MID"
      : lane.includes("BOT") ? "BOT"
      : "UNKNOWN";

      const normalizedType = type.includes("OUTER") ? "OUTER"
      : type.includes("INNER") ? "INNER"
      : type.includes("BASE") ? "INHIBITOR"
      : type.includes("INHIBITOR_BUILDING") ? "INHIBITOR_BUILDING"
      : type.includes("INHIBITOR") ? "INHIBITOR"
      : type.includes("NEXUS") ? "NEXUS"
      : type.includes("NEXUS_BUILDING") ? "NEXUS_BUILDING"
      : "UNKNOWN";

      return `${teamId}|${normalizedLane}|${normalizedType}`;
}

export function getInitialTowerPositions(): Map<TowerKey, TowerInfo> {
  const towers = new Map<TowerKey, TowerInfo>();

  const keyCounters = new Map<string, number>();

  function addTower(
    teamId: 100 | 200,
    lane: "TOP" | "MID" | "BOT",
    type: "OUTER" | "INNER" | "INHIBITOR" | "NEXUS" | "INHIBITOR_BUILDING" | "NEXUS_BUILDING",
    x: number,
    y: number
  ) {
    let key = getTowerKey(teamId, lane, type);

    if(towers.has(key)) {
    const currentCount = keyCounters.get(key) || 1;
      const newCount = currentCount + 1;
      keyCounters.set(key, newCount);
      key = `${key}_${newCount}`;
    } else {
      keyCounters.set(key, 1);
    }
    towers.set(key, { teamId, lane, type, x, y, alive: true });
  }

  // Blue team towers
  addTower(100, "TOP", "OUTER", 981, 10441);
  addTower(100, "TOP", "INNER", 1512, 6699);
  addTower(100, "TOP", "INHIBITOR", 1169, 4287);
  addTower(100, "TOP", "INHIBITOR_BUILDING", 1171, 3571);
  
  // Mid Lane 
  addTower(100, "MID", "OUTER", 5846, 6396);
  addTower(100, "MID", "INNER", 5048, 4812);
  addTower(100, "MID", "INHIBITOR", 3651, 3696);
  addTower(100, "MID", "INHIBITOR_BUILDING", 3203, 3208)
  
  // Bot Lane 
  addTower(100, "BOT", "OUTER", 10504, 1029);
  addTower(100, "BOT", "INNER", 6919, 1483);
  addTower(100, "BOT", "INHIBITOR", 4281, 1253);
  addTower(100, "BOT", "INHIBITOR_BUILDING", 3452, 1236);
  
  // Nexus Towers 
  addTower(100, "MID", "NEXUS", 2177, 1807);
  addTower(100, "MID", "NEXUS", 1748, 2270);

  // Nexus Building
  addTower(100, "MID", "NEXUS_BUILDING", 1417, 1500);

  
  
  // Red team towers
  
  // Top Lane 
  addTower(200, "TOP", "OUTER", 4318, 13875);
  addTower(200, "TOP", "INNER", 7943, 13411);
  addTower(200, "TOP", "INHIBITOR", 10481, 13650);
  addTower(200, "TOP", "INHIBITOR_BUILDING", 11261, 13676);
  
  // Mid Lane 
  addTower(200, "MID", "OUTER", 8955, 8510);
  addTower(200, "MID", "INNER", 9767, 10113);
  addTower(200, "MID", "INHIBITOR", 11134, 11207);
  addTower(200, "MID", "INHIBITOR_BUILDING", 11598, 11667);

  // Bot Lane 
  addTower(200, "BOT", "OUTER", 13866, 3932);
  addTower(200, "BOT", "INNER", 13327, 8226);
  addTower(200, "BOT", "INHIBITOR", 13624, 10572);
  addTower(200, "BOT", "INHIBITOR_BUILDING", 13604, 11316);
  
  // Nexus Towers 
  addTower(200, "MID", "NEXUS", 12611, 13084);
  addTower(200, "MID", "NEXUS", 13052, 12612); 

  // Nexus Building
   addTower(200, "MID", "NEXUS_BUILDING", 13350, 13350);
  
  return towers;
}

export function getAliveTowersAt(
  events: ReplayEvent[],
  currentTime: number
): Array<{ 
  x: number; 
  y: number; 
  teamId: 100 | 200; 
  type: "OUTER" | "INNER" | "INHIBITOR" | "NEXUS" | "INHIBITOR_BUILDING" | "NEXUS_BUILDING"; }> {
  
  const initialTowers = getInitialTowerPositions();
  const updated = updateTowerStates(initialTowers, events, currentTime);
  const alive = [];

  for (const tower of updated.values()) {
    if (tower.alive) {
      alive.push({
        x: tower.x,
        y: tower.y,
        teamId: tower.teamId,
        type: tower.type,
      });
    }
  }
  console.log(`getAliveTowersAt: ${alive.length} towers alive at time ${currentTime}`);
    return alive;
}

export function updateTowerStates(
  towers: Map<TowerKey, TowerInfo>,
  events: ReplayEvent[],
  currentTime: number
): Map<TowerKey, TowerInfo> {
  
  const updated = new Map(towers);
  
  const buildingKills = events.filter(
    e => e.kind === "BUILDING_KILL" && e.t <= currentTime
  );
  
  for (const event of buildingKills) {
    let key: string;
    // Inhibitor building
    if (event.buildingType?.includes("INHIBITOR_BUILDING")) {
      key = getTowerKey(
        event.teamId || 100,
        event.lane || "MID",
        "INHIBITOR_BUILDING"
      );
      // Nexus itself
    } else if (event.buildingType?.includes("NEXUS_BUILDING")) {
      key = getTowerKey(
        event.teamId || 100,
        event.lane || "MID",
        "NEXUS_BUILDING"
      );
      // Towers (turrets)
    } else if (event.towerType) {
      key = getTowerKey(
        event.teamId || 100,
        event.lane || "MID",
        event.towerType
      );
    } else {
      continue;
    }
    
    const tower = updated.get(key);
    if (tower) {
      tower.alive = false;
    } else {
      const key2 = `${key}_2`;
      const tower2 = updated.get(key2);
      if (tower2) {
        tower2.alive = false;
      }
    }
  }
  
  return updated;
}

