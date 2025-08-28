import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { haversineDistance } from "./_utils/distance";

export const create = mutation({
  args: {
    title: v.string(),
    content: v.optional(v.string()),
    fileId: v.optional(v.id("_storage")),
    encryptionKey: v.string(),
    unlockDate: v.number(),
    location: v.optional(
      v.object({
        latitude: v.number(),
        longitude: v.number(),
        radius: v.number(),
        placeName: v.optional(v.string()),
      })
    ),
    isOneTimeAccess: v.boolean(),
    isPublic: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not provisioned");
    const capsuleId = await ctx.db.insert("capsules", {
      userId: user._id,
      title: args.title,
      content: args.content,
      fileId: args.fileId,
      encryptionKey: args.encryptionKey,
      unlockDate: args.unlockDate,
      location: args.location,
      isUnlocked: false,
      isOneTimeAccess: args.isOneTimeAccess,
      isAccessed: false,
      accessCount: 0,
      maxAccess: undefined,
      isPublic: args.isPublic,
      createdAt: Date.now(),
      unlockedAt: undefined,
      lastAccessedAt: undefined,
    });

    return { capsuleId };
  },
});

export const getCapsule = query({
  args: {
    capsuleId: v.id("capsules"),
    userLat: v.optional(v.number()),
    userLon: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const capsule = await ctx.db.get(args.capsuleId);
    if (!capsule) throw new Error("Capsule not found");
    const now = Date.now();
    if (capsule.unlockDate && capsule.unlockDate > now) {
      // capsule abhi bhi lock hi rahega
      return { locked: true, reason: "Unlock date yet not reached" };
    }
    // location based unlock here
    if (capsule.location) {
      if (args.userLat === undefined || args.userLon === undefined) {
        return { locked: true, reason: "Location required but not provided" };
      }
      const distance = haversineDistance(
        capsule.location.latitude,
        capsule.location.longitude,
        args.userLat,
        args.userLon
      );
      if (distance > capsule.location.radius) {
        return { locked: true, reason: "Location not within allowed radius" };
      }
    }
    if (capsule.isOneTimeAccess && capsule.isAccessed) {
      return {
        locked: true,
        reason: "Already accessed (one-time only)",
      };
    }
    if (capsule.maxAccess && capsule.accessCount >= capsule.maxAccess) {
      return {
        locked: true,
        reason: "Maximum access limit reached",
      };
    }
    // final sare check ke baad capsule ko unlock karte hai
    return { locked: false, capsuleId: capsule._id };
  },
});

export const unlockCapsule = mutation({
  args: {
    capsuleId: v.id("capsules"),
  },
  handler: async (ctx, args) => {
    const capsule = await ctx.db.get(args.capsuleId);
    if (!capsule) throw new Error("Capsule not found");
    const now = Date.now();

    await ctx.db.patch(args.capsuleId, {
      isUnlocked: true,
      isAccessed: true,
      accessCount: capsule.accessCount + 1,
      unlockedAt: capsule.unlockedAt ?? now,
      lastAccessedAt: now,
    });

    return {
      success: true,
      capsule: {
        title: capsule.title,
        content: capsule.content,
        fileId: capsule.fileId,
        encryptionKey: capsule.encryptionKey,
      },
    };
  },
});
