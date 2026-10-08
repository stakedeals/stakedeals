import { closePgPool } from "../lib/db";
import { runSeed } from "../lib/db/seed";

async function main() {
  console.log("🚀 Starting StakeDeals Test Suite runner...\n");
  try {
    // Seed once cleanly before test executions
    await runSeed();

    // Import each test module
    await import("./auth.test");
    await import("./rbac.test");
    await import("./sponsor.test");
    await import("./foundation-integrity.test");
    await import("./catalog-phase2.test");

    // Give node:test reporter a moment to flush results, then terminate clean
    setTimeout(async () => {
      await closePgPool();
      process.exit(0);
    }, 4000);
  } catch (err) {
    console.error("Test execution failed:", err);
    await closePgPool();
    process.exit(1);
  }
}

main();
