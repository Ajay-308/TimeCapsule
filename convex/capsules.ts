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
      return { locked: true, reason: "Unlock date not reached yet" };
    }

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
      return { locked: true, reason: "Already accessed (one-time only)" };
    }

    if (capsule.maxAccess && capsule.accessCount >= capsule.maxAccess) {
      return { locked: true, reason: "Maximum access limit reached" };
    }

    return { locked: false, capsuleId: capsule._id };
  },
});
export const getCapsuleById = query({
  args: { id: v.id("capsules") },
  handler: async ({ db }, { id }) => {
    const capsule = await db.get(id);
    if (!capsule) return null;

    return {
      ...capsule,
      id: capsule._id,
    };
  },
});
export const getCapsuleWithFiles = query({
  args: { capsuleId: v.id("capsules") },
  handler: async (ctx, { capsuleId }) => {
    if (!capsuleId) throw new Error("Capsule ID is required");

    console.log("sab kuch sahi chal raha hai ");
    // Fetch capsule
    const capsule = await ctx.db.get(capsuleId);
    if (!capsule) throw new Error("Capsule not found");

    // Fetch files linked to capsule
    const files = await ctx.db
      .query("files")
      .filter((q) => q.eq(q.field("capsuleId"), capsuleId))
      .collect();

    console.log("file fetched", files);
    // Attach URLs to each file
    const filesWithUrl = await Promise.all(
      files.map(async (file) => ({
        ...file,
        url: await ctx.storage.getUrl(file.storageId),
      }))
    );
    console.log("file with url ", filesWithUrl);

    // Determine if capsule is unlocked (based on unlockDate)
    const now = Date.now();
    const isUnlocked = capsule.unlockDate <= now;
    let capsuleFileUrl;
    if (capsule.fileId) {
      capsuleFileUrl = await ctx.storage.getUrl(capsule.fileId);
      console.log("capsule file with url ", capsuleFileUrl);
    }

    console.log("capsule with files", {
      ...capsule,
      files: filesWithUrl,
      capsuleFileUrl,
    });
    return {
      ...capsule,
      files: filesWithUrl,
      isUnlocked,
      capsuleFileUrl,
    };
  },
});

export const unlockCapsule = mutation({
  args: { capsuleId: v.id("capsules") },
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

export const getCapsuleFile = query({
  args: { capsuleId: v.id("capsules") },
  handler: async (ctx, args) => {
    const capsule = await ctx.db.get(args.capsuleId);
    if (!capsule?.fileId) return null;

    const url = await ctx.storage.getUrl(capsule.fileId);
    return { fileId: capsule.fileId, url };
  },
});

export const listUserCapsules = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not provisioned from listUser");

    return await ctx.db
      .query("capsules")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

export const userStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not provisioned from userStats");

    const capsules = await ctx.db
      .query("capsules")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const totalCapsules = capsules.length;
    const unlockedCapsules = capsules.filter((c) => c.isUnlocked).length;
    const totalViews = capsules.reduce(
      (sum, c) => sum + (c.accessCount ?? 0),
      0
    );

    // pull likes from publicWall
    const wall = await ctx.db.query("publicWall").collect();
    const totalLikes = wall.reduce((sum, w) => sum + (w.likes ?? 0), 0);

    return { totalCapsules, unlockedCapsules, totalViews, totalLikes };
  },
});

export const likeCapsule = mutation({
  args: { wallId: v.id("publicWall") },
  handler: async (ctx, args) => {
    const wallEntry = await ctx.db.get(args.wallId);
    if (!wallEntry) throw new Error("Wall entry not found");

    await ctx.db.patch(args.wallId, {
      likes: wallEntry.likes + 1,
    });

    return { success: true };
  },
});
