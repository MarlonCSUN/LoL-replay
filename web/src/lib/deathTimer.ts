import type { ReplayEvent } from "./riotTimeline";

// Track death information
export type DeathInfo =  {
    participantId: number;
    diedAt: number;     // Time of death 
    respawnAt: number;  // Time of Respawn
    teamId: 100 | 200;  // Which respawn location
};

export function calculateDeathTimer(gameTimeMs: number): number{
    const gameMinutes = gameTimeMs / 60000;

//Something to note is that League has different respawn timers depending on far in the game it is
    if (gameMinutes < 15) {
        //Base for 5 seconds + 2.5 seconds per minute (Early Game)
        return Math.max(6, 5 + (gameMinutes * 2.5)); 
    }

    else if (gameMinutes < 30 ) {
        //Mid Game
        return 15 + ((gameMinutes - 15) * 2.5);
    }
    
    else {
        //Late Game
        return Math.min(52.5, 30 + ((gameMinutes - 30) * 2));
    }
}

// Process kill events and calculate the respawn 
export function computeDeathMap(
    events: ReplayEvent[] ): Map<number, DeathInfo[]> {

        const deathMap = new Map<number, DeathInfo[]>(); // Use an array due to possibility of multiple deaths

        const killEvents = events.filter(e => e.kind === "CHAMP_KILL"); // Filter champion kill events

        for (const event of killEvents) {
            if (event.victimId === undefined) continue;

            const victimId = event.victimId;
            const diedAt = event.t;


            // Calculate how long the person will be dead
            const deathTimerSeconds = calculateDeathTimer(diedAt);
            const deathTimerMs = deathTimerSeconds * 1000;
            const respawnAt = diedAt + deathTimerMs;


            // Determine team
            const teamId = victimId <= 5 ? 100 : 200;

            //Create death info object
            const deathInfo: DeathInfo = {
                participantId: victimId,
                diedAt,
                respawnAt,
                teamId,
            };    

            // Add to map and also check if first death to create an array
            if (!deathMap.has(victimId)) {
                deathMap.set(victimId, []);
            }
            deathMap.get(victimId)!.push(deathInfo);
        }

        return deathMap;
    }

    // Returns death participants
    export function getDeadParticipantsAt(
        deathMap: Map<number, DeathInfo[]>,
        currentTimeMs: number): Set<number> {

            if (!deathMap)
                return new Set<number>();

            const deadSet = new Set<number>();

            //iterate through all particpants who have died
            for (const [participantId, deaths] of deathMap.entries()) {

                for (const death of deaths) {

                    if (currentTimeMs >= death.diedAt && currentTimeMs < death.respawnAt) {
                        deadSet.add(participantId);
                        break;
                    }
                }
            }

            return deadSet;
        }

    // Get Remaining death timer
    export function getRemainingDeathTimer(
        deathMap: Map<number, DeathInfo[]>,
        participantId: number,
        currentTimeMs: number
    ): number | null {

        if (!deathMap) return null;

        const deaths = deathMap.get(participantId);
        if (!deaths)
            return null;

        // Find any active daeths
        for (const death of deaths) {
            if (currentTimeMs >= death.diedAt && currentTimeMs < death.respawnAt) {
                const remainingMs = death.respawnAt - currentTimeMs;
                return Math.ceil(remainingMs / 1000); // Math ceiling so that it rounds up and keeps it consistent
            }
        }
        return null;
    }

    // Get fountain position based on team
    export function getFountainPosition(teamId: 100 | 200): { x: number; y: number } {
        if (teamId === 100) {
            return { x:400, y: 400 };
        } else {
            return { x: 14300, y: 14300 };
        }
    }   