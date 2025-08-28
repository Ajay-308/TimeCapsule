import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const saveFileMetadata = mutation({
  args: {
    capsuleId: v.optional(v.id("capsules")),
    storageId: v.id("_storage"),
    fileName: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
    encryptionKey: v.string(),
    userClerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.userClerkId))
      .unique();

    if (!user) throw new Error("User not provisioned");

    await ctx.db.insert("files", {
      capsuleId: args.capsuleId,
      createdAt: Date.now(),
      storageId: args.storageId,
      fileName: args.fileName,
      fileType: args.fileType,
      fileSize: args.fileSize,
      encryptionKey: args.encryptionKey,
      uploadedBy: user._id,
    });
  },
});

export const getFilesByCapsuleId = query({
  args: { capsuleId: v.id("capsules") },
  handler: async (ctx, args) => {
    const files = await ctx.db
      .query("files")
      .filter((q) => q.eq(q.field("capsuleId"), args.capsuleId))
      .collect();

    return Promise.all(
      files.map(async (file) => ({
        ...file,
        url: await ctx.storage.getUrl(file.storageId),
      }))
    );
  },
});
