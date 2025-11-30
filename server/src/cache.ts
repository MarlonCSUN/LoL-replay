import { prisma } from './db';

/**
 * Fetch match JSON from cache if available,
 * otherwise use the fetcher to get from Riot, then store.
 */
export async function getMatchCached(matchId: string, fetcher: () => Promise<any>) {
  const cached = await prisma.matchCache.findUnique({ where: { matchId } });
  if (cached) return cached.json as any;

  const data = await fetcher();
  await prisma.matchCache.upsert({
    where: { matchId },
    update: { json: data },
    create: { matchId, json: data },
  });
  return data;
}

/**
 * Fetch timeline JSON from cache if available,
 * otherwise use the fetcher to get from Riot, then store.
 */
export async function getTimelineCached(matchId: string, fetcher: () => Promise<any>) {
  const cached = await prisma.timelineCache.findUnique({ where: { matchId } });
  if (cached) return cached.json as any;

  const data = await fetcher();
  await prisma.timelineCache.upsert({
    where: { matchId },
    update: { json: data },
    create: { matchId, json: data },
  });
  return data;
}
