import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_clerk_id", ["clerkId"]),

  capsules: defineTable({
    userId: v.string(),
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

    isUnlocked: v.boolean(),
    isOneTimeAccess: v.boolean(),
    isAccessed: v.boolean(),
    accessCount: v.number(),
    maxAccess: v.optional(v.number()),
    isPublic: v.boolean(),
    createdAt: v.number(),
    unlockedAt: v.optional(v.number()),
    lastAccessedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_unlock_date", ["unlockDate"])
    .index("by_unlocked", ["isUnlocked"])
    .index("by_public", ["isPublic", "isUnlocked"]),

  collaborativeCapsules: defineTable({
    mainCapsuleId: v.id("capsules"),
    collaboratorUserId: v.id("users"),
    contribution: v.string(),
    addedAt: v.number(),
    canView: v.boolean(),
  }).index("by_capsule", ["mainCapsuleId"]),

  notifications: defineTable({
    userId: v.id("users"),
    capsuleId: v.id("capsules"),
    type: v.union(v.literal("unlock_ready"), v.literal("unlock_accessed")),
    sent: v.boolean(),
    sentAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_sent", ["sent"]),

  publicWall: defineTable({
    capsuleId: v.id("capsules"),
    userId: v.id("users"),
    content: v.string(),
    unlockedAt: v.number(),
    likes: v.number(),
    isModerated: v.boolean(),
  })
    .index("by_unlocked", ["unlockedAt"])
    .index("by_moderated", ["isModerated"]),

  files: defineTable({
    storageId: v.id("_storage"),
    fileName: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
    encryptionKey: v.string(),
    uploadedBy: v.string(),
    createdAt: v.number(),
  }).index("by_user", ["uploadedBy"]),
});
