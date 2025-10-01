import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";

export const storeOrder = internalMutation({
  args: {
    userId: v.string(),
    orderId: v.string(),
    amount: v.number(),
    currency: v.string(),
    planName: v.string(),
    billing: v.union(v.literal("monthly"), v.literal("annually")),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("orders", {
      userId: args.userId,
      orderId: args.orderId,
      amount: args.amount,
      currency: args.currency,
      planName: args.planName,
      billing: args.billing,
      status: "created",
      createdAt: Date.now(),
    });
  },
});

// Update payment status - INTERNAL MUTATION
export const updatePaymentStatus = internalMutation({
  args: {
    userId: v.string(),
    orderId: v.string(),
    paymentId: v.string(),
    signature: v.string(),
    planName: v.string(),
    billing: v.union(v.literal("monthly"), v.literal("annually")),
  },
  handler: async (ctx, args) => {
    // Update order status
    const order = await ctx.db
      .query("orders")
      .withIndex("by_orderId", (q) => q.eq("orderId", args.orderId))
      .first();

    if (!order) {
      throw new Error("Order not found");
    }

    await ctx.db.patch(order._id, {
      status: "paid",
      paymentId: args.paymentId,
      signature: args.signature,
      paidAt: Date.now(),
    });

    // Update user subscription
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.userId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const subscriptionEndDate =
      args.billing === "monthly"
        ? Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
        : Date.now() + 365 * 24 * 60 * 60 * 1000; // 365 days

    await ctx.db.patch(user._id, {
      subscriptionPlan: args.planName,
      subscriptionStatus: "active",
      subscriptionBilling: args.billing,
      subscriptionStartDate: Date.now(),
      subscriptionEndDate,
    });
  },
});

// Cancel subscription - INTERNAL MUTATION
export const cancelUserSubscription = internalMutation({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.userId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      subscriptionStatus: "cancelled",
      subscriptionCancelledAt: Date.now(),
    });
  },
});

// Get user subscription - QUERY (can remain public)
export const getUserSubscription = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      return null;
    }

    return {
      plan: user.subscriptionPlan || "Personal",
      status: user.subscriptionStatus || "free",
      billing: user.subscriptionBilling || null,
      startDate: user.subscriptionStartDate || null,
      endDate: user.subscriptionEndDate || null,
    };
  },
});
