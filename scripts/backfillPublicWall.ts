import { prisma } from "../server/db";

async function unlockAndBackfill() {
  const now = new Date();

  // 🔓 Unlock capsules whose time has come
  const unlockedCapsules = await prisma.capsule.updateMany({
    where: {
      unlockDate: { lte: now },
      isUnlocked: false,
    },
    data: { isUnlocked: true },
  });
  console.log(`🔓 Unlocked ${unlockedCapsules.count} capsules`);

  // 📝 Backfill publicWall for capsules that are public & unlocked
  const capsules = await prisma.capsule.findMany({
    where: { isPublic: true, isUnlocked: true },
    include: { publicWall: true },
  });

  for (const capsule of capsules) {
    if (!capsule.publicWall) {
      await prisma.publicWall.create({
        data: {
          capsuleId: capsule.id,
          userId: capsule.userId,
          content: capsule.content || "No content available",
          likes: 0,
          isModerated: true,
          unlockedAt: new Date(),
        },
      });
      console.log(`✅ Created PublicWall for capsule: ${capsule.id}`);
    } else {
      console.log(`⚡ Already exists: ${capsule.id}`);
    }
  }

  console.log("🎉 Unlock & Backfill complete!");
}

unlockAndBackfill()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
