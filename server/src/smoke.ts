import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.matchCache.upsert({
    where: { matchId: 'TEST-123' },
    update: { json: { ok: true } },
    create: { matchId: 'TEST-123', json: { ok: true } },
  });
  const row = await prisma.matchCache.findUnique({ where: { matchId: 'TEST-123' } });
  console.log(row);
}

main().finally(() => process.exit());
