import { createTRPCRouter } from "../trpc";
import { capsuleRouter } from "./capsule";
import { userRouter } from "./user";
import { fileRouter } from "./file";
import { paymentRouter } from "./payment";
import { publicWallRouter } from "./publicWall";

export const appRouter = createTRPCRouter({
  capsule: capsuleRouter,
  user: userRouter,
  file: fileRouter,
  payment: paymentRouter,
  publicWall: publicWallRouter,
});

export type AppRouter = typeof appRouter;
