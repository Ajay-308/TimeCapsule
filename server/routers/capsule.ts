import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { haversineDistance } from "../utils/distace";

export const capsuleRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        content: z.string().optional(),
        fileId: z.string().optional(),
        encryptionKey: z.string(),
        unlockDate: z.number(),
        location: z
          .object({
            latitude: z.number(),
            longitude: z.number(),
            radius: z.number(),
            placeName: z.string().optional(),
          })
          .optional(),
        isOneTimeAccess: z.boolean(),
        isPublic: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { clerkId: ctx.userId },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }
      const checkPremium = user.subscriptionStatus === "active";
      const userCapsuleCount = await ctx.prisma.capsule.count({
        where: { userId: user.id },
      });
      if (!checkPremium && userCapsuleCount >= 2) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "Free tier limit reached. Please upgrade to premium to create more capsules.",
        });
      }

      const capsule = await ctx.prisma.capsule.create({
        data: {
          userId: user.id,
          title: input.title,
          content: input.content,
          fileId: input.fileId,
          encryptionKey: input.encryptionKey,
          unlockDate: new Date(input.unlockDate),
          location: input.location,
          isUnlocked: false,
          isOneTimeAccess: input.isOneTimeAccess,
          isAccessed: false,
          accessCount: 0,
          isPublic: input.isPublic,
        },
      });

      return { capsuleId: capsule.id };
    }),

  getCapsule: publicProcedure
    .input(
      z.object({
        capsuleId: z.string(),
        userLat: z.number().optional(),
        userLon: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const capsule = await ctx.prisma.capsule.findUnique({
        where: { id: input.capsuleId },
      });

      if (!capsule) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Capsule not found",
        });
      }

      const now = new Date();
      if (capsule.unlockDate && capsule.unlockDate > now) {
        return { locked: true, reason: "Unlock date not reached yet" };
      }

      if (capsule.location) {
        if (input.userLat === undefined || input.userLon === undefined) {
          return { locked: true, reason: "Location required but not provided" };
        }
        const parsed = z
          .object({
            latitude: z.number(),
            longitude: z.number(),
            radius: z.number(),
          })
          .safeParse(capsule.location);
        if (!parsed.success) {
          return { locked: true, reason: "Invalid capsule location data" };
        }
        const { latitude, longitude, radius } = parsed.data;
        const distance = haversineDistance(
          latitude,
          longitude,
          input.userLat,
          input.userLon
        );
        if (distance > radius) {
          return { locked: true, reason: "Location not within allowed radius" };
        }
      }

      if (capsule.isOneTimeAccess && capsule.isAccessed) {
        return { locked: true, reason: "Already accessed (one-time only)" };
      }

      if (capsule.maxAccess && capsule.accessCount >= capsule.maxAccess) {
        return { locked: true, reason: "Maximum access limit reached" };
      }

      return { locked: false, capsuleId: capsule.id };
    }),

  getCapsuleById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const capsule = await ctx.prisma.capsule.findUnique({
        where: { id: input.id },
      });

      return capsule;
    }),

  getCapsuleWithFiles: publicProcedure
    .input(z.object({ capsuleId: z.string() }))
    .query(async ({ ctx, input }) => {
      const capsule = await ctx.prisma.capsule.findUnique({
        where: { id: input.capsuleId },
        include: {
          files: true,
        },
      });

      if (!capsule) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Capsule not found",
        });
      }

      const now = new Date();
      const isUnlocked = capsule.unlockDate <= now;

      return {
        ...capsule,
        isUnlocked,
      };
    }),

  unlockCapsule: protectedProcedure
    .input(z.object({ capsuleId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const capsule = await ctx.prisma.capsule.findUnique({
        where: { id: input.capsuleId },
      });

      if (!capsule) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Capsule not found",
        });
      }

      const now = new Date();

      const updated = await ctx.prisma.capsule.update({
        where: { id: input.capsuleId },
        data: {
          isUnlocked: true,
          isAccessed: true,
          accessCount: capsule.accessCount + 1,
          unlockedAt: capsule.unlockedAt ?? now,
          lastAccessedAt: now,
        },
      });

      return {
        success: true,
        capsule: {
          title: updated.title,
          content: updated.content,
          fileId: updated.fileId,
          encryptionKey: updated.encryptionKey,
        },
      };
    }),

  listUserCapsules: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { clerkId: ctx.userId },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    return await ctx.prisma.capsule.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
  }),

  userStats: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { clerkId: ctx.userId },
      include: {
        capsules: true,
      },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    const totalCapsules = user.capsules.length;
    const unlockedCapsules = user.capsules.filter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (c: any) => c.isUnlocked
    ).length;
    const totalViews = user.capsules.reduce(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (sum: any, c: any) => sum + (c.accessCount ?? 0),
      0
    );

    const wall = await ctx.prisma.publicWall.findMany();
    const totalLikes = wall.reduce(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (sum: any, w: any) => sum + (w.likes ?? 0),
      0
    );

    return { totalCapsules, unlockedCapsules, totalViews, totalLikes };
  }),

  likeCapsule: protectedProcedure
    .input(z.object({ wallId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const wallEntry = await ctx.prisma.publicWall.findUnique({
        where: { id: input.wallId },
      });

      if (!wallEntry) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Wall entry not found",
        });
      }

      await ctx.prisma.publicWall.update({
        where: { id: input.wallId },
        data: { likes: wallEntry.likes + 1 },
      });

      return { success: true };
    }),
});
