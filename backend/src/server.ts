import app from "./app";
import config from "./config";
import prisma from "./db";
async function bootstrap(): Promise<void> {
  try {
    await prisma.$connect();
    console.log(" Database connected successfully");
    app.listen(config.port, () => {
      console.log(`
     Port:        ${String(config.port).padEnd(28)}
     Environment: ${config.nodeEnv.padEnd(28)}
     Health:      http://localhost:${config.port}/api/v1/health


      `);
    });
  } catch (error) {
    console.error(" Failed to start server:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}
process.on("unhandledRejection", (reason: unknown) => {
  console.error(" Unhandled Rejection:", reason);
  process.exit(1);
});
process.on("uncaughtException", (error: Error) => {
  console.error(" Uncaught Exception:", error);
  process.exit(1);
});
process.on("SIGTERM", async () => {
  console.log("  SIGTERM received. Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});
bootstrap();
