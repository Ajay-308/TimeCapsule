import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/server/db";
import { NextRequest } from "next/server";

export async function createContext(opts: { req: NextRequest }) {
  const { userId } = getAuth(opts.req);
  console.log(userId);

  return {
    prisma,
    userId,
    req: opts.req,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
