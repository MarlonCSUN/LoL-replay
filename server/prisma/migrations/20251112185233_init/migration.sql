-- CreateTable
CREATE TABLE "MatchCache" (
    "matchId" TEXT NOT NULL,
    "json" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MatchCache_pkey" PRIMARY KEY ("matchId")
);

-- CreateTable
CREATE TABLE "TimelineCache" (
    "matchId" TEXT NOT NULL,
    "json" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimelineCache_pkey" PRIMARY KEY ("matchId")
);
