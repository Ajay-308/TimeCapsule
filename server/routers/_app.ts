import { createTRPCRouter } from "../trpc";
import { capsuleRouter } from "./capsule";
import { userRouter } from "./user";
import { fileRouter } from "./file";
import { paymentRouter } from "./payment";

export const appRouter = createTRPCRouter({
  capsule: capsuleRouter,
  user: userRouter,
  file: fileRouter,
  payment: paymentRouter,
});

export type AppRouter = typeof appRouter;
